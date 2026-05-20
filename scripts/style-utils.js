/**
 * Your Flavor - Shared Style Utilities
 * Common style application logic used by both chat rendering and config preview
 * @module your-flavor/style-utils
 */

import {
    createStyleTokens,
    flattenStyleTokens,
    getStyleToken,
    STYLE_TOKEN_DOMAINS
} from './style-tokens.js';

const CSS_LENGTH_TOKEN_SUFFIXES = [
    '.fontSize',
    '.padding',
    '.paddingX',
    '.paddingY',
    '.gap',
    '.rowHeight',
    '.borderRadius',
    '.borderWidth',
    '.x',
    '.y',
    '.width',
    '.height',
    '.size',
    '.letterSpacing',
    '.offsetY',
    '.intensity'
];

/**
 * Apply flavor CSS custom properties to an HTML element
 * @param {HTMLElement} element - Target element
 * @param {Object} customizations - The customizations object from config
 * @param {Object} [layoutDefaults] - Optional layout defaults to merge under customizations
 * @param {Object} [profileSections] - Optional v2 sections such as rolls/cards.
 */
export function applyFlavorStyles(element, customizations, layoutDefaults = {}, profileSections = {}) {
    const { declarations } = createFlavorStyleScope(customizations, layoutDefaults, profileSections);
    applyCssDeclarations(element, declarations);
}

/**
 * Build a reusable chat style scope from legacy chat customizations.
 * This is the bridge between existing v1 UI fields and the v2 token model.
 * @param {Object} customizations
 * @param {Object} [layoutDefaults]
 * @param {Object} [profileSections]
 * @returns {{profile: Object, tokens: Object, declarations: Object, cssText: string}}
 */
export function createFlavorStyleScope(customizations = {}, layoutDefaults = {}, profileSections = {}) {
    const styles = { ...layoutDefaults, ...customizations };
    const profile = {
        chat: {
            enabled: true,
            layout: 'custom',
            customizations: styles
        },
        rolls: profileSections.rolls,
        cards: profileSections.cards
    };
    const tokens = createStyleTokens(profile);
    const declarations = createCssDeclarationsFromTokens(tokens, {
        domains: [STYLE_TOKEN_DOMAINS.CHAT]
    });

    addChatCompatibilityDeclarations(declarations, tokens, styles);
    addMessageSurfaceCompatibilityDeclarations(declarations, tokens);

    return {
        profile,
        tokens,
        declarations,
        cssText: formatCssDeclarations(declarations)
    };
}

/**
 * Build scoped CSS from a legacy chat customization object.
 * @param {string} selector
 * @param {Object} customizations
 * @param {Object} [layoutDefaults]
 * @returns {string}
 */
export function buildFlavorScopedCss(selector, customizations = {}, layoutDefaults = {}, profileSections = {}) {
    const { declarations } = createFlavorStyleScope(customizations, layoutDefaults, profileSections);
    return buildScopedCss(selector, declarations);
}

/**
 * Build CSS custom property declarations from a v2 profile or compatible legacy partial.
 * @param {Object} profile
 * @param {Object} [options]
 * @returns {Object<string, string>}
 */
export function createStyleTokenCssDeclarations(profile = {}, options = {}) {
    return createCssDeclarationsFromTokens(createStyleTokens(profile, options.normalizerOptions), options);
}

/**
 * Build CSS custom property declarations from an existing style token tree.
 * @param {Object} tokens
 * @param {Object} [options]
 * @returns {Object<string, string>}
 */
export function createCssDeclarationsFromTokens(tokens, { domains = null } = {}) {
    const allowedDomains = domains ? new Set(domains) : null;
    const declarations = {};

    for (const token of flattenStyleTokens(tokens)) {
        if (allowedDomains && !allowedDomains.has(token.domain)) continue;
        if (!token.cssVar) continue;

        const value = formatTokenCssValue(token);
        if (value == null) continue;
        declarations[token.cssVar] = value;
    }

    return declarations;
}

/**
 * Format declarations as CSS text for inline styles or diagnostics.
 * @param {Object<string, string>} declarations
 * @returns {string}
 */
export function formatCssDeclarations(declarations = {}) {
    return Object.entries(declarations)
        .map(([property, value]) => `${property}: ${value};`)
        .join(' ');
}

/**
 * Wrap declarations in a selector scope.
 * @param {string} selector
 * @param {Object<string, string>} declarations
 * @returns {string}
 */
export function buildScopedCss(selector, declarations = {}) {
    const safeSelector = String(selector || '').trim();
    if (!safeSelector || /[{}]/.test(safeSelector)) return '';

    const cssText = formatCssDeclarations(declarations);
    return cssText ? `${safeSelector} { ${cssText} }` : '';
}

/**
 * Apply CSS custom property declarations to an element.
 * @param {HTMLElement} element
 * @param {Object<string, string>} declarations
 */
export function applyCssDeclarations(element, declarations = {}) {
    if (!element?.style) return;
    for (const [property, value] of Object.entries(declarations)) {
        element.style.setProperty(property, value);
    }
}

/**
 * Apply an opacity value to a color string (hex or rgba)
 * @param {string} color - CSS color string
 * @param {number} opacity - Opacity value 0-1
 * @returns {string} rgba color string
 * @private
 */
function _applyOpacityToColor(color, opacity) {
    const normalizedColor = String(color || '').trim();
    const alpha = Math.max(0, Math.min(1, Number(opacity)));

    if (/^#[0-9a-f]{3}$/i.test(normalizedColor)) {
        const r = parseInt(`${normalizedColor[1]}${normalizedColor[1]}`, 16);
        const g = parseInt(`${normalizedColor[2]}${normalizedColor[2]}`, 16);
        const b = parseInt(`${normalizedColor[3]}${normalizedColor[3]}`, 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    if (/^#[0-9a-f]{6}$/i.test(normalizedColor)) {
        const r = parseInt(normalizedColor.slice(1, 3), 16);
        const g = parseInt(normalizedColor.slice(3, 5), 16);
        const b = parseInt(normalizedColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    if (normalizedColor.startsWith('rgba')) {
        return normalizedColor.replace(/,\s*[\d.]+\)$/, `, ${alpha})`);
    }

    if (normalizedColor.startsWith('rgb(')) {
        const match = normalizedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
        }
    }

    return normalizedColor;
}

function addChatCompatibilityDeclarations(declarations, tokens, styles) {
    const fontFamily = tokenValue(tokens, 'chat.typography.fontFamily', 'inherit');
    const fontSize = numberTokenValue(tokens, 'chat.typography.fontSize', 14);
    const lineHeight = numberTokenValue(tokens, 'chat.typography.lineHeight', 1.35);
    const padding = numberTokenValue(tokens, 'chat.spacing.padding', 12);
    const gap = numberTokenValue(tokens, 'chat.spacing.gap', 8);
    const borderRadius = numberTokenValue(tokens, 'chat.spacing.borderRadius', 8);
    const borderColor = tokenValue(tokens, 'chat.surfaces.outer.borderColor', '#c9a227');
    const borderWidth = numberTokenValue(tokens, 'chat.surfaces.outer.borderWidth', 2);
    const borderStyle = tokenValue(tokens, 'chat.surfaces.outer.borderStyle', 'solid');
    const textColor = tokenValue(tokens, 'chat.surfaces.content.textColor', '#e8dcc8');
    const headerTextColor = tokenValue(tokens, 'chat.surfaces.header.textColor', null);
    const metadataColor = tokenValue(tokens, 'chat.surfaces.header.metadataColor', null);
    const glowEnabled = Boolean(tokenValue(tokens, 'chat.effects.glow.enabled', false));
    const glowColor = tokenValue(tokens, 'chat.effects.glow.color', '#c9a227');
    const glowIntensity = numberTokenValue(tokens, 'chat.effects.glow.intensity', 10);
    const shadowEnabled = Boolean(tokenValue(tokens, 'chat.effects.shadow.enabled', true));
    const shadowColor = tokenValue(tokens, 'chat.effects.shadow.color', null) || 'rgba(0, 0, 0, 0.5)';
    const avatarVisible = tokenValue(tokens, 'chat.surfaces.avatar.visible', true) !== false;
    const avatarShape = tokenValue(tokens, 'chat.surfaces.avatar.shape', 'circle');

    let bgColor = tokenValue(tokens, 'chat.surfaces.outer.background', 'rgba(20, 16, 12, 0.95)');
    if (styles.backgroundOpacity != null) {
        const opacity = Math.max(0, Math.min(100, Number(styles.backgroundOpacity))) / 100;
        bgColor = _applyOpacityToColor(bgColor, opacity);
    }

    const nameColor = headerTextColor || borderColor;
    const timestampColor = metadataColor || textColor;
    const effectColor = glowEnabled && glowColor ? glowColor : borderColor || glowColor || '#c9a227';
    const effectAltColor = nameColor || textColor || effectColor;
    const boxShadow = buildBoxShadow({
        glowEnabled,
        glowColor,
        glowIntensity,
        shadowEnabled,
        shadowColor
    });

    Object.assign(declarations, {
        '--yf-chat-font-family': formatFontStack(fontFamily),
        '--yf-chat-font-size': `${fontSize}px`,
        '--yf-chat-line-height': String(lineHeight),
        '--yf-chat-padding': `${padding}px`,
        '--yf-chat-gap': `${gap}px`,
        '--yf-chat-border-radius': `${borderRadius}px`,
        '--yf-chat-outer-bg': bgColor,
        '--yf-chat-outer-border-color': borderColor,
        '--yf-chat-outer-border-width': `${borderWidth}px`,
        '--yf-chat-outer-border-style': borderStyle,
        '--yf-chat-header-text': nameColor,
        '--yf-chat-header-metadata': timestampColor,
        '--yf-chat-content-text': textColor,
        '--yf-chat-avatar-display': avatarVisible ? 'block' : 'none',
        '--yf-chat-avatar-radius': avatarShape === 'square' ? '0' : avatarShape === 'rounded' ? '8px' : '50%',
        '--yf-chat-box-shadow': boxShadow,

        // Legacy aliases consumed by the current stylesheet.
        '--yf-font-family': formatFontStack(fontFamily),
        '--yf-font-size': `${fontSize}px`,
        '--yf-line-height': String(lineHeight),
        '--yf-text-color': textColor,
        '--yf-bg-color': bgColor,
        '--yf-border-color': borderColor,
        '--yf-border-width': `${borderWidth}px`,
        '--yf-border-style': borderStyle,
        '--yf-border-radius': `${borderRadius}px`,
        '--yf-padding': `${padding}px`,
        '--yf-name-color': nameColor,
        '--yf-timestamp-color': timestampColor,
        '--yf-box-shadow': boxShadow,
        '--yf-effect-color': effectColor,
        '--yf-effect-color-faint': _applyOpacityToColor(effectColor, 0.12),
        '--yf-effect-color-soft': _applyOpacityToColor(effectColor, 0.24),
        '--yf-effect-color-medium': _applyOpacityToColor(effectColor, 0.42),
        '--yf-effect-color-strong': _applyOpacityToColor(effectColor, 0.62),
        '--yf-effect-color-intense': _applyOpacityToColor(effectColor, 0.82),
        '--yf-effect-alt-color': effectAltColor,
        '--yf-effect-alt-soft': _applyOpacityToColor(effectAltColor, 0.22),
        '--yf-effect-alt-medium': _applyOpacityToColor(effectAltColor, 0.42),
        '--yf-effect-shadow': shadowColor,
        '--yf-effect-shadow-soft': _applyOpacityToColor(shadowColor, 0.6)
    });
}

function addMessageSurfaceCompatibilityDeclarations(declarations, tokens) {
    const borderColor = tokenValue(tokens, 'chat.surfaces.outer.borderColor', '#c9a227');
    const contentText = tokenValue(tokens, 'chat.surfaces.content.textColor', '#e8dcc8');
    const headerText = tokenValue(tokens, 'chat.surfaces.header.textColor', null) || borderColor;
    const headerBg = tokenValue(tokens, 'chat.surfaces.header.background', null)
        || _applyOpacityToColor(borderColor, 0.16);
    const bodyBg = tokenValue(tokens, 'chat.surfaces.outer.background', 'rgba(20, 16, 12, 0.95)');
    const buttonBg = _applyOpacityToColor(borderColor, 0.18);
    const tableOddBg = _applyOpacityToColor(borderColor, 0.08);
    const tableEvenBg = _applyOpacityToColor(borderColor, 0.14);

    const roll = {
        formulaBg: tokenValue(tokens, 'rolls.surfaces.formula.background', null) || headerBg,
        formulaText: tokenValue(tokens, 'rolls.surfaces.formula.textColor', null) || headerText,
        formulaBorder: tokenValue(tokens, 'rolls.surfaces.formula.borderColor', null) || borderColor,
        termsBg: tokenValue(tokens, 'rolls.surfaces.terms.background', null) || _applyOpacityToColor(borderColor, 0.12),
        termsText: tokenValue(tokens, 'rolls.surfaces.terms.textColor', null) || contentText,
        tooltipBg: tokenValue(tokens, 'rolls.surfaces.tooltip.background', null) || bodyBg,
        tooltipText: tokenValue(tokens, 'rolls.surfaces.tooltip.textColor', null) || contentText,
        totalBg: tokenValue(tokens, 'rolls.surfaces.total.background', null) || _applyOpacityToColor(borderColor, 0.22),
        totalText: tokenValue(tokens, 'rolls.surfaces.total.textColor', null) || headerText,
        totalBorder: tokenValue(tokens, 'rolls.surfaces.total.borderColor', null) || borderColor,
        criticalText: tokenValue(tokens, 'rolls.surfaces.critical.textColor', null) || '#8ff0a4',
        criticalAccent: tokenValue(tokens, 'rolls.surfaces.critical.accentColor', null) || '#36b85f',
        failureText: tokenValue(tokens, 'rolls.surfaces.failure.textColor', null) || '#ff9d9d',
        failureAccent: tokenValue(tokens, 'rolls.surfaces.failure.accentColor', null) || '#d94b4b'
    };

    const card = {
        titleBg: tokenValue(tokens, 'cards.surfaces.itemTitle.background', null) || headerBg,
        titleText: tokenValue(tokens, 'cards.surfaces.itemTitle.textColor', null) || headerText,
        titleAccent: tokenValue(tokens, 'cards.surfaces.itemTitle.accentColor', null) || borderColor,
        bodyBg: tokenValue(tokens, 'cards.surfaces.itemBody.background', null) || 'transparent',
        bodyText: tokenValue(tokens, 'cards.surfaces.itemBody.textColor', null) || contentText,
        buttonBg: tokenValue(tokens, 'cards.surfaces.buttons.background', null) || buttonBg,
        buttonText: tokenValue(tokens, 'cards.surfaces.buttons.textColor', null) || contentText,
        buttonBorder: tokenValue(tokens, 'cards.surfaces.buttons.borderColor', null) || borderColor,
        tableOdd: tokenValue(tokens, 'cards.surfaces.tables.oddRow', null) || tableOddBg,
        tableEven: tokenValue(tokens, 'cards.surfaces.tables.evenRow', null) || tableEvenBg,
        tableBorder: tokenValue(tokens, 'cards.surfaces.tables.borderColor', null) || borderColor
    };

    Object.assign(declarations, {
        '--yf-roll-formula-bg': roll.formulaBg,
        '--yf-roll-formula-text': roll.formulaText,
        '--yf-roll-formula-border': roll.formulaBorder,
        '--yf-roll-terms-bg': roll.termsBg,
        '--yf-roll-terms-text': roll.termsText,
        '--yf-roll-tooltip-bg': roll.tooltipBg,
        '--yf-roll-tooltip-text': roll.tooltipText,
        '--yf-roll-total-bg': roll.totalBg,
        '--yf-roll-total-text': roll.totalText,
        '--yf-roll-total-border': roll.totalBorder,
        '--yf-roll-critical-text': roll.criticalText,
        '--yf-roll-critical-accent': roll.criticalAccent,
        '--yf-roll-failure-text': roll.failureText,
        '--yf-roll-failure-accent': roll.failureAccent,
        '--yf-card-title-bg': card.titleBg,
        '--yf-card-title-text': card.titleText,
        '--yf-card-title-accent': card.titleAccent,
        '--yf-card-body-bg': card.bodyBg,
        '--yf-card-body-text': card.bodyText,
        '--yf-card-button-bg': card.buttonBg,
        '--yf-card-button-text': card.buttonText,
        '--yf-card-button-border': card.buttonBorder,
        '--yf-card-table-odd': card.tableOdd,
        '--yf-card-table-even': card.tableEven,
        '--yf-card-table-border': card.tableBorder,

        // Token-model aliases for future v2 controls.
        '--yf-rolls-surfaces-formula-background': roll.formulaBg,
        '--yf-rolls-surfaces-formula-textColor': roll.formulaText,
        '--yf-rolls-surfaces-formula-borderColor': roll.formulaBorder,
        '--yf-rolls-surfaces-terms-background': roll.termsBg,
        '--yf-rolls-surfaces-terms-textColor': roll.termsText,
        '--yf-rolls-surfaces-tooltip-background': roll.tooltipBg,
        '--yf-rolls-surfaces-tooltip-textColor': roll.tooltipText,
        '--yf-rolls-surfaces-total-background': roll.totalBg,
        '--yf-rolls-surfaces-total-textColor': roll.totalText,
        '--yf-rolls-surfaces-total-borderColor': roll.totalBorder,
        '--yf-rolls-surfaces-critical-textColor': roll.criticalText,
        '--yf-rolls-surfaces-critical-accentColor': roll.criticalAccent,
        '--yf-rolls-surfaces-failure-textColor': roll.failureText,
        '--yf-rolls-surfaces-failure-accentColor': roll.failureAccent,
        '--yf-cards-surfaces-itemTitle-background': card.titleBg,
        '--yf-cards-surfaces-itemTitle-textColor': card.titleText,
        '--yf-cards-surfaces-itemTitle-accentColor': card.titleAccent,
        '--yf-cards-surfaces-itemBody-background': card.bodyBg,
        '--yf-cards-surfaces-itemBody-textColor': card.bodyText,
        '--yf-cards-surfaces-buttons-background': card.buttonBg,
        '--yf-cards-surfaces-buttons-textColor': card.buttonText,
        '--yf-cards-surfaces-buttons-borderColor': card.buttonBorder,
        '--yf-cards-surfaces-tables-oddRow': card.tableOdd,
        '--yf-cards-surfaces-tables-evenRow': card.tableEven,
        '--yf-cards-surfaces-tables-borderColor': card.tableBorder
    });
}

function buildBoxShadow({ glowEnabled, glowColor, glowIntensity, shadowEnabled, shadowColor }) {
    const shadows = [];
    if (glowEnabled && glowColor) {
        shadows.push(`0 0 ${glowIntensity}px ${glowColor}`);
        shadows.push(`0 0 ${glowIntensity * 2}px ${glowColor}`);
    }
    if (shadowEnabled) {
        shadows.push(`0 4px 15px ${shadowColor}`);
    }
    return shadows.length > 0 ? shadows.join(', ') : 'none';
}

function formatTokenCssValue(token) {
    const value = token?.value;
    if (value === null || value === undefined || value === '') return null;

    switch (token.type) {
        case 'font':
            return formatFontStack(value);
        case 'number':
            return formatNumberCssValue(token, value);
        case 'boolean':
            return value ? '1' : '0';
        case 'asset':
            return `url("${escapeCssString(value)}")`;
        case 'text':
            return `"${escapeCssString(value)}"`;
        case 'css':
            return null;
        default:
            return String(value);
    }
}

function formatNumberCssValue(token, value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return null;
    return tokenUsesLength(token) ? `${number}px` : String(number);
}

function tokenUsesLength(token) {
    return CSS_LENGTH_TOKEN_SUFFIXES.some(suffix => token.id.endsWith(suffix));
}

function formatFontStack(fontFamily) {
    return fontFamily && fontFamily !== 'inherit'
        ? `"${escapeCssString(fontFamily)}", serif`
        : 'inherit';
}

function tokenValue(tokens, path, fallback = null) {
    const token = getStyleToken(tokens, path);
    return token?.value ?? fallback;
}

function numberTokenValue(tokens, path, fallback) {
    const value = Number(tokenValue(tokens, path, fallback));
    return Number.isFinite(value) ? value : fallback;
}

function escapeCssString(value) {
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
