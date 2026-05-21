/**
 * Your Flavor - Flavor Manager
 * Handles loading, saving, and retrieving user configurations
 * @module your-flavor/flavor-manager
 */

import {
    DEFAULT_CARD_CONFIG,
    DEFAULT_CONFIG,
    DEFAULT_ROLL_CONFIG,
    MESSAGE_STYLING_POLICY_IDS,
    MODULE_ID,
    MODULE_NAME
} from './constants.js';
import {
    CONFIG_SCHEMA_VERSION,
    normalizeConfigV2,
    normalizeLegacyChatConfig,
    normalizePolicy,
    normalizePresets
} from './config-normalizer.js';
import { buildChatContrastWarnings } from './contrast-diagnostics.js';

export const USER_PROFILE_V2_FLAG = 'profileV2';
export const ACTOR_CHAT_OVERRIDES_V2_FLAG = 'actorChatOverridesV2';

/**
 * Manages flavor configurations for all users
 */
export class FlavorManager {
    constructor() {
        // No cache needed - we always read fresh from user flags
        // Foundry syncs flags automatically across all clients
    }

    /**
     * Initialize the manager
     */
    async initialize() {
        await this._migrateMessageStylingPolicySetting();
        await this._migrateMessageStylingPolicyDefaultForV401();
        await this._migrateCurrentUserFlagsToV2();
    }

    /**
     * Get configuration for a specific user
     * @param {string} userId - The user ID
     * @returns {Object|null} The user's flavor configuration
     */
    getConfig(userId) {
        // Always get fresh from flags to ensure we have the latest config
        // User flags are synced by Foundry across all clients
        const user = userId === game.user?.id ? game.user : game.users.get(userId);

        if (user) {
            const config = user.getFlag(MODULE_ID, 'config');
            if (config) {
                return config;
            }
        }

        return null;
    }

    /**
     * Get current user's configuration
     * @returns {Object} The current user's configuration (or default)
     */
    getCurrentConfig() {
        const config = this.getConfig(game.user.id);
        return config
            ? foundry.utils.mergeObject(
                foundry.utils.deepClone(DEFAULT_CONFIG),
                foundry.utils.deepClone(config)
            )
            : foundry.utils.deepClone(DEFAULT_CONFIG);
    }

    /**
     * Save configuration for the current user
     * @param {Object} config - The configuration to save
     */
    async saveConfig(config) {
        // Validate config
        const validConfig = this._validateConfig(config);

        // Clear existing flag first to ensure clean update
        await game.user.unsetFlag(MODULE_ID, 'config');

        // Save to user flags (syncs to server and other clients automatically)
        await game.user.setFlag(MODULE_ID, 'config', validConfig);

        await this._saveUserProfileV2(validConfig);
    }

    /**
     * Update specific configuration fields
     * @param {Object} updates - Partial configuration updates
     */
    async updateConfig(updates) {
        const current = this.getCurrentConfig();
        const newConfig = foundry.utils.mergeObject(current, updates);
        await this.saveConfig(newConfig);
    }

    /**
     * Reset current user's configuration to defaults
     */
    async resetConfig() {
        await this.saveConfig(foundry.utils.deepClone(DEFAULT_CONFIG));
    }

    /**
     * Check if current user has a configuration
     * @returns {boolean}
     */
    hasConfig() {
        return !!game.user.getFlag(MODULE_ID, 'config');
    }

    /**
     * Get favorite layout IDs
     * @returns {string[]}
     */
    getFavorites() {
        return game.user.getFlag(MODULE_ID, 'favorites') || [];
    }

    /**
     * Replace favorite layout IDs for the current user.
     * @param {string[]} layoutIds
     */
    async saveFavorites(layoutIds = []) {
        const favorites = [...new Set(
            (Array.isArray(layoutIds) ? layoutIds : [])
                .filter(layoutId => typeof layoutId === 'string' && layoutId.trim())
                .map(layoutId => layoutId.trim())
        )];
        await game.user.unsetFlag(MODULE_ID, 'favorites');
        if (favorites.length > 0) {
            await game.user.setFlag(MODULE_ID, 'favorites', favorites);
        }
        await this._syncFavoritesToProfileV2(favorites);
    }

    /**
     * Merge imported preset metadata into the current user's v2 profile mirror.
     * Legacy chat behavior remains driven by the normal config/favorites flags.
     * @param {Object} presets
     */
    async savePresetMetadata(presets = {}) {
        const existingProfile = this.getCurrentProfileV2();
        const existingPresets = existingProfile?.presets || {};
        const importedCustomPresets = presets?.custom && typeof presets.custom === 'object' && !Array.isArray(presets.custom)
            ? presets.custom
            : {};
        const normalized = normalizePresets({
            ...presets,
            custom: {
                ...(existingPresets.custom || {}),
                ...importedCustomPresets
            },
            lastImportedAt: new Date().toISOString()
        }, presets?.favorites ?? this.getFavorites(), this.getCurrentConfig().layout);

        await this.saveFavorites(normalized.favorites);

        const refreshedProfile = this.getCurrentProfileV2();
        const now = new Date().toISOString();
        const profile = normalizeConfigV2(refreshedProfile || this.getCurrentConfig(), {
            owner: { scope: 'user', userId: game.user.id },
            profileId: refreshedProfile?.profileId ?? `user:${game.user.id}`,
            profileName: refreshedProfile?.profileName ?? game.user.name,
            favorites: normalized.favorites,
            policy: this._getPolicySettings(),
            now
        });
        profile.presets = normalizePresets({
            ...(profile.presets || {}),
            ...normalized
        }, normalized.favorites, this.getCurrentConfig().layout);
        profile.meta.createdAt = refreshedProfile?.meta?.createdAt ?? profile.meta.createdAt ?? now;
        profile.meta.updatedAt = now;

        await game.user.setFlag(MODULE_ID, USER_PROFILE_V2_FLAG, profile);
    }

    /**
     * Toggle a layout as favorite
     * @param {string} layoutId
     * @returns {Promise<boolean>} Whether it is now a favorite
     */
    async toggleFavorite(layoutId) {
        const favorites = this.getFavorites();
        const index = favorites.indexOf(layoutId);
        if (index >= 0) {
            favorites.splice(index, 1);
        } else {
            favorites.push(layoutId);
        }
        await game.user.unsetFlag(MODULE_ID, 'favorites');
        if (favorites.length > 0) {
            await game.user.setFlag(MODULE_ID, 'favorites', favorites);
        }
        await this._syncFavoritesToProfileV2(favorites);
        return index < 0; // true if now favorited
    }

    /**
     * Validate and sanitize configuration
     * @param {Object} config - Configuration to validate
     * @returns {Object} Validated configuration
     * @private
     */
    _validateConfig(config) {
        const validated = foundry.utils.mergeObject(
            foundry.utils.deepClone(DEFAULT_CONFIG),
            foundry.utils.deepClone(config || {})
        );

        validated.layout = validated.layout || validated.presetId || DEFAULT_CONFIG.layout;
        validated.presetId = validated.layout;

        // Ensure boolean values
        validated.enabled = Boolean(validated.enabled);

        // Sanitize customizations
        if (validated.customizations) {
            const c = validated.customizations;

            // Clamp numeric values
            c.fontSize = Math.max(8, Math.min(32, c.fontSize || 14));
            c.borderWidth = Math.max(0, Math.min(10, c.borderWidth || 2));
            c.borderRadius = Math.max(0, Math.min(50, c.borderRadius || 8));
            c.padding = Math.max(0, Math.min(30, c.padding || 12));
            c.glowIntensity = Math.max(0, Math.min(30, c.glowIntensity || 10));
            c.backgroundOpacity = Math.max(0, Math.min(100, c.backgroundOpacity ?? 95));

            // Ensure boolean values
            c.glowEnabled = Boolean(c.glowEnabled);
            c.shadowEnabled = Boolean(c.shadowEnabled);

            // Validate border style
            const validBorderStyles = ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge'];
            if (!validBorderStyles.includes(c.borderStyle)) {
                c.borderStyle = 'solid';
            }
        }

        validated.rolls = this._validateRollConfig(validated.rolls);
        validated.cards = this._validateCardConfig(validated.cards);

        // Sanitize custom HTML if present (basic XSS prevention)
        if (validated.customHtml) {
            // Only allow if GM has enabled it
            if (!game.settings.get(MODULE_ID, 'allowCustomHtml') && !game.user.isGM) {
                validated.customHtml = null;
            }
        }

        return validated;
    }

    _validateCardConfig(cards = {}) {
        const validated = foundry.utils.mergeObject(
            foundry.utils.deepClone(DEFAULT_CARD_CONFIG),
            foundry.utils.deepClone(cards || {})
        );
        validated.enabled = validated.enabled !== false;
        validated.fallbackPolicy = validated.fallbackPolicy === 'safe-outer-only'
            ? validated.fallbackPolicy
            : DEFAULT_CARD_CONFIG.fallbackPolicy;

        validated.surfaces ||= {};
        for (const [surfaceId, defaultSurface] of Object.entries(DEFAULT_CARD_CONFIG.surfaces)) {
            validated.surfaces[surfaceId] ||= foundry.utils.deepClone(defaultSurface);
        }

        for (const surface of Object.values(validated.surfaces ?? {})) {
            if (!surface || typeof surface !== 'object') continue;
            for (const [key, value] of Object.entries(surface)) {
                surface[key] = this._normalizeNullableColor(value);
            }
        }

        validated.systems ||= {};
        validated.systems.dnd5e ||= {};
        validated.systems.pf2e ||= {};
        validated.systems.generic ||= {};
        validated.systems.dnd5e.itemCards = validated.systems.dnd5e.itemCards !== false;
        validated.systems.dnd5e.abilityCards = validated.systems.dnd5e.abilityCards !== false;
        validated.systems.pf2e.actionCards = validated.systems.pf2e.actionCards !== false;
        validated.systems.pf2e.spellCards = validated.systems.pf2e.spellCards !== false;
        validated.systems.generic.enabled = validated.systems.generic.enabled !== false;

        return validated;
    }

    _validateRollConfig(rolls = {}) {
        const validated = foundry.utils.mergeObject(
            foundry.utils.deepClone(DEFAULT_ROLL_CONFIG),
            foundry.utils.deepClone(rolls || {})
        );
        validated.enabled = Boolean(validated.enabled);

        for (const surface of Object.values(validated.surfaces ?? {})) {
            for (const [key, value] of Object.entries(surface)) {
                surface[key] = this._normalizeNullableColor(value);
            }
        }

        for (const system of Object.values(validated.systems ?? {})) {
            system.enabled = Boolean(system.enabled);
        }

        return validated;
    }

    _normalizeNullableColor(value) {
        if (value === null || value === '') return null;
        if (typeof value !== 'string') return null;
        const trimmed = value.trim();
        if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed;
        return null;
    }

    /**
     * Get configuration for a specific actor
     * @param {string} actorId - The actor ID
     * @returns {Object|null} The actor's flavor configuration
     */
    getActorConfig(actorId) {
        if (!actorId) return null;
        const configs = game.user.getFlag(MODULE_ID, 'actorConfigs') || {};
        return configs[actorId] || null;
    }

    /**
     * Save configuration for a specific actor
     * @param {string} actorId - The actor ID
     * @param {Object} config - The configuration to save
     */
    async saveActorConfig(actorId, config) {
        if (!actorId) return;
        const validConfig = this._validateConfig(config);
        const configs = foundry.utils.deepClone(game.user.getFlag(MODULE_ID, 'actorConfigs') || {});
        configs[actorId] = validConfig;
        await game.user.unsetFlag(MODULE_ID, 'actorConfigs');
        await game.user.setFlag(MODULE_ID, 'actorConfigs', configs);
        await this._saveActorChatOverrideV2(actorId, validConfig);
    }

    /**
     * Remove actor-specific configuration (fall back to user default)
     * @param {string} actorId - The actor ID
     */
    async removeActorConfig(actorId) {
        if (!actorId) return;
        const configs = foundry.utils.deepClone(game.user.getFlag(MODULE_ID, 'actorConfigs') || {});
        delete configs[actorId];
        await game.user.unsetFlag(MODULE_ID, 'actorConfigs');
        if (Object.keys(configs).length > 0) {
            await game.user.setFlag(MODULE_ID, 'actorConfigs', configs);
        }
        await this._removeActorChatOverrideV2(actorId);
    }

    /**
     * Get list of actors that have custom configs
     * @returns {Array<{id: string, name: string}>}
     */
    getConfiguredActors() {
        const configs = game.user.getFlag(MODULE_ID, 'actorConfigs') || {};
        return Object.keys(configs).map(id => {
            const actor = game.actors.get(id);
            return { id, name: actor?.name || id };
        }).filter(a => a.name);
    }

    /**
     * Resolve the best config for a message based on its speaker
     * Priority: actor config > user config > null
     * @param {string} userId - The user ID
     * @param {string|null} actorId - The actor ID from the message speaker
     * @returns {Object|null}
     */
    resolveConfig(userId, actorId) {
        // Try actor-specific config first
        if (actorId) {
            const user = userId === game.user?.id ? game.user : game.users.get(userId);
            if (user) {
                const configs = user.getFlag(MODULE_ID, 'actorConfigs') || {};
                if (configs[actorId]) return configs[actorId];
            }
        }
        // Fall back to user config
        return this.getConfig(userId);
    }

    /**
     * Export configuration as JSON
     * @returns {string} JSON string of configuration
     */
    exportConfig() {
        const config = this.getCurrentConfig();
        return JSON.stringify(config, null, 2);
    }

    /**
     * Import configuration from JSON
     * @param {string} jsonString - JSON string to import
     */
    async importConfig(jsonString) {
        try {
            const config = JSON.parse(jsonString);
            await this.saveConfig(config);
            return true;
        } catch (error) {
            console.error(`${MODULE_NAME} | Failed to import configuration:`, error);
            return false;
        }
    }

    /**
     * Get current user's v2 profile, if migrated.
     * @returns {Object|null}
     */
    getCurrentProfileV2() {
        return game.user.getFlag(MODULE_ID, USER_PROFILE_V2_FLAG) || null;
    }

    /**
     * Get actor chat overrides migrated to v2 shape for the current user.
     * @returns {Object<string, Object>}
     */
    getActorChatOverridesV2() {
        return game.user.getFlag(MODULE_ID, ACTOR_CHAT_OVERRIDES_V2_FLAG) || {};
    }

    /**
     * Non-destructively migrate current user flags into v2 flags.
     * Legacy flags remain authoritative for the current UI until later phases.
     * @private
     */
    async _migrateCurrentUserFlagsToV2() {
        const legacyConfig = game.user.getFlag(MODULE_ID, 'config');
        const legacyFavorites = game.user.getFlag(MODULE_ID, 'favorites') || [];
        const legacyActorConfigs = game.user.getFlag(MODULE_ID, 'actorConfigs') || {};
        const hasUserData = Boolean(legacyConfig) || legacyFavorites.length > 0;
        const hasActorData = Object.keys(legacyActorConfigs).length > 0;

        if (hasUserData) {
            const currentProfile = this.getCurrentProfileV2();
            if (currentProfile?.schemaVersion !== CONFIG_SCHEMA_VERSION) {
                await this._saveUserProfileV2(legacyConfig || DEFAULT_CONFIG, {
                    favorites: legacyFavorites,
                    migratedFrom: 'user-flags-v1'
                });
            }
        }

        if (hasActorData) {
            const actorOverrides = foundry.utils.deepClone(this.getActorChatOverridesV2());
            let changed = false;
            for (const [actorId, config] of Object.entries(legacyActorConfigs)) {
                if (actorOverrides[actorId]?.schemaVersion === CONFIG_SCHEMA_VERSION) continue;
                actorOverrides[actorId] = this._buildActorChatOverrideV2(actorId, config, 'actorConfigs-v1');
                changed = true;
            }

            if (changed) {
                await game.user.setFlag(MODULE_ID, ACTOR_CHAT_OVERRIDES_V2_FLAG, actorOverrides);
            }
        }
    }

    /**
     * Move the old broad boolean into the new explicit world policy once.
     * @private
     */
    async _migrateMessageStylingPolicySetting() {
        if (!game.user?.isGM) return;
        if (game.settings.get(MODULE_ID, 'messageStylingPolicyMigrated')) return;

        const legacyApplyAll = game.settings.get(MODULE_ID, 'applyToAllMessages');
        const currentPolicy = game.settings.get(MODULE_ID, 'messageStylingPolicy');
        if (legacyApplyAll && currentPolicy === MESSAGE_STYLING_POLICY_IDS.SIMPLE_ONLY) {
            await game.settings.set(
                MODULE_ID,
                'messageStylingPolicy',
                MESSAGE_STYLING_POLICY_IDS.SUPPORTED_FIXTURES
            );
        }

        await game.settings.set(MODULE_ID, 'messageStylingPolicyMigrated', true);
    }

    /**
     * Your Flavor 4.0 briefly shipped with the conservative legacy policy as
     * the default, which blocked the new Rolls and Cards tabs from applying.
     * @private
     */
    async _migrateMessageStylingPolicyDefaultForV401() {
        if (!game.user?.isGM) return;
        if (game.settings.get(MODULE_ID, 'messageStylingPolicyV401Migrated')) return;

        const currentPolicy = game.settings.get(MODULE_ID, 'messageStylingPolicy');
        if (currentPolicy === MESSAGE_STYLING_POLICY_IDS.SIMPLE_ONLY) {
            await game.settings.set(
                MODULE_ID,
                'messageStylingPolicy',
                MESSAGE_STYLING_POLICY_IDS.SUPPORTED_FIXTURES
            );
        }

        await game.settings.set(MODULE_ID, 'messageStylingPolicyV401Migrated', true);
    }

    /**
     * Save a v2 profile mirror for the current user's legacy chat config.
     * @param {Object} config
     * @param {Object} options
     * @private
     */
    async _saveUserProfileV2(config, { favorites = null, migratedFrom = null } = {}) {
        const existing = this.getCurrentProfileV2();
        const now = new Date().toISOString();
        const profile = normalizeConfigV2(existing || config, {
            owner: { scope: 'user', userId: game.user.id },
            profileId: existing?.profileId ?? `user:${game.user.id}`,
            profileName: existing?.profileName ?? game.user.name,
            favorites: favorites ?? game.user.getFlag(MODULE_ID, 'favorites') ?? [],
            policy: this._getPolicySettings(),
            now
        });

        profile.chat = normalizeLegacyChatConfig(config);
        profile.rolls = normalizeConfigV2({ rolls: config.rolls }).rolls;
        profile.cards = normalizeConfigV2({ cards: config.cards }).cards;
        profile.policy = normalizePolicy(this._getPolicySettings());
        profile.presets = normalizePresets({
            ...profile.presets,
            activePresetId: profile.chat?.presetId ?? config.presetId ?? config.layout ?? null
        }, favorites ?? game.user.getFlag(MODULE_ID, 'favorites') ?? []);
        profile.diagnostics.contrastWarnings = buildChatContrastWarnings(config);
        profile.meta.createdAt = existing?.meta?.createdAt ?? profile.meta.createdAt ?? now;
        profile.meta.updatedAt = now;
        profile.meta.migratedFrom = existing?.meta?.migratedFrom ?? migratedFrom;

        await game.user.setFlag(MODULE_ID, USER_PROFILE_V2_FLAG, profile);
    }

    /**
     * Update favorites inside the v2 profile mirror without touching legacy behavior.
     * @param {string[]} favorites
     * @private
     */
    async _syncFavoritesToProfileV2(favorites) {
        const currentProfile = this.getCurrentProfileV2();
        if (!currentProfile) {
            await this._saveUserProfileV2(this.getCurrentConfig(), { favorites });
            return;
        }
        const profile = normalizeConfigV2(currentProfile, {
            owner: { scope: 'user', userId: game.user.id },
            favorites
        });
        profile.presets = normalizePresets(profile.presets, favorites);
        profile.meta.updatedAt = new Date().toISOString();
        await game.user.setFlag(MODULE_ID, USER_PROFILE_V2_FLAG, profile);
    }

    /**
     * Save one actor chat override in v2 shape.
     * @param {string} actorId
     * @param {Object} config
     * @private
     */
    async _saveActorChatOverrideV2(actorId, config) {
        const overrides = foundry.utils.deepClone(this.getActorChatOverridesV2());
        overrides[actorId] = this._buildActorChatOverrideV2(actorId, config, 'actorConfigs-v1');
        await game.user.setFlag(MODULE_ID, ACTOR_CHAT_OVERRIDES_V2_FLAG, overrides);
    }

    /**
     * Remove one actor chat override from the v2 mirror.
     * @param {string} actorId
     * @private
     */
    async _removeActorChatOverrideV2(actorId) {
        const overrides = foundry.utils.deepClone(this.getActorChatOverridesV2());
        delete overrides[actorId];
        await game.user.unsetFlag(MODULE_ID, ACTOR_CHAT_OVERRIDES_V2_FLAG);
        if (Object.keys(overrides).length > 0) {
            await game.user.setFlag(MODULE_ID, ACTOR_CHAT_OVERRIDES_V2_FLAG, overrides);
        }
    }

    /**
     * Build a minimal v2 actor chat override.
     * @param {string} actorId
     * @param {Object} config
     * @param {string} migratedFrom
     * @returns {Object}
     * @private
     */
    _buildActorChatOverrideV2(actorId, config, migratedFrom = null) {
        const existing = this.getActorChatOverridesV2()[actorId];
        const now = new Date().toISOString();
        return {
            schemaVersion: CONFIG_SCHEMA_VERSION,
            owner: {
                scope: 'actor',
                userId: game.user.id,
                actorId
            },
            meta: {
                createdAt: existing?.meta?.createdAt ?? now,
                updatedAt: now,
                migratedFrom: existing?.meta?.migratedFrom ?? migratedFrom
            },
            chat: normalizeLegacyChatConfig(config),
            rolls: normalizeConfigV2({ rolls: config.rolls }).rolls,
            cards: normalizeConfigV2({ cards: config.cards }).cards
        };
    }

    /**
     * Snapshot current world settings that become v2 policy fields.
     * @returns {Object}
     * @private
     */
    _getPolicySettings() {
        return {
            moduleEnabled: game.settings.get(MODULE_ID, 'moduleEnabled'),
            allowPlayerCustomization: game.settings.get(MODULE_ID, 'allowPlayerCustomization'),
            forcePlayerLayout: game.settings.get(MODULE_ID, 'forcePlayerLayout'),
            allowCustomHtml: game.settings.get(MODULE_ID, 'allowCustomHtml'),
            applyToWhispers: game.settings.get(MODULE_ID, 'applyToWhispers'),
            messageStylingPolicy: this._getEffectiveMessageStylingPolicySetting()
        };
    }

    /**
     * @returns {string}
     * @private
     */
    _getEffectiveMessageStylingPolicySetting() {
        const policy = game.settings.get(MODULE_ID, 'messageStylingPolicy');
        const migrationDone = game.settings.get(MODULE_ID, 'messageStylingPolicyMigrated');
        const v401MigrationDone = game.settings.get(MODULE_ID, 'messageStylingPolicyV401Migrated');
        if (
            !migrationDone
            && policy === MESSAGE_STYLING_POLICY_IDS.SIMPLE_ONLY
            && game.settings.get(MODULE_ID, 'applyToAllMessages')
        ) {
            return MESSAGE_STYLING_POLICY_IDS.SUPPORTED_FIXTURES;
        }
        if (!v401MigrationDone && policy === MESSAGE_STYLING_POLICY_IDS.SIMPLE_ONLY) {
            return MESSAGE_STYLING_POLICY_IDS.SUPPORTED_FIXTURES;
        }
        return policy;
    }
}
