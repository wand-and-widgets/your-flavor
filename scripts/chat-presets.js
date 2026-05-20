/**
 * Your Flavor - Chat preset registry.
 * Bridges the legacy layout catalog into editable chat presets while keeping
 * saved `layout` values compatible with the current renderer.
 * @module your-flavor/chat-presets
 */

import { DEFAULT_CONFIG } from './constants.js';
import { LAYOUTS } from './layouts.js';

export const CHAT_PRESET_SOURCES = Object.freeze({
    NONE: 'none',
    BUILT_IN_LAYOUT: 'built-in-layout',
    CUSTOM: 'custom'
});

export const CHAT_PRESET_METADATA_VERSION = 1;
export const USER_CHAT_PRESET_EXPORT_TYPE = 'your-flavor.chat-preset';
export const USER_CHAT_PRESET_EXPORT_VERSION = 1;

export const CHAT_PRESET_COMPATIBLE_AREAS = Object.freeze({
    CHAT: 'chat',
    ROLLS: 'rolls',
    CARDS: 'cards'
});

export const CHAT_PRESET_TONES = Object.freeze({
    DARK: 'dark',
    LIGHT: 'light',
    MIXED: 'mixed'
});

export const CHAT_PRESET_INTENSITIES = Object.freeze({
    NONE: 'none',
    SUBTLE: 'subtle',
    MODERATE: 'moderate',
    BOLD: 'bold'
});

export const CHAT_PRESET_MOTION_LEVELS = Object.freeze({
    NONE: 'none',
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
});

const ALL_CHAT_PRESET_AREAS = Object.freeze([
    CHAT_PRESET_COMPATIBLE_AREAS.CHAT,
    CHAT_PRESET_COMPATIBLE_AREAS.ROLLS,
    CHAT_PRESET_COMPATIBLE_AREAS.CARDS
]);

const METADATA_LABEL_KEYS = Object.freeze({
    area: {
        chat: 'YOUR_FLAVOR.Config.PresetMetadata.Areas.Chat',
        rolls: 'YOUR_FLAVOR.Config.PresetMetadata.Areas.Rolls',
        cards: 'YOUR_FLAVOR.Config.PresetMetadata.Areas.Cards'
    },
    tone: {
        dark: 'YOUR_FLAVOR.Config.PresetMetadata.Tones.Dark',
        light: 'YOUR_FLAVOR.Config.PresetMetadata.Tones.Light',
        mixed: 'YOUR_FLAVOR.Config.PresetMetadata.Tones.Mixed'
    },
    intensity: {
        none: 'YOUR_FLAVOR.Config.PresetMetadata.Intensities.None',
        subtle: 'YOUR_FLAVOR.Config.PresetMetadata.Intensities.Subtle',
        moderate: 'YOUR_FLAVOR.Config.PresetMetadata.Intensities.Moderate',
        bold: 'YOUR_FLAVOR.Config.PresetMetadata.Intensities.Bold'
    },
    motion: {
        none: 'YOUR_FLAVOR.Config.PresetMetadata.Motion.None',
        low: 'YOUR_FLAVOR.Config.PresetMetadata.Motion.Low',
        medium: 'YOUR_FLAVOR.Config.PresetMetadata.Motion.Medium',
        high: 'YOUR_FLAVOR.Config.PresetMetadata.Motion.High'
    },
    tag: {
        basic: 'YOUR_FLAVOR.Categories.Basic',
        class: 'YOUR_FLAVOR.Categories.Classes',
        race: 'YOUR_FLAVOR.Categories.Races',
        theme: 'YOUR_FLAVOR.Categories.Themes',
        modern: 'YOUR_FLAVOR.Categories.Modern',
        misc: 'YOUR_FLAVOR.Categories.Misc',
        custom: 'YOUR_FLAVOR.Layouts.Custom.Name',
        dark: 'YOUR_FLAVOR.Config.PresetMetadata.Tones.Dark',
        light: 'YOUR_FLAVOR.Config.PresetMetadata.Tones.Light',
        mixed: 'YOUR_FLAVOR.Config.PresetMetadata.Tones.Mixed',
        glow: 'YOUR_FLAVOR.Config.Glow',
        ornate: 'YOUR_FLAVOR.Config.PresetMetadata.Tags.Ornate',
        animated: 'YOUR_FLAVOR.Config.PresetMetadata.Tags.Animated',
        'display-font': 'YOUR_FLAVOR.Config.PresetMetadata.Tags.DisplayFont',
        'old-school': 'YOUR_FLAVOR.Config.PresetMetadata.Tags.OldSchool',
        fantasy: 'YOUR_FLAVOR.Config.PresetMetadata.Tags.Fantasy',
        magic: 'YOUR_FLAVOR.Config.PresetMetadata.Tags.Magic',
        horror: 'YOUR_FLAVOR.Config.PresetMetadata.Tags.Horror',
        elemental: 'YOUR_FLAVOR.Config.PresetMetadata.Tags.Elemental',
        nature: 'YOUR_FLAVOR.Config.PresetMetadata.Tags.Nature',
        divine: 'YOUR_FLAVOR.Config.PresetMetadata.Tags.Divine',
        martial: 'YOUR_FLAVOR.Config.PresetMetadata.Tags.Martial',
        social: 'YOUR_FLAVOR.Config.PresetMetadata.Tags.Social',
        technical: 'YOUR_FLAVOR.Config.PresetMetadata.Tags.Technical'
    }
});

const METADATA_SHORT_LABEL_KEYS = Object.freeze({
    tone: {
        dark: 'YOUR_FLAVOR.Config.PresetMetadata.Short.Tone.Dark',
        light: 'YOUR_FLAVOR.Config.PresetMetadata.Short.Tone.Light',
        mixed: 'YOUR_FLAVOR.Config.PresetMetadata.Short.Tone.Mixed'
    },
    intensity: {
        none: 'YOUR_FLAVOR.Config.PresetMetadata.Short.Intensity.None',
        subtle: 'YOUR_FLAVOR.Config.PresetMetadata.Short.Intensity.Subtle',
        moderate: 'YOUR_FLAVOR.Config.PresetMetadata.Short.Intensity.Moderate',
        bold: 'YOUR_FLAVOR.Config.PresetMetadata.Short.Intensity.Bold'
    },
    motion: {
        none: 'YOUR_FLAVOR.Config.PresetMetadata.Short.Motion.None',
        low: 'YOUR_FLAVOR.Config.PresetMetadata.Short.Motion.Low',
        medium: 'YOUR_FLAVOR.Config.PresetMetadata.Short.Motion.Medium',
        high: 'YOUR_FLAVOR.Config.PresetMetadata.Short.Motion.High'
    }
});

const METADATA_ICONS = Object.freeze({
    area: {
        chat: 'fas fa-comment-dots',
        rolls: 'fas fa-dice-d20',
        cards: 'fas fa-scroll'
    },
    tone: {
        dark: 'fas fa-moon',
        light: 'fas fa-sun',
        mixed: 'fas fa-adjust'
    },
    intensity: {
        none: 'fas fa-minus',
        subtle: 'fas fa-feather',
        moderate: 'fas fa-signal',
        bold: 'fas fa-bolt'
    },
    motion: {
        none: 'fas fa-pause',
        low: 'fas fa-wave-square',
        medium: 'fas fa-arrows-spin',
        high: 'fas fa-bolt-lightning'
    }
});

const PRESET_NUMBER_LIMITS = Object.freeze({
    fontSize: [8, 32],
    borderWidth: [0, 10],
    borderRadius: [0, 50],
    padding: [0, 30],
    glowIntensity: [0, 30],
    backgroundOpacity: [0, 100]
});

const ANIMATED_PRESET_MOTION = Object.freeze({
    fire: CHAT_PRESET_MOTION_LEVELS.HIGH,
    magma: CHAT_PRESET_MOTION_LEVELS.HIGH,
    cyberpunk: CHAT_PRESET_MOTION_LEVELS.HIGH,
    infernal: CHAT_PRESET_MOTION_LEVELS.HIGH,
    solar: CHAT_PRESET_MOTION_LEVELS.HIGH,
    thunderstorm: CHAT_PRESET_MOTION_LEVELS.HIGH,
    bloodmoon: CHAT_PRESET_MOTION_LEVELS.HIGH,
    synthwave: CHAT_PRESET_MOTION_LEVELS.HIGH,
    tavern: CHAT_PRESET_MOTION_LEVELS.MEDIUM,
    spectral: CHAT_PRESET_MOTION_LEVELS.MEDIUM,
    cold: CHAT_PRESET_MOTION_LEVELS.MEDIUM,
    glacial: CHAT_PRESET_MOTION_LEVELS.MEDIUM,
    celestial: CHAT_PRESET_MOTION_LEVELS.MEDIUM,
    necromancer: CHAT_PRESET_MOTION_LEVELS.MEDIUM,
    feywild: CHAT_PRESET_MOTION_LEVELS.MEDIUM,
    lunar: CHAT_PRESET_MOTION_LEVELS.MEDIUM,
    sidereal: CHAT_PRESET_MOTION_LEVELS.MEDIUM,
    dragonblooded: CHAT_PRESET_MOTION_LEVELS.MEDIUM,
    sakura: CHAT_PRESET_MOTION_LEVELS.MEDIUM,
    crystalline: CHAT_PRESET_MOTION_LEVELS.MEDIUM,
    plague: CHAT_PRESET_MOTION_LEVELS.MEDIUM,
    runic: CHAT_PRESET_MOTION_LEVELS.MEDIUM,
    enchanted: CHAT_PRESET_MOTION_LEVELS.MEDIUM,
    witchcraft: CHAT_PRESET_MOTION_LEVELS.MEDIUM
});

const PRESET_TAG_OVERRIDES = Object.freeze({
    elegant: ['fantasy', 'social'],
    parchment: ['fantasy', 'old-school'],
    royal: ['fantasy', 'divine'],
    shadow: ['horror'],
    warrior: ['martial'],
    thief: ['technical'],
    bard: ['social'],
    druid: ['nature', 'magic'],
    barbarian: ['martial', 'elemental'],
    cleric: ['divine'],
    paladin: ['divine', 'martial'],
    monk: ['martial'],
    sorcerer: ['magic', 'elemental'],
    mage: ['magic'],
    ranger: ['nature', 'martial'],
    warlock: ['magic', 'horror'],
    elf: ['nature', 'magic'],
    orc: ['martial'],
    dwarf: ['martial', 'old-school'],
    dragon: ['fantasy', 'elemental'],
    necromancer: ['magic', 'horror'],
    vampire: ['horror', 'social'],
    beholder: ['horror', 'magic'],
    zombie: ['horror'],
    fire: ['elemental'],
    cold: ['elemental'],
    acid: ['elemental'],
    desert: ['elemental'],
    glacial: ['elemental'],
    evil: ['horror'],
    good: ['divine'],
    futuristic: ['technical'],
    cyberpunk: ['technical'],
    military: ['martial', 'technical'],
    rebel: ['social'],
    professor: ['old-school'],
    punk: ['social'],
    hiphop: ['social'],
    bland: ['technical'],
    steampunk: ['technical', 'old-school'],
    eldritch: ['horror', 'magic'],
    feywild: ['nature', 'magic'],
    celestial: ['divine', 'magic'],
    pirate: ['old-school'],
    noir: ['social'],
    alchemist: ['magic', 'technical'],
    infernal: ['horror', 'elemental'],
    merchant: ['social'],
    tribal: ['nature', 'old-school'],
    cosmic: ['magic'],
    blueprint: ['technical'],
    sketch: ['old-school'],
    comic: ['social'],
    arcade: ['technical'],
    biohazard: ['technical', 'horror'],
    spectral: ['horror', 'magic'],
    magma: ['elemental'],
    abyssal: ['elemental', 'horror'],
    jungle: ['nature'],
    pharaoh: ['old-school', 'divine'],
    matrix: ['technical'],
    vaporwave: ['social', 'technical'],
    gothic: ['horror', 'old-school'],
    harrowed: ['horror'],
    solar: ['divine', 'elemental'],
    lunar: ['divine', 'magic'],
    sidereal: ['divine', 'magic'],
    dragonblooded: ['martial', 'elemental'],
    sakura: ['nature', 'social'],
    thunderstorm: ['elemental'],
    bloodmoon: ['horror'],
    crystalline: ['elemental', 'magic'],
    sandstorm: ['elemental'],
    plague: ['horror'],
    runic: ['magic', 'old-school'],
    synthwave: ['technical', 'social'],
    tavern: ['social', 'old-school'],
    enchanted: ['magic', 'nature'],
    witchcraft: ['magic', 'horror']
});

export function getChatPreset(presetId) {
    const layout = LAYOUTS[presetId];
    if (!layout) return null;
    return layoutToPreset(layout);
}

export function getChatPresetIds() {
    return Object.keys(LAYOUTS);
}

export function getChatPresetChoices({ favorites = [] } = {}) {
    const favoriteIds = Array.isArray(favorites) ? favorites : [];
    return Object.values(LAYOUTS).map(layout => {
        const preset = layoutToPreset(layout);
        const metadata = localizePresetMetadata(preset.metadata);
        const name = localize(layout.name);
        const description = localize(layout.description);
        return {
            ...preset,
            name,
            description,
            metadata,
            tooltip: buildPresetTooltip(name, description, metadata),
            isFavorite: favoriteIds.includes(preset.id)
        };
    });
}

export function getChatPresetDefaults(presetId) {
    return getChatPreset(presetId)?.defaults ?? {};
}

export function getChatPresetMetadata(presetId) {
    return getChatPreset(presetId)?.metadata ?? null;
}

export function buildUserChatPresetExport(config = {}, {
    name = null,
    exportedBy = null,
    exportedAt = null
} = {}) {
    const presetConfig = normalizeUserPresetConfig(config);
    const layoutId = normalizePresetLayoutId(presetConfig.layout);
    const presetId = normalizePresetLayoutId(presetConfig.presetId ?? layoutId);

    return {
        type: USER_CHAT_PRESET_EXPORT_TYPE,
        schemaVersion: USER_CHAT_PRESET_EXPORT_VERSION,
        exportedAt: exportedAt ?? new Date().toISOString(),
        exportedBy,
        preset: {
            name: normalizePresetExportName(name) || 'Custom Chat Preset',
            sourcePresetId: layoutId,
            layout: layoutId,
            presetId,
            customizations: clone(presetConfig.customizations),
            customHtml: presetConfig.customHtml ?? null
        }
    };
}

export function parseUserChatPresetExport(source, { allowCustomHtml = true } = {}) {
    const data = typeof source === 'string' ? JSON.parse(source) : source;
    if (!isPlainObject(data)) throw new Error('Invalid user preset export.');

    const rawPreset = data.type === USER_CHAT_PRESET_EXPORT_TYPE
        ? data.preset
        : data.preset ?? data.chatPreset ?? data;
    if (!isPlainObject(rawPreset)) throw new Error('Invalid user preset payload.');

    const presetConfig = normalizeUserPresetConfig(rawPreset);
    if (!isPlainObject(rawPreset.customizations)) {
        throw new Error('User preset payload is missing chat customizations.');
    }

    return {
        name: normalizePresetExportName(rawPreset.name) || 'Imported Chat Preset',
        sourcePresetId: normalizePresetLayoutId(rawPreset.sourcePresetId ?? rawPreset.layout),
        layout: normalizePresetLayoutId(rawPreset.layout ?? rawPreset.sourcePresetId),
        presetId: normalizePresetLayoutId(rawPreset.presetId ?? rawPreset.layout ?? rawPreset.sourcePresetId),
        customizations: presetConfig.customizations,
        customHtml: allowCustomHtml ? presetConfig.customHtml : null
    };
}

export function applyUserChatPresetExport(currentConfig = {}, source, { allowCustomHtml = true } = {}) {
    const preset = parseUserChatPresetExport(source, { allowCustomHtml });
    const baseConfig = normalizeUserPresetConfig(currentConfig);

    return {
        ...baseConfig,
        layout: preset.layout,
        presetId: preset.presetId,
        customizations: {
            ...DEFAULT_CONFIG.customizations,
            ...preset.customizations
        },
        customHtml: allowCustomHtml ? preset.customHtml : baseConfig.customHtml
    };
}

function layoutToPreset(layout) {
    const source = layout.id === 'none'
        ? CHAT_PRESET_SOURCES.NONE
        : layout.id === 'custom'
            ? CHAT_PRESET_SOURCES.CUSTOM
            : CHAT_PRESET_SOURCES.BUILT_IN_LAYOUT;
    const metadata = createPresetMetadata(layout);

    return {
        id: layout.id,
        presetId: layout.id,
        layoutId: layout.id,
        name: layout.name,
        description: layout.description,
        icon: layout.icon,
        category: layout.category,
        source,
        editable: layout.id !== 'none',
        builtIn: source === CHAT_PRESET_SOURCES.BUILT_IN_LAYOUT,
        metadata,
        defaults: clone(layout.defaults ?? {})
    };
}

function normalizeUserPresetConfig(config = {}) {
    const source = isPlainObject(config) ? config : {};
    const customizations = isPlainObject(source.customizations) ? source.customizations : {};

    return {
        ...clone(DEFAULT_CONFIG),
        ...clone(source),
        layout: normalizePresetLayoutId(source.layout ?? source.presetId ?? DEFAULT_CONFIG.layout),
        presetId: normalizePresetLayoutId(source.presetId ?? source.layout ?? DEFAULT_CONFIG.presetId),
        customizations: sanitizePresetCustomizations(customizations),
        customHtml: typeof source.customHtml === 'string' && source.customHtml.trim()
            ? source.customHtml
            : null
    };
}

function sanitizePresetCustomizations(customizations = {}) {
    const sanitized = clone(DEFAULT_CONFIG.customizations);
    if (!isPlainObject(customizations)) return sanitized;

    for (const key of Object.keys(DEFAULT_CONFIG.customizations)) {
        if (!(key in customizations)) continue;
        sanitized[key] = sanitizePresetCustomizationValue(key, customizations[key], DEFAULT_CONFIG.customizations[key]);
    }

    return sanitized;
}

function sanitizePresetCustomizationValue(key, value, fallback) {
    if (value == null) return null;
    if (typeof fallback === 'number') {
        const numberValue = Number(value);
        if (!Number.isFinite(numberValue)) return fallback;
        const [min, max] = PRESET_NUMBER_LIMITS[key] ?? [-Infinity, Infinity];
        return clamp(numberValue, min, max);
    }
    if (typeof fallback === 'boolean') {
        if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
        return Boolean(value);
    }
    if (typeof value === 'string') return value;
    return fallback;
}

function normalizePresetLayoutId(layoutId, fallback = 'custom') {
    if (typeof layoutId !== 'string') return fallback;
    return LAYOUTS[layoutId] ? layoutId : fallback;
}

function normalizePresetExportName(name) {
    return typeof name === 'string' ? name.trim().slice(0, 80) : '';
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function createPresetMetadata(layout) {
    const defaults = layout.defaults ?? {};
    const tone = deriveTone(defaults.backgroundColor);
    const intensity = deriveIntensity(layout, defaults);
    const motion = deriveMotion(layout);
    const compatibleAreas = layout.id === 'none' ? [] : [...ALL_CHAT_PRESET_AREAS];

    return {
        version: CHAT_PRESET_METADATA_VERSION,
        tags: deriveTags(layout, { tone, intensity, motion }),
        compatibleAreas,
        intensity,
        tone,
        motion
    };
}

function deriveTone(backgroundColor) {
    const color = parseCssColor(backgroundColor);
    if (!color || color.alpha < 0.45) return CHAT_PRESET_TONES.MIXED;

    const luminance = relativeLuminance(color);
    if (luminance >= 0.58) return CHAT_PRESET_TONES.LIGHT;
    if (luminance <= 0.34) return CHAT_PRESET_TONES.DARK;
    return CHAT_PRESET_TONES.MIXED;
}

function deriveIntensity(layout, defaults) {
    if (layout.id === 'none') return CHAT_PRESET_INTENSITIES.NONE;

    let score = 0;
    if (defaults.glowEnabled) score += 2;
    if ((defaults.glowIntensity ?? 0) >= 15) score += 2;
    else if ((defaults.glowIntensity ?? 0) >= 10) score += 1;
    if ((defaults.borderWidth ?? 0) >= 4) score += 2;
    else if ((defaults.borderWidth ?? 0) >= 3) score += 1;
    if (['double', 'groove', 'ridge', 'dashed'].includes(defaults.borderStyle)) score += 1;
    if (defaults.borderRadius >= 16 || defaults.borderRadius === 0) score += 1;
    if (defaults.fontFamily && defaults.fontFamily !== 'inherit') score += 1;
    if (ANIMATED_PRESET_MOTION[layout.id]) score += 1;

    if (score >= 6) return CHAT_PRESET_INTENSITIES.BOLD;
    if (score >= 3) return CHAT_PRESET_INTENSITIES.MODERATE;
    return CHAT_PRESET_INTENSITIES.SUBTLE;
}

function deriveMotion(layout) {
    return ANIMATED_PRESET_MOTION[layout.id] ?? CHAT_PRESET_MOTION_LEVELS.NONE;
}

function deriveTags(layout, { tone, intensity, motion }) {
    const defaults = layout.defaults ?? {};
    const tags = new Set([
        layout.category,
        tone,
        intensity
    ]);

    if (motion !== CHAT_PRESET_MOTION_LEVELS.NONE) {
        tags.add('animated');
        tags.add(motion);
    }
    if (defaults.glowEnabled) tags.add('glow');
    if (['double', 'groove', 'ridge'].includes(defaults.borderStyle)) tags.add('ornate');
    if (defaults.fontFamily && defaults.fontFamily !== 'inherit') tags.add('display-font');

    for (const tag of PRESET_TAG_OVERRIDES[layout.id] ?? []) {
        tags.add(tag);
    }

    return [...tags].filter(Boolean);
}

function localizePresetMetadata(metadata) {
    const areaBadges = metadata.compatibleAreas.map(area => buildMetadataBadge('area', area));
    const tone = buildMetadataBadge('tone', metadata.tone);
    const intensity = buildMetadataBadge('intensity', metadata.intensity);
    const motion = buildMetadataBadge('motion', metadata.motion);
    const tagLabels = metadata.tags.map(tag => ({
        id: tag,
        label: metadataLabel('tag', tag),
        title: metadataLabel('tag', tag)
    }));

    const localized = {
        ...metadata,
        tone,
        intensity,
        motion,
        areas: areaBadges,
        badges: [tone, intensity, motion],
        previewTags: tagLabels.slice(0, 2),
        tagLabels,
        tagsString: metadata.tags.join(' '),
        compatibleAreasString: metadata.compatibleAreas.join(' ')
    };

    localized.title = buildMetadataTitle(localized);
    return localized;
}

function buildMetadataBadge(type, value) {
    const label = metadataLabel(type, value);
    return {
        type,
        value,
        label,
        shortLabel: metadataShortLabel(type, value, label),
        title: `${metadataGroupLabel(type)}: ${label}`,
        icon: METADATA_ICONS[type]?.[value] ?? 'fas fa-tag'
    };
}

function buildMetadataTitle(metadata) {
    const labels = {
        areas: metadata.compatibleAreas.length > 0
            ? metadata.areas.map(area => area.label).join(', ')
            : metadataLabel('intensity', CHAT_PRESET_INTENSITIES.NONE),
        tone: metadata.tone.label,
        intensity: metadata.intensity.label,
        motion: metadata.motion.label,
        tags: metadata.tagLabels.map(tag => tag.label).join(', ')
    };

    return [
        `${localize('YOUR_FLAVOR.Config.PresetMetadata.CompatibleAreas')}: ${labels.areas}`,
        `${localize('YOUR_FLAVOR.Config.PresetMetadata.Tone')}: ${labels.tone}`,
        `${localize('YOUR_FLAVOR.Config.PresetMetadata.Intensity')}: ${labels.intensity}`,
        `${localize('YOUR_FLAVOR.Config.PresetMetadata.MotionLevel')}: ${labels.motion}`,
        `${localize('YOUR_FLAVOR.Config.PresetMetadata.TagList')}: ${labels.tags}`
    ].join('\n');
}

function buildPresetTooltip(name, description, metadata) {
    return [
        `${name} - ${description}`,
        metadata.title
    ].join('\n');
}

function metadataLabel(type, value) {
    const key = METADATA_LABEL_KEYS[type]?.[value];
    return key ? localize(key) : titleize(value);
}

function metadataShortLabel(type, value, fallback) {
    const key = METADATA_SHORT_LABEL_KEYS[type]?.[value];
    return key ? localize(key) : fallback;
}

function metadataGroupLabel(type) {
    const key = {
        area: 'YOUR_FLAVOR.Config.PresetMetadata.CompatibleAreas',
        tone: 'YOUR_FLAVOR.Config.PresetMetadata.Tone',
        intensity: 'YOUR_FLAVOR.Config.PresetMetadata.Intensity',
        motion: 'YOUR_FLAVOR.Config.PresetMetadata.MotionLevel'
    }[type];
    return key ? localize(key) : titleize(type);
}

function parseCssColor(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();

    const hex = trimmed.match(/^#([a-f0-9]{3}|[a-f0-9]{6})$/i);
    if (hex) {
        const raw = hex[1].length === 3
            ? hex[1].split('').map(char => `${char}${char}`).join('')
            : hex[1];
        return {
            red: parseInt(raw.slice(0, 2), 16),
            green: parseInt(raw.slice(2, 4), 16),
            blue: parseInt(raw.slice(4, 6), 16),
            alpha: 1
        };
    }

    const rgba = trimmed.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
    if (rgba) {
        return {
            red: clampChannel(Number(rgba[1])),
            green: clampChannel(Number(rgba[2])),
            blue: clampChannel(Number(rgba[3])),
            alpha: rgba[4] === undefined ? 1 : clamp(Number(rgba[4]), 0, 1)
        };
    }

    return null;
}

function relativeLuminance({ red, green, blue }) {
    const [r, g, b] = [red, green, blue].map(channel => {
        const value = channel / 255;
        return value <= 0.03928
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function clampChannel(value) {
    return Math.round(clamp(value, 0, 255));
}

function clamp(value, min, max) {
    if (!Number.isFinite(value)) return min;
    return Math.min(max, Math.max(min, value));
}

function titleize(value) {
    return String(value ?? '')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}

function localize(key) {
    return globalThis.game?.i18n?.localize?.(key) ?? key;
}

function clone(value) {
    if (globalThis.foundry?.utils?.deepClone) return globalThis.foundry.utils.deepClone(value);
    return JSON.parse(JSON.stringify(value ?? null));
}
