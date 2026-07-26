/**
 * Your Flavor - Foundry icon registry.
 * Defines the supported icon targets before discovery, selection, and per-icon
 * styling are layered on top in later tasks.
 */

export const ICON_REGISTRY_VERSION = 1;
export const ICON_GLYPH_FALLBACK_CLASS = 'fas fa-icons';

export const ICON_STATE_IDS = Object.freeze({
    DEFAULT: 'default',
    HOVER: 'hover',
    ACTIVE: 'active'
});

export const ICON_GROUPS = Object.freeze([
    {
        id: 'sceneNavigation',
        area: 'navigation',
        labelKey: 'YOUR_FLAVOR.IconRegistry.Groups.SceneNavigation'
    },
    {
        id: 'sceneControls',
        area: 'controls',
        labelKey: 'YOUR_FLAVOR.IconRegistry.Groups.SceneControls'
    },
    {
        id: 'playerControls',
        area: 'players',
        labelKey: 'YOUR_FLAVOR.IconRegistry.Groups.PlayerControls'
    },
    {
        id: 'windowControls',
        area: 'windows',
        labelKey: 'YOUR_FLAVOR.IconRegistry.Groups.WindowControls'
    },
    {
        id: 'sidebarTabs',
        area: 'sidebar',
        labelKey: 'YOUR_FLAVOR.IconRegistry.Groups.SidebarTabs'
    },
    {
        id: 'hotbar',
        area: 'hotbar',
        labelKey: 'YOUR_FLAVOR.IconRegistry.Groups.Hotbar'
    },
    {
        id: 'chatControls',
        area: 'chatLog',
        labelKey: 'YOUR_FLAVOR.IconRegistry.Groups.ChatControls'
    },
    {
        id: 'directoryControls',
        area: 'sidebar',
        labelKey: 'YOUR_FLAVOR.IconRegistry.Groups.DirectoryControls'
    }
]);

export const ICON_GROUP_IDS = Object.freeze(ICON_GROUPS.map(group => group.id));

export const ICON_AREAS = Object.freeze([
    {
        id: 'navigation',
        icon: 'fas fa-map',
        labelKey: 'YOUR_FLAVOR.IconRegistry.Areas.Navigation'
    },
    {
        id: 'controls',
        icon: 'fas fa-hand-pointer',
        labelKey: 'YOUR_FLAVOR.IconRegistry.Areas.Controls'
    },
    {
        id: 'players',
        icon: 'fas fa-users',
        labelKey: 'YOUR_FLAVOR.IconRegistry.Areas.Players'
    },
    {
        id: 'hotbar',
        icon: 'fas fa-keyboard',
        labelKey: 'YOUR_FLAVOR.IconRegistry.Areas.Hotbar'
    },
    {
        id: 'sidebar',
        icon: 'fas fa-columns',
        labelKey: 'YOUR_FLAVOR.IconRegistry.Areas.Sidebar'
    },
    {
        id: 'chatLog',
        icon: 'fas fa-comments',
        labelKey: 'YOUR_FLAVOR.IconRegistry.Areas.ChatLog'
    },
    {
        id: 'windows',
        icon: 'far fa-window-maximize',
        labelKey: 'YOUR_FLAVOR.IconRegistry.Areas.Windows'
    },
    {
        id: 'pause',
        icon: 'fas fa-pause-circle',
        labelKey: 'YOUR_FLAVOR.IconRegistry.Areas.Pause'
    }
]);

export const ICON_AREA_IDS = Object.freeze(ICON_AREAS.map(area => area.id));

const ICON_GROUP_ID_SET = new Set(ICON_GROUP_IDS);
const ICON_AREA_ID_SET = new Set(ICON_AREA_IDS);
const DEFAULT_ICON_GROUP_BY_AREA = Object.freeze(ICON_GROUPS.reduce((groups, group) => {
    groups[group.area] ??= group.id;
    return groups;
}, {}));
export const FA_ICON_SELECTOR = ':is(i, .fa, .fas, .far, .fal, .fad, .fab, .fat, .fass, .fasr, .fasl, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin, .fa-brands)';
const BUTTONISH_TARGETS = 'button, a, [role="button"], [data-action], [data-control], [data-tool]';
const BUTTONISH_SELECTOR = `:is(${BUTTONISH_TARGETS})`;
const UI_CONTROL_SELECTOR = ':is(.ui-control, .control-tool, button, a, [role="button"])';
const DYNAMIC_ICON_TARGET_SELECTOR = ':is(button, a, [role="button"], [data-action], [data-tool], [data-control], [data-module], [data-tooltip], [aria-label], [title], .ui-control, .control-tool, .scene-control, .control-icon)';
const DYNAMIC_STANDALONE_ICON_SELECTOR = ':is(i, img, svg, .fa, .fas, .far, .fal, .fad, .fab, .fat, .fass, .fasr, .fasl, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin, .fa-brands)';
const DYNAMIC_ICON_ID_PREFIX = 'dynamic';
const DYNAMIC_ICON_AREA_PRIORITY = Object.freeze([
    'controls',
    'navigation',
    'players',
    'hotbar',
    'sidebar',
    'chatLog',
    'windows',
    'pause'
]);
const DYNAMIC_ICON_ROOT_SELECTORS = Object.freeze({
    navigation: ['#scene-navigation', '#navigation'],
    controls: ['#scene-controls', '#controls', '#ui-left', '#ui-left-column-1', '#token-hud', '.placeable-hud', '#measurement'],
    players: ['#players'],
    hotbar: ['#hotbar'],
    sidebar: ['#sidebar', '#sidebar-tabs', '#sidebar-content', '.sidebar-popout', '.sidebar-tab'],
    chatLog: ['#chat', '#chat-log', '.chat-sidebar', '.chat-log', '#chat-form'],
    windows: ['.window-app', '.application'],
    pause: ['#pause']
});
const DYNAMIC_SELECTOR_ATTRIBUTES = Object.freeze([
    'data-tool',
    'data-action',
    'data-control',
    'data-module',
    'data-tab',
    'data-tooltip',
    'aria-label',
    'title'
]);
const FA_CLASS_PATTERN = /^(fa|fas|far|fal|fad|fab|fat|fass|fasr|fasl|fa-solid|fa-regular|fa-light|fa-thin|fa-duotone|fa-brands|fa-[a-z0-9-]+)$/i;

const DEFAULT_ICON_STATES = Object.freeze([
    {
        id: ICON_STATE_IDS.DEFAULT,
        selector: '',
        tokenKey: 'color',
        labelKey: 'YOUR_FLAVOR.IconRegistry.States.Default'
    },
    {
        id: ICON_STATE_IDS.HOVER,
        selector: ':is(:hover, :focus-visible)',
        tokenKey: 'hoverColor',
        labelKey: 'YOUR_FLAVOR.IconRegistry.States.Hover'
    },
    {
        id: ICON_STATE_IDS.ACTIVE,
        selector: ':is(.active, .selected, [aria-pressed="true"], [aria-current="true"], [data-active="true"])',
        tokenKey: 'activeColor',
        labelKey: 'YOUR_FLAVOR.IconRegistry.States.Active'
    }
]);

export const FOUNDRY_ICON_REGISTRY = Object.freeze([
    iconEntry({
        id: 'navigation.expand',
        area: 'navigation',
        selectors: iconTargetSelectors([
            '#scene-navigation #scene-navigation-expand',
            '#scene-navigation .scene-navigation-toggle',
            '#navigation #nav-toggle',
            '#navigation [data-action="toggle"]'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.NavigationExpand',
        defaultGroup: 'sceneNavigation',
        iconClass: 'fas fa-caret-up'
    }),
    iconEntry({
        id: 'navigation.scene-active',
        area: 'navigation',
        selectors: [
            '#scene-navigation .scene-navigation-menu .scene.active',
            '#scene-navigation .scene-list .scene.active',
            '#scene-navigation .scene.active',
            '#navigation #scene-list .scene.active',
            '#navigation .scene-list .scene.active',
            '#navigation .scene.nav-item.active'
        ],
        styleSelectors: [
            '#scene-navigation .scene-navigation-menu .scene.active',
            '#scene-navigation .scene-navigation-menu .scene.active::after',
            '#scene-navigation .scene-list .scene.active',
            '#scene-navigation .scene.active',
            '#navigation #scene-list .scene.active',
            '#navigation .scene-list .scene.active',
            '#navigation .scene.nav-item.active'
        ],
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.NavigationSceneActive',
        defaultGroup: 'sceneNavigation',
        iconClass: 'far fa-circle-dot',
        supportsIconClass: false
    }),
    iconEntry({
        id: 'navigation.scene-viewed',
        area: 'navigation',
        selectors: [
            '#scene-navigation .scene-navigation-menu .scene.view',
            '#scene-navigation .scene-navigation-menu .scene.viewed',
            '#scene-navigation .scene-list .scene.view',
            '#scene-navigation .scene.view',
            '#navigation #scene-list .scene.view',
            '#navigation .scene-list .scene.viewed',
            '#navigation .scene.nav-item.view'
        ],
        styleSelectors: [
            '#scene-navigation .scene-navigation-menu .scene.view',
            '#scene-navigation .scene-navigation-menu .scene.view::after',
            '#scene-navigation .scene-navigation-menu .scene.viewed',
            '#scene-navigation .scene-navigation-menu .scene.viewed::after',
            '#scene-navigation .scene-list .scene.view',
            '#scene-navigation .scene.view',
            '#navigation #scene-list .scene.view',
            '#navigation .scene-list .scene.viewed',
            '#navigation .scene.nav-item.view'
        ],
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.NavigationSceneViewed',
        defaultGroup: 'sceneNavigation',
        iconClass: 'fas fa-eye',
        supportsIconClass: false
    }),
    iconEntry({
        id: 'navigation.scene-hidden',
        area: 'navigation',
        selectors: [
            '#scene-navigation .scene-navigation-menu .scene.gm',
            '#scene-navigation .scene-navigation-menu .scene.hidden',
            '#scene-navigation .scene-list .scene.gm',
            '#scene-navigation .scene.hidden',
            '#navigation #scene-list .scene.gm',
            '#navigation .scene-list .scene.hidden',
            '#navigation .scene.nav-item.gm'
        ],
        styleSelectors: [
            '#scene-navigation .scene-navigation-menu .scene.gm',
            '#scene-navigation .scene-navigation-menu .scene.gm::after',
            '#scene-navigation .scene-navigation-menu .scene.hidden',
            '#scene-navigation .scene-navigation-menu .scene.hidden::after',
            '#scene-navigation .scene-list .scene.gm',
            '#scene-navigation .scene.hidden',
            '#navigation #scene-list .scene.gm',
            '#navigation .scene-list .scene.hidden',
            '#navigation .scene.nav-item.gm'
        ],
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.NavigationSceneHidden',
        defaultGroup: 'sceneNavigation',
        iconClass: 'fas fa-eye-slash',
        supportsIconClass: false
    }),
    iconEntry({
        id: 'navigation.scene-players',
        area: 'navigation',
        selectors: [
            '#scene-navigation .scene-navigation-menu .scene-players .scene-player',
            '#scene-navigation .scene .scene-players .scene-player',
            '#navigation .scene-players .scene-player'
        ],
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.NavigationScenePlayers',
        defaultGroup: 'sceneNavigation',
        iconClass: 'fas fa-user',
        supportsIconClass: false
    }),
    iconEntry({
        id: 'controls.tool-select',
        area: 'controls',
        selectors: iconTargetSelectors([
            '#scene-controls [data-tool="select"]',
            '#scene-controls [data-tool="tokens"]',
            '#scene-controls [data-control="token"]',
            '#controls [data-tool="select"]',
            '#controls [data-control="token"]'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.ControlsSelectTool',
        defaultGroup: 'sceneControls',
        iconClass: 'fas fa-arrow-pointer'
    }),
    iconEntry({
        id: 'controls.tool-measure',
        area: 'controls',
        selectors: iconTargetSelectors([
            '#scene-controls [data-tool="measure"]',
            '#scene-controls [data-tool="ruler"]',
            '#scene-controls [data-control="measure"]',
            '#controls [data-tool="measure"]',
            '#controls [data-tool="ruler"]'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.ControlsMeasureTool',
        defaultGroup: 'sceneControls',
        iconClass: 'fas fa-ruler-combined'
    }),
    iconEntry({
        id: 'controls.tool-template',
        area: 'controls',
        selectors: iconTargetSelectors([
            '#scene-controls [data-control="template"]',
            '#scene-controls [data-tool="template"]',
            '#scene-controls [data-tool="circle"]',
            '#scene-controls [data-tool="cone"]',
            '#scene-controls [data-tool="rect"]',
            '#scene-controls [data-tool="ray"]',
            '#controls [data-control="template"]',
            '#controls [data-tool="template"]'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.ControlsTemplateTool',
        defaultGroup: 'sceneControls',
        iconClass: 'fas fa-draw-polygon'
    }),
    iconEntry({
        id: 'controls.tool-lighting',
        area: 'controls',
        selectors: iconTargetSelectors([
            '#scene-controls [data-control="lighting"]',
            '#scene-controls [data-tool="light"]',
            '#scene-controls [data-tool="lighting"]',
            '#controls [data-control="lighting"]',
            '#controls [data-tool="light"]'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.ControlsLightingTool',
        defaultGroup: 'sceneControls',
        iconClass: 'fas fa-lightbulb'
    }),
    iconEntry({
        id: 'controls.hud-buttons',
        area: 'controls',
        selectors: iconTargetSelectors([
            '.placeable-hud [data-action]',
            '.placeable-hud .control-icon',
            '#token-hud [data-action]',
            '#measurement .waypoint-label'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.ControlsHudButtons',
        defaultGroup: 'sceneControls',
        iconClass: 'fas fa-crosshairs'
    }),
    iconEntry({
        id: 'controls.main-palette',
        area: 'controls',
        selectors: iconTargetSelectors([
            '#scene-controls #scene-controls-controls .ui-control',
            '#scene-controls > menu .ui-control',
            '#scene-controls .control-tool',
            '#scene-controls [data-tool]',
            '#scene-controls [data-action]',
            '#scene-controls [role="button"]',
            '#controls .main-controls .control-tool',
            '#controls .main-controls [data-control]',
            '#controls .control-tool',
            '#controls [data-tool]',
            '#controls [data-action]'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.ControlsMainPalette',
        defaultGroup: 'sceneControls',
        iconClass: 'fas fa-layer-group'
    }),
    iconEntry({
        id: 'players.expand',
        area: 'players',
        selectors: iconTargetSelectors([
            '#players #players-expand',
            '#players [data-action="toggle"]',
            '#players [data-action="expand"]'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.PlayersExpand',
        defaultGroup: 'playerControls',
        iconClass: 'fas fa-chevron-down'
    }),
    iconEntry({
        id: 'players.performance',
        area: 'players',
        selectors: iconTargetSelectors([
            '#players #performance-stats',
            '#players [data-action="performance"]',
            '#players [data-action="fps"]'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.PlayersPerformance',
        defaultGroup: 'playerControls',
        iconClass: 'fas fa-gauge-high'
    }),
    iconEntry({
        id: 'players.status',
        area: 'players',
        selectors: [
            '#players .players-list > .player::before',
            '#players .player .player-active',
            '#players .player .player-status',
            '#players .player .status'
        ],
        matchSelectors: [
            '#players .players-list > .player',
            '#players .player .player-active',
            '#players .player .player-status',
            '#players .player .status'
        ],
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.PlayersStatus',
        defaultGroup: 'playerControls',
        iconClass: 'fas fa-circle',
        supportsIconClass: false
    }),
    iconEntry({
        id: 'hotbar.lock',
        area: 'hotbar',
        selectors: iconTargetSelectors([
            '#hotbar [data-action="lock"]',
            '#hotbar [data-action="toggleLocked"]',
            '#hotbar .hotbar-lock'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.HotbarLock',
        defaultGroup: 'hotbar',
        iconClass: 'fas fa-lock'
    }),
    iconEntry({
        id: 'hotbar.clear',
        area: 'hotbar',
        selectors: iconTargetSelectors([
            '#hotbar [data-action="clear"]',
            '#hotbar [data-action="clearSlot"]',
            '#hotbar .hotbar-clear'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.HotbarClear',
        defaultGroup: 'hotbar',
        iconClass: 'fas fa-trash'
    }),
    iconEntry({
        id: 'hotbar.directory',
        area: 'hotbar',
        selectors: iconTargetSelectors([
            '#hotbar [data-action="directory"]',
            '#hotbar [data-action="macroDirectory"]',
            '#hotbar .hotbar-directory'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.HotbarDirectory',
        defaultGroup: 'hotbar',
        iconClass: 'fas fa-folder-open'
    }),
    iconEntry({
        id: 'hotbar.page-controls',
        area: 'hotbar',
        selectors: iconTargetSelectors([
            '#hotbar .hotbar-controls button',
            '#hotbar #hotbar-page-controls .hotbar-page-control',
            '#hotbar [data-action="page"]',
            '#hotbar [data-action="cycle"]'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.HotbarPageControls',
        defaultGroup: 'hotbar',
        iconClass: 'fas fa-layer-group'
    }),
    iconEntry({
        id: 'hotbar.macro-slots',
        area: 'hotbar',
        selectors: [
            '#hotbar #action-bar .slot .slot-icon',
            '#hotbar #action-bar .slot img',
            '#hotbar #action-bar .slot svg',
            '#hotbar #action-bar .slot i'
        ],
        matchSelectors: ['#hotbar #action-bar .slot'],
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.HotbarSlots',
        defaultGroup: 'hotbar',
        iconClass: 'fas fa-bolt',
        supportsIconClass: false
    }),
    ...sidebarTabEntries(),
    iconEntry({
        id: 'sidebar.collapse',
        area: 'sidebar',
        selectors: iconTargetSelectors([
            '#sidebar-tabs > menu .ui-control.collapse',
            '#sidebar-tabs [data-action="collapse"]',
            '#sidebar [data-action="collapse"]'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.SidebarCollapse',
        defaultGroup: 'sidebarTabs',
        iconClass: 'fas fa-caret-right'
    }),
    iconEntry({
        id: 'sidebar.notification-pips',
        area: 'sidebar',
        selectors: [
            '#sidebar-tabs .notification-pip',
            '#sidebar-tabs .notification',
            '#sidebar .notification-pip'
        ],
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.SidebarNotifications',
        defaultGroup: 'sidebarTabs',
        iconClass: 'fas fa-circle',
        supportsIconClass: false
    }),
    iconEntry({
        id: 'directory.create',
        area: 'sidebar',
        selectors: iconTargetSelectors([
            '#sidebar-content .directory .directory-header [data-action="create"]',
            '#sidebar-content .directory .directory-header [data-action="createEntry"]',
            '#sidebar-content .directory .directory-header .create-document',
            '.sidebar-popout .directory .directory-header [data-action="create"]'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.DirectoryCreate',
        defaultGroup: 'directoryControls',
        iconClass: 'fas fa-plus'
    }),
    iconEntry({
        id: 'directory.folder',
        area: 'sidebar',
        selectors: iconTargetSelectors([
            '#sidebar-content .directory .directory-header [data-action="createFolder"]',
            '#sidebar-content .directory .folder-header',
            '#sidebar-content .directory .folder-header .folder-name',
            '.sidebar-popout .directory .folder-header'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.DirectoryFolders',
        defaultGroup: 'directoryControls',
        iconClass: 'fas fa-folder'
    }),
    iconEntry({
        id: 'directory.search-filter',
        area: 'sidebar',
        selectors: iconTargetSelectors([
            '#sidebar-content .directory .directory-header [data-action="search"]',
            '#sidebar-content .directory .directory-header [data-action="toggleSearchMode"]',
            '#sidebar-content .directory .directory-header .header-search',
            '#sidebar-content .directory .directory-header .filter'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.DirectorySearchFilter',
        defaultGroup: 'directoryControls',
        iconClass: 'fas fa-search'
    }),
    iconEntry({
        id: 'directory.item-controls',
        area: 'sidebar',
        selectors: iconTargetSelectors([
            '#sidebar-content .directory .directory-item [data-action]',
            '#sidebar-content .directory .folder-header [data-action]',
            '.sidebar-popout .directory .directory-item [data-action]',
            '.sidebar-popout .directory .folder-header [data-action]'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.DirectoryItemControls',
        defaultGroup: 'directoryControls',
        iconClass: 'fas fa-ellipsis-vertical'
    }),
    iconEntry({
        id: 'chat.roll-mode',
        area: 'chatLog',
        selectors: iconTargetSelectors([
            '#chat-controls [data-action="rollMode"]',
            '#chat-controls [name="rollMode"]',
            '#chat-controls .roll-type-select',
            '#chat-form [data-action="rollMode"]'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.ChatRollMode',
        defaultGroup: 'chatControls',
        iconClass: 'fas fa-dice-d20'
    }),
    iconEntry({
        id: 'chat.control-buttons',
        area: 'chatLog',
        selectors: iconTargetSelectors([
            '#chat-controls .ui-control',
            '#chat-controls button',
            '#chat-form button',
            '#chat-message button',
            '#chat .chat-input-control'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.ChatControlButtons',
        defaultGroup: 'chatControls',
        iconClass: 'fas fa-comment-dots'
    }),
    iconEntry({
        id: 'chat.message-actions',
        area: 'chatLog',
        selectors: iconTargetSelectors([
            '#chat-log .chat-message .message-header [data-action]',
            '#chat-log .chat-message .message-metadata [data-action]',
            '#chat-log .chat-message .message-header button',
            '#chat-log .chat-message .message-metadata button'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.ChatMessageActions',
        defaultGroup: 'chatControls',
        iconClass: 'fas fa-ellipsis-vertical'
    }),
    iconEntry({
        id: 'windows.close',
        area: 'windows',
        selectors: iconTargetSelectors([
            '.application .window-header [data-action="close"]',
            '.window-app .window-header .close',
            '.window-app .window-header [data-action="close"]',
            '.application .window-header .header-control.close'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.WindowsClose',
        defaultGroup: 'windowControls',
        iconClass: 'fas fa-xmark'
    }),
    iconEntry({
        id: 'windows.minimize',
        area: 'windows',
        selectors: iconTargetSelectors([
            '.application .window-header [data-action="minimize"]',
            '.window-app .window-header .minimize',
            '.window-app .window-header [data-action="minimize"]',
            '.application .window-header .header-control.minimize'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.WindowsMinimize',
        defaultGroup: 'windowControls',
        iconClass: 'fas fa-minus'
    }),
    iconEntry({
        id: 'windows.configure',
        area: 'windows',
        selectors: iconTargetSelectors([
            '.application .window-header [data-action="configure"]',
            '.application .window-header [data-action="settings"]',
            '.window-app .window-header .configure-sheet',
            '.window-app .window-header .configure'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.WindowsConfigure',
        defaultGroup: 'windowControls',
        iconClass: 'fas fa-gear'
    }),
    iconEntry({
        id: 'windows.popout',
        area: 'windows',
        selectors: iconTargetSelectors([
            '.application .window-header [data-action="popout"]',
            '.application .window-header [data-action="renderPopout"]',
            '.window-app .window-header .popout',
            '.window-app .window-header .header-button.popout'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.WindowsPopout',
        defaultGroup: 'windowControls',
        iconClass: 'fas fa-up-right-from-square'
    }),
    iconEntry({
        id: 'windows.header-controls',
        area: 'windows',
        selectors: iconTargetSelectors([
            '.application .window-header button.header-control',
            '.application .window-header a.header-control',
            '.application .window-header .header-button',
            '.window-app .window-header button.header-control',
            '.window-app .window-header a.header-control',
            '.window-app .window-header .header-button'
        ]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.WindowHeaderControls',
        defaultGroup: 'windowControls',
        iconClass: 'fas fa-window-maximize'
    }),
    iconEntry({
        id: 'pause.icon',
        area: 'pause',
        selectors: [
            '#pause img',
            '#pause svg',
            '#pause i',
            '#pause .pause-icon',
            '#pause .paused'
        ],
        matchSelectors: ['#pause'],
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.PauseIcon',
        defaultGroup: 'windowControls',
        iconClass: 'fas fa-pause',
        supportsIconClass: false
    }),
    legacyIconEntry({
        id: 'scene-controls.tools',
        area: 'controls',
        selectors: iconTargetSelectors([`:is(#controls, #scene-controls) :is(.control-tool, .ui-control, ${BUTTONISH_TARGETS})`]),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.SceneControlTools',
        defaultGroup: 'sceneControls',
        iconClass: 'fas fa-compass-drafting'
    }),
    legacyIconEntry({
        id: 'scene-controls.hud-tools',
        area: 'controls',
        selectors: iconTargetSelectors([':is(.placeable-hud, #measurement, #token-hud)']),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.SceneHudTools',
        defaultGroup: 'sceneControls',
        iconClass: 'fas fa-crosshairs'
    }),
    legacyIconEntry({
        id: 'scene-navigation.controls',
        area: 'navigation',
        selectors: iconTargetSelectors([':is(#navigation, #scene-navigation)']),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.SceneNavigationControls',
        defaultGroup: 'sceneNavigation',
        iconClass: 'fas fa-map-location-dot'
    }),
    legacyIconEntry({
        id: 'sidebar.tabs',
        area: 'sidebar',
        selectors: iconTargetSelectors(['#sidebar-tabs :is(a, button, [role="tab"], .ui-control)']),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.SidebarTabs',
        defaultGroup: 'sidebarTabs',
        iconClass: 'fas fa-folder-tree'
    }),
    legacyIconEntry({
        id: 'window.header-controls',
        area: 'windows',
        selectors: iconTargetSelectors([':is(.window-app, .application) .window-header :is(button.header-control, a.header-control, .header-button, [data-action])']),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.WindowHeaderControls',
        defaultGroup: 'windowControls',
        iconClass: 'fas fa-window-maximize'
    }),
    legacyIconEntry({
        id: 'players.controls',
        area: 'players',
        selectors: iconTargetSelectors(['#players :is(button, a, [role="button"], [data-action])']),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.PlayerControls',
        defaultGroup: 'playerControls',
        iconClass: 'fas fa-user-group'
    }),
    legacyIconEntry({
        id: 'chat.controls',
        area: 'chatLog',
        selectors: iconTargetSelectors([':is(#chat-controls, #chat-form, #chat-message) :is(button, a, [role="button"], [data-action])']),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.ChatControls',
        defaultGroup: 'chatControls',
        iconClass: 'fas fa-comment-dots'
    }),
    legacyIconEntry({
        id: 'chat.message-controls',
        area: 'chatLog',
        selectors: iconTargetSelectors(['#chat-log .chat-message :is(.message-header, .message-metadata) :is(button, a, [role="button"], [data-action])']),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.ChatMessageControls',
        defaultGroup: 'chatControls',
        iconClass: 'fas fa-reply'
    }),
    legacyIconEntry({
        id: 'directory.header-controls',
        area: 'sidebar',
        selectors: iconTargetSelectors([':is(#sidebar-content .directory, .sidebar-popout .directory, .directory.sidebar-tab) :is(.directory-header, .directory-footer) :is(button, a, [role="button"], [data-action])']),
        labelKey: 'YOUR_FLAVOR.IconRegistry.Entries.DirectoryHeaderControls',
        defaultGroup: 'directoryControls',
        iconClass: 'fas fa-folder-plus'
    })
]);

export const ICON_REGISTRY_BY_ID = Object.freeze(Object.fromEntries(
    FOUNDRY_ICON_REGISTRY.map(entry => [entry.id, entry])
));

export function getIconRegistry({ localize = null } = {}) {
    return {
        version: ICON_REGISTRY_VERSION,
        areas: getIconAreas({ localize }),
        groups: getIconGroups({ localize }),
        entries: getIconRegistryEntries({ localize })
    };
}

export function getIconAreas({ localize = null } = {}) {
    return ICON_AREAS.map(area => withLabel(area, localize));
}

export function getIconGroups({ localize = null } = {}) {
    return ICON_GROUPS.map(group => withLabel(group, localize));
}

export function getIconRegistryEntries({ area = null, group = null, localize = null, includeLegacy = false } = {}) {
    return FOUNDRY_ICON_REGISTRY
        .filter(entry => includeLegacy || !entry.legacy)
        .filter(entry => !area || entry.area === area)
        .filter(entry => !group || entry.defaultGroup === group)
        .map(entry => withIconGlyphPresentation(withLabel({
            ...entry,
            states: entry.states.map(state => withLabel(state, localize))
        }, localize)));
}

export function getIconRegistryEntry(iconId, { localize = null } = {}) {
    const entry = ICON_REGISTRY_BY_ID[iconId] || null;
    if (!entry) return null;
    return withIconGlyphPresentation(withLabel({
        ...entry,
        states: entry.states.map(state => withLabel(state, localize))
    }, localize));
}

/**
 * Resolve the decorative glyph shown for an icon-registry entry.
 *
 * The registry's actual iconClass is authoritative. The generic Icons glyph is
 * reserved for entries that genuinely have no usable mapping.
 */
export function resolveIconGlyphPresentation(entry = {}, {
    fallbackIconClass = ICON_GLYPH_FALLBACK_CLASS
} = {}) {
    const mappedIconClass = normalizeIconClassList(entry?.iconClass).join(' ');
    const normalizedFallback = normalizeIconClassList(fallbackIconClass).join(' ')
        || ICON_GLYPH_FALLBACK_CLASS;
    const hasResolvedGlyph = Boolean(mappedIconClass)
        && mappedIconClass !== ICON_GLYPH_FALLBACK_CLASS;

    return {
        displayIconClass: hasResolvedGlyph ? mappedIconClass : normalizedFallback,
        hasResolvedGlyph,
        usesFallbackGlyph: !hasResolvedGlyph
    };
}

export function getIconOverrideRegistryEntry(iconId, override = {}, { localize = null } = {}) {
    if (!isPlainObject(override)) return null;
    const normalizedId = typeof iconId === 'string' ? iconId.trim() : '';
    if (!normalizedId) return null;
    if (!override.dynamic && !normalizedId.startsWith(`${DYNAMIC_ICON_ID_PREFIX}.`)) return null;

    const selectors = normalizeSelectorList(override.selectors ?? override.selector);
    if (!selectors.length) return null;

    const area = normalizeIconAreaId(override.area);
    const styleSelectors = normalizeSelectorList(override.styleSelectors ?? selectors);
    const matchSelectors = normalizeSelectorList(override.matchSelectors ?? selectors);
    const label = normalizeLabel(override.label) || humanizeIdentifier(normalizedId);
    const labelKey = normalizeLabel(override.labelKey) || null;
    const defaultGroup = normalizeIconGroupId(
        override.defaultGroup,
        DEFAULT_ICON_GROUP_BY_AREA[area] || 'sceneControls'
    );
    const baseIconClass = normalizeIconClassList(override.baseIconClass || override.sourceIconClass || override.originalIconClass).join(' ')
        || normalizeIconClassList(override.iconClass).join(' ')
        || 'fas fa-icons';

    return withLabel({
        id: normalizedId,
        area,
        selector: selectors.join(', '),
        selectors: Object.freeze(selectors),
        styleSelectors: Object.freeze(styleSelectors.length ? styleSelectors : selectors),
        matchSelectors: Object.freeze(matchSelectors.length ? matchSelectors : selectors),
        label,
        labelKey,
        defaultGroup,
        iconClass: baseIconClass,
        supportsIconClass: override.supportsIconClass !== false,
        legacy: false,
        dynamic: true,
        states: DEFAULT_ICON_STATES.map(state => Object.freeze({ ...state }))
    }, localize);
}

export function getIconOverrideRegistryEntries(overrides = {}, { area = null, localize = null } = {}) {
    if (!isPlainObject(overrides)) return [];
    return Object.entries(overrides)
        .map(([iconId, override]) => getIconOverrideRegistryEntry(iconId, override, { localize }))
        .filter(entry => entry && (!area || entry.area === area));
}

export function resolveIconRegistryEntry(iconId, { overrides = null, localize = null } = {}) {
    const staticEntry = getIconRegistryEntry(iconId, { localize });
    if (staticEntry) return staticEntry;
    if (!isPlainObject(overrides)) return null;
    return getIconOverrideRegistryEntry(iconId, overrides[iconId], { localize });
}

export function inspectIconRegistryEntry(entry, { root = globalThis.document, localize = null } = {}) {
    if (!entry) return null;
    return inspectIconEntry(entry, root, localize);
}

export function findIconRegistryTarget(target, {
    root = globalThis.document,
    localize = null
} = {}) {
    if (!target || !root?.querySelectorAll) return null;

    const targetElement = getElementTarget(target);
    if (!targetElement) return null;

    for (const entry of FOUNDRY_ICON_REGISTRY) {
        const match = findEntryTarget(entry, targetElement, root);
        if (!match) continue;
        const localizedEntry = getIconRegistryEntry(entry.id, { localize });
        const dynamicEntry = createDynamicIconRegistryEntry(localizedEntry, targetElement, match, {
            root,
            localize
        });

        return {
            entry: dynamicEntry || localizedEntry,
            element: dynamicEntry?.targetElement || match
        };
    }

    return findDynamicIconRegistryTarget(targetElement, { root, localize });
}

export function getIconDiscoveryDiagnostics({
    root = globalThis.document,
    localize = null,
    foundryVersion = null,
    systemId = null,
    checkedAt = new Date().toISOString()
} = {}) {
    const entries = FOUNDRY_ICON_REGISTRY.map(entry => inspectIconEntry(entry, root, localize));
    const groups = getIconGroups({ localize }).map(group => {
        const groupEntries = entries.filter(entry => entry.defaultGroup === group.id);
        return {
            ...group,
            status: discoveryStatus(groupEntries),
            totalEntries: groupEntries.length,
            presentEntries: groupEntries.filter(entry => entry.present).length,
            missingEntries: groupEntries.filter(entry => !entry.present && !entry.invalid).length,
            invalidEntries: groupEntries.filter(entry => entry.invalid).length,
            targetCount: groupEntries.reduce((total, entry) => total + entry.targetCount, 0),
            entries: groupEntries
        };
    });

    return {
        checkedAt,
        registryVersion: ICON_REGISTRY_VERSION,
        foundryVersion,
        systemId,
        totalEntries: entries.length,
        presentEntries: entries.filter(entry => entry.present).length,
        missingEntries: entries.filter(entry => !entry.present && !entry.invalid).length,
        invalidEntries: entries.filter(entry => entry.invalid).length,
        targetCount: entries.reduce((total, entry) => total + entry.targetCount, 0),
        groups,
        entries
    };
}

export function isKnownIconGroupId(groupId) {
    return ICON_GROUP_ID_SET.has(groupId);
}

export function isKnownIconAreaId(areaId) {
    return ICON_AREA_ID_SET.has(areaId);
}

export function normalizeIconGroupId(groupId, fallback = 'sceneControls') {
    return isKnownIconGroupId(groupId) ? groupId : fallback;
}

export function normalizeIconAreaId(areaId, fallback = 'controls') {
    return isKnownIconAreaId(areaId) ? areaId : fallback;
}

function iconEntry({
    id,
    area,
    selector = null,
    selectors = null,
    styleSelectors = null,
    matchSelectors = null,
    labelKey,
    defaultGroup,
    iconClass = 'fas fa-icons',
    supportsIconClass = true,
    legacy = false,
    states = DEFAULT_ICON_STATES
}) {
    const normalizedSelectors = normalizeSelectorList(selectors ?? selector);
    const normalizedStyleSelectors = normalizeSelectorList(styleSelectors ?? normalizedSelectors);
    const normalizedMatchSelectors = normalizeSelectorList(matchSelectors ?? normalizedSelectors);
    const stateVariants = Object.freeze(states.map(state => Object.freeze({ ...state })));
    return Object.freeze({
        id,
        area: normalizeIconAreaId(area),
        selector: normalizedSelectors.join(', '),
        selectors: Object.freeze(normalizedSelectors),
        styleSelectors: Object.freeze(normalizedStyleSelectors),
        matchSelectors: Object.freeze(normalizedMatchSelectors),
        labelKey,
        defaultGroup: normalizeIconGroupId(defaultGroup),
        iconClass,
        supportsIconClass,
        legacy,
        states: stateVariants
    });
}

function withIconGlyphPresentation(entry) {
    return {
        ...entry,
        ...resolveIconGlyphPresentation(entry)
    };
}

function inspectIconEntry(entry, root, localize) {
    const result = inspectSelectorList(entry.matchSelectors, root);
    return withLabel({
        ...entry,
        states: entry.states.map(state => withLabel(state, localize)),
        selector: entry.matchSelectors.join(', '),
        status: result.invalid ? 'invalid' : result.present ? 'found' : 'missing',
        targetCount: result.count,
        present: result.present,
        invalid: result.invalid,
        error: result.error
    }, localize);
}

function inspectSelectorList(selectors, root = globalThis.document) {
    return normalizeSelectorList(selectors).reduce((summary, selector) => {
        const result = inspectSelector(selector, root);
        return {
            selector: [...summary.selector, selector],
            count: summary.count + result.count,
            present: summary.present || result.present,
            invalid: summary.invalid || result.invalid,
            error: summary.error || result.error
        };
    }, {
        selector: [],
        count: 0,
        present: false,
        invalid: false,
        error: null
    });
}

function inspectSelector(selector, root = globalThis.document) {
    if (!root?.querySelectorAll) {
        return {
            selector,
            count: 0,
            present: false,
            invalid: false,
            error: null
        };
    }

    try {
        const count = root.querySelectorAll(selector).length;
        return {
            selector,
            count,
            present: count > 0,
            invalid: false,
            error: null
        };
    } catch (error) {
        return {
            selector,
            count: 0,
            present: false,
            invalid: true,
            error: error?.message || String(error)
        };
    }
}

function findEntryTarget(entry, target, root) {
    for (const selector of entry.matchSelectors ?? [entry.selector]) {
        let targets = [];

        try {
            targets = Array.from(root.querySelectorAll(selector));
        } catch (_error) {
            continue;
        }

        const match = targets.find(element => (
            element === target
            || element.contains?.(target)
            || target.contains?.(element)
        ));
        if (match) return match;
    }

    return null;
}

function findDynamicIconRegistryTarget(targetElement, {
    root = globalThis.document,
    localize = null
} = {}) {
    const dynamicTarget = findDynamicIconTarget(targetElement, null);
    if (!dynamicTarget) return null;

    const areaRoot = findDynamicIconAreaRoot(dynamicTarget, root);
    if (!areaRoot) return null;

    const iconElement = findFontAwesomeElement(targetElement, dynamicTarget);
    const baseEntry = {
        id: `${areaRoot.area}.dynamic`,
        area: areaRoot.area,
        defaultGroup: DEFAULT_ICON_GROUP_BY_AREA[areaRoot.area] || 'sceneControls',
        iconClass: getFontAwesomeClassName(iconElement) || 'fas fa-icons',
        supportsIconClass: Boolean(iconElement),
        label: humanizeIdentifier(areaRoot.area)
    };
    const entry = createDynamicIconRegistryEntry(baseEntry, targetElement, dynamicTarget, {
        root,
        localize,
        rootInfo: areaRoot.rootInfo
    });

    if (!entry) return null;
    return {
        entry,
        element: entry.targetElement || dynamicTarget
    };
}

function createDynamicIconRegistryEntry(baseEntry, targetElement, matchedElement, {
    root = globalThis.document,
    localize = null,
    rootInfo = null
} = {}) {
    if (!baseEntry || baseEntry.legacy) return null;

    const dynamicTarget = findDynamicIconTarget(targetElement, matchedElement);
    if (!dynamicTarget) return null;

    const resolvedRootInfo = rootInfo || findDynamicIconRoot(dynamicTarget, baseEntry.area, root);
    if (!resolvedRootInfo?.element || !resolvedRootInfo.selector) return null;

    const localSelector = buildDynamicElementSelector(dynamicTarget, resolvedRootInfo.element);
    if (!localSelector) return null;

    const selector = `${resolvedRootInfo.selector} ${localSelector}`;
    if (!selectorMatchesElement(root, selector, dynamicTarget)) return null;

    const selectors = iconTargetSelectors([selector]);
    const iconElement = findFontAwesomeElement(targetElement, dynamicTarget);
    const label = getDynamicIconLabel(dynamicTarget, baseEntry, localize);
    const id = buildDynamicIconId(baseEntry.area, label, selector);

    return {
        id,
        area: baseEntry.area,
        selector: selectors.join(', '),
        selectors: Object.freeze(selectors),
        styleSelectors: Object.freeze(selectors),
        matchSelectors: Object.freeze(selectors),
        label,
        defaultGroup: baseEntry.defaultGroup,
        iconClass: getFontAwesomeClassName(iconElement) || baseEntry.iconClass || 'fas fa-icons',
        supportsIconClass: Boolean(iconElement) && baseEntry.supportsIconClass !== false,
        legacy: false,
        dynamic: true,
        targetElement: dynamicTarget,
        states: DEFAULT_ICON_STATES.map(state => Object.freeze({ ...state }))
    };
}

function findDynamicIconTarget(targetElement, matchedElement) {
    const target = getElementTarget(targetElement);
    const match = getElementTarget(matchedElement);
    if (!target) return null;

    const buttonTarget = target.closest?.(DYNAMIC_ICON_TARGET_SELECTOR);
    if (buttonTarget && (!match || match === buttonTarget || match.contains?.(buttonTarget) || buttonTarget.contains?.(match))) {
        return buttonTarget;
    }

    if (match?.matches?.(DYNAMIC_ICON_TARGET_SELECTOR)) return match;
    if (target.matches?.(DYNAMIC_STANDALONE_ICON_SELECTOR)) return target;
    return null;
}

function findDynamicIconRoot(element, area, root = globalThis.document) {
    const matchedRoot = findMatchingDynamicIconRoot(element, area, root);
    if (matchedRoot) return matchedRoot;

    const fallbackRoot = root?.body || root?.documentElement || null;
    if (!fallbackRoot) return null;
    return {
        element: fallbackRoot,
        selector: fallbackRoot === root.body ? 'body' : getElementRootSelector(fallbackRoot, null, root)
    };
}

function findDynamicIconAreaRoot(element, root = globalThis.document) {
    for (const area of DYNAMIC_ICON_AREA_PRIORITY) {
        const rootInfo = findMatchingDynamicIconRoot(element, area, root);
        if (rootInfo) return { area, rootInfo };
    }
    return null;
}

function findMatchingDynamicIconRoot(element, area, root = globalThis.document) {
    const rootSelectors = DYNAMIC_ICON_ROOT_SELECTORS[area] || [];
    for (const selector of rootSelectors) {
        const rootElement = element.closest?.(selector);
        if (rootElement) {
            return {
                element: rootElement,
                selector: getElementRootSelector(rootElement, selector, root)
            };
        }
    }
    return null;
}

function getElementRootSelector(element, fallbackSelector = null, root = globalThis.document) {
    if (element?.id) return `#${cssEscape(element.id)}`;
    if (fallbackSelector && selectorMatchesElement(root, fallbackSelector, element)) return fallbackSelector;
    return buildNthSelectorPath(element, root?.body || root?.documentElement || null);
}

function buildDynamicElementSelector(element, rootElement) {
    if (!element || !rootElement) return null;

    if (element.id) {
        const selector = `#${cssEscape(element.id)}`;
        if (selectorMatchesElement(rootElement, selector, element)) return selector;
    }

    const attributeSelectors = buildDynamicAttributeSelectors(element);
    for (const selector of attributeSelectors) {
        if (selectorMatchesElement(rootElement, selector, element)) return selector;
    }

    const classSelector = buildUsefulClassSelector(element);
    if (classSelector && selectorMatchesElement(rootElement, classSelector, element)) return classSelector;

    return buildNthSelectorPath(element, rootElement);
}

function buildDynamicAttributeSelectors(element) {
    const selectors = [];
    const dataTool = getElementAttribute(element, 'data-tool');
    const dataAction = getElementAttribute(element, 'data-action');
    const dataControl = getElementAttribute(element, 'data-control');
    const dataModule = getElementAttribute(element, 'data-module');

    if (dataControl && dataTool) selectors.push(`${element.localName}[data-control="${cssAttributeValue(dataControl)}"][data-tool="${cssAttributeValue(dataTool)}"]`);
    if (dataModule && dataTool) selectors.push(`${element.localName}[data-module="${cssAttributeValue(dataModule)}"][data-tool="${cssAttributeValue(dataTool)}"]`);
    if (dataModule && dataAction) selectors.push(`${element.localName}[data-module="${cssAttributeValue(dataModule)}"][data-action="${cssAttributeValue(dataAction)}"]`);

    for (const attribute of DYNAMIC_SELECTOR_ATTRIBUTES) {
        const value = getElementAttribute(element, attribute);
        if (!value) continue;
        selectors.push(`${element.localName}[${attribute}="${cssAttributeValue(value)}"]`);
        selectors.push(`[${attribute}="${cssAttributeValue(value)}"]`);
    }

    return [...new Set(selectors)];
}

function buildUsefulClassSelector(element) {
    const usefulClasses = Array.from(element.classList || [])
        .filter(className => ![
            'active',
            'disabled',
            'hidden',
            'hover',
            'selected',
            'ui-control',
            'control-tool',
            'scene-control',
            'control-icon'
        ].includes(className))
        .filter(className => /^[a-z0-9_-]+$/i.test(className))
        .slice(0, 3);

    if (!usefulClasses.length) return null;
    return `${element.localName}${usefulClasses.map(className => `.${cssEscape(className)}`).join('')}`;
}

function buildNthSelectorPath(element, rootElement) {
    if (!element || element === rootElement) return element?.localName || null;

    const parts = [];
    let current = element;
    while (current && current !== rootElement && current.localName) {
        parts.unshift(`${current.localName}:nth-of-type(${getElementIndexOfType(current)})`);
        current = current.parentElement;
    }

    return parts.join(' > ') || null;
}

function getElementIndexOfType(element) {
    let index = 1;
    let sibling = element.previousElementSibling;
    while (sibling) {
        if (sibling.localName === element.localName) index += 1;
        sibling = sibling.previousElementSibling;
    }
    return index;
}

function selectorMatchesElement(root, selector, element) {
    if (!root?.querySelectorAll || !selector || !element) return false;
    try {
        return Array.from(root.querySelectorAll(selector)).includes(element);
    } catch (_error) {
        return false;
    }
}

function findFontAwesomeElement(targetElement, dynamicTarget) {
    const target = getElementTarget(targetElement);
    if (target && isFontAwesomeElement(target)) return target;
    if (dynamicTarget && isFontAwesomeElement(dynamicTarget)) return dynamicTarget;
    return dynamicTarget?.querySelector?.(FA_ICON_SELECTOR) || null;
}

function isFontAwesomeElement(element) {
    if (!element?.classList) return false;
    return Array.from(element.classList).some(className => FA_CLASS_PATTERN.test(className));
}

function getFontAwesomeClassName(element) {
    if (!element?.classList) return null;
    const classes = Array.from(element.classList)
        .filter(className => FA_CLASS_PATTERN.test(className));
    return classes.length ? [...new Set(classes)].join(' ') : null;
}

function getDynamicIconLabel(element, baseEntry, localize) {
    const rawLabel = [
        getElementAttribute(element, 'aria-label'),
        getElementAttribute(element, 'title'),
        getElementAttribute(element, 'data-tooltip'),
        getElementAttribute(element, 'data-tooltip-content'),
        element?.textContent
    ].map(normalizeLabel).find(Boolean);

    if (rawLabel) {
        const localized = typeof localize === 'function' ? normalizeLabel(localize(rawLabel)) : null;
        if (localized && localized !== rawLabel) return localized;
        return humanizeIdentifier(rawLabel);
    }

    const identifier = [
        getElementAttribute(element, 'data-tool'),
        getElementAttribute(element, 'data-action'),
        getElementAttribute(element, 'data-control'),
        getElementAttribute(element, 'data-module')
    ].map(normalizeLabel).find(Boolean);

    if (identifier) return humanizeIdentifier(identifier);
    return baseEntry?.label || baseEntry?.id || 'Foundry icon';
}

function buildDynamicIconId(area, label, selector) {
    const slug = slugify(`${label || area || 'icon'}`).slice(0, 48) || 'icon';
    return `${DYNAMIC_ICON_ID_PREFIX}.${normalizeIconAreaId(area)}.${slug}-${hashString(selector)}`;
}

function getElementAttribute(element, attribute) {
    if (!element?.getAttribute) return null;
    const value = element.getAttribute(attribute);
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function normalizeLabel(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.replace(/\s+/g, ' ').trim();
    return trimmed || null;
}

function humanizeIdentifier(value) {
    const normalized = normalizeLabel(value);
    if (!normalized) return '';
    if (normalized.includes(' ') && !normalized.includes('.')) return normalized;

    const lastSegment = normalized.split('.').filter(Boolean).pop() || normalized;
    return lastSegment
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

function slugify(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function hashString(value) {
    let hash = 0;
    for (const character of String(value || '')) {
        hash = ((hash << 5) - hash) + character.charCodeAt(0);
        hash |= 0;
    }
    return (hash >>> 0).toString(36);
}

function cssEscape(value) {
    if (globalThis.CSS?.escape) return globalThis.CSS.escape(String(value));
    return String(value).replace(/[^a-zA-Z0-9_-]/g, character => `\\${character}`);
}

function cssAttributeValue(value) {
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function normalizeIconClassList(value) {
    if (typeof value !== 'string') return [];
    return value
        .trim()
        .split(/\s+/)
        .map(className => className.replace(/[^a-z0-9_-]/gi, ''))
        .filter(className => className && FA_CLASS_PATTERN.test(className));
}

function isPlainObject(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function legacyIconEntry(definition) {
    return iconEntry({
        ...definition,
        legacy: true
    });
}

function sidebarTabEntries() {
    const tabs = [
        ['chat', 'Chat', 'fas fa-comments'],
        ['combat', 'Combat', 'fas fa-swords'],
        ['scenes', 'Scenes', 'fas fa-map'],
        ['actors', 'Actors', 'fas fa-user'],
        ['items', 'Items', 'fas fa-suitcase'],
        ['journal', 'Journal', 'fas fa-book-open'],
        ['tables', 'Tables', 'fas fa-th-list'],
        ['cards', 'Cards', 'fas fa-cards-blank'],
        ['playlists', 'Playlists', 'fas fa-music'],
        ['compendium', 'Compendium', 'fas fa-atlas'],
        ['settings', 'Settings', 'fas fa-gears']
    ];

    return tabs.map(([tabId, labelSuffix, iconClass]) => iconEntry({
        id: `sidebar.tab-${tabId}`,
        area: 'sidebar',
        selectors: iconTargetSelectors([
            `#sidebar-tabs [data-tab="${tabId}"]`,
            `#sidebar-tabs [data-tab="${tabId}s"]`,
            `#sidebar-tabs [data-action="tab"][data-tab="${tabId}"]`,
            `#sidebar-tabs [aria-controls="${tabId}"]`,
            `#sidebar-tabs .item[data-tab="${tabId}"]`
        ]),
        labelKey: `YOUR_FLAVOR.IconRegistry.Entries.SidebarTab${labelSuffix}`,
        defaultGroup: 'sidebarTabs',
        iconClass
    }));
}

function iconTargetSelectors(selectors) {
    return normalizeSelectorList(selectors).flatMap(selector => [
        selector,
        `${selector} ${FA_ICON_SELECTOR}`
    ]);
}

function normalizeSelectorList(value) {
    const list = Array.isArray(value) ? value : [value];
    const selectors = list
        .filter(selector => typeof selector === 'string')
        .map(selector => selector.trim())
        .filter(Boolean);

    return [...new Set(selectors)];
}

function getElementTarget(target) {
    if (typeof Element !== 'undefined' && target instanceof Element) return target;
    if (typeof Element !== 'undefined' && target?.parentElement instanceof Element) return target.parentElement;
    if (target && typeof target === 'object' && typeof target.contains === 'function') return target;
    return null;
}

function discoveryStatus(entries = []) {
    if (entries.some(entry => entry.present)) return 'found';
    if (entries.some(entry => entry.invalid)) return 'invalid';
    return 'missing';
}

function withLabel(value, localize) {
    const copy = clone(value);
    if (typeof localize === 'function' && copy.labelKey) {
        copy.label = localize(copy.labelKey);
    }
    return copy;
}

function clone(value) {
    if (Array.isArray(value)) return value.map(item => clone(item));
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
    }
    return value;
}
