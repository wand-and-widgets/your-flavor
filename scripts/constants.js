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
    { id: 'fondamento', name: 'Fondamento', family: 'Fondamento' }
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
