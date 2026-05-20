/**
 * Your Flavor - Chat Customization Module for Foundry VTT v13/v14
 * @module your-flavor
 */

import { MESSAGE_STYLING_POLICY_IDS, MODULE_ID, MODULE_NAME } from './constants.js';
import { registerSettings } from './settings.js';
import { FlavorManager } from './flavor-manager.js';
import { LAYOUTS } from './layouts.js';
import { getChatPresetChoices } from './chat-presets.js';
import { FlavorConfigApp } from './ui/flavor-config-app.js';
import { FoundryCustomizer } from './foundry-customizer.js';
import { applyFlavorStyles } from './style-utils.js';
import {
    addSceneControlTool,
    FOUNDRY_HOOKS,
    normalizeHtmlElement,
    renderApplication
} from './compatibility.js';
import {
    canStyleMessageClassification,
    classifyChatMessage,
    usesSafeFallbackClassification
} from './message-classifier.js';
import {
    clearMessageSurfaces,
    renderMessageSurfaces
} from './message-surface-renderer.js';
import {
    getIconDiscoveryDiagnostics as buildIconDiscoveryDiagnostics,
    getIconRegistry
} from './icon-registry.js';
import { factoryResetYourFlavor } from './factory-reset.js';

/**
 * Main module class
 */
class YourFlavor {
    constructor() {
        this.manager = null;
        this.foundryCustomizer = null;
        this.layouts = LAYOUTS;
        this._previewConfigs = new Map();
        this._chatLogPreviewSnapshots = new Map();
        this._messageDiagnostics = [];
    }

    /**
     * Initialize the module
     */
    async initialize() {
        this.manager = new FlavorManager();
        await this.manager.initialize();
        this.foundryCustomizer = new FoundryCustomizer();
        await this.foundryCustomizer.initialize();
        console.log(`${MODULE_NAME} | Ready`);
    }

    /**
     * Open the configuration UI
     */
    openConfig(options = {}) {
        const app = new FlavorConfigApp(options);
        renderApplication(app, { force: true });
        return app;
    }

    /**
     * Check if a chat message should be styled
     * @param {ChatMessage} message - The chat message
     * @param {HTMLElement} html - The message HTML element
     * @returns {boolean} Whether the message should be styled
     */
    shouldStyleMessage(message, html) {
        // Check if module is enabled globally
        if (!game.settings.get(MODULE_ID, 'moduleEnabled')) {
            return false;
        }

        // Guard: ensure we received a valid HTML element
        if (!html?.querySelector) {
            return false;
        }

        // Check whisper settings
        if (message.whisper?.length > 0 && !game.settings.get(MODULE_ID, 'applyToWhispers')) {
            return false;
        }

        const policy = this._getMessageStylingPolicy();
        return canStyleMessageClassification(classifyChatMessage(message, html), policy);
    }

    /**
     * Read the explicit message styling policy, falling back to the legacy flag
     * only for worlds that have not completed the v4 setting migration yet.
     * @returns {string}
     * @private
     */
    _getMessageStylingPolicy() {
        const allowedPolicies = new Set(Object.values(MESSAGE_STYLING_POLICY_IDS));
        const policy = game.settings.get(MODULE_ID, 'messageStylingPolicy');
        const migrationDone = game.settings.get(MODULE_ID, 'messageStylingPolicyMigrated');
        if (
            !migrationDone
            && policy === MESSAGE_STYLING_POLICY_IDS.SIMPLE_ONLY
            && game.settings.get(MODULE_ID, 'applyToAllMessages')
        ) {
            return MESSAGE_STYLING_POLICY_IDS.SUPPORTED_FIXTURES;
        }
        if (allowedPolicies.has(policy)) return policy;

        return game.settings.get(MODULE_ID, 'applyToAllMessages')
            ? MESSAGE_STYLING_POLICY_IDS.SUPPORTED_FIXTURES
            : MESSAGE_STYLING_POLICY_IDS.SIMPLE_ONLY;
    }

    /**
     * Apply flavor styling to a message
     * @param {ChatMessage} message - The chat message
     * @param {HTMLElement} html - The message HTML element
     */
    applyFlavor(message, html) {
        const authorId = message.author?.id;
        if (!authorId) return;

        // Extract actor ID from the message speaker for per-actor configs
        const actorId = message.speaker?.actor || null;

        // Get the effective config for this user (respecting GM settings)
        const previewId = this._getPreviewId(message);
        const previewConfig = previewId ? this._previewConfigs.get(previewId) : null;
        if (previewId && !previewConfig) return;

        const config = previewConfig
            ? foundry.utils.deepClone(previewConfig)
            : this._getEffectiveConfig(authorId, actorId);
        if (!config?.enabled || config.layout === 'none') return;

        try {
            // Get layout configuration
            const layout = this.layouts[config.layout];
            if (!layout) return;

            // Add layout class to the entire message element
            html.classList.add('yf-card', `yf-card-${config.layout}`);
            const classification = classifyChatMessage(message, html);
            html.classList.add(`yf-message-${classification.type}`);
            html.dataset.yfMessageType = classification.type;
            this._applyMessageClassification(html, classification, config);
            if (usesSafeFallbackClassification(classification)) {
                this._recordMessageDiagnostic(message, classification);
            }

            // Apply custom styles directly to the message card
            this._applyCardStyles(html, config, layout);

            // Fix avatar: use actor/token portrait instead of user avatar
            this._resolveAvatar(message, html);

            // Mark as processed
            html.classList.add('yf-processed');

        } catch (error) {
            console.error(`${MODULE_NAME} | Error applying flavor:`, error);
            // Fail gracefully - message will appear normal
        }
    }

    /**
     * Get effective configuration for a user, respecting GM settings
     * @param {string} userId - The user ID
     * @returns {Object|null} The effective configuration
     * @private
     */
    _getEffectiveConfig(userId, actorId = null) {
        const user = game.users.get(userId);
        if (!user) return null;

        // GMs always use their own config (with actor override)
        if (user.isGM) {
            return this.manager.resolveConfig(userId, actorId);
        }

        // Check if there's a forced layout for players
        const forcedLayout = game.settings.get(MODULE_ID, 'forcePlayerLayout');
        if (forcedLayout && forcedLayout !== 'none') {
            const layout = this.layouts[forcedLayout];
            if (layout) {
                return {
                    enabled: true,
                    layout: forcedLayout,
                    customizations: { ...layout.defaults }
                };
            }
        }

        // Check if players are allowed to customize
        const allowPlayerCustomization = game.settings.get(MODULE_ID, 'allowPlayerCustomization');
        if (!allowPlayerCustomization) {
            return null;
        }

        // Resolve with actor override support
        return this.manager.resolveConfig(userId, actorId);
    }

    /**
     * Resolve the best avatar for a message based on speaker data.
     * Uses token portrait > actor portrait > user avatar (fallback).
     * @param {ChatMessage} message
     * @param {HTMLElement} html
     * @private
     */
    _resolveAvatar(message, html) {
        const avatarImg = html.querySelector('.message-header img.avatar')
            || html.querySelector('.message-header img');
        if (!avatarImg) return;

        const speaker = message.speaker;
        if (!speaker) return;

        let portraitSrc = null;

        // Priority 1: Token portrait (most specific)
        if (speaker.token && speaker.scene) {
            const scene = game.scenes.get(speaker.scene);
            const token = scene?.tokens?.get(speaker.token);
            if (token?.texture?.src) {
                portraitSrc = token.texture.src;
            }
        }

        // Priority 2: Actor portrait
        if (!portraitSrc && speaker.actor) {
            const actor = game.actors.get(speaker.actor);
            if (actor?.img && !actor.img.includes('mystery-man')) {
                portraitSrc = actor.img;
            }
        }

        if (portraitSrc) {
            avatarImg.src = portraitSrc;
        }
    }

    /**
     * Apply custom styles to the entire message card
     * @private
     */
    _applyCardStyles(card, config, layoutDefaults) {
        applyFlavorStyles(card, config.customizations, layoutDefaults.defaults, {
            rolls: config.rolls,
            cards: config.cards
        });
    }

    /**
     * Register a one-shot draft config for a test chat message.
     * The draft stays in memory only and never writes user flags/settings.
     * @param {string} previewId
     * @param {Object} config
     */
    registerPreviewConfig(previewId, config) {
        if (!previewId || !config) return;
        this._previewConfigs.set(previewId, foundry.utils.deepClone(config));
        window.setTimeout(() => this._previewConfigs.delete(previewId), 5 * 60 * 1000);
    }

    /**
     * Remove a registered test-message draft config.
     * @param {string} previewId
     */
    clearPreviewConfig(previewId) {
        if (previewId) this._previewConfigs.delete(previewId);
    }

    /**
     * Return recent message diagnostics for the config app.
     * @returns {Array<Object>}
     */
    getMessageDiagnostics() {
        return this._messageDiagnostics.map(entry => ({ ...entry }));
    }

    /**
     * Return the supported Foundry icon registry with localized labels.
     * @returns {{version: number, groups: Array<Object>, entries: Array<Object>}}
     */
    getIconRegistry() {
        return getIconRegistry({ localize: key => game.i18n.localize(key) });
    }

    /**
     * Return current DOM discovery diagnostics for supported Foundry icons.
     * @returns {Object}
     */
    getIconDiscoveryDiagnostics() {
        return this.foundryCustomizer?.getIconDiscoveryDiagnostics?.({
            localize: key => game.i18n.localize(key)
        }) ?? buildIconDiscoveryDiagnostics({
            localize: key => game.i18n.localize(key),
            foundryVersion: game.version ?? game.release?.version ?? null,
            systemId: game.system?.id ?? null
        });
    }

    /**
     * Return diagnostics for currently configured per-icon overrides.
     * @returns {Object|null}
     */
    getIconOverrideDiagnostics() {
        return this.foundryCustomizer?.getIconOverrideDiagnostics?.() ?? null;
    }

    /**
     * Restore all module-owned settings, flags, previews, and applied DOM state.
     * @returns {Promise<Object>}
     */
    async factoryReset() {
        return factoryResetYourFlavor({
            manager: this.manager,
            foundryCustomizer: this.foundryCustomizer,
            runtime: this
        });
    }

    /**
     * Clear runtime-only module state after a hard reset.
     */
    clearRuntimeState() {
        this._previewConfigs.clear();
        this._messageDiagnostics = [];
        this.clearChatLogPreview();
        this.clearAppliedChatStyles();
    }

    /**
     * Remove Your Flavor classes, CSS custom properties, and surface markers from
     * currently rendered chat messages.
     * @param {Object} options
     * @param {ParentNode} options.root
     * @returns {number}
     */
    clearAppliedChatStyles({ root = document } = {}) {
        const elements = new Set();
        root.querySelectorAll?.('#chat-log .chat-message, .chat-message.yf-card, .chat-message.yf-processed, .chat-message.yf-live-preview')
            .forEach(element => elements.add(element));

        for (const element of elements) {
            this._removeFlavorClassesAndStyles(element, { restoreAvatar: true });
        }

        return elements.size;
    }

    /**
     * Apply an in-memory draft chat style to visible messages in the current chat log.
     * Nothing is persisted; call clearChatLogPreview to restore the previous DOM state.
     * @param {Object} config
     * @param {Object} options
     * @returns {{matched: number, styled: number, cleared: number}}
     */
    applyChatLogPreview(config, { userId = game.user?.id, actorId = null } = {}) {
        const chatLog = document.querySelector('#chat-log');
        const result = { matched: 0, styled: 0, cleared: 0 };
        if (!chatLog || !userId) {
            this.clearChatLogPreview();
            return result;
        }

        this._restoreChatLogPreview({ keepSnapshots: true });

        const shouldApplyStyle = Boolean(config?.enabled && config.layout && config.layout !== 'none');
        const layout = shouldApplyStyle ? this.layouts[config.layout] : null;
        const messageElements = Array.from(chatLog.querySelectorAll('.chat-message'));

        for (const element of messageElements) {
            const message = this._getMessageForElement(element);
            if (!message || !this._isMessageInPreviewScope(message, userId, actorId)) continue;

            result.matched++;
            this._snapshotChatPreviewElement(element);
            this._removeFlavorClassesAndStyles(element);

            if (!shouldApplyStyle || !layout || !this.shouldStyleMessage(message, element)) {
                result.cleared++;
                element.classList.add('yf-live-preview');
                continue;
            }

            const classification = classifyChatMessage(message, element);
            element.classList.add(
                'yf-card',
                `yf-card-${config.layout}`,
                `yf-message-${classification.type}`,
                'yf-live-preview',
                'yf-processed'
            );
            element.dataset.yfMessageType = classification.type;
            this._applyMessageClassification(element, classification, config);
            this._applyCardStyles(element, config, layout);
            result.styled++;
        }

        return result;
    }

    /**
     * Restore all visible chat messages touched by a live draft preview.
     */
    clearChatLogPreview() {
        this._restoreChatLogPreview();
    }

    /**
     * Keep currently previewed chat styles as-is after a successful save.
     */
    commitChatLogPreview() {
        for (const element of this._chatLogPreviewSnapshots.keys()) {
            if (element?.classList) element.classList.remove('yf-live-preview');
        }
        this._chatLogPreviewSnapshots.clear();
    }

    /**
     * Read the test preview id from a chat message.
     * @param {ChatMessage} message
     * @returns {string|null}
     * @private
     */
    _getPreviewId(message) {
        return message?.getFlag?.(MODULE_ID, 'previewId')
            ?? message?.flags?.[MODULE_ID]?.previewId
            ?? null;
    }

    /**
     * @param {HTMLElement} element
     * @returns {ChatMessage|null}
     * @private
     */
    _getMessageForElement(element) {
        const messageId = element?.dataset?.messageId;
        return messageId ? game.messages.get(messageId) ?? null : null;
    }

    /**
     * @param {ChatMessage} message
     * @param {string} userId
     * @param {string|null} actorId
     * @returns {boolean}
     * @private
     */
    _isMessageInPreviewScope(message, userId, actorId = null) {
        const authorId = message.author?.id ?? message.user?.id ?? message.user;
        if (authorId !== userId) return false;
        if (actorId && message.speaker?.actor !== actorId) return false;
        return true;
    }

    /**
     * @param {HTMLElement} element
     * @private
     */
    _snapshotChatPreviewElement(element) {
        if (this._chatLogPreviewSnapshots.has(element)) return;
        this._chatLogPreviewSnapshots.set(element, {
            className: element.getAttribute('class'),
            style: element.getAttribute('style'),
            yfMessageType: element.dataset?.yfMessageType ?? null,
            yfFallback: element.dataset?.yfFallback ?? null,
            descendants: this._snapshotChatPreviewDescendants(element)
        });
    }

    /**
     * @param {HTMLElement} element
     * @returns {Array<Object>}
     * @private
     */
    _snapshotChatPreviewDescendants(element) {
        return Array.from(element.querySelectorAll('*')).map(descendant => ({
            element: descendant,
            className: descendant.getAttribute('class'),
            yfSurface: descendant.dataset?.yfSurface ?? null,
            yfSurfaceRole: descendant.dataset?.yfSurfaceRole ?? null
        }));
    }

    /**
     * @param {Object} options
     * @private
     */
    _restoreChatLogPreview({ keepSnapshots = false } = {}) {
        for (const [element, snapshot] of this._chatLogPreviewSnapshots.entries()) {
            if (!element?.isConnected) continue;

            if (snapshot.className == null) {
                element.removeAttribute('class');
            } else {
                element.setAttribute('class', snapshot.className);
            }

            if (snapshot.style == null) {
                element.removeAttribute('style');
            } else {
                element.setAttribute('style', snapshot.style);
            }
            this._restoreDatasetValue(element, 'yfMessageType', snapshot.yfMessageType);
            this._restoreDatasetValue(element, 'yfFallback', snapshot.yfFallback);

            for (const descendant of snapshot.descendants ?? []) {
                if (!descendant.element?.isConnected || !element.contains(descendant.element)) continue;

                if (descendant.className == null) {
                    descendant.element.removeAttribute('class');
                } else {
                    descendant.element.setAttribute('class', descendant.className);
                }

                this._restoreDatasetValue(descendant.element, 'yfSurface', descendant.yfSurface);
                this._restoreDatasetValue(descendant.element, 'yfSurfaceRole', descendant.yfSurfaceRole);
            }
        }

        if (!keepSnapshots) this._chatLogPreviewSnapshots.clear();
    }

    /**
     * @param {HTMLElement} element
     * @param {string} key
     * @param {string|null} value
     * @private
     */
    _restoreDatasetValue(element, key, value) {
        if (value == null) {
            delete element.dataset[key];
        } else {
            element.dataset[key] = value;
        }
    }

    /**
     * Apply nested surface renderers only when the message is supported.
     * Safe fallback messages keep their internal system markup untouched.
     * @param {HTMLElement} element
     * @param {Object} classification
     * @private
     */
    _applyMessageClassification(element, classification, config = null) {
        if (usesSafeFallbackClassification(classification)) {
            element.classList.add('yf-message-safe-fallback');
            element.dataset.yfFallback = classification.safeFallback;
            clearMessageSurfaces(element);
            return;
        }

        delete element.dataset.yfFallback;
        renderMessageSurfaces(element, classification, {
            rolls: this._canStyleRollSurfaces(config, classification),
            cards: this._canStyleCardSurfaces(config, classification)
        });
    }

    _canStyleRollSurfaces(config, classification) {
        if (!classification?.isRoll) return true;

        const rolls = config?.rolls;
        if (rolls?.enabled === false) return false;

        const systemId = classification.systemId === 'dnd5e' || classification.systemId === 'pf2e'
            ? classification.systemId
            : 'generic';
        return rolls?.systems?.[systemId]?.enabled !== false;
    }

    _canStyleCardSurfaces(config, classification) {
        if (!classification?.isCard) return true;

        const cards = config?.cards;
        if (cards?.enabled === false) return false;

        if (classification.systemId === 'dnd5e') {
            const cardType = classification.cardType === 'abilityCards'
                ? 'abilityCards'
                : 'itemCards';
            return cards?.systems?.dnd5e?.[cardType] !== false;
        }

        if (classification.systemId === 'pf2e') {
            const cardType = classification.cardType === 'spellCards'
                ? 'spellCards'
                : 'actionCards';
            return cards?.systems?.pf2e?.[cardType] !== false;
        }

        return cards?.systems?.generic?.enabled !== false;
    }

    /**
     * Record that an unsupported complex message used the safe fallback.
     * @param {ChatMessage} message
     * @param {Object} classification
     * @private
     */
    _recordMessageDiagnostic(message, classification) {
        const messageId = message?.id ?? message?._id ?? null;
        const key = messageId || `${classification.type}:${classification.systemId ?? 'unknown'}:${classification.reasons?.join('|')}`;
        const existingIndex = this._messageDiagnostics.findIndex(entry => entry.key === key);
        if (existingIndex >= 0) this._messageDiagnostics.splice(existingIndex, 1);

        this._messageDiagnostics.unshift({
            key,
            messageId,
            type: 'safe-fallback',
            messageType: classification.type,
            fallback: classification.safeFallback,
            systemId: classification.systemId ?? game.system?.id ?? null,
            reasons: [...(classification.reasons ?? [])],
            speaker: message?.speaker?.alias ?? message?.author?.name ?? null,
            createdAt: new Date().toISOString()
        });

        this._messageDiagnostics = this._messageDiagnostics.slice(0, 20);
    }

    /**
     * @param {HTMLElement} element
     * @private
     */
    _removeFlavorClassesAndStyles(element, { restoreAvatar = false } = {}) {
        const classesToRemove = Array.from(element.classList).filter(className => (
            className === 'yf-card'
            || className === 'yf-processed'
            || className === 'yf-live-preview'
            || className.startsWith('yf-card-')
            || className.startsWith('yf-message-')
        ));
        if (classesToRemove.length > 0) element.classList.remove(...classesToRemove);
        delete element.dataset.yfMessageType;
        delete element.dataset.yfFallback;
        clearMessageSurfaces(element);

        const propertiesToRemove = [];
        for (let index = 0; index < element.style.length; index++) {
            const property = element.style.item(index);
            if (property?.startsWith('--yf-')) propertiesToRemove.push(property);
        }
        for (const property of propertiesToRemove) {
            element.style.removeProperty(property);
        }

        if (!element.getAttribute('style')) {
            element.removeAttribute('style');
        }

        if (restoreAvatar) this._restoreMessageAvatar(element);
    }

    /**
     * Restore the stock Foundry user avatar for a message after removing flavor.
     * @param {HTMLElement} element
     * @private
     */
    _restoreMessageAvatar(element) {
        const message = this._getMessageForElement(element);
        const avatar = message?.author?.avatar || message?.user?.avatar || 'icons/svg/mystery-man.svg';

        const avatarImg = element.querySelector('.message-header img.avatar')
            || element.querySelector('.message-header img');
        if (avatarImg) avatarImg.src = avatar;
    }
}

// Global instance
let yourFlavor = null;
let lastSceneControlConfigOpenAt = 0;

/* -------------------------------------------- */
/*  Foundry VTT Hooks                           */
/* -------------------------------------------- */

/**
 * Hook: init
 */
Hooks.once('init', () => {
    registerSettings();
    _loadGoogleFonts();
});

/**
 * Hook: ready
 */
Hooks.once('ready', async () => {
    yourFlavor = new YourFlavor();
    await yourFlavor.initialize();

    // Expose API
    game.modules.get(MODULE_ID).api = {
        openConfig: (options) => yourFlavor.openConfig(options),
        getManager: () => yourFlavor.manager,
        getLayouts: () => yourFlavor.layouts,
        getChatPresets: () => getChatPresetChoices(),
        getFoundryCustomizer: () => yourFlavor.foundryCustomizer,
        registerPreviewConfig: (previewId, config) => yourFlavor.registerPreviewConfig(previewId, config),
        clearPreviewConfig: (previewId) => yourFlavor.clearPreviewConfig(previewId),
        applyChatLogPreview: (config, options) => yourFlavor.applyChatLogPreview(config, options),
        clearChatLogPreview: () => yourFlavor.clearChatLogPreview(),
        commitChatLogPreview: () => yourFlavor.commitChatLogPreview(),
        getMessageDiagnostics: () => yourFlavor.getMessageDiagnostics(),
        getIconRegistry: () => yourFlavor.getIconRegistry(),
        getIconDiscoveryDiagnostics: () => yourFlavor.getIconDiscoveryDiagnostics(),
        getIconOverrideDiagnostics: () => yourFlavor.getIconOverrideDiagnostics(),
        factoryReset: () => yourFlavor.factoryReset(),
        clearAppliedChatStyles: (options) => yourFlavor.clearAppliedChatStyles(options)
    };

    globalThis.YourFlavor = game.modules.get(MODULE_ID).api;

    // Re-style existing chat messages after page reload
    _restyleExistingMessages();
});

/**
 * Re-apply flavor styling to all existing chat messages
 * Called after page reload to restore styles
 * @private
 */
function _restyleExistingMessages() {
    if (!yourFlavor) return;

    // Get all chat messages in the log
    const chatLog = document.querySelector('#chat-log');
    if (!chatLog) return;

    const messageElements = chatLog.querySelectorAll('.chat-message');
    let styledCount = 0;

    messageElements.forEach(element => {
        // Skip if already processed
        if (element.classList.contains('yf-processed')) return;

        // Get the message ID from the data attribute
        const messageId = element.dataset.messageId;
        if (!messageId) return;

        // Get the ChatMessage document
        const message = game.messages.get(messageId);
        if (!message) return;

        // Check if should style
        if (!yourFlavor.shouldStyleMessage(message, element)) return;

        // Apply flavor
        yourFlavor.applyFlavor(message, element);
        styledCount++;
    });

    if (styledCount > 0) {
        console.log(`${MODULE_NAME} | Re-styled ${styledCount} existing messages`);
    }
}

/**
 * Hook: renderChatMessageHTML (Foundry v13+)
 * New hook that fires with a plain HTMLElement
 */
Hooks.on(FOUNDRY_HOOKS.CHAT_RENDER_HTML, (message, html, context) => {
    if (!yourFlavor) return;
    const element = normalizeHtmlElement(html);
    if (!element) return;
    if (element.classList.contains('yf-processed')) return;
    if (!yourFlavor.shouldStyleMessage(message, element)) return;
    yourFlavor.applyFlavor(message, element);
});

/**
 * Hook: renderChatMessage (Foundry v12 legacy fallback)
 * Kept for backward compatibility — receives jQuery or HTMLElement
 */
Hooks.on(FOUNDRY_HOOKS.CHAT_RENDER_LEGACY, (message, html, data) => {
    if (!yourFlavor) return;
    const element = normalizeHtmlElement(html);
    if (!element) return;
    if (element.classList.contains('yf-processed')) return;
    if (!yourFlavor.shouldStyleMessage(message, element)) return;
    yourFlavor.applyFlavor(message, element);
});

/**
 * Hook: getSceneControlButtons
 * Add button to scene controls for quick access
 */
Hooks.on(FOUNDRY_HOOKS.SCENE_CONTROL_BUTTONS, (controls) => {
    const openConfig = (...args) => _openConfigFromSceneControl(...args);
    addSceneControlTool(controls, {
        name: 'your-flavor',
        title: game.i18n.localize('YOUR_FLAVOR.Controls.Configure'),
        icon: 'fas fa-palette',
        visible: true,
        button: true,
        onChange: openConfig,
        onClick: openConfig
    });
});

/* -------------------------------------------- */
/*  Helper Functions                            */
/* -------------------------------------------- */

/**
 * Load Google Fonts
 * @private
 */
function _loadGoogleFonts() {
    const fonts = [
        'Cinzel:wght@400;700',
        'Cinzel+Decorative:wght@400;700',
        'Great+Vibes',
        'Tangerine:wght@400;700',
        'Uncial+Antiqua',
        'Pirata+One',
        'MedievalSharp',
        'IM+Fell+English',
        'Almendra:wght@400;700',
        'Fondamento',
        'Courier+Prime',
        'Bangers',
        'Nosifer',
        'Press+Start+2P',
        'Black+Ops+One',
        'Indie+Flower',
        'Permanent+Marker',
        'Metamorphous',
        'Cormorant+Garamond:wght@400;600;700',
        'Philosopher:wght@400;700',
        'Marcellus',
        'Shippori+Mincho:wght@400;600;700',
        'Orbitron:wght@400;700',
        'Creepster',
        'Quicksand:wght@400;500;700',
        'Amatic+SC:wght@400;700',
        'Eater',
        'New+Rocker',
        'Audiowide',
        'Lora:wght@400;500;700',
        'Griffy'
    ];

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fonts.join('&family=')}&display=swap`;
    document.head.appendChild(link);
}

function _openConfigFromSceneControl(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    const now = Date.now();
    if (now - lastSceneControlConfigOpenAt < 250) return false;
    lastSceneControlConfigOpenAt = now;

    yourFlavor?.openConfig();
    return false;
}

export { YourFlavor };
