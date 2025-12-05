/**
 * Your Flavor - Chat Customization Module for Foundry VTT v13
 * @module your-flavor
 */

import { MODULE_ID, MODULE_NAME } from './constants.js';
import { registerSettings } from './settings.js';
import { FlavorManager } from './flavor-manager.js';
import { LAYOUTS } from './layouts.js';
import { FlavorConfigApp } from './ui/flavor-config-app.js';

/**
 * Main module class
 */
class YourFlavor {
    constructor() {
        this.manager = null;
        this.layouts = LAYOUTS;
    }

    /**
     * Initialize the module
     */
    async initialize() {
        console.log(`${MODULE_NAME} | Initializing...`);

        // Initialize flavor manager
        this.manager = new FlavorManager();
        await this.manager.initialize();

        console.log(`${MODULE_NAME} | Ready!`);
    }

    /**
     * Open the configuration UI
     */
    openConfig() {
        new FlavorConfigApp().render(true);
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

        // SAFETY: Never style roll messages
        if (message.isRoll) {
            return false;
        }

        // SAFETY: Never style messages with dice rolls
        if (html.querySelector('.dice-roll, .dice-result')) {
            return false;
        }

        // SAFETY: Never style D&D 5e item cards or other system cards
        if (message.flags?.dnd5e) {
            return false;
        }

        // SAFETY: Never style item cards (generic check)
        if (html.querySelector('.item-card, .chat-card, .dnd5e')) {
            return false;
        }

        // SAFETY: Check for common system-specific classes
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

        // Check whisper settings
        if (message.whisper?.length > 0) {
            if (!game.settings.get(MODULE_ID, 'applyToWhispers')) {
                return false;
            }
        }

        // Get the message content element
        const messageContent = html.querySelector('.message-content');
        if (!messageContent) {
            return false;
        }

        // Only style if it looks like a plain text message
        // Check if content is mostly text (not complex HTML structures)
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

        // Get the effective config for this user (respecting GM settings)
        const config = this._getEffectiveConfig(authorId);
        if (!config?.enabled || config.layout === 'none') return;

        try {
            // Get layout configuration
            const layout = this.layouts[config.layout];
            if (!layout) return;

            // Add layout class to the entire message element
            html.classList.add('yf-card', `yf-card-${config.layout}`);

            // Apply custom styles directly to the message card
            this._applyCardStyles(html, config.customizations, layout);

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
    _getEffectiveConfig(userId) {
        const user = game.users.get(userId);
        if (!user) return null;

        // GMs always use their own config
        if (user.isGM) {
            return this.manager.getConfig(userId);
        }

        // Check if there's a forced layout for players
        const forcedLayout = game.settings.get(MODULE_ID, 'forcePlayerLayout');
        if (forcedLayout && forcedLayout !== 'none') {
            // Use forced layout with its defaults
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
            // Players not allowed to customize, return null (no styling)
            return null;
        }

        // Players allowed to customize, use their config
        return this.manager.getConfig(userId);
    }

    /**
     * Apply custom styles to the entire message card
     * @private
     */
    _applyCardStyles(card, customizations, layoutDefaults) {
        const styles = { ...layoutDefaults.defaults, ...customizations };

        // Store styles as CSS custom properties for use in CSS
        card.style.setProperty('--yf-font-family', styles.fontFamily && styles.fontFamily !== 'inherit' ? `"${styles.fontFamily}", serif` : 'inherit');
        card.style.setProperty('--yf-font-size', `${styles.fontSize || 14}px`);
        card.style.setProperty('--yf-text-color', styles.textColor || '#e8dcc8');
        card.style.setProperty('--yf-bg-color', styles.backgroundColor || 'rgba(20, 16, 12, 0.95)');
        card.style.setProperty('--yf-border-color', styles.borderColor || '#c9a227');
        card.style.setProperty('--yf-border-width', `${styles.borderWidth || 2}px`);
        card.style.setProperty('--yf-border-style', styles.borderStyle || 'solid');
        card.style.setProperty('--yf-border-radius', `${styles.borderRadius || 8}px`);
        card.style.setProperty('--yf-padding', `${styles.padding || 12}px`);

        // Name and timestamp colors with fallbacks
        const nameColor = styles.nameColor || styles.borderColor || '#c9a227';
        const timestampColor = styles.timestampColor || styles.textColor || '#e8dcc8';
        card.style.setProperty('--yf-name-color', nameColor);
        card.style.setProperty('--yf-timestamp-color', timestampColor);

        // Build box-shadow
        let shadows = [];
        if (styles.glowEnabled && styles.glowColor) {
            const intensity = styles.glowIntensity || 10;
            shadows.push(`0 0 ${intensity}px ${styles.glowColor}`);
            shadows.push(`0 0 ${intensity * 2}px ${styles.glowColor}`);
        }
        if (styles.shadowEnabled) {
            shadows.push('0 4px 15px rgba(0, 0, 0, 0.5)');
        }
        card.style.setProperty('--yf-box-shadow', shadows.length > 0 ? shadows.join(', ') : 'none');
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
    console.log(`${MODULE_NAME} | Initializing settings...`);
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
        openConfig: () => yourFlavor.openConfig(),
        getManager: () => yourFlavor.manager,
        getLayouts: () => yourFlavor.layouts
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
 * Hook: renderChatMessage
 * Main hook for applying flavor to chat messages
 */
Hooks.on('renderChatMessage', (message, html, data) => {
    if (!yourFlavor) {
        console.log(`${MODULE_NAME} | yourFlavor not initialized yet`);
        return;
    }

    // Get the actual HTML element (handle jQuery if present)
    const element = html instanceof jQuery ? html[0] : html;

    // Check if already processed
    if (element.classList.contains('yf-processed')) return;

    // Check if should style
    if (!yourFlavor.shouldStyleMessage(message, element)) {
        console.log(`${MODULE_NAME} | Message skipped (system/roll message)`);
        return;
    }

    // Get author config
    const authorId = message.author?.id;
    const config = yourFlavor.manager.getConfig(authorId);
    console.log(`${MODULE_NAME} | Applying flavor for user ${authorId}:`, config);

    // Apply flavor
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
        'Fondamento'
    ];

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fonts.join('&family=')}&display=swap`;
    document.head.appendChild(link);
}

export { YourFlavor };
