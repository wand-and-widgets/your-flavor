/**
 * Your Flavor - Chat creative randomizer.
 * Generates bounded chat draft variations from preset metadata without touching
 * other customization areas.
 * @module your-flavor/chat-randomizer
 */

import { DEFAULT_CONFIG } from './constants.js';
import {
    CHAT_PRESET_COMPATIBLE_AREAS,
    CHAT_PRESET_INTENSITIES,
    CHAT_PRESET_MOTION_LEVELS,
    CHAT_PRESET_TONES,
    getChatPreset,
    getChatPresetIds
} from './chat-presets.js';
import {
    buildChatContrastWarnings,
    calculateContrastRatio
} from './contrast-diagnostics.js';

export const CHAT_RANDOMIZER_ANY = 'any';

export const CHAT_RANDOMIZER_VALUES = Object.freeze({
    tone: Object.freeze(Object.values(CHAT_PRESET_TONES)),
    intensity: Object.freeze([
        CHAT_PRESET_INTENSITIES.SUBTLE,
        CHAT_PRESET_INTENSITIES.MODERATE,
        CHAT_PRESET_INTENSITIES.BOLD
    ]),
    motion: Object.freeze(Object.values(CHAT_PRESET_MOTION_LEVELS))
});

const DEFAULT_CONSTRAINTS = Object.freeze({
    area: CHAT_PRESET_COMPATIBLE_AREAS.CHAT,
    tone: CHAT_RANDOMIZER_ANY,
    intensity: CHAT_RANDOMIZER_ANY,
    motion: CHAT_RANDOMIZER_ANY,
    category: CHAT_RANDOMIZER_ANY,
    favoriteIds: [],
    excludePresetId: null
});

const BORDER_STYLES = Object.freeze(['solid', 'double', 'groove', 'ridge', 'dashed', 'dotted']);
const READABLE_TEXT_CANDIDATES = Object.freeze(['#f8f1e3', '#1f1710', '#ffffff', '#000000']);
const MIN_TEXT_CONTRAST = 4.5;

/**
 * Normalize incoming randomizer constraints.
 * @param {Object} constraints
 * @returns {Object}
 */
export function normalizeChatRandomizerConstraints(constraints = {}) {
    const source = isPlainObject(constraints) ? constraints : {};
    return {
        area: source.area === CHAT_PRESET_COMPATIBLE_AREAS.CHAT
            ? source.area
            : DEFAULT_CONSTRAINTS.area,
        tone: normalizeChoice(source.tone, CHAT_RANDOMIZER_VALUES.tone, CHAT_RANDOMIZER_ANY),
        intensity: normalizeChoice(source.intensity, CHAT_RANDOMIZER_VALUES.intensity, CHAT_RANDOMIZER_ANY),
        motion: normalizeChoice(source.motion, CHAT_RANDOMIZER_VALUES.motion, CHAT_RANDOMIZER_ANY),
        category: typeof source.category === 'string' && source.category.trim()
            ? source.category.trim()
            : CHAT_RANDOMIZER_ANY,
        favoriteIds: Array.isArray(source.favoriteIds)
            ? source.favoriteIds.filter(value => typeof value === 'string')
            : [],
        excludePresetId: typeof source.excludePresetId === 'string' && source.excludePresetId.trim()
            ? source.excludePresetId.trim()
            : null
    };
}

/**
 * Return presets eligible for the current randomizer constraints.
 * @param {Object} constraints
 * @returns {Array<Object>}
 */
export function getChatRandomizerCandidates(constraints = {}) {
    const normalized = normalizeChatRandomizerConstraints(constraints);
    const favorites = new Set(normalized.favoriteIds);

    return getChatPresetIds()
        .map(id => getChatPreset(id))
        .filter(Boolean)
        .filter(preset => preset.builtIn)
        .filter(preset => preset.metadata?.compatibleAreas?.includes(normalized.area))
        .filter(preset => normalized.tone === CHAT_RANDOMIZER_ANY || preset.metadata?.tone === normalized.tone)
        .filter(preset => (
            normalized.intensity === CHAT_RANDOMIZER_ANY
            || preset.metadata?.intensity === normalized.intensity
        ))
        .filter(preset => normalized.motion === CHAT_RANDOMIZER_ANY || preset.metadata?.motion === normalized.motion)
        .filter(preset => {
            if (normalized.category === CHAT_RANDOMIZER_ANY) return true;
            if (normalized.category === 'favorites') return favorites.has(preset.id);
            return preset.category === normalized.category;
        });
}

/**
 * Build a randomized chat draft from eligible presets.
 * @param {Object} config Current legacy chat config.
 * @param {Object} constraints Randomizer constraints.
 * @param {Object} options
 * @param {Function} options.rng Random number source for tests.
 * @returns {Object|null}
 */
export function randomizeChatDraft(config = {}, constraints = {}, { rng = Math.random } = {}) {
    const normalized = normalizeChatRandomizerConstraints(constraints);
    let candidates = getChatRandomizerCandidates(normalized);
    if (normalized.excludePresetId && candidates.length > 1) {
        candidates = candidates.filter(preset => preset.id !== normalized.excludePresetId);
    }
    if (!candidates.length) return null;

    const preset = pick(candidates, rng);
    const randomized = clone({
        ...DEFAULT_CONFIG,
        ...(isPlainObject(config) ? config : {})
    });
    const changedTokens = new Set();

    randomized.enabled = true;
    randomized.layout = preset.layoutId;
    randomized.presetId = preset.id;
    randomized.customizations = {
        ...DEFAULT_CONFIG.customizations,
        ...(isPlainObject(config?.customizations) ? config.customizations : {}),
        ...(preset.defaults || {})
    };

    for (const token of Object.keys(preset.defaults || {})) {
        changedTokens.add(`customizations.${token}`);
    }

    applyCreativeTokenVariation(randomized.customizations, preset.metadata, rng, changedTokens);

    const warningsBeforeContrast = buildChatContrastWarnings(randomized);
    const adjustedForContrast = ensureReadableChatTokens(randomized, warningsBeforeContrast);
    const warningsAfterContrast = buildChatContrastWarnings(randomized);

    return {
        config: randomized,
        preset,
        presetId: preset.id,
        constraints: normalized,
        changedTokens: [...changedTokens],
        warningsBeforeContrast,
        warningsAfterContrast,
        adjustedForContrast
    };
}

function applyCreativeTokenVariation(tokens, metadata = {}, rng, changedTokens) {
    const intensity = metadata.intensity ?? CHAT_PRESET_INTENSITIES.SUBTLE;
    const motion = metadata.motion ?? CHAT_PRESET_MOTION_LEVELS.NONE;
    const bold = intensity === CHAT_PRESET_INTENSITIES.BOLD;

    tokens.fontSize = clamp(Math.round(Number(tokens.fontSize || 14) + pick([-1, 0, 1], rng)), 12, 20);
    tokens.padding = clamp(Math.round(Number(tokens.padding || 12) + pick([-2, 0, 2], rng)), 10, 18);
    tokens.borderRadius = clamp(Math.round(Number(tokens.borderRadius || 0) + pick([-4, -2, 0, 2, 4], rng)), 0, 28);
    tokens.borderWidth = clamp(Math.round(Number(tokens.borderWidth || 0) + pick(bold ? [0, 1, 2] : [-1, 0, 1], rng)), 0, 6);
    tokens.backgroundOpacity = clamp(Math.round(Number(tokens.backgroundOpacity ?? 95) + pick([-5, 0, 5], rng)), 75, 100);

    if (rng() > 0.55) {
        tokens.borderStyle = pick(BORDER_STYLES, rng);
    }

    if (motion !== CHAT_PRESET_MOTION_LEVELS.NONE || bold) {
        tokens.glowEnabled = rng() > 0.25;
        if (tokens.glowEnabled) {
            tokens.glowColor = tokens.glowColor || tokens.borderColor || DEFAULT_CONFIG.customizations.glowColor;
            tokens.glowIntensity = clamp(
                Math.round(Number(tokens.glowIntensity || 10) + pick([-2, 0, 2, 4], rng)),
                5,
                24
            );
        }
    }

    changedTokens.add('customizations.fontSize');
    changedTokens.add('customizations.padding');
    changedTokens.add('customizations.borderRadius');
    changedTokens.add('customizations.borderWidth');
    changedTokens.add('customizations.backgroundOpacity');
    changedTokens.add('customizations.borderStyle');
    changedTokens.add('customizations.glowEnabled');
    changedTokens.add('customizations.glowColor');
    changedTokens.add('customizations.glowIntensity');
}

function ensureReadableChatTokens(config, warnings = buildChatContrastWarnings(config)) {
    if (!warnings.length) return false;

    const tokens = config.customizations || {};
    const background = applyOpacityToColor(tokens.backgroundColor, tokens.backgroundOpacity);
    const readableColor = chooseReadableTextColor(background);
    const warningIds = new Set(warnings.map(warning => warning.id));

    if (warningIds.has('ChatContentText')) tokens.textColor = readableColor;
    if (warningIds.has('ChatSpeakerName')) tokens.nameColor = readableColor;
    if (warningIds.has('ChatTimestamp')) tokens.timestampColor = readableColor;

    if (buildChatContrastWarnings(config).length > 0) {
        tokens.textColor = readableColor;
        tokens.nameColor = readableColor;
        tokens.timestampColor = readableColor;
    }

    return true;
}

function chooseReadableTextColor(background) {
    return READABLE_TEXT_CANDIDATES
        .map(color => ({
            color,
            ratio: calculateContrastRatio(color, background) ?? 0
        }))
        .sort((a, b) => b.ratio - a.ratio)[0]?.color ?? '#f8f1e3';
}

function applyOpacityToColor(color, opacityPercent) {
    const parsed = parseCssColor(color);
    if (!parsed) return String(color || '');

    const alpha = clamp(Number(opacityPercent) / 100, 0, 1);
    return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${alpha})`;
}

function parseCssColor(value) {
    const color = String(value || '').trim().toLowerCase();
    if (!color || color === 'transparent' || color.startsWith('var(')) return null;

    const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
        const expanded = hex[1].length === 3
            ? hex[1].split('').map(char => `${char}${char}`).join('')
            : hex[1];
        return {
            r: parseInt(expanded.slice(0, 2), 16),
            g: parseInt(expanded.slice(2, 4), 16),
            b: parseInt(expanded.slice(4, 6), 16)
        };
    }

    const rgb = color.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
    if (!rgb) return null;
    return {
        r: clamp(Number(rgb[1]), 0, 255),
        g: clamp(Number(rgb[2]), 0, 255),
        b: clamp(Number(rgb[3]), 0, 255)
    };
}

function normalizeChoice(value, allowed, fallback) {
    if (value === CHAT_RANDOMIZER_ANY) return CHAT_RANDOMIZER_ANY;
    return allowed.includes(value) ? value : fallback;
}

function pick(values, rng) {
    return values[Math.floor(clamp(rng(), 0, 0.999999) * values.length)];
}

function clamp(value, min, max) {
    if (!Number.isFinite(value)) return min;
    return Math.min(max, Math.max(min, value));
}

function clone(value) {
    if (globalThis.foundry?.utils?.deepClone) return globalThis.foundry.utils.deepClone(value);
    return JSON.parse(JSON.stringify(value ?? null));
}

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
