/**
 * Your Flavor - Configuration Application (Foundry VTT v13 ApplicationV2)
 * Premium Dark Theme with Horizontal Layout
 * @module your-flavor/ui/flavor-config-app
 */

import {
    MODULE_ID,
    MODULE_NAME,
    GOOGLE_FONTS,
    DEFAULT_CONFIG,
    DEFAULT_FOUNDRY_CUSTOMIZATION,
    FOUNDRY_UI_COMPONENTS,
    PAUSE_EFFECTS
} from '../constants.js';
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
            toggleFavorite: FlavorConfigApp.#onToggleFavorite,
            switchTab: FlavorConfigApp.#onSwitchTab,
            browsePauseAsset: FlavorConfigApp.#onBrowsePauseAsset,
            clearPauseAsset: FlavorConfigApp.#onClearPauseAsset,
            toggleArrangeMode: FlavorConfigApp.#onToggleArrangeMode,
            resetFoundryComponent: FlavorConfigApp.#onResetFoundryComponent
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
     * The Foundry shell customizer instance.
     */
    foundryCustomizer = null;

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

    /**
     * Current working Foundry customization.
     * @type {Object}
     */
    _workingFoundryConfig = null;

    /**
     * Snapshot used to restore live Foundry changes when closing without saving.
     * @type {Object}
     */
    _savedFoundryConfigSnapshot = null;

    /**
     * Active top-level tab.
     * @type {'chat'|'foundry'}
     */
    _activeTab = 'chat';

    /**
     * Whether close should revert live Foundry changes.
     * @type {boolean}
     */
    _shouldRevertFoundryOnClose = true;

    constructor(options = {}) {
        super(options);
        this.manager = game.modules.get(MODULE_ID)?.api?.getManager() || new FlavorManager();
        this.foundryCustomizer = game.modules.get(MODULE_ID)?.api?.getFoundryCustomizer?.() || null;
    }

    /* -------------------------------------------- */
    /*  Rendering                                   */
    /* -------------------------------------------- */

    async _preFirstRender(context, options) {
        await super._preFirstRender(context, options);
        await this.manager.initialize();
        this._editingActorId = null;
        this._workingConfig = foundry.utils.deepClone(this.manager.getCurrentConfig());
        this._workingFoundryConfig = this.foundryCustomizer
            ? foundry.utils.deepClone(this.foundryCustomizer.getConfig())
            : foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION);
        this._savedFoundryConfigSnapshot = this.foundryCustomizer
            ? foundry.utils.deepClone(this.foundryCustomizer.getEffectiveConfig())
            : foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION);
        this._activeTab = options?.tab === 'foundry' ? 'foundry' : 'chat';
        this._shouldRevertFoundryOnClose = true;

        // Start with all layouts visible (no category filter)
        this._activeCategory = null;
    }

    async _prepareContext(options) {
        const config = this._workingConfig || this.manager.getCurrentConfig();
        const isGM = game.user.isGM;
        const foundryCustomizationUnlocked = game.settings.get(MODULE_ID, 'enableFoundryCustomization');
        const showFoundryTab = foundryCustomizationUnlocked && isGM;
        if (!showFoundryTab) {
            this._activeTab = 'chat';
        }

        const foundryConfig = this._workingFoundryConfig || foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION);
        const viewportWidth = globalThis.innerWidth || 1920;
        const viewportHeight = globalThis.innerHeight || 1080;

        // Check GM permission settings for players
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

        const foundryComponents = FOUNDRY_UI_COMPONENTS
            .filter(component => component.id !== 'pause')
            .map(component => ({
                ...component,
                label: game.i18n.localize(`YOUR_FLAVOR.Foundry.Components.${component.id}`),
                hasWidthControl: component.resize === 'width' || component.resize === 'both',
                hasHeightControl: component.resize === 'both',
                widthMin: component.minWidth ?? 120,
                widthMax: Math.max(component.maxWidth ?? 1600, Math.round(viewportWidth * 0.9)),
                heightMin: component.minHeight ?? 160,
                heightMax: Math.max(component.maxHeight ?? 1600, Math.round(viewportHeight * 1.5)),
                visible: foundryConfig.visibility[component.id],
                width: foundryConfig.layout[component.id]?.width ?? component.minWidth ?? 120,
                height: foundryConfig.layout[component.id]?.height
                    ?? Math.max(component.minHeight ?? 160, Math.round(viewportHeight - 160)),
                scale: foundryConfig.layout[component.id]?.scale
            }));

        const foundryPreviewStyle = [
            `--yf-foundry-preview-font-color:${foundryConfig.theme.fontColor}`,
            `--yf-foundry-preview-font-secondary:${foundryConfig.theme.secondaryFontColor}`,
            `--yf-foundry-preview-surface:${foundryConfig.theme.surfaceBackground}`,
            `--yf-foundry-preview-window:${foundryConfig.theme.windowBackground}`,
            `--yf-foundry-preview-header:${foundryConfig.theme.windowHeaderBackground}`,
            `--yf-foundry-preview-accent:${foundryConfig.theme.accentColor}`,
            `--yf-foundry-preview-chat:${foundryConfig.theme.chatTint}`,
            `--yf-foundry-preview-icon:${foundryConfig.theme.iconColor}`,
            `--yf-foundry-preview-icon-hover:${foundryConfig.theme.iconHoverColor}`,
            `--yf-foundry-preview-scrollbar:${foundryConfig.theme.scrollbarColor}`,
            `--yf-foundry-preview-pause-bar:${this._hexToRgba(foundryConfig.pause.barColor, foundryConfig.pause.barOpacity / 100)}`,
            `--yf-foundry-preview-pause-bar-height:${Math.round(Math.min(110, Math.max(26, foundryConfig.pause.barHeight * 0.32)))}px`,
            `--yf-foundry-preview-pause-label-color:${foundryConfig.pause.labelColor}`,
            `--yf-foundry-preview-pause-label-size:${Math.round(Math.min(22, Math.max(10, foundryConfig.pause.labelSize * 0.45)))}px`,
            `--yf-foundry-preview-pause-label-spacing:${Math.round(Math.min(10, Math.max(0, foundryConfig.pause.labelLetterSpacing * 0.4)))}px`,
            `--yf-foundry-preview-pause-label-offset:${Math.round(foundryConfig.pause.labelOffsetY * 0.35)}px`,
            `--yf-foundry-preview-pause-scale:${foundryConfig.pause.scale / 100}`,
            `--yf-foundry-preview-pause-font:${this._pauseFontStack(foundryConfig.pause.labelFont)}`
        ].join(';');

        return {
            config,
            foundryConfig,
            layouts,
            fonts: GOOGLE_FONTS,
            foundryFonts: GOOGLE_FONTS,
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
            hasFavorites: favorites.length > 0,
            activeTab: this._activeTab,
            showFoundryTab,
            arrangeModeActive: this.foundryCustomizer?.isArrangeModeActive?.() ?? false,
            foundryComponents,
            foundryPreviewStyle,
            pauseEffects: PAUSE_EFFECTS.map(effect => ({
                ...effect,
                label: game.i18n.localize(effect.labelKey)
            })),
            pausePreviewClass: this._getPausePreviewClass(foundryConfig.pause),
            pausePreviewLabel: this._getPausePreviewLabel(foundryConfig.pause)
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
        if (this._activeTab === 'chat' && this._activeCategory) {
            this._filterLayoutsByCategory(this._activeCategory);
        }

        // Apply preview styles
        this._updatePreview();
    }

    async close(options = {}) {
        this.foundryCustomizer?.disableArrangeMode?.();
        if (this._shouldRevertFoundryOnClose && this.foundryCustomizer) {
            this.foundryCustomizer.applyConfig(this._savedFoundryConfigSnapshot);
        }
        return super.close(options);
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
            } else if (el.type === 'color' || el.classList.contains('yf-live-input')) {
                el.addEventListener('input', (e) => this._onInputChange(e));
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
        if (!name) return;

        let value = input.type === 'checkbox' ? input.checked : input.value;

        // Handle numeric values
        if (input.type === 'range' || input.type === 'number') {
            value = parseFloat(value);
        }

        if (name.startsWith('foundry.')) {
            const foundryPath = name.replace(/^foundry\./, '');
            this._setNestedProperty(this._workingFoundryConfig, foundryPath, value);
            this._applyWorkingFoundryConfig();

            if (foundryPath === 'pause.enabled') {
                this.render();
            }
            return;
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
            let suffix = 'px';
            if (input.name.includes('Opacity') || input.name.includes('scale')) {
                suffix = '%';
            }
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

            if (game.user.isGM && game.settings.get(MODULE_ID, 'enableFoundryCustomization') && this.foundryCustomizer) {
                this._workingFoundryConfig = await this.foundryCustomizer.saveConfig(this._workingFoundryConfig);
                this._savedFoundryConfigSnapshot = foundry.utils.deepClone(this.foundryCustomizer.getEffectiveConfig());
            }

            this._shouldRevertFoundryOnClose = false;
            ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.Saved'));
            this.close();
        } catch (error) {
            console.error(`${MODULE_NAME} | Error saving configuration:`, error);
            ui.notifications.error(game.i18n.localize('YOUR_FLAVOR.Notifications.SaveError'));
        }
    }

    static async #onReset(event, target) {
        if (this._activeTab === 'foundry') {
            const confirmed = await Dialog.confirm({
                title: game.i18n.localize('YOUR_FLAVOR.Dialog.ResetFoundryTitle'),
                content: game.i18n.localize('YOUR_FLAVOR.Dialog.ResetFoundryContent'),
                yes: () => true,
                no: () => false,
                defaultYes: false
            });

            if (confirmed) {
                if (this.foundryCustomizer?.resetConfig) {
                    this._workingFoundryConfig = await this.foundryCustomizer.resetConfig();
                } else {
                    const defaults = foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION);
                    await game.settings.set(MODULE_ID, 'sharedFoundryCustomization', defaults);
                    await game.settings.set(MODULE_ID, 'foundryCustomization', foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION));
                    this.foundryCustomizer?.applyConfig?.(defaults);
                    this._workingFoundryConfig = defaults;
                }
                this._savedFoundryConfigSnapshot = this.foundryCustomizer
                    ? foundry.utils.deepClone(this.foundryCustomizer.getEffectiveConfig())
                    : foundry.utils.deepClone(this._workingFoundryConfig);
                this.render();
                ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.FoundryReset'));
            }
            return;
        }

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
        if (this._activeTab === 'foundry') return;

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
        this._shouldRevertFoundryOnClose = true;
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
        const json = this._activeTab === 'foundry'
            ? JSON.stringify(this._workingFoundryConfig, null, 2)
            : this.manager.exportConfig();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this._activeTab === 'foundry'
            ? `your-flavor-foundry-${game.user.name}.json`
            : `your-flavor-${game.user.name}.json`;
        a.click();
        URL.revokeObjectURL(url);
        ui.notifications.info(
            game.i18n.localize(
                this._activeTab === 'foundry'
                    ? 'YOUR_FLAVOR.Notifications.FoundryExported'
                    : 'YOUR_FLAVOR.Notifications.Exported'
            )
        );
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
                if (this._activeTab === 'foundry') {
                    this._workingFoundryConfig = foundry.utils.deepClone(config);
                    this._applyWorkingFoundryConfig();
                    this.render();
                    ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.FoundryImported'));
                } else {
                    this._workingConfig = foundry.utils.deepClone(config);
                    this._activeCategory = null;
                    this.render();
                    ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.Imported'));
                }
            } catch (error) {
                console.error(`${MODULE_NAME} | Import failed:`, error);
                ui.notifications.error(
                    game.i18n.localize(
                        this._activeTab === 'foundry'
                            ? 'YOUR_FLAVOR.Notifications.FoundryImportError'
                            : 'YOUR_FLAVOR.Notifications.ImportError'
                    )
                );
            }
        });
        input.click();
    }

    static async #onSwitchTab(event, target) {
        const tab = target.dataset.tab;
        if (!tab || tab === this._activeTab) return;
        this._activeTab = tab;
        this.render();
    }

    static async #onBrowsePauseAsset(event, target) {
        const picker = new FilePicker({
            type: 'imagevideo',
            callback: path => {
                this._workingFoundryConfig.pause.assetPath = path;
                this._applyWorkingFoundryConfig();
                this.render();
            }
        });
        picker.render(true);
    }

    static async #onClearPauseAsset(event, target) {
        this._workingFoundryConfig.pause.assetPath = '';
        this._applyWorkingFoundryConfig();
        this.render();
    }

    static async #onToggleArrangeMode(event, target) {
        if (!game.user.isGM || !this.foundryCustomizer || !game.settings.get(MODULE_ID, 'enableFoundryCustomization')) return;

        if (this.foundryCustomizer.isArrangeModeActive()) {
            this.foundryCustomizer.disableArrangeMode();
            ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.ArrangeModeDisabled'));
        } else {
            const started = this.foundryCustomizer.enableArrangeMode(this._workingFoundryConfig, () => {
                this._syncFoundryLayoutControls();
            });
            if (!started) {
                ui.notifications.warn(game.i18n.localize('YOUR_FLAVOR.Notifications.ArrangeModeUnavailable'));
            }
        }

        this.render();
    }

    static async #onResetFoundryComponent(event, target) {
        const componentId = target.dataset.component;
        if (!componentId || componentId === 'pause') return;

        const defaults = DEFAULT_FOUNDRY_CUSTOMIZATION.layout[componentId];
        if (!defaults) return;

        this._workingFoundryConfig.layout[componentId] = foundry.utils.deepClone(defaults);
        this._applyWorkingFoundryConfig();
        this.render();
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

    _applyWorkingFoundryConfig() {
        if (!this.foundryCustomizer) return;
        this.foundryCustomizer.applyConfig(this._workingFoundryConfig);
        this._updatePreview();
    }

    _syncFoundryLayoutControls() {
        const html = this.element;
        if (!html) return;

        for (const component of FOUNDRY_UI_COMPONENTS) {
            if (component.id === 'pause') continue;

            const layout = this._workingFoundryConfig?.layout?.[component.id];
            if (!layout) continue;

            const widthInput = html.querySelector(`[name="foundry.layout.${component.id}.width"]`);
            const widthValue = widthInput?.parentElement?.querySelector('.yf-range-value');
            if (widthInput && Number.isFinite(layout.width)) {
                widthInput.value = layout.width;
                if (widthValue) widthValue.textContent = `${layout.width}px`;
            }

            const heightInput = html.querySelector(`[name="foundry.layout.${component.id}.height"]`);
            const heightValue = heightInput?.parentElement?.querySelector('.yf-range-value');
            if (heightInput && Number.isFinite(layout.height)) {
                heightInput.value = layout.height;
                if (heightValue) heightValue.textContent = `${layout.height}px`;
            }

            const scaleInput = html.querySelector(`[name="foundry.layout.${component.id}.scale"]`);
            const scaleValue = scaleInput?.parentElement?.querySelector('.yf-range-value');
            if (scaleInput && Number.isFinite(layout.scale)) {
                scaleInput.value = layout.scale;
                if (scaleValue) scaleValue.textContent = `${layout.scale}%`;
            }
        }
    }

    _updatePreview() {
        if (this._activeTab === 'foundry') {
            const shellPreview = this.element?.querySelector('.yf-foundry-preview-shell');
            if (!shellPreview) return;

            const foundryConfig = this._workingFoundryConfig;
            shellPreview.style.setProperty('--yf-foundry-preview-font-color', foundryConfig.theme.fontColor);
            shellPreview.style.setProperty('--yf-foundry-preview-font-secondary', foundryConfig.theme.secondaryFontColor);
            shellPreview.style.setProperty('--yf-foundry-preview-surface', foundryConfig.theme.surfaceBackground);
            shellPreview.style.setProperty('--yf-foundry-preview-window', foundryConfig.theme.windowBackground);
            shellPreview.style.setProperty('--yf-foundry-preview-header', foundryConfig.theme.windowHeaderBackground);
            shellPreview.style.setProperty('--yf-foundry-preview-accent', foundryConfig.theme.accentColor);
            shellPreview.style.setProperty('--yf-foundry-preview-chat', foundryConfig.theme.chatTint);
            shellPreview.style.setProperty('--yf-foundry-preview-icon', foundryConfig.theme.iconColor);
            shellPreview.style.setProperty('--yf-foundry-preview-icon-hover', foundryConfig.theme.iconHoverColor);
            shellPreview.style.setProperty('--yf-foundry-preview-scrollbar', foundryConfig.theme.scrollbarColor);
            shellPreview.style.setProperty('--yf-foundry-preview-pause-bar', this._hexToRgba(foundryConfig.pause.barColor, foundryConfig.pause.barOpacity / 100));
            shellPreview.style.setProperty('--yf-foundry-preview-pause-bar-height', `${Math.round(Math.min(110, Math.max(26, foundryConfig.pause.barHeight * 0.32)))}px`);
            shellPreview.style.setProperty('--yf-foundry-preview-pause-label-color', foundryConfig.pause.labelColor);
            shellPreview.style.setProperty('--yf-foundry-preview-pause-label-size', `${Math.round(Math.min(22, Math.max(10, foundryConfig.pause.labelSize * 0.45)))}px`);
            shellPreview.style.setProperty('--yf-foundry-preview-pause-label-spacing', `${Math.round(Math.min(10, Math.max(0, foundryConfig.pause.labelLetterSpacing * 0.4)))}px`);
            shellPreview.style.setProperty('--yf-foundry-preview-pause-label-offset', `${Math.round(foundryConfig.pause.labelOffsetY * 0.35)}px`);
            shellPreview.style.setProperty('--yf-foundry-preview-pause-scale', `${foundryConfig.pause.scale / 100}`);
            shellPreview.style.setProperty('--yf-foundry-preview-pause-font', this._pauseFontStack(foundryConfig.pause.labelFont));

            const pausePreview = this.element?.querySelector('.yf-foundry-preview-pause');
            if (pausePreview) {
                pausePreview.className = `yf-foundry-preview-pause ${this._getPausePreviewClass(foundryConfig.pause)}`.trim();
            }

            const pauseLabel = this.element?.querySelector('.yf-foundry-preview-pause-label');
            if (pauseLabel) {
                pauseLabel.textContent = this._getPausePreviewLabel(foundryConfig.pause);
            }

            const statusEl = this.element?.querySelector('.yf-preview-status');
            if (statusEl) {
                statusEl.className = `yf-preview-status ${foundryConfig.enabled ? 'enabled' : 'disabled'}`;
                statusEl.innerHTML = foundryConfig.enabled
                    ? `<i class="fas fa-wand-magic-sparkles"></i> ${game.i18n.localize('YOUR_FLAVOR.Config.Foundry.LiveApplied')}`
                    : `<i class="fas fa-power-off"></i> ${game.i18n.localize('YOUR_FLAVOR.Config.Foundry.DisabledState')}`;
            }
            return;
        }

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

    _getPausePreviewClass(pauseConfig = {}) {
        const classes = [];
        if (pauseConfig.enabled) classes.push('is-custom');
        if (pauseConfig.hideLabel) classes.push('is-label-hidden');
        if (pauseConfig.effect) classes.push(`effect-${pauseConfig.effect}`);
        return classes.join(' ');
    }

    _getPausePreviewLabel(pauseConfig = {}) {
        return pauseConfig.labelText?.trim() || game.i18n.localize('GAME.Paused');
    }

    _hexToRgba(hex, alpha = 1) {
        const normalized = String(hex || '').trim().replace('#', '');
        if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(normalized)) {
            return `rgba(0, 0, 0, ${alpha})`;
        }

        const factor = normalized.length === 3 ? 1 : 2;
        const read = (start) => {
            const chunk = factor === 1 ? normalized[start] : normalized.slice(start * 2, start * 2 + 2);
            return parseInt(factor === 1 ? `${chunk}${chunk}` : chunk, 16);
        };

        return `rgba(${read(0)}, ${read(1)}, ${read(2)}, ${alpha})`;
    }

    _fontStack(fontFamily) {
        return fontFamily && fontFamily !== 'inherit'
            ? `"${fontFamily}", serif`
            : 'inherit';
    }

    _pauseFontStack(fontFamily) {
        return fontFamily && fontFamily !== 'inherit'
            ? this._fontStack(fontFamily)
            : 'var(--font-serif)';
    }
}
