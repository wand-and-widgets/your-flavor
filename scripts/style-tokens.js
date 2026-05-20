/**
 * Your Flavor - Style token model.
 * Pure helpers for turning a profile into reusable visual tokens.
 */

import {
    createDefaultConfigV2,
    normalizeConfigV2
} from './config-normalizer.js';
import { ICON_GROUP_IDS } from './icon-registry.js';

export const STYLE_TOKEN_MODEL_VERSION = 1;

export const STYLE_TOKEN_DOMAINS = Object.freeze({
    CHAT: 'chat',
    ROLLS: 'rolls',
    CARDS: 'cards',
    FOUNDRY: 'foundry',
    ICONS: 'icons'
});

const FOUNDRY_LAYOUT_AREA_IDS = ['navigation', 'controls', 'hotbar', 'sidebar', 'players', 'chatLog'];
const FOUNDRY_STYLE_AREA_IDS = ['navigation', 'controls', 'hotbar', 'sidebar', 'players', 'chatLog', 'windows', 'scrollbars', 'contextMenus'];
export const STYLE_TOKEN_DEFINITIONS = Object.freeze([
    ...chatTokenDefinitions(),
    ...rollTokenDefinitions(),
    ...cardTokenDefinitions(),
    ...foundryTokenDefinitions(),
    ...iconTokenDefinitions()
]);

/**
 * Build the default style token tree.
 * @returns {Object}
 */
export function createDefaultStyleTokens() {
    return createStyleTokens(createDefaultConfigV2());
}

/**
 * Build a style token tree from a v2 profile or compatible legacy partial.
 * @param {Object} profile
 * @param {Object} options Passed through to normalizeConfigV2.
 * @returns {Object}
 */
export function createStyleTokens(profile = {}, options = {}) {
    const normalized = normalizeConfigV2(profile, options);
    const defaults = createDefaultConfigV2(options);
    const tokens = {
        tokenModelVersion: STYLE_TOKEN_MODEL_VERSION,
        profileSchemaVersion: normalized.schemaVersion,
        profileId: normalized.profileId,
        domains: {
            [STYLE_TOKEN_DOMAINS.CHAT]: {},
            [STYLE_TOKEN_DOMAINS.ROLLS]: {},
            [STYLE_TOKEN_DOMAINS.CARDS]: {},
            [STYLE_TOKEN_DOMAINS.FOUNDRY]: {},
            [STYLE_TOKEN_DOMAINS.ICONS]: {}
        }
    };

    for (const definition of [
        ...STYLE_TOKEN_DEFINITIONS,
        ...iconOverrideTokenDefinitions(normalized.icons?.overrides)
    ]) {
        const value = getPath(normalized, definition.path);
        const defaultValue = getPath(defaults, definition.path);
        const resolvedValue = value === undefined ? null : value;
        const resolvedDefaultValue = defaultValue === undefined ? null : defaultValue;
        setPath(tokens.domains[definition.domain], definition.path.slice(1), {
            id: definition.id,
            domain: definition.domain,
            path: definition.path.join('.'),
            cssVar: definition.cssVar ?? tokenCssVar(definition.id),
            type: definition.type,
            value: clone(resolvedValue),
            defaultValue: clone(resolvedDefaultValue),
            source: isSameValue(resolvedValue, resolvedDefaultValue) ? 'default' : 'profile'
        });
    }

    return tokens;
}

/**
 * Return all tokens as a flat list.
 * @param {Object} tokens
 * @returns {Array<Object>}
 */
export function flattenStyleTokens(tokens) {
    const result = [];
    walkTokenTree(tokens?.domains, result);
    return result;
}

/**
 * Read one token from a token tree.
 * @param {Object} tokens
 * @param {string|string[]} path Domain-relative path such as "chat.surfaces.outer.background".
 * @returns {Object|null}
 */
export function getStyleToken(tokens, path) {
    const parts = Array.isArray(path) ? path : String(path || '').split('.').filter(Boolean);
    if (parts.length === 0) return null;
    const domain = tokens?.domains?.[parts[0]];
    if (!domain) return null;
    return getPath(domain, parts.slice(1)) ?? null;
}

function chatTokenDefinitions() {
    return [
        token('chat.typography.fontFamily', 'font', '--yf-chat-font-family'),
        token('chat.typography.fontSize', 'number', '--yf-chat-font-size'),
        token('chat.typography.lineHeight', 'number', '--yf-chat-line-height'),
        token('chat.spacing.padding', 'number', '--yf-chat-padding'),
        token('chat.spacing.gap', 'number', '--yf-chat-gap'),
        token('chat.spacing.borderRadius', 'number', '--yf-chat-border-radius'),
        token('chat.surfaces.outer.background', 'color', '--yf-chat-outer-bg'),
        token('chat.surfaces.outer.borderColor', 'color', '--yf-chat-outer-border-color'),
        token('chat.surfaces.outer.borderWidth', 'number', '--yf-chat-outer-border-width'),
        token('chat.surfaces.outer.borderStyle', 'keyword', '--yf-chat-outer-border-style'),
        token('chat.surfaces.header.background', 'color', '--yf-chat-header-bg'),
        token('chat.surfaces.header.textColor', 'color', '--yf-chat-header-text'),
        token('chat.surfaces.header.metadataColor', 'color', '--yf-chat-header-metadata'),
        token('chat.surfaces.content.textColor', 'color', '--yf-chat-content-text'),
        token('chat.surfaces.content.linkColor', 'color', '--yf-chat-content-link'),
        token('chat.surfaces.avatar.visible', 'boolean', '--yf-chat-avatar-visible'),
        token('chat.surfaces.avatar.shape', 'keyword', '--yf-chat-avatar-shape'),
        token('chat.effects.glow.enabled', 'boolean', '--yf-chat-glow-enabled'),
        token('chat.effects.glow.color', 'color', '--yf-chat-glow-color'),
        token('chat.effects.glow.intensity', 'number', '--yf-chat-glow-intensity'),
        token('chat.effects.shadow.enabled', 'boolean', '--yf-chat-shadow-enabled'),
        token('chat.effects.shadow.color', 'color', '--yf-chat-shadow-color'),
        token('chat.effects.shadow.intensity', 'number', '--yf-chat-shadow-intensity')
    ];
}

function rollTokenDefinitions() {
    return [
        surfaceToken('rolls', 'formula', 'background', 'color'),
        surfaceToken('rolls', 'formula', 'textColor', 'color'),
        surfaceToken('rolls', 'formula', 'borderColor', 'color'),
        surfaceToken('rolls', 'terms', 'background', 'color'),
        surfaceToken('rolls', 'terms', 'textColor', 'color'),
        surfaceToken('rolls', 'tooltip', 'background', 'color'),
        surfaceToken('rolls', 'tooltip', 'textColor', 'color'),
        surfaceToken('rolls', 'total', 'background', 'color'),
        surfaceToken('rolls', 'total', 'textColor', 'color'),
        surfaceToken('rolls', 'total', 'borderColor', 'color'),
        surfaceToken('rolls', 'critical', 'textColor', 'color'),
        surfaceToken('rolls', 'critical', 'accentColor', 'color'),
        surfaceToken('rolls', 'failure', 'textColor', 'color'),
        surfaceToken('rolls', 'failure', 'accentColor', 'color')
    ];
}

function cardTokenDefinitions() {
    return [
        surfaceToken('cards', 'itemTitle', 'background', 'color'),
        surfaceToken('cards', 'itemTitle', 'textColor', 'color'),
        surfaceToken('cards', 'itemTitle', 'accentColor', 'color'),
        surfaceToken('cards', 'itemBody', 'background', 'color'),
        surfaceToken('cards', 'itemBody', 'textColor', 'color'),
        surfaceToken('cards', 'buttons', 'background', 'color'),
        surfaceToken('cards', 'buttons', 'textColor', 'color'),
        surfaceToken('cards', 'buttons', 'borderColor', 'color'),
        surfaceToken('cards', 'tables', 'oddRow', 'color'),
        surfaceToken('cards', 'tables', 'evenRow', 'color'),
        surfaceToken('cards', 'tables', 'borderColor', 'color')
    ];
}

function foundryTokenDefinitions() {
    const definitions = [
        token('foundry.enabled', 'boolean', '--yf-foundry-enabled'),
        token('foundry.theme.fontColor', 'color', '--yf-foundry-font-color'),
        token('foundry.theme.secondaryFontColor', 'color', '--yf-foundry-secondary-font-color'),
        token('foundry.theme.surfaceBackground', 'color', '--yf-foundry-surface-bg'),
        token('foundry.theme.windowBackground', 'color', '--yf-foundry-window-bg'),
        token('foundry.theme.windowHeaderBackground', 'color', '--yf-foundry-window-header-bg'),
        token('foundry.theme.accentColor', 'color', '--yf-foundry-accent-color'),
        token('foundry.theme.chatTint', 'color', '--yf-foundry-chat-tint'),
        token('foundry.theme.interfaceFont', 'font', '--yf-foundry-interface-font'),
        token('foundry.theme.windowFont', 'font', '--yf-foundry-window-font'),
        token('foundry.customCss', 'css', '--yf-foundry-custom-css')
    ];

    for (const areaId of FOUNDRY_LAYOUT_AREA_IDS) {
        definitions.push(
            token(`foundry.areas.${areaId}.enabled`, 'boolean'),
            token(`foundry.areas.${areaId}.visible`, 'boolean'),
            token(`foundry.areas.${areaId}.layout.x`, 'number'),
            token(`foundry.areas.${areaId}.layout.y`, 'number'),
            token(`foundry.areas.${areaId}.layout.width`, 'number'),
            token(`foundry.areas.${areaId}.layout.height`, 'number'),
            token(`foundry.areas.${areaId}.layout.scale`, 'number')
        );
    }

    for (const areaId of FOUNDRY_STYLE_AREA_IDS) {
        definitions.push(
            token(`foundry.areas.${areaId}.style.opacity`, 'number'),
            token(`foundry.areas.${areaId}.style.backgroundImage`, 'asset'),
            token(`foundry.areas.${areaId}.style.backgroundOpacity`, 'number'),
            token(`foundry.areas.${areaId}.style.borderColor`, 'color'),
            token(`foundry.areas.${areaId}.style.borderWidth`, 'number'),
            token(`foundry.areas.${areaId}.style.borderStyle`, 'keyword'),
            token(`foundry.areas.${areaId}.style.borderRadius`, 'number')
        );
    }

    for (const definition of sceneNavigationTokenDefinitions()) {
        definitions.push(definition);
    }

    definitions.push(
        token('foundry.areas.pause.enabled', 'boolean', '--yf-foundry-pause-enabled'),
        token('foundry.areas.pause.visible', 'boolean', '--yf-foundry-pause-visible'),
        token('foundry.areas.pause.visualMode', 'keyword', '--yf-foundry-pause-visual-mode'),
        token('foundry.areas.pause.motion', 'keyword', '--yf-foundry-pause-motion'),
        token('foundry.areas.pause.media.assetPath', 'asset', '--yf-foundry-pause-media'),
        token('foundry.areas.pause.media.opacity', 'number', '--yf-foundry-pause-media-opacity'),
        token('foundry.areas.pause.media.scale', 'number', '--yf-foundry-pause-media-scale'),
        token('foundry.areas.pause.media.positionX', 'number', '--yf-foundry-pause-media-position-x'),
        token('foundry.areas.pause.media.positionY', 'number', '--yf-foundry-pause-media-position-y'),
        token('foundry.areas.pause.media.rotation', 'number', '--yf-foundry-pause-media-rotation'),
        token('foundry.areas.pause.media.blendMode', 'keyword', '--yf-foundry-pause-media-blend-mode'),
        token('foundry.areas.pause.media.filter', 'keyword', '--yf-foundry-pause-media-filter'),
        token('foundry.areas.pause.media.animationStrength', 'number', '--yf-foundry-pause-media-animation-strength'),
        token('foundry.areas.pause.media.glowStrength', 'number', '--yf-foundry-pause-media-glow-strength'),
        token('foundry.areas.pause.media.shadowStrength', 'number', '--yf-foundry-pause-media-shadow-strength'),
        token('foundry.areas.pause.label.hidden', 'boolean', '--yf-foundry-pause-label-hidden'),
        token('foundry.areas.pause.label.text', 'text', '--yf-foundry-pause-label-text'),
        token('foundry.areas.pause.label.font', 'font', '--yf-foundry-pause-label-font'),
        token('foundry.areas.pause.label.color', 'color', '--yf-foundry-pause-label-color'),
        token('foundry.areas.pause.label.size', 'number', '--yf-foundry-pause-label-size'),
        token('foundry.areas.pause.label.weight', 'number', '--yf-foundry-pause-label-weight'),
        token('foundry.areas.pause.label.uppercase', 'boolean', '--yf-foundry-pause-label-uppercase'),
        token('foundry.areas.pause.label.placement', 'keyword', '--yf-foundry-pause-label-placement'),
        token('foundry.areas.pause.label.letterSpacing', 'number', '--yf-foundry-pause-label-letter-spacing'),
        token('foundry.areas.pause.label.offsetY', 'number', '--yf-foundry-pause-label-offset-y'),
        token('foundry.areas.pause.label.glowStrength', 'number', '--yf-foundry-pause-label-glow-strength'),
        token('foundry.areas.pause.bar.color', 'color', '--yf-foundry-pause-bar-color'),
        token('foundry.areas.pause.bar.opacity', 'number', '--yf-foundry-pause-bar-opacity'),
        token('foundry.areas.pause.bar.height', 'number', '--yf-foundry-pause-bar-height'),
        token('foundry.areas.pause.bar.width', 'number', '--yf-foundry-pause-bar-width'),
        token('foundry.areas.pause.bar.blur', 'number', '--yf-foundry-pause-bar-blur'),
        token('foundry.areas.pause.bar.shape', 'keyword', '--yf-foundry-pause-bar-shape'),
        token('foundry.areas.pause.bar.borderStrength', 'number', '--yf-foundry-pause-bar-border-strength'),
        token('foundry.areas.pause.animation', 'keyword', '--yf-foundry-pause-animation'),
        token('foundry.areas.scrollbars.style.color', 'color', '--yf-foundry-scrollbar-color')
    );

    return definitions;
}

function sceneNavigationTokenDefinitions() {
    const prefix = 'foundry.areas.navigation.sceneNavigation';
    return [
        token(`${prefix}.fontFamily`, 'font', '--yf-scene-nav-font'),
        token(`${prefix}.fontSize`, 'number', '--yf-scene-nav-font-size'),
        token(`${prefix}.fontWeight`, 'number', '--yf-scene-nav-font-weight'),
        token(`${prefix}.uppercase`, 'boolean', '--yf-scene-nav-uppercase'),
        token(`${prefix}.letterSpacing`, 'number', '--yf-scene-nav-letter-spacing'),
        token(`${prefix}.rowHeight`, 'number', '--yf-scene-nav-row-height'),
        token(`${prefix}.paddingX`, 'number', '--yf-scene-nav-padding-x'),
        token(`${prefix}.paddingY`, 'number', '--yf-scene-nav-padding-y'),
        token(`${prefix}.gap`, 'number', '--yf-scene-nav-gap'),
        token(`${prefix}.borderRadius`, 'number', '--yf-scene-nav-border-radius'),
        token(`${prefix}.borderWidth`, 'number', '--yf-scene-nav-border-width'),
        token(`${prefix}.borderStyle`, 'keyword', '--yf-scene-nav-border-style'),
        token(`${prefix}.textColor`, 'color', '--yf-scene-nav-text'),
        token(`${prefix}.borderColor`, 'color', '--yf-scene-nav-border'),
        token(`${prefix}.normalBackgroundColor`, 'color', '--yf-scene-nav-normal-bg'),
        token(`${prefix}.activeBackgroundColor`, 'color', '--yf-scene-nav-active-bg'),
        token(`${prefix}.viewedBackgroundColor`, 'color', '--yf-scene-nav-viewed-bg'),
        token(`${prefix}.hiddenBackgroundColor`, 'color', '--yf-scene-nav-hidden-bg'),
        token(`${prefix}.hiddenOpacity`, 'number', '--yf-scene-nav-hidden-opacity'),
        token(`${prefix}.hoverBackgroundColor`, 'color', '--yf-scene-nav-hover-bg'),
        token(`${prefix}.layoutMode`, 'keyword', '--yf-scene-nav-layout-mode')
    ];
}

function iconTokenDefinitions() {
    const definitions = [
        token('icons.enabled', 'boolean', '--yf-icons-enabled')
    ];

    for (const groupId of ICON_GROUP_IDS) {
        definitions.push(
            token(`icons.groups.${groupId}.color`, 'color'),
            token(`icons.groups.${groupId}.hoverColor`, 'color'),
            token(`icons.groups.${groupId}.activeColor`, 'color'),
            token(`icons.groups.${groupId}.backgroundColor`, 'color'),
            token(`icons.groups.${groupId}.hoverBackgroundColor`, 'color'),
            token(`icons.groups.${groupId}.activeBackgroundColor`, 'color')
        );
    }

    return definitions;
}

function iconOverrideTokenDefinitions(overrides = {}) {
    if (!isPlainObject(overrides)) return [];
    const definitions = [];

    for (const iconId of Object.keys(overrides)) {
        definitions.push(
            token(['icons', 'overrides', iconId, 'color'], 'color'),
            token(['icons', 'overrides', iconId, 'hoverColor'], 'color'),
            token(['icons', 'overrides', iconId, 'activeColor'], 'color'),
            token(['icons', 'overrides', iconId, 'backgroundColor'], 'color'),
            token(['icons', 'overrides', iconId, 'hoverBackgroundColor'], 'color'),
            token(['icons', 'overrides', iconId, 'activeBackgroundColor'], 'color'),
            token(['icons', 'overrides', iconId, 'inheritGroup'], 'boolean')
        );
    }

    return definitions;
}

function surfaceToken(domain, surface, key, type) {
    return token(`${domain}.surfaces.${surface}.${key}`, type);
}

function token(path, type, cssVar = null) {
    const parts = Array.isArray(path) ? path : path.split('.');
    return {
        id: parts.join('.'),
        domain: parts[0],
        path: parts,
        type,
        cssVar
    };
}

function tokenCssVar(id) {
    return `--yf-${id.replace(/[^a-z0-9_-]+/gi, '-')}`;
}

function walkTokenTree(value, result) {
    if (!isPlainObject(value)) return;
    if ('value' in value && 'path' in value) {
        result.push(value);
        return;
    }

    for (const child of Object.values(value)) {
        walkTokenTree(child, result);
    }
}

function getPath(source, path) {
    const parts = Array.isArray(path) ? path : String(path || '').split('.').filter(Boolean);
    let value = source;
    for (const part of parts) {
        if (value == null || typeof value !== 'object') return undefined;
        value = value[part];
    }
    return value;
}

function setPath(target, path, value) {
    const parts = Array.isArray(path) ? path : String(path || '').split('.').filter(Boolean);
    let cursor = target;
    for (const part of parts.slice(0, -1)) {
        cursor[part] ??= {};
        cursor = cursor[part];
    }
    cursor[parts.at(-1)] = value;
}

function clone(value) {
    if (Array.isArray(value)) return value.map(item => clone(item));
    if (isPlainObject(value)) {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
    }
    return value;
}

function isSameValue(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
}

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
