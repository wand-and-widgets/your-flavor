/**
 * Your Flavor - Chat Customization Module for Foundry VTT v13
 * @module your-flavor
 */

import { MODULE_ID, MODULE_NAME } from './constants.js';
import { registerSettings } from './settings.js';
import { FlavorManager } from './flavor-manager.js';
import { LAYOUTS } from './layouts.js';
import { FlavorConfigApp } from './ui/flavor-config-app.js';
import { FoundryCustomizer } from './foundry-customizer.js';
import { applyFlavorStyles } from './style-utils.js';

/**
 * Main module class
 */
class YourFlavor {
    constructor() {
        this.manager = null;
        this.foundryCustomizer = null;
        this.layouts = LAYOUTS;
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
        new FlavorConfigApp(options).render(true);
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

        // Some systems/messages may not have standard chat content container
        const messageContent = html.querySelector('.message-content');
        if (!messageContent) {
            return false;
        }

        // Optional broad mode: style all chat message types (rolls, cards, complex content)
        if (game.settings.get(MODULE_ID, 'applyToAllMessages')) {
            return true;
        }

        // Default safe mode: avoid styling rolls/system cards/complex structures
        if (message.isRoll) {
            return false;
        }

        if (html.querySelector('.dice-roll, .dice-result')) {
            return false;
        }

        if (message.flags?.dnd5e) {
            return false;
        }

        if (html.querySelector('.item-card, .chat-card, .dnd5e')) {
            return false;
        }

        const systemClasses = [
            '.pf2e', '.swade', '.wfrp4e', '.coc7',
            '.ability-check', '.skill-check', '.saving-throw',
            '.attack-roll', '.damage-roll'
        ];
        for (const selector of systemClasses) {
            if (html.querySelector(selector)) {
                return false;
            }
        }

        const hasComplexContent = messageContent.querySelector(
            'table, form, button, input, select, .flexrow, .flexcol'
        );
        if (hasComplexContent) {
            return false;
        }

        return true;
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
        const config = this._getEffectiveConfig(authorId, actorId);
        if (!config?.enabled || config.layout === 'none') return;

        try {
            // Get layout configuration
            const layout = this.layouts[config.layout];
            if (!layout) return;

            // Add layout class to the entire message element
            html.classList.add('yf-card', `yf-card-${config.layout}`);

            // Apply custom styles directly to the message card
            this._applyCardStyles(html, config.customizations, layout);

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
    _applyCardStyles(card, customizations, layoutDefaults) {
        applyFlavorStyles(card, customizations, layoutDefaults.defaults);
    }
}

// Global instance
let yourFlavor = null;

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
        getFoundryCustomizer: () => yourFlavor.foundryCustomizer
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
Hooks.on('renderChatMessageHTML', (message, html, context) => {
    if (!yourFlavor) return;
    if (html.classList.contains('yf-processed')) return;
    if (!yourFlavor.shouldStyleMessage(message, html)) return;
    yourFlavor.applyFlavor(message, html);
});

/**
 * Hook: renderChatMessage (Foundry v12 legacy fallback)
 * Kept for backward compatibility — receives jQuery or HTMLElement
 */
Hooks.on('renderChatMessage', (message, html, data) => {
    if (!yourFlavor) return;
    const element = html instanceof jQuery ? html[0] : html;
    if (element.classList.contains('yf-processed')) return;
    if (!yourFlavor.shouldStyleMessage(message, element)) return;
    yourFlavor.applyFlavor(message, element);
});

/**
 * Hook: getSceneControlButtons
 * Add button to scene controls for quick access
 */
Hooks.on('getSceneControlButtons', (controls) => {
    // Find token controls
    let tokenControls;
    if (Array.isArray(controls)) {
        tokenControls = controls.find(c => c.name === 'token');
    } else {
        tokenControls = controls.tokens;
    }

    if (!tokenControls) return;

    const tool = {
        name: 'your-flavor',
        title: game.i18n.localize('YOUR_FLAVOR.Controls.Configure'),
        icon: 'fas fa-palette',
        visible: true,
        button: true,
        onClick: () => yourFlavor?.openConfig()
    };

    // Add tool based on structure type
    if (Array.isArray(tokenControls.tools)) {
        tokenControls.tools.push(tool);
    } else if (tokenControls.tools instanceof Map) {
        tokenControls.tools.set('your-flavor', tool);
    } else if (typeof tokenControls.tools === 'object') {
        tokenControls.tools['your-flavor'] = tool;
    }
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

export { YourFlavor };
