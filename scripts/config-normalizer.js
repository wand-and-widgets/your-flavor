/**
 * Your Flavor - v2 configuration normalization utilities.
 * These helpers are intentionally pure so migration code can reuse them for
 * user flags, actor overrides, imports, and world settings.
 */

import {
    DEFAULT_CONFIG,
    DEFAULT_CARD_CONFIG,
    DEFAULT_CHAT_LOG_CUSTOMIZATION,
    DEFAULT_ROLL_CONFIG,
    DEFAULT_FOUNDRY_CUSTOMIZATION,
    DEFAULT_HOTBAR_CUSTOMIZATION,
    DEFAULT_PLAYERS_LIST_CUSTOMIZATION,
    DEFAULT_SIDEBAR_CUSTOMIZATION,
    DEFAULT_TOKEN_CONTROLS_CUSTOMIZATION,
    DEFAULT_WINDOWS_CUSTOMIZATION,
    MESSAGE_STYLING_POLICIES,
    MESSAGE_STYLING_POLICY_IDS
} from './constants.js';
import {
    ICON_GROUP_IDS,
    ICON_REGISTRY_VERSION
} from './icon-registry.js';

export const CONFIG_SCHEMA_VERSION = 2;

const OWNER_SCOPES = new Set(['world', 'user', 'actor']);
const CHAT_MODES = new Set(['gm-global', 'individual']);
const MESSAGE_STYLING_POLICY_VALUES = new Set(MESSAGE_STYLING_POLICIES.map(policy => policy.id));
const BORDER_STYLES = new Set(['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'none']);
const SCENE_NAVIGATION_LAYOUT_MODES = new Set(['vertical', 'horizontal', 'tray']);
const SCENE_NAVIGATION_FONT_WEIGHTS = new Set([400, 500, 600, 700, 800, 900]);
const HOTBAR_ANCHORS = new Set(['bottom-center', 'bottom-left', 'bottom-right']);
const PLAYERS_LIST_VISUAL_MODES = new Set(['compact', 'glass', 'neon', 'banner', 'minimal']);
const PLAYERS_LIST_STATUS_STYLES = new Set(['dot', 'ring', 'pill']);
const WINDOWS_VISUAL_MODES = new Set(['solid', 'glass', 'parchment', 'arcane', 'compact', 'high-contrast', 'neon']);
const PAUSE_VISUAL_MODES = new Set(['cinematic', 'arcane-seal', 'parchment-sigil', 'neon-breach', 'minimal-utility', 'dark-ritual', 'divine-light', 'blood-moon', 'frost-stasis', 'solar-anima']);
const PAUSE_EFFECTS = new Set(['none', 'spin-slow', 'spin-fast', 'pulse', 'float', 'sway']);
const PAUSE_MOTION_MODES = new Set(['full', 'gentle', 'off']);
const PAUSE_LABEL_PLACEMENTS = new Set(['below', 'above', 'overlay']);
const PAUSE_SYMBOL_FILTERS = new Set(['none', 'radiant', 'arcane', 'ember', 'frost', 'shadow', 'blood', 'neon']);
const PAUSE_BLEND_MODES = new Set(['normal', 'screen', 'overlay', 'plus-lighter', 'luminosity']);
const PAUSE_BAR_SHAPES = new Set(['mode', 'square', 'soft', 'rounded', 'pill']);
const PAUSE_LABEL_WEIGHTS = new Set([400, 500, 600, 700, 800, 900]);
const SCENE_NAVIGATION_COLOR_FIELDS = [
    'textColor',
    'borderColor',
    'normalBackgroundColor',
    'activeBackgroundColor',
    'viewedBackgroundColor',
    'hiddenBackgroundColor',
    'hoverBackgroundColor'
];
const TOKEN_CONTROLS_COLOR_FIELDS = [
    'normalBackgroundColor',
    'normalBorderColor',
    'hoverBackgroundColor',
    'hoverBorderColor',
    'activeBackgroundColor',
    'activeBorderColor'
];
const HOTBAR_COLOR_FIELDS = [
    'emptyBackgroundColor',
    'emptyBorderColor',
    'fullBackgroundColor',
    'fullBorderColor',
    'hoverBackgroundColor',
    'hoverBorderColor',
    'dropTargetBackgroundColor',
    'dropTargetBorderColor',
    'keyTextColor',
    'keyEmptyBackgroundColor',
    'keyFullBackgroundColor',
    'controlBackgroundColor',
    'controlBorderColor',
    'controlHoverBackgroundColor'
];
const SIDEBAR_COLOR_FIELDS = [
    'railBackgroundColor',
    'tabBackgroundColor',
    'tabHoverBackgroundColor',
    'tabActiveBackgroundColor',
    'panelBackgroundColor',
    'panelBorderColor',
    'dividerColor',
    'folderBackgroundColor',
    'inputBackgroundColor',
    'actionButtonBackgroundColor',
    'actionButtonHoverBackgroundColor',
    'rowHoverBackgroundColor',
    'activeColor',
    'textColor',
    'secondaryTextColor'
];
const CHAT_LOG_COLOR_FIELDS = [
    'composerBackgroundColor',
    'composerBorderColor',
    'composerFocusColor',
    'composerTextColor',
    'composerPlaceholderColor'
];
const PLAYERS_LIST_COLOR_FIELDS = [
    'panelBackgroundColor',
    'panelBorderColor',
    'rowBackgroundColor',
    'rowBorderColor',
    'textColor',
    'inactiveTextColor',
    'hoverBackgroundColor',
    'hoverBorderColor',
    'selfBackgroundColor',
    'selfBorderColor',
    'gmBackgroundColor',
    'gmBorderColor',
    'controlTextColor',
    'controlHoverTextColor',
    'controlHoverBackgroundColor'
];
const WINDOWS_COLOR_FIELDS = [
    'frameBackgroundColor',
    'frameBorderColor',
    'headerBackgroundColor',
    'headerTextColor',
    'headerDividerColor',
    'headerGripColor',
    'contentBackgroundColor',
    'contentTextColor',
    'scrollbarThumbColor',
    'scrollbarTrackColor',
    'resizeHandleColor'
];
const AVATAR_SHAPES = new Set(['circle', 'square', 'rounded']);
const AVATAR_SOURCES = new Set(['token-actor-user', 'actor-user', 'user']);
const CARD_FALLBACK_POLICIES = new Set(['safe-outer-only']);

const DEFAULT_PRESETS = {
    activePresetId: null,
    favorites: [],
    custom: {},
    lastImportedAt: null,
    lastExportedAt: null
};

const DEFAULT_DIAGNOSTICS = {
    lastFoundryVersion: null,
    lastSystemId: null,
    selectorHealth: {},
    iconDiscovery: {},
    unsupportedMessages: [],
    contrastWarnings: [],
    lastSmokeCheck: {
        v13: null,
        v14: null
    }
};

const ICON_GROUP_MIGRATION_FALLBACKS = {
    sceneNavigation: 'sceneControls',
    playerControls: 'windowControls'
};

export function createDefaultConfigV2({
    profileId = 'default',
    profileName = 'Default',
    owner = {},
    now = null
} = {}) {
    return {
        schemaVersion: CONFIG_SCHEMA_VERSION,
        profileId,
        profileName,
        owner: normalizeOwner(owner),
        meta: {
            createdAt: now,
            updatedAt: now,
            migratedFrom: null
        },
        policy: normalizePolicy(),
        chat: normalizeLegacyChatConfig(DEFAULT_CONFIG),
        rolls: clone(DEFAULT_ROLL_CONFIG),
        cards: clone(DEFAULT_CARD_CONFIG),
        foundry: normalizeLegacyFoundryConfig(DEFAULT_FOUNDRY_CUSTOMIZATION),
        icons: normalizeLegacyIcons(DEFAULT_FOUNDRY_CUSTOMIZATION),
        presets: clone(DEFAULT_PRESETS),
        diagnostics: clone(DEFAULT_DIAGNOSTICS)
    };
}

export function normalizeConfigV2(input = {}, options = {}) {
    const source = isPlainObject(input) ? input : {};
    const defaults = createDefaultConfigV2(options);

    if (source.schemaVersion === CONFIG_SCHEMA_VERSION || hasV2Sections(source)) {
        const profileSource = { ...source };
        if (isLegacyChatShape(profileSource.chat)) {
            profileSource.chat = normalizeLegacyChatConfig(profileSource.chat);
        }
        if (isLegacyFoundryShape(profileSource.foundry)) {
            profileSource.icons = profileSource.icons ?? normalizeLegacyIcons(profileSource.foundry);
            profileSource.foundry = normalizeLegacyFoundryConfig(profileSource.foundry);
        }

        return sanitizeProfile(deepMerge(defaults, {
            ...profileSource,
            schemaVersion: CONFIG_SCHEMA_VERSION,
            owner: normalizeOwner(source.owner ?? options.owner),
            meta: normalizeMeta(source.meta, options)
        }));
    }

    const profile = deepMerge(defaults, {
        meta: normalizeMeta({ migratedFrom: 'legacy' }, options),
        policy: normalizePolicy(options.policy ?? source.policy ?? source.settings ?? source),
        chat: normalizeLegacyChatConfig(source.chatConfig ?? source.chat ?? source),
        foundry: normalizeLegacyFoundryConfig(options.foundryConfig ?? source.foundryConfig ?? source.foundry),
        icons: normalizeLegacyIcons(options.foundryConfig ?? source.foundryConfig ?? source.foundry),
        presets: normalizePresets(
            options.presets ?? source.presets,
            options.favorites ?? source.favorites,
            source.presetId ?? source.layout ?? null
        ),
        diagnostics: normalizeDiagnostics(options.diagnostics ?? source.diagnostics)
    });

    return sanitizeProfile(profile);
}

export function normalizeLegacyChatConfig(config = {}) {
    const source = isPlainObject(config) ? config : {};
    const legacy = isPlainObject(source.customizations) ? source.customizations : {};

    return sanitizeChat({
        enabled: toBoolean(source.enabled, DEFAULT_CONFIG.enabled),
        presetId: source.presetId ?? source.layout ?? DEFAULT_CONFIG.layout,
        scope: source.scope ?? 'user',
        typography: {
            fontFamily: legacy.fontFamily ?? source.typography?.fontFamily ?? DEFAULT_CONFIG.customizations.fontFamily,
            fontSize: legacy.fontSize ?? source.typography?.fontSize ?? DEFAULT_CONFIG.customizations.fontSize,
            lineHeight: source.typography?.lineHeight ?? 1.35
        },
        spacing: {
            padding: legacy.padding ?? source.spacing?.padding ?? DEFAULT_CONFIG.customizations.padding,
            gap: source.spacing?.gap ?? 8,
            borderRadius: legacy.borderRadius ?? source.spacing?.borderRadius ?? DEFAULT_CONFIG.customizations.borderRadius
        },
        surfaces: {
            outer: {
                background: legacy.backgroundColor ?? source.surfaces?.outer?.background ?? DEFAULT_CONFIG.customizations.backgroundColor,
                borderColor: legacy.borderColor ?? source.surfaces?.outer?.borderColor ?? DEFAULT_CONFIG.customizations.borderColor,
                borderWidth: legacy.borderWidth ?? source.surfaces?.outer?.borderWidth ?? DEFAULT_CONFIG.customizations.borderWidth,
                borderStyle: legacy.borderStyle ?? source.surfaces?.outer?.borderStyle ?? DEFAULT_CONFIG.customizations.borderStyle
            },
            header: {
                background: source.surfaces?.header?.background ?? null,
                textColor: legacy.nameColor ?? source.surfaces?.header?.textColor ?? null,
                metadataColor: legacy.timestampColor ?? source.surfaces?.header?.metadataColor ?? null
            },
            content: {
                textColor: legacy.textColor ?? source.surfaces?.content?.textColor ?? DEFAULT_CONFIG.customizations.textColor,
                linkColor: source.surfaces?.content?.linkColor ?? null
            },
            avatar: {
                visible: source.surfaces?.avatar?.visible ?? true,
                shape: source.surfaces?.avatar?.shape ?? 'circle',
                source: source.surfaces?.avatar?.source ?? 'token-actor-user'
            }
        },
        effects: {
            glow: {
                enabled: legacy.glowEnabled ?? source.effects?.glow?.enabled ?? DEFAULT_CONFIG.customizations.glowEnabled,
                color: legacy.glowColor ?? source.effects?.glow?.color ?? DEFAULT_CONFIG.customizations.glowColor,
                intensity: legacy.glowIntensity ?? source.effects?.glow?.intensity ?? DEFAULT_CONFIG.customizations.glowIntensity
            },
            shadow: {
                enabled: legacy.shadowEnabled ?? source.effects?.shadow?.enabled ?? DEFAULT_CONFIG.customizations.shadowEnabled,
                color: source.effects?.shadow?.color ?? null,
                intensity: source.effects?.shadow?.intensity ?? null
            }
        },
        customHtml: source.customHtml ?? null
    });
}

export function normalizeLegacyFoundryConfig(config = {}) {
    const source = isPlainObject(config) ? config : {};
    const fallback = DEFAULT_FOUNDRY_CUSTOMIZATION;
    const theme = deepMerge(fallback.theme, source.theme);
    const areaEnabled = deepMerge(fallback.areaEnabled, source.areaEnabled);
    const visibility = deepMerge(fallback.visibility, source.visibility);
    const layout = deepMerge(fallback.layout, source.layout);
    const componentStyles = deepMerge(fallback.componentStyles, source.componentStyles);
    const pause = deepMerge(fallback.pause, source.pause);
    const chatLog = normalizeChatLogConfig(source.chatLog ?? source.areas?.chatLog?.chatLog);
    const playersList = normalizePlayersListConfig(source.playersList ?? source.areas?.players?.playersList);
    const windows = normalizeWindowsConfig(source.windows ?? source.areas?.windows?.windows);

    return {
        enabled: toBoolean(source.enabled, fallback.enabled),
        areas: {
            navigation: {
                ...areaFromLegacy('navigation', areaEnabled, visibility, layout, componentStyles),
                sceneNavigation: normalizeSceneNavigationConfig(source.sceneNavigation ?? source.areas?.navigation?.sceneNavigation)
            },
            controls: {
                ...areaFromLegacy('controls', areaEnabled, visibility, layout, componentStyles),
                tokenControls: normalizeTokenControlsConfig(source.tokenControls ?? source.areas?.controls?.tokenControls)
            },
            hotbar: {
                ...areaFromLegacy('hotbar', areaEnabled, visibility, layout, componentStyles),
                hotbar: normalizeHotbarConfig(source.hotbar ?? source.areas?.hotbar?.hotbar)
            },
            sidebar: {
                ...areaFromLegacy('sidebar', areaEnabled, visibility, layout, componentStyles),
                sidebar: normalizeSidebarConfig(source.sidebar ?? source.areas?.sidebar?.sidebar)
            },
            players: {
                ...areaFromLegacy('players', areaEnabled, visibility, layout, componentStyles),
                playersList
            },
            chatLog: {
                enabled: toBoolean(areaEnabled.chatLog, true),
                visible: true,
                layout: {},
                style: {},
                chatLog
            },
            windows: {
                enabled: toBoolean(areaEnabled.windows, true),
                visible: true,
                layout: {},
                style: {},
                windows
            },
            pause: {
                enabled: toBoolean(areaEnabled.pause, true) && toBoolean(pause.enabled, false),
                visible: toBoolean(visibility.pause, true),
                visualMode: enumValue(pause.visualMode, PAUSE_VISUAL_MODES, fallback.pause.visualMode),
                media: {
                    assetPath: pause.assetPath ?? '',
                    opacity: clampNumber(pause.opacity, 0, 100, fallback.pause.opacity),
                    scale: clampNumber(pause.scale, 25, 300, fallback.pause.scale),
                    positionX: clampNumber(pause.positionX, 0, 100, fallback.pause.positionX),
                    positionY: clampNumber(pause.positionY, 0, 100, fallback.pause.positionY),
                    rotation: clampNumber(pause.rotation, -180, 180, fallback.pause.rotation),
                    blendMode: enumValue(pause.blendMode, PAUSE_BLEND_MODES, fallback.pause.blendMode),
                    filter: enumValue(pause.symbolFilter, PAUSE_SYMBOL_FILTERS, fallback.pause.symbolFilter),
                    animationStrength: pause.animationStrength === null || pause.animationStrength === undefined
                        ? fallback.pause.animationStrength
                        : clampNumber(pause.animationStrength, 0, 200, fallback.pause.animationStrength),
                    glowStrength: clampNumber(pause.glowStrength, 0, 100, fallback.pause.glowStrength),
                    shadowStrength: clampNumber(pause.shadowStrength, 0, 100, fallback.pause.shadowStrength)
                },
                label: {
                    hidden: toBoolean(pause.hideLabel, false),
                    text: pause.labelText ?? '',
                    font: pause.labelFont ?? fallback.pause.labelFont,
                    color: pause.labelColor ?? fallback.pause.labelColor,
                    size: clampNumber(pause.labelSize, 8, 96, fallback.pause.labelSize),
                    weight: enumValue(Number(pause.labelWeight), PAUSE_LABEL_WEIGHTS, fallback.pause.labelWeight),
                    uppercase: toBoolean(pause.labelUppercase, fallback.pause.labelUppercase),
                    letterSpacing: clampNumber(pause.labelLetterSpacing, 0, 24, fallback.pause.labelLetterSpacing),
                    offsetY: clampNumber(pause.labelOffsetY, -300, 300, fallback.pause.labelOffsetY),
                    placement: enumValue(pause.labelPlacement, PAUSE_LABEL_PLACEMENTS, fallback.pause.labelPlacement),
                    glowStrength: clampNumber(pause.labelGlow, 0, 100, fallback.pause.labelGlow)
                },
                bar: {
                    color: pause.barColor ?? fallback.pause.barColor,
                    opacity: clampNumber(pause.barOpacity, 0, 100, fallback.pause.barOpacity),
                    height: clampNumber(pause.barHeight, 0, 600, fallback.pause.barHeight),
                    width: clampNumber(pause.barWidth, 20, 100, fallback.pause.barWidth),
                    blur: clampNumber(pause.barBlur, 0, 24, fallback.pause.barBlur),
                    shape: enumValue(pause.barShape, PAUSE_BAR_SHAPES, fallback.pause.barShape),
                    borderStrength: clampNumber(pause.barBorderStrength, 0, 100, fallback.pause.barBorderStrength)
                },
                animation: enumValue(pause.effect, PAUSE_EFFECTS, fallback.pause.effect),
                motion: enumValue(pause.motion, PAUSE_MOTION_MODES, fallback.pause.motion)
            },
            scrollbars: { enabled: true, style: { color: theme.scrollbarColor ?? null } },
            contextMenus: { enabled: true, style: {} }
        },
        theme: {
            fontColor: theme.fontColor,
            secondaryFontColor: theme.secondaryFontColor,
            surfaceBackground: theme.surfaceBackground,
            windowBackground: theme.windowBackground,
            windowHeaderBackground: theme.windowHeaderBackground,
            accentColor: theme.accentColor,
            chatTint: theme.chatTint,
            interfaceFont: theme.interfaceFont,
            windowFont: theme.windowFont
        },
        sceneNavigation: normalizeSceneNavigationConfig(source.sceneNavigation ?? source.areas?.navigation?.sceneNavigation),
        tokenControls: normalizeTokenControlsConfig(source.tokenControls ?? source.areas?.controls?.tokenControls),
        hotbar: normalizeHotbarConfig(source.hotbar ?? source.areas?.hotbar?.hotbar),
        sidebar: normalizeSidebarConfig(source.sidebar ?? source.areas?.sidebar?.sidebar),
        chatLog,
        playersList,
        windows,
        customCss: source.customCss ?? fallback.customCss
    };
}

export function normalizeSceneNavigationConfig(config = {}) {
    const fallback = DEFAULT_FOUNDRY_CUSTOMIZATION.sceneNavigation;
    const source = isPlainObject(config) ? config : {};
    const fontWeight = Number(source.fontWeight);
    const normalized = {
        fontFamily: typeof source.fontFamily === 'string' && source.fontFamily.trim()
            ? source.fontFamily.trim()
            : fallback.fontFamily,
        fontSize: clampNumber(source.fontSize, 9, 24, fallback.fontSize),
        fontWeight: SCENE_NAVIGATION_FONT_WEIGHTS.has(fontWeight) ? fontWeight : fallback.fontWeight,
        uppercase: toBoolean(source.uppercase, fallback.uppercase),
        letterSpacing: clampNumber(source.letterSpacing, 0, 8, fallback.letterSpacing),
        rowHeight: clampNumber(source.rowHeight, 20, 64, fallback.rowHeight),
        paddingX: clampNumber(source.paddingX, 0, 32, fallback.paddingX),
        paddingY: clampNumber(source.paddingY, 0, 20, fallback.paddingY),
        gap: clampNumber(source.gap, 0, 24, fallback.gap),
        borderRadius: clampNumber(source.borderRadius, 0, 40, fallback.borderRadius),
        borderWidth: clampNumber(source.borderWidth, 0, 8, fallback.borderWidth),
        borderStyle: enumValue(source.borderStyle, BORDER_STYLES, fallback.borderStyle),
        hiddenOpacity: clampNumber(source.hiddenOpacity, 10, 100, fallback.hiddenOpacity),
        layoutMode: enumValue(source.layoutMode, SCENE_NAVIGATION_LAYOUT_MODES, fallback.layoutMode)
    };

    normalized.textColor = normalizeNullableCssColor(source.textColor ?? source.normalTextColor, fallback.textColor ?? '') || '';
    normalized.borderColor = normalizeNullableCssColor(source.borderColor ?? source.normalBorderColor, fallback.borderColor ?? '') || '';
    for (const field of SCENE_NAVIGATION_COLOR_FIELDS.filter(field => !['textColor', 'borderColor'].includes(field))) {
        normalized[field] = normalizeNullableCssColor(source[field], fallback[field] ?? '') || '';
    }

    return normalized;
}

export function normalizeTokenControlsConfig(config = {}) {
    const fallback = DEFAULT_TOKEN_CONTROLS_CUSTOMIZATION;
    const source = isPlainObject(config) ? config : {};
    const normalized = {
        buttonSize: clampNumber(source.buttonSize, 24, 56, fallback.buttonSize),
        iconSize: clampNumber(source.iconSize, 10, 32, fallback.iconSize),
        gap: clampNumber(source.gap, 0, 24, fallback.gap),
        columnGap: clampNumber(source.columnGap, 0, 32, fallback.columnGap),
        // Foundry v13 Scene Controls is reliable as a two-column rail; imported overrides are ignored.
        columnCount: fallback.columnCount,
        borderRadius: clampNumber(source.borderRadius, 0, 24, fallback.borderRadius),
        borderWidth: clampNumber(source.borderWidth, 0, 6, fallback.borderWidth),
        borderStyle: enumValue(source.borderStyle, BORDER_STYLES, fallback.borderStyle),
        shadowIntensity: clampNumber(source.shadowIntensity, 0, 32, fallback.shadowIntensity),
        disabledOpacity: clampNumber(source.disabledOpacity, 10, 100, fallback.disabledOpacity)
    };

    for (const field of TOKEN_CONTROLS_COLOR_FIELDS) {
        normalized[field] = normalizeNullableCssColor(source[field], fallback[field] ?? '') || '';
    }

    return normalized;
}

export function normalizeHotbarConfig(config = {}) {
    const fallback = DEFAULT_HOTBAR_CUSTOMIZATION;
    const source = isPlainObject(config) ? config : {};
    const anchor = enumValue(source.anchor, HOTBAR_ANCHORS, fallback.anchor);
    const offsetXMin = anchor === 'bottom-center' ? -480 : 0;
    const fallbackOffsetX = clampNumber(fallback.offsetX, offsetXMin, 480, 0);
    const normalized = {
        anchor,
        offsetX: clampNumber(source.offsetX, offsetXMin, 480, fallbackOffsetX),
        offsetY: clampNumber(source.offsetY, 0, 220, fallback.offsetY),
        slotSize: clampNumber(source.slotSize, 40, 72, fallback.slotSize),
        slotGap: clampNumber(source.slotGap, 0, 16, fallback.slotGap),
        slotsPerRow: clampNumber(source.slotsPerRow, 5, 10, fallback.slotsPerRow),
        controlSize: clampNumber(source.controlSize, 18, 34, fallback.controlSize),
        controlGap: clampNumber(source.controlGap, 0, 14, fallback.controlGap),
        controlRadius: clampNumber(source.controlRadius, 0, 18, fallback.controlRadius),
        slotOpacity: clampNumber(source.slotOpacity, 25, 100, fallback.slotOpacity),
        slotRadius: clampNumber(source.slotRadius, 0, 24, fallback.slotRadius),
        slotBorderWidth: clampNumber(source.slotBorderWidth, 0, 6, fallback.slotBorderWidth),
        slotBorderStyle: enumValue(source.slotBorderStyle, BORDER_STYLES, fallback.slotBorderStyle),
        slotShadowIntensity: clampNumber(source.slotShadowIntensity, 0, 36, fallback.slotShadowIntensity),
        keyBadgeSize: clampNumber(source.keyBadgeSize, 14, 30, fallback.keyBadgeSize),
        keyFontSize: clampNumber(source.keyFontSize, 9, 18, fallback.keyFontSize),
        keyOpacity: clampNumber(source.keyOpacity, 20, 100, fallback.keyOpacity)
    };

    for (const field of HOTBAR_COLOR_FIELDS) {
        normalized[field] = normalizeNullableCssColor(source[field], fallback[field] ?? '') || '';
    }

    normalized.slotSize = Math.round(normalized.slotSize);
    normalized.slotGap = Math.round(normalized.slotGap);
    normalized.slotsPerRow = Math.round(normalized.slotsPerRow);
    normalized.controlSize = Math.round(normalized.controlSize);
    normalized.controlGap = Math.round(normalized.controlGap);
    normalized.controlRadius = Math.round(normalized.controlRadius);
    normalized.slotRadius = Math.round(normalized.slotRadius);
    normalized.slotBorderWidth = Math.round(normalized.slotBorderWidth);
    normalized.slotShadowIntensity = Math.round(normalized.slotShadowIntensity);
    normalized.keyBadgeSize = Math.round(normalized.keyBadgeSize);
    normalized.keyFontSize = Math.round(normalized.keyFontSize);

    return normalized;
}

export function normalizeSidebarConfig(config = {}) {
    const fallback = DEFAULT_SIDEBAR_CUSTOMIZATION;
    const source = isPlainObject(config) ? config : {};
    const normalized = {
        railWidth: clampNumber(source.railWidth, 36, 72, fallback.railWidth),
        railPadding: clampNumber(source.railPadding, 4, 20, fallback.railPadding),
        tabSize: clampNumber(source.tabSize, 28, 48, fallback.tabSize),
        tabGap: clampNumber(source.tabGap, 2, 16, fallback.tabGap),
        tabOffsetX: clampNumber(source.tabOffsetX, -24, 24, fallback.tabOffsetX),
        tabOffsetY: clampNumber(source.tabOffsetY, -72, 72, fallback.tabOffsetY),
        panelPadding: clampNumber(source.panelPadding, 0, 18, fallback.panelPadding),
        panelGap: clampNumber(source.panelGap, 0, 18, fallback.panelGap),
        panelRadius: clampNumber(source.panelRadius, 0, 16, fallback.panelRadius),
        panelBorderWidth: clampNumber(source.panelBorderWidth, 0, 3, fallback.panelBorderWidth),
        panelShadowIntensity: clampNumber(source.panelShadowIntensity, 0, 36, fallback.panelShadowIntensity),
        searchHeight: clampNumber(source.searchHeight, 26, 42, fallback.searchHeight),
        actionHeight: clampNumber(source.actionHeight, 24, 42, fallback.actionHeight),
        rowHeight: clampNumber(source.rowHeight, 30, 58, fallback.rowHeight),
        folderHeight: clampNumber(source.folderHeight, 22, 42, fallback.folderHeight),
        folderIndent: clampNumber(source.folderIndent, 4, 22, fallback.folderIndent),
        fontSize: clampNumber(source.fontSize, 11, 16, fallback.fontSize),
        dividerStrength: clampNumber(source.dividerStrength, 0, 100, fallback.dividerStrength),
        hoverStrength: clampNumber(source.hoverStrength, 0, 100, fallback.hoverStrength),
        activeStrength: clampNumber(source.activeStrength, 0, 100, fallback.activeStrength),
        railOpacity: clampNumber(source.railOpacity, 0, 100, fallback.railOpacity),
        panelOpacity: clampNumber(source.panelOpacity, 0, 100, fallback.panelOpacity),
        folderOpacity: clampNumber(source.folderOpacity, 0, 100, fallback.folderOpacity),
        inputOpacity: clampNumber(source.inputOpacity, 0, 100, fallback.inputOpacity),
        actionOpacity: clampNumber(source.actionOpacity, 0, 100, fallback.actionOpacity),
        tabRestStrength: clampNumber(source.tabRestStrength, 0, 100, fallback.tabRestStrength)
    };

    for (const field of Object.keys(normalized)) {
        normalized[field] = Math.round(normalized[field]);
    }
    for (const field of SIDEBAR_COLOR_FIELDS) {
        normalized[field] = normalizeNullableCssColor(source[field], fallback[field] ?? '') || '';
    }

    return normalized;
}

export function normalizeChatLogConfig(config = {}) {
    const fallback = DEFAULT_CHAT_LOG_CUSTOMIZATION;
    const source = isPlainObject(config) ? config : {};
    const normalized = {
        logPadding: clampNumber(source.logPadding, 0, 20, fallback.logPadding),
        messageGap: clampNumber(source.messageGap, 0, 20, fallback.messageGap),
        contentMaxWidth: clampNumber(source.contentMaxWidth, 280, 680, fallback.contentMaxWidth),
        messagePadding: clampNumber(source.messagePadding, 4, 20, fallback.messagePadding),
        messageRadius: clampNumber(source.messageRadius, 0, 18, fallback.messageRadius),
        messageBorderWidth: clampNumber(source.messageBorderWidth, 0, 3, fallback.messageBorderWidth),
        messageShadowIntensity: clampNumber(source.messageShadowIntensity, 0, 36, fallback.messageShadowIntensity),
        headerGap: clampNumber(source.headerGap, 0, 14, fallback.headerGap),
        dividerStrength: clampNumber(source.dividerStrength, 0, 100, fallback.dividerStrength),
        hoverStrength: clampNumber(source.hoverStrength, 0, 100, fallback.hoverStrength),
        contextStrength: clampNumber(source.contextStrength, 0, 100, fallback.contextStrength),
        composerMinHeight: clampNumber(source.composerMinHeight, 32, 120, fallback.composerMinHeight),
        composerMaxHeight: clampNumber(source.composerMaxHeight, 80, 320, fallback.composerMaxHeight),
        composerPadding: clampNumber(source.composerPadding, 4, 18, fallback.composerPadding),
        composerRadius: clampNumber(source.composerRadius, 0, 18, fallback.composerRadius),
        composerBorderWidth: clampNumber(source.composerBorderWidth, 0, 3, fallback.composerBorderWidth),
        composerFocusStrength: clampNumber(source.composerFocusStrength, 0, 100, fallback.composerFocusStrength)
    };

    normalized.composerMaxHeight = Math.max(normalized.composerMaxHeight, normalized.composerMinHeight);

    for (const field of Object.keys(normalized)) {
        normalized[field] = Math.round(normalized[field]);
    }
    for (const field of CHAT_LOG_COLOR_FIELDS) {
        normalized[field] = normalizeNullableCssColor(source[field], fallback[field] ?? '') || '';
    }

    return normalized;
}

export function normalizePlayersListConfig(config = {}) {
    const fallback = DEFAULT_PLAYERS_LIST_CUSTOMIZATION;
    const source = isPlainObject(config) ? config : {};
    const normalized = {
        visualMode: enumValue(source.visualMode, PLAYERS_LIST_VISUAL_MODES, fallback.visualMode),
        panelPadding: clampNumber(source.panelPadding, 0, 18, fallback.panelPadding),
        panelGap: clampNumber(source.panelGap, 0, 18, fallback.panelGap),
        panelRadius: clampNumber(source.panelRadius, 0, 18, fallback.panelRadius),
        panelBorderWidth: clampNumber(source.panelBorderWidth, 0, 4, fallback.panelBorderWidth),
        panelShadowIntensity: clampNumber(source.panelShadowIntensity, 0, 36, fallback.panelShadowIntensity),
        rowHeight: clampNumber(source.rowHeight, 18, 42, fallback.rowHeight),
        rowPaddingX: clampNumber(source.rowPaddingX, 0, 18, fallback.rowPaddingX),
        rowGap: clampNumber(source.rowGap, 0, 14, fallback.rowGap),
        rowRadius: clampNumber(source.rowRadius, 0, 16, fallback.rowRadius),
        statusSize: clampNumber(source.statusSize, 7, 22, fallback.statusSize),
        statusStyle: enumValue(source.statusStyle, PLAYERS_LIST_STATUS_STYLES, fallback.statusStyle),
        inactiveOpacity: clampNumber(source.inactiveOpacity, 20, 100, fallback.inactiveOpacity),
        hoverStrength: clampNumber(source.hoverStrength, 0, 100, fallback.hoverStrength),
        selfHighlight: clampNumber(source.selfHighlight, 0, 100, fallback.selfHighlight),
        gmHighlight: clampNumber(source.gmHighlight, 0, 100, fallback.gmHighlight)
    };

    for (const field of Object.keys(normalized)) {
        if (typeof normalized[field] === 'number') normalized[field] = Math.round(normalized[field]);
    }
    for (const field of PLAYERS_LIST_COLOR_FIELDS) {
        normalized[field] = normalizeNullableCssColor(source[field], fallback[field] ?? '') || '';
    }

    return normalized;
}

export function normalizeWindowsConfig(config = {}) {
    const fallback = DEFAULT_WINDOWS_CUSTOMIZATION;
    const source = isPlainObject(config) ? config : {};
    const normalized = {
        visualMode: enumValue(source.visualMode, WINDOWS_VISUAL_MODES, fallback.visualMode),
        frameRadius: clampNumber(source.frameRadius, 0, 24, fallback.frameRadius),
        frameBorderWidth: clampNumber(source.frameBorderWidth, 0, 4, fallback.frameBorderWidth),
        frameShadowIntensity: clampNumber(source.frameShadowIntensity, 0, 48, fallback.frameShadowIntensity),
        frameOpacity: clampNumber(source.frameOpacity, 70, 100, fallback.frameOpacity),
        glassBlur: clampNumber(source.glassBlur, 0, 18, fallback.glassBlur),
        headerHeight: clampNumber(source.headerHeight, 24, 48, fallback.headerHeight),
        headerDividerStrength: clampNumber(source.headerDividerStrength, 0, 100, fallback.headerDividerStrength),
        headerGripStrength: clampNumber(source.headerGripStrength, 0, 100, fallback.headerGripStrength),
        contentPadding: clampNumber(source.contentPadding, 0, 20, fallback.contentPadding),
        contentContrast: clampNumber(source.contentContrast, 0, 100, fallback.contentContrast),
        inactiveOpacity: clampNumber(source.inactiveOpacity, 45, 100, fallback.inactiveOpacity),
        scrollbarStrength: clampNumber(source.scrollbarStrength, 0, 100, fallback.scrollbarStrength)
    };

    for (const field of Object.keys(normalized)) {
        if (typeof normalized[field] === 'number') normalized[field] = Math.round(normalized[field]);
    }
    for (const field of WINDOWS_COLOR_FIELDS) {
        normalized[field] = normalizeNullableCssColor(source[field], fallback[field] ?? '') || '';
    }

    return normalized;
}

export function normalizeLegacyIcons(config = {}) {
    const theme = isPlainObject(config?.theme) ? config.theme : DEFAULT_FOUNDRY_CUSTOMIZATION.theme;
    const source = isPlainObject(config?.icons) ? config.icons : {};
    const defaultGroups = Object.fromEntries(ICON_GROUP_IDS.map(groupId => [groupId, {
        color: theme.iconColor ?? null,
        hoverColor: theme.iconHoverColor ?? null,
        activeColor: null,
        backgroundColor: null,
        hoverBackgroundColor: null,
        activeBackgroundColor: null
    }]));
    const sourceGroups = isPlainObject(source.groups) ? source.groups : {};
    const groups = deepMerge(defaultGroups, sourceGroups);

    for (const [groupId, fallbackGroupId] of Object.entries(ICON_GROUP_MIGRATION_FALLBACKS)) {
        if (!isPlainObject(sourceGroups[groupId]) && isPlainObject(sourceGroups[fallbackGroupId])) {
            groups[groupId] = clone(sourceGroups[fallbackGroupId]);
        }
    }

    return normalizeIconConfig({
        enabled: source.enabled ?? true,
        groups,
        overrides: source.overrides ?? {},
        selectedIconId: source.selectedIconId ?? null
    });
}

export function normalizeIconConfig(config = {}) {
    const source = isPlainObject(config) ? config : {};
    const fallbackTheme = DEFAULT_FOUNDRY_CUSTOMIZATION.theme;
    const defaultGroup = {
        color: fallbackTheme.iconColor ?? null,
        hoverColor: fallbackTheme.iconHoverColor ?? null,
        activeColor: null,
        backgroundColor: null,
        hoverBackgroundColor: null,
        activeBackgroundColor: null
    };
    const sourceGroups = isPlainObject(source.groups) ? source.groups : {};
    const groups = {};

    for (const groupId of ICON_GROUP_IDS) {
        groups[groupId] = sanitizeIconColorSet(sourceGroups[groupId], defaultGroup);
    }

    return {
        enabled: toBoolean(source.enabled, true),
        groups,
        overrides: normalizeIconOverrides(source.overrides),
        registryVersion: ICON_REGISTRY_VERSION,
        selectedIconId: typeof source.selectedIconId === 'string' && source.selectedIconId.trim()
            ? source.selectedIconId.trim()
            : null
    };
}

function normalizeIconOverrides(overrides = {}) {
    if (!isPlainObject(overrides)) return {};

    return getIconOverrideEntries(overrides).reduce((normalized, [iconId, value]) => {
        if (typeof iconId !== 'string' || !iconId.trim()) return normalized;
        const normalizedId = iconId.trim();
        normalized[normalizedId] = {
            ...sanitizeIconColorSet(value, {
                color: null,
                hoverColor: null,
                activeColor: null,
                backgroundColor: null,
                hoverBackgroundColor: null,
                activeBackgroundColor: null
            }),
            inheritGroup: toBoolean(value?.inheritGroup, true),
            iconClass: normalizeIconClass(value?.iconClass),
            hidden: toBoolean(value?.hidden, false),
            ...normalizeDynamicIconOverride(normalizedId, value)
        };
        return normalized;
    }, {});
}

function getIconOverrideEntries(overrides = {}) {
    const entries = [];

    const visit = (path, value) => {
        if (typeof path !== 'string' || !path.trim() || !isPlainObject(value)) return;
        if (isIconOverrideRecord(value)) {
            entries.push([path.trim(), value]);
            return;
        }

        for (const [key, childValue] of Object.entries(value)) {
            if (typeof key !== 'string' || !key.trim()) continue;
            visit(`${path.trim()}.${key.trim()}`, childValue);
        }
    };

    for (const [iconId, value] of Object.entries(overrides)) {
        if (typeof iconId !== 'string' || !iconId.trim()) continue;
        const normalizedId = iconId.trim();
        if (isPlainObject(value) && !isIconOverrideRecord(value) && !normalizedId.includes('.')) {
            visit(normalizedId, value);
            continue;
        }
        entries.push([normalizedId, value]);
    }

    return entries;
}

function isIconOverrideRecord(value) {
    if (!isPlainObject(value)) return false;
    return [
        'color',
        'hoverColor',
        'activeColor',
        'backgroundColor',
        'hoverBackgroundColor',
        'activeBackgroundColor',
        'inheritGroup',
        'iconClass',
        'hidden',
        'dynamic',
        'selector',
        'selectors',
        'styleSelectors',
        'matchSelectors',
        'area',
        'defaultGroup',
        'label',
        'labelKey',
        'baseIconClass',
        'sourceIconClass',
        'originalIconClass',
        'supportsIconClass'
    ].some(key => key in value);
}

function normalizeDynamicIconOverride(iconId, value = {}) {
    if (!isPlainObject(value)) return {};
    const dynamic = value.dynamic === true || iconId.startsWith('dynamic.');
    if (!dynamic) return {};

    const selectors = normalizeStringList(value.selectors ?? value.selector);
    if (!selectors.length) return {};

    const area = normalizeSafeString(value.area) || 'controls';
    const defaultGroup = ICON_GROUP_IDS.includes(value.defaultGroup) ? value.defaultGroup : 'sceneControls';

    return {
        dynamic: true,
        area,
        defaultGroup,
        label: normalizeSafeString(value.label),
        labelKey: normalizeSafeString(value.labelKey),
        selector: selectors.join(', '),
        selectors,
        styleSelectors: normalizeStringList(value.styleSelectors ?? selectors),
        matchSelectors: normalizeStringList(value.matchSelectors ?? selectors),
        baseIconClass: normalizeIconClass(value.baseIconClass || value.sourceIconClass || value.originalIconClass),
        supportsIconClass: toBoolean(value.supportsIconClass, true)
    };
}

function normalizeStringList(value) {
    const source = Array.isArray(value) ? value : [value];
    return [...new Set(source
        .filter(item => typeof item === 'string')
        .map(item => item.trim())
        .filter(Boolean))];
}

function normalizeSafeString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.replace(/\s+/g, ' ').trim();
    return trimmed || null;
}

function sanitizeIconColorSet(value = {}, fallback = {}) {
    const source = isPlainObject(value) ? value : {};
    return {
        color: normalizeNullableCssColor(source.color, fallback.color ?? null),
        hoverColor: normalizeNullableCssColor(source.hoverColor, fallback.hoverColor ?? null),
        activeColor: normalizeNullableCssColor(source.activeColor, fallback.activeColor ?? null),
        backgroundColor: normalizeNullableCssColor(source.backgroundColor, fallback.backgroundColor ?? null),
        hoverBackgroundColor: normalizeNullableCssColor(source.hoverBackgroundColor, fallback.hoverBackgroundColor ?? null),
        activeBackgroundColor: normalizeNullableCssColor(source.activeBackgroundColor, fallback.activeBackgroundColor ?? null)
    };
}

function normalizeNullableCssColor(value, fallback = null) {
    if (value === null) return null;
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return trimmed || fallback;
}

function normalizeIconClass(value) {
    if (value === null || value === undefined) return null;
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

export function normalizePolicy(settings = {}) {
    const source = isPlainObject(settings) ? settings : {};
    const legacyForcedLayout = source.forcePlayerLayout && source.forcePlayerLayout !== 'none'
        ? source.forcePlayerLayout
        : null;
    const allowPlayerChatCustomization = toBoolean(
        source.allowPlayerChatCustomization ?? source.allowPlayerCustomization,
        true
    );
    const defaultChatMode = allowPlayerChatCustomization ? 'individual' : 'gm-global';

    return {
        moduleEnabled: toBoolean(source.moduleEnabled, true),
        chatMode: enumValue(source.chatMode, CHAT_MODES, defaultChatMode),
        allowPlayerChatCustomization,
        allowCustomHtml: toBoolean(source.allowCustomHtml, false),
        applyToWhispers: toBoolean(source.applyToWhispers, true),
        messageStylingPolicy: enumValue(
            source.messageStylingPolicy,
            MESSAGE_STYLING_POLICY_VALUES,
            MESSAGE_STYLING_POLICY_IDS.SUPPORTED_FIXTURES
        ),
        forcedChatProfileId: source.forcedChatProfileId ?? (legacyForcedLayout ? `preset:${legacyForcedLayout}` : null)
    };
}

export function normalizePresets(presets = {}, favorites = [], activePresetId = null) {
    const source = isPlainObject(presets) ? presets : {};
    const favoriteIds = Array.isArray(source.favorites)
        ? source.favorites
        : Array.isArray(favorites)
            ? favorites
            : [];

    return {
        activePresetId: source.activePresetId ?? activePresetId ?? null,
        favorites: [...new Set(favoriteIds.filter(value => typeof value === 'string'))],
        custom: isPlainObject(source.custom) ? clone(source.custom) : {},
        lastImportedAt: source.lastImportedAt ?? null,
        lastExportedAt: source.lastExportedAt ?? null
    };
}

export function normalizeDiagnostics(diagnostics = {}) {
    return deepMerge(DEFAULT_DIAGNOSTICS, isPlainObject(diagnostics) ? diagnostics : {});
}

function sanitizeProfile(profile) {
    const sanitized = deepMerge(createDefaultConfigV2({
        profileId: profile.profileId,
        profileName: profile.profileName,
        owner: profile.owner
    }), profile);

    sanitized.schemaVersion = CONFIG_SCHEMA_VERSION;
    sanitized.owner = normalizeOwner(sanitized.owner);
    sanitized.policy = normalizePolicy(sanitized.policy);
    sanitized.chat = sanitizeChat(sanitized.chat);
    sanitized.rolls = sanitizeRolls(sanitized.rolls);
    sanitized.cards = sanitizeCards(sanitized.cards);
    sanitized.foundry = deepMerge(normalizeLegacyFoundryConfig(DEFAULT_FOUNDRY_CUSTOMIZATION), sanitized.foundry);
    delete sanitized.foundry.areaEnabled?.directories;
    delete sanitized.foundry.areas?.directories;
    sanitized.foundry.sceneNavigation = normalizeSceneNavigationConfig(
        sanitized.foundry.sceneNavigation ?? sanitized.foundry.areas?.navigation?.sceneNavigation
    );
    sanitized.foundry.tokenControls = normalizeTokenControlsConfig(
        sanitized.foundry.tokenControls ?? sanitized.foundry.areas?.controls?.tokenControls
    );
    sanitized.foundry.hotbar = normalizeHotbarConfig(
        sanitized.foundry.hotbar ?? sanitized.foundry.areas?.hotbar?.hotbar
    );
    sanitized.foundry.sidebar = normalizeSidebarConfig(
        sanitized.foundry.sidebar ?? sanitized.foundry.areas?.sidebar?.sidebar
    );
    sanitized.foundry.chatLog = normalizeChatLogConfig(
        sanitized.foundry.chatLog ?? sanitized.foundry.areas?.chatLog?.chatLog
    );
    sanitized.foundry.playersList = normalizePlayersListConfig(
        sanitized.foundry.playersList ?? sanitized.foundry.areas?.players?.playersList
    );
    sanitized.foundry.windows = normalizeWindowsConfig(
        sanitized.foundry.windows ?? sanitized.foundry.areas?.windows?.windows
    );
    sanitized.foundry.areas ||= {};
    sanitized.foundry.areas.navigation ||= {};
    sanitized.foundry.areas.navigation.sceneNavigation = normalizeSceneNavigationConfig(
        sanitized.foundry.areas.navigation.sceneNavigation ?? sanitized.foundry.sceneNavigation
    );
    sanitized.foundry.areas.controls ||= {};
    sanitized.foundry.areas.controls.tokenControls = normalizeTokenControlsConfig(
        sanitized.foundry.areas.controls.tokenControls ?? sanitized.foundry.tokenControls
    );
    sanitized.foundry.areas.hotbar ||= {};
    sanitized.foundry.areas.hotbar.hotbar = normalizeHotbarConfig(
        sanitized.foundry.areas.hotbar.hotbar ?? sanitized.foundry.hotbar
    );
    sanitized.foundry.areas.sidebar ||= {};
    sanitized.foundry.areas.sidebar.sidebar = normalizeSidebarConfig(
        sanitized.foundry.areas.sidebar.sidebar ?? sanitized.foundry.sidebar
    );
    sanitized.foundry.areas.chatLog ||= {};
    sanitized.foundry.areas.chatLog.chatLog = normalizeChatLogConfig(
        sanitized.foundry.areas.chatLog.chatLog ?? sanitized.foundry.chatLog
    );
    sanitized.foundry.areas.players ||= {};
    sanitized.foundry.areas.players.playersList = normalizePlayersListConfig(
        sanitized.foundry.areas.players.playersList ?? sanitized.foundry.playersList
    );
    sanitized.foundry.areas.windows ||= {};
    sanitized.foundry.areas.windows.windows = normalizeWindowsConfig(
        sanitized.foundry.areas.windows.windows ?? sanitized.foundry.windows
    );
    sanitized.icons = normalizeIconConfig(deepMerge(normalizeLegacyIcons(DEFAULT_FOUNDRY_CUSTOMIZATION), sanitized.icons));
    sanitized.presets = normalizePresets(sanitized.presets, [], sanitized.chat?.presetId ?? null);
    sanitized.diagnostics = normalizeDiagnostics(sanitized.diagnostics);

    return sanitized;
}

function sanitizeChat(chat) {
    const source = isPlainObject(chat) ? chat : {};
    const merged = deepMerge({
        enabled: true,
        presetId: 'none',
        scope: 'user',
        typography: { fontFamily: 'inherit', fontSize: 14, lineHeight: 1.35 },
        spacing: { padding: 12, gap: 8, borderRadius: 8 },
        surfaces: {
            outer: {
                background: 'rgba(20,16,12,0.95)',
                borderColor: '#c9a227',
                borderWidth: 2,
                borderStyle: 'solid'
            },
            header: { background: null, textColor: null, metadataColor: null },
            content: { textColor: '#e8dcc8', linkColor: null },
            avatar: { visible: true, shape: 'circle', source: 'token-actor-user' }
        },
        effects: {
            glow: { enabled: false, color: '#c9a227', intensity: 10 },
            shadow: { enabled: true, color: null, intensity: null }
        },
        customHtml: null
    }, source);

    merged.enabled = toBoolean(merged.enabled, true);
    merged.typography.fontSize = clampNumber(merged.typography.fontSize, 8, 32, 14);
    merged.typography.lineHeight = clampNumber(merged.typography.lineHeight, 1, 2, 1.35);
    merged.spacing.padding = clampNumber(merged.spacing.padding, 0, 30, 12);
    merged.spacing.gap = clampNumber(merged.spacing.gap, 0, 30, 8);
    merged.spacing.borderRadius = clampNumber(merged.spacing.borderRadius, 0, 50, 8);
    merged.surfaces.outer.borderWidth = clampNumber(merged.surfaces.outer.borderWidth, 0, 10, 2);
    merged.surfaces.outer.borderStyle = enumValue(merged.surfaces.outer.borderStyle, BORDER_STYLES, 'solid');
    merged.surfaces.avatar.visible = toBoolean(merged.surfaces.avatar.visible, true);
    merged.surfaces.avatar.shape = enumValue(merged.surfaces.avatar.shape, AVATAR_SHAPES, 'circle');
    merged.surfaces.avatar.source = enumValue(merged.surfaces.avatar.source, AVATAR_SOURCES, 'token-actor-user');
    merged.effects.glow.enabled = toBoolean(merged.effects.glow.enabled, false);
    merged.effects.glow.intensity = clampNumber(merged.effects.glow.intensity, 0, 30, 10);
    merged.effects.shadow.enabled = toBoolean(merged.effects.shadow.enabled, true);

    return merged;
}

function sanitizeRolls(rolls) {
    const merged = deepMerge(DEFAULT_ROLL_CONFIG, rolls);
    merged.enabled = toBoolean(merged.enabled, true);
    merged.systems.dnd5e.enabled = toBoolean(merged.systems.dnd5e.enabled, true);
    merged.systems.pf2e.enabled = toBoolean(merged.systems.pf2e.enabled, true);
    merged.systems.generic.enabled = toBoolean(merged.systems.generic.enabled, true);
    return merged;
}

function sanitizeCards(cards) {
    const merged = deepMerge(DEFAULT_CARD_CONFIG, cards);
    merged.enabled = toBoolean(merged.enabled, true);
    merged.fallbackPolicy = enumValue(merged.fallbackPolicy, CARD_FALLBACK_POLICIES, 'safe-outer-only');
    merged.surfaces = deepMerge(
        DEFAULT_CARD_CONFIG.surfaces,
        isPlainObject(merged.surfaces) ? merged.surfaces : {}
    );
    merged.systems = deepMerge(
        DEFAULT_CARD_CONFIG.systems,
        isPlainObject(merged.systems) ? merged.systems : {}
    );
    for (const [systemId, defaultSystem] of Object.entries(DEFAULT_CARD_CONFIG.systems)) {
        if (!isPlainObject(merged.systems[systemId])) {
            merged.systems[systemId] = clone(defaultSystem);
        }
    }
    merged.systems.dnd5e.itemCards = toBoolean(merged.systems.dnd5e.itemCards, true);
    merged.systems.dnd5e.abilityCards = toBoolean(merged.systems.dnd5e.abilityCards, true);
    merged.systems.pf2e.actionCards = toBoolean(merged.systems.pf2e.actionCards, true);
    merged.systems.pf2e.spellCards = toBoolean(merged.systems.pf2e.spellCards, true);
    merged.systems.generic.enabled = toBoolean(merged.systems.generic.enabled, true);

    for (const [surfaceId, surface] of Object.entries(merged.surfaces ?? {})) {
        if (!isPlainObject(surface)) {
            merged.surfaces[surfaceId] = clone(DEFAULT_CARD_CONFIG.surfaces[surfaceId] ?? {});
            continue;
        }
        for (const [key, value] of Object.entries(surface)) {
            surface[key] = normalizeNullableCssColor(value, null);
        }
    }

    return merged;
}

function areaFromLegacy(areaId, areaEnabled, visibility, layout, componentStyles) {
    return {
        enabled: toBoolean(areaEnabled?.[areaId], true),
        visible: toBoolean(visibility?.[areaId], true),
        layout: clone(layout?.[areaId] ?? {}),
        style: clone(componentStyles?.[areaId] ?? {})
    };
}

function normalizeOwner(owner = {}) {
    const source = isPlainObject(owner) ? owner : {};
    return {
        scope: enumValue(source.scope, OWNER_SCOPES, 'user'),
        userId: source.userId ?? null,
        actorId: source.actorId ?? null
    };
}

function normalizeMeta(meta = {}, options = {}) {
    const source = isPlainObject(meta) ? meta : {};
    const now = options.now ?? null;
    return {
        createdAt: source.createdAt ?? now,
        updatedAt: source.updatedAt ?? now,
        migratedFrom: source.migratedFrom ?? null
    };
}

function hasV2Sections(source) {
    return ['policy', 'chat', 'rolls', 'cards', 'foundry', 'icons', 'presets', 'diagnostics']
        .some(key => isPlainObject(source[key]));
}

function isLegacyChatShape(value) {
    return isPlainObject(value) && (
        'layout' in value ||
        'customizations' in value ||
        'customHtml' in value
    );
}

function isLegacyFoundryShape(value) {
    return isPlainObject(value) && (
        'visibility' in value ||
        'componentStyles' in value ||
        'sceneNavigation' in value ||
        'pause' in value ||
        'customCss' in value
    ) && !isPlainObject(value.areas);
}

function enumValue(value, allowed, fallback) {
    return allowed.has(value) ? value : fallback;
}

function toBoolean(value, fallback) {
    if (typeof value === 'boolean') return value;
    if (value === undefined || value === null) return fallback;
    return Boolean(value);
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
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
