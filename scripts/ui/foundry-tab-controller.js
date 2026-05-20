/**
 * Foundry-tab helpers for component controls and layout form sync.
 * @module your-flavor/ui/foundry-tab-controller
 */

import {
    CHAT_LOG_TRANSFORMER_PRESETS,
    DEFAULT_CHAT_LOG_CUSTOMIZATION,
    DEFAULT_FOUNDRY_CUSTOMIZATION,
    DEFAULT_HOTBAR_CUSTOMIZATION,
    DEFAULT_PLAYERS_LIST_CUSTOMIZATION,
    DEFAULT_SCENE_NAVIGATION_CUSTOMIZATION,
    DEFAULT_SIDEBAR_CUSTOMIZATION,
    DEFAULT_TOKEN_CONTROLS_CUSTOMIZATION,
    DEFAULT_WINDOWS_CUSTOMIZATION,
    FOUNDRY_UI_COMPONENTS,
    SIDEBAR_TRANSFORMER_PRESETS
} from '../constants.js';
import {
    normalizeChatLogConfig,
    normalizeHotbarConfig,
    normalizePlayersListConfig,
    normalizeSidebarConfig,
    normalizeTokenControlsConfig,
    normalizeWindowsConfig
} from '../config-normalizer.js';
import { getIconRegistryEntries } from '../icon-registry.js';

const BORDER_STYLE_OPTIONS = [
    { id: 'none', label: 'None' },
    { id: 'solid', label: 'Solid' },
    { id: 'dashed', label: 'Dashed' },
    { id: 'dotted', label: 'Dotted' },
    { id: 'double', label: 'Double' },
    { id: 'groove', label: 'Groove' },
    { id: 'ridge', label: 'Ridge' }
];

const SCENE_NAVIGATION_FONT_WEIGHT_OPTIONS = [
    { id: 400, label: '400' },
    { id: 500, label: '500' },
    { id: 600, label: '600' },
    { id: 700, label: '700' },
    { id: 800, label: '800' },
    { id: 900, label: '900' }
];

const SCENE_NAVIGATION_LAYOUT_OPTIONS = [
    { id: 'vertical', labelKey: 'YOUR_FLAVOR.Config.Foundry.SceneNavigationLayoutModes.Vertical' },
    { id: 'horizontal', labelKey: 'YOUR_FLAVOR.Config.Foundry.SceneNavigationLayoutModes.Horizontal' },
    { id: 'tray', labelKey: 'YOUR_FLAVOR.Config.Foundry.SceneNavigationLayoutModes.Tray' }
];

const SCENE_NAVIGATION_COLOR_GROUPS = [
    {
        id: 'base',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.SceneNavigationBaseColors',
        controls: [
            ['textColor', 'YOUR_FLAVOR.Config.Foundry.SceneNavigationTextColor', 'fontColor'],
            ['borderColor', 'YOUR_FLAVOR.Config.Foundry.SceneNavigationBorderColor', 'accentColor']
        ]
    },
    {
        id: 'backgrounds',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.SceneNavigationStateBackgrounds',
        controls: [
            ['normalBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.SceneNavigationStateNormal', 'surfaceBackground'],
            ['activeBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.SceneNavigationStateActive', 'windowHeaderBackground'],
            ['viewedBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.SceneNavigationStateViewed', 'surfaceBackground'],
            ['hiddenBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.SceneNavigationStateHidden', 'surfaceBackground'],
            ['hoverBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.SceneNavigationStateHover', 'accentColor']
        ]
    }
];

const TOKEN_CONTROLS_COLOR_GROUPS = [
    {
        id: 'normal',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.TokenControlsStateNormal',
        controls: [
            ['normalBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.TokenControlsBackground', 'surfaceBackground'],
            ['normalBorderColor', 'YOUR_FLAVOR.Config.Foundry.TokenControlsBorderColor', 'accentColor']
        ]
    },
    {
        id: 'hover',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.TokenControlsStateHover',
        controls: [
            ['hoverBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.TokenControlsBackground', 'surfaceBackground'],
            ['hoverBorderColor', 'YOUR_FLAVOR.Config.Foundry.TokenControlsBorderColor', 'accentColor']
        ]
    },
    {
        id: 'active',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.TokenControlsStateActive',
        controls: [
            ['activeBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.TokenControlsBackground', 'windowHeaderBackground'],
            ['activeBorderColor', 'YOUR_FLAVOR.Config.Foundry.TokenControlsBorderColor', 'accentColor']
        ]
    }
];

const HOTBAR_ANCHOR_OPTIONS = [
    { id: 'bottom-center', labelKey: 'YOUR_FLAVOR.Config.Foundry.HotbarAnchors.BottomCenter' },
    { id: 'bottom-left', labelKey: 'YOUR_FLAVOR.Config.Foundry.HotbarAnchors.BottomLeft' },
    { id: 'bottom-right', labelKey: 'YOUR_FLAVOR.Config.Foundry.HotbarAnchors.BottomRight' }
];

const PLAYERS_LIST_VISUAL_MODE_OPTIONS = [
    { id: 'compact', labelKey: 'YOUR_FLAVOR.Config.Foundry.PlayersListVisualModes.Compact' },
    { id: 'glass', labelKey: 'YOUR_FLAVOR.Config.Foundry.PlayersListVisualModes.Glass' },
    { id: 'neon', labelKey: 'YOUR_FLAVOR.Config.Foundry.PlayersListVisualModes.Neon' },
    { id: 'banner', labelKey: 'YOUR_FLAVOR.Config.Foundry.PlayersListVisualModes.Banner' },
    { id: 'minimal', labelKey: 'YOUR_FLAVOR.Config.Foundry.PlayersListVisualModes.Minimal' }
];

const PLAYERS_LIST_STATUS_STYLE_OPTIONS = [
    { id: 'dot', labelKey: 'YOUR_FLAVOR.Config.Foundry.PlayersListStatusStyles.Dot' },
    { id: 'ring', labelKey: 'YOUR_FLAVOR.Config.Foundry.PlayersListStatusStyles.Ring' },
    { id: 'pill', labelKey: 'YOUR_FLAVOR.Config.Foundry.PlayersListStatusStyles.Pill' }
];

const WINDOWS_VISUAL_MODE_OPTIONS = [
    { id: 'solid', labelKey: 'YOUR_FLAVOR.Config.Foundry.WindowsVisualModes.Solid' },
    { id: 'glass', labelKey: 'YOUR_FLAVOR.Config.Foundry.WindowsVisualModes.Glass' },
    { id: 'parchment', labelKey: 'YOUR_FLAVOR.Config.Foundry.WindowsVisualModes.Parchment' },
    { id: 'arcane', labelKey: 'YOUR_FLAVOR.Config.Foundry.WindowsVisualModes.Arcane' },
    { id: 'compact', labelKey: 'YOUR_FLAVOR.Config.Foundry.WindowsVisualModes.Compact' },
    { id: 'high-contrast', labelKey: 'YOUR_FLAVOR.Config.Foundry.WindowsVisualModes.HighContrast' },
    { id: 'neon', labelKey: 'YOUR_FLAVOR.Config.Foundry.WindowsVisualModes.Neon' }
];

const HOTBAR_COLOR_GROUPS = [
    {
        id: 'empty',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.HotbarStateEmpty',
        controls: [
            ['emptyBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.HotbarBackground', 'surfaceBackground'],
            ['emptyBorderColor', 'YOUR_FLAVOR.Config.Foundry.HotbarBorderColor', 'accentColor']
        ]
    },
    {
        id: 'full',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.HotbarStateFull',
        controls: [
            ['fullBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.HotbarBackground', 'surfaceBackground'],
            ['fullBorderColor', 'YOUR_FLAVOR.Config.Foundry.HotbarBorderColor', 'accentColor']
        ]
    },
    {
        id: 'hover',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.HotbarStateHover',
        controls: [
            ['hoverBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.HotbarBackground', 'windowHeaderBackground'],
            ['hoverBorderColor', 'YOUR_FLAVOR.Config.Foundry.HotbarBorderColor', 'accentColor']
        ]
    },
    {
        id: 'drop',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.HotbarStateDropTarget',
        controls: [
            ['dropTargetBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.HotbarBackground', 'accentColor'],
            ['dropTargetBorderColor', 'YOUR_FLAVOR.Config.Foundry.HotbarBorderColor', 'accentColor']
        ]
    },
    {
        id: 'keys',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.HotbarKeysSection',
        controls: [
            ['keyTextColor', 'YOUR_FLAVOR.Config.Foundry.HotbarKeyText', 'fontColor'],
            ['keyEmptyBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.HotbarKeyEmptyBackground', 'windowHeaderBackground'],
            ['keyFullBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.HotbarKeyFullBackground', 'accentColor']
        ]
    },
    {
        id: 'controls',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.HotbarSideControlsSection',
        controls: [
            ['controlBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.HotbarBackground', 'surfaceBackground'],
            ['controlBorderColor', 'YOUR_FLAVOR.Config.Foundry.HotbarBorderColor', 'accentColor'],
            ['controlHoverBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.HotbarControlHoverBackground', 'surfaceBackground']
        ]
    }
];

const TOKEN_CONTROLS_COLOR_FIELDS = Object.freeze([
    ...new Set(TOKEN_CONTROLS_COLOR_GROUPS.flatMap(group => group.controls.map(([field]) => field)))
]);
const HOTBAR_COLOR_FIELDS = Object.freeze([
    ...new Set(HOTBAR_COLOR_GROUPS.flatMap(group => group.controls.map(([field]) => field)))
]);

const SIDEBAR_COLOR_GROUPS = [
    {
        id: 'rail',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.SidebarRailSection',
        controls: [
            ['railBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.SidebarRailBackground'],
            ['tabBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.SidebarTabBackground'],
            ['tabHoverBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.SidebarTabHoverBackground'],
            ['tabActiveBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.SidebarTabActiveBackground']
        ]
    },
    {
        id: 'panel',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.SidebarDirectorySection',
        controls: [
            ['panelBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.SidebarPanelBackground'],
            ['panelBorderColor', 'YOUR_FLAVOR.Config.Foundry.SidebarPanelBorderColor'],
            ['dividerColor', 'YOUR_FLAVOR.Config.Foundry.SidebarDividerColor'],
            ['folderBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.SidebarFolderBackground']
        ]
    },
    {
        id: 'controls',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.SidebarControlsColorsSection',
        controls: [
            ['inputBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.SidebarInputBackground'],
            ['actionButtonBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.SidebarActionButtonBackground'],
            ['actionButtonHoverBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.SidebarActionButtonHoverBackground']
        ]
    },
    {
        id: 'states',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.SidebarStatesSection',
        controls: [
            ['rowHoverBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.SidebarRowHoverBackground'],
            ['activeColor', 'YOUR_FLAVOR.Config.Foundry.SidebarActiveColor'],
            ['textColor', 'YOUR_FLAVOR.Config.Foundry.SidebarTextColor'],
            ['secondaryTextColor', 'YOUR_FLAVOR.Config.Foundry.SidebarSecondaryTextColor']
        ]
    }
];
const SIDEBAR_COLOR_FIELDS = Object.freeze([
    ...new Set(SIDEBAR_COLOR_GROUPS.flatMap(group => group.controls.map(([field]) => field)))
]);

const CHAT_LOG_COLOR_GROUPS = [
    {
        id: 'composer',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.ChatLogComposerSection',
        controls: [
            ['composerBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.ChatLogComposerBackground'],
            ['composerBorderColor', 'YOUR_FLAVOR.Config.Foundry.ChatLogComposerBorderColor'],
            ['composerFocusColor', 'YOUR_FLAVOR.Config.Foundry.ChatLogComposerFocusColor'],
            ['composerTextColor', 'YOUR_FLAVOR.Config.Foundry.ChatLogComposerText'],
            ['composerPlaceholderColor', 'YOUR_FLAVOR.Config.Foundry.ChatLogComposerPlaceholder']
        ]
    }
];
const CHAT_LOG_COLOR_FIELDS = Object.freeze([
    ...new Set(CHAT_LOG_COLOR_GROUPS.flatMap(group => group.controls.map(([field]) => field)))
]);

const PLAYERS_LIST_COLOR_GROUPS = [
    {
        id: 'panel',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.PlayersListPanelSection',
        controls: [
            ['panelBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.PlayersListPanelBackground'],
            ['panelBorderColor', 'YOUR_FLAVOR.Config.Foundry.PlayersListPanelBorderColor']
        ]
    },
    {
        id: 'rows',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.PlayersListRowsSection',
        controls: [
            ['rowBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.PlayersListRowBackground'],
            ['rowBorderColor', 'YOUR_FLAVOR.Config.Foundry.PlayersListRowBorderColor'],
            ['textColor', 'YOUR_FLAVOR.Config.Foundry.PlayersListTextColor'],
            ['inactiveTextColor', 'YOUR_FLAVOR.Config.Foundry.PlayersListInactiveTextColor']
        ]
    },
    {
        id: 'states',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.PlayersListStatesSection',
        controls: [
            ['hoverBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.PlayersListHoverBackground'],
            ['hoverBorderColor', 'YOUR_FLAVOR.Config.Foundry.PlayersListHoverBorderColor'],
            ['selfBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.PlayersListSelfBackground'],
            ['selfBorderColor', 'YOUR_FLAVOR.Config.Foundry.PlayersListSelfBorderColor'],
            ['gmBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.PlayersListGmBackground'],
            ['gmBorderColor', 'YOUR_FLAVOR.Config.Foundry.PlayersListGmBorderColor']
        ]
    },
    {
        id: 'controls',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.PlayersListControlsSection',
        controls: [
            ['controlTextColor', 'YOUR_FLAVOR.Config.Foundry.PlayersListControlTextColor'],
            ['controlHoverTextColor', 'YOUR_FLAVOR.Config.Foundry.PlayersListControlHoverTextColor'],
            ['controlHoverBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.PlayersListControlHoverBackground']
        ]
    }
];
const PLAYERS_LIST_COLOR_FIELDS = Object.freeze([
    ...new Set(PLAYERS_LIST_COLOR_GROUPS.flatMap(group => group.controls.map(([field]) => field)))
]);

const WINDOWS_COLOR_GROUPS = [
    {
        id: 'frame',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.WindowsFrameSection',
        controls: [
            ['frameBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.WindowsFrameBackground'],
            ['frameBorderColor', 'YOUR_FLAVOR.Config.Foundry.WindowsFrameBorderColor']
        ]
    },
    {
        id: 'header',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.WindowsHeaderSection',
        controls: [
            ['headerBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.WindowsHeaderBackground'],
            ['headerTextColor', 'YOUR_FLAVOR.Config.Foundry.WindowsHeaderText'],
            ['headerDividerColor', 'YOUR_FLAVOR.Config.Foundry.WindowsHeaderDividerColor'],
            ['headerGripColor', 'YOUR_FLAVOR.Config.Foundry.WindowsHeaderGripColor']
        ]
    },
    {
        id: 'content',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.WindowsContentSection',
        controls: [
            ['contentBackgroundColor', 'YOUR_FLAVOR.Config.Foundry.WindowsContentBackground'],
            ['contentTextColor', 'YOUR_FLAVOR.Config.Foundry.WindowsContentText'],
            ['scrollbarThumbColor', 'YOUR_FLAVOR.Config.Foundry.WindowsScrollbarThumb'],
            ['scrollbarTrackColor', 'YOUR_FLAVOR.Config.Foundry.WindowsScrollbarTrack'],
            ['resizeHandleColor', 'YOUR_FLAVOR.Config.Foundry.WindowsResizeHandle']
        ]
    }
];
const WINDOWS_COLOR_FIELDS = Object.freeze([
    ...new Set(WINDOWS_COLOR_GROUPS.flatMap(group => group.controls.map(([field]) => field)))
]);

const FOUNDRY_EXPORT_AREAS = [
    { id: 'navigation', labelKey: 'YOUR_FLAVOR.Foundry.Components.navigation' },
    { id: 'controls', labelKey: 'YOUR_FLAVOR.Foundry.Components.controls' },
    { id: 'players', labelKey: 'YOUR_FLAVOR.Foundry.Components.players' },
    { id: 'hotbar', labelKey: 'YOUR_FLAVOR.Foundry.Components.hotbar' },
    { id: 'sidebar', labelKey: 'YOUR_FLAVOR.Foundry.Components.sidebar' },
    { id: 'chatLog', labelKey: 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.ChatLog' },
    { id: 'windows', labelKey: 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.Windows' },
    { id: 'pause', labelKey: 'YOUR_FLAVOR.Foundry.Components.pause' }
];

const DEFAULT_FOUNDRY_SECTION_ID = 'overview';

const FOUNDRY_SECTION_DEFINITIONS = [
    {
        id: 'overview',
        icon: 'fas fa-gauge-high',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.Sections.Overview',
        type: 'overview'
    },
    {
        id: 'global',
        icon: 'fas fa-palette',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.Sections.Global',
        type: 'global'
    },
    {
        id: 'navigation',
        areaId: 'navigation',
        icon: 'fas fa-map-location-dot',
        labelKey: 'YOUR_FLAVOR.Foundry.Components.navigation',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.AreaPreviewDescriptions.Navigation',
        type: 'area'
    },
    {
        id: 'controls',
        areaId: 'controls',
        icon: 'fas fa-crosshairs',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.Sections.Controls',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.AreaPreviewDescriptions.Controls',
        type: 'area'
    },
    {
        id: 'hotbar',
        areaId: 'hotbar',
        icon: 'fas fa-keyboard',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.Sections.Hotbar',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.AreaPreviewDescriptions.Hotbar',
        type: 'area'
    },
    {
        id: 'sidebar',
        areaId: 'sidebar',
        icon: 'fas fa-columns',
        labelKey: 'YOUR_FLAVOR.Foundry.Components.sidebar',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.AreaPreviewDescriptions.Sidebar',
        type: 'area'
    },
    {
        id: 'chatLog',
        areaId: 'chatLog',
        icon: 'fas fa-comments',
        labelKey: 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.ChatLog',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.AreaPreviewDescriptions.ChatLog',
        type: 'area'
    },
    {
        id: 'players',
        areaId: 'players',
        icon: 'fas fa-user-group',
        labelKey: 'YOUR_FLAVOR.Foundry.Components.players',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.AreaPreviewDescriptions.Players',
        type: 'area'
    },
    {
        id: 'windows',
        areaId: 'windows',
        icon: 'far fa-window-maximize',
        labelKey: 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.Windows',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.AreaPreviewDescriptions.Windows',
        type: 'area'
    },
    {
        id: 'pause',
        areaId: 'pause',
        icon: 'fas fa-circle-pause',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.Sections.Pause',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.AreaPreviewDescriptions.Pause',
        type: 'pause'
    },
    {
        id: 'advanced',
        icon: 'fas fa-code',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.Sections.Advanced',
        type: 'advanced'
    }
];

const FOUNDRY_THEME_FIELD_LABELS = {
    fontColor: 'YOUR_FLAVOR.Config.Foundry.FontColor',
    secondaryFontColor: 'YOUR_FLAVOR.Config.Foundry.SecondaryTextColor',
    surfaceBackground: 'YOUR_FLAVOR.Config.Foundry.SurfaceColor',
    windowBackground: 'YOUR_FLAVOR.Config.Foundry.WindowColor',
    windowHeaderBackground: 'YOUR_FLAVOR.Config.Foundry.HeaderColor',
    accentColor: 'YOUR_FLAVOR.Config.Foundry.AccentColor',
    chatTint: 'YOUR_FLAVOR.Config.Foundry.ChatTint',
    iconColor: 'YOUR_FLAVOR.Config.Foundry.IconColor',
    iconHoverColor: 'YOUR_FLAVOR.Config.Foundry.IconHoverColor',
    scrollbarColor: 'YOUR_FLAVOR.Config.Foundry.ScrollbarColor'
};

const FOUNDRY_THEME_FIELD_IDS = Object.freeze(Object.keys(FOUNDRY_THEME_FIELD_LABELS));

const FOUNDRY_AREA_THEME_FIELDS = {
    navigation: [],
    controls: [],
    hotbar: [],
    sidebar: [],
    chatLog: [],
    players: [],
    windows: [],
    pause: []
};

export class FlavorFoundryTabController {
    constructor({ localize }) {
        this.localize = localize;
    }

    buildSections(foundryConfig, activeSectionId = DEFAULT_FOUNDRY_SECTION_ID) {
        const config = foundryConfig || DEFAULT_FOUNDRY_CUSTOMIZATION;
        const activeId = this.normalizeSectionId(activeSectionId, config);

        return FOUNDRY_SECTION_DEFINITIONS.map(section => {
            const isAvailable = this.#isSectionAvailable(section, config);
            const label = this.localize(section.labelKey);
            return {
                ...section,
                label,
                title: label,
                isActive: section.id === activeId,
                isAvailable
            };
        });
    }

    normalizeSectionId(sectionId = DEFAULT_FOUNDRY_SECTION_ID, foundryConfig = DEFAULT_FOUNDRY_CUSTOMIZATION) {
        const config = foundryConfig || DEFAULT_FOUNDRY_CUSTOMIZATION;
        const id = String(sectionId || '').trim();
        const section = FOUNDRY_SECTION_DEFINITIONS.find(entry => entry.id === id);
        if (section && this.#isSectionAvailable(section, config)) return section.id;
        return DEFAULT_FOUNDRY_SECTION_ID;
    }

    getSectionPreviewAreaId(sectionId) {
        const section = FOUNDRY_SECTION_DEFINITIONS.find(entry => entry.id === sectionId);
        return section?.areaId ?? null;
    }

    buildComponents(foundryConfig, viewport = {}) {
        const config = foundryConfig || DEFAULT_FOUNDRY_CUSTOMIZATION;
        const viewportWidth = viewport.width || 1920;
        const viewportHeight = viewport.height || 1080;

        return FOUNDRY_UI_COMPONENTS
            .filter(component => component.id !== 'pause')
            .map(component => ({
                ...component,
                label: this.localize(`YOUR_FLAVOR.Foundry.Components.${component.id}`),
                hasWidthControl: component.resize === 'width' || component.resize === 'both',
                hasHeightControl: component.resize === 'both',
                widthMin: component.minWidth ?? 120,
                widthMax: Math.max(component.maxWidth ?? 1600, Math.round(viewportWidth * 0.9)),
                heightMin: component.minHeight ?? 160,
                heightMax: Math.max(component.maxHeight ?? 1600, Math.round(viewportHeight * 1.5)),
                visible: config.visibility[component.id],
                width: config.layout[component.id]?.width ?? component.minWidth ?? 120,
                height: config.layout[component.id]?.height
                    ?? Math.max(component.minHeight ?? 160, Math.round(viewportHeight - 160)),
                scale: config.layout[component.id]?.scale,
                hasScaleControl: component.id !== 'sidebar',
                style: config.componentStyles?.[component.id] || {},
                borderStyleOptions: BORDER_STYLE_OPTIONS.map(opt => ({
                    ...opt,
                    selected: opt.id === (config.componentStyles?.[component.id]?.borderStyle || 'none')
                }))
            }));
    }

    buildAreas(foundryConfig) {
        const config = foundryConfig || DEFAULT_FOUNDRY_CUSTOMIZATION;
        return FOUNDRY_EXPORT_AREAS.map(area => ({
            ...area,
            label: this.localize(area.labelKey),
            enabled: config.areaEnabled?.[area.id] !== false,
            exportTitle: this.localize('YOUR_FLAVOR.Config.Foundry.ExportAreaTitle')
        }));
    }

    buildThemeFields(foundryConfig) {
        const config = foundryConfig || DEFAULT_FOUNDRY_CUSTOMIZATION;
        const theme = config.theme || {};
        return FOUNDRY_THEME_FIELD_IDS.map(fieldId => this.#buildNullableColorControl({
            id: fieldId,
            name: `foundry.theme.${fieldId}`,
            label: this.localize(FOUNDRY_THEME_FIELD_LABELS[fieldId]),
            value: theme[fieldId]
        }));
    }

    buildAreaPages(foundryConfig, viewport = {}, activeSectionId = DEFAULT_FOUNDRY_SECTION_ID) {
        const config = foundryConfig || DEFAULT_FOUNDRY_CUSTOMIZATION;
        const activeId = this.normalizeSectionId(activeSectionId, config);
        const components = new Map(
            this.buildComponents(config, viewport).map(component => [component.id, component])
        );

        return FOUNDRY_SECTION_DEFINITIONS
            .filter(section => section.areaId)
            .map(section => this.#buildAreaPage(section, config, components, activeId));
    }

    buildAreaExport(foundryConfig, areaId, context = {}) {
        const config = foundryConfig || DEFAULT_FOUNDRY_CUSTOMIZATION;
        const area = FOUNDRY_EXPORT_AREAS.find(entry => entry.id === areaId);
        if (!area) return null;

        const exportData = {
            schemaVersion: 1,
            type: 'your-flavor-foundry-area',
            areaId,
            areaLabel: this.localize(area.labelKey),
            exportedAt: new Date().toISOString(),
            foundryVersion: context.foundryVersion ?? globalThis.game?.version ?? globalThis.game?.release?.version ?? null,
            systemId: context.systemId ?? globalThis.game?.system?.id ?? null,
            area: {
                enabled: config.areaEnabled?.[areaId] !== false,
                visible: config.visibility?.[areaId] ?? true,
                layout: clone(config.layout?.[areaId] ?? {}),
                style: clone(config.componentStyles?.[areaId] ?? {})
            }
        };

        if (areaId === 'navigation') {
            exportData.area.sceneNavigation = clone(
                config.sceneNavigation ?? DEFAULT_FOUNDRY_CUSTOMIZATION.sceneNavigation
            );
        }

        if (areaId === 'controls') {
            exportData.area.tokenControls = clone(
                config.tokenControls ?? DEFAULT_FOUNDRY_CUSTOMIZATION.tokenControls
            );
        }

        if (areaId === 'hotbar') {
            exportData.area.hotbar = clone(
                config.hotbar ?? DEFAULT_FOUNDRY_CUSTOMIZATION.hotbar
            );
        }

        if (areaId === 'sidebar') {
            exportData.area.sidebar = clone(
                config.sidebar ?? DEFAULT_FOUNDRY_CUSTOMIZATION.sidebar
            );
        }

        if (areaId === 'pause') {
            exportData.area.pause = clone(config.pause ?? {});
        }

        if (areaId === 'chatLog') {
            exportData.area.chatLog = clone(
                config.chatLog ?? config.areas?.chatLog?.chatLog ?? DEFAULT_FOUNDRY_CUSTOMIZATION.chatLog
            );
        }

        if (areaId === 'windows') {
            exportData.area.windows = clone(
                config.windows ?? config.areas?.windows?.windows ?? DEFAULT_FOUNDRY_CUSTOMIZATION.windows
            );
        }

        return exportData;
    }

    syncLayoutControls(element, foundryConfig) {
        if (!element) return;

        for (const component of FOUNDRY_UI_COMPONENTS) {
            if (component.id === 'pause') continue;

            const layout = foundryConfig?.layout?.[component.id];
            if (!layout) continue;

            this.#syncRange(element, `foundry.layout.${component.id}.width`, layout.width, 'px');
            this.#syncRange(element, `foundry.layout.${component.id}.height`, layout.height, 'px');
            this.#syncRange(element, `foundry.layout.${component.id}.scale`, layout.scale, '%');
        }

        this.#syncHotbarPositionControls(element, foundryConfig);
    }

    #syncHotbarPositionControls(element, foundryConfig) {
        const hotbar = normalizeHotbarConfig({
            ...DEFAULT_HOTBAR_CUSTOMIZATION,
            ...(foundryConfig?.hotbar || {})
        });
        const anchorInput = element.querySelector('[name="foundry.hotbar.anchor"]');
        const offsetXInput = element.querySelector('[name="foundry.hotbar.offsetX"]');

        if (anchorInput) anchorInput.value = hotbar.anchor;
        if (offsetXInput) {
            offsetXInput.min = hotbar.anchor === 'bottom-center' ? '-480' : '0';
            offsetXInput.max = '480';
        }

        this.#syncRange(element, 'foundry.hotbar.offsetX', hotbar.offsetX, 'px');
        this.#syncRange(element, 'foundry.hotbar.offsetY', hotbar.offsetY, 'px');
    }

    resetComponent(foundryConfig, componentId) {
        if (!componentId || componentId === 'pause') return false;

        const defaults = DEFAULT_FOUNDRY_CUSTOMIZATION.layout[componentId];
        if (!defaults) return false;

        foundryConfig.layout ||= {};
        foundryConfig.layout[componentId] = foundry.utils.deepClone(defaults);
        return true;
    }

    #syncRange(element, name, value, suffix) {
        if (!Number.isFinite(value)) return;

        const input = element.querySelector(`[name="${name}"]`);
        const valueDisplay = input?.parentElement?.querySelector('.yf-range-value');
        if (input) input.value = value;
        if (valueDisplay) valueDisplay.textContent = `${value}${suffix}`;
    }

    #isSectionAvailable(section, foundryConfig) {
        return Boolean(section && foundryConfig);
    }

    #buildAreaPage(section, config, components, activeId) {
        const areaId = section.areaId;
        const component = components.get(areaId) || null;
        const iconEntries = getIconRegistryEntries({
            area: areaId,
            localize: this.localize
        });
        const hasVisibility = Object.prototype.hasOwnProperty.call(
            DEFAULT_FOUNDRY_CUSTOMIZATION.visibility,
            areaId
        );
        const label = this.localize(section.labelKey);

        return {
            ...section,
            label,
            title: label,
            areaId,
            component,
            isActive: section.id === activeId,
            isNavigation: areaId === 'navigation',
            isControls: areaId === 'controls',
            isHotbar: areaId === 'hotbar',
            isSidebar: areaId === 'sidebar',
            isChatLog: areaId === 'chatLog',
            isPlayers: areaId === 'players',
            isWindows: areaId === 'windows',
            isPause: section.id === 'pause',
            isComponent: Boolean(component),
            showVisibility: hasVisibility,
            visible: hasVisibility ? config.visibility?.[areaId] !== false : true,
            enabled: config.areaEnabled?.[areaId] !== false,
            areaEnabledName: `foundry.areaEnabled.${areaId}`,
            visibilityName: `foundry.visibility.${areaId}`,
            exportTitle: this.localize('YOUR_FLAVOR.Config.Foundry.ExportAreaTitle'),
            description: this.localize(section.descriptionKey),
            themeFields: this.#buildAreaThemeFields(config, areaId),
            sceneNavigation: areaId === 'navigation'
                ? this.#buildSceneNavigationControls(config)
                : null,
            tokenControls: areaId === 'controls'
                ? this.#buildTokenControls(config)
                : null,
            hotbar: areaId === 'hotbar'
                ? this.#buildHotbarControls(config)
                : null,
            sidebar: areaId === 'sidebar'
                ? this.#buildSidebarControls(config)
                : null,
            chatLog: areaId === 'chatLog'
                ? this.#buildChatLogControls(config)
                : null,
            playersList: areaId === 'players'
                ? this.#buildPlayersListControls(config)
                : null,
            windows: areaId === 'windows'
                ? this.#buildWindowsControls(config)
                : null,
            iconEntries,
            hasIconEntries: iconEntries.length > 0,
            hasLayoutControls: Boolean(component),
            hasStyleControls: Boolean(component) && !['hotbar', 'sidebar', 'players'].includes(areaId),
            hasComponentBorderControl: Boolean(component) && areaId !== 'controls'
        };
    }

    #buildAreaThemeFields(config, areaId) {
        const theme = config.theme || {};
        const fieldIds = FOUNDRY_AREA_THEME_FIELDS[areaId] || [];
        return fieldIds.map(fieldId => this.#buildNullableColorControl({
            id: fieldId,
            name: `foundry.theme.${fieldId}`,
            label: this.localize(FOUNDRY_THEME_FIELD_LABELS[fieldId]),
            value: theme[fieldId]
        }));
    }

    #buildSceneNavigationControls(config) {
        const theme = config.theme || DEFAULT_FOUNDRY_CUSTOMIZATION.theme;
        const sceneNavigation = {
            ...DEFAULT_SCENE_NAVIGATION_CUSTOMIZATION,
            ...(config.sceneNavigation || {})
        };

        return {
            ...sceneNavigation,
            fontWeightOptions: SCENE_NAVIGATION_FONT_WEIGHT_OPTIONS.map(option => ({
                ...option,
                selected: Number(option.id) === Number(sceneNavigation.fontWeight)
            })),
            layoutModeOptions: SCENE_NAVIGATION_LAYOUT_OPTIONS.map(option => ({
                ...option,
                label: this.localize(option.labelKey),
                selected: option.id === sceneNavigation.layoutMode
            })),
            borderStyleOptions: BORDER_STYLE_OPTIONS.map(option => ({
                ...option,
                selected: option.id === (sceneNavigation.borderStyle || DEFAULT_SCENE_NAVIGATION_CUSTOMIZATION.borderStyle)
            })),
            colorGroups: SCENE_NAVIGATION_COLOR_GROUPS.map(group => ({
                id: group.id,
                label: this.localize(group.labelKey),
                controls: group.controls.map(([field, labelKey]) => this.#buildNullableColorControl({
                    field,
                    name: `foundry.sceneNavigation.${field}`,
                    label: this.localize(labelKey),
                    value: sceneNavigation[field]
                }))
            }))
        };
    }

    #buildTokenControls(config) {
        const source = config.tokenControls || {};
        const tokenControls = normalizeTokenControlsConfig({
            ...DEFAULT_TOKEN_CONTROLS_CUSTOMIZATION,
            ...source
        });
        this.#preserveStockColorFields(tokenControls, source, TOKEN_CONTROLS_COLOR_FIELDS);

        return {
            ...tokenControls,
            borderStyleOptions: BORDER_STYLE_OPTIONS.map(option => ({
                ...option,
                selected: option.id === (tokenControls.borderStyle || DEFAULT_TOKEN_CONTROLS_CUSTOMIZATION.borderStyle)
            })),
            colorGroups: TOKEN_CONTROLS_COLOR_GROUPS.map(group => ({
                id: group.id,
                label: this.localize(group.labelKey),
                controls: group.controls.map(([field, labelKey]) => this.#buildNullableColorControl({
                    field,
                    name: `foundry.tokenControls.${field}`,
                    label: this.localize(labelKey),
                    value: tokenControls[field]
                }))
            }))
        };
    }

    #buildHotbarControls(config) {
        const source = config.hotbar || {};
        const hotbar = normalizeHotbarConfig({
            ...DEFAULT_HOTBAR_CUSTOMIZATION,
            ...source
        });
        this.#preserveStockColorFields(hotbar, source, HOTBAR_COLOR_FIELDS);

        return {
            ...hotbar,
            offsetXMin: hotbar.anchor === 'bottom-center' ? -480 : 0,
            offsetXMax: 480,
            anchorOptions: HOTBAR_ANCHOR_OPTIONS.map(option => ({
                ...option,
                label: this.localize(option.labelKey),
                selected: option.id === hotbar.anchor
            })),
            borderStyleOptions: BORDER_STYLE_OPTIONS.map(option => ({
                ...option,
                selected: option.id === (hotbar.slotBorderStyle || DEFAULT_HOTBAR_CUSTOMIZATION.slotBorderStyle)
            })),
            colorGroups: HOTBAR_COLOR_GROUPS.map(group => ({
                id: group.id,
                label: this.localize(group.labelKey),
                controls: group.controls.map(([field, labelKey]) => this.#buildNullableColorControl({
                    field,
                    name: `foundry.hotbar.${field}`,
                    label: this.localize(labelKey),
                    value: hotbar[field]
                }))
            }))
        };
    }

    #buildNullableColorControl({ id = null, field = null, name, label, value }) {
        const normalized = this.#normalizeColorInputValue(value);
        return {
            id: id ?? field,
            field: field ?? id,
            name,
            label,
            value: normalized || '#000000',
            actualValue: normalized,
            isStock: !normalized,
            stockLabel: this.localize('YOUR_FLAVOR.Config.Foundry.StockInheritColor'),
            clearTitle: this.localize('YOUR_FLAVOR.Config.Foundry.ClearColorOverride')
        };
    }

    #normalizeColorInputValue(value) {
        if (typeof value !== 'string') return null;
        const trimmed = value.trim();
        return /^#[0-9a-f]{6}$/i.test(trimmed) ? trimmed : null;
    }

    #preserveStockColorFields(target, source, fields = []) {
        for (const field of fields) {
            if (!Object.prototype.hasOwnProperty.call(source || {}, field)) continue;
            if (!this.#normalizeColorInputValue(source[field])) target[field] = '';
        }
    }

    #buildSidebarControls(config) {
        const source = config.sidebar || {};
        const sidebar = normalizeSidebarConfig({
            ...DEFAULT_SIDEBAR_CUSTOMIZATION,
            ...source
        });
        this.#preserveStockColorFields(sidebar, source, SIDEBAR_COLOR_FIELDS);

        return {
            ...sidebar,
            colorGroups: SIDEBAR_COLOR_GROUPS.map(group => ({
                id: group.id,
                label: this.localize(group.labelKey),
                controls: group.controls.map(([field, labelKey]) => this.#buildNullableColorControl({
                    field,
                    name: `foundry.sidebar.${field}`,
                    label: this.localize(labelKey),
                    value: sidebar[field]
                }))
            })),
            transformerPresets: SIDEBAR_TRANSFORMER_PRESETS.map(preset => ({
                ...preset,
                label: this.localize(preset.labelKey),
                description: this.localize(preset.descriptionKey)
            }))
        };
    }

    #buildPlayersListControls(config) {
        const source = config.playersList || config.areas?.players?.playersList || {};
        const playersList = normalizePlayersListConfig({
            ...DEFAULT_PLAYERS_LIST_CUSTOMIZATION,
            ...source
        });
        this.#preserveStockColorFields(playersList, source, PLAYERS_LIST_COLOR_FIELDS);

        return {
            ...playersList,
            colorGroups: PLAYERS_LIST_COLOR_GROUPS.map(group => ({
                id: group.id,
                label: this.localize(group.labelKey),
                controls: group.controls.map(([field, labelKey]) => this.#buildNullableColorControl({
                    field,
                    name: `foundry.playersList.${field}`,
                    label: this.localize(labelKey),
                    value: playersList[field]
                }))
            })),
            visualModeOptions: PLAYERS_LIST_VISUAL_MODE_OPTIONS.map(option => ({
                ...option,
                label: this.localize(option.labelKey),
                selected: option.id === playersList.visualMode
            })),
            statusStyleOptions: PLAYERS_LIST_STATUS_STYLE_OPTIONS.map(option => ({
                ...option,
                label: this.localize(option.labelKey),
                selected: option.id === playersList.statusStyle
            }))
        };
    }

    #buildWindowsControls(config) {
        const source = config.windows || config.areas?.windows?.windows || {};
        const windows = normalizeWindowsConfig({
            ...DEFAULT_WINDOWS_CUSTOMIZATION,
            ...source
        });
        this.#preserveStockColorFields(windows, source, WINDOWS_COLOR_FIELDS);

        return {
            ...windows,
            colorGroups: WINDOWS_COLOR_GROUPS.map(group => ({
                id: group.id,
                label: this.localize(group.labelKey),
                controls: group.controls.map(([field, labelKey]) => this.#buildNullableColorControl({
                    field,
                    name: `foundry.windows.${field}`,
                    label: this.localize(labelKey),
                    value: windows[field]
                }))
            })),
            visualModeOptions: WINDOWS_VISUAL_MODE_OPTIONS.map(option => ({
                ...option,
                label: this.localize(option.labelKey),
                selected: option.id === windows.visualMode
            }))
        };
    }

    #buildChatLogControls(config) {
        const source = config.chatLog || config.areas?.chatLog?.chatLog || {};
        const chatLog = normalizeChatLogConfig({
            ...DEFAULT_CHAT_LOG_CUSTOMIZATION,
            ...source
        });
        this.#preserveStockColorFields(chatLog, source, CHAT_LOG_COLOR_FIELDS);

        return {
            ...chatLog,
            colorGroups: CHAT_LOG_COLOR_GROUPS.map(group => ({
                id: group.id,
                label: this.localize(group.labelKey),
                controls: group.controls.map(([field, labelKey]) => this.#buildNullableColorControl({
                    field,
                    name: `foundry.chatLog.${field}`,
                    label: this.localize(labelKey),
                    value: chatLog[field]
                }))
            })),
            transformerPresets: CHAT_LOG_TRANSFORMER_PRESETS.map(preset => ({
                ...preset,
                label: this.localize(preset.labelKey),
                description: this.localize(preset.descriptionKey)
            }))
        };
    }
}

function clone(value) {
    if (globalThis.foundry?.utils?.deepClone) return foundry.utils.deepClone(value);
    return JSON.parse(JSON.stringify(value));
}
