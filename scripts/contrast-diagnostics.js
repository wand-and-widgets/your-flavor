/**
 * Your Flavor - Contrast diagnostics.
 * Pure helpers for warning when editable text/icon colors are likely hard to read.
 */

import {
    DEFAULT_CONFIG,
    DEFAULT_FOUNDRY_CUSTOMIZATION
} from './constants.js';

const NORMAL_TEXT_MIN_RATIO = 4.5;
const UI_GRAPHICS_MIN_RATIO = 3;
const DEFAULT_COMPOSITE_BACKGROUND = '#111111';

/**
 * Build contrast warnings for the legacy chat config currently used by the UI.
 * @param {Object} config
 * @returns {Array<Object>}
 */
export function buildChatContrastWarnings(config = {}) {
    if (!config?.enabled || config.layout === 'none') return [];

    const customizations = {
        ...DEFAULT_CONFIG.customizations,
        ...(config.customizations || {})
    };
    const background = applyOpacityToColor(
        customizations.backgroundColor,
        customizations.backgroundOpacity
    );
    const textColor = customizations.textColor;
    const nameColor = customizations.nameColor || customizations.borderColor || textColor;
    const timestampColor = customizations.timestampColor || textColor;

    return buildWarnings([
        pair('ChatContentText', 'chat', textColor, background, NORMAL_TEXT_MIN_RATIO),
        pair('ChatSpeakerName', 'chat', nameColor, background, NORMAL_TEXT_MIN_RATIO),
        pair('ChatTimestamp', 'chat', timestampColor, background, NORMAL_TEXT_MIN_RATIO)
    ]);
}

/**
 * Build contrast warnings for the legacy Foundry customization config.
 * @param {Object} config
 * @returns {Array<Object>}
 */
export function buildFoundryContrastWarnings(config = {}) {
    if (!config?.enabled) return [];

    const theme = {
        ...DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
        ...(config.theme || {})
    };
    const pause = {
        ...DEFAULT_FOUNDRY_CUSTOMIZATION.pause,
        ...(config.pause || {})
    };

    const warnings = buildWarnings([
        pair('FoundrySurfaceText', 'foundry', theme.fontColor, theme.surfaceBackground, NORMAL_TEXT_MIN_RATIO),
        pair('FoundryWindowText', 'foundry', theme.fontColor, theme.windowBackground, NORMAL_TEXT_MIN_RATIO),
        pair('FoundryWindowHeaderText', 'foundry', theme.fontColor, theme.windowHeaderBackground, NORMAL_TEXT_MIN_RATIO),
        pair('FoundrySecondarySurfaceText', 'foundry', theme.secondaryFontColor, theme.surfaceBackground, NORMAL_TEXT_MIN_RATIO),
        pair('FoundrySecondaryWindowText', 'foundry', theme.secondaryFontColor, theme.windowBackground, NORMAL_TEXT_MIN_RATIO),
        pair('FoundryChatLogText', 'foundry', theme.fontColor, theme.chatTint, NORMAL_TEXT_MIN_RATIO),
        pair('FoundryIconSurface', 'foundry', theme.iconColor, theme.surfaceBackground, UI_GRAPHICS_MIN_RATIO),
        pair('FoundryIconHoverSurface', 'foundry', theme.iconHoverColor, theme.surfaceBackground, UI_GRAPHICS_MIN_RATIO)
    ]);

    if (!pause.hideLabel) {
        warnings.push(...buildWarnings([
            pair(
                'FoundryPauseLabel',
                'foundry',
                pause.labelColor,
                applyOpacityToColor(pause.barColor, pause.barOpacity),
                NORMAL_TEXT_MIN_RATIO
            )
        ]));
    }

    return warnings;
}

/**
 * Calculate a WCAG contrast ratio between two CSS colors.
 * Supports hex, rgb(), and rgba().
 * @param {string} foreground
 * @param {string} background
 * @param {string} [baseBackground]
 * @returns {number|null}
 */
export function calculateContrastRatio(
    foreground,
    background,
    baseBackground = DEFAULT_COMPOSITE_BACKGROUND
) {
    const fg = parseCssColor(foreground);
    const bg = parseCssColor(background);
    const base = parseCssColor(baseBackground);
    if (!fg || !bg || !base) return null;

    const opaqueBackground = compositeOver(bg, base);
    const opaqueForeground = compositeOver(fg, opaqueBackground);
    const lighter = Math.max(relativeLuminance(opaqueForeground), relativeLuminance(opaqueBackground));
    const darker = Math.min(relativeLuminance(opaqueForeground), relativeLuminance(opaqueBackground));
    return (lighter + 0.05) / (darker + 0.05);
}

function buildWarnings(pairs) {
    const warnings = [];

    for (const item of pairs) {
        const ratio = calculateContrastRatio(item.foreground, item.background);
        if (ratio == null || ratio >= item.minimum) continue;

        warnings.push({
            id: item.id,
            domain: item.domain,
            foreground: item.foreground,
            background: item.background,
            ratio: Number(ratio.toFixed(2)),
            minimum: item.minimum,
            severity: ratio < 3 ? 'danger' : 'warning'
        });
    }

    return warnings;
}

function pair(id, domain, foreground, background, minimum) {
    return { id, domain, foreground, background, minimum };
}

function applyOpacityToColor(color, opacityPercent) {
    const colorValue = String(color || '').trim();
    if (opacityPercent === undefined || opacityPercent === null) return colorValue;

    const alpha = clamp(Number(opacityPercent) / 100, 0, 1);
    const parsed = parseCssColor(colorValue);
    if (!parsed) return colorValue;
    return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${alpha})`;
}

function parseCssColor(value) {
    const color = String(value || '').trim().toLowerCase();
    if (!color || color === 'transparent' || color.startsWith('var(')) return null;

    const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
        const raw = hex[1];
        const expanded = raw.length === 3
            ? raw.split('').map(char => `${char}${char}`).join('')
            : raw;
        return {
            r: parseInt(expanded.slice(0, 2), 16),
            g: parseInt(expanded.slice(2, 4), 16),
            b: parseInt(expanded.slice(4, 6), 16),
            a: 1
        };
    }

    const rgb = color.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
    if (rgb) {
        return {
            r: clamp(Number(rgb[1]), 0, 255),
            g: clamp(Number(rgb[2]), 0, 255),
            b: clamp(Number(rgb[3]), 0, 255),
            a: clamp(rgb[4] === undefined ? 1 : Number(rgb[4]), 0, 1)
        };
    }

    return null;
}

function compositeOver(top, bottom) {
    const alpha = top.a + bottom.a * (1 - top.a);
    if (alpha <= 0) return { r: 0, g: 0, b: 0, a: 1 };

    return {
        r: Math.round(((top.r * top.a) + (bottom.r * bottom.a * (1 - top.a))) / alpha),
        g: Math.round(((top.g * top.a) + (bottom.g * bottom.a * (1 - top.a))) / alpha),
        b: Math.round(((top.b * top.a) + (bottom.b * bottom.a * (1 - top.a))) / alpha),
        a: 1
    };
}

function relativeLuminance(color) {
    const [r, g, b] = [color.r, color.g, color.b].map(channel => {
        const value = channel / 255;
        return value <= 0.03928
            ? value / 12.92
            : Math.pow((value + 0.055) / 1.055, 2.4);
    });

    return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
}

function clamp(value, min, max) {
    if (!Number.isFinite(value)) return min;
    return Math.max(min, Math.min(max, value));
}
