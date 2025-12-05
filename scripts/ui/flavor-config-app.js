/**
 * Your Flavor - Configuration Application (Foundry VTT v13 ApplicationV2)
 * Premium Dark Theme with Horizontal Layout
 * @module your-flavor/ui/flavor-config-app
 */

import { MODULE_ID, MODULE_NAME, GOOGLE_FONTS, DEFAULT_CONFIG } from '../constants.js';
import { LAYOUTS, getLayoutChoices } from '../layouts.js';
import { FlavorManager } from '../flavor-manager.js';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Configuration application for Your Flavor module
 * Features: Horizontal layout, category tabs, premium UI components
 */
export class FlavorConfigApp extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        id: 'your-flavor-config',
        classes: ['your-flavor-config'],
        tag: 'div',
        window: {
            frame: true,
            positioned: true,
            title: 'YOUR_FLAVOR.Config.Title',
            icon: 'fas fa-palette',
            minimizable: true,
            resizable: true
        },
        position: {
            width: 720,
            height: 480
        },
        actions: {
            selectLayout: FlavorConfigApp.#onSelectLayout,
            save: FlavorConfigApp.#onSave,
            reset: FlavorConfigApp.#onReset,
            test: FlavorConfigApp.#onTest,
            close: FlavorConfigApp.#onClose,
            toggleAdvanced: FlavorConfigApp.#onToggleAdvanced
        }
    };

    static PARTS = {
        form: {
            id: 'form',
            template: `modules/${MODULE_ID}/templates/flavor-config.hbs`,
            scrollable: ['.yf-controls-scroll']
        }
    };

    /**
     * The flavor manager instance
     * @type {FlavorManager}
     */
    manager = null;

    /**
     * Current working configuration
     * @type {Object}
     */
    _workingConfig = null;

    /**
     * Current active category tag (null = show all)
     * @type {string|null}
     */
    _activeCategory = null;

    constructor(options = {}) {
        super(options);
        this.manager = game.modules.get(MODULE_ID)?.api?.getManager() || new FlavorManager();
    }

    /* -------------------------------------------- */
    /*  Rendering                                   */
    /* -------------------------------------------- */

    async _preFirstRender(context, options) {
        await super._preFirstRender(context, options);
        await this.manager.initialize();
        this._workingConfig = foundry.utils.deepClone(this.manager.getCurrentConfig());

        // Start with all layouts visible (no category filter)
        this._activeCategory = null;
    }

    async _prepareContext(options) {
        const config = this._workingConfig || this.manager.getCurrentConfig();

        // Check GM permission settings for players
        const isGM = game.user.isGM;
        const allowPlayerCustomization = game.settings.get(MODULE_ID, 'allowPlayerCustomization');
        const forcedLayout = game.settings.get(MODULE_ID, 'forcePlayerLayout');

        // Determine if player can customize
        const canCustomize = isGM || allowPlayerCustomization;
        const hasForcedLayout = !isGM && forcedLayout && forcedLayout !== 'none';

        // Convert background color to hex for color picker
        let backgroundColorHex = '#141210';
        if (config.customizations?.backgroundColor) {
            const bg = config.customizations.backgroundColor;
            if (bg.startsWith('#')) {
                backgroundColorHex = bg;
            } else if (bg.startsWith('rgba')) {
                const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                if (match) {
                    const r = parseInt(match[1]).toString(16).padStart(2, '0');
                    const g = parseInt(match[2]).toString(16).padStart(2, '0');
                    const b = parseInt(match[3]).toString(16).padStart(2, '0');
                    backgroundColorHex = `#${r}${g}${b}`;
                }
            }
        }

        // Get forced layout info if applicable
        let forcedLayoutName = '';
        if (hasForcedLayout) {
            const layoutInfo = LAYOUTS[forcedLayout];
            forcedLayoutName = layoutInfo?.name || forcedLayout;
        }

        // Get layouts with category info
        const layouts = getLayoutChoices();

        return {
            config,
            layouts,
            fonts: GOOGLE_FONTS,
            playerName: game.user.name,
            playerAvatar: game.user.avatar || 'icons/svg/mystery-man.svg',
            showCustomization: config.layout !== 'none',
            allowCustomHtml: game.user.isGM || game.settings.get(MODULE_ID, 'allowCustomHtml'),
            backgroundColorHex,
            isGM,
            canCustomize,
            hasForcedLayout,
            forcedLayout,
            forcedLayoutName,
            activeCategory: this._activeCategory
        };
    }

    _onRender(context, options) {
        super._onRender(context, options);

        const html = this.element;

        // Apply UI scale setting
        const uiScale = game.settings.get(MODULE_ID, 'uiScale');
        this.element.style.setProperty('--yf-ui-scale', uiScale / 100);

        // Register Handlebars helper for equality check
        this._registerLocalHelpers();

        // Setup event listeners
        this._setupEventListeners(html);

        // Apply initial category filter (null = show all)
        if (this._activeCategory) {
            this._filterLayoutsByCategory(this._activeCategory);
        }

        // Apply preview styles
        this._updatePreview();
    }

    /* -------------------------------------------- */
    /*  Event Handlers                              */
    /* -------------------------------------------- */

    _setupEventListeners(html) {
        // Layout selection
        html.querySelectorAll('.yf-layout-option').forEach(el => {
            el.addEventListener('click', (e) => this._onLayoutClick(e));
        });

        // Tag navigation
        html.querySelectorAll('.yf-tag').forEach(el => {
            el.addEventListener('click', (e) => this._onTagClick(e));
        });

        // Form inputs
        html.querySelectorAll('input, select, textarea').forEach(el => {
            el.addEventListener('change', (e) => this._onInputChange(e));
            if (el.type === 'range') {
                el.addEventListener('input', (e) => this._onRangeInput(e));
            }
        });

    }

    _onTagClick(event) {
        event.preventDefault();
        const tag = event.currentTarget;
        const category = tag.dataset.category;

        // Toggle: clicking active tag deselects it (show all)
        if (this._activeCategory === category) {
            this._activeCategory = null;
        } else {
            this._activeCategory = category;
        }

        // Update active tag UI
        this.element.querySelectorAll('.yf-tag').forEach(t => {
            t.classList.toggle('active', t.dataset.category === this._activeCategory);
        });

        // Filter layouts
        this._filterLayoutsByCategory(this._activeCategory);
    }

    _filterLayoutsByCategory(category) {
        const layouts = this.element.querySelectorAll('.yf-layout-option');
        layouts.forEach(layout => {
            const layoutCategory = layout.dataset.category;
            const layoutId = layout.dataset.layout;

            // If no category selected (null), show all
            // Always show 'none' and 'custom' options
            const shouldShow = category === null ||
                               layoutCategory === category ||
                               layoutId === 'none' ||
                               layoutId === 'custom';
            layout.style.display = shouldShow ? '' : 'none';
        });
    }

    _onLayoutClick(event) {
        const layoutId = event.currentTarget.dataset.layout;
        if (!layoutId) return;

        // Update selection UI
        this.element.querySelectorAll('.yf-layout-option').forEach(el => {
            el.classList.toggle('selected', el.dataset.layout === layoutId);
        });

        // Update working config with layout defaults
        this._workingConfig.layout = layoutId;

        if (layoutId !== 'none' && layoutId !== 'custom') {
            const layout = LAYOUTS[layoutId];
            if (layout?.defaults) {
                this._workingConfig.customizations = {
                    ...this._workingConfig.customizations,
                    ...layout.defaults
                };
            }
        }

        // Re-render to update customization section visibility
        this.render();
    }

    _onInputChange(event) {
        const input = event.currentTarget;
        const name = input.name;
        let value = input.type === 'checkbox' ? input.checked : input.value;

        // Handle numeric values
        if (input.type === 'range' || input.type === 'number') {
            value = parseFloat(value);
        }

        // Handle color picker for background (convert to rgba)
        if (name === 'customizations.backgroundColor' && value.startsWith('#')) {
            const r = parseInt(value.slice(1, 3), 16);
            const g = parseInt(value.slice(3, 5), 16);
            const b = parseInt(value.slice(5, 7), 16);
            value = `rgba(${r}, ${g}, ${b}, 0.95)`;
        }

        // Set nested property
        this._setNestedProperty(this._workingConfig, name, value);

        // Update preview
        this._updatePreview();

        // Re-render if glow toggle changed (to show/hide glow options)
        if (name === 'customizations.glowEnabled') {
            this.render();
        }
    }

    _onRangeInput(event) {
        const input = event.currentTarget;
        const valueDisplay = input.parentElement.querySelector('.yf-range-value');
        if (valueDisplay) {
            valueDisplay.textContent = `${input.value}px`;
        }
        // Live update preview while dragging
        this._onInputChange(event);
    }

    /* -------------------------------------------- */
    /*  Actions                                     */
    /* -------------------------------------------- */

    static async #onSelectLayout(event, target) {
        const layoutId = target.dataset.layout;
        if (layoutId) {
            this._workingConfig.layout = layoutId;
            this.render();
        }
    }

    static async #onSave(event, target) {
        try {
            await this.manager.saveConfig(this._workingConfig);
            ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.Saved'));
            this.close();
        } catch (error) {
            console.error(`${MODULE_NAME} | Error saving configuration:`, error);
            ui.notifications.error(game.i18n.localize('YOUR_FLAVOR.Notifications.SaveError'));
        }
    }

    static async #onReset(event, target) {
        const confirmed = await Dialog.confirm({
            title: game.i18n.localize('YOUR_FLAVOR.Dialog.ResetTitle'),
            content: game.i18n.localize('YOUR_FLAVOR.Dialog.ResetContent'),
            yes: () => true,
            no: () => false,
            defaultYes: false
        });

        if (confirmed) {
            this._workingConfig = foundry.utils.deepClone(DEFAULT_CONFIG);
            this._activeCategory = 'basic';
            this.render();
            ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.Reset'));
        }
    }

    static async #onTest(event, target) {
        // Save config first so the test message uses the current settings
        try {
            await this.manager.saveConfig(this._workingConfig);
        } catch (error) {
            console.error(`${MODULE_NAME} | Error saving config for test:`, error);
        }

        const testMessage = game.i18n.localize('YOUR_FLAVOR.Config.TestMessage');
        await ChatMessage.create({
            content: testMessage,
            speaker: ChatMessage.getSpeaker({ user: game.user })
        });
    }

    static async #onClose(event, target) {
        this.close();
    }

    static async #onToggleAdvanced(event, target) {
        const content = target.nextElementSibling;
        target.classList.toggle('open');
        content.classList.toggle('open');
    }

    /* -------------------------------------------- */
    /*  Helper Methods                              */
    /* -------------------------------------------- */

    _setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
    }

    _updatePreview() {
        const previewCard = this.element?.querySelector('.yf-preview-card');
        if (!previewCard) return;

        const config = this._workingConfig;
        const layoutId = config.layout;

        // Reset classes
        previewCard.className = `yf-preview-card yf-card yf-card-${layoutId}`;

        // Apply custom styles as CSS variables
        if (layoutId !== 'none' && config.customizations) {
            const c = config.customizations;

            previewCard.style.setProperty('--yf-font-family', c.fontFamily && c.fontFamily !== 'inherit' ? `"${c.fontFamily}", serif` : 'inherit');
            previewCard.style.setProperty('--yf-font-size', `${c.fontSize || 14}px`);
            previewCard.style.setProperty('--yf-text-color', c.textColor || '#f0e6d8');
            previewCard.style.setProperty('--yf-bg-color', c.backgroundColor || 'rgba(20, 16, 12, 0.95)');
            previewCard.style.setProperty('--yf-border-color', c.borderColor || '#d4872c');
            previewCard.style.setProperty('--yf-border-width', `${c.borderWidth || 2}px`);
            previewCard.style.setProperty('--yf-border-style', c.borderStyle || 'solid');
            previewCard.style.setProperty('--yf-border-radius', `${c.borderRadius || 8}px`);
            previewCard.style.setProperty('--yf-padding', `${c.padding || 12}px`);

            // Name and timestamp colors for preview
            const nameColor = c.nameColor || c.borderColor || '#d4872c';
            const timestampColor = c.timestampColor || c.textColor || '#f0e6d8';
            previewCard.style.setProperty('--yf-name-color', nameColor);
            previewCard.style.setProperty('--yf-timestamp-color', timestampColor);

            // Build box-shadow
            let shadows = [];
            if (c.glowEnabled && c.glowColor) {
                const intensity = c.glowIntensity || 10;
                shadows.push(`0 0 ${intensity}px ${c.glowColor}`);
                shadows.push(`0 0 ${intensity * 2}px ${c.glowColor}`);
            }
            if (c.shadowEnabled) {
                shadows.push('0 4px 15px rgba(0, 0, 0, 0.5)');
            }
            previewCard.style.setProperty('--yf-box-shadow', shadows.length > 0 ? shadows.join(', ') : 'none');
        }

        // Update status indicator
        const statusEl = this.element?.querySelector('.yf-preview-status');
        if (statusEl) {
            statusEl.className = `yf-preview-status ${config.enabled ? 'enabled' : 'disabled'}`;
            statusEl.innerHTML = config.enabled
                ? `<i class="fas fa-check-circle"></i> ${game.i18n.localize('YOUR_FLAVOR.Config.StatusEnabled')}`
                : `<i class="fas fa-times-circle"></i> ${game.i18n.localize('YOUR_FLAVOR.Config.StatusDisabled')}`;
        }
    }

    _registerLocalHelpers() {
        // Register 'eq' helper if not already registered
        if (!Handlebars.helpers.eq) {
            Handlebars.registerHelper('eq', function(a, b) {
                return a === b;
            });
        }
    }
}
