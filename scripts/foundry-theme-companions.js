/**
 * Foundry-wide companion palettes for the Chat theme collection.
 *
 * The Chat themes are deliberately not copied verbatim: a message card palette
 * does not provide enough roles for an application shell. Each companion
 * expands the source theme's color identity into readable surfaces, borders,
 * text, accents, and interaction states, and pairs it with interface fonts
 * curated for shell legibility (the ornamental chat font never dresses the UI).
 *
 * Applying a companion changes colors and, unless the user deliberately picked
 * fonts in Customize Your Theme with preservation on, the two shell fonts.
 *
 * @module your-flavor/foundry-theme-companions
 */

import { LAYOUTS } from './layouts.js';

export const FOUNDRY_THEME_COLOR_FIELDS = Object.freeze([
    'fontColor',
    'secondaryFontColor',
    'surfaceBackground',
    'windowBackground',
    'windowHeaderBackground',
    'accentColor',
    'chatTint',
    'iconColor',
    'iconHoverColor',
    'scrollbarColor'
]);

export const FOUNDRY_THEME_FONT_FIELDS = Object.freeze([
    'interfaceFont',
    'windowFont'
]);

const FOUNDRY_ICON_COLOR_OVERRIDE_FIELDS = Object.freeze([
    'color',
    'hoverColor',
    'activeColor',
    'backgroundColor',
    'hoverBackgroundColor',
    'activeBackgroundColor'
]);

const COMPANION_PALETTES = Object.freeze({
    necromancer: {
        fontColor: '#d8e8d2',
        secondaryFontColor: '#8fa58a',
        surfaceBackground: '#0b100c',
        windowBackground: '#121a13',
        windowHeaderBackground: '#1a261b',
        accentColor: '#4f8a45',
        chatTint: '#132014',
        iconColor: '#75b868',
        iconHoverColor: '#b7e6a8',
        scrollbarColor: '#3a6a36'
    },
    vampire: {
        fontColor: '#f2e7e7',
        secondaryFontColor: '#b89a9f',
        surfaceBackground: '#16090c',
        windowBackground: '#211014',
        windowHeaderBackground: '#2f151b',
        accentColor: '#9d1f2e',
        chatTint: '#2b0d14',
        iconColor: '#c44655',
        iconHoverColor: '#f1a6ae',
        scrollbarColor: '#741620'
    },
    beholder: {
        fontColor: '#f3dff6',
        secondaryFontColor: '#b99cbf',
        surfaceBackground: '#180b1d',
        windowBackground: '#24102c',
        windowHeaderBackground: '#32153d',
        accentColor: '#b447c1',
        chatTint: '#351441',
        iconColor: '#d56de0',
        iconHoverColor: '#f4c2f7',
        scrollbarColor: '#81338b'
    },
    zombie: {
        fontColor: '#d9e4d1',
        secondaryFontColor: '#a2ac8c',
        surfaceBackground: '#171a13',
        windowBackground: '#22261c',
        windowHeaderBackground: '#2d3323',
        accentColor: '#7b8942',
        chatTint: '#2c3222',
        iconColor: '#9baf5c',
        iconHoverColor: '#d4e1a8',
        scrollbarColor: '#5a6532'
    },
    fire: {
        fontColor: '#ffe2b8',
        secondaryFontColor: '#c89978',
        surfaceBackground: '#1d0e09',
        windowBackground: '#2b130c',
        windowHeaderBackground: '#3a1b10',
        accentColor: '#e65e1a',
        chatTint: '#3a160d',
        iconColor: '#f28a31',
        iconHoverColor: '#ffd39b',
        scrollbarColor: '#a63f15'
    },
    cold: {
        fontColor: '#e7f6fa',
        secondaryFontColor: '#98bac6',
        surfaceBackground: '#0a151e',
        windowBackground: '#102432',
        windowHeaderBackground: '#163344',
        accentColor: '#2d9db2',
        chatTint: '#123044',
        iconColor: '#5cc7d8',
        iconHoverColor: '#c6f1f6',
        scrollbarColor: '#237789'
    },
    acid: {
        fontColor: '#ecf6cf',
        secondaryFontColor: '#b1be86',
        surfaceBackground: '#11170a',
        windowBackground: '#1a2410',
        windowHeaderBackground: '#263316',
        accentColor: '#89b529',
        chatTint: '#21300e',
        iconColor: '#a9d83d',
        iconHoverColor: '#e4f59b',
        scrollbarColor: '#66891e'
    },
    desert: {
        fontColor: '#f3e4c9',
        secondaryFontColor: '#c5a982',
        surfaceBackground: '#21180f',
        windowBackground: '#312316',
        windowHeaderBackground: '#44301c',
        accentColor: '#c39132',
        chatTint: '#3b2a18',
        iconColor: '#d8af58',
        iconHoverColor: '#f4dfb0',
        scrollbarColor: '#8d6728'
    },
    glacial: {
        fontColor: '#183c52',
        secondaryFontColor: '#52798d',
        surfaceBackground: '#eaf6fb',
        windowBackground: '#d9eef7',
        windowHeaderBackground: '#bfddea',
        accentColor: '#4e9ebd',
        chatTint: '#e1f3fa',
        iconColor: '#2d7898',
        iconHoverColor: '#174e68',
        scrollbarColor: '#6eafc8'
    },
    evil: {
        fontColor: '#f2dcdc',
        secondaryFontColor: '#b58f8f',
        surfaceBackground: '#140909',
        windowBackground: '#200d0d',
        windowHeaderBackground: '#2e1212',
        accentColor: '#a92727',
        chatTint: '#2b0b0b',
        iconColor: '#d34a4a',
        iconHoverColor: '#f3a0a0',
        scrollbarColor: '#741d1d'
    },
    good: {
        fontColor: '#403a2c',
        secondaryFontColor: '#74694e',
        surfaceBackground: '#fffdf1',
        windowBackground: '#f6f0d8',
        windowHeaderBackground: '#e9dfbb',
        accentColor: '#aa7d18',
        chatTint: '#fbf6df',
        iconColor: '#8b6914',
        iconHoverColor: '#5e4610',
        scrollbarColor: '#c59b34'
    },
    steampunk: {
        fontColor: '#eadbc2',
        secondaryFontColor: '#b9a07f',
        surfaceBackground: '#18130f',
        windowBackground: '#261d16',
        windowHeaderBackground: '#35271b',
        accentColor: '#b87333',
        chatTint: '#302217',
        iconColor: '#cd914f',
        iconHoverColor: '#f1ca8b',
        scrollbarColor: '#805025'
    },
    eldritch: {
        fontColor: '#d3e4d8',
        secondaryFontColor: '#89aaa0',
        surfaceBackground: '#081014',
        windowBackground: '#101b20',
        windowHeaderBackground: '#17272b',
        accentColor: '#267c78',
        chatTint: '#102428',
        iconColor: '#36aaa2',
        iconHoverColor: '#a8ded5',
        scrollbarColor: '#235d5b'
    },
    feywild: {
        fontColor: '#f2e8f5',
        secondaryFontColor: '#c6a3cc',
        surfaceBackground: '#1b1026',
        windowBackground: '#2a173b',
        windowHeaderBackground: '#3c2051',
        accentColor: '#bd6dc2',
        chatTint: '#351b48',
        iconColor: '#df8cce',
        iconHoverColor: '#ffd0ed',
        scrollbarColor: '#8a4b91'
    },
    celestial: {
        fontColor: '#fff7dc',
        secondaryFontColor: '#c8b98f',
        surfaceBackground: '#0b1224',
        windowBackground: '#111d35',
        windowHeaderBackground: '#1a2a48',
        accentColor: '#d9ae32',
        chatTint: '#162442',
        iconColor: '#f0cf5a',
        iconHoverColor: '#fff1aa',
        scrollbarColor: '#9f7b20'
    },
    pirate: {
        fontColor: '#ead3af',
        secondaryFontColor: '#ad8d68',
        surfaceBackground: '#17110d',
        windowBackground: '#251a13',
        windowHeaderBackground: '#352319',
        accentColor: '#a35323',
        chatTint: '#302017',
        iconColor: '#cd7137',
        iconHoverColor: '#efbd82',
        scrollbarColor: '#743d1e'
    },
    noir: {
        fontColor: '#ececec',
        secondaryFontColor: '#a3a3a3',
        surfaceBackground: '#0e0e0e',
        windowBackground: '#191919',
        windowHeaderBackground: '#242424',
        accentColor: '#737373',
        chatTint: '#1d1d1d',
        iconColor: '#bcbcbc',
        iconHoverColor: '#ffffff',
        scrollbarColor: '#4b4b4b'
    },
    alchemist: {
        fontColor: '#e6e1c8',
        secondaryFontColor: '#aeb18b',
        surfaceBackground: '#151912',
        windowBackground: '#20271b',
        windowHeaderBackground: '#2d3624',
        accentColor: '#7b9c52',
        chatTint: '#28321e',
        iconColor: '#9fc56c',
        iconHoverColor: '#dff2af',
        scrollbarColor: '#586f3c'
    },
    infernal: {
        fontColor: '#f6d8cc',
        secondaryFontColor: '#bb8d7f',
        surfaceBackground: '#150807',
        windowBackground: '#240d0a',
        windowHeaderBackground: '#35130d',
        accentColor: '#c44625',
        chatTint: '#32100b',
        iconColor: '#ef6737',
        iconHoverColor: '#ffb18d',
        scrollbarColor: '#8b2617'
    },
    merchant: {
        fontColor: '#352f24',
        secondaryFontColor: '#746a56',
        surfaceBackground: '#fbf7ed',
        windowBackground: '#eee6d4',
        windowHeaderBackground: '#dfd2b5',
        accentColor: '#a87814',
        chatTint: '#f3ecdc',
        iconColor: '#846113',
        iconHoverColor: '#5d430d',
        scrollbarColor: '#bb902d'
    },
    tribal: {
        fontColor: '#f2dec0',
        secondaryFontColor: '#b99b75',
        surfaceBackground: '#1e1510',
        windowBackground: '#2c2018',
        windowHeaderBackground: '#3d2b1e',
        accentColor: '#bd6f35',
        chatTint: '#372419',
        iconColor: '#d98b48',
        iconHoverColor: '#f5c48f',
        scrollbarColor: '#87502c'
    },
    cosmic: {
        fontColor: '#eee7fa',
        secondaryFontColor: '#afa0ca',
        surfaceBackground: '#0b0713',
        windowBackground: '#151022',
        windowHeaderBackground: '#211830',
        accentColor: '#8255c2',
        chatTint: '#1c1230',
        iconColor: '#ae82e4',
        iconHoverColor: '#ead6ff',
        scrollbarColor: '#5e3d91'
    },
    spectral: {
        fontColor: '#e4fff9',
        secondaryFontColor: '#99c9c1',
        surfaceBackground: '#071615',
        windowBackground: '#0c2320',
        windowHeaderBackground: '#12332d',
        accentColor: '#52bda6',
        chatTint: '#0f2d28',
        iconColor: '#78d6c0',
        iconHoverColor: '#c8fff2',
        scrollbarColor: '#358774'
    },
    magma: {
        fontColor: '#ffd29b',
        secondaryFontColor: '#c2896d',
        surfaceBackground: '#160706',
        windowBackground: '#280d08',
        windowHeaderBackground: '#3b140b',
        accentColor: '#dd4217',
        chatTint: '#351109',
        iconColor: '#f47722',
        iconHoverColor: '#ffbf75',
        scrollbarColor: '#9d2b12'
    },
    abyssal: {
        fontColor: '#d4f2f0',
        secondaryFontColor: '#7daead',
        surfaceBackground: '#020a0e',
        windowBackground: '#07161c',
        windowHeaderBackground: '#0a2529',
        accentColor: '#168f91',
        chatTint: '#082126',
        iconColor: '#3bc0ba',
        iconHoverColor: '#a5eee7',
        scrollbarColor: '#11686a'
    },
    jungle: {
        fontColor: '#e5f4de',
        secondaryFontColor: '#9fb88f',
        surfaceBackground: '#0b160b',
        windowBackground: '#132414',
        windowHeaderBackground: '#1b351c',
        accentColor: '#3b963e',
        chatTint: '#183019',
        iconColor: '#66bd60',
        iconHoverColor: '#c2eab7',
        scrollbarColor: '#2a6a2d'
    },
    pharaoh: {
        fontColor: '#fff0a5',
        secondaryFontColor: '#c4b377',
        surfaceBackground: '#070c2e',
        windowBackground: '#0d1747',
        windowHeaderBackground: '#14245f',
        accentColor: '#d3a918',
        chatTint: '#101c52',
        iconColor: '#f0ca31',
        iconHoverColor: '#fff0a4',
        scrollbarColor: '#967510'
    },
    gothic: {
        fontColor: '#e1e2e4',
        secondaryFontColor: '#9ca3aa',
        surfaceBackground: '#101112',
        windowBackground: '#1b1d20',
        windowHeaderBackground: '#272a2e',
        accentColor: '#71808e',
        chatTint: '#22252a',
        iconColor: '#9aa8b5',
        iconHoverColor: '#e3e8ec',
        scrollbarColor: '#52606b'
    },
    harrowed: {
        fontColor: '#e6c7c7',
        secondaryFontColor: '#a47b7b',
        surfaceBackground: '#090303',
        windowBackground: '#130606',
        windowHeaderBackground: '#210909',
        accentColor: '#771818',
        chatTint: '#1d0707',
        iconColor: '#ad2a2a',
        iconHoverColor: '#e98585',
        scrollbarColor: '#4e1111'
    },
    solar: {
        fontColor: '#fff1cf',
        secondaryFontColor: '#c8a878',
        surfaceBackground: '#211305',
        windowBackground: '#322008',
        windowHeaderBackground: '#47300c',
        accentColor: '#d99310',
        chatTint: '#3f2909',
        iconColor: '#f2b82d',
        iconHoverColor: '#ffe5a1',
        scrollbarColor: '#9d6810'
    },
    lunar: {
        fontColor: '#edf1f7',
        secondaryFontColor: '#a6afc2',
        surfaceBackground: '#090e1f',
        windowBackground: '#11182c',
        windowHeaderBackground: '#1b2540',
        accentColor: '#8798bd',
        chatTint: '#151e37',
        iconColor: '#b6c2db',
        iconHoverColor: '#f2f5fa',
        scrollbarColor: '#617092'
    },
    sidereal: {
        fontColor: '#eadff6',
        secondaryFontColor: '#aa96c3',
        surfaceBackground: '#0d0818',
        windowBackground: '#171026',
        windowHeaderBackground: '#241737',
        accentColor: '#865bb4',
        chatTint: '#201330',
        iconColor: '#ad82d2',
        iconHoverColor: '#ead1ff',
        scrollbarColor: '#604180'
    },
    dragonblooded: {
        fontColor: '#dcecdf',
        secondaryFontColor: '#91ad98',
        surfaceBackground: '#0d1711',
        windowBackground: '#16251b',
        windowHeaderBackground: '#203529',
        accentColor: '#397e55',
        chatTint: '#1b3023',
        iconColor: '#58aa73',
        iconHoverColor: '#b9e3c5',
        scrollbarColor: '#2b6041'
    },
    sakura: {
        fontColor: '#4d3542',
        secondaryFontColor: '#816470',
        surfaceBackground: '#fff7fa',
        windowBackground: '#f7e8ee',
        windowHeaderBackground: '#eccfd9',
        accentColor: '#c66f8b',
        chatTint: '#fbeff3',
        iconColor: '#a74f6e',
        iconHoverColor: '#6d3148',
        scrollbarColor: '#d491a7'
    },
    thunderstorm: {
        fontColor: '#e1edff',
        secondaryFontColor: '#94aad0',
        surfaceBackground: '#080e19',
        windowBackground: '#101a2a',
        windowHeaderBackground: '#172640',
        accentColor: '#3d76d4',
        chatTint: '#13223a',
        iconColor: '#65a1f2',
        iconHoverColor: '#c4ddff',
        scrollbarColor: '#2b559d'
    },
    bloodmoon: {
        fontColor: '#edcccc',
        secondaryFontColor: '#ad8080',
        surfaceBackground: '#0d0505',
        windowBackground: '#190909',
        windowHeaderBackground: '#280d0d',
        accentColor: '#982323',
        chatTint: '#230b0b',
        iconColor: '#c74040',
        iconHoverColor: '#f0a2a2',
        scrollbarColor: '#681919'
    },
    crystalline: {
        fontColor: '#303c50',
        secondaryFontColor: '#687d96',
        surfaceBackground: '#f3f9fd',
        windowBackground: '#e2f0f8',
        windowHeaderBackground: '#c9e2f0',
        accentColor: '#568fb2',
        chatTint: '#eaf5fb',
        iconColor: '#3f789b',
        iconHoverColor: '#24536f',
        scrollbarColor: '#82b3cf'
    },
    sandstorm: {
        fontColor: '#f5e7cc',
        secondaryFontColor: '#bdab86',
        surfaceBackground: '#231a10',
        windowBackground: '#332617',
        windowHeaderBackground: '#46351f',
        accentColor: '#b88d4b',
        chatTint: '#3d2d1a',
        iconColor: '#d0aa68',
        iconHoverColor: '#f3d9aa',
        scrollbarColor: '#836438'
    },
    plague: {
        fontColor: '#e2e8bd',
        secondaryFontColor: '#a7ad72',
        surfaceBackground: '#0e1107',
        windowBackground: '#191e0c',
        windowHeaderBackground: '#252b12',
        accentColor: '#71882c',
        chatTint: '#20260e',
        iconColor: '#9caf3e',
        iconHoverColor: '#dbe88c',
        scrollbarColor: '#53651f'
    },
    runic: {
        fontColor: '#e1e6ef',
        secondaryFontColor: '#9ca8bd',
        surfaceBackground: '#11151c',
        windowBackground: '#1c222d',
        windowHeaderBackground: '#283243',
        accentColor: '#5475a8',
        chatTint: '#222b3a',
        iconColor: '#7597c9',
        iconHoverColor: '#cad8eb',
        scrollbarColor: '#3d587f'
    },
    tavern: {
        fontColor: '#f2e2c4',
        secondaryFontColor: '#b9a17b',
        surfaceBackground: '#1c110a',
        windowBackground: '#2a1a0f',
        windowHeaderBackground: '#3b2513',
        accentColor: '#b47628',
        chatTint: '#352113',
        iconColor: '#d49a43',
        iconHoverColor: '#f2cd8d',
        scrollbarColor: '#80541f'
    },
    enchanted: {
        fontColor: '#f2e8fb',
        secondaryFontColor: '#b5a0c9',
        surfaceBackground: '#10091b',
        windowBackground: '#1c102b',
        windowHeaderBackground: '#2b1740',
        accentColor: '#a455d0',
        chatTint: '#251338',
        iconColor: '#ca77e8',
        iconHoverColor: '#f1c5ff',
        scrollbarColor: '#773c9b'
    },
    witchcraft: {
        fontColor: '#e5daef',
        secondaryFontColor: '#a895b7',
        surfaceBackground: '#0d0911',
        windowBackground: '#17101d',
        windowHeaderBackground: '#24172c',
        accentColor: '#7547a1',
        chatTint: '#201329',
        iconColor: '#9868c3',
        iconHoverColor: '#dec0f3',
        scrollbarColor: '#543272'
    }
});

/**
 * Shell font pairing per companion (font curation board v1, approved
 * 2026-07-24). interfaceFont dresses chrome and window headers; windowFont
 * dresses window content and chat. Every family exists in GOOGLE_FONTS and
 * stays legible at 12-14px; sibling themes share archetypes on purpose.
 */
const COMPANION_FONTS = Object.freeze({
    necromancer: { interfaceFont: 'Almendra', windowFont: 'Alegreya' },
    vampire: { interfaceFont: 'Marcellus', windowFont: 'EB Garamond' },
    beholder: { interfaceFont: 'Metamorphous', windowFont: 'Almendra' },
    zombie: { interfaceFont: 'Courier Prime', windowFont: 'Bitter' },
    fire: { interfaceFont: 'Marcellus', windowFont: 'Lora' },
    cold: { interfaceFont: 'Jost', windowFont: 'Mulish' },
    acid: { interfaceFont: 'Rajdhani', windowFont: 'Mulish' },
    desert: { interfaceFont: 'Cabin', windowFont: 'Gelasio' },
    glacial: { interfaceFont: 'Jost', windowFont: 'Mulish' },
    evil: { interfaceFont: 'Grenze', windowFont: 'Alegreya' },
    good: { interfaceFont: 'Marcellus', windowFont: 'Alegreya' },
    steampunk: { interfaceFont: 'Enriqueta', windowFont: 'Vollkorn' },
    eldritch: { interfaceFont: 'Almendra', windowFont: 'Alegreya' },
    feywild: { interfaceFont: 'Philosopher', windowFont: 'Alegreya' },
    celestial: { interfaceFont: 'Marcellus', windowFont: 'EB Garamond' },
    pirate: { interfaceFont: 'Alegreya Sans SC', windowFont: 'Alegreya' },
    noir: { interfaceFont: 'Oswald', windowFont: 'Courier Prime' },
    alchemist: { interfaceFont: 'Eczar', windowFont: 'Alegreya' },
    infernal: { interfaceFont: 'Marcellus', windowFont: 'Alegreya' },
    merchant: { interfaceFont: 'Marcellus', windowFont: 'EB Garamond' },
    tribal: { interfaceFont: 'Caudex', windowFont: 'Alegreya' },
    cosmic: { interfaceFont: 'Marcellus', windowFont: 'Spectral' },
    spectral: { interfaceFont: 'Marcellus', windowFont: 'Spectral' },
    magma: { interfaceFont: 'Marcellus', windowFont: 'Lora' },
    abyssal: { interfaceFont: 'Marcellus', windowFont: 'Spectral' },
    jungle: { interfaceFont: 'Alegreya Sans', windowFont: 'Alegreya' },
    pharaoh: { interfaceFont: 'Philosopher', windowFont: 'Eczar' },
    gothic: { interfaceFont: 'Metamorphous', windowFont: 'EB Garamond' },
    harrowed: { interfaceFont: 'Grenze', windowFont: 'Bitter' },
    solar: { interfaceFont: 'Alegreya Sans', windowFont: 'Vollkorn' },
    lunar: { interfaceFont: 'Quicksand', windowFont: 'EB Garamond' },
    sidereal: { interfaceFont: 'Philosopher', windowFont: 'Spectral' },
    dragonblooded: { interfaceFont: 'Grenze', windowFont: 'Vollkorn' },
    sakura: { interfaceFont: 'Zen Maru Gothic', windowFont: 'Shippori Mincho' },
    thunderstorm: { interfaceFont: 'Exo 2', windowFont: 'Mulish' },
    bloodmoon: { interfaceFont: 'Almendra', windowFont: 'Lora' },
    crystalline: { interfaceFont: 'Quicksand', windowFont: 'Mulish' },
    sandstorm: { interfaceFont: 'Cabin', windowFont: 'Gelasio' },
    plague: { interfaceFont: 'Eczar', windowFont: 'Alegreya' },
    runic: { interfaceFont: 'Metamorphous', windowFont: 'Vollkorn' },
    tavern: { interfaceFont: 'Alegreya Sans', windowFont: 'Lora' },
    enchanted: { interfaceFont: 'Philosopher', windowFont: 'Lora' },
    witchcraft: { interfaceFont: 'Fondamento', windowFont: 'Alegreya' }
});

function freezeTheme(theme, fonts) {
    return Object.freeze({
        ...Object.fromEntries(FOUNDRY_THEME_COLOR_FIELDS.map(field => [field, theme[field]])),
        ...Object.fromEntries(FOUNDRY_THEME_FONT_FIELDS.map(field => [field, fonts[field]]))
    });
}

function buildCardStyle(theme, fontFamily) {
    const safeFont = String(fontFamily || 'serif').replace(/["'\\;]/g, '');
    return [
        `--yf-theme-surface:${theme.surfaceBackground}`,
        `--yf-theme-panel:${theme.windowBackground}`,
        `--yf-theme-header:${theme.windowHeaderBackground}`,
        `--yf-theme-text:${theme.fontColor}`,
        `--yf-theme-secondary:${theme.secondaryFontColor}`,
        `--yf-theme-accent:${theme.accentColor}`,
        `--yf-theme-state:${theme.iconHoverColor}`,
        `--yf-theme-border:${theme.scrollbarColor}`,
        `--yf-theme-font:"${safeFont}",serif`
    ].join(';');
}

const FOUNDRY_THEME_COMPANIONS = Object.freeze(
    Object.values(LAYOUTS)
        .filter(layout => layout.category === 'theme')
        .map(layout => {
            const theme = freezeTheme(COMPANION_PALETTES[layout.id], COMPANION_FONTS[layout.id]);
            return Object.freeze({
                id: layout.id,
                labelKey: layout.name,
                descriptionKey: layout.description,
                fontFamily: layout.defaults.fontFamily,
                theme,
                cardStyle: buildCardStyle(theme, layout.defaults.fontFamily),
                palette: Object.freeze([
                    theme.surfaceBackground,
                    theme.windowBackground,
                    theme.fontColor,
                    theme.accentColor,
                    theme.iconHoverColor
                ])
            });
        })
);

export function getFoundryThemeCompanionPresets() {
    return FOUNDRY_THEME_COMPANIONS;
}

export function getFoundryThemeCompanionPreset(id) {
    return FOUNDRY_THEME_COMPANIONS.find(preset => preset.id === id) ?? null;
}

export function foundryThemeMatchesCompanion(foundryTheme, companionTheme) {
    if (!foundryTheme || !companionTheme) return false;
    // Colors define companion identity; fonts stay out of the match so a
    // preserved custom font pick does not unselect the applied theme card.
    return FOUNDRY_THEME_COLOR_FIELDS.every(field => (
        String(foundryTheme[field] || '').toLowerCase() === String(companionTheme[field] || '').toLowerCase()
    ));
}

/**
 * Apply a Foundry companion palette while keeping icon-color and font intent
 * explicit.
 *
 * Non-customized icon groups inherit the new theme dynamically. Deliberate
 * group and individual color overrides remain intact when preservation is on.
 * Turning preservation off clears icon color overrides, but keeps unrelated
 * icon choices such as replacement glyphs, visibility, and dynamic selectors.
 *
 * Fonts follow the same intent model: the companion pairing applies unless the
 * user picked fonts by hand (`themeFontsCustomized`) and font preservation is
 * on. Fonts written by a companion never count as a deliberate custom pick.
 */
export function applyFoundryThemeCompanion(
    config,
    companionTheme,
    { preserveCustomIconColors = true, preserveCustomFonts = true } = {}
) {
    if (!config || typeof config !== 'object' || !companionTheme) return config;

    config.theme ||= {};
    for (const field of FOUNDRY_THEME_COLOR_FIELDS) {
        if (companionTheme[field]) config.theme[field] = companionTheme[field];
    }
    config.preserveCustomIconColors = preserveCustomIconColors !== false;
    config.preserveCustomFonts = preserveCustomFonts !== false;

    const fieldOverrides = (
        config.fieldOverrides
        && typeof config.fieldOverrides === 'object'
        && !Array.isArray(config.fieldOverrides)
    ) ? config.fieldOverrides : null;
    if (fieldOverrides) {
        for (const field of FOUNDRY_THEME_COLOR_FIELDS) {
            fieldOverrides[`theme.${field}`] = true;
        }
    }

    const keepCustomFonts = config.preserveCustomFonts && config.themeFontsCustomized === true;
    if (!keepCustomFonts) {
        for (const field of FOUNDRY_THEME_FONT_FIELDS) {
            if (!companionTheme[field]) continue;
            config.theme[field] = companionTheme[field];
            if (fieldOverrides) fieldOverrides[`theme.${field}`] = true;
        }
        config.themeFontsCustomized = false;
    }

    const groups = config.icons?.groups;
    if (groups && typeof groups === 'object') {
        for (const [groupId, group] of Object.entries(groups)) {
            if (!group || typeof group !== 'object') continue;

            for (const field of FOUNDRY_ICON_COLOR_OVERRIDE_FIELDS) {
                const path = `icons.groups.${groupId}.${field}`;
                const isDeliberatelyCustomized = fieldOverrides?.[path] === true;
                if (preserveCustomIconColors && isDeliberatelyCustomized) continue;

                group[field] = null;
                if (fieldOverrides) delete fieldOverrides[path];
            }
        }
    }

    const overrides = config.icons?.overrides;
    if (overrides && typeof overrides === 'object') {
        if (!preserveCustomIconColors) {
            for (const override of Object.values(overrides)) {
                if (!override || typeof override !== 'object') continue;
                for (const field of FOUNDRY_ICON_COLOR_OVERRIDE_FIELDS) override[field] = null;
                override.inheritGroup = !override.iconClass;
            }
        }

        const hasActiveIndividualCustomization = Object.values(overrides).some(override => (
            override
            && typeof override === 'object'
            && (
                override.dynamic === true
                || override.hidden === true
                || Boolean(override.iconClass)
                || (
                    preserveCustomIconColors
                    && (
                        override.inheritGroup === false
                        || FOUNDRY_ICON_COLOR_OVERRIDE_FIELDS.some(field => Boolean(override[field]))
                    )
                )
            )
        ));
        if (fieldOverrides) {
            if (hasActiveIndividualCustomization) fieldOverrides['icons.overrides'] = true;
            else delete fieldOverrides['icons.overrides'];
        }
    }

    return config;
}
