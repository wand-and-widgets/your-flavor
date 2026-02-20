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
