/**
 * Your Flavor - Configuration Application (Foundry VTT v13 ApplicationV2)
 * Premium Dark Theme with Horizontal Layout
 * @module your-flavor/ui/flavor-config-app
 */

import { MODULE_ID, MODULE_NAME, GOOGLE_FONTS, DEFAULT_CONFIG } from '../constants.js';
import { LAYOUTS, getLayoutChoices } from '../layouts.js';
import { FlavorManager } from '../flavor-manager.js';
import { applyFlavorStyles } from '../style-utils.js';

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
            toggleAdvanced: FlavorConfigApp.#onToggleAdvanced,
            exportConfig: FlavorConfigApp.#onExport,
            importConfig: FlavorConfigApp.#onImport,
            toggleFavorite: FlavorConfigApp.#onToggleFavorite
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

    /**
     * Currently editing actor ID (null = user default config)
     * @type {string|null}
     */
    _editingActorId = null;

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
        this._editingActorId = null;
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

        // Get layouts with category info and favorites
        const favorites = this.manager.getFavorites();
        const layouts = getLayoutChoices().map(l => ({
            ...l,
            isFavorite: favorites.includes(l.id)
        }));

        // Get owned actors for per-actor config
        const ownedActors = game.actors
            .filter(a => a.isOwner && a.type === 'character')
            .map(a => ({ id: a.id, name: a.name, img: a.img }));

        // Determine preview name/avatar based on editing context
        let previewName = game.user.name;
        let previewAvatar = game.user.avatar || 'icons/svg/mystery-man.svg';
        if (this._editingActorId) {
            const actor = game.actors.get(this._editingActorId);
            if (actor) {
                previewName = actor.name;
                previewAvatar = actor.img || previewAvatar;
            }
        }

        return {
            config,
            layouts,
            fonts: GOOGLE_FONTS,
            playerName: previewName,
            playerAvatar: previewAvatar,
            showCustomization: config.layout !== 'none',
            allowCustomHtml: game.user.isGM || game.settings.get(MODULE_ID, 'allowCustomHtml'),
            backgroundColorHex,
            isGM,
            canCustomize,
            hasForcedLayout,
            forcedLayout,
            forcedLayoutName,
            activeCategory: this._activeCategory,
            ownedActors,
            editingActorId: this._editingActorId,
            hasActors: ownedActors.length > 0,
            hasFavorites: favorites.length > 0
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
        // Actor selector
        const actorSelect = html.querySelector('.yf-actor-select');
        if (actorSelect) {
            actorSelect.addEventListener('change', (e) => this._onActorChange(e));
        }

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

    _onActorChange(event) {
        const actorId = event.currentTarget.value || null;
        this._editingActorId = actorId;

        // Load the config for this actor (or user default)
        if (actorId) {
            const actorConfig = this.manager.getActorConfig(actorId);
            this._workingConfig = actorConfig
                ? foundry.utils.deepClone(actorConfig)
                : foundry.utils.deepClone(this.manager.getCurrentConfig());
        } else {
            this._workingConfig = foundry.utils.deepClone(this.manager.getCurrentConfig());
        }
        this.render();
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
        const favorites = this.manager.getFavorites();
        const layouts = this.element.querySelectorAll('.yf-layout-option');
        layouts.forEach(layout => {
            const layoutCategory = layout.dataset.category;
            const layoutId = layout.dataset.layout;

            let shouldShow;
            if (category === 'favorites') {
                shouldShow = favorites.includes(layoutId) || layoutId === 'none' || layoutId === 'custom';
            } else if (category === null) {
                shouldShow = true;
            } else {
                shouldShow = layoutCategory === category || layoutId === 'none' || layoutId === 'custom';
            }
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

        // Handle color picker for background (convert to rgba using current opacity)
        if (name === 'customizations.backgroundColor' && typeof value === 'string' && value.startsWith('#')) {
            const r = parseInt(value.slice(1, 3), 16);
            const g = parseInt(value.slice(3, 5), 16);
            const b = parseInt(value.slice(5, 7), 16);
            const opacity = (this._workingConfig.customizations?.backgroundOpacity ?? 95) / 100;
            value = `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
            const suffix = input.name.includes('Opacity') ? '%' : 'px';
            valueDisplay.textContent = `${input.value}${suffix}`;
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
            if (this._editingActorId) {
                await this.manager.saveActorConfig(this._editingActorId, this._workingConfig);
            } else {
                await this.manager.saveConfig(this._workingConfig);
            }
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

    static async #onToggleFavorite(event, target) {
        event.stopPropagation();
        const layoutId = target.closest('.yf-layout-option')?.dataset?.layout;
        if (!layoutId || layoutId === 'none') return;
        await this.manager.toggleFavorite(layoutId);
        this.render();
    }

    static async #onExport(event, target) {
        const json = this.manager.exportConfig();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `your-flavor-${game.user.name}.json`;
        a.click();
        URL.revokeObjectURL(url);
        ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.Exported'));
    }

    static async #onImport(event, target) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const text = await file.text();
                const config = JSON.parse(text);
                this._workingConfig = foundry.utils.deepClone(config);
                this._activeCategory = null;
                this.render();
                ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.Imported'));
            } catch (error) {
                console.error(`${MODULE_NAME} | Import failed:`, error);
                ui.notifications.error(game.i18n.localize('YOUR_FLAVOR.Notifications.ImportError'));
            }
        });
        input.click();
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
            applyFlavorStyles(previewCard, config.customizations);
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
        // Foundry v13+ provides 'eq' helper natively
        // Fallback registration only for edge cases
        if (typeof Handlebars !== 'undefined' && !Handlebars.helpers.eq) {
            Handlebars.registerHelper('eq', (a, b) => a === b);
        }
    }
}
