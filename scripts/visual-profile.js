/**
 * Your Flavor - full visual profile export/import helpers.
 * Keeps shareable visual payload parsing, validation, sanitization, and draft
 * application decisions away from the configuration UI.
 *
 * @module your-flavor/visual-profile
 */

import {
    DEFAULT_CARD_CONFIG,
    DEFAULT_CONFIG,
    DEFAULT_FOUNDRY_CUSTOMIZATION,
    DEFAULT_ROLL_CONFIG,
    MESSAGE_STYLING_POLICIES,
    MESSAGE_STYLING_POLICY_IDS,
    MODULE_ID,
    MODULE_NAME
} from './constants.js';
import {
    CONFIG_SCHEMA_VERSION,
    normalizeChatLogConfig,
    normalizeHotbarConfig,
    normalizeIconConfig,
    normalizeLegacyIcons,
    normalizePlayersListConfig,
    normalizePresets,
    normalizeSceneNavigationConfig,
    normalizeSidebarConfig,
    normalizeTokenControlsConfig,
    normalizeWindowsConfig
} from './config-normalizer.js';

export const VISUAL_PROFILE_EXPORT_TYPE = 'your-flavor.visual-profile';
export const VISUAL_PROFILE_SCHEMA_VERSION = 1;

const MESSAGE_STYLING_POLICY_VALUES = new Set(MESSAGE_STYLING_POLICIES.map(policy => policy.id));

const EXPORT_SETTING_KEYS = Object.freeze([
    'moduleEnabled',
    'allowPlayerCustomization',
    'forcePlayerLayout',
    'allowCustomHtml',
    'applyToWhispers',
    'messageStylingPolicy',
    'enableFoundryCustomization',
    'shareFoundryCustomization'
]);

const APPLIABLE_SETTING_KEYS = Object.freeze([
    'allowPlayerCustomization',
    'forcePlayerLayout',
    'allowCustomHtml',
    'applyToWhispers',
    'messageStylingPolicy',
    'enableFoundryCustomization',
    'shareFoundryCustomization'
]);

export class VisualProfileError extends Error {
    constructor(message, code = 'invalid') {
        super(message);
        this.name = 'VisualProfileError';
        this.code = code;
    }
}

export function buildVisualProfileExport({
    chatConfig = {},
    foundryConfig = null,
    favorites = [],
    userProfile = null,
    worldProfile = null,
    settings = {},
    meta = {},
    includeFoundry = false
} = {}) {
    const chat = normalizeLegacyChatDraft(chatConfig, { allowCustomHtml: true });
    const hasFoundry = Boolean(includeFoundry && isPlainObject(foundryConfig));
    const foundry = hasFoundry ? normalizeFoundryDraft(foundryConfig) : null;
    const icons = hasFoundry ? normalizeLegacyIcons(foundry) : null;
    if (foundry) foundry.icons = icons;

    const presets = normalizePresets(
        userProfile?.presets,
        favorites,
        chat.presetId ?? chat.layout ?? null
    );
    const visualSettings = normalizeVisualSettings(settings, { includeModuleEnabled: true });
    const now = normalizeString(meta.exportedAt) || new Date().toISOString();

    return {
        type: VISUAL_PROFILE_EXPORT_TYPE,
        schemaVersion: VISUAL_PROFILE_SCHEMA_VERSION,
        configSchemaVersion: CONFIG_SCHEMA_VERSION,
        meta: {
            name: normalizeString(meta.name, 96) || 'Your Flavor Visual',
            description: normalizeString(meta.description, 240) || '',
            author: normalizeString(meta.author, 96) || null,
            exportedAt: now,
            moduleId: MODULE_ID,
            moduleName: MODULE_NAME,
            moduleVersion: normalizeString(meta.moduleVersion, 32) || null,
            foundryVersion: normalizeString(meta.foundryVersion, 32) || null,
            systemId: normalizeString(meta.systemId, 64) || null,
            systemTitle: normalizeString(meta.systemTitle, 96) || null
        },
        sections: {
            chat: true,
            rolls: true,
            cards: true,
            foundry: hasFoundry,
            icons: hasFoundry,
            presets: true,
            settings: Object.keys(visualSettings).length > 0
        },
        profile: {
            chat: pickChatSection(chat),
            rolls: clone(chat.rolls),
            cards: clone(chat.cards),
            foundry,
            icons,
            presets,
            settings: visualSettings,
            userProfile: summarizeProfile(userProfile),
            worldProfile: hasFoundry ? summarizeProfile(worldProfile) : null
        }
    };
}

export function parseVisualProfileExport(source, { allowCustomHtml = true } = {}) {
    let data;
    try {
        data = typeof source === 'string' ? JSON.parse(source) : source;
    } catch (error) {
        throw new VisualProfileError(error?.message || 'Invalid JSON.', 'invalid-json');
    }

    if (!isPlainObject(data)) {
        throw new VisualProfileError('Visual profile payload must be an object.', 'invalid-payload');
    }
    if (data.type !== VISUAL_PROFILE_EXPORT_TYPE) {
        throw new VisualProfileError('Unknown Your Flavor visual profile schema.', 'unknown-schema');
    }
    if (data.schemaVersion !== VISUAL_PROFILE_SCHEMA_VERSION) {
        throw new VisualProfileError('Unsupported Your Flavor visual profile schema version.', 'unsupported-version');
    }
    if (!isPlainObject(data.profile)) {
        throw new VisualProfileError('Visual profile payload is missing profile data.', 'invalid-payload');
    }

    const sections = normalizeSections(data.sections, data.profile);
    if (!Object.values(sections).some(Boolean)) {
        throw new VisualProfileError('Visual profile does not include any supported sections.', 'empty-profile');
    }

    const profile = {};
    if (sections.chat) profile.chat = pickChatSection(data.profile.chat);
    if (sections.rolls) profile.rolls = normalizeRollConfig(data.profile.rolls);
    if (sections.cards) profile.cards = normalizeCardConfig(data.profile.cards);
    if (sections.foundry || sections.icons) {
        const foundry = normalizeFoundryDraft(data.profile.foundry || {});
        const icons = sections.icons
            ? normalizeIconConfig(
                data.profile.icons
                ?? data.profile.foundry?.icons
                ?? {}
            )
            : normalizeLegacyIcons(DEFAULT_FOUNDRY_CUSTOMIZATION);
        foundry.icons = icons;
        profile.foundry = foundry;
        if (sections.icons) profile.icons = icons;
    }
    if (sections.presets) {
        profile.presets = normalizePresets(
            data.profile.presets,
            data.profile.presets?.favorites,
            profile.chat?.presetId ?? profile.chat?.layout ?? null
        );
    }
    if (sections.settings) {
        profile.settings = normalizeVisualSettings(data.profile.settings, { includeModuleEnabled: true });
    }

    if (profile.chat) {
        profile.chat.customHtml = allowCustomHtml ? profile.chat.customHtml : null;
    }

    const visualProfile = {
        type: VISUAL_PROFILE_EXPORT_TYPE,
        schemaVersion: VISUAL_PROFILE_SCHEMA_VERSION,
        configSchemaVersion: data.configSchemaVersion ?? null,
        meta: normalizeMeta(data.meta),
        sections,
        profile
    };
    visualProfile.summary = buildVisualProfileSummary(visualProfile);
    return visualProfile;
}

export function applyVisualProfileToDraft({
    visualProfile,
    currentChatConfig = {},
    currentFoundryConfig = {},
    permissions = {}
} = {}) {
    if (!isPlainObject(visualProfile?.profile)) {
        throw new VisualProfileError('Visual profile payload is missing profile data.', 'invalid-payload');
    }

    const result = {
        chatConfig: null,
        foundryConfig: null,
        presets: null,
        settings: null,
        applied: {
            chat: false,
            rolls: false,
            cards: false,
            foundry: false,
            icons: false,
            presets: false,
            settings: false
        },
        warnings: [],
        summary: visualProfile.summary ?? buildVisualProfileSummary(visualProfile)
    };

    const canImportChat = permissions.canImportChat !== false;
    const canImportFoundry = permissions.canImportFoundry === true;
    const canImportSettings = permissions.canImportSettings === true;
    const canImportPresets = permissions.canImportPresets !== false;
    const allowCustomHtml = permissions.allowCustomHtml !== false;
    const sections = visualProfile.sections ?? {};
    const profile = visualProfile.profile;

    if (sections.chat || sections.rolls || sections.cards) {
        if (canImportChat) {
            const current = normalizeLegacyChatDraft(currentChatConfig, { allowCustomHtml });
            const chatSource = sections.chat ? profile.chat : pickChatSection(current);
            result.chatConfig = normalizeLegacyChatDraft({
                ...current,
                ...chatSource,
                rolls: sections.rolls ? profile.rolls : current.rolls,
                cards: sections.cards ? profile.cards : current.cards,
                customHtml: allowCustomHtml ? chatSource?.customHtml : current.customHtml
            }, { allowCustomHtml });
            result.applied.chat = Boolean(sections.chat);
            result.applied.rolls = Boolean(sections.rolls);
            result.applied.cards = Boolean(sections.cards);
        } else {
            result.warnings.push({ code: 'chat-not-allowed', section: 'chat' });
        }
    }

    if (sections.foundry || sections.icons) {
        if (canImportFoundry) {
            const baseFoundry = sections.foundry
                ? profile.foundry
                : currentFoundryConfig;
            result.foundryConfig = normalizeFoundryDraft(baseFoundry);
            if (sections.icons && profile.icons) {
                result.foundryConfig.icons = normalizeIconConfig(profile.icons);
            } else {
                result.foundryConfig.icons = normalizeLegacyIcons(currentFoundryConfig);
            }
            result.applied.foundry = Boolean(sections.foundry);
            result.applied.icons = Boolean(sections.icons);
        } else {
            result.warnings.push({ code: 'foundry-gm-only', section: 'foundry' });
        }
    }

    if (sections.presets && profile.presets) {
        if (canImportPresets) {
            result.presets = normalizePresets(
                profile.presets,
                profile.presets?.favorites,
                result.chatConfig?.presetId ?? result.chatConfig?.layout ?? null
            );
            result.applied.presets = true;
        } else {
            result.warnings.push({ code: 'presets-not-allowed', section: 'presets' });
        }
    }

    if (sections.settings && profile.settings) {
        if (canImportSettings) {
            result.settings = normalizeVisualSettingsForApply(profile.settings);
            result.applied.settings = Object.keys(result.settings).length > 0;
        } else {
            result.warnings.push({ code: 'settings-gm-only', section: 'settings' });
        }
    }

    if (result.foundryConfig?.enabled !== false && canImportFoundry) {
        result.settings ||= {};
        result.settings.enableFoundryCustomization = true;
        result.applied.settings = true;
    }

    return result;
}

export function buildVisualProfileSummary(visualProfile = {}) {
    const profile = visualProfile.profile ?? {};
    const sections = visualProfile.sections ?? {};
    const icons = sections.icons ? (profile.icons ?? profile.foundry?.icons ?? {}) : {};
    const overrides = isPlainObject(icons.overrides) ? icons.overrides : {};
    const overrideValues = Object.values(overrides).filter(isPlainObject);
    const settings = isPlainObject(profile.settings) ? profile.settings : {};
    const favorites = Array.isArray(profile.presets?.favorites) ? profile.presets.favorites : [];
    const customPresets = isPlainObject(profile.presets?.custom) ? profile.presets.custom : {};

    return {
        sections: { ...sections },
        chatPresetId: profile.chat?.presetId ?? profile.chat?.layout ?? null,
        foundryEnabled: profile.foundry?.enabled === true,
        iconGroups: isPlainObject(icons.groups) ? Object.keys(icons.groups).length : 0,
        iconOverrides: Object.keys(overrides).length,
        dynamicIconOverrides: Object.entries(overrides).filter(([iconId, override]) => (
            String(iconId).startsWith('dynamic.')
            || override?.dynamic === true
        )).length,
        hiddenIconOverrides: overrideValues.filter(override => override.hidden === true).length,
        iconClassOverrides: overrideValues.filter(override => Boolean(override.iconClass)).length,
        individualIconColorOverrides: overrideValues.filter(override => (
            override.inheritGroup === false
            || Boolean(override.color)
            || Boolean(override.hoverColor)
            || Boolean(override.activeColor)
        )).length,
        favorites: favorites.length,
        customPresets: Object.keys(customPresets).length,
        settings: Object.keys(settings).length
    };
}

export function getVisualProfileIconOverrideKeys(visualProfile = {}) {
    const icons = visualProfile.profile?.icons ?? visualProfile.profile?.foundry?.icons ?? {};
    return Object.keys(icons.overrides || {});
}

export function slugifyVisualProfileFilename(value) {
    const slug = String(value || 'visual')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return `your-flavor-visual-${slug || 'visual'}.json`;
}

export function normalizeVisualSettings(settings = {}, { includeModuleEnabled = false } = {}) {
    if (!isPlainObject(settings)) return {};

    const keys = includeModuleEnabled
        ? EXPORT_SETTING_KEYS
        : EXPORT_SETTING_KEYS.filter(key => key !== 'moduleEnabled');
    const normalized = {};

    for (const key of keys) {
        if (!(key in settings)) continue;
        const value = normalizeVisualSettingValue(key, settings[key]);
        if (value !== undefined) normalized[key] = value;
    }

    return normalized;
}

function normalizeVisualSettingsForApply(settings = {}) {
    const exported = normalizeVisualSettings(settings, { includeModuleEnabled: false });
    return Object.fromEntries(
        Object.entries(exported).filter(([key]) => APPLIABLE_SETTING_KEYS.includes(key))
    );
}

function normalizeVisualSettingValue(key, value) {
    if (value === undefined) return undefined;
    switch (key) {
        case 'moduleEnabled':
        case 'allowPlayerCustomization':
        case 'allowCustomHtml':
        case 'applyToWhispers':
        case 'enableFoundryCustomization':
        case 'shareFoundryCustomization':
            return typeof value === 'boolean' ? value : Boolean(value);
        case 'forcePlayerLayout':
            return typeof value === 'string' && value.trim() ? value.trim() : 'none';
        case 'messageStylingPolicy':
            return MESSAGE_STYLING_POLICY_VALUES.has(value)
                ? value
                : MESSAGE_STYLING_POLICY_IDS.SIMPLE_ONLY;
        default:
            return undefined;
    }
}

function normalizeSections(sections = {}, profile = {}) {
    const source = isPlainObject(sections) ? sections : {};
    return {
        chat: Boolean(source.chat ?? isPlainObject(profile.chat)),
        rolls: Boolean(source.rolls ?? isPlainObject(profile.rolls)),
        cards: Boolean(source.cards ?? isPlainObject(profile.cards)),
        foundry: Boolean(source.foundry ?? isPlainObject(profile.foundry)),
        icons: Boolean(source.icons ?? (isPlainObject(profile.icons) || isPlainObject(profile.foundry?.icons))),
        presets: Boolean(source.presets ?? isPlainObject(profile.presets)),
        settings: Boolean(source.settings ?? isPlainObject(profile.settings))
    };
}

function normalizeLegacyChatDraft(config = {}, { allowCustomHtml = true } = {}) {
    const source = isPlainObject(config) ? config : {};
    const layout = normalizeString(source.layout ?? source.presetId) || DEFAULT_CONFIG.layout;
    const presetId = normalizeString(source.presetId ?? source.layout) || layout;

    return {
        enabled: source.enabled !== undefined ? Boolean(source.enabled) : DEFAULT_CONFIG.enabled,
        layout,
        presetId,
        customizations: normalizeChatCustomizations(source.customizations),
        rolls: normalizeRollConfig(source.rolls),
        cards: normalizeCardConfig(source.cards),
        customHtml: allowCustomHtml ? normalizeMultilineString(source.customHtml, 20000) : null
    };
}

function pickChatSection(config = {}) {
    const chat = normalizeLegacyChatDraft(config, { allowCustomHtml: true });
    return {
        enabled: chat.enabled,
        layout: chat.layout,
        presetId: chat.presetId,
        customizations: chat.customizations,
        customHtml: chat.customHtml
    };
}

function normalizeChatCustomizations(customizations = {}) {
    const source = isPlainObject(customizations) ? customizations : {};
    const normalized = deepMerge(DEFAULT_CONFIG.customizations, source);

    normalized.fontFamily = normalizeString(normalized.fontFamily, 96) || DEFAULT_CONFIG.customizations.fontFamily;
    normalized.fontSize = clampNumber(normalized.fontSize, 8, 32, DEFAULT_CONFIG.customizations.fontSize);
    normalized.textColor = normalizeCssToken(normalized.textColor, DEFAULT_CONFIG.customizations.textColor);
    normalized.backgroundColor = normalizeCssToken(normalized.backgroundColor, DEFAULT_CONFIG.customizations.backgroundColor);
    normalized.borderColor = normalizeCssToken(normalized.borderColor, DEFAULT_CONFIG.customizations.borderColor);
    normalized.borderStyle = ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'none'].includes(normalized.borderStyle)
        ? normalized.borderStyle
        : DEFAULT_CONFIG.customizations.borderStyle;
    normalized.borderWidth = clampNumber(normalized.borderWidth, 0, 10, DEFAULT_CONFIG.customizations.borderWidth);
    normalized.borderRadius = clampNumber(normalized.borderRadius, 0, 50, DEFAULT_CONFIG.customizations.borderRadius);
    normalized.glowEnabled = Boolean(normalized.glowEnabled);
    normalized.glowColor = normalizeCssToken(normalized.glowColor, DEFAULT_CONFIG.customizations.glowColor);
    normalized.glowIntensity = clampNumber(normalized.glowIntensity, 0, 30, DEFAULT_CONFIG.customizations.glowIntensity);
    normalized.shadowEnabled = Boolean(normalized.shadowEnabled);
    normalized.padding = clampNumber(normalized.padding, 0, 30, DEFAULT_CONFIG.customizations.padding);
    normalized.backgroundOpacity = clampNumber(normalized.backgroundOpacity, 0, 100, DEFAULT_CONFIG.customizations.backgroundOpacity);
    normalized.nameColor = normalizeNullableCssToken(normalized.nameColor);
    normalized.timestampColor = normalizeNullableCssToken(normalized.timestampColor);

    return normalized;
}

function normalizeRollConfig(rolls = {}) {
    const normalized = deepMerge(DEFAULT_ROLL_CONFIG, isPlainObject(rolls) ? rolls : {});
    normalized.enabled = normalized.enabled !== false;
    normalized.surfaces ||= {};
    normalized.systems ||= {};

    for (const [surfaceId, fallbackSurface] of Object.entries(DEFAULT_ROLL_CONFIG.surfaces)) {
        normalized.surfaces[surfaceId] = normalizeSurfaceColors(
            normalized.surfaces[surfaceId],
            fallbackSurface
        );
    }
    for (const [systemId, fallbackSystem] of Object.entries(DEFAULT_ROLL_CONFIG.systems)) {
        normalized.systems[systemId] = {
            ...clone(fallbackSystem),
            ...(isPlainObject(normalized.systems[systemId]) ? normalized.systems[systemId] : {})
        };
        normalized.systems[systemId].enabled = normalized.systems[systemId].enabled !== false;
    }

    return normalized;
}

function normalizeCardConfig(cards = {}) {
    const normalized = deepMerge(DEFAULT_CARD_CONFIG, isPlainObject(cards) ? cards : {});
    normalized.enabled = normalized.enabled !== false;
    normalized.fallbackPolicy = normalized.fallbackPolicy === 'safe-outer-only'
        ? normalized.fallbackPolicy
        : DEFAULT_CARD_CONFIG.fallbackPolicy;
    normalized.surfaces ||= {};
    normalized.systems ||= {};

    for (const [surfaceId, fallbackSurface] of Object.entries(DEFAULT_CARD_CONFIG.surfaces)) {
        normalized.surfaces[surfaceId] = normalizeSurfaceColors(
            normalized.surfaces[surfaceId],
            fallbackSurface
        );
    }
    for (const [systemId, fallbackSystem] of Object.entries(DEFAULT_CARD_CONFIG.systems)) {
        normalized.systems[systemId] = {
            ...clone(fallbackSystem),
            ...(isPlainObject(normalized.systems[systemId]) ? normalized.systems[systemId] : {})
        };
    }
    normalized.systems.dnd5e.itemCards = normalized.systems.dnd5e.itemCards !== false;
    normalized.systems.dnd5e.abilityCards = normalized.systems.dnd5e.abilityCards !== false;
    normalized.systems.pf2e.actionCards = normalized.systems.pf2e.actionCards !== false;
    normalized.systems.pf2e.spellCards = normalized.systems.pf2e.spellCards !== false;
    normalized.systems.generic.enabled = normalized.systems.generic.enabled !== false;

    return normalized;
}

function normalizeSurfaceColors(surface = {}, fallback = {}) {
    const source = isPlainObject(surface) ? surface : {};
    const normalized = deepMerge(fallback, source);
    for (const key of Object.keys(normalized)) {
        normalized[key] = normalizeNullableCssToken(normalized[key]);
    }
    return normalized;
}

function normalizeFoundryDraft(config = {}) {
    const sourceIcons = isPlainObject(config?.icons) ? clone(config.icons) : null;
    const merged = deepMerge(DEFAULT_FOUNDRY_CUSTOMIZATION, isPlainObject(config) ? config : {});

    merged.enabled = Boolean(merged.enabled);
    merged.categories ||= {};
    for (const [key, value] of Object.entries(DEFAULT_FOUNDRY_CUSTOMIZATION.categories)) {
        merged.categories[key] = merged.categories[key] !== false && value !== false;
    }
    merged.areaEnabled ||= {};
    for (const [key, value] of Object.entries(DEFAULT_FOUNDRY_CUSTOMIZATION.areaEnabled)) {
        merged.areaEnabled[key] = merged.areaEnabled[key] !== false && value !== false;
    }
    delete merged.areaEnabled.directories;
    delete merged.areas?.directories;

    merged.sceneNavigation = normalizeSceneNavigationConfig(merged.sceneNavigation);
    merged.tokenControls = normalizeTokenControlsConfig(merged.tokenControls);
    merged.hotbar = normalizeHotbarConfig(merged.hotbar);
    merged.sidebar = normalizeSidebarConfig(merged.sidebar);
    merged.chatLog = normalizeChatLogConfig(config?.chatLog ?? config?.areas?.chatLog?.chatLog ?? merged.chatLog);
    merged.playersList = normalizePlayersListConfig(config?.playersList ?? config?.areas?.players?.playersList ?? merged.playersList);
    merged.windows = normalizeWindowsConfig(config?.windows ?? config?.areas?.windows?.windows ?? merged.windows);
    merged.layout ||= {};
    merged.layout.hotbar ||= clone(DEFAULT_FOUNDRY_CUSTOMIZATION.layout.hotbar);
    merged.layout.hotbar.x = null;
    merged.layout.hotbar.y = null;
    merged.areas ||= {};
    merged.areas.hotbar ||= {};
    merged.areas.hotbar.hotbar = clone(merged.hotbar);
    merged.areas.sidebar ||= {};
    merged.areas.sidebar.sidebar = clone(merged.sidebar);
    merged.areas.chatLog ||= {};
    merged.areas.chatLog.chatLog = clone(merged.chatLog);
    merged.areas.players ||= {};
    merged.areas.players.playersList = clone(merged.playersList);
    merged.areas.windows ||= {};
    merged.areas.windows.windows = clone(merged.windows);
    merged.customCss = typeof merged.customCss === 'string' ? merged.customCss : '';
    merged.icons = normalizeLegacyIcons({
        ...merged,
        icons: sourceIcons ?? merged.icons
    });

    return merged;
}

function normalizeMeta(meta = {}) {
    const source = isPlainObject(meta) ? meta : {};
    return {
        name: normalizeString(source.name, 96) || 'Your Flavor Visual',
        description: normalizeString(source.description, 240) || '',
        author: normalizeString(source.author, 96) || null,
        exportedAt: normalizeString(source.exportedAt, 64) || null,
        moduleId: normalizeString(source.moduleId, 64) || MODULE_ID,
        moduleName: normalizeString(source.moduleName, 96) || MODULE_NAME,
        moduleVersion: normalizeString(source.moduleVersion, 32) || null,
        foundryVersion: normalizeString(source.foundryVersion, 32) || null,
        systemId: normalizeString(source.systemId, 64) || null,
        systemTitle: normalizeString(source.systemTitle, 96) || null
    };
}

function summarizeProfile(profile = null) {
    if (!isPlainObject(profile)) return null;
    return {
        schemaVersion: profile.schemaVersion ?? null,
        profileId: normalizeString(profile.profileId, 96) || null,
        profileName: normalizeString(profile.profileName, 96) || null,
        owner: isPlainObject(profile.owner) ? clone(profile.owner) : null,
        meta: isPlainObject(profile.meta) ? clone(profile.meta) : null
    };
}

function normalizeCssToken(value, fallback = '') {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed) return trimmed.slice(0, 240);
    }
    return fallback;
}

function normalizeNullableCssToken(value) {
    if (value === null || value === '') return null;
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, 240) : null;
}

function normalizeString(value, maxLength = 120) {
    if (typeof value !== 'string') return '';
    return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizeMultilineString(value, maxLength = 20000) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, maxLength) : null;
}

function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(min, Math.min(max, number));
}

function deepMerge(base, override) {
    if (override === undefined) return clone(base);
    if (Array.isArray(override)) return clone(override);
    if (!isPlainObject(base) || !isPlainObject(override)) return clone(override);

    const merged = clone(base);
    for (const [key, value] of Object.entries(override)) {
        merged[key] = deepMerge(merged[key], value);
    }
    return merged;
}

function clone(value) {
    if (Array.isArray(value)) return value.map(item => clone(item));
    if (isPlainObject(value)) {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
    }
    return value;
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
