/**
 * Your Flavor - Constants and Configuration
 * @module your-flavor/constants
 */

export const MODULE_ID = 'your-flavor';
export const MODULE_NAME = 'Your Flavor';

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
    { id: 'griffy', name: 'Griffy', family: 'Griffy' }
];

export const PAUSE_EFFECTS = [
    { id: 'none', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseEffects.None' },
    { id: 'spin-slow', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseEffects.SpinSlow' },
    { id: 'spin-fast', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseEffects.SpinFast' },
    { id: 'pulse', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseEffects.Pulse' },
    { id: 'float', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseEffects.Float' },
    { id: 'sway', labelKey: 'YOUR_FLAVOR.Config.Foundry.PauseEffects.Sway' }
];

/**
 * Default configuration for new users
 */
export const DEFAULT_CONFIG = {
    enabled: true,
    layout: 'none',
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
        resize: 'width',
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

/**
 * Customization categories that can be independently toggled
 */
export const FOUNDRY_CATEGORIES = [
    { id: 'theme', icon: 'fas fa-palette', labelKey: 'YOUR_FLAVOR.Config.Foundry.Categories.Theme' },
    { id: 'fonts', icon: 'fas fa-font', labelKey: 'YOUR_FLAVOR.Config.Foundry.Categories.Fonts' },
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
    categories: {
        theme: true,
        fonts: true,
        visibility: true,
        layout: true,
        components: true,
        pause: true,
        customCss: true
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
    pause: {
        enabled: false,
        assetPath: '',
        effect: 'none',
        opacity: 85,
        scale: 100,
        hideLabel: false,
        labelText: '',
        labelFont: 'inherit',
        labelColor: '#ada7b8',
        labelSize: 24,
        labelLetterSpacing: 7,
        labelOffsetY: 0,
        barColor: '#16131d',
        barOpacity: 60,
        barHeight: 180
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
