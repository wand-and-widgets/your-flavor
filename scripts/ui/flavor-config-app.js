/**
 * Your Flavor - Configuration Application (Foundry VTT v13/v14 ApplicationV2)
 * Premium Dark Theme with Horizontal Layout
 * v4: Theme presets, category toggles, per-component styling, custom CSS
 * @module your-flavor/ui/flavor-config-app
 */

import {
    CHAT_LOG_TRANSFORMER_PRESETS,
    MODULE_ID,
    MODULE_NAME,
    GOOGLE_FONTS,
    DEFAULT_CARD_CONFIG,
    DEFAULT_FOUNDRY_CUSTOMIZATION,
    DEFAULT_ROLL_CONFIG,
    FOUNDRY_CATEGORIES,
    FOUNDRY_THEME_PRESETS,
    PAUSE_BAR_SHAPES,
    PAUSE_BLEND_MODES,
    PAUSE_EFFECTS,
    PAUSE_LABEL_PLACEMENTS,
    PAUSE_LABEL_WEIGHTS,
    PAUSE_MOTION_MODES,
    PAUSE_SYMBOL_FILTERS,
    PAUSE_VISUAL_MODES,
    SIDEBAR_TRANSFORMER_PRESETS
} from '../constants.js';
import {
    applyUserChatPresetExport,
    buildUserChatPresetExport,
    getChatPreset,
    getChatPresetChoices
} from '../chat-presets.js';
import {
    applyVisualProfileToDraft,
    buildVisualProfileExport,
    parseVisualProfileExport,
    slugifyVisualProfileFilename
} from '../visual-profile.js';
import { FlavorManager } from '../flavor-manager.js';
import {
    createPreviewFixtures,
    getDefaultPreviewFixture
} from '../preview-fixtures.js';
import {
    CHAT_RANDOMIZER_ANY,
    CHAT_RANDOMIZER_VALUES,
    normalizeChatRandomizerConstraints,
    randomizeChatDraft
} from '../chat-randomizer.js';
import {
    getIconRegistry,
    getIconOverrideRegistryEntries,
    inspectIconRegistryEntry,
    resolveIconRegistryEntry
} from '../icon-registry.js';
import {
    FONT_AWESOME_ICON_PICKER_CATALOG,
    FONT_AWESOME_ICON_PICKER_CATEGORIES
} from '../font-awesome-icon-catalog.js';
import {
    normalizeChatLogConfig,
    normalizeHotbarConfig,
    normalizeLegacyIcons,
    normalizePlayersListConfig,
    normalizeSidebarConfig,
    normalizeWindowsConfig
} from '../config-normalizer.js';
import {
    ApplicationV2,
    confirmDialog,
    getFilePickerClass,
    HandlebarsApplicationMixin,
    openFilePicker,
    preloadHandlebarsTemplates
} from '../compatibility.js';
import { FlavorConfigStore } from './config-store.js';
import { FlavorChatTabController } from './chat-tab-controller.js';
import { FlavorFoundryTabController } from './foundry-tab-controller.js';
import { FlavorPreviewController } from './preview-controller.js';

const CONFIG_APP_DEFAULT_POSITION = Object.freeze({ width: 1240, height: 740 });
const CONFIG_APP_MIN_POSITION = Object.freeze({ width: 680, height: 520 });
const CONFIG_APP_SCENE_NAVIGATION_POSITION = Object.freeze({ width: 760, height: 620 });
const CONFIG_APP_VIEWPORT_MARGIN = 32;
const CHAT_PREVIEW_WIDTH = Object.freeze({ fallback: 320, min: 280, max: 420 });
const FOUNDRY_DATA_SOURCE = 'data';
const PAUSE_UPLOAD_FALLBACK_DIRECTORY = 'your-flavor/pause';
const PAUSE_UPLOAD_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,video/webm,video/mp4,video/ogg';
const FONT_AWESOME_ICON_PICKER_CATEGORY_IDS = new Set(FONT_AWESOME_ICON_PICKER_CATEGORIES.map(category => category.id));
const QUICK_COLOR_NEUTRALS = Object.freeze([
    '#050505', '#111111', '#1f1f1f', '#2f2f2f', '#444444', '#5c5c5c', '#777777', '#949494',
    '#b0b0b0', '#c8c8c8', '#dddddd', '#f0f0f0', '#fff7e8', '#f5ead7', '#e2d2bb', '#c7b49a'
]);
const QUICK_COLOR_HUES = Object.freeze([0, 14, 28, 42, 56, 76, 96, 118, 142, 166, 188, 206, 224, 244, 264, 284, 304, 324, 344]);
const QUICK_COLOR_TONES = Object.freeze([
    { saturation: 88, lightness: 24 },
    { saturation: 84, lightness: 34 },
    { saturation: 80, lightness: 46 },
    { saturation: 78, lightness: 58 },
    { saturation: 72, lightness: 70 },
    { saturation: 60, lightness: 82 }
]);
const QUICK_COLOR_PALETTE = Object.freeze([
    ...QUICK_COLOR_NEUTRALS,
    ...QUICK_COLOR_HUES.flatMap(hue => (
        QUICK_COLOR_TONES.map(tone => hslToHex(hue, tone.saturation, tone.lightness))
    ))
]);

function hslToHex(hue, saturation, lightness) {
    const h = (((Number(hue) || 0) % 360) + 360) % 360;
    const s = Math.max(0, Math.min(100, Number(saturation) || 0)) / 100;
    const l = Math.max(0, Math.min(100, Number(lightness) || 0)) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    const [r, g, b] = h < 60 ? [c, x, 0]
        : h < 120 ? [x, c, 0]
        : h < 180 ? [0, c, x]
        : h < 240 ? [0, x, c]
        : h < 300 ? [x, 0, c]
        : [c, 0, x];
    return `#${[r, g, b]
        .map(channel => Math.round((channel + m) * 255).toString(16).padStart(2, '0'))
        .join('')}`;
}

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
            width: CONFIG_APP_DEFAULT_POSITION.width,
            height: CONFIG_APP_DEFAULT_POSITION.height
        },
        actions: {
            selectLayout: FlavorConfigApp.#onSelectLayout,
            save: FlavorConfigApp.#onSave,
            reset: FlavorConfigApp.#onReset,
            factoryReset: FlavorConfigApp.#onFactoryReset,
            resetArea: FlavorConfigApp.#onResetArea,
            resetFoundryStock: FlavorConfigApp.#onResetFoundryStock,
            test: FlavorConfigApp.#onTest,
            close: FlavorConfigApp.#onClose,
            toggleAdvanced: FlavorConfigApp.#onToggleAdvanced,
            exportVisual: FlavorConfigApp.#onExportVisual,
            importVisual: FlavorConfigApp.#onImportVisual,
            exportConfig: FlavorConfigApp.#onExport,
            importConfig: FlavorConfigApp.#onImport,
            exportUserPreset: FlavorConfigApp.#onExportUserPreset,
            importUserPreset: FlavorConfigApp.#onImportUserPreset,
            toggleFavorite: FlavorConfigApp.#onToggleFavorite,
            resetChatToken: FlavorConfigApp.#onResetChatToken,
            resetRollToken: FlavorConfigApp.#onResetRollToken,
            resetCardToken: FlavorConfigApp.#onResetCardToken,
            randomizeChat: FlavorConfigApp.#onRandomizeChat,
            switchPreviewFixture: FlavorConfigApp.#onSwitchPreviewFixture,
            switchFoundryPreviewArea: FlavorConfigApp.#onSwitchFoundryPreviewArea,
            switchFoundrySection: FlavorConfigApp.#onSwitchFoundrySection,
            switchTab: FlavorConfigApp.#onSwitchTab,
            browsePauseAsset: FlavorConfigApp.#onBrowsePauseAsset,
            uploadPauseAsset: FlavorConfigApp.#onUploadPauseAsset,
            clearPauseAsset: FlavorConfigApp.#onClearPauseAsset,
            toggleArrangeMode: FlavorConfigApp.#onToggleArrangeMode,
            resetFoundryComponent: FlavorConfigApp.#onResetFoundryComponent,
            applyThemePreset: FlavorConfigApp.#onApplyThemePreset,
            applySidebarTransformer: FlavorConfigApp.#onApplySidebarTransformer,
            applyChatLogTransformer: FlavorConfigApp.#onApplyChatLogTransformer,
            browseComponentBg: FlavorConfigApp.#onBrowseComponentBg,
            clearComponentBg: FlavorConfigApp.#onClearComponentBg,
            toggleIconSelectionMode: FlavorConfigApp.#onToggleIconSelectionMode,
            selectIconPreview: FlavorConfigApp.#onSelectIconPreview,
            switchIconArea: FlavorConfigApp.#onSwitchIconArea,
            clearSelectedIcon: FlavorConfigApp.#onClearSelectedIcon,
            resetSelectedIconOverride: FlavorConfigApp.#onResetSelectedIconOverride,
            chooseIconClass: FlavorConfigApp.#onChooseIconClass
        }
    };

    static PARTS = {
        form: {
            id: 'form',
            template: `modules/${MODULE_ID}/templates/flavor-config.hbs`,
            scrollable: ['.yf-controls-scroll']
        }
    };

    static TEMPLATE_PARTIALS = [
        `modules/${MODULE_ID}/templates/parts/flavor-preview-panel.hbs`,
        `modules/${MODULE_ID}/templates/parts/flavor-overview-tab.hbs`,
        `modules/${MODULE_ID}/templates/parts/flavor-foundry-tab.hbs`,
        `modules/${MODULE_ID}/templates/parts/flavor-chat-tab.hbs`,
        `modules/${MODULE_ID}/templates/parts/flavor-rolls-tab.hbs`,
        `modules/${MODULE_ID}/templates/parts/flavor-cards-tab.hbs`,
        `modules/${MODULE_ID}/templates/parts/flavor-icons-tab.hbs`,
        `modules/${MODULE_ID}/templates/parts/flavor-diagnostics-tab.hbs`,
        `modules/${MODULE_ID}/templates/parts/flavor-footer.hbs`
    ];

    static TAB_DEFINITIONS = [
        { id: 'overview', icon: 'fas fa-gauge-high', labelKey: 'YOUR_FLAVOR.Config.Tabs.Overview', scope: 'chat', preview: 'chat' },
        { id: 'chat', icon: 'fas fa-comment-dots', labelKey: 'YOUR_FLAVOR.Config.Tabs.ChatBasic', scope: 'chat', preview: 'chat', resetArea: 'chat' },
        { id: 'rolls', icon: 'fas fa-dice-d20', labelKey: 'YOUR_FLAVOR.Config.Tabs.Rolls', scope: 'chat', preview: 'chat', resetArea: 'rolls' },
        { id: 'cards', icon: 'fas fa-scroll', labelKey: 'YOUR_FLAVOR.Config.Tabs.Cards', scope: 'chat', preview: 'chat', resetArea: 'cards' },
        { id: 'foundry', icon: 'fas fa-wand-magic-sparkles', labelKey: 'YOUR_FLAVOR.Config.Tabs.FoundryShell', scope: 'foundry', preview: 'foundry', gmOnly: true, requiresFoundry: true, resetArea: 'foundry' },
        { id: 'icons', icon: 'fas fa-icons', labelKey: 'YOUR_FLAVOR.Config.Tabs.Icons', scope: 'foundry', preview: 'foundry', gmOnly: true, requiresFoundry: true, resetArea: 'icons' },
        { id: 'diagnostics', icon: 'fas fa-stethoscope', labelKey: 'YOUR_FLAVOR.Config.Tabs.Diagnostics', scope: 'chat', preview: 'chat', gmOnly: true }
    ];

    manager = null;
    foundryCustomizer = null;
    configStore = null;
    chatTab = null;
    foundryTab = null;
    previewController = null;
    _activeCategory = null;
    _activeTab = 'overview';
    _activePreviewFixtureId = null;
    _activeFoundryPreviewArea = 'navigation';
    _activeFoundrySection = 'overview';
    _activeIconArea = 'navigation';
    _activeIconPickerCategory = 'recommended';
    _shouldRevertFoundryOnClose = true;
    _shouldRevertChatPreviewOnClose = true;
    _iconSelectionActive = false;
    _dynamicIconEntries = null;
    _fontAwesomeIconAvailability = null;
    _randomizerConstraints = null;
    _pendingVisualSettings = null;
    _pendingVisualPresets = null;
    _colorPalettePopover = null;
    _activeColorPaletteInput = null;
    _activeColorPaletteTrigger = null;
    _boundColorPalettePointerDown = null;
    _boundColorPaletteKeydown = null;

    constructor(options = {}) {
        super(FlavorConfigApp._withReadableInitialPosition(options));
        this.manager = game.modules.get(MODULE_ID)?.api?.getManager() || new FlavorManager();
        this.foundryCustomizer = game.modules.get(MODULE_ID)?.api?.getFoundryCustomizer?.() || null;
        this.configStore = new FlavorConfigStore({
            manager: this.manager,
            foundryCustomizer: this.foundryCustomizer
        });
        this.chatTab = new FlavorChatTabController({
            manager: this.manager,
            localize: key => game.i18n.localize(key)
        });
        this.foundryTab = new FlavorFoundryTabController({
            localize: key => game.i18n.localize(key)
        });
        this.previewController = new FlavorPreviewController({ app: this });
        this._dynamicIconEntries = new Map();
        this._boundColorPalettePointerDown = event => this._onColorPalettePointerDown(event);
        this._boundColorPaletteKeydown = event => this._onColorPaletteKeydown(event);
    }

    static _withReadableInitialPosition(options = {}) {
        const position = options.position ?? {};
        const readablePosition = FlavorConfigApp._getReadablePosition(position);
        return {
            ...options,
            position: {
                ...position,
                ...readablePosition
            }
        };
    }

    static _getReadablePosition(position = {}, minimumPosition = CONFIG_APP_MIN_POSITION) {
        const viewportWidth = Number(globalThis.innerWidth) || CONFIG_APP_DEFAULT_POSITION.width;
        const viewportHeight = Number(globalThis.innerHeight) || CONFIG_APP_DEFAULT_POSITION.height;
        const availableWidth = Math.max(280, viewportWidth - CONFIG_APP_VIEWPORT_MARGIN);
        const availableHeight = Math.max(320, viewportHeight - CONFIG_APP_VIEWPORT_MARGIN);
        const minimum = {
            ...CONFIG_APP_MIN_POSITION,
            ...(minimumPosition || {})
        };
        const minWidth = Math.min(minimum.width, availableWidth);
        const minHeight = Math.min(minimum.height, availableHeight);

        return {
            width: FlavorConfigApp._clampDimension(
                position.width,
                CONFIG_APP_DEFAULT_POSITION.width,
                minWidth,
                availableWidth
            ),
            height: FlavorConfigApp._clampDimension(
                position.height,
                CONFIG_APP_DEFAULT_POSITION.height,
                minHeight,
                availableHeight
            )
        };
    }

    static _clampDimension(value, fallback, min, max) {
        const numeric = Number(value);
        const base = Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
        return Math.round(Math.min(Math.max(base, min), max));
    }

    get _workingConfig() {
        return this.configStore.workingConfig;
    }

    set _workingConfig(value) {
        this.configStore.workingConfig = value;
    }

    get _savedConfigSnapshot() {
        return this.configStore.savedConfigSnapshot;
    }

    set _savedConfigSnapshot(value) {
        this.configStore.savedConfigSnapshot = value;
    }

    get _editingActorId() {
        return this.configStore.editingActorId;
    }

    set _editingActorId(value) {
        this.configStore.editingActorId = value;
    }

    get _workingFoundryConfig() {
        return this.configStore.workingFoundryConfig;
    }

    set _workingFoundryConfig(value) {
        this.configStore.workingFoundryConfig = value;
    }

    get _savedFoundryConfigSnapshot() {
        return this.configStore.savedFoundryConfigSnapshot;
    }

    set _savedFoundryConfigSnapshot(value) {
        this.configStore.savedFoundryConfigSnapshot = value;
    }

    /* -------------------------------------------- */
    /*  Rendering                                   */
    /* -------------------------------------------- */

    async _preFirstRender(context, options) {
        await super._preFirstRender(context, options);
        await preloadHandlebarsTemplates(FlavorConfigApp.TEMPLATE_PARTIALS);
        await this.configStore.initialize();
        this._activeTab = options?.tab || 'overview';
        if (!this._isTabAvailable(this._activeTab)) {
            this._activeTab = this._getDefaultTabId();
        }
        this._activePreviewFixtureId = null;
        this._activeFoundryPreviewArea = 'navigation';
        this._activeFoundrySection = 'overview';
        this._activeIconArea = 'navigation';
        this._activeIconPickerCategory = 'recommended';
        this._shouldRevertFoundryOnClose = true;
        this._shouldRevertChatPreviewOnClose = true;
        this._iconSelectionActive = false;
        this._dynamicIconEntries = new Map();
        this._fontAwesomeIconAvailability = new Map();
        this._activeCategory = null;
        this._randomizerConstraints = normalizeChatRandomizerConstraints();
        this._pendingVisualSettings = null;
        this._pendingVisualPresets = null;
    }

    async _prepareContext(options) {
        const config = this._workingConfig || this.manager.getCurrentConfig();
        const isGM = game.user.isGM;
        const pendingVisualSettingCount = this._getPendingVisualSettingCount();
        const pendingVisualPresetCount = this._getPendingVisualPresetCount();
        const showFoundryTab = this._canShowFoundryTabs({ isGM });
        const dirtyAreas = this.configStore.getDirtyAreas();
        if (pendingVisualSettingCount > 0 || pendingVisualPresetCount > 0) dirtyAreas.overview = true;
        let tabs = this._buildAvailableTabs({ isGM, showFoundryTab, dirtyAreas });
        if (!tabs.some(tab => tab.id === this._activeTab)) {
            this._activeTab = tabs[0]?.id || 'overview';
            tabs = this._buildAvailableTabs({ isGM, showFoundryTab, dirtyAreas });
        }
        const dirtyAreaCount = this._countDirtyTabs(tabs) + (pendingVisualSettingCount > 0 || pendingVisualPresetCount > 0 ? 1 : 0);
        const hasDirtyAreas = dirtyAreaCount > 0;
        const activeTabContext = tabs.find(tab => tab.id === this._activeTab) || tabs[0] || null;
        const activeAreaReset = activeTabContext?.canReset
            ? {
                area: activeTabContext.resetArea,
                label: activeTabContext.label,
                title: activeTabContext.resetTitle
            }
            : null;
        const activeConfigScope = this._getActiveConfigScope();
        const previewMode = this._getActivePreviewMode();

        const foundryConfig = this.configStore.normalizeFoundryConfig(this._workingFoundryConfig);
        this._workingFoundryConfig = foundryConfig;
        this.foundryCustomizer?.updateArrangeModeConfig?.(this._workingFoundryConfig);
        const viewportWidth = globalThis.innerWidth || 1920;
        const viewportHeight = globalThis.innerHeight || 1080;

        const allowPlayerCustomization = game.settings.get(MODULE_ID, 'allowPlayerCustomization');
        const forcedLayout = game.settings.get(MODULE_ID, 'forcePlayerLayout');
        const canCustomize = isGM || allowPlayerCustomization;
        const hasForcedLayout = !isGM && forcedLayout && forcedLayout !== 'none';

        const backgroundColorHex = this.chatTab.toBackgroundColorInput(config);

        let forcedLayoutName = '';
        if (hasForcedLayout) {
            const presetInfo = getChatPreset(forcedLayout);
            forcedLayoutName = presetInfo?.name
                ? game.i18n.localize(presetInfo.name)
                : forcedLayout;
        }

        const favorites = this.manager.getFavorites();
        const layouts = getChatPresetChoices({ favorites }).map(preset => ({
            ...preset,
            isEdited: preset.id === config.layout && this.chatTab.isPresetEdited(config, preset.id),
            editedTitle: game.i18n.localize('YOUR_FLAVOR.Config.Presets.EditedTitle')
        }));

        const ownedActors = game.actors
            .filter(a => a.isOwner && a.type === 'character')
            .map(a => ({ id: a.id, name: a.name, img: a.img }));

        let previewName = game.user.name;
        let previewAvatar = game.user.avatar || 'icons/svg/mystery-man.svg';
        if (this._editingActorId) {
            const actor = game.actors.get(this._editingActorId);
            if (actor) {
                previewName = actor.name;
                previewAvatar = actor.img || previewAvatar;
            }
        }
        const previewFixtureContext = {
            speakerName: previewName,
            speakerAvatar: previewAvatar,
            timestamp: game.i18n.localize('YOUR_FLAVOR.Config.PreviewTime'),
            localize: key => game.i18n.localize(key)
        };
        const rawPreviewFixtures = createPreviewFixtures(previewFixtureContext);
        let previewFixture = rawPreviewFixtures.find(fixture => fixture.id === this._activePreviewFixtureId)
            ?? getDefaultPreviewFixture(previewFixtureContext);
        if (!previewFixture && rawPreviewFixtures.length > 0) {
            previewFixture = rawPreviewFixtures[0];
        }
        this._activePreviewFixtureId = previewFixture?.id ?? null;
        const previewFixtureGroupLabels = this._getPreviewFixtureGroupLabels();
        const previewFixtures = rawPreviewFixtures.map(fixture => ({
            ...fixture,
            groupLabel: previewFixtureGroupLabels[fixture.group] ?? fixture.group,
            isActive: fixture.id === this._activePreviewFixtureId,
            messageClassString: fixture.messageClasses.join(' ')
        }));
        if (previewFixture) {
            previewFixture = {
                ...previewFixture,
                groupLabel: previewFixtureGroupLabels[previewFixture.group] ?? previewFixture.group,
                isActive: true,
                messageClassString: previewFixture.messageClasses.join(' ')
            };
        }
        const savedConfig = this._savedConfigSnapshot || foundry.utils.deepClone(config);
        const previewCompare = previewFixture
            ? {
                title: game.i18n.localize('YOUR_FLAVOR.Config.PreviewCompare'),
                beforeLabel: game.i18n.localize('YOUR_FLAVOR.Config.PreviewBefore'),
                afterLabel: game.i18n.localize('YOUR_FLAVOR.Config.PreviewAfter'),
                beforeLayout: savedConfig?.layout ?? 'none',
                afterLayout: config?.layout ?? 'none',
                fixture: previewFixture
            }
            : null;
        const rollTabs = this._buildRollTabsContext(config);
        const cardTabs = this._buildCardTabsContext(config);

        const foundryComponents = this.foundryTab.buildComponents(foundryConfig, {
            width: viewportWidth,
            height: viewportHeight
        });
        const foundryAreas = this.foundryTab.buildAreas(foundryConfig);

        const savedFoundryConfig = this.configStore.normalizeFoundryConfig(this._savedFoundryConfigSnapshot);
        this._activeIconArea = this._normalizeIconAreaId(this._activeIconArea);
        if (this._activeTab === 'icons') {
            this._activeFoundryPreviewArea = this._activeIconArea;
        }
        this._activeFoundryPreviewArea = this.previewController.normalizeFoundryPreviewAreaId(this._activeFoundryPreviewArea);
        const foundryPreviewAreas = this.previewController.buildFoundryPreviewAreas(
            savedFoundryConfig,
            foundryConfig,
            this._activeFoundryPreviewArea
        );
        const foundryActivePreviewArea = foundryPreviewAreas.find(area => area.isActive) ?? foundryPreviewAreas[0] ?? null;
        const foundryPreviewBefore = this.previewController.buildFoundryPreviewContext(savedFoundryConfig, 'before');
        const foundryPreviewAfter = this.previewController.buildFoundryPreviewContext(foundryConfig, 'after');
        const foundryPreviewStyle = foundryPreviewAfter.style;
        const foundryPreviewChanges = this.previewController.buildFoundryPreviewChanges(savedFoundryConfig, foundryConfig);
        const foundryAreaPreviewBefore = this.previewController.buildFoundryAreaPreviewContext(
            savedFoundryConfig,
            foundryActivePreviewArea?.id,
            'before'
        );
        const foundryAreaPreviewAfter = this.previewController.buildFoundryAreaPreviewContext(
            foundryConfig,
            foundryActivePreviewArea?.id,
            'after'
        );
        const foundryAreaPreviewChanges = this.previewController.buildFoundryAreaPreviewChanges(
            savedFoundryConfig,
            foundryConfig,
            foundryActivePreviewArea?.id
        );

        const foundryCategories = FOUNDRY_CATEGORIES.map(cat => ({
            ...cat,
            label: game.i18n.localize(cat.labelKey),
            enabled: foundryConfig.categories?.[cat.id] !== false
        }));
        const foundryThemeFields = this.foundryTab.buildThemeFields(foundryConfig);
        this._activeFoundrySection = this.foundryTab.normalizeSectionId(this._activeFoundrySection, foundryConfig);
        const foundrySections = this.foundryTab.buildSections(foundryConfig, this._activeFoundrySection);
        const foundryAreaPages = this.foundryTab.buildAreaPages(
            foundryConfig,
            {
                width: viewportWidth,
                height: viewportHeight
            },
            this._activeFoundrySection
        );
        const foundryActiveAreaPage = foundryAreaPages.find(page => page.isActive) ?? null;

        const themePresets = FOUNDRY_THEME_PRESETS.map(preset => ({
            ...preset,
            label: game.i18n.localize(preset.labelKey)
        }));

        return {
            config,
            tokenStates: this.chatTab.buildTokenStates(config),
            foundryConfig,
            layouts,
            fonts: GOOGLE_FONTS,
            foundryFonts: GOOGLE_FONTS,
            playerName: previewName,
            playerAvatar: previewAvatar,
            previewFixture,
            previewFixtures,
            previewCompare,
            rollTabs,
            cardTabs,
            showCustomization: config.layout !== 'none',
            allowCustomHtml: game.user.isGM || game.settings.get(MODULE_ID, 'allowCustomHtml'),
            backgroundColorHex,
            isGM,
            canCustomize,
            hasForcedLayout,
            forcedLayout,
            forcedLayoutName,
            activeCategory: this._activeCategory,
            randomizer: this._buildChatRandomizerContext(),
            ownedActors,
            editingActorId: this._editingActorId,
            hasActors: ownedActors.length > 0,
            hasFavorites: favorites.length > 0,
            activeTab: this._activeTab,
            activeConfigScope,
            previewMode,
            tabs,
            dirtyAreas,
            dirtyAreaCount,
            hasDirtyAreas,
            activeAreaReset,
            activeAreaCanReset: Boolean(activeAreaReset),
            showFoundryTab,
            overview: this._buildOverviewContext({
                config,
                foundryConfig,
                previewFixtures,
                playerName: previewName,
                isGM,
                showFoundryTab,
                dirtyAreaCount,
                hasDirtyAreas,
                pendingVisualSettingCount,
                pendingVisualPresetCount
            }),
            diagnostics: this._buildDiagnosticsContext({ isGM, showFoundryTab }),
            icons: this._buildIconsContext({ isGM, showFoundryTab }),
            arrangeModeActive: this.foundryCustomizer?.isArrangeModeActive?.() ?? false,
            foundryAreas,
            foundryComponents,
            foundryPreviewStyle,
            foundryPreviewBefore,
            foundryPreviewAfter,
            foundryPreviewChanges,
            foundryPreviewAreas,
            foundryActivePreviewArea,
            foundryAreaPreviewBefore,
            foundryAreaPreviewAfter,
            foundryAreaPreviewChanges,
            foundryCategories,
            foundryThemeFields,
            foundrySections,
            foundryAreaPages,
            foundryActiveAreaPage,
            activeFoundrySection: this._activeFoundrySection,
            themePresets,
            pauseEffects: PAUSE_EFFECTS.map(effect => ({
                ...effect,
                label: game.i18n.localize(effect.labelKey)
            })),
            pauseVisualModes: PAUSE_VISUAL_MODES.map(mode => ({
                ...mode,
                label: game.i18n.localize(mode.labelKey)
            })),
            pauseMotionModes: PAUSE_MOTION_MODES.map(mode => ({
                ...mode,
                label: game.i18n.localize(mode.labelKey)
            })),
            pauseLabelPlacements: PAUSE_LABEL_PLACEMENTS.map(placement => ({
                ...placement,
                label: game.i18n.localize(placement.labelKey)
            })),
            pauseSymbolFilters: PAUSE_SYMBOL_FILTERS.map(filter => ({
                ...filter,
                label: game.i18n.localize(filter.labelKey)
            })),
            pauseBlendModes: PAUSE_BLEND_MODES.map(mode => ({
                ...mode,
                label: game.i18n.localize(mode.labelKey)
            })),
            pauseBarShapes: PAUSE_BAR_SHAPES.map(shape => ({
                ...shape,
                label: game.i18n.localize(shape.labelKey)
            })),
            pauseLabelWeights: PAUSE_LABEL_WEIGHTS,
            pausePreviewClass: this.previewController.getPausePreviewClass(foundryConfig.pause),
            pausePreviewLabel: this.previewController.getPausePreviewLabel(foundryConfig.pause),
            borderStyles: [] // Unused at top level, per-component options in foundryComponents
        };
    }

    _onRender(context, options) {
        super._onRender(context, options);

        const html = this.element;

        const uiScale = game.settings.get(MODULE_ID, 'uiScale');
        this.element.style.setProperty('--yf-ui-scale', uiScale / 100);

        this._syncPreviewChatWidth();
        this._ensureReadableWindowSize();
        this._registerLocalHelpers();
        this._setupEventListeners(html);

        if (this._activeTab === 'chat' && this._activeCategory) {
            this._filterLayoutsByCategory(this._activeCategory);
        }

        this._updatePreview();
        this._updateContrastDiagnostics();
        this._syncIconSelectionMode();
    }

    _ensureReadableWindowSize() {
        if (typeof this.setPosition !== 'function') return;

        const currentPosition = {
            width: this.position?.width ?? this.element?.offsetWidth,
            height: this.position?.height ?? this.element?.offsetHeight
        };
        const readablePosition = FlavorConfigApp._getReadablePosition(
            currentPosition,
            this._getMinimumPositionForCurrentView()
        );
        const currentWidth = Math.round(Number(currentPosition.width) || 0);
        const currentHeight = Math.round(Number(currentPosition.height) || 0);
        const nextPosition = {};

        if (currentWidth < readablePosition.width) nextPosition.width = readablePosition.width;
        if (currentHeight < readablePosition.height) nextPosition.height = readablePosition.height;
        if (!Object.keys(nextPosition).length) {
            return;
        }

        this.setPosition(nextPosition);
    }

    _getMinimumPositionForCurrentView() {
        const previewMode = this._getActivePreviewMode();
        if (previewMode === 'foundry' && this._activeFoundryPreviewArea === 'navigation') {
            return CONFIG_APP_SCENE_NAVIGATION_POSITION;
        }

        return CONFIG_APP_MIN_POSITION;
    }

    _syncPreviewChatWidth() {
        const chatWidth = this._getCurrentChatLogWidth();
        const previewWidth = FlavorConfigApp._clampDimension(
            chatWidth,
            CHAT_PREVIEW_WIDTH.fallback,
            CHAT_PREVIEW_WIDTH.min,
            CHAT_PREVIEW_WIDTH.max
        );
        this.element.style.setProperty('--yf-preview-chat-width', `${previewWidth}px`);
    }

    _getCurrentChatLogWidth() {
        const selectors = ['#chat-log', '#chat', '.chat-sidebar', '#sidebar'];
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            const width = element?.getBoundingClientRect?.().width;
            if (Number.isFinite(width) && width >= CHAT_PREVIEW_WIDTH.min) {
                return width;
            }
        }
        return CHAT_PREVIEW_WIDTH.fallback;
    }

    async close(options = {}) {
        this._closeColorPalette({ restoreFocus: false });
        this.foundryCustomizer?.disableArrangeMode?.();
        this._disableIconSelectionMode({ silent: true });
        if (this._shouldRevertFoundryOnClose && this.foundryCustomizer) {
            if (
                typeof this.foundryCustomizer.clearPreview === 'function'
                && this.foundryCustomizer.isPreviewActive?.()
            ) {
                this.foundryCustomizer.clearPreview();
            } else {
                this.foundryCustomizer.applyConfig(this._savedFoundryConfigSnapshot);
            }
        } else if (typeof this.foundryCustomizer?.commitPreview === 'function') {
            this.foundryCustomizer.commitPreview(this._workingFoundryConfig);
        }
        if (this._shouldRevertChatPreviewOnClose) {
            this._clearChatLogPreview();
        } else {
            this._commitChatLogPreview();
        }
        return super.close(options);
    }

    /* -------------------------------------------- */
    /*  Event Handlers                              */
    /* -------------------------------------------- */

    _setupEventListeners(html) {
        const actorSelect = html.querySelector('.yf-actor-select');
        if (actorSelect) {
            actorSelect.addEventListener('change', (e) => this._onActorChange(e));
        }

        html.querySelectorAll('.yf-layout-option').forEach(el => {
            el.addEventListener('click', (e) => this._onLayoutClick(e));
        });

        html.querySelectorAll('.yf-preview-card[data-action="switchPreviewFixture"]').forEach(el => {
            el.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                this._switchPreviewFixture(el.dataset.fixture);
            });
        });

        html.querySelectorAll('.yf-tag').forEach(el => {
            el.addEventListener('click', (e) => this._onTagClick(e));
        });

        html.querySelectorAll('.yf-randomizer-constraint').forEach(el => {
            el.addEventListener('change', () => this._syncChatRandomizerConstraintsFromDom());
        });

        html.querySelectorAll('input, select, textarea').forEach(el => {
            el.addEventListener('change', (e) => this._onInputChange(e));
            if (el.type === 'range') {
                el.addEventListener('input', (e) => this._onRangeInput(e));
            } else if (el.type === 'color' || el.classList.contains('yf-live-input')) {
                el.addEventListener('input', (e) => this._onInputChange(e));
            }
        });

        this._setupColorPaletteControls(html);

        html.querySelectorAll('[data-icon-picker-search]').forEach(el => {
            el.addEventListener('input', (e) => this._filterIconPicker(e.currentTarget));
        });

        html.querySelectorAll('[data-icon-picker-category]').forEach(el => {
            el.addEventListener('change', (e) => this._onIconPickerCategoryChange(e.currentTarget));
        });

        html.querySelectorAll('[data-icon-picker-control]').forEach(el => {
            this._filterIconPickerControl(el);
        });
    }

    _onActorChange(event) {
        const actorId = event.currentTarget.value || null;
        this.configStore.selectActor(actorId);
        this.render();
    }

    _onTagClick(event) {
        event.preventDefault();
        const tag = event.currentTarget;
        const category = tag.dataset.category;

        if (this._activeCategory === category) {
            this._activeCategory = null;
        } else {
            this._activeCategory = category;
        }

        this.element.querySelectorAll('.yf-tag').forEach(t => {
            t.classList.toggle('active', t.dataset.category === this._activeCategory);
        });

        this._filterLayoutsByCategory(this._activeCategory);
    }

    _filterLayoutsByCategory(category) {
        this.chatTab.filterLayoutsByCategory(this.element, category);
    }

    _onLayoutClick(event) {
        const layoutId = event.currentTarget.dataset.layout;
        if (!layoutId) return;

        this.element.querySelectorAll('.yf-layout-option').forEach(el => {
            el.classList.toggle('selected', el.dataset.layout === layoutId);
        });

        this.chatTab.applyPreset(this._workingConfig, layoutId);

        this.render();
    }

    _onInputChange(event) {
        const input = event.currentTarget;
        const name = input.name;
        if (!name) return;

        let value = input.type === 'checkbox' ? input.checked : input.value;

        if (input.type === 'range' || input.type === 'number') {
            value = parseFloat(value);
        }

        if (name.startsWith('iconOverride.')) {
            const field = name.replace(/^iconOverride\./, '');
            if (!this._setSelectedIconOverrideField(field, value)) return;

            this._markFoundryFieldOverride('icons.overrides');
            this._applyWorkingFoundryConfig();
            this._syncIconPreviewPaletteDom();
            this._syncDirtyIndicators();
            if (field === 'inheritGroup' || field === 'hidden') this.render();
            return;
        }

        if (name.startsWith('foundry.')) {
            const foundryPath = name.replace(/^foundry\./, '');
            this._setNestedProperty(this._workingFoundryConfig, foundryPath, value);
            if (input.dataset.nullableColor === 'true') {
                this._setNullableColorDomState(input, false);
            }
            if (foundryPath === 'enabled') {
                this._syncFoundryFeatureSettingDraft(value);
            } else {
                this._updateFoundryFieldOverride(foundryPath, value);
                this._enableFoundryCategoryForPath(foundryPath);
            }
            const layoutComponentId = foundryPath.match(/^layout\.([^.]+)\./)?.[1];
            if (layoutComponentId) {
                this.foundryCustomizer?.forgetLayoutMeasurement?.(layoutComponentId);
            }
            if (foundryPath.startsWith('hotbar.')) {
                this._workingFoundryConfig.hotbar = normalizeHotbarConfig(this._workingFoundryConfig.hotbar);
                this.foundryCustomizer?.forgetLayoutMeasurement?.('hotbar');
            }
            if (foundryPath.startsWith('sidebar.')) {
                this._workingFoundryConfig.sidebar = normalizeSidebarConfig(this._workingFoundryConfig.sidebar);
                this.foundryCustomizer?.forgetLayoutMeasurement?.('sidebar');
            }
            if (foundryPath.startsWith('chatLog.')) {
                this._workingFoundryConfig.chatLog = normalizeChatLogConfig(this._workingFoundryConfig.chatLog);
            }
            if (foundryPath.startsWith('playersList.')) {
                this._workingFoundryConfig.playersList = normalizePlayersListConfig(this._workingFoundryConfig.playersList);
                this._workingFoundryConfig.areas ||= {};
                this._workingFoundryConfig.areas.players ||= {};
                this._workingFoundryConfig.areas.players.playersList = foundry.utils.deepClone(this._workingFoundryConfig.playersList);
            }
            if (foundryPath.startsWith('windows.')) {
                this._workingFoundryConfig.windows = normalizeWindowsConfig(this._workingFoundryConfig.windows);
                this._workingFoundryConfig.areas ||= {};
                this._workingFoundryConfig.areas.windows ||= {};
                this._workingFoundryConfig.areas.windows.windows = foundry.utils.deepClone(this._workingFoundryConfig.windows);
            }
            this._applyWorkingFoundryConfig();
            this._updateContrastDiagnostics();
            this._syncDirtyIndicators();

            if (foundryPath.startsWith('icons.groups.') && event.type === 'change') {
                this.render();
            } else if (foundryPath.startsWith('icons.groups.')) {
                this._syncIconPreviewPaletteDom();
            }

            if (
                foundryPath === 'enabled'
                || foundryPath === 'hotbar.anchor'
                || foundryPath === 'pause.enabled'
                || foundryPath === 'pause.assetPath'
                || foundryPath === 'pause.visualMode'
                || foundryPath === 'pause.motion'
                || foundryPath === 'pause.labelPlacement'
                || foundryPath.startsWith('categories.')
            ) {
                this.render();
            }
            return;
        }

        if (name === 'customizations.backgroundColor') {
            const opacity = this._workingConfig.customizations?.backgroundOpacity ?? 95;
            value = this.chatTab.colorInputToRgba(value, opacity);
        }

        this._setNestedProperty(this._workingConfig, name, value);
        this._updatePreview();
        this._updateContrastDiagnostics();
        this._syncDirtyIndicators();

        if (name === 'customizations.glowEnabled') {
            this.render();
        }
    }

    _onRangeInput(event) {
        const input = event.currentTarget;
        const valueDisplay = input.parentElement.querySelector('.yf-range-value');
        if (valueDisplay) {
            let suffix = input.dataset.unit || 'px';
            if (input.name.includes('Opacity') || input.name.includes('opacity') || input.name.includes('scale') || input.name.includes('Strength') || input.name.includes('strength')) {
                suffix = '%';
            }
            valueDisplay.textContent = `${input.value}${suffix}`;
        }
        this._onInputChange(event);
    }

    _filterIconPicker(input) {
        const picker = input?.closest?.('.yf-icon-picker-control');
        this._filterIconPickerControl(picker);
    }

    _onIconPickerCategoryChange(input) {
        this._activeIconPickerCategory = this._normalizeIconPickerCategoryId(input?.value);
        this._filterIconPickerControl(input?.closest?.('.yf-icon-picker-control'));
    }

    _filterIconPickerControl(picker) {
        if (!picker) return;

        const searchInput = picker.querySelector('[data-icon-picker-search]');
        const categoryInput = picker.querySelector('[data-icon-picker-category]');
        const query = String(searchInput?.value || '').trim().toLowerCase();
        const categoryId = this._normalizeIconPickerCategoryId(categoryInput?.value);
        const choices = Array.from(picker.querySelectorAll('[data-icon-picker-choice]'));
        let visibleCount = 0;

        choices.forEach(choice => {
            const haystack = choice.dataset.iconSearch || '';
            const matchesSearch = !query || haystack.includes(query);
            const matchesCategory = query || this._iconPickerDomChoiceMatchesCategory(choice, categoryId);
            const visible = matchesSearch && matchesCategory;
            choice.hidden = !visible;
            if (visible) visibleCount += 1;
        });

        const count = picker.querySelector('[data-icon-picker-result-count]');
        if (count) {
            count.textContent = this._formatI18n('YOUR_FLAVOR.Config.IconTabs.IconPickerResults', {
                shown: visibleCount,
                total: choices.length
            });
        }

        const empty = picker.querySelector('[data-icon-picker-empty]');
        if (empty) empty.hidden = visibleCount > 0;
    }

    _iconPickerDomChoiceMatchesCategory(choice, categoryId) {
        if (categoryId === 'all') return true;
        if (categoryId === 'recommended') {
            return choice.dataset.iconRecommended === 'true' || choice.classList.contains('is-selected');
        }
        return choice.dataset.iconCategory === categoryId;
    }

    _setupColorPaletteControls(html) {
        html.querySelectorAll('input[type="color"].yf-color-swatch').forEach(input => {
            const host = input.closest('.yf-token-color-control, .yf-color-chip') || input.parentElement;
            if (!host) return;
            const nullable = input.dataset.nullableColor === 'true';
            const stock = nullable && input.dataset.stock === 'true';

            host.classList.add('yf-color-palette-host');
            host.classList.toggle('is-stock', stock);
            input.classList.toggle('is-stock', stock);
            input.style.setProperty('--yf-color-current', this._normalizePaletteColor(input.value));

            let trigger = host.querySelector(':scope > .yf-color-palette-button');
            if (!trigger) {
                trigger = document.createElement('button');
                trigger.type = 'button';
                trigger.className = 'yf-color-palette-button';
                trigger.innerHTML = '<i class="fas fa-swatchbook" aria-hidden="true"></i>';
                input.insertAdjacentElement('afterend', trigger);
            }

            const title = this._localizeWithFallback(
                'YOUR_FLAVOR.Config.ColorPalette.Open',
                'Open color palette'
            );
            trigger.title = title;
            trigger.setAttribute('aria-label', title);
            trigger.disabled = Boolean(input.disabled);
            trigger.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                if (!input.disabled) this._openColorPalette(input, trigger);
            });

            if (nullable) {
                let clearButton = host.querySelector(':scope > .yf-color-clear-button');
                if (!clearButton) {
                    clearButton = document.createElement('button');
                    clearButton.type = 'button';
                    clearButton.className = 'yf-color-clear-button';
                    clearButton.innerHTML = '<i class="fas fa-arrow-rotate-left" aria-hidden="true"></i>';
                    trigger.insertAdjacentElement('afterend', clearButton);
                }
                const clearTitle = input.dataset.clearTitle || this._localizeWithFallback(
                    'YOUR_FLAVOR.Config.Foundry.ClearColorOverride',
                    'Use stock color'
                );
                clearButton.title = clearTitle;
                clearButton.setAttribute('aria-label', clearTitle);
                clearButton.disabled = Boolean(input.disabled || stock);
                clearButton.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    this._clearNullableColorOverride(input);
                });
            }
        });
    }

    _openColorPalette(input, trigger) {
        if (this._activeColorPaletteInput === input && this._colorPalettePopover) {
            this._closeColorPalette({ restoreFocus: false });
            return;
        }

        this._closeColorPalette({ restoreFocus: false });
        this._activeColorPaletteInput = input;
        this._activeColorPaletteTrigger = trigger;

        const stock = this._isNullableColorStock(input);
        const currentColor = this._normalizePaletteColor(input.value);
        const popover = document.createElement('div');
        popover.className = 'yf-color-palette-popover';
        popover.setAttribute('role', 'dialog');
        popover.setAttribute('aria-label', this._localizeWithFallback(
            'YOUR_FLAVOR.Config.ColorPalette.Label',
            'Color palette'
        ));

        const toolbar = document.createElement('div');
        toolbar.className = 'yf-color-palette-toolbar';

        const current = document.createElement('span');
        current.className = 'yf-color-palette-current';
        current.classList.toggle('is-stock', stock);
        current.style.setProperty('--yf-current-color', currentColor);

        const code = document.createElement('span');
        code.className = 'yf-color-palette-code';
        code.textContent = stock
            ? (input.dataset.stockLabel || this._localizeWithFallback('YOUR_FLAVOR.Config.Foundry.StockInheritColor', 'Stock/Inherit'))
            : currentColor.toUpperCase();

        const nativeButton = document.createElement('button');
        nativeButton.type = 'button';
        nativeButton.className = 'yf-color-palette-native';
        nativeButton.innerHTML = '<i class="fas fa-eye-dropper" aria-hidden="true"></i>';
        nativeButton.title = this._localizeWithFallback(
            'YOUR_FLAVOR.Config.ColorPalette.Custom',
            'Custom color'
        );
        nativeButton.setAttribute('aria-label', nativeButton.title);
        nativeButton.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            input.focus();
            input.click();
            this._closeColorPalette({ restoreFocus: false });
        });

        toolbar.append(current, code, nativeButton);
        popover.append(toolbar, this._buildColorPaletteGrid(currentColor));
        document.body.appendChild(popover);

        this._colorPalettePopover = popover;
        this._positionColorPalette(popover, trigger);
        window.setTimeout(() => {
            document.addEventListener('pointerdown', this._boundColorPalettePointerDown, true);
            document.addEventListener('keydown', this._boundColorPaletteKeydown, true);
        }, 0);
    }

    _buildColorPaletteGrid(currentColor) {
        const grid = document.createElement('div');
        grid.className = 'yf-color-palette-grid';

        QUICK_COLOR_PALETTE.forEach(color => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `yf-color-preset${color === currentColor ? ' is-selected' : ''}`;
            button.style.setProperty('--yf-color-preset', color);
            button.dataset.color = color;
            button.title = color.toUpperCase();
            button.setAttribute('aria-label', color.toUpperCase());
            button.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                this._applyColorPreset(color);
            });
            grid.appendChild(button);
        });

        return grid;
    }

    _positionColorPalette(popover, trigger) {
        const triggerRect = trigger.getBoundingClientRect();
        const viewportWidth = Number(globalThis.innerWidth) || 1280;
        const viewportHeight = Number(globalThis.innerHeight) || 720;
        const margin = 12;
        const width = Math.min(372, viewportWidth - margin * 2);

        popover.style.width = `${width}px`;
        popover.style.left = `${Math.max(margin, Math.min(triggerRect.left, viewportWidth - width - margin))}px`;
        popover.style.top = `${Math.min(triggerRect.bottom + 8, viewportHeight - margin)}px`;

        const popoverRect = popover.getBoundingClientRect();
        const top = popoverRect.bottom > viewportHeight - margin
            ? Math.max(margin, triggerRect.top - popoverRect.height - 8)
            : triggerRect.bottom + 8;
        popover.style.top = `${top}px`;
    }

    _applyColorPreset(color) {
        const input = this._activeColorPaletteInput;
        if (!input || input.disabled) return;

        const normalizedColor = this._normalizePaletteColor(color);
        input.value = normalizedColor;
        this._setNullableColorDomState(input, false);
        input.style.setProperty('--yf-color-current', normalizedColor);
        input.dispatchEvent(new Event('change', { bubbles: true }));
        this._closeColorPalette({ restoreFocus: true });
    }

    _clearNullableColorOverride(input) {
        if (!input || input.dataset.nullableColor !== 'true' || input.disabled) return;
        const name = input.name || '';
        if (!name.startsWith('foundry.')) return;

        const foundryPath = name.replace(/^foundry\./, '');
        const stockValue = this._getNullableFoundryStockValue(foundryPath);
        this._setNestedProperty(this._workingFoundryConfig, foundryPath, stockValue);
        this._clearFoundryFieldOverride(foundryPath);
        this._setNullableColorDomState(input, true);
        this._closeColorPalette({ restoreFocus: false });
        this._applyWorkingFoundryConfig();
        this._updateContrastDiagnostics();
        this._syncDirtyIndicators();
        this.render();
    }

    _setNullableColorDomState(input, stock) {
        if (!input || input.dataset.nullableColor !== 'true') return;
        input.dataset.stock = stock ? 'true' : 'false';
        input.classList.toggle('is-stock', stock);
        const host = input.closest('.yf-color-palette-host, .yf-color-chip') || input.parentElement;
        host?.classList.toggle('is-stock', stock);
        const clearButton = host?.querySelector(':scope > .yf-color-clear-button');
        if (clearButton) clearButton.disabled = Boolean(input.disabled || stock);
    }

    _isNullableColorStock(input) {
        return input?.dataset?.nullableColor === 'true' && input.dataset.stock === 'true';
    }

    _getNullableFoundryStockValue(foundryPath) {
        if (foundryPath.startsWith('theme.') || foundryPath.startsWith('pause.')) return null;
        return '';
    }

    _onColorPalettePointerDown(event) {
        if (
            this._colorPalettePopover?.contains(event.target)
            || this._activeColorPaletteTrigger?.contains(event.target)
            || this._activeColorPaletteInput?.contains(event.target)
        ) return;

        this._closeColorPalette({ restoreFocus: false });
    }

    _onColorPaletteKeydown(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            this._closeColorPalette({ restoreFocus: true });
        }
    }

    _closeColorPalette({ restoreFocus = false } = {}) {
        document.removeEventListener('pointerdown', this._boundColorPalettePointerDown, true);
        document.removeEventListener('keydown', this._boundColorPaletteKeydown, true);
        this._colorPalettePopover?.remove();
        this._colorPalettePopover = null;

        const trigger = this._activeColorPaletteTrigger;
        this._activeColorPaletteInput = null;
        this._activeColorPaletteTrigger = null;
        if (restoreFocus) trigger?.focus?.();
    }

    _normalizePaletteColor(value, fallback = '#000000') {
        const color = String(value || '').trim().toLowerCase();
        return /^#[0-9a-f]{6}$/.test(color) ? color : fallback;
    }

    _localizeWithFallback(key, fallback) {
        const localized = game.i18n.localize(key);
        return localized && localized !== key ? localized : fallback;
    }

    /* -------------------------------------------- */
    /*  Actions                                     */
    /* -------------------------------------------- */

    static async #onSelectLayout(event, target) {
        const layoutId = target.dataset.layout;
        if (layoutId) {
            this.chatTab.applyPreset(this._workingConfig, layoutId);
            this.render();
        }
    }

    static async #onSave(event, target) {
        try {
            if (this.foundryCustomizer?.isArrangeModeActive?.()) {
                this.foundryCustomizer.disableArrangeMode();
            }

            this._ensureFoundryFeatureSettingForSave();
            await this._savePendingVisualSettings();
            const dirtyAreas = this.configStore.getDirtyAreas();
            await this.configStore.save({
                saveFoundry: Boolean(game.user.isGM
                    && this.foundryCustomizer
                    && (
                        dirtyAreas.foundry
                        || dirtyAreas.icons
                        || game.settings.get(MODULE_ID, 'enableFoundryCustomization')
                        || this._pendingVisualSettings?.enableFoundryCustomization === true
                    ))
            });
            await this._savePendingVisualPresets();

            this._pendingVisualSettings = null;
            this._pendingVisualPresets = null;
            this.foundryCustomizer?.commitPreview?.(this._workingFoundryConfig);
            this._commitChatLogPreview();
            this._shouldRevertFoundryOnClose = true;
            this._shouldRevertChatPreviewOnClose = true;
            ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.Saved'));
            this.render();
        } catch (error) {
            console.error(`${MODULE_NAME} | Error saving configuration:`, error);
            ui.notifications.error(game.i18n.localize('YOUR_FLAVOR.Notifications.SaveError'));
        }
    }

    static async #onReset(event, target) {
        if (this._getActiveConfigScope() === 'foundry') {
            const confirmed = await confirmDialog({
                title: game.i18n.localize('YOUR_FLAVOR.Dialog.ResetFoundryTitle'),
                content: game.i18n.localize('YOUR_FLAVOR.Dialog.ResetFoundryContent'),
                defaultYes: false
            });

            if (confirmed) {
                await this.configStore.resetFoundry();
                this.render();
                ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.FoundryReset'));
            }
            return;
        }

        const confirmed = await confirmDialog({
            title: game.i18n.localize('YOUR_FLAVOR.Dialog.ResetTitle'),
            content: game.i18n.localize('YOUR_FLAVOR.Dialog.ResetContent'),
            defaultYes: false
        });

        if (confirmed) {
            this.configStore.resetChat();
            this._activeCategory = 'basic';
            this.render();
            ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.Reset'));
        }
    }

    static async #onFactoryReset(event, target) {
        if (!game.user.isGM) {
            ui.notifications.warn(game.i18n.localize('YOUR_FLAVOR.Notifications.FactoryResetGMOnly'));
            return;
        }

        const confirmed = await confirmDialog({
            title: game.i18n.localize('YOUR_FLAVOR.Dialog.FactoryResetTitle'),
            content: game.i18n.localize('YOUR_FLAVOR.Dialog.FactoryResetContent'),
            defaultYes: false
        });
        if (!confirmed) return;

        try {
            this._shouldRevertFoundryOnClose = false;
            this._shouldRevertChatPreviewOnClose = false;
            this._disableIconSelectionMode({ silent: true });
            this.foundryCustomizer?.disableArrangeMode?.();

            const api = game.modules.get(MODULE_ID)?.api;
            if (typeof api?.factoryReset !== 'function') {
                throw new Error('Your Flavor factory reset API is unavailable.');
            }

            await api.factoryReset();
            await this.configStore.initialize();
            this._activeTab = 'overview';
            this._activeCategory = null;
            this._activeFoundrySection = 'overview';
            this._activeFoundryPreviewArea = 'navigation';
            this._activeIconArea = 'navigation';
            this._dynamicIconEntries = new Map();
            this._fontAwesomeIconAvailability = new Map();

            ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.FactoryReset'));
            this.close();
        } catch (error) {
            console.error(`${MODULE_NAME} | Factory reset failed:`, error);
            ui.notifications.error(game.i18n.localize('YOUR_FLAVOR.Notifications.FactoryResetError'));
        }
    }

    static async #onResetFoundryStock(event, target) {
        if (!game.user.isGM || !this.foundryCustomizer) return;

        const confirmed = await confirmDialog({
            title: game.i18n.localize('YOUR_FLAVOR.Dialog.ResetFoundryStockTitle'),
            content: game.i18n.localize('YOUR_FLAVOR.Dialog.ResetFoundryStockContent'),
            defaultYes: false
        });
        if (!confirmed) return;

        try {
            this._closeColorPalette({ restoreFocus: false });
            this._disableIconSelectionMode({ silent: true });
            this.foundryCustomizer.disableArrangeMode?.();
            this.foundryCustomizer.forgetLayoutMeasurement?.();

            if (!game.settings.get(MODULE_ID, 'enableFoundryCustomization')) {
                await game.settings.set(MODULE_ID, 'enableFoundryCustomization', true);
            }
            await this.configStore.resetFoundryToStockEditingBaseline();
            this._activeFoundrySection = 'overview';
            this._activeFoundryPreviewArea = 'navigation';
            this._activeIconArea = 'navigation';
            this._dynamicIconEntries = new Map();
            this._shouldRevertFoundryOnClose = true;

            ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.FoundryStockReset'));
            this.render();
        } catch (error) {
            console.error(`${MODULE_NAME} | Error resetting Foundry Shell to stock:`, error);
            ui.notifications.error(game.i18n.localize('YOUR_FLAVOR.Notifications.FoundryResetError'));
        }
    }

    static async #onResetArea(event, target) {
        const areaId = target.dataset.area || this._activeTab;
        if (!this._canResetArea(areaId)) return;

        const areaLabel = this._getAreaLabel(areaId);
        const confirmed = await confirmDialog({
            title: this._formatI18n('YOUR_FLAVOR.Dialog.ResetAreaTitle', { area: areaLabel }),
            content: this._formatI18n('YOUR_FLAVOR.Dialog.ResetAreaContent', { area: areaLabel }),
            defaultYes: false
        });
        if (!confirmed) return;

        const reset = this._resetAreaDraft(areaId);
        if (!reset) return;

        ui.notifications.info(this._formatI18n('YOUR_FLAVOR.Notifications.AreaResetDraft', { area: areaLabel }));
        this.render();
    }

    static async #onTest(event, target) {
        if (this._getActiveConfigScope() === 'foundry') return;

        const previewId = foundry.utils.randomID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const api = game.modules.get(MODULE_ID)?.api;
        const forcedLayout = game.settings.get(MODULE_ID, 'forcePlayerLayout');
        const hasForcedLayout = !game.user.isGM && forcedLayout && forcedLayout !== 'none';
        const canUseDraftPreview = !hasForcedLayout && typeof api?.registerPreviewConfig === 'function';
        if (canUseDraftPreview) {
            api.registerPreviewConfig(previewId, this._workingConfig);
        }

        const testMessage = game.i18n.localize('YOUR_FLAVOR.Config.TestMessage');
        const messageData = {
            content: testMessage,
            speaker: ChatMessage.getSpeaker({ user: game.user })
        };
        if (canUseDraftPreview) {
            messageData.flags = {
                [MODULE_ID]: { previewId }
            };
        }

        try {
            await ChatMessage.create(messageData);
        } catch (error) {
            api?.clearPreviewConfig?.(previewId);
            console.error(`${MODULE_NAME} | Error creating test message:`, error);
            ui.notifications.error(game.i18n.localize('YOUR_FLAVOR.Notifications.TestError'));
        }
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

    static async #onExportVisual(event, target) {
        try {
            const includeFoundry = Boolean(game.user.isGM && this.foundryCustomizer);
            const exportData = buildVisualProfileExport({
                chatConfig: this._workingConfig,
                foundryConfig: includeFoundry ? this._workingFoundryConfig : null,
                favorites: this.manager.getFavorites(),
                userProfile: this.manager.getCurrentProfileV2?.(),
                worldProfile: includeFoundry ? this.foundryCustomizer?.getWorldProfileV2?.() : null,
                settings: this._getVisualSettingsSnapshot(),
                includeFoundry,
                meta: {
                    name: this._getVisualProfileName({ includeFoundry }),
                    author: game.user.name,
                    moduleVersion: game.modules.get(MODULE_ID)?.version ?? null,
                    foundryVersion: game.version || game.release?.version || null,
                    systemId: game.system?.id || null,
                    systemTitle: game.system?.title || game.system?.id || null
                }
            });
            this._downloadJson(exportData, slugifyVisualProfileFilename(exportData.meta.name));
            ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.VisualExported'));
        } catch (error) {
            console.error(`${MODULE_NAME} | Visual export failed:`, error);
            ui.notifications.error(game.i18n.localize('YOUR_FLAVOR.Notifications.VisualExportError'));
        }
    }

    static async #onImportVisual(event, target) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const permissions = this._getVisualImportPermissions();
                const visualProfile = parseVisualProfileExport(text, {
                    allowCustomHtml: permissions.allowCustomHtml
                });
                const importResult = applyVisualProfileToDraft({
                    visualProfile,
                    currentChatConfig: this._workingConfig,
                    currentFoundryConfig: this._workingFoundryConfig,
                    permissions
                });
                this._appendVisualImportDiagnostics(importResult);

                if (!Object.values(importResult.applied).some(Boolean)) {
                    ui.notifications.warn(game.i18n.localize('YOUR_FLAVOR.Notifications.VisualImportNoApplicableSections'));
                    return;
                }

                const confirmed = await confirmDialog({
                    title: game.i18n.localize('YOUR_FLAVOR.Dialog.ImportVisualTitle'),
                    content: this._buildVisualImportDialogContent(visualProfile, importResult),
                    defaultYes: false
                });
                if (!confirmed) return;

                if (importResult.chatConfig) {
                    this.configStore.importChatConfig(importResult.chatConfig);
                    this._activeCategory = null;
                    this._clearChatLogPreview();
                }
                if (importResult.foundryConfig) {
                    this._disableIconSelectionMode({ silent: true });
                    this.foundryCustomizer?.disableArrangeMode?.();
                    this.configStore.importFoundryConfig(importResult.foundryConfig);
                    this._workingFoundryConfig.icons = importResult.foundryConfig.icons;
                    this._applyWorkingFoundryConfig();
                }

                this._pendingVisualSettings = importResult.settings;
                this._pendingVisualPresets = importResult.presets;
                this._syncDirtyIndicators();
                this.render();
                ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.VisualImportedDraft'));
            } catch (error) {
                console.error(`${MODULE_NAME} | Visual import failed:`, error);
                ui.notifications.error(game.i18n.localize(this._getVisualImportErrorKey(error)));
            }
        });
        input.click();
    }

    static async #onToggleFavorite(event, target) {
        event.stopPropagation();
        const layoutId = target.closest('.yf-layout-option')?.dataset?.layout;
        if (!layoutId || layoutId === 'none') return;
        await this.manager.toggleFavorite(layoutId);
        this.render();
    }

    static async #onResetChatToken(event, target) {
        const tokenPath = target.dataset.token;
        if (!tokenPath?.startsWith('customizations.')) return;

        const tokenKey = tokenPath.replace(/^customizations\./, '');
        if (!this.chatTab.isCustomizationToken(tokenKey)) return;

        const resetValue = this.chatTab.getResetValue(tokenKey, this._workingConfig?.layout);
        this._setNestedProperty(this._workingConfig, tokenPath, foundry.utils.deepClone(resetValue));
        this.render();
    }

    static async #onResetRollToken(event, target) {
        const tokenPath = target.dataset.token;
        if (!tokenPath?.startsWith('rolls.')) return;

        this._setNestedProperty(this._workingConfig, tokenPath, null);
        this._updatePreview();
        this._syncDirtyIndicators();
        this.render();
    }

    static async #onResetCardToken(event, target) {
        const tokenPath = target.dataset.token;
        if (!tokenPath?.startsWith('cards.surfaces.')) return;

        this._setNestedProperty(this._workingConfig, tokenPath, null);
        this._updatePreview();
        this._syncDirtyIndicators();
        this.render();
    }

    static async #onRandomizeChat(event, target) {
        if (this._getActiveConfigScope() !== 'chat') return;

        const allowPlayerCustomization = game.settings.get(MODULE_ID, 'allowPlayerCustomization');
        const forcedLayout = game.settings.get(MODULE_ID, 'forcePlayerLayout');
        const hasForcedLayout = !game.user.isGM && forcedLayout && forcedLayout !== 'none';
        if ((!game.user.isGM && !allowPlayerCustomization) || hasForcedLayout) return;

        const favoriteIds = this.manager.getFavorites();
        const category = this._activeCategory || CHAT_RANDOMIZER_ANY;
        const result = randomizeChatDraft(this._workingConfig, {
            ...this._syncChatRandomizerConstraintsFromDom(),
            category,
            favoriteIds,
            excludePresetId: this._workingConfig?.layout ?? null
        });

        if (!result) {
            ui.notifications.warn(game.i18n.localize('YOUR_FLAVOR.Notifications.ChatRandomizerNoMatch'));
            return;
        }

        this._workingConfig = result.config;
        this._clearChatLogPreview();
        this.render();
        ui.notifications.info(this._formatI18n('YOUR_FLAVOR.Notifications.ChatRandomized', {
            preset: this._getChatPresetLabel(result.presetId)
        }));
    }

    static async #onSwitchPreviewFixture(event, target) {
        const fixtureId = target?.dataset?.fixture || target?.closest?.('[data-fixture]')?.dataset?.fixture;
        this._switchPreviewFixture(fixtureId);
    }

    static async #onSwitchFoundryPreviewArea(event, target) {
        const areaId = target?.dataset?.area || target?.closest?.('[data-area]')?.dataset?.area;
        this._switchFoundryPreviewArea(areaId);
    }

    static async #onSwitchFoundrySection(event, target) {
        const sectionId = target?.dataset?.section || target?.closest?.('[data-section]')?.dataset?.section;
        this._switchFoundrySection(sectionId);
    }

    static async #onExport(event, target) {
        const scope = this._getActiveConfigScope();
        const areaId = scope === 'foundry' ? target.dataset.area || null : null;
        const areaExport = areaId
            ? this.foundryTab.buildAreaExport(this._workingFoundryConfig, areaId)
            : null;
        const json = scope === 'foundry'
            ? JSON.stringify(areaExport || this._workingFoundryConfig, null, 2)
            : this.manager.exportConfig();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = scope === 'foundry'
            ? `your-flavor-foundry${areaId ? `-${areaId}` : ''}-${game.user.name}.json`
            : `your-flavor-${game.user.name}.json`;
        a.click();
        URL.revokeObjectURL(url);
        ui.notifications.info(
            game.i18n.localize(
                areaId
                    ? 'YOUR_FLAVOR.Notifications.FoundryAreaExported'
                    : scope === 'foundry'
                    ? 'YOUR_FLAVOR.Notifications.FoundryExported'
                    : 'YOUR_FLAVOR.Notifications.Exported'
            )
        );
    }

    static async #onExportUserPreset(event, target) {
        const exportData = buildUserChatPresetExport(this._workingConfig, {
            name: this._getUserPresetExportName(),
            exportedBy: game.user.name
        });
        const filename = `your-flavor-preset-${this._slugifyFilename(exportData.preset.name)}.json`;
        this._downloadJson(exportData, filename);
        ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.UserPresetExported'));
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
                if (this._getActiveConfigScope() === 'foundry') {
                    this.configStore.importFoundryConfig(config);
                    this._applyWorkingFoundryConfig();
                    this.render();
                    ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.FoundryImported'));
                } else {
                    this.configStore.importChatConfig(config);
                    this._activeCategory = null;
                    this.render();
                    ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.Imported'));
                }
            } catch (error) {
                console.error(`${MODULE_NAME} | Import failed:`, error);
                ui.notifications.error(
                    game.i18n.localize(
                        this._getActiveConfigScope() === 'foundry'
                            ? 'YOUR_FLAVOR.Notifications.FoundryImportError'
                            : 'YOUR_FLAVOR.Notifications.ImportError'
                    )
                );
            }
        });
        input.click();
    }

    static async #onImportUserPreset(event, target) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const text = await file.text();
                this._workingConfig = applyUserChatPresetExport(this._workingConfig, text, {
                    allowCustomHtml: game.user.isGM || game.settings.get(MODULE_ID, 'allowCustomHtml')
                });
                this._activeCategory = null;
                this._clearChatLogPreview();
                this.render();
                ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.UserPresetImported'));
            } catch (error) {
                console.error(`${MODULE_NAME} | User preset import failed:`, error);
                ui.notifications.error(game.i18n.localize('YOUR_FLAVOR.Notifications.UserPresetImportError'));
            }
        });
        input.click();
    }

    static async #onSwitchTab(event, target) {
        const tab = target.dataset.tab;
        if (!tab || tab === this._activeTab || !this._isTabAvailable(tab)) return;
        if (tab !== 'chat') this._clearChatLogPreview();
        if (tab !== 'icons') this._disableIconSelectionMode({ silent: true });
        this._activeTab = tab;
        this.render();
    }

    static async #onBrowsePauseAsset(event, target) {
        try {
            const current = await this._getPauseAssetPickerCurrent();
            const field = target.closest('.yf-input-with-buttons')?.querySelector('input[name="foundry.pause.assetPath"]') ?? null;
            openFilePicker({
                type: 'imagevideo',
                source: FOUNDRY_DATA_SOURCE,
                current,
                field,
                button: target,
                callback: path => this._setPauseAssetPath(path, { enable: true })
            });
        } catch (error) {
            console.error(`${MODULE_NAME} | Failed to open the pause asset picker:`, error);
            ui.notifications.error(game.i18n.localize('YOUR_FLAVOR.Notifications.PausePickerError'));
        }
    }

    static async #onUploadPauseAsset(event, target) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = PAUSE_UPLOAD_ACCEPT;
        input.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
                const path = await this._uploadPauseAssetFile(file);
                this._setPauseAssetPath(path, { enable: true });
                ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.PauseUploadSuccess'));
            } catch (error) {
                console.error(`${MODULE_NAME} | Pause asset upload failed:`, error);
                ui.notifications.error(game.i18n.localize('YOUR_FLAVOR.Notifications.PauseUploadError'));
            }
        });
        input.click();
    }

    static async #onClearPauseAsset(event, target) {
        this._workingFoundryConfig.pause ||= {};
        this._workingFoundryConfig.pause.assetPath = '';
        this._clearFoundryFieldOverride('pause.assetPath');
        this._applyWorkingFoundryConfig();
        this._syncDirtyIndicators();
        this.render();
    }

    static async #onToggleArrangeMode(event, target) {
        if (!game.user.isGM || !this.foundryCustomizer || this._workingFoundryConfig?.enabled === false) return;

        if (this.foundryCustomizer.isArrangeModeActive()) {
            this.foundryCustomizer.disableArrangeMode();
            ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.ArrangeModeDisabled'));
        } else {
            this._applyWorkingFoundryConfig();
            this.foundryCustomizer.captureArrangeModeConfig?.(this._workingFoundryConfig);
            this._applyWorkingFoundryConfig();
            const started = this.foundryCustomizer.enableArrangeMode(this._workingFoundryConfig, () => {
                this._syncFoundryLayoutControls();
                this._syncDirtyIndicators();
            });
            if (!started) {
                ui.notifications.warn(game.i18n.localize('YOUR_FLAVOR.Notifications.ArrangeModeUnavailable'));
            }
        }

        this.render();
    }

    static async #onResetFoundryComponent(event, target) {
        const componentId = target.dataset.component;
        if (!this.foundryTab.resetComponent(this._workingFoundryConfig, componentId)) return;

        this._clearFoundryFieldOverridesForPrefix(`layout.${componentId}.`);
        this._clearFoundryFieldOverridesForPrefix(`componentStyles.${componentId}.`);
        this.foundryCustomizer?.forgetLayoutMeasurement?.(componentId);
        this._applyWorkingFoundryConfig();
        this.render();
    }

    static async #onApplyThemePreset(event, target) {
        const presetId = target.dataset.preset;
        const preset = FOUNDRY_THEME_PRESETS.find(p => p.id === presetId);
        if (!preset) return;

        Object.assign(this._workingFoundryConfig.theme, foundry.utils.deepClone(preset.theme));
        this._markFoundryFieldOverridesForObject('theme', preset.theme);
        this._applyWorkingFoundryConfig();
        this.render();
        ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.PresetApplied'));
    }

    static async #onApplySidebarTransformer(event, target) {
        const presetId = target.dataset.preset;
        const preset = SIDEBAR_TRANSFORMER_PRESETS.find(entry => entry.id === presetId);
        if (!preset) return;

        this._workingFoundryConfig.sidebar = normalizeSidebarConfig({
            ...(this._workingFoundryConfig.sidebar || {}),
            ...(foundry.utils.deepClone(preset.sidebar) || {})
        });
        this._markFoundryFieldOverridesForObject('sidebar', preset.sidebar);
        this._workingFoundryConfig.layout ||= {};
        this._workingFoundryConfig.layout.sidebar ||= foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION.layout.sidebar);
        Object.assign(this._workingFoundryConfig.layout.sidebar, foundry.utils.deepClone(preset.layout?.sidebar || {}));
        this._markFoundryFieldOverridesForObject('layout.sidebar', preset.layout?.sidebar);
        this.foundryCustomizer?.forgetLayoutMeasurement?.('sidebar');
        this._applyWorkingFoundryConfig();
        this._syncDirtyIndicators();
        this.render();
        ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.SidebarTransformerApplied'));
    }

    static async #onApplyChatLogTransformer(event, target) {
        const presetId = target.dataset.preset;
        const preset = CHAT_LOG_TRANSFORMER_PRESETS.find(entry => entry.id === presetId);
        if (!preset) return;

        this._workingFoundryConfig.chatLog = normalizeChatLogConfig({
            ...(this._workingFoundryConfig.chatLog || {}),
            ...(foundry.utils.deepClone(preset.chatLog) || {})
        });
        this._markFoundryFieldOverridesForObject('chatLog', preset.chatLog);
        this._applyWorkingFoundryConfig();
        this._syncDirtyIndicators();
        this.render();
        ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.ChatLogTransformerApplied'));
    }

    static async #onBrowseComponentBg(event, target) {
        const componentId = target.dataset.component;
        if (!componentId) return;

        openFilePicker({
            type: 'image',
            callback: path => {
                if (!this._workingFoundryConfig.componentStyles[componentId]) {
                    this._workingFoundryConfig.componentStyles[componentId] = {};
                }
                this._workingFoundryConfig.componentStyles[componentId].backgroundImage = path;
                this._markFoundryFieldOverride(`componentStyles.${componentId}.backgroundImage`);
                this._applyWorkingFoundryConfig();
                this.render();
            }
        });
    }

    static async #onClearComponentBg(event, target) {
        const componentId = target.dataset.component;
        if (!componentId) return;

        if (this._workingFoundryConfig.componentStyles?.[componentId]) {
            this._workingFoundryConfig.componentStyles[componentId].backgroundImage = '';
        }
        this._clearFoundryFieldOverride(`componentStyles.${componentId}.backgroundImage`);
        this._applyWorkingFoundryConfig();
        this.render();
    }

    static async #onToggleIconSelectionMode(event, target) {
        if (this._iconSelectionActive) {
            this._disableIconSelectionMode();
            this.render();
            return;
        }

        const started = this._enableIconSelectionMode();
        if (started) this.render();
    }

    static async #onSelectIconPreview(event, target) {
        const iconId = target.dataset.iconId || target.closest?.('[data-icon-id]')?.dataset?.iconId;
        if (!iconId) return;

        this._setSelectedIconId(iconId);
        const iconConfig = this._getWorkingIconConfig();
        const entry = this._resolveIconEntry(iconId, iconConfig, { localize: key => game.i18n.localize(key) });
        if (entry?.area) {
            this._activeIconArea = this._normalizeIconAreaId(entry.area);
            this._activeFoundryPreviewArea = this.previewController.normalizeFoundryPreviewAreaId(entry.area);
        }
        this.foundryCustomizer?.highlightIconSelection?.(entry || iconId);
        this._syncIconPreviewPaletteDom();
        this._syncDirtyIndicators();
        this.render();
    }

    static async #onSwitchIconArea(event, target) {
        const areaId = target.dataset.area || target.closest?.('[data-area]')?.dataset?.area;
        const nextAreaId = this._normalizeIconAreaId(areaId);
        if (!nextAreaId || nextAreaId === this._activeIconArea) return;

        this._activeIconArea = nextAreaId;
        this._activeFoundryPreviewArea = this.previewController.normalizeFoundryPreviewAreaId(nextAreaId);
        this.render();
    }

    static async #onClearSelectedIcon(event, target) {
        this._setSelectedIconId(null);
        this.foundryCustomizer?.highlightIconSelection?.(null);
        this._syncDirtyIndicators();
        this.render();
    }

    static async #onResetSelectedIconOverride(event, target) {
        if (!this._resetSelectedIconOverride()) return;

        this._applyWorkingFoundryConfig();
        this._syncDirtyIndicators();
        this.render();
    }

    static async #onChooseIconClass(event, target) {
        const iconClass = target.dataset.iconClass || target.closest?.('[data-icon-class]')?.dataset?.iconClass;
        if (!iconClass) return;
        if (!this._setSelectedIconOverrideField('iconClass', iconClass)) return;

        this._applyWorkingFoundryConfig();
        this._syncDirtyIndicators();
        this.render();
    }

    /* -------------------------------------------- */
    /*  Helper Methods                              */
    /* -------------------------------------------- */

    _buildAvailableTabs({
        isGM = game.user.isGM,
        showFoundryTab = false,
        dirtyAreas = this.configStore?.getDirtyAreas?.() || {}
    } = {}) {
        return FlavorConfigApp.TAB_DEFINITIONS
            .filter(tab => !tab.gmOnly || isGM)
            .filter(tab => !tab.requiresFoundry || showFoundryTab)
            .map(tab => {
                const label = game.i18n.localize(tab.labelKey);
                const isDirty = Boolean(dirtyAreas[tab.id]);
                const canReset = this._canResetArea(tab.id);

                return {
                    ...tab,
                    label,
                    isActive: tab.id === this._activeTab,
                    isDirty,
                    canReset,
                    dirtyLabel: game.i18n.localize('YOUR_FLAVOR.Config.Dirty.UnsavedShort'),
                    dirtyTitle: this._formatI18n('YOUR_FLAVOR.Config.Dirty.UnsavedTitle', { area: label }),
                    resetTitle: this._formatI18n('YOUR_FLAVOR.Config.AreaReset.Title', { area: label }),
                    resetLabel: game.i18n.localize('YOUR_FLAVOR.Config.AreaReset.Button')
                };
            });
    }

    _countDirtyTabs(tabs = []) {
        return tabs.filter(tab => tab.id !== 'overview' && tab.isDirty).length;
    }

    _canResetArea(areaId) {
        const tab = this._getTabDefinitionByArea(areaId);
        if (!tab?.resetArea) return false;

        if (tab.scope === 'foundry') {
            return Boolean(game.user.isGM && game.settings.get(MODULE_ID, 'enableFoundryCustomization'));
        }

        const allowPlayerCustomization = game.settings.get(MODULE_ID, 'allowPlayerCustomization');
        const forcedLayout = game.settings.get(MODULE_ID, 'forcePlayerLayout');
        const hasForcedLayout = !game.user.isGM && forcedLayout && forcedLayout !== 'none';
        return Boolean((game.user.isGM || allowPlayerCustomization) && !hasForcedLayout);
    }

    _getTabDefinitionByArea(areaId) {
        return FlavorConfigApp.TAB_DEFINITIONS.find(tab => tab.id === areaId || tab.resetArea === areaId) || null;
    }

    _getAreaLabel(areaId) {
        const tab = this._getTabDefinitionByArea(areaId);
        return tab ? game.i18n.localize(tab.labelKey) : areaId;
    }

    _resetAreaDraft(areaId) {
        const resetArea = this._getTabDefinitionByArea(areaId)?.resetArea;
        if (!resetArea) return false;

        if (resetArea === 'chat' || resetArea === 'rolls' || resetArea === 'cards') {
            const reset = this.configStore.resetChatArea(resetArea);
            if (reset) {
                if (resetArea === 'chat') this._activeCategory = 'basic';
                this._clearChatLogPreview();
                this._updatePreview();
                this._syncDirtyIndicators();
            }
            return reset;
        }

        const reset = this.configStore.resetFoundryArea(resetArea);
        if (reset) {
            if (resetArea === 'foundry') {
                this.foundryCustomizer?.disableArrangeMode?.();
                this.foundryCustomizer?.forgetLayoutMeasurement?.();
            }
            if (resetArea === 'icons') {
                this.foundryCustomizer?.highlightIconSelection?.(null);
            }
            this._applyWorkingFoundryConfig();
        }
        return reset;
    }

    _isTabAvailable(tabId) {
        const isGM = game.user.isGM;
        const showFoundryTab = this._canShowFoundryTabs({ isGM });
        return this._buildAvailableTabs({ isGM, showFoundryTab }).some(tab => tab.id === tabId);
    }

    _getDefaultTabId() {
        return this._buildAvailableTabs({
            isGM: game.user.isGM,
            showFoundryTab: this._canShowFoundryTabs({ isGM: game.user.isGM })
        })[0]?.id || 'overview';
    }

    _canShowFoundryTabs({ isGM = game.user.isGM } = {}) {
        return Boolean(isGM && this.foundryCustomizer);
    }

    _getActiveTabDefinition() {
        return FlavorConfigApp.TAB_DEFINITIONS.find(tab => tab.id === this._activeTab)
            || FlavorConfigApp.TAB_DEFINITIONS[0];
    }

    _getActiveConfigScope() {
        return this._getActiveTabDefinition()?.scope || 'chat';
    }

    _getActivePreviewMode() {
        return this._getActiveTabDefinition()?.preview || 'chat';
    }

    _buildChatRandomizerContext() {
        const constraints = normalizeChatRandomizerConstraints(this._randomizerConstraints);
        this._randomizerConstraints = constraints;

        return {
            constraints,
            toneOptions: this._buildRandomizerOptions(
                'tone',
                CHAT_RANDOMIZER_VALUES.tone,
                constraints.tone
            ),
            intensityOptions: this._buildRandomizerOptions(
                'intensity',
                CHAT_RANDOMIZER_VALUES.intensity,
                constraints.intensity
            ),
            motionOptions: this._buildRandomizerOptions(
                'motion',
                CHAT_RANDOMIZER_VALUES.motion,
                constraints.motion
            ),
            scopeLabel: this._formatI18n('YOUR_FLAVOR.Config.Randomizer.Scope', {
                area: game.i18n.localize('YOUR_FLAVOR.Config.Tabs.ChatBasic')
            }),
            filterLabel: this._formatI18n('YOUR_FLAVOR.Config.Randomizer.Filter', {
                filter: this._getActiveRandomizerFilterLabel()
            }),
            actionTitle: game.i18n.localize('YOUR_FLAVOR.Config.Randomizer.ActionTitle')
        };
    }

    _buildRollTabsContext(config = this._workingConfig) {
        config.rolls = foundry.utils.mergeObject(
            foundry.utils.deepClone(DEFAULT_ROLL_CONFIG),
            foundry.utils.deepClone(config.rolls || {})
        );

        const fallbackColors = this._getRollFallbackColors(config);
        const surfaceDefinitions = [
            {
                id: 'formula',
                icon: 'fas fa-square-root-variable',
                labelKey: 'YOUR_FLAVOR.Config.RollTabs.Formula',
                fields: [
                    ['background', 'YOUR_FLAVOR.Config.RollTabs.Background'],
                    ['textColor', 'YOUR_FLAVOR.Config.RollTabs.Text'],
                    ['borderColor', 'YOUR_FLAVOR.Config.RollTabs.Border']
                ]
            },
            {
                id: 'terms',
                icon: 'fas fa-dice',
                labelKey: 'YOUR_FLAVOR.Config.RollTabs.Terms',
                fields: [
                    ['background', 'YOUR_FLAVOR.Config.RollTabs.Background'],
                    ['textColor', 'YOUR_FLAVOR.Config.RollTabs.Text']
                ]
            },
            {
                id: 'tooltip',
                icon: 'fas fa-list-ul',
                labelKey: 'YOUR_FLAVOR.Config.RollTabs.Tooltip',
                fields: [
                    ['background', 'YOUR_FLAVOR.Config.RollTabs.Background'],
                    ['textColor', 'YOUR_FLAVOR.Config.RollTabs.Text']
                ]
            },
            {
                id: 'total',
                icon: 'fas fa-calculator',
                labelKey: 'YOUR_FLAVOR.Config.RollTabs.Total',
                fields: [
                    ['background', 'YOUR_FLAVOR.Config.RollTabs.Background'],
                    ['textColor', 'YOUR_FLAVOR.Config.RollTabs.Text'],
                    ['borderColor', 'YOUR_FLAVOR.Config.RollTabs.Border']
                ]
            },
            {
                id: 'critical',
                icon: 'fas fa-arrow-trend-up',
                labelKey: 'YOUR_FLAVOR.Config.RollTabs.Critical',
                fields: [
                    ['textColor', 'YOUR_FLAVOR.Config.RollTabs.Text'],
                    ['accentColor', 'YOUR_FLAVOR.Config.RollTabs.Accent']
                ]
            },
            {
                id: 'failure',
                icon: 'fas fa-arrow-trend-down',
                labelKey: 'YOUR_FLAVOR.Config.RollTabs.Failure',
                fields: [
                    ['textColor', 'YOUR_FLAVOR.Config.RollTabs.Text'],
                    ['accentColor', 'YOUR_FLAVOR.Config.RollTabs.Accent']
                ]
            }
        ];

        return {
            enabled: config.rolls.enabled !== false,
            enabledTitle: game.i18n.localize('YOUR_FLAVOR.Config.RollTabs.EnabledTitle'),
            surfaces: surfaceDefinitions.map(surface => ({
                ...surface,
                label: game.i18n.localize(surface.labelKey),
                fields: surface.fields.map(([field, labelKey]) => {
                    const path = `rolls.surfaces.${surface.id}.${field}`;
                    const value = config.rolls.surfaces?.[surface.id]?.[field] ?? null;
                    const hasCustomValue = this._isHexColor(value);
                    return {
                        field,
                        path,
                        label: game.i18n.localize(labelKey),
                        value: hasCustomValue
                            ? value
                            : this._colorInputFromCss(fallbackColors[`${surface.id}.${field}`], '#c9a227'),
                        statusClass: hasCustomValue ? 'is-custom' : 'is-default',
                        statusLabel: hasCustomValue
                            ? this.chatTab.tokenStatusLabel('custom')
                            : game.i18n.localize('YOUR_FLAVOR.Config.RollTabs.Theme'),
                        statusTitle: hasCustomValue
                            ? this.chatTab.tokenStatusTitle('custom')
                            : game.i18n.localize('YOUR_FLAVOR.Config.RollTabs.ThemeTitle'),
                        resetTitle: game.i18n.localize('YOUR_FLAVOR.Config.RollTabs.ResetToTheme')
                    };
                })
            })),
            systems: [
                { id: 'dnd5e', label: 'D&D5e', enabled: config.rolls.systems?.dnd5e?.enabled !== false },
                { id: 'pf2e', label: 'PF2e', enabled: config.rolls.systems?.pf2e?.enabled !== false },
                {
                    id: 'generic',
                    label: game.i18n.localize('YOUR_FLAVOR.Config.RollTabs.Generic'),
                    enabled: config.rolls.systems?.generic?.enabled !== false
                }
            ]
        };
    }

    _buildCardTabsContext(config = this._workingConfig) {
        config.cards = foundry.utils.mergeObject(
            foundry.utils.deepClone(DEFAULT_CARD_CONFIG),
            foundry.utils.deepClone(config.cards || {})
        );

        const fallbackColors = this._getCardFallbackColors(config);
        const surfaceDefinitions = [
            {
                id: 'itemTitle',
                icon: 'fas fa-heading',
                labelKey: 'YOUR_FLAVOR.Config.CardTabs.ItemTitle',
                fields: [
                    ['background', 'YOUR_FLAVOR.Config.CardTabs.Background'],
                    ['textColor', 'YOUR_FLAVOR.Config.CardTabs.Text'],
                    ['accentColor', 'YOUR_FLAVOR.Config.CardTabs.Accent']
                ]
            },
            {
                id: 'itemBody',
                icon: 'fas fa-align-left',
                labelKey: 'YOUR_FLAVOR.Config.CardTabs.ItemBody',
                fields: [
                    ['background', 'YOUR_FLAVOR.Config.CardTabs.Background'],
                    ['textColor', 'YOUR_FLAVOR.Config.CardTabs.Text']
                ]
            },
            {
                id: 'buttons',
                icon: 'fas fa-hand-pointer',
                labelKey: 'YOUR_FLAVOR.Config.CardTabs.Buttons',
                fields: [
                    ['background', 'YOUR_FLAVOR.Config.CardTabs.Background'],
                    ['textColor', 'YOUR_FLAVOR.Config.CardTabs.Text'],
                    ['borderColor', 'YOUR_FLAVOR.Config.CardTabs.Border']
                ]
            },
            {
                id: 'tables',
                icon: 'fas fa-table',
                labelKey: 'YOUR_FLAVOR.Config.CardTabs.Tables',
                fields: [
                    ['oddRow', 'YOUR_FLAVOR.Config.CardTabs.OddRow'],
                    ['evenRow', 'YOUR_FLAVOR.Config.CardTabs.EvenRow'],
                    ['borderColor', 'YOUR_FLAVOR.Config.CardTabs.Border']
                ]
            }
        ];

        return {
            enabled: config.cards.enabled !== false,
            enabledTitle: game.i18n.localize('YOUR_FLAVOR.Config.CardTabs.EnabledTitle'),
            surfaces: surfaceDefinitions.map(surface => ({
                ...surface,
                label: game.i18n.localize(surface.labelKey),
                fields: surface.fields.map(([field, labelKey]) => {
                    const path = `cards.surfaces.${surface.id}.${field}`;
                    const value = config.cards.surfaces?.[surface.id]?.[field] ?? null;
                    const hasCustomValue = this._isHexColor(value);
                    return {
                        field,
                        path,
                        label: game.i18n.localize(labelKey),
                        value: hasCustomValue
                            ? value
                            : this._colorInputFromCss(fallbackColors[`${surface.id}.${field}`], '#c9a227'),
                        statusClass: hasCustomValue ? 'is-custom' : 'is-default',
                        statusLabel: hasCustomValue
                            ? this.chatTab.tokenStatusLabel('custom')
                            : game.i18n.localize('YOUR_FLAVOR.Config.CardTabs.Theme'),
                        statusTitle: hasCustomValue
                            ? this.chatTab.tokenStatusTitle('custom')
                            : game.i18n.localize('YOUR_FLAVOR.Config.CardTabs.ThemeTitle'),
                        resetTitle: game.i18n.localize('YOUR_FLAVOR.Config.CardTabs.ResetToTheme')
                    };
                })
            })),
            systems: [
                {
                    id: 'dnd5e-item',
                    path: 'cards.systems.dnd5e.itemCards',
                    label: game.i18n.localize('YOUR_FLAVOR.Config.CardTabs.Dnd5eItemCards'),
                    enabled: config.cards.systems?.dnd5e?.itemCards !== false
                },
                {
                    id: 'dnd5e-ability',
                    path: 'cards.systems.dnd5e.abilityCards',
                    label: game.i18n.localize('YOUR_FLAVOR.Config.CardTabs.Dnd5eAbilityCards'),
                    enabled: config.cards.systems?.dnd5e?.abilityCards !== false
                },
                {
                    id: 'pf2e-action',
                    path: 'cards.systems.pf2e.actionCards',
                    label: game.i18n.localize('YOUR_FLAVOR.Config.CardTabs.Pf2eActionCards'),
                    enabled: config.cards.systems?.pf2e?.actionCards !== false
                },
                {
                    id: 'pf2e-spell',
                    path: 'cards.systems.pf2e.spellCards',
                    label: game.i18n.localize('YOUR_FLAVOR.Config.CardTabs.Pf2eSpellCards'),
                    enabled: config.cards.systems?.pf2e?.spellCards !== false
                },
                {
                    id: 'generic',
                    path: 'cards.systems.generic.enabled',
                    label: game.i18n.localize('YOUR_FLAVOR.Config.CardTabs.Generic'),
                    enabled: config.cards.systems?.generic?.enabled !== false
                }
            ]
        };
    }

    _getRollFallbackColors(config = this._workingConfig) {
        const customizations = config?.customizations ?? {};
        const borderColor = this._colorInputFromCss(customizations.borderColor, '#c9a227');
        const backgroundColor = this._colorInputFromCss(customizations.backgroundColor, '#141210');
        const textColor = this._colorInputFromCss(customizations.textColor, '#e8dcc8');
        const nameColor = this._colorInputFromCss(customizations.nameColor, borderColor);

        return {
            'formula.background': borderColor,
            'formula.textColor': nameColor,
            'formula.borderColor': borderColor,
            'terms.background': borderColor,
            'terms.textColor': textColor,
            'tooltip.background': backgroundColor,
            'tooltip.textColor': textColor,
            'total.background': borderColor,
            'total.textColor': nameColor,
            'total.borderColor': borderColor,
            'critical.textColor': '#8ff0a4',
            'critical.accentColor': '#36b85f',
            'failure.textColor': '#ff9d9d',
            'failure.accentColor': '#d94b4b'
        };
    }

    _getCardFallbackColors(config = this._workingConfig) {
        const customizations = config?.customizations ?? {};
        const borderColor = this._colorInputFromCss(customizations.borderColor, '#c9a227');
        const backgroundColor = this._colorInputFromCss(customizations.backgroundColor, '#141210');
        const textColor = this._colorInputFromCss(customizations.textColor, '#e8dcc8');
        const nameColor = this._colorInputFromCss(customizations.nameColor, borderColor);

        return {
            'itemTitle.background': borderColor,
            'itemTitle.textColor': nameColor,
            'itemTitle.accentColor': borderColor,
            'itemBody.background': backgroundColor,
            'itemBody.textColor': textColor,
            'buttons.background': borderColor,
            'buttons.textColor': textColor,
            'buttons.borderColor': borderColor,
            'tables.oddRow': borderColor,
            'tables.evenRow': borderColor,
            'tables.borderColor': borderColor
        };
    }

    _colorInputFromCss(value, fallback = '#000000') {
        if (this._isHexColor(value)) return value.trim();
        const normalized = String(value ?? '').trim();
        const shortHex = normalized.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
        if (shortHex) {
            return `#${shortHex[1]}${shortHex[1]}${shortHex[2]}${shortHex[2]}${shortHex[3]}${shortHex[3]}`;
        }

        const rgb = normalized.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (rgb) {
            return `#${[rgb[1], rgb[2], rgb[3]]
                .map(channel => Number(channel).toString(16).padStart(2, '0'))
                .join('')}`;
        }

        return this._isHexColor(fallback) ? fallback : '#000000';
    }

    _isHexColor(value) {
        return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value.trim());
    }

    _buildRandomizerOptions(type, values, selectedValue) {
        return [
            {
                value: CHAT_RANDOMIZER_ANY,
                label: game.i18n.localize('YOUR_FLAVOR.Config.Randomizer.Any'),
                isSelected: selectedValue === CHAT_RANDOMIZER_ANY
            },
            ...values.map(value => ({
                value,
                label: this._randomizerMetadataLabel(type, value),
                isSelected: selectedValue === value
            }))
        ];
    }

    _randomizerMetadataLabel(type, value) {
        const keys = {
            tone: {
                dark: 'YOUR_FLAVOR.Config.PresetMetadata.Tones.Dark',
                light: 'YOUR_FLAVOR.Config.PresetMetadata.Tones.Light',
                mixed: 'YOUR_FLAVOR.Config.PresetMetadata.Tones.Mixed'
            },
            intensity: {
                subtle: 'YOUR_FLAVOR.Config.PresetMetadata.Intensities.Subtle',
                moderate: 'YOUR_FLAVOR.Config.PresetMetadata.Intensities.Moderate',
                bold: 'YOUR_FLAVOR.Config.PresetMetadata.Intensities.Bold'
            },
            motion: {
                none: 'YOUR_FLAVOR.Config.PresetMetadata.Motion.None',
                low: 'YOUR_FLAVOR.Config.PresetMetadata.Motion.Low',
                medium: 'YOUR_FLAVOR.Config.PresetMetadata.Motion.Medium',
                high: 'YOUR_FLAVOR.Config.PresetMetadata.Motion.High'
            }
        };
        const key = keys[type]?.[value];
        return key ? game.i18n.localize(key) : value;
    }

    _getActiveRandomizerFilterLabel() {
        const key = {
            favorites: 'YOUR_FLAVOR.Categories.Favorites',
            basic: 'YOUR_FLAVOR.Categories.Basic',
            class: 'YOUR_FLAVOR.Categories.Classes',
            race: 'YOUR_FLAVOR.Categories.Races',
            theme: 'YOUR_FLAVOR.Categories.Themes',
            modern: 'YOUR_FLAVOR.Categories.Modern',
            misc: 'YOUR_FLAVOR.Categories.Misc'
        }[this._activeCategory];

        return key
            ? game.i18n.localize(key)
            : game.i18n.localize('YOUR_FLAVOR.Config.Randomizer.AllPresets');
    }

    _syncChatRandomizerConstraintsFromDom() {
        const constraints = normalizeChatRandomizerConstraints(this._randomizerConstraints);
        this.element?.querySelectorAll?.('.yf-randomizer-constraint').forEach(input => {
            constraints[input.dataset.constraint] = input.value || CHAT_RANDOMIZER_ANY;
        });
        this._randomizerConstraints = normalizeChatRandomizerConstraints(constraints);
        return this._randomizerConstraints;
    }

    _buildOverviewContext({
        config,
        foundryConfig,
        previewFixtures,
        playerName,
        isGM = game.user.isGM,
        showFoundryTab,
        dirtyAreaCount = 0,
        hasDirtyAreas = false,
        pendingVisualSettingCount = 0,
        pendingVisualPresetCount = 0
    }) {
        return {
            profileName: this._editingActorId
                ? game.actors.get(this._editingActorId)?.name || playerName
                : playerName,
            chatStatus: game.i18n.localize(
                config.enabled
                    ? 'YOUR_FLAVOR.Config.StatusEnabled'
                    : 'YOUR_FLAVOR.Config.StatusDisabled'
            ),
            chatLayout: this._getChatPresetLabel(config.layout),
            previewFixtureCount: previewFixtures.length,
            foundryStatus: game.i18n.localize(
                foundryConfig.enabled
                    ? 'YOUR_FLAVOR.Config.StatusEnabled'
                    : 'YOUR_FLAVOR.Config.StatusDisabled'
            ),
            showFoundryStatus: showFoundryTab,
            canFactoryReset: Boolean(isGM),
            dirtyAreaCount,
            hasDirtyAreas,
            dirtyStatus: hasDirtyAreas
                ? this._formatI18n('YOUR_FLAVOR.Config.Dirty.Summary', { count: dirtyAreaCount })
                : game.i18n.localize('YOUR_FLAVOR.Config.Dirty.None'),
            visualShare: this._buildVisualShareContext({
                isGM,
                showFoundryTab,
                pendingVisualSettingCount,
                pendingVisualPresetCount
            })
        };
    }

    _buildVisualShareContext({
        isGM = game.user.isGM,
        showFoundryTab = false,
        pendingVisualSettingCount = 0,
        pendingVisualPresetCount = 0
    } = {}) {
        const permissions = this._getVisualImportPermissions();
        const includesFoundry = Boolean(isGM && this.foundryCustomizer);
        const pendingCount = pendingVisualSettingCount + pendingVisualPresetCount;

        return {
            canExport: true,
            canImport: permissions.canImportChat || permissions.canImportFoundry,
            includesFoundry,
            foundryLabel: game.i18n.localize(
                includesFoundry
                    ? 'YOUR_FLAVOR.Config.VisualShare.ScopeFull'
                    : 'YOUR_FLAVOR.Config.VisualShare.ScopeChat'
            ),
            pendingCount,
            hasPending: pendingCount > 0,
            pendingLabel: pendingCount > 0
                ? this._formatI18n('YOUR_FLAVOR.Config.VisualShare.PendingDraft', { count: pendingCount })
                : game.i18n.localize('YOUR_FLAVOR.Config.VisualShare.NoPendingDraft'),
            importHint: game.i18n.localize(
                permissions.canImportFoundry || showFoundryTab
                    ? 'YOUR_FLAVOR.Config.VisualShare.ImportHintFull'
                    : 'YOUR_FLAVOR.Config.VisualShare.ImportHintChat'
            )
        };
    }

    _getVisualProfileName({ includeFoundry = false } = {}) {
        if (includeFoundry) {
            return game.world?.title
                ? `${game.world.title} Visual`
                : `${game.user.name} Visual`;
        }
        return `${game.user.name} Chat Visual`;
    }

    _getVisualSettingsSnapshot() {
        const get = key => {
            try {
                return game.settings.get(MODULE_ID, key);
            } catch (_error) {
                return undefined;
            }
        };

        return {
            moduleEnabled: get('moduleEnabled'),
            allowPlayerCustomization: get('allowPlayerCustomization'),
            forcePlayerLayout: get('forcePlayerLayout'),
            allowCustomHtml: get('allowCustomHtml'),
            applyToWhispers: get('applyToWhispers'),
            messageStylingPolicy: get('messageStylingPolicy'),
            enableFoundryCustomization: get('enableFoundryCustomization'),
            shareFoundryCustomization: get('shareFoundryCustomization')
        };
    }

    _getVisualImportPermissions() {
        const forcedLayout = game.settings.get(MODULE_ID, 'forcePlayerLayout');
        const hasForcedLayout = !game.user.isGM && forcedLayout && forcedLayout !== 'none';
        const allowPlayerCustomization = game.settings.get(MODULE_ID, 'allowPlayerCustomization');

        return {
            canImportChat: Boolean(game.user.isGM || (allowPlayerCustomization && !hasForcedLayout)),
            canImportFoundry: Boolean(game.user.isGM && this.foundryCustomizer),
            canImportSettings: Boolean(game.user.isGM),
            canImportPresets: true,
            allowCustomHtml: Boolean(game.user.isGM || game.settings.get(MODULE_ID, 'allowCustomHtml'))
        };
    }

    _appendVisualImportDiagnostics(importResult) {
        const iconOverrides = importResult?.foundryConfig?.icons?.overrides || {};
        const dynamicEntries = Object.entries(iconOverrides)
            .filter(([iconId, override]) => String(iconId).startsWith('dynamic.') || override?.dynamic === true);
        if (!dynamicEntries.length || !globalThis.document?.querySelector) return;

        const missingDynamicIcons = dynamicEntries.filter(([_iconId, override]) => {
            const selectors = Array.isArray(override.matchSelectors)
                ? override.matchSelectors
                : Array.isArray(override.selectors)
                    ? override.selectors
                    : [override.selector];
            return !selectors.some(selector => {
                if (typeof selector !== 'string' || !selector.trim()) return false;
                try {
                    return Boolean(globalThis.document.querySelector(selector));
                } catch (_error) {
                    return false;
                }
            });
        }).length;

        if (missingDynamicIcons > 0) {
            importResult.warnings.push({
                code: 'dynamic-icons-missing',
                count: missingDynamicIcons
            });
        }
    }

    _buildVisualImportDialogContent(visualProfile, importResult) {
        const meta = visualProfile.meta || {};
        const summary = importResult.summary || {};
        const rows = [
            this._buildVisualImportDialogRow('chat', importResult.applied.chat, 'fas fa-comment-dots', 'YOUR_FLAVOR.Config.VisualShare.Sections.Chat'),
            this._buildVisualImportDialogRow('rolls', importResult.applied.rolls, 'fas fa-dice-d20', 'YOUR_FLAVOR.Config.VisualShare.Sections.Rolls'),
            this._buildVisualImportDialogRow('cards', importResult.applied.cards, 'fas fa-scroll', 'YOUR_FLAVOR.Config.VisualShare.Sections.Cards'),
            this._buildVisualImportDialogRow('foundry', importResult.applied.foundry, 'fas fa-wand-magic-sparkles', 'YOUR_FLAVOR.Config.VisualShare.Sections.Foundry'),
            this._buildVisualImportDialogRow('icons', importResult.applied.icons, 'fas fa-icons', 'YOUR_FLAVOR.Config.VisualShare.Sections.Icons', this._formatI18n('YOUR_FLAVOR.Config.VisualShare.IconSummary', {
                overrides: summary.iconOverrides ?? 0,
                dynamic: summary.dynamicIconOverrides ?? 0,
                hidden: summary.hiddenIconOverrides ?? 0,
                classes: summary.iconClassOverrides ?? 0
            })),
            this._buildVisualImportDialogRow('presets', importResult.applied.presets, 'fas fa-star', 'YOUR_FLAVOR.Config.VisualShare.Sections.Presets', this._formatI18n('YOUR_FLAVOR.Config.VisualShare.PresetSummary', {
                favorites: summary.favorites ?? 0,
                custom: summary.customPresets ?? 0
            })),
            this._buildVisualImportDialogRow('settings', importResult.applied.settings, 'fas fa-sliders', 'YOUR_FLAVOR.Config.VisualShare.Sections.Settings', this._formatI18n('YOUR_FLAVOR.Config.VisualShare.SettingsSummary', {
                count: Object.keys(importResult.settings || {}).length
            }))
        ].join('');
        const warnings = this._buildVisualImportWarningList(importResult.warnings || []);

        return `
            <div class="yf-visual-import-dialog">
                <p class="yf-visual-import-lead">${this._escapeHtml(game.i18n.localize('YOUR_FLAVOR.Dialog.ImportVisualContent'))}</p>
                <dl class="yf-visual-import-meta">
                    <div><dt>${this._escapeHtml(game.i18n.localize('YOUR_FLAVOR.Config.VisualShare.Name'))}</dt><dd>${this._escapeHtml(meta.name || 'Your Flavor Visual')}</dd></div>
                    <div><dt>${this._escapeHtml(game.i18n.localize('YOUR_FLAVOR.Config.VisualShare.Author'))}</dt><dd>${this._escapeHtml(meta.author || game.i18n.localize('YOUR_FLAVOR.Config.VisualShare.Unknown'))}</dd></div>
                    <div><dt>${this._escapeHtml(game.i18n.localize('YOUR_FLAVOR.Config.VisualShare.ExportedAt'))}</dt><dd>${this._escapeHtml(meta.exportedAt || game.i18n.localize('YOUR_FLAVOR.Config.VisualShare.Unknown'))}</dd></div>
                    <div><dt>${this._escapeHtml(game.i18n.localize('YOUR_FLAVOR.Config.VisualShare.System'))}</dt><dd>${this._escapeHtml(meta.systemTitle || meta.systemId || game.i18n.localize('YOUR_FLAVOR.Config.VisualShare.Unknown'))}</dd></div>
                </dl>
                <ul class="yf-visual-import-section-list">${rows}</ul>
                ${warnings}
                <p class="yf-visual-import-hint">${this._escapeHtml(game.i18n.localize('YOUR_FLAVOR.Config.VisualShare.DraftHint'))}</p>
            </div>
        `;
    }

    _buildVisualImportDialogRow(sectionId, applied, icon, labelKey, detail = '') {
        const statusKey = applied
            ? 'YOUR_FLAVOR.Config.VisualShare.WillApply'
            : 'YOUR_FLAVOR.Config.VisualShare.WillSkip';
        const detailText = detail ? `<small>${this._escapeHtml(detail)}</small>` : '';
        return `
            <li class="${applied ? 'is-applied' : 'is-skipped'}" data-section="${this._escapeHtml(sectionId)}">
                <i class="${this._escapeHtml(icon)}"></i>
                <span><strong>${this._escapeHtml(game.i18n.localize(labelKey))}</strong>${detailText}</span>
                <em>${this._escapeHtml(game.i18n.localize(statusKey))}</em>
            </li>
        `;
    }

    _buildVisualImportWarningList(warnings = []) {
        if (!warnings.length) return '';
        const items = warnings.map(warning => {
            const key = {
                'chat-not-allowed': 'YOUR_FLAVOR.Config.VisualShare.Warnings.ChatNotAllowed',
                'foundry-gm-only': 'YOUR_FLAVOR.Config.VisualShare.Warnings.FoundryGMOnly',
                'settings-gm-only': 'YOUR_FLAVOR.Config.VisualShare.Warnings.SettingsGMOnly',
                'dynamic-icons-missing': 'YOUR_FLAVOR.Config.VisualShare.Warnings.DynamicIconsMissing'
            }[warning.code] || 'YOUR_FLAVOR.Config.VisualShare.Warnings.Generic';
            const message = warning.code === 'dynamic-icons-missing'
                ? this._formatI18n(key, { count: warning.count ?? 0 })
                : game.i18n.localize(key);
            return `<li>${this._escapeHtml(message)}</li>`;
        }).join('');
        return `<div class="yf-visual-import-warnings"><strong>${this._escapeHtml(game.i18n.localize('YOUR_FLAVOR.Config.VisualShare.Warnings.Title'))}</strong><ul>${items}</ul></div>`;
    }

    _getVisualImportErrorKey(error) {
        const code = error?.code || '';
        return {
            'invalid-json': 'YOUR_FLAVOR.Notifications.VisualImportInvalidJson',
            'unknown-schema': 'YOUR_FLAVOR.Notifications.VisualImportUnknownSchema',
            'unsupported-version': 'YOUR_FLAVOR.Notifications.VisualImportUnsupportedVersion',
            'empty-profile': 'YOUR_FLAVOR.Notifications.VisualImportEmptyProfile'
        }[code] || 'YOUR_FLAVOR.Notifications.VisualImportError';
    }

    _getPendingVisualSettingCount() {
        return Object.keys(this._pendingVisualSettings || {}).length;
    }

    _getPendingVisualPresetCount() {
        const presets = this._pendingVisualPresets || null;
        if (!presets) return 0;
        const favorites = Array.isArray(presets.favorites) ? presets.favorites.length : 0;
        const custom = presets.custom && typeof presets.custom === 'object' && !Array.isArray(presets.custom)
            ? Object.keys(presets.custom).length
            : 0;
        return favorites + custom;
    }

    async _getPauseAssetPickerCurrent() {
        const currentPath = this._normalizeFilePickerPath(this._workingFoundryConfig?.pause?.assetPath);
        const currentDirectory = this._getFilePickerDirectory(currentPath);
        if (currentDirectory && !this._isProtectedDataUploadPath(currentDirectory)) return currentPath || currentDirectory;

        const worldAssetDirectory = await this._getExistingWorldAssetDirectory();
        return worldAssetDirectory || '';
    }

    async _uploadPauseAssetFile(file) {
        const FilePickerClass = this._getFilePickerApi();
        const directory = await this._getPauseUploadDirectory();
        const result = await FilePickerClass.upload(FOUNDRY_DATA_SOURCE, directory, file, {}, { notify: true });
        return this._extractFilePickerUploadPath(result, file.name, directory);
    }

    async _getPauseUploadDirectory() {
        const currentPath = this._normalizeFilePickerPath(this._workingFoundryConfig?.pause?.assetPath);
        const currentDirectory = this._getFilePickerDirectory(currentPath);
        if (
            currentDirectory
            && !this._isProtectedDataUploadPath(currentDirectory)
            && await this._filePickerDirectoryExists(FOUNDRY_DATA_SOURCE, currentDirectory)
        ) {
            return currentDirectory;
        }

        const worldAssetDirectory = await this._getExistingWorldAssetDirectory();
        if (worldAssetDirectory) return worldAssetDirectory;

        await this._ensureFilePickerDirectory(PAUSE_UPLOAD_FALLBACK_DIRECTORY);
        return PAUSE_UPLOAD_FALLBACK_DIRECTORY;
    }

    async _getExistingWorldAssetDirectory() {
        for (const directory of this._getWorldAssetDirectoryCandidates()) {
            if (this._isProtectedDataUploadPath(directory)) continue;
            if (await this._filePickerDirectoryExists(FOUNDRY_DATA_SOURCE, directory)) return directory;
        }
        return '';
    }

    _getWorldAssetDirectoryCandidates() {
        return [...new Set([
            game.world?.id,
            game.world?.title,
            this._slugifyFilePickerSegment(game.world?.title)
        ]
            .map(value => this._normalizeFilePickerPath(value))
            .filter(Boolean))];
    }

    async _ensureFilePickerDirectory(directory) {
        const normalized = this._normalizeFilePickerPath(directory);
        if (!normalized || this._isProtectedDataUploadPath(normalized)) {
            throw new Error(`Refusing to create protected Foundry upload directory: ${directory}`);
        }

        const FilePickerClass = this._getFilePickerApi();
        let current = '';
        for (const segment of normalized.split('/').filter(Boolean)) {
            current = current ? `${current}/${segment}` : segment;
            if (await this._filePickerDirectoryExists(FOUNDRY_DATA_SOURCE, current)) continue;
            try {
                if (typeof FilePickerClass.createDirectory !== 'function') {
                    throw new Error('Foundry FilePicker createDirectory API is unavailable.');
                }
                await FilePickerClass.createDirectory(FOUNDRY_DATA_SOURCE, current, {});
            } catch (error) {
                if (!await this._filePickerDirectoryExists(FOUNDRY_DATA_SOURCE, current)) throw error;
            }
        }
    }

    async _filePickerDirectoryExists(source, directory) {
        const FilePickerClass = this._getFilePickerApi();
        try {
            await FilePickerClass.browse(source, directory);
            return true;
        } catch (_error) {
            return false;
        }
    }

    _getFilePickerApi() {
        const FilePickerClass = getFilePickerClass();
        if (!FilePickerClass) {
            throw new Error('Foundry FilePicker API is unavailable.');
        }
        if (typeof FilePickerClass.browse !== 'function' || typeof FilePickerClass.upload !== 'function') {
            throw new Error('Foundry FilePicker static API is unavailable.');
        }
        return FilePickerClass;
    }

    _setPauseAssetPath(path, { enable = false } = {}) {
        if (!path) return;
        this._workingFoundryConfig.pause ||= {};
        this._workingFoundryConfig.pause.assetPath = path;
        this._markFoundryFieldOverride('pause.assetPath');
        this._enableFoundryCategoryForPath('pause.assetPath');

        if (enable) {
            this._workingFoundryConfig.pause.enabled = true;
            this._markFoundryFieldOverride('pause.enabled');
            this._enableFoundryCategoryForPath('pause.enabled');
        }

        this._applyWorkingFoundryConfig();
        this._syncDirtyIndicators();
        this.render();
    }

    _extractFilePickerUploadPath(result, fileName, directory) {
        const candidates = [
            result?.path,
            result?.file,
            result?.url,
            result?.src,
            result?.files?.[0],
            result?.result?.path,
            result?.result?.file,
            result?.result?.url,
            result?.result?.src,
            result?.result?.files?.[0]
        ];
        const uploadedPath = candidates.find(value => typeof value === 'string' && value.trim());
        if (uploadedPath) return this._normalizeFilePickerPath(uploadedPath);

        const normalizedDirectory = this._normalizeFilePickerPath(directory);
        return normalizedDirectory
            ? `${normalizedDirectory}/${fileName}`
            : fileName;
    }

    _getFilePickerDirectory(path) {
        const normalized = this._normalizeFilePickerPath(path);
        if (!normalized || /^[a-z][a-z0-9+.-]*:\/\//i.test(normalized)) return '';
        const slashIndex = normalized.lastIndexOf('/');
        return slashIndex > 0 ? normalized.slice(0, slashIndex) : '';
    }

    _normalizeFilePickerPath(path) {
        return String(path || '')
            .replace(/\\/g, '/')
            .replace(/^\/+/, '')
            .replace(/\/+$/, '')
            .trim();
    }

    _slugifyFilePickerSegment(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    _isProtectedDataUploadPath(path) {
        const normalized = this._normalizeFilePickerPath(path).toLowerCase();
        return !normalized || /^(?:modules|systems|worlds)(?:\/|$)/.test(normalized);
    }

    _getFoundryFeatureSetting() {
        try {
            return Boolean(game.settings.get(MODULE_ID, 'enableFoundryCustomization'));
        } catch (_error) {
            return false;
        }
    }

    _isFoundryFeatureEnabledInDraft() {
        return this._getFoundryFeatureSetting()
            || this._pendingVisualSettings?.enableFoundryCustomization === true;
    }

    _syncFoundryFeatureSettingDraft(enabled) {
        if (!game.user.isGM) return;

        if (enabled && !this._getFoundryFeatureSetting()) {
            this._pendingVisualSettings = {
                ...(this._pendingVisualSettings || {}),
                enableFoundryCustomization: true
            };
            return;
        }

        if (!enabled && this._pendingVisualSettings?.enableFoundryCustomization === true) {
            delete this._pendingVisualSettings.enableFoundryCustomization;
            if (Object.keys(this._pendingVisualSettings).length === 0) {
                this._pendingVisualSettings = null;
            }
        }
    }

    _enableFoundryCategoryForPath(foundryPath) {
        const categoryId = this._getFoundryCategoryForPath(foundryPath);
        if (categoryId) {
            this._workingFoundryConfig.categories ||= {};
            this._workingFoundryConfig.categories[categoryId] = true;
        }

        const areaIds = this._getFoundryAreasForPath(foundryPath);
        if (areaIds.length) {
            this._workingFoundryConfig.areaEnabled ||= {};
            areaIds.forEach(areaId => {
                this._workingFoundryConfig.areaEnabled[areaId] = true;
            });
        }
    }

    _getFoundryCategoryForPath(foundryPath) {
        if (!foundryPath || foundryPath.startsWith('categories.')) return null;

        if (foundryPath === 'customCss' || foundryPath.startsWith('customCss.')) return 'customCss';
        if (foundryPath.startsWith('icons.')) return 'icons';
        if (foundryPath.startsWith('visibility.')) return 'visibility';
        if (foundryPath.startsWith('layout.')) return 'layout';
        if (foundryPath.startsWith('pause.')) return 'pause';
        if (foundryPath === 'theme.interfaceFont' || foundryPath === 'theme.windowFont') return 'fonts';
        if (foundryPath.startsWith('theme.')) return 'theme';

        if (
            foundryPath.startsWith('componentStyles.')
            || foundryPath.startsWith('sceneNavigation.')
            || foundryPath.startsWith('tokenControls.')
            || foundryPath.startsWith('hotbar.')
            || foundryPath.startsWith('sidebar.')
            || foundryPath.startsWith('chatLog.')
            || foundryPath.startsWith('playersList.')
            || foundryPath.startsWith('windows.')
        ) {
            return 'components';
        }

        return null;
    }

    _getFoundryAreasForPath(foundryPath) {
        if (!foundryPath || foundryPath.startsWith('areaEnabled.')) return [];

        if (foundryPath.startsWith('theme.')) {
            return Object.keys(DEFAULT_FOUNDRY_CUSTOMIZATION.areaEnabled || {});
        }
        if (foundryPath.startsWith('icons.')) {
            return Object.keys(DEFAULT_FOUNDRY_CUSTOMIZATION.areaEnabled || {}).filter(areaId => areaId !== 'pause');
        }
        if (foundryPath.startsWith('pause.')) return ['pause'];

        const areaFromPath = foundryPath.match(/^(?:layout|visibility|componentStyles)\.([^.]+)/)?.[1];
        if (areaFromPath) return [this._normalizeFoundryAreaId(areaFromPath)];

        const componentAreaMap = {
            sceneNavigation: 'navigation',
            tokenControls: 'controls',
            hotbar: 'hotbar',
            sidebar: 'sidebar',
            chatLog: 'chatLog',
            playersList: 'players',
            windows: 'windows'
        };
        const componentKey = foundryPath.split('.')[0];
        return componentAreaMap[componentKey] ? [componentAreaMap[componentKey]] : [];
    }

    _normalizeFoundryAreaId(areaId) {
        return {
            controls: 'controls',
            controlTools: 'controls',
            navigation: 'navigation',
            sceneNavigation: 'navigation',
            players: 'players',
            playersList: 'players',
            hotbar: 'hotbar',
            sidebar: 'sidebar',
            chatLog: 'chatLog',
            windows: 'windows',
            pause: 'pause'
        }[areaId] || areaId;
    }

    _ensureFoundryFeatureSettingForSave() {
        this._syncFoundryFeatureSettingDraft(this._workingFoundryConfig?.enabled !== false);
    }

    async _savePendingVisualSettings() {
        if (!game.user.isGM || this._getPendingVisualSettingCount() <= 0) return;

        for (const [key, value] of Object.entries(this._pendingVisualSettings)) {
            await game.settings.set(MODULE_ID, key, value);
        }
    }

    async _savePendingVisualPresets() {
        if (!this._pendingVisualPresets) return;
        if (typeof this.manager.savePresetMetadata === 'function') {
            await this.manager.savePresetMetadata(this._pendingVisualPresets);
            return;
        }
        if (Array.isArray(this._pendingVisualPresets.favorites) && typeof this.manager.saveFavorites === 'function') {
            await this.manager.saveFavorites(this._pendingVisualPresets.favorites);
        }
    }

    _escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    _getChatPresetLabel(presetId) {
        const preset = getChatPreset(presetId);
        return preset?.name ? game.i18n.localize(preset.name) : presetId || 'none';
    }

    _getUserPresetExportName() {
        const baseName = this._getChatPresetLabel(this._workingConfig?.layout);
        const suffix = game.i18n.localize('YOUR_FLAVOR.Config.Presets.UserPresetSuffix');
        return `${baseName} ${suffix}`;
    }

    _downloadJson(data, filename) {
        const json = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    _slugifyFilename(value) {
        const slug = String(value || 'chat-preset')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        return slug || 'chat-preset';
    }

    _buildIconsContext({ isGM = game.user.isGM, showFoundryTab = false } = {}) {
        const iconConfig = this._getWorkingIconConfig();
        const localize = key => game.i18n.localize(key);
        const registry = getIconRegistry({ localize });
        const dynamicEntries = this._getDynamicIconEntries(iconConfig, { localize });
        const registryEntryIds = new Set(registry.entries.map(entry => entry.id));
        const iconEntries = [
            ...registry.entries,
            ...dynamicEntries.filter(entry => !registryEntryIds.has(entry.id))
        ];
        this._activeIconArea = this._normalizeIconAreaId(this._activeIconArea, registry.areas);
        const discovery = isGM && typeof this.foundryCustomizer?.getIconDiscoveryDiagnostics === 'function'
            ? this.foundryCustomizer.getIconDiscoveryDiagnostics({ localize })
            : null;
        const discoveryEntries = new Map((discovery?.entries ?? []).map(entry => [entry.id, entry]));
        for (const entry of dynamicEntries) {
            discoveryEntries.set(entry.id, inspectIconRegistryEntry(entry, {
                root: globalThis.document,
                localize
            }));
        }
        const selectedEntry = iconConfig.selectedIconId
            ? this._resolveIconEntry(iconConfig.selectedIconId, iconConfig, { localize })
            : null;
        const selectedGroup = selectedEntry
            ? registry.groups.find(group => group.id === selectedEntry.defaultGroup) || null
            : null;
        const selectedArea = selectedEntry
            ? registry.areas.find(area => area.id === selectedEntry.area) || null
            : null;
        const inspector = this._buildSelectedIconInspector({ selectedEntry, selectedGroup, selectedArea, iconConfig });
        const areaEntries = iconEntries.filter(entry => entry.area === this._activeIconArea);
        const activeArea = registry.areas.find(area => area.id === this._activeIconArea) ?? registry.areas[0] ?? null;
        const groupById = new Map(registry.groups.map(group => [group.id, group]));
        const groupsForActiveArea = registry.groups
            .filter(group => areaEntries.some(entry => entry.defaultGroup === group.id))
            .map(group => this._buildIconGroupContext(group, {
                iconConfig,
                entries: areaEntries.filter(entry => entry.defaultGroup === group.id),
                discoveryEntries
            }));
        const activeAreaTargets = areaEntries.map(entry => this._buildIconPreviewPaletteEntry(entry, {
            iconConfig,
            groupColors: this._resolveIconPreviewColorSet(iconConfig.groups?.[entry.defaultGroup]),
            discoveryEntry: discoveryEntries.get(entry.id),
            groupLabel: groupById.get(entry.defaultGroup)?.label ?? entry.defaultGroup
        }));
        const customOverrideCount = activeAreaTargets.filter(entry => entry.hasCustomOverride).length;

        return {
            available: Boolean(isGM && showFoundryTab),
            selectionActive: this._iconSelectionActive,
            selectionButtonLabel: game.i18n.localize(
                this._iconSelectionActive
                    ? 'YOUR_FLAVOR.Config.IconTabs.StopSelection'
                    : 'YOUR_FLAVOR.Config.IconTabs.StartSelection'
            ),
            selectionButtonTitle: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.SelectionTitle'),
            selectedEntry: selectedEntry
                ? {
                    ...selectedEntry,
                    groupLabel: selectedGroup?.label ?? selectedEntry.defaultGroup
                }
                : null,
            selectedLabel: selectedEntry?.label ?? game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.NoSelection'),
            clearSelectionLabel: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.ClearSelection'),
            noInspectorLabel: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.NoInspectorSelection'),
            inspector,
            statusLabel: game.i18n.localize(
                this._iconSelectionActive
                    ? 'YOUR_FLAVOR.Config.IconTabs.SelectionActive'
                    : 'YOUR_FLAVOR.Config.IconTabs.SelectionInactive'
            ),
            areas: registry.areas.map(area => {
                const entries = iconEntries.filter(entry => entry.area === area.id);
                const areaOverrides = entries.filter(entry => this._iconOverrideHasCustomization(iconConfig.overrides?.[entry.id])).length;
                const targetCount = entries.reduce((total, entry) => (
                    total + (discoveryEntries.get(entry.id)?.targetCount ?? 0)
                ), 0);
                return {
                    ...area,
                    isActive: area.id === this._activeIconArea,
                    entryCount: entries.length,
                    overrideCount: areaOverrides,
                    targetCount,
                    summary: this._formatI18n('YOUR_FLAVOR.Config.IconTabs.AreaSummary', {
                        custom: areaOverrides,
                        total: entries.length
                    }),
                    targetLabel: this._formatI18n('YOUR_FLAVOR.Config.Diagnostics.IconMatchCount', {
                        count: targetCount
                    }),
                    className: [
                        area.id === this._activeIconArea ? 'is-active' : '',
                        areaOverrides > 0 ? 'is-changed' : ''
                    ].filter(Boolean).join(' ')
                };
            }),
            activeArea: activeArea
                ? {
                    ...activeArea,
                    targets: activeAreaTargets,
                    groups: groupsForActiveArea,
                    summary: this._formatI18n('YOUR_FLAVOR.Config.IconTabs.PaletteSummary', {
                        custom: customOverrideCount,
                        total: areaEntries.length
                    })
                }
                : null,
            groups: groupsForActiveArea
        };
    }

    _buildIconGroupContext(group, {
        iconConfig = {},
        entries = [],
        discoveryEntries = new Map()
    } = {}) {
        const groupColors = iconConfig.groups?.[group.id] ?? {};
        const resolvedGroupColors = this._resolveIconPreviewColorSet(groupColors);
        const paletteEntries = entries.map(entry => this._buildIconPreviewPaletteEntry(entry, {
            iconConfig,
            groupColors: resolvedGroupColors,
            discoveryEntry: discoveryEntries.get(entry.id),
            groupLabel: group.label
        }));
        const customOverrideCount = paletteEntries.filter(entry => entry.hasCustomOverride).length;
        const presentEntries = entries.filter(entry => discoveryEntries.get(entry.id)?.present).length;
        const totalEntries = entries.length;

        return {
            ...group,
            entries,
            paletteEntries,
            presentEntries,
            totalEntries,
            targetCount: entries.reduce((total, entry) => total + (discoveryEntries.get(entry.id)?.targetCount ?? 0), 0),
            fields: this._getIconColorFieldDefinitions().map(definition => {
                const rawValue = this._getOptionalIconInputColor(groupColors?.[definition.key]);
                const fieldValue = definition.optional
                    ? this._getIconInputColor(resolvedGroupColors[definition.key], '#000000')
                    : this._getIconGroupColor(groupColors, definition.key);

                return {
                    key: definition.key,
                    name: `foundry.icons.groups.${group.id}.${definition.key}`,
                    label: game.i18n.localize(definition.labelKey),
                    value: fieldValue,
                    className: definition.optional ? 'is-background-field' : '',
                    nullable: definition.optional,
                    isStock: definition.optional && !rawValue,
                    stockLabel: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.NoBackground'),
                    clearTitle: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.ClearBackground')
                };
            }),
            summaryLabel: this._formatI18n('YOUR_FLAVOR.Config.IconTabs.GroupTargets', {
                matched: presentEntries,
                total: totalEntries
            }),
            previewSummary: this._formatI18n('YOUR_FLAVOR.Config.IconTabs.PaletteSummary', {
                custom: customOverrideCount,
                total: entries.length
            })
        };
    }

    _buildIconPreviewPaletteEntry(entry, {
        iconConfig = {},
        groupColors = null,
        discoveryEntry = null,
        groupLabel = null
    } = {}) {
        const override = iconConfig.overrides?.[entry.id] ?? null;
        const hasCustomOverride = this._iconOverrideHasCustomization(override);
        const usesIndividualColors = Boolean(override && override.inheritGroup === false);
        const isHidden = Boolean(override?.hidden);
        const colors = usesIndividualColors
            ? this._resolveIconPreviewColorSet(override, groupColors)
            : this._resolveIconPreviewColorSet(groupColors);
        const statusLabel = this._getIconDiscoveryStatusLabel(discoveryEntry?.status);
        const sourceLabel = isHidden
            ? game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.Hidden')
            : (
                usesIndividualColors
                    ? game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.Custom')
                    : game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.Inherited')
            );

        return {
            ...entry,
            groupLabel: groupLabel ?? entry.defaultGroup,
            iconClass: hasCustomOverride && override?.iconClass ? override.iconClass : this._getIconPreviewClass(entry),
            isSelected: iconConfig.selectedIconId === entry.id,
            hasCustomOverride,
            isHidden,
            canChangeIcon: entry.supportsIconClass !== false,
            replacementLabel: override?.iconClass || '',
            hiddenLabel: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.Hidden'),
            sourceLabel,
            statusLabel,
            title: this._formatI18n('YOUR_FLAVOR.Config.IconTabs.PaletteSelectTitle', {
                icon: entry.label ?? entry.id
            }),
            style: this._buildIconPreviewStyle(colors),
            states: this._getIconColorFieldDefinitions().map(definition => {
                const color = colors[definition.key] || 'transparent';
                return {
                    key: definition.key,
                    label: game.i18n.localize(definition.labelKey),
                    color,
                    className: definition.optional ? 'is-background' : 'is-foreground',
                    style: `--yf-icon-preview-swatch:${color}`
                };
            })
        };
    }

    _buildSelectedIconInspector({ selectedEntry = null, selectedGroup = null, selectedArea = null, iconConfig = null } = {}) {
        if (!selectedEntry || !iconConfig) return null;

        const override = iconConfig.overrides?.[selectedEntry.id] ?? null;
        const groupColors = iconConfig.groups?.[selectedEntry.defaultGroup] ?? {};
        const inheritGroup = override?.inheritGroup ?? true;
        const hasOverride = this._iconOverrideHasCustomization(override);
        const iconClassValue = override?.iconClass || '';
        const fallbackIconClass = selectedEntry.iconClass || this._getIconPreviewClass(selectedEntry);
        const iconPicker = this._buildIconPickerContext(iconClassValue || fallbackIconClass);
        const isHidden = Boolean(override?.hidden);
        const canHideIcon = this._canHideIconEntry(selectedEntry);

        return {
            areaLabel: selectedArea?.label ?? selectedEntry.area,
            groupLabel: selectedGroup?.label ?? selectedEntry.defaultGroup,
            inheritGroup,
            hasOverride,
            hidden: isHidden,
            hiddenName: 'iconOverride.hidden',
            canHideIcon,
            visibilityLabel: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.Visibility'),
            visibilityStatusLabel: game.i18n.localize(
                isHidden
                    ? 'YOUR_FLAVOR.Config.IconTabs.HiddenStatus'
                    : 'YOUR_FLAVOR.Config.IconTabs.VisibleStatus'
            ),
            visibilityHint: game.i18n.localize(
                canHideIcon
                    ? 'YOUR_FLAVOR.Config.IconTabs.VisibilityHint'
                    : 'YOUR_FLAVOR.Config.IconTabs.VisibilityUnavailable'
            ),
            hideIconLabel: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.HideIcon'),
            canChangeIcon: selectedEntry.supportsIconClass !== false,
            iconClassName: 'iconOverride.iconClass',
            iconClassValue,
            iconClassPlaceholder: fallbackIconClass,
            iconClassLabel: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.IconClass'),
            iconPickerLabel: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.IconPicker'),
            iconPickerSearchLabel: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.IconPickerSearch'),
            iconPickerSearchPlaceholder: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.IconPickerSearchPlaceholder'),
            iconClassAdvancedLabel: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.IconClassAdvanced'),
            iconClassHint: game.i18n.localize(
                selectedEntry.supportsIconClass !== false
                    ? 'YOUR_FLAVOR.Config.IconTabs.IconClassHint'
                    : 'YOUR_FLAVOR.Config.IconTabs.IconClassUnavailable'
            ),
            iconPicker,
            iconChoices: iconPicker.choices,
            inheritLabel: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.InheritGroup'),
            resetLabel: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.ResetOverride'),
            resetTitle: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.ResetOverrideTitle'),
            fields: this._getIconColorFieldDefinitions().map(definition => {
                const resolvedGroupColors = this._resolveIconPreviewColorSet(groupColors);
                const inheritedColor = definition.optional
                    ? resolvedGroupColors[definition.key]
                    : this._getIconGroupColor(groupColors, definition.key);
                const overrideColor = override?.[definition.key] ?? null;
                const currentColor = inheritGroup
                    ? this._getIconInputColor(inheritedColor, '#000000')
                    : this._getIconInputColor(overrideColor, inheritedColor || '#000000');

                return {
                    key: definition.key,
                    name: `iconOverride.${definition.key}`,
                    label: game.i18n.localize(definition.labelKey),
                    value: currentColor,
                    inheritedValue: inheritedColor,
                    className: definition.optional ? 'is-background-field' : '',
                    inheritedText: inheritedColor
                        ? this._formatI18n('YOUR_FLAVOR.Config.IconTabs.InheritedColor', {
                            color: inheritedColor
                        })
                        : game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.NoBackground'),
                    sourceLabel: inheritGroup
                        ? game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.Inherited')
                        : game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.Custom')
                };
            })
        };
    }

    _getIconColorFieldDefinitions() {
        return [
            { key: 'color', labelKey: 'YOUR_FLAVOR.Config.IconTabs.Color' },
            { key: 'hoverColor', labelKey: 'YOUR_FLAVOR.Config.IconTabs.HoverColor' },
            { key: 'activeColor', labelKey: 'YOUR_FLAVOR.Config.IconTabs.ActiveColor' },
            { key: 'backgroundColor', labelKey: 'YOUR_FLAVOR.Config.IconTabs.BackgroundColor', optional: true },
            { key: 'hoverBackgroundColor', labelKey: 'YOUR_FLAVOR.Config.IconTabs.HoverBackgroundColor', optional: true },
            { key: 'activeBackgroundColor', labelKey: 'YOUR_FLAVOR.Config.IconTabs.ActiveBackgroundColor', optional: true }
        ];
    }

    _iconOverrideHasCustomization(override = null) {
        return Boolean(override && (
            override.inheritGroup === false
            || override.iconClass
            || override.color
            || override.hoverColor
            || override.activeColor
            || override.backgroundColor
            || override.hoverBackgroundColor
            || override.activeBackgroundColor
            || override.hidden === true
        ));
    }

    _canHideIconEntry(entry = null) {
        if (!entry) return false;
        return Boolean(
            entry.dynamic
            || entry.supportsIconClass !== false
            || (entry.styleSelectors ?? []).some(selector => String(selector).includes('::'))
        );
    }

    _buildIconPickerContext(selectedIconClass = '') {
        const selectedCategoryId = this._normalizeIconPickerCategoryId(this._activeIconPickerCategory);
        const choices = this._buildIconPickerChoices(selectedIconClass);
        const availableCategories = FONT_AWESOME_ICON_PICKER_CATEGORIES.map(category => {
            const count = choices.filter(choice => this._iconPickerChoiceMatchesCategory(choice, category.id)).length;
            return {
                ...category,
                label: game.i18n.localize(category.labelKey),
                count
            };
        }).filter(category => category.id === 'all' || category.count > 0);
        const safeSelectedCategoryId = availableCategories.some(category => category.id === selectedCategoryId)
            ? selectedCategoryId
            : 'all';
        const categories = availableCategories.map(category => ({
            ...category,
            isActive: category.id === safeSelectedCategoryId
        }));
        const visibleCount = choices.filter(choice => this._iconPickerChoiceMatchesCategory(choice, safeSelectedCategoryId)).length;

        return {
            selectedCategoryId: safeSelectedCategoryId,
            categoryLabel: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.IconPickerCategory'),
            resultCountLabel: this._formatI18n('YOUR_FLAVOR.Config.IconTabs.IconPickerResults', {
                shown: visibleCount,
                total: choices.length
            }),
            noResultsLabel: game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.IconPickerNoResults'),
            categories,
            choices: choices.map(choice => ({
                ...choice,
                isVisible: this._iconPickerChoiceMatchesCategory(choice, safeSelectedCategoryId)
            }))
        };
    }

    _buildIconPickerChoices(selectedIconClass = '') {
        const normalizedSelected = this._normalizeIconClassInput(selectedIconClass) || '';
        const choices = FONT_AWESOME_ICON_PICKER_CATALOG.map((choice, index) => {
            const className = this._normalizeIconClassInput(choice.iconClass) || choice.iconClass;
            const searchText = [
                choice.label,
                className,
                choice.category,
                choice.keywords
            ].filter(Boolean).join(' ').toLowerCase();

            return {
                id: `fa-choice-${index}`,
                label: choice.label,
                className,
                category: choice.category,
                recommended: Boolean(choice.recommended),
                searchText,
                isSelected: normalizedSelected === className,
                isAvailable: this._isFontAwesomeIconClassAvailable(className)
            };
        });
        const availableChoices = choices.filter(choice => choice.isAvailable !== false);
        const hasReliableAvailability = availableChoices.length >= Math.max(24, Math.floor(choices.length * 0.2));
        return hasReliableAvailability ? availableChoices : choices;
    }

    _iconPickerChoiceMatchesCategory(choice, categoryId) {
        const normalizedCategoryId = this._normalizeIconPickerCategoryId(categoryId);
        if (normalizedCategoryId === 'all') return true;
        if (normalizedCategoryId === 'recommended') return choice.recommended || choice.isSelected;
        return choice.category === normalizedCategoryId;
    }

    _normalizeIconPickerCategoryId(categoryId) {
        const id = String(categoryId || '').trim();
        return FONT_AWESOME_ICON_PICKER_CATEGORY_IDS.has(id) ? id : 'recommended';
    }

    _isFontAwesomeIconClassAvailable(iconClass) {
        const className = this._normalizeIconClassInput(iconClass);
        if (!className) return false;
        this._fontAwesomeIconAvailability ??= new Map();
        if (this._fontAwesomeIconAvailability.has(className)) {
            return this._fontAwesomeIconAvailability.get(className);
        }

        if (!globalThis.document?.body || typeof globalThis.getComputedStyle !== 'function') {
            this._fontAwesomeIconAvailability.set(className, true);
            return true;
        }

        const probe = globalThis.document.createElement('i');
        probe.className = className;
        probe.setAttribute('aria-hidden', 'true');
        probe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;';
        globalThis.document.body.appendChild(probe);

        let available = true;
        try {
            const elementStyle = globalThis.getComputedStyle(probe);
            const beforeStyle = globalThis.getComputedStyle(probe, '::before');
            const faVariable = (
                elementStyle.getPropertyValue('--fa')
                || beforeStyle.getPropertyValue('--fa')
                || ''
            ).trim();
            const content = String(beforeStyle.content || '').trim();
            available = Boolean(faVariable) || Boolean(content && !['none', 'normal', '""', "''"].includes(content));
        } catch (_error) {
            available = true;
        } finally {
            probe.remove();
        }

        this._fontAwesomeIconAvailability.set(className, available);
        return available;
    }

    _getDynamicIconEntries(iconConfig = {}, { localize = null } = {}) {
        const overrideEntries = getIconOverrideRegistryEntries(iconConfig.overrides, { localize });
        const entryMap = new Map(overrideEntries.map(entry => [entry.id, entry]));

        for (const [iconId, entry] of this._dynamicIconEntries ?? []) {
            if (!entryMap.has(iconId)) entryMap.set(iconId, this._localizeRememberedIconEntry(entry, localize));
        }

        return Array.from(entryMap.values());
    }

    _resolveIconEntry(iconId, iconConfig = this._getWorkingIconConfig(), { localize = null } = {}) {
        return resolveIconRegistryEntry(iconId, {
            overrides: iconConfig.overrides,
            localize
        }) || this._localizeRememberedIconEntry(this._dynamicIconEntries?.get(iconId), localize);
    }

    _localizeRememberedIconEntry(entry, localize = null) {
        if (!entry) return null;
        const copy = foundry.utils.deepClone(entry);
        if (typeof localize === 'function' && copy.labelKey) copy.label = localize(copy.labelKey);
        return copy;
    }

    _getIconPreviewClass(entryOrId) {
        if (entryOrId && typeof entryOrId === 'object') {
            return entryOrId.iconClass || 'fas fa-icons';
        }
        const iconConfig = this._getWorkingIconConfig();
        const entry = this._resolveIconEntry(entryOrId, iconConfig, { localize: key => game.i18n.localize(key) });
        return entry?.iconClass || 'fas fa-icons';
    }

    _getIconDiscoveryStatusLabel(status = null) {
        const normalizedStatus = ['found', 'missing', 'invalid'].includes(status) ? status : 'missing';
        const statusKey = {
            found: 'YOUR_FLAVOR.Config.Diagnostics.SelectorStatus.Found',
            missing: 'YOUR_FLAVOR.Config.Diagnostics.SelectorStatus.Missing',
            invalid: 'YOUR_FLAVOR.Config.Diagnostics.SelectorStatus.Invalid'
        }[normalizedStatus];
        return game.i18n.localize(statusKey);
    }

    _resolveIconPreviewColorSet(colorSet = {}, fallback = null) {
        const color = this._getIconInputColor(colorSet?.color, fallback?.color || '#000000');
        const hoverColor = this._getIconInputColor(colorSet?.hoverColor, fallback?.hoverColor || color);
        const activeColor = this._getIconInputColor(colorSet?.activeColor, fallback?.activeColor || hoverColor);
        const backgroundColor = this._getOptionalIconInputColor(colorSet?.backgroundColor)
            || fallback?.backgroundColor
            || null;
        const hoverBackgroundColor = this._getOptionalIconInputColor(colorSet?.hoverBackgroundColor)
            || fallback?.hoverBackgroundColor
            || backgroundColor;
        const activeBackgroundColor = this._getOptionalIconInputColor(colorSet?.activeBackgroundColor)
            || fallback?.activeBackgroundColor
            || hoverBackgroundColor
            || backgroundColor;
        return {
            color,
            hoverColor,
            activeColor,
            backgroundColor,
            hoverBackgroundColor,
            activeBackgroundColor
        };
    }

    _buildIconPreviewStyle(colors = {}) {
        return [
            `--yf-icon-preview-color:${colors.color}`,
            `--yf-icon-preview-hover:${colors.hoverColor}`,
            `--yf-icon-preview-active:${colors.activeColor}`,
            `--yf-icon-preview-bg:${colors.backgroundColor || 'transparent'}`,
            `--yf-icon-preview-hover-bg:${colors.hoverBackgroundColor || colors.backgroundColor || 'transparent'}`,
            `--yf-icon-preview-active-bg:${colors.activeBackgroundColor || colors.hoverBackgroundColor || colors.backgroundColor || 'transparent'}`
        ].join(';');
    }

    _getWorkingIconConfig() {
        return normalizeLegacyIcons(this._workingFoundryConfig);
    }

    _setSelectedIconId(iconId) {
        const iconConfig = this._getWorkingIconConfig();
        iconConfig.selectedIconId = iconId || null;
        this._workingFoundryConfig.icons = iconConfig;
    }

    _setSelectedIconOverrideField(field, value) {
        if (![
            'color',
            'hoverColor',
            'activeColor',
            'backgroundColor',
            'hoverBackgroundColor',
            'activeBackgroundColor',
            'inheritGroup',
            'iconClass',
            'hidden'
        ].includes(field)) return false;

        const iconConfig = this._getWorkingIconConfig();
        const iconId = iconConfig.selectedIconId;
        const entry = iconId ? this._resolveIconEntry(iconId, iconConfig, {
            localize: key => game.i18n.localize(key)
        }) : null;
        if (!entry) return false;
        const fieldDefinition = this._getIconColorFieldDefinitions().find(definition => definition.key === field);

        iconConfig.overrides ||= {};
        const override = {
            color: null,
            hoverColor: null,
            activeColor: null,
            backgroundColor: null,
            hoverBackgroundColor: null,
            activeBackgroundColor: null,
            inheritGroup: true,
            hidden: false,
            ...(iconConfig.overrides[iconId] ?? {})
        };

        if (field === 'inheritGroup') {
            override.inheritGroup = Boolean(value);
            if (!override.inheritGroup) {
                this._seedIconOverrideColors(override, iconConfig.groups?.[entry.defaultGroup]);
            }
        } else if (field === 'iconClass') {
            if (!entry.supportsIconClass) return false;
            override.iconClass = this._normalizeIconClassInput(value);
            override.inheritGroup = false;
            this._seedIconOverrideColors(override, iconConfig.groups?.[entry.defaultGroup]);
        } else if (field === 'hidden') {
            if (!this._canHideIconEntry(entry)) return false;
            override.hidden = Boolean(value);
        } else {
            const fallbackColor = fieldDefinition?.optional
                ? '#000000'
                : iconConfig.groups?.[entry.defaultGroup]?.color;
            override[field] = this._getIconInputColor(value, fallbackColor);
            override.inheritGroup = false;
        }

        iconConfig.overrides[iconId] = override;
        this._workingFoundryConfig.icons = iconConfig;
        return true;
    }

    _resetSelectedIconOverride() {
        const iconConfig = this._getWorkingIconConfig();
        const iconId = iconConfig.selectedIconId;
        if (!iconId || !iconConfig.overrides?.[iconId]) return false;

        const existing = iconConfig.overrides[iconId];
        if (existing.dynamic) {
            iconConfig.overrides[iconId] = {
                dynamic: true,
                area: existing.area,
                defaultGroup: existing.defaultGroup,
                label: existing.label,
                labelKey: existing.labelKey,
                selector: existing.selector,
                selectors: existing.selectors,
                styleSelectors: existing.styleSelectors,
                matchSelectors: existing.matchSelectors,
                baseIconClass: existing.baseIconClass,
                supportsIconClass: existing.supportsIconClass,
                color: null,
                hoverColor: null,
                activeColor: null,
                backgroundColor: null,
                hoverBackgroundColor: null,
                activeBackgroundColor: null,
                iconClass: null,
                hidden: false,
                inheritGroup: true
            };
        } else {
            delete iconConfig.overrides[iconId];
        }
        this._workingFoundryConfig.icons = iconConfig;
        return true;
    }

    _seedIconOverrideColors(override, groupColors = {}) {
        for (const field of ['color', 'hoverColor', 'activeColor']) {
            override[field] ||= this._getIconGroupColor(groupColors, field);
        }
    }

    _getIconGroupColor(groupColors = {}, field = 'color') {
        const fallback = groupColors.color || groupColors.hoverColor || '#000000';
        if (field === 'hoverColor') return this._getIconInputColor(groupColors.hoverColor, fallback);
        if (field === 'activeColor') return this._getIconInputColor(groupColors.activeColor, fallback);
        return this._getIconInputColor(groupColors.color, fallback);
    }

    _getIconInputColor(value, fallback = '#000000') {
        if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value.trim())) {
            return value.trim();
        }
        if (typeof fallback === 'string' && /^#[0-9a-f]{6}$/i.test(fallback.trim())) {
            return fallback.trim();
        }
        return '#000000';
    }

    _getOptionalIconInputColor(value) {
        if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value.trim())) {
            return value.trim();
        }
        return null;
    }

    _normalizeIconClassInput(value) {
        if (typeof value !== 'string') return null;
        const classes = value
            .trim()
            .split(/\s+/)
            .map(className => className.replace(/[^a-z0-9_-]/gi, ''))
            .filter(Boolean);
        if (!classes.some(className => className.startsWith('fa-'))) return null;
        if (!classes.some(className => ['fa', 'fas', 'far', 'fal', 'fad', 'fab', 'fat', 'fass', 'fasr', 'fasl', 'fa-solid', 'fa-regular', 'fa-light', 'fa-thin', 'fa-duotone', 'fa-brands'].includes(className))) {
            classes.unshift('fas');
        }
        return [...new Set(classes)].join(' ');
    }

    _normalizeIconAreaId(areaId, areas = null) {
        const availableAreas = areas ?? getIconRegistry({ localize: key => game.i18n.localize(key) }).areas;
        const id = String(areaId || '').trim();
        return availableAreas.some(area => area.id === id)
            ? id
            : availableAreas[0]?.id ?? 'navigation';
    }

    _syncIconPreviewPaletteDom() {
        if (!this.element) return;

        const iconConfig = this._getWorkingIconConfig();
        const registry = getIconRegistry({ localize: key => game.i18n.localize(key) });
        const dynamicEntries = this._getDynamicIconEntries(iconConfig, {
            localize: key => game.i18n.localize(key)
        });
        const entryMap = new Map([
            ...registry.entries.map(entry => [entry.id, entry]),
            ...dynamicEntries.map(entry => [entry.id, entry])
        ]);

        this.element.querySelectorAll('.yf-icon-preview-tile[data-icon-id], .yf-icon-target-card[data-icon-id]').forEach(tile => {
            const entry = entryMap.get(tile.dataset.iconId);
            if (!entry) return;

            const groupColors = this._resolveIconPreviewColorSet(iconConfig.groups?.[entry.defaultGroup]);
            const override = iconConfig.overrides?.[entry.id] ?? null;
            const hasCustomOverride = this._iconOverrideHasCustomization(override);
            const usesIndividualColors = Boolean(override && override.inheritGroup === false);
            const isHidden = Boolean(override?.hidden);
            const colors = usesIndividualColors
                ? this._resolveIconPreviewColorSet(override, groupColors)
                : groupColors;

            tile.setAttribute('style', this._buildIconPreviewStyle(colors));
            tile.classList.toggle('is-selected', iconConfig.selectedIconId === entry.id);
            tile.classList.toggle('has-override', hasCustomOverride);
            tile.classList.toggle('is-hidden-override', isHidden);
            tile.setAttribute('aria-pressed', iconConfig.selectedIconId === entry.id ? 'true' : 'false');

            const source = tile.querySelector('[data-icon-preview-source]');
            if (source) {
                source.textContent = isHidden
                    ? game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.Hidden')
                    : (
                        usesIndividualColors
                            ? game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.Custom')
                            : game.i18n.localize('YOUR_FLAVOR.Config.IconTabs.Inherited')
                    );
            }

            const iconClass = hasCustomOverride && override?.iconClass ? override.iconClass : this._getIconPreviewClass(entry);
            tile.querySelectorAll('[data-icon-preview-icon]').forEach(icon => {
                icon.className = iconClass;
            });

            tile.querySelectorAll('[data-icon-preview-swatch]').forEach(swatch => {
                const field = swatch.dataset.iconPreviewSwatch;
                if (!field) return;
                swatch.style.setProperty('--yf-icon-preview-swatch', colors[field] || 'transparent');
            });
        });
    }

    _enableIconSelectionMode({ silent = false } = {}) {
        if (
            !game.user.isGM
            || !this.foundryCustomizer
            || this._workingFoundryConfig?.enabled === false
        ) {
            this._iconSelectionActive = false;
            this.foundryCustomizer?.disableIconSelectionMode?.();
            if (!silent) ui.notifications.warn(game.i18n.localize('YOUR_FLAVOR.Notifications.IconSelectionUnavailable'));
            return false;
        }

        this.foundryCustomizer.disableArrangeMode?.();
        const iconConfig = this._getWorkingIconConfig();
        const started = this.foundryCustomizer.enableIconSelectionMode?.({
            selectedIconId: iconConfig.selectedIconId,
            onSelect: ({ entry, element }) => this._onFoundryIconSelected(entry, element)
        });

        if (!started) {
            if (!silent) ui.notifications.warn(game.i18n.localize('YOUR_FLAVOR.Notifications.IconSelectionUnavailable'));
            return false;
        }

        this._iconSelectionActive = true;
        if (!silent) ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.IconSelectionEnabled'));
        return true;
    }

    _disableIconSelectionMode({ silent = false } = {}) {
        if (!this._iconSelectionActive && !this.foundryCustomizer?.isIconSelectionModeActive?.()) return;
        this.foundryCustomizer?.disableIconSelectionMode?.();
        this._iconSelectionActive = false;
        if (!silent) ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.IconSelectionDisabled'));
    }

    _syncIconSelectionMode() {
        if (this._activeTab !== 'icons') {
            this._disableIconSelectionMode({ silent: true });
            return;
        }

        if (!this._iconSelectionActive) return;
        this._enableIconSelectionMode({ silent: true });
    }

    _onFoundryIconSelected(entry, element = null) {
        if (!entry?.id) return;
        if (this._shouldRememberSelectedIconEntry(entry)) {
            this._rememberDynamicIconEntry(entry);
        }
        this._setSelectedIconId(entry.id);
        if (this._shouldRememberSelectedIconEntry(entry) && !this._getWorkingIconConfig().overrides?.[entry.id]) {
            this._rememberDynamicIconEntry(entry);
            this._setSelectedIconId(entry.id);
        }
        if (entry.area) {
            this._activeIconArea = this._normalizeIconAreaId(entry.area);
            this._activeFoundryPreviewArea = this.previewController.normalizeFoundryPreviewAreaId(entry.area);
        }
        this._applyWorkingFoundryConfig();
        this._syncDirtyIndicators();
        ui.notifications.info(this._formatI18n('YOUR_FLAVOR.Notifications.IconSelected', {
            icon: entry.label ?? entry.id
        }));
        this.render();
    }

    _shouldRememberSelectedIconEntry(entry) {
        return Boolean(
            entry?.dynamic
            || String(entry?.id || '').startsWith('dynamic.')
            || (entry?.selectors || []).some(selector => String(selector).includes('data-yf-icon-target-id'))
            || (entry?.matchSelectors || []).some(selector => String(selector).includes('data-yf-icon-target-id'))
        );
    }

    _rememberDynamicIconEntry(entry) {
        const iconConfig = this._getWorkingIconConfig();
        iconConfig.overrides ||= {};
        const existing = iconConfig.overrides[entry.id] ?? {};
        const selectors = this._normalizeIconSelectorList(entry.selectors ?? entry.selector);
        const styleSelectors = this._normalizeIconSelectorList(entry.styleSelectors ?? selectors);
        const matchSelectors = this._normalizeIconSelectorList(entry.matchSelectors ?? selectors);
        const baseSelectors = selectors.length ? selectors : (matchSelectors.length ? matchSelectors : styleSelectors);
        if (!baseSelectors.length) return false;

        const rememberedEntry = this._cloneDynamicIconEntry(entry);
        const hasExistingCustomization = Boolean(
            existing.inheritGroup === false
            || existing.color
            || existing.hoverColor
            || existing.activeColor
            || existing.backgroundColor
            || existing.hoverBackgroundColor
            || existing.activeBackgroundColor
            || existing.iconClass
            || existing.hidden === true
        );
        this._dynamicIconEntries ??= new Map();
        this._dynamicIconEntries.set(entry.id, rememberedEntry);

        const dynamicOverride = {
            ...existing,
            dynamic: true,
            area: entry.area,
            defaultGroup: entry.defaultGroup,
            label: entry.label ?? entry.id,
            labelKey: entry.labelKey ?? existing.labelKey ?? null,
            selector: baseSelectors.join(', '),
            selectors: baseSelectors,
            styleSelectors: styleSelectors.length ? styleSelectors : baseSelectors,
            matchSelectors: matchSelectors.length ? matchSelectors : baseSelectors,
            baseIconClass: entry.iconClass || existing.baseIconClass || null,
            supportsIconClass: entry.supportsIconClass !== false,
            inheritGroup: hasExistingCustomization ? existing.inheritGroup : false
        };
        iconConfig.overrides[entry.id] = dynamicOverride;
        this._workingFoundryConfig.icons = iconConfig;
        return true;
    }

    _cloneDynamicIconEntry(entry) {
        const selectors = this._normalizeIconSelectorList(entry.selectors ?? entry.selector);
        const styleSelectors = this._normalizeIconSelectorList(entry.styleSelectors ?? selectors);
        const matchSelectors = this._normalizeIconSelectorList(entry.matchSelectors ?? selectors);
        const baseSelectors = selectors.length ? selectors : (matchSelectors.length ? matchSelectors : styleSelectors);

        return {
            id: entry.id,
            area: entry.area,
            selector: baseSelectors.join(', '),
            selectors: baseSelectors,
            styleSelectors: styleSelectors.length ? styleSelectors : baseSelectors,
            matchSelectors: matchSelectors.length ? matchSelectors : baseSelectors,
            label: entry.label ?? entry.id,
            labelKey: entry.labelKey ?? null,
            defaultGroup: entry.defaultGroup,
            iconClass: entry.iconClass || 'fas fa-icons',
            supportsIconClass: entry.supportsIconClass !== false,
            legacy: false,
            dynamic: true,
            states: foundry.utils.deepClone(entry.states ?? [])
        };
    }

    _normalizeIconSelectorList(value) {
        const source = Array.isArray(value) ? value : [value];
        return [...new Set(source
            .filter(selector => typeof selector === 'string')
            .map(selector => selector.trim())
            .filter(Boolean))];
    }

    _syncDirtyIndicators() {
        const dirtyAreas = this.configStore.getDirtyAreas();
        const dirtyLabel = game.i18n.localize('YOUR_FLAVOR.Config.Dirty.UnsavedShort');

        this.element?.querySelectorAll('.yf-tab[data-tab], .yf-area-card[data-tab]').forEach(element => {
            const isDirty = Boolean(dirtyAreas[element.dataset.tab]);
            element.classList.toggle('is-dirty', isDirty);

            const indicator = element.querySelector('.yf-dirty-indicator, .yf-area-dirty-badge');
            if (!indicator) return;

            const label = element.querySelector('.yf-tab-label, .yf-area-card-label')?.textContent?.trim() || '';
            indicator.hidden = !isDirty;
            indicator.title = this._formatI18n('YOUR_FLAVOR.Config.Dirty.UnsavedTitle', { area: label });
            indicator.setAttribute('aria-label', indicator.title);
            if (indicator.classList.contains('yf-area-dirty-badge')) {
                indicator.textContent = dirtyLabel;
            }
        });
    }

    _buildDiagnosticsContext({ isGM = game.user.isGM, showFoundryTab = false } = {}) {
        const chatWarnings = this.previewController.getContrastWarnings('chat', this._workingConfig);
        const foundryWarnings = isGM
            ? this.previewController.getContrastWarnings('foundry', this._workingFoundryConfig)
            : [];
        const messageDiagnostics = game.modules.get(MODULE_ID)?.api?.getMessageDiagnostics?.() ?? [];
        const rawSelectorHealth = isGM && typeof this.foundryCustomizer?.getSelectorHealth === 'function'
            ? this.foundryCustomizer.getSelectorHealth()
            : null;
        const rawIconDiscovery = isGM
            ? (
                typeof this.foundryCustomizer?.getIconDiscoveryDiagnostics === 'function'
                    ? this.foundryCustomizer.getIconDiscoveryDiagnostics({ localize: key => game.i18n.localize(key) })
                    : game.modules.get(MODULE_ID)?.api?.getIconDiscoveryDiagnostics?.() ?? null
            )
            : null;
        const selectorStatusLabels = {
            found: game.i18n.localize('YOUR_FLAVOR.Config.Diagnostics.SelectorStatus.Found'),
            missing: game.i18n.localize('YOUR_FLAVOR.Config.Diagnostics.SelectorStatus.Missing'),
            invalid: game.i18n.localize('YOUR_FLAVOR.Config.Diagnostics.SelectorStatus.Invalid')
        };
        const selectorHealth = rawSelectorHealth
            ? {
                ...rawSelectorHealth,
                rows: rawSelectorHealth.areas.map(area => ({
                    ...area,
                    label: game.i18n.localize(area.labelKey),
                    statusLabel: selectorStatusLabels[area.status] ?? area.status,
                    summaryLabel: this._formatI18n('YOUR_FLAVOR.Config.Diagnostics.SelectorSummary', {
                        matched: area.matchedSelectors,
                        total: area.selectorCount,
                        targets: area.targetCount
                    }),
                    selectors: area.selectors.map(selector => ({
                        ...selector,
                        countLabel: selector.invalid
                            ? game.i18n.localize('YOUR_FLAVOR.Config.Diagnostics.InvalidSelector')
                            : this._formatI18n('YOUR_FLAVOR.Config.Diagnostics.SelectorMatchCount', {
                                count: selector.count
                            })
                    }))
                }))
            }
            : null;
        const iconDiscovery = rawIconDiscovery
            ? {
                ...rawIconDiscovery,
                rows: rawIconDiscovery.groups.map(group => ({
                    ...group,
                    label: group.label ?? game.i18n.localize(group.labelKey),
                    statusLabel: selectorStatusLabels[group.status] ?? group.status,
                    summaryLabel: this._formatI18n('YOUR_FLAVOR.Config.Diagnostics.IconDiscoverySummary', {
                        matched: group.presentEntries,
                        total: group.totalEntries,
                        targets: group.targetCount
                    }),
                    entries: group.entries.map(entry => ({
                        ...entry,
                        label: entry.label ?? game.i18n.localize(entry.labelKey),
                        statusLabel: selectorStatusLabels[entry.status] ?? entry.status,
                        countLabel: entry.invalid
                            ? game.i18n.localize('YOUR_FLAVOR.Config.Diagnostics.InvalidSelector')
                            : this._formatI18n('YOUR_FLAVOR.Config.Diagnostics.IconMatchCount', {
                                count: entry.targetCount
                            })
                    }))
                }))
            }
            : null;
        const safeFallbackMessages = messageDiagnostics
            .filter(entry => entry.type === 'safe-fallback')
            .slice(0, 5)
            .map(entry => ({
                ...entry,
                systemLabel: entry.systemId || game.i18n.localize('YOUR_FLAVOR.Config.Diagnostics.UnknownSystem'),
                reasonLabel: entry.reasons?.length
                    ? entry.reasons.join(', ')
                    : game.i18n.localize('YOUR_FLAVOR.Config.Diagnostics.UnknownReason'),
                fallbackLabel: game.i18n.localize('YOUR_FLAVOR.Config.Diagnostics.SafeOuterOnly')
            }));

        return {
            foundryVersion: game.version || game.release?.version || '',
            systemId: game.system?.id || '',
            systemTitle: game.system?.title || game.system?.id || '',
            foundryTabAvailable: showFoundryTab,
            selectorHealthAvailable: Boolean(selectorHealth),
            selectorHealth,
            selectorPresentAreas: selectorHealth?.presentAreas ?? 0,
            selectorTotalAreas: selectorHealth?.totalAreas ?? 0,
            iconDiscoveryAvailable: Boolean(iconDiscovery),
            iconDiscovery,
            iconDiscoveryPresentEntries: iconDiscovery?.presentEntries ?? 0,
            iconDiscoveryTotalEntries: iconDiscovery?.totalEntries ?? 0,
            iconDiscoveryTargetCount: iconDiscovery?.targetCount ?? 0,
            iconDiscoveryTargetLabel: this._formatI18n('YOUR_FLAVOR.Config.Diagnostics.IconMatchCount', {
                count: iconDiscovery?.targetCount ?? 0
            }),
            safeFallbackCount: safeFallbackMessages.length,
            safeFallbackMessages,
            chatWarningCount: chatWarnings.length,
            foundryWarningCount: foundryWarnings.length,
            totalWarningCount: chatWarnings.length + foundryWarnings.length,
            chatWarnings: chatWarnings.slice(0, 5),
            foundryWarnings: foundryWarnings.slice(0, 5)
        };
    }

    _setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
    }

    _updateFoundryFieldOverride(foundryPath, value) {
        if (!this._usesWorkingFoundryFieldOverrides()) return;
        if (!this._shouldTrackFoundryFieldOverride(foundryPath)) return;
        if (this._isFoundryStockValue(foundryPath, value)) {
            this._clearFoundryFieldOverride(foundryPath);
            return;
        }
        this._markFoundryFieldOverride(foundryPath);
    }

    _markFoundryFieldOverride(foundryPath) {
        if (!this._usesWorkingFoundryFieldOverrides()) return;
        if (!this._shouldTrackFoundryFieldOverride(foundryPath)) return;
        this._workingFoundryConfig.fieldOverrides ||= {};
        this._workingFoundryConfig.fieldOverrides[foundryPath] = true;
    }

    _markFoundryFieldOverridesForObject(prefix, value = {}) {
        if (!prefix || !value || typeof value !== 'object' || Array.isArray(value)) return;
        for (const key of Object.keys(value)) {
            this._markFoundryFieldOverride(`${prefix}.${key}`);
        }
    }

    _clearFoundryFieldOverride(foundryPath) {
        if (!this._usesWorkingFoundryFieldOverrides()) return;
        if (!this._workingFoundryConfig?.fieldOverrides) return;
        delete this._workingFoundryConfig.fieldOverrides[foundryPath];
    }

    _clearFoundryFieldOverridesForPrefix(prefix) {
        if (!this._usesWorkingFoundryFieldOverrides()) return;
        if (!this._workingFoundryConfig?.fieldOverrides || !prefix) return;
        for (const path of Object.keys(this._workingFoundryConfig.fieldOverrides)) {
            if (path.startsWith(prefix)) delete this._workingFoundryConfig.fieldOverrides[path];
        }
    }

    _usesWorkingFoundryFieldOverrides() {
        const overrides = this._workingFoundryConfig?.fieldOverrides;
        return Boolean(overrides && typeof overrides === 'object' && !Array.isArray(overrides));
    }

    _shouldTrackFoundryFieldOverride(foundryPath) {
        return Boolean(
            foundryPath
            && foundryPath !== 'enabled'
            && !foundryPath.startsWith('categories.')
            && !foundryPath.startsWith('areaEnabled.')
            && foundryPath !== 'icons.selectedIconId'
        );
    }

    _isFoundryStockValue(foundryPath, value) {
        if (foundryPath === 'customCss') return !String(value || '').trim();
        if (foundryPath === 'theme.interfaceFont' || foundryPath === 'theme.windowFont') {
            return !value || value === 'inherit';
        }
        if (foundryPath.startsWith('theme.') || /(?:Color|color|Background)$/.test(foundryPath)) {
            return value === null || value === '';
        }
        if (foundryPath.startsWith('visibility.')) return value !== false;
        if (foundryPath.endsWith('.enabled') || typeof value === 'boolean') return value === false;
        if (foundryPath.endsWith('.backgroundImage')) return !String(value || '').trim();
        if (foundryPath.endsWith('.borderStyle')) return !value || value === 'none';
        if (foundryPath.endsWith('.borderWidth') || foundryPath.endsWith('.borderRadius')) return Number(value) === 0;
        if (foundryPath.endsWith('.opacity') || foundryPath.endsWith('.backgroundOpacity')) return Number(value) === 100;
        return value === null || value === undefined || value === '';
    }

    _switchPreviewFixture(fixtureId) {
        if (!fixtureId || fixtureId === this._activePreviewFixtureId) return;
        this._activePreviewFixtureId = fixtureId;
        this.render();
    }

    _switchFoundryPreviewArea(areaId) {
        const nextAreaId = this.previewController.normalizeFoundryPreviewAreaId(areaId);
        if (!nextAreaId || nextAreaId === this._activeFoundryPreviewArea) return;
        this._activeFoundryPreviewArea = nextAreaId;
        this.render();
    }

    _switchFoundrySection(sectionId) {
        const nextSectionId = this.foundryTab.normalizeSectionId(sectionId, this._workingFoundryConfig);
        if (!nextSectionId || nextSectionId === this._activeFoundrySection) return;
        this._activeFoundrySection = nextSectionId;
        const previewAreaId = this.foundryTab.getSectionPreviewAreaId(nextSectionId);
        if (previewAreaId) {
            this._activeFoundryPreviewArea = this.previewController.normalizeFoundryPreviewAreaId(previewAreaId);
        }
        this.render();
    }

    _buildChatTokenStates(config = this._workingConfig) {
        return this.chatTab.buildTokenStates(config);
    }

    _buildChatTokenState(tokenKey, config = this._workingConfig) {
        return this.chatTab.buildTokenState(tokenKey, config);
    }

    _getChatTokenResetValue(tokenKey) {
        return this.chatTab.getResetValue(tokenKey, this._workingConfig?.layout);
    }

    _getChatPresetTokenValue(tokenKey, layoutId = this._workingConfig?.layout) {
        return this.chatTab.getPresetTokenValue(tokenKey, layoutId);
    }

    _sameTokenValue(left, right) {
        return this.chatTab.sameTokenValue(left, right);
    }

    _normalizeTokenValue(value) {
        return this.chatTab.normalizeTokenValue(value);
    }

    _tokenStatusLabel(source) {
        return this.chatTab.tokenStatusLabel(source);
    }

    _tokenStatusTitle(source) {
        return this.chatTab.tokenStatusTitle(source);
    }

    _tokenResetTitle(targetSource) {
        return this.chatTab.tokenResetTitle(targetSource);
    }

    _applyWorkingFoundryConfig() {
        if (!this.foundryCustomizer) return;
        if (typeof this.foundryCustomizer.applyPreviewConfig === 'function') {
            this.foundryCustomizer.applyPreviewConfig(this._workingFoundryConfig, {
                forceFeatureEnabled: this._workingFoundryConfig?.enabled !== false
                    || this._isFoundryFeatureEnabledInDraft()
            });
        } else {
            this.foundryCustomizer.applyConfig(this._workingFoundryConfig);
        }
        this._updatePreview();
        this._updateContrastDiagnostics();
    }

    _syncFoundryLayoutControls() {
        this.foundryTab.syncLayoutControls(this.element, this._workingFoundryConfig);
    }

    _updatePreview() {
        this.previewController.update();
    }

    _applyChatLogPreview() {
        this.previewController.applyChatLogPreview();
    }

    _clearChatLogPreview() {
        this.previewController.clearChatLogPreview();
    }

    _commitChatLogPreview() {
        this.previewController.commitChatLogPreview();
    }

    _updateContrastDiagnostics() {
        this.previewController.updateContrastDiagnostics();
    }

    _getActiveContrastWarnings() {
        return this.previewController.getActiveContrastWarnings();
    }

    _buildFoundryPreviewContext(foundryConfig, state = 'after') {
        return this.previewController.buildFoundryPreviewContext(foundryConfig, state);
    }

    _applyFoundryPreviewToShell(shellPreview, foundryConfig) {
        this.previewController.applyFoundryPreviewToShell(shellPreview, foundryConfig);
    }

    _buildFoundryPreviewStyle(foundryConfig) {
        return this.previewController.buildFoundryPreviewStyle(foundryConfig);
    }

    _getFoundryPreviewShellClass(foundryConfig) {
        return this.previewController.getFoundryPreviewShellClass(foundryConfig);
    }

    _normalizeFoundryPreviewConfig(foundryConfig) {
        return this.previewController.normalizeFoundryPreviewConfig(foundryConfig);
    }

    _applyFoundryComponentPreviewStyles(shellPreview, foundryConfig) {
        this.previewController.applyFoundryComponentPreviewStyles(shellPreview, foundryConfig);
    }

    _applyFoundryComponentPreviewStyle(element, componentStyle = null) {
        this.previewController.applyFoundryComponentPreviewStyle(element, componentStyle);
    }

    _clearFoundryComponentPreviewStyle(element) {
        this.previewController.clearFoundryComponentPreviewStyle(element);
    }

    _clampNumber(value, min, max) {
        return this.previewController.clampNumber(value, min, max);
    }

    _escapeCssUrl(value) {
        return this.previewController.escapeCssUrl(value);
    }

    _getPreviewFixtureGroupLabels() {
        return {
            chat: game.i18n.localize('YOUR_FLAVOR.PreviewFixtures.Groups.Chat'),
            rolls: game.i18n.localize('YOUR_FLAVOR.PreviewFixtures.Groups.Rolls'),
            cards: game.i18n.localize('YOUR_FLAVOR.PreviewFixtures.Groups.Cards'),
            system: game.i18n.localize('YOUR_FLAVOR.PreviewFixtures.Groups.System')
        };
    }

    _formatI18n(key, data = {}) {
        return this.previewController.formatI18n(key, data);
    }

    _registerLocalHelpers() {
        if (typeof Handlebars !== 'undefined' && !Handlebars.helpers.eq) {
            Handlebars.registerHelper('eq', (a, b) => a === b);
        }
    }

    _getPausePreviewClass(pauseConfig = {}) {
        return this.previewController.getPausePreviewClass(pauseConfig);
    }

    _getPausePreviewLabel(pauseConfig = {}) {
        return this.previewController.getPausePreviewLabel(pauseConfig);
    }

    _hexToRgba(hex, alpha = 1) {
        return this.previewController.hexToRgba(hex, alpha);
    }

    _fontStack(fontFamily) {
        return this.previewController.fontStack(fontFamily);
    }

    _pauseFontStack(fontFamily) {
        return this.previewController.pauseFontStack(fontFamily);
    }
}
