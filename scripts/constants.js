/**
 * Your Flavor - Constants and Configuration
 * @module your-flavor/constants
 */

export const MODULE_ID = 'your-flavor';
export const MODULE_NAME = 'Your Flavor';
export const WORLD_PROFILE_V2_SETTING = 'worldProfileV2';

export const MESSAGE_STYLING_POLICY_IDS = Object.freeze({
    SIMPLE_ONLY: 'simple-only',
    SIMPLE_ROLLS: 'simple-rolls',
    SIMPLE_CARDS: 'simple-cards',
    SUPPORTED_FIXTURES: 'supported-fixtures'
});

export const MESSAGE_STYLING_POLICIES = Object.freeze([
    {
        id: MESSAGE_STYLING_POLICY_IDS.SIMPLE_ONLY,
        labelKey: 'YOUR_FLAVOR.Settings.MessageStylingPolicy.Choices.SimpleOnly'
    },
    {
        id: MESSAGE_STYLING_POLICY_IDS.SIMPLE_ROLLS,
        labelKey: 'YOUR_FLAVOR.Settings.MessageStylingPolicy.Choices.SimpleRolls'
    },
    {
        id: MESSAGE_STYLING_POLICY_IDS.SIMPLE_CARDS,
        labelKey: 'YOUR_FLAVOR.Settings.MessageStylingPolicy.Choices.SimpleCards'
    },
    {
        id: MESSAGE_STYLING_POLICY_IDS.SUPPORTED_FIXTURES,
        labelKey: 'YOUR_FLAVOR.Settings.MessageStylingPolicy.Choices.SupportedFixtures'
    }
]);

/**
 * Available Google Fonts for chat customization
 */
export const GOOGLE_FONTS = [
    { id: 'default', name: 'Default (System)', family: 'inherit' },
    { id: 'cinzel', name: 'Cinzel', family: 'Cinzel' },
    { id: 'cinzel-decorative', name: 'Cinzel Decorative', family: 'Cinzel Decorative' },
    { id: 'great-vibes', name: 'Great Vibes', family: 'Great Vibes' },
    { id: 'tangerine', name: 'Tangerine', family: 'Tangerine' },
    { id: 'uncial-antiqua', name: 'Uncial Antiqua', family: 'Uncial Antiqua' },
    { id: 'pirata-one', name: 'Pirata One', family: 'Pirata One' },
    { id: 'medieval-sharp', name: 'MedievalSharp', family: 'MedievalSharp' },
    { id: 'im-fell-english', name: 'IM Fell English', family: 'IM Fell English' },
    { id: 'almendra', name: 'Almendra', family: 'Almendra' },
    { id: 'fondamento', name: 'Fondamento', family: 'Fondamento' },
    { id: 'courier-prime', name: 'Courier Prime', family: 'Courier Prime' },
    { id: 'bangers', name: 'Bangers', family: 'Bangers' },
    { id: 'nosifer', name: 'Nosifer', family: 'Nosifer' },
    { id: 'press-start-2p', name: 'Press Start 2P', family: 'Press Start 2P' },
    { id: 'black-ops-one', name: 'Black Ops One', family: 'Black Ops One' },
    { id: 'indie-flower', name: 'Indie Flower', family: 'Indie Flower' },
    { id: 'permanent-marker', name: 'Permanent Marker', family: 'Permanent Marker' },
    { id: 'metamorphous', name: 'Metamorphous', family: 'Metamorphous' },
    { id: 'cormorant-garamond', name: 'Cormorant Garamond', family: 'Cormorant Garamond' },
    { id: 'philosopher', name: 'Philosopher', family: 'Philosopher' },
    { id: 'marcellus', name: 'Marcellus', family: 'Marcellus' },
    { id: 'shippori-mincho', name: 'Shippori Mincho', family: 'Shippori Mincho' },
    { id: 'orbitron', name: 'Orbitron', family: 'Orbitron' },
    { id: 'creepster', name: 'Creepster', family: 'Creepster' },
    { id: 'quicksand', name: 'Quicksand', family: 'Quicksand' },
    { id: 'amatic-sc', name: 'Amatic SC', family: 'Amatic SC' },
    { id: 'eater', name: 'Eater', family: 'Eater' },
    { id: 'new-rocker', name: 'New Rocker', family: 'New Rocker' },
    { id: 'audiowide', name: 'Audiowide', family: 'Audiowide' },
    { id: 'lora', name: 'Lora', family: 'Lora' },
    { id: 'griffy', name: 'Griffy', family: 'Griffy' },
    { id: 'alegreya', name: 'Alegreya', family: 'Alegreya' },
    { id: 'alegreya-sans', name: 'Alegreya Sans', family: 'Alegreya Sans' },
    { id: 'alegreya-sans-sc', name: 'Alegreya Sans SC', family: 'Alegreya Sans SC' },
    { id: 'bitter', name: 'Bitter', family: 'Bitter' },
    { id: 'cabin', name: 'Cabin', family: 'Cabin' },
    { id: 'caudex', name: 'Caudex', family: 'Caudex' },
    { id: 'eb-garamond', name: 'EB Garamond', family: 'EB Garamond' },
    { id: 'eczar', name: 'Eczar', family: 'Eczar' },
    { id: 'enriqueta', name: 'Enriqueta', family: 'Enriqueta' },
    { id: 'exo-2', name: 'Exo 2', family: 'Exo 2' },
    { id: 'gelasio', name: 'Gelasio', family: 'Gelasio' },
    { id: 'grenze', name: 'Grenze', family: 'Grenze' },
    { id: 'jost', name: 'Jost', family: 'Jost' },
    { id: 'mulish', name: 'Mulish', family: 'Mulish' },
    { id: 'oswald', name: 'Oswald', family: 'Oswald' },
    { id: 'rajdhani', name: 'Rajdhani', family: 'Rajdhani' },
    { id: 'spectral', name: 'Spectral', family: 'Spectral' },
    { id: 'vollkorn', name: 'Vollkorn', family: 'Vollkorn' },
    { id: 'zen-maru-gothic', name: 'Zen Maru Gothic', family: 'Zen Maru Gothic' }
];

export const PAUSE_EFFECTS = [
    { id: 'none', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseEffects.None' },
    { id: 'spin-slow', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseEffects.SpinSlow' },
    { id: 'spin-fast', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseEffects.SpinFast' },
    { id: 'pulse', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseEffects.Pulse' },
    { id: 'float', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseEffects.Float' },
    { id: 'sway', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseEffects.Sway' }
];

export const PAUSE_VISUAL_MODES = [
    { id: 'cinematic', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseVisualModes.Cinematic' },
    { id: 'arcane-seal', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseVisualModes.ArcaneSeal' },
    { id: 'parchment-sigil', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseVisualModes.ParchmentSigil' },
    { id: 'neon-breach', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseVisualModes.NeonBreach' },
    { id: 'minimal-utility', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseVisualModes.MinimalUtility' },
    { id: 'dark-ritual', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseVisualModes.DarkRitual' },
    { id: 'divine-light', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseVisualModes.DivineLight' },
    { id: 'blood-moon', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseVisualModes.BloodMoon' },
    { id: 'frost-stasis', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseVisualModes.FrostStasis' },
    { id: 'solar-anima', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseVisualModes.SolarAnima' }
];

export const PAUSE_MOTION_MODES = [
    { id: 'full', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseMotionModes.Full' },
    { id: 'gentle', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseMotionModes.Gentle' },
    { id: 'off', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseMotionModes.Off' }
];

export const PAUSE_LABEL_PLACEMENTS = [
    { id: 'below', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseLabelPlacements.Below' },
    { id: 'above', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseLabelPlacements.Above' },
    { id: 'overlay', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseLabelPlacements.Overlay' }
];

export const PAUSE_SYMBOL_FILTERS = [
    { id: 'none', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseSymbolFilters.None' },
    { id: 'radiant', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseSymbolFilters.Radiant' },
    { id: 'arcane', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseSymbolFilters.Arcane' },
    { id: 'ember', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseSymbolFilters.Ember' },
    { id: 'frost', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseSymbolFilters.Frost' },
    { id: 'shadow', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseSymbolFilters.Shadow' },
    { id: 'blood', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseSymbolFilters.Blood' },
    { id: 'neon', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseSymbolFilters.Neon' }
];

export const PAUSE_BLEND_MODES = [
    { id: 'normal', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseBlendModes.Normal' },
    { id: 'screen', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseBlendModes.Screen' },
    { id: 'overlay', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseBlendModes.Overlay' },
    { id: 'plus-lighter', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseBlendModes.PlusLighter' },
    { id: 'luminosity', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseBlendModes.Luminosity' }
];

export const PAUSE_BAR_SHAPES = [
    { id: 'mode', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseBarShapes.Mode' },
    { id: 'square', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseBarShapes.Square' },
    { id: 'soft', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseBarShapes.Soft' },
    { id: 'rounded', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseBarShapes.Rounded' },
    { id: 'pill', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseBarShapes.Pill' }
];

export const PAUSE_LABEL_WEIGHTS = [
    { id: 400, label: '400' },
    { id: 500, label: '500' },
    { id: 600, label: '600' },
    { id: 700, label: '700' },
    { id: 800, label: '800' },
    { id: 900, label: '900' }
];

/**
 * Default configuration for new users
 */
export const DEFAULT_ROLL_CONFIG = {
    enabled: true,
    surfaces: {
        formula: { background: null, textColor: null, borderColor: null },
        terms: { background: null, textColor: null },
        tooltip: { background: null, textColor: null },
        total: { background: null, textColor: null, borderColor: null },
        critical: { textColor: null, accentColor: null },
        failure: { textColor: null, accentColor: null }
    },
    systems: {
        dnd5e: { enabled: true },
        pf2e: { enabled: true },
        generic: { enabled: true }
    }
};

export const DEFAULT_CARD_CONFIG = {
    enabled: true,
    fallbackPolicy: 'safe-outer-only',
    surfaces: {
        itemTitle: { background: null, textColor: null, accentColor: null },
        itemBody: { background: null, textColor: null },
        buttons: { background: null, textColor: null, borderColor: null },
        tables: { oddRow: null, evenRow: null, borderColor: null }
    },
    systems: {
        dnd5e: { itemCards: true, abilityCards: true },
        pf2e: { actionCards: true, spellCards: true },
        generic: { enabled: true }
    }
};

export const DEFAULT_CONFIG = {
    enabled: true,
    layout: 'none',
    presetId: 'none',
    customizations: {
        fontFamily: 'inherit',
        fontSize: 14,
        textColor: '#e8dcc8',
        backgroundColor: 'rgba(20, 16, 12, 0.95)',
        borderColor: '#c9a227',
        borderStyle: 'solid',
        borderWidth: 2,
        borderRadius: 8,
        glowEnabled: false,
        glowColor: '#c9a227',
        glowIntensity: 10,
        shadowEnabled: true,
        padding: 12,
        backgroundOpacity: 95,
        nameColor: null,      // Player name color (fallback: borderColor)
        timestampColor: null  // Timestamp color (fallback: textColor)
    },
    rolls: DEFAULT_ROLL_CONFIG,
    cards: DEFAULT_CARD_CONFIG,
    customHtml: null
};

/**
 * Foundry UI elements supported by the customizer.
 */
export const FOUNDRY_UI_COMPONENTS = [
    {
        id: 'navigation',
        selector: ':is(#navigation, #scene-navigation)',
        resize: 'width',
        minWidth: 280,
        maxWidth: 900
    },
    {
        id: 'controls',
        selector: ':is(#controls, #scene-controls)',
        resize: null
    },
    {
        id: 'players',
        selector: '#players',
        resize: 'width',
        minWidth: 180,
        maxWidth: 420
    },
    {
        id: 'hotbar',
        selector: '#hotbar',
        resize: null,
        minWidth: 320,
        maxWidth: 960
    },
    {
        id: 'sidebar',
        selector: '#sidebar',
        resize: 'both',
        minWidth: 260,
        maxWidth: 700,
        minHeight: 320,
        maxHeight: 1800
    },
    {
        id: 'pause',
        selector: '#pause',
        resize: null
    }
];

/**
 * Default per-component styling
 */
const DEFAULT_COMPONENT_STYLE = {
    opacity: 100,
    backgroundImage: '',
    backgroundOpacity: 100,
    borderColor: '',
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: 0
};

export const DEFAULT_SCENE_NAVIGATION_CUSTOMIZATION = {
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 700,
    uppercase: false,
    letterSpacing: 0,
    rowHeight: 34,
    paddingX: 10,
    paddingY: 0,
    gap: 6,
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: 'solid',
    textColor: '',
    borderColor: '',
    normalBackgroundColor: '',
    activeBackgroundColor: '',
    viewedBackgroundColor: '',
    hiddenBackgroundColor: '',
    hiddenOpacity: 72,
    hoverBackgroundColor: '',
    layoutMode: 'vertical'
};

export const DEFAULT_TOKEN_CONTROLS_CUSTOMIZATION = {
    buttonSize: 32,
    iconSize: 16,
    gap: 8,
    columnGap: 8,
    columnCount: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    shadowIntensity: 0,
    disabledOpacity: 40,
    normalBackgroundColor: '',
    normalBorderColor: '',
    hoverBackgroundColor: '',
    hoverBorderColor: '',
    activeBackgroundColor: '',
    activeBorderColor: ''
};

export const DEFAULT_HOTBAR_CUSTOMIZATION = {
    anchor: 'bottom-center',
    offsetX: 0,
    offsetY: 16,
    slotSize: 60,
    slotGap: 8,
    slotsPerRow: 10,
    controlSize: 24,
    controlGap: 4,
    controlRadius: 6,
    slotOpacity: 100,
    slotRadius: 10,
    slotBorderWidth: 2,
    slotBorderStyle: 'solid',
    slotShadowIntensity: 0,
    keyBadgeSize: 20,
    keyFontSize: 12,
    keyOpacity: 100,
    emptyBackgroundColor: '',
    emptyBorderColor: '',
    fullBackgroundColor: '',
    fullBorderColor: '',
    hoverBackgroundColor: '',
    hoverBorderColor: '',
    dropTargetBackgroundColor: '',
    dropTargetBorderColor: '',
    keyTextColor: '',
    keyEmptyBackgroundColor: '',
    keyFullBackgroundColor: '',
    controlBackgroundColor: '',
    controlBorderColor: '',
    controlHoverBackgroundColor: ''
};

export const DEFAULT_SIDEBAR_CUSTOMIZATION = {
    railWidth: 54,
    railPadding: 12,
    tabSize: 36,
    tabGap: 8,
    tabOffsetX: 0,
    tabOffsetY: 0,
    panelPadding: 8,
    panelGap: 8,
    panelRadius: 6,
    panelBorderWidth: 1,
    panelShadowIntensity: 12,
    searchHeight: 32,
    actionHeight: 32,
    rowHeight: 48,
    folderHeight: 30,
    folderIndent: 10,
    fontSize: 13,
    dividerStrength: 42,
    hoverStrength: 24,
    activeStrength: 70,
    // Surface opacities. These were hard-coded alphas inside the CSS builder, which is
    // why no preset could change a surface — only the accents. The defaults reproduce
    // the previous constants exactly, so existing setups are untouched.
    railOpacity: 58,
    panelOpacity: 94,
    folderOpacity: 96,
    inputOpacity: 78,
    actionOpacity: 42,
    tabRestStrength: 14,
    railBackgroundColor: '',
    tabBackgroundColor: '',
    tabHoverBackgroundColor: '',
    tabActiveBackgroundColor: '',
    panelBackgroundColor: '',
    panelBorderColor: '',
    dividerColor: '',
    folderBackgroundColor: '',
    inputBackgroundColor: '',
    actionButtonBackgroundColor: '',
    actionButtonHoverBackgroundColor: '',
    rowHoverBackgroundColor: '',
    activeColor: '',
    textColor: '',
    secondaryTextColor: ''
};

export const DEFAULT_CHAT_LOG_CUSTOMIZATION = {
    logPadding: 8,
    messageGap: 8,
    contentMaxWidth: 520,
    messagePadding: 10,
    messageRadius: 7,
    messageBorderWidth: 1,
    messageShadowIntensity: 8,
    headerGap: 6,
    dividerStrength: 36,
    hoverStrength: 18,
    contextStrength: 70,
    composerMinHeight: 46,
    composerMaxHeight: 160,
    composerPadding: 9,
    composerRadius: 6,
    composerBorderWidth: 1,
    composerFocusStrength: 74,
    composerBackgroundColor: '',
    composerBorderColor: '',
    composerFocusColor: '',
    composerTextColor: '',
    composerPlaceholderColor: ''
};

export const DEFAULT_PLAYERS_LIST_CUSTOMIZATION = {
    visualMode: 'glass',
    panelPadding: 8,
    panelGap: 6,
    panelRadius: 8,
    panelBorderWidth: 1,
    panelShadowIntensity: 10,
    rowHeight: 24,
    rowPaddingX: 6,
    rowGap: 6,
    rowRadius: 5,
    statusSize: 12,
    statusStyle: 'dot',
    inactiveOpacity: 62,
    hoverStrength: 26,
    selfHighlight: 74,
    gmHighlight: 58,
    panelBackgroundColor: '',
    panelBorderColor: '',
    rowBackgroundColor: '',
    rowBorderColor: '',
    textColor: '',
    inactiveTextColor: '',
    hoverBackgroundColor: '',
    hoverBorderColor: '',
    selfBackgroundColor: '',
    selfBorderColor: '',
    gmBackgroundColor: '',
    gmBorderColor: '',
    controlTextColor: '',
    controlHoverTextColor: '',
    controlHoverBackgroundColor: ''
};

export const DEFAULT_WINDOWS_CUSTOMIZATION = {
    visualMode: 'glass',
    frameRadius: 8,
    frameBorderWidth: 1,
    frameShadowIntensity: 22,
    frameOpacity: 96,
    glassBlur: 6,
    headerHeight: 32,
    headerDividerStrength: 56,
    headerGripStrength: 36,
    contentPadding: 12,
    contentContrast: 42,
    inactiveOpacity: 86,
    scrollbarStrength: 72,
    frameBackgroundColor: '',
    frameBorderColor: '',
    headerBackgroundColor: '',
    headerTextColor: '',
    headerDividerColor: '',
    headerGripColor: '',
    contentBackgroundColor: '',
    contentTextColor: '',
    scrollbarThumbColor: '',
    scrollbarTrackColor: '',
    resizeHandleColor: ''
};

/**
 * Sidebar transformers.
 *
 * Each preset is a distinct structure, not a stop on a density slider: they move
 * geometry AND the surface opacities together. Colour hues are never written here —
 * the surfaces derive from the user's own theme, so a transformer changes depth and
 * weight while the palette stays theirs. Every field remains individually editable
 * afterwards in the Sidebar controls.
 */
export const SIDEBAR_TRANSFORMER_PRESETS = [
    {
        id: 'compact',
        icon: 'fas fa-compress',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.SidebarTransformers.Compact.Label',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.SidebarTransformers.Compact.Description',
        layout: { sidebar: { width: 300, height: null, scale: 100 } },
        sidebar: {
            railWidth: 40,
            railPadding: 6,
            tabSize: 28,
            tabGap: 3,
            tabOffsetX: 0,
            tabOffsetY: 0,
            panelPadding: 4,
            panelGap: 4,
            panelRadius: 3,
            panelBorderWidth: 1,
            panelShadowIntensity: 2,
            searchHeight: 26,
            actionHeight: 26,
            rowHeight: 30,
            folderHeight: 22,
            folderIndent: 5,
            fontSize: 11,
            dividerStrength: 54,
            hoverStrength: 20,
            activeStrength: 60,
            railOpacity: 66,
            panelOpacity: 97,
            folderOpacity: 96,
            inputOpacity: 84,
            actionOpacity: 48,
            tabRestStrength: 18
        }
    },
    {
        id: 'library',
        icon: 'fas fa-book-open',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.SidebarTransformers.Library.Label',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.SidebarTransformers.Library.Description',
        layout: { sidebar: { width: 430, height: null, scale: 100 } },
        sidebar: {
            railWidth: 58,
            railPadding: 14,
            tabSize: 38,
            tabGap: 10,
            tabOffsetX: 0,
            tabOffsetY: 0,
            panelPadding: 12,
            panelGap: 12,
            panelRadius: 8,
            panelBorderWidth: 1,
            panelShadowIntensity: 10,
            searchHeight: 36,
            actionHeight: 34,
            rowHeight: 52,
            folderHeight: 34,
            folderIndent: 16,
            fontSize: 15,
            dividerStrength: 28,
            hoverStrength: 22,
            activeStrength: 66,
            railOpacity: 40,
            panelOpacity: 99,
            folderOpacity: 90,
            inputOpacity: 88,
            actionOpacity: 32,
            tabRestStrength: 9
        }
    },
    {
        id: 'cinematic',
        icon: 'fas fa-film',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.SidebarTransformers.Cinematic.Label',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.SidebarTransformers.Cinematic.Description',
        layout: { sidebar: { width: 380, height: null, scale: 100 } },
        sidebar: {
            railWidth: 62,
            railPadding: 16,
            tabSize: 40,
            tabGap: 12,
            tabOffsetX: 0,
            tabOffsetY: 0,
            panelPadding: 14,
            panelGap: 12,
            panelRadius: 14,
            panelBorderWidth: 0,
            panelShadowIntensity: 34,
            searchHeight: 34,
            actionHeight: 34,
            rowHeight: 48,
            folderHeight: 32,
            folderIndent: 12,
            fontSize: 13,
            dividerStrength: 12,
            hoverStrength: 16,
            activeStrength: 58,
            railOpacity: 20,
            panelOpacity: 70,
            folderOpacity: 56,
            inputOpacity: 50,
            actionOpacity: 18,
            tabRestStrength: 5
        }
    },
    {
        id: 'high-contrast',
        icon: 'fas fa-circle-half-stroke',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.SidebarTransformers.HighContrast.Label',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.SidebarTransformers.HighContrast.Description',
        layout: { sidebar: { width: 360, height: null, scale: 100 } },
        sidebar: {
            railWidth: 56,
            railPadding: 12,
            tabSize: 40,
            tabGap: 8,
            tabOffsetX: 0,
            tabOffsetY: 0,
            panelPadding: 8,
            panelGap: 8,
            panelRadius: 2,
            panelBorderWidth: 3,
            panelShadowIntensity: 6,
            searchHeight: 36,
            actionHeight: 34,
            rowHeight: 46,
            folderHeight: 32,
            folderIndent: 10,
            fontSize: 16,
            dividerStrength: 92,
            hoverStrength: 48,
            activeStrength: 100,
            railOpacity: 100,
            panelOpacity: 100,
            folderOpacity: 100,
            inputOpacity: 100,
            actionOpacity: 74,
            tabRestStrength: 32
        }
    },
    {
        id: 'minimal-rail',
        icon: 'fas fa-grip-lines-vertical',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.SidebarTransformers.MinimalRail.Label',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.SidebarTransformers.MinimalRail.Description',
        layout: { sidebar: { width: 320, height: null, scale: 100 } },
        sidebar: {
            railWidth: 36,
            railPadding: 4,
            tabSize: 28,
            tabGap: 4,
            tabOffsetX: 0,
            tabOffsetY: 0,
            panelPadding: 8,
            panelGap: 8,
            panelRadius: 6,
            panelBorderWidth: 0,
            panelShadowIntensity: 4,
            searchHeight: 30,
            actionHeight: 30,
            rowHeight: 40,
            folderHeight: 26,
            folderIndent: 8,
            fontSize: 12,
            dividerStrength: 34,
            hoverStrength: 18,
            activeStrength: 72,
            railOpacity: 0,
            panelOpacity: 96,
            folderOpacity: 86,
            inputOpacity: 74,
            actionOpacity: 28,
            tabRestStrength: 0
        }
    }
];

export const CHAT_LOG_TRANSFORMER_PRESETS = [
    {
        id: 'compact',
        icon: 'fas fa-compress',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.ChatLogTransformers.Compact.Label',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.ChatLogTransformers.Compact.Description',
        chatLog: {
            logPadding: 4,
            messageGap: 4,
            contentMaxWidth: 460,
            messagePadding: 7,
            messageRadius: 4,
            messageBorderWidth: 1,
            messageShadowIntensity: 2,
            headerGap: 3,
            dividerStrength: 46,
            hoverStrength: 14,
            contextStrength: 64,
            composerMinHeight: 36,
            composerMaxHeight: 96,
            composerPadding: 6,
            composerRadius: 4,
            composerBorderWidth: 1,
            composerFocusStrength: 68
        }
    },
    {
        id: 'readable',
        icon: 'fas fa-book-open',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.ChatLogTransformers.Readable.Label',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.ChatLogTransformers.Readable.Description',
        chatLog: {
            logPadding: 10,
            messageGap: 10,
            contentMaxWidth: 560,
            messagePadding: 12,
            messageRadius: 8,
            messageBorderWidth: 1,
            messageShadowIntensity: 8,
            headerGap: 7,
            dividerStrength: 38,
            hoverStrength: 18,
            contextStrength: 72,
            composerMinHeight: 48,
            composerMaxHeight: 168,
            composerPadding: 10,
            composerRadius: 7,
            composerBorderWidth: 1,
            composerFocusStrength: 74
        }
    },
    {
        id: 'dramatic',
        icon: 'fas fa-masks-theater',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.ChatLogTransformers.Dramatic.Label',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.ChatLogTransformers.Dramatic.Description',
        chatLog: {
            logPadding: 12,
            messageGap: 12,
            contentMaxWidth: 620,
            messagePadding: 14,
            messageRadius: 12,
            messageBorderWidth: 1,
            messageShadowIntensity: 24,
            headerGap: 8,
            dividerStrength: 30,
            hoverStrength: 22,
            contextStrength: 78,
            composerMinHeight: 54,
            composerMaxHeight: 190,
            composerPadding: 12,
            composerRadius: 10,
            composerBorderWidth: 1,
            composerFocusStrength: 78
        }
    },
    {
        id: 'high-contrast',
        icon: 'fas fa-circle-half-stroke',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.ChatLogTransformers.HighContrast.Label',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.ChatLogTransformers.HighContrast.Description',
        chatLog: {
            logPadding: 8,
            messageGap: 9,
            contentMaxWidth: 560,
            messagePadding: 11,
            messageRadius: 6,
            messageBorderWidth: 2,
            messageShadowIntensity: 10,
            headerGap: 7,
            dividerStrength: 82,
            hoverStrength: 44,
            contextStrength: 94,
            composerMinHeight: 48,
            composerMaxHeight: 160,
            composerPadding: 10,
            composerRadius: 6,
            composerBorderWidth: 2,
            composerFocusStrength: 96
        }
    }
];

/**
 * Customization categories that can be independently toggled
 */
export const FOUNDRY_CATEGORIES = [
    { id: 'theme', icon: 'fas fa-palette', labelKey: 'YOUR_FLAVOR.Config.Foundry.Categories.Theme' },
    { id: 'fonts', icon: 'fas fa-font', labelKey: 'YOUR_FLAVOR.Config.Foundry.Categories.Fonts' },
    { id: 'icons', icon: 'fas fa-icons', labelKey: 'YOUR_FLAVOR.Config.Foundry.Categories.Icons' },
    { id: 'visibility', icon: 'fas fa-eye', labelKey: 'YOUR_FLAVOR.Config.Foundry.Categories.Visibility' },
    { id: 'layout', icon: 'fas fa-up-down-left-right', labelKey: 'YOUR_FLAVOR.Config.Foundry.Categories.Layout' },
    { id: 'components', icon: 'fas fa-cubes', labelKey: 'YOUR_FLAVOR.Config.Foundry.Categories.Components' },
    { id: 'pause', icon: 'fas fa-circle-pause', labelKey: 'YOUR_FLAVOR.Config.Foundry.Categories.Pause' },
    { id: 'customCss', icon: 'fas fa-code', labelKey: 'YOUR_FLAVOR.Config.Foundry.Categories.CustomCSS' }
];

/**
 * Pre-built Foundry UI theme presets
 */
export const FOUNDRY_THEME_PRESETS = [
    {
        id: 'dark-fantasy',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.Presets.DarkFantasy',
        icon: 'fas fa-hat-wizard',
        theme: {
            fontColor: '#f0e6d8',
            secondaryFontColor: '#b7a997',
            surfaceBackground: '#18130f',
            windowBackground: '#241e18',
            windowHeaderBackground: '#2e2620',
            accentColor: '#d4872c',
            chatTint: '#3d2b1f',
            iconColor: '#d4872c',
            iconHoverColor: '#f7d7a8',
            scrollbarColor: '#a76b2c'
        }
    },
    {
        id: 'ocean-depths',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.Presets.OceanDepths',
        icon: 'fas fa-water',
        theme: {
            fontColor: '#e0f0f8',
            secondaryFontColor: '#8eb8cc',
            surfaceBackground: '#0a1520',
            windowBackground: '#0f2030',
            windowHeaderBackground: '#152838',
            accentColor: '#2196f3',
            chatTint: '#0d2940',
            iconColor: '#4fc3f7',
            iconHoverColor: '#b3e5fc',
            scrollbarColor: '#1565c0'
        }
    },
    {
        id: 'forest-realm',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.Presets.ForestRealm',
        icon: 'fas fa-tree',
        theme: {
            fontColor: '#e8f0e0',
            secondaryFontColor: '#9ab88a',
            surfaceBackground: '#0f1a0c',
            windowBackground: '#1a2814',
            windowHeaderBackground: '#22331a',
            accentColor: '#4caf50',
            chatTint: '#1b3018',
            iconColor: '#66bb6a',
            iconHoverColor: '#c8e6c9',
            scrollbarColor: '#2e7d32'
        }
    },
    {
        id: 'blood-shadow',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.Presets.BloodShadow',
        icon: 'fas fa-skull',
        theme: {
            fontColor: '#f0ddd8',
            secondaryFontColor: '#b89090',
            surfaceBackground: '#1a0c0c',
            windowBackground: '#2a1414',
            windowHeaderBackground: '#351c1c',
            accentColor: '#c62828',
            chatTint: '#3d1a1a',
            iconColor: '#ef5350',
            iconHoverColor: '#ffcdd2',
            scrollbarColor: '#b71c1c'
        }
    },
    {
        id: 'arcane-academy',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.Presets.ArcaneAcademy',
        icon: 'fas fa-book-sparkles',
        theme: {
            fontColor: '#ece0f8',
            secondaryFontColor: '#a890c0',
            surfaceBackground: '#140f1e',
            windowBackground: '#201828',
            windowHeaderBackground: '#2a2035',
            accentColor: '#9c27b0',
            chatTint: '#2a1838',
            iconColor: '#ce93d8',
            iconHoverColor: '#f3e5f5',
            scrollbarColor: '#7b1fa2'
        }
    },
    {
        id: 'frost-kingdom',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.Presets.FrostKingdom',
        icon: 'fas fa-snowflake',
        theme: {
            fontColor: '#e8f0f8',
            secondaryFontColor: '#90b0cc',
            surfaceBackground: '#0c1218',
            windowBackground: '#141e28',
            windowHeaderBackground: '#1c2835',
            accentColor: '#4dd0e1',
            chatTint: '#152530',
            iconColor: '#80deea',
            iconHoverColor: '#e0f7fa',
            scrollbarColor: '#00838f'
        }
    },
    {
        id: 'desert-sands',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.Presets.DesertSands',
        icon: 'fas fa-sun',
        theme: {
            fontColor: '#f8f0e0',
            secondaryFontColor: '#c8b490',
            surfaceBackground: '#1e180c',
            windowBackground: '#2e2614',
            windowHeaderBackground: '#3a301c',
            accentColor: '#ff8f00',
            chatTint: '#3d3018',
            iconColor: '#ffb74d',
            iconHoverColor: '#fff3e0',
            scrollbarColor: '#e65100'
        }
    },
    {
        id: 'steampunk-brass',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.Presets.SteampunkBrass',
        icon: 'fas fa-gear',
        theme: {
            fontColor: '#f0e8d0',
            secondaryFontColor: '#b8a878',
            surfaceBackground: '#161210',
            windowBackground: '#221e18',
            windowHeaderBackground: '#2e2820',
            accentColor: '#cd8032',
            chatTint: '#302418',
            iconColor: '#d4a056',
            iconHoverColor: '#f0d8a8',
            scrollbarColor: '#8d6e3f'
        }
    },
    {
        id: 'midnight-court',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.Presets.MidnightCourt',
        icon: 'fas fa-moon',
        theme: {
            fontColor: '#e0e4f0',
            secondaryFontColor: '#8890b0',
            surfaceBackground: '#0c0e18',
            windowBackground: '#141828',
            windowHeaderBackground: '#1c2035',
            accentColor: '#5c6bc0',
            chatTint: '#181c30',
            iconColor: '#7986cb',
            iconHoverColor: '#c5cae9',
            scrollbarColor: '#303f9f'
        }
    },
    {
        id: 'eldritch-horror',
        labelKey: 'YOUR_FLAVOR.Config.Foundry.Presets.EldritchHorror',
        icon: 'fas fa-eye',
        theme: {
            fontColor: '#d8f0e8',
            secondaryFontColor: '#80b0a0',
            surfaceBackground: '#0c1614',
            windowBackground: '#142220',
            windowHeaderBackground: '#1c2c28',
            accentColor: '#009688',
            chatTint: '#1a2e28',
            iconColor: '#4db6ac',
            iconHoverColor: '#b2dfdb',
            scrollbarColor: '#00695c'
        }
    }
];

/**
 * Default game-level Foundry customization shared by the GM.
 */
export const DEFAULT_FOUNDRY_CUSTOMIZATION = {
    enabled: false,
    preserveCustomIconColors: true,
    preserveCustomFonts: true,
    themeFontsCustomized: false,
    categories: {
        theme: true,
        fonts: true,
        icons: true,
        visibility: true,
        layout: true,
        components: true,
        pause: true,
        customCss: true
    },
    areaEnabled: {
        navigation: true,
        controls: true,
        players: true,
        hotbar: true,
        sidebar: true,
        chatLog: true,
        windows: true,
        pause: true
    },
    theme: {
        fontColor: '#f0e6d8',
        secondaryFontColor: '#b7a997',
        surfaceBackground: '#18130f',
        windowBackground: '#241e18',
        windowHeaderBackground: '#2e2620',
        accentColor: '#d4872c',
        chatTint: '#3d2b1f',
        iconColor: '#d4872c',
        iconHoverColor: '#f7d7a8',
        scrollbarColor: '#a76b2c',
        interfaceFont: 'inherit',
        windowFont: 'inherit'
    },
    visibility: {
        navigation: true,
        controls: true,
        players: true,
        hotbar: true,
        sidebar: true,
        pause: true
    },
    layout: {
        navigation: {
            x: null,
            y: null,
            width: 460,
            height: null,
            scale: 100
        },
        controls: {
            x: null,
            y: null,
            width: null,
            height: null,
            scale: 100
        },
        players: {
            x: null,
            y: null,
            width: 240,
            height: null,
            scale: 100
        },
        hotbar: {
            x: null,
            y: null,
            width: 580,
            height: null,
            scale: 100
        },
        sidebar: {
            x: null,
            y: null,
            width: 320,
            height: null,
            scale: 100
        }
    },
    componentStyles: {
        navigation: { ...DEFAULT_COMPONENT_STYLE },
        controls: { ...DEFAULT_COMPONENT_STYLE },
        players: { ...DEFAULT_COMPONENT_STYLE },
        hotbar: { ...DEFAULT_COMPONENT_STYLE },
        sidebar: { ...DEFAULT_COMPONENT_STYLE }
    },
    sceneNavigation: { ...DEFAULT_SCENE_NAVIGATION_CUSTOMIZATION },
    tokenControls: { ...DEFAULT_TOKEN_CONTROLS_CUSTOMIZATION },
    hotbar: { ...DEFAULT_HOTBAR_CUSTOMIZATION },
    sidebar: { ...DEFAULT_SIDEBAR_CUSTOMIZATION },
    chatLog: { ...DEFAULT_CHAT_LOG_CUSTOMIZATION },
    playersList: { ...DEFAULT_PLAYERS_LIST_CUSTOMIZATION },
    windows: { ...DEFAULT_WINDOWS_CUSTOMIZATION },
    pause: {
        enabled: false,
        assetPath: '',
        visualMode: 'cinematic',
        effect: 'none',
        motion: 'full',
        animationStrength: 100,
        opacity: 85,
        scale: 100,
        positionX: 50,
        positionY: 50,
        rotation: 0,
        blendMode: 'normal',
        symbolFilter: 'none',
        glowStrength: 55,
        shadowStrength: 45,
        hideLabel: false,
        labelText: '',
        labelFont: 'inherit',
        labelColor: '#ada7b8',
        labelSize: 24,
        labelWeight: 700,
        labelUppercase: true,
        labelLetterSpacing: 7,
        labelOffsetY: 0,
        labelPlacement: 'below',
        labelGlow: 45,
        barColor: '#16131d',
        barOpacity: 60,
        barHeight: 180,
        barWidth: 100,
        barBlur: 2,
        barShape: 'mode',
        barBorderStrength: 0
    },
    customCss: ''
};

/**
 * Layout IDs
 */
export const LAYOUTS = {
    NONE: 'none',
    ELEGANT: 'elegant',
    PARCHMENT: 'parchment',
    ARCANE: 'arcane',
    ROYAL: 'royal',
    SHADOW: 'shadow',
    CUSTOM: 'custom'
};
