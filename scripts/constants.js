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
 * Default game-level Foundry customization shared by the GM.
 */
export const DEFAULT_FOUNDRY_CUSTOMIZATION = {
    enabled: false,
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
    }
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
