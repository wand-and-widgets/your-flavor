/**
 * Draft and saved configuration state for the Your Flavor config app.
 * @module your-flavor/ui/config-store
 */

import {
    DEFAULT_CARD_CONFIG,
    DEFAULT_CONFIG,
    DEFAULT_ROLL_CONFIG,
    DEFAULT_FOUNDRY_CUSTOMIZATION,
    MODULE_ID
} from '../constants.js';
import {
    normalizeChatLogConfig,
    normalizeHotbarConfig,
    normalizeLegacyIcons,
    normalizePlayersListConfig,
    normalizeSidebarConfig,
    normalizeWindowsConfig
} from '../config-normalizer.js';

const STOCK_FOUNDRY_THEME_FALLBACK = Object.freeze({
    fontColor: '#f0f0e0',
    secondaryFontColor: '#b5b3a4',
    surfaceBackground: '#191813',
    windowBackground: '#24221f',
    windowHeaderBackground: '#111111',
    accentColor: '#782e22',
    chatTint: '#191813',
    iconColor: '#b5b3a4',
    iconHoverColor: '#f0f0e0',
    scrollbarColor: '#782e22',
    interfaceFont: 'inherit',
    windowFont: 'inherit'
});

const STOCK_FOUNDRY_THEME_CSS_VARS = Object.freeze({
    fontColor: ['--color-text-light-highlight', '--color-text-primary', '--color-text-light-1'],
    secondaryFontColor: ['--color-text-light-primary', '--color-text-secondary', '--color-text-light-3'],
    surfaceBackground: ['--color-cool-5', '--color-bg', '--color-bg-option'],
    windowBackground: ['--background', '--app-background', '--color-cool-4'],
    windowHeaderBackground: ['--color-header-background', '--color-cool-5', '--color-dark-1'],
    accentColor: ['--color-border-highlight', '--color-warm-2', '--color-border-dark-primary'],
    chatTint: ['--color-cool-5', '--color-bg', '--color-dark-2'],
    iconColor: ['--color-text-light-primary', '--color-text-secondary', '--color-text-light-3'],
    iconHoverColor: ['--color-text-light-highlight', '--color-text-primary', '--color-text-light-1'],
    scrollbarColor: ['--color-scrollbar', '--color-border-highlight', '--color-warm-2']
});

const FOUNDRY_THEME_FIELD_IDS = Object.freeze([
    'fontColor',
    'secondaryFontColor',
    'surfaceBackground',
    'windowBackground',
    'windowHeaderBackground',
    'accentColor',
    'chatTint',
    'iconColor',
    'iconHoverColor',
    'scrollbarColor',
    'interfaceFont',
    'windowFont'
]);

const FOUNDRY_SHELL_SECTION_IDS = Object.freeze([
    'sceneNavigation',
    'tokenControls',
    'hotbar',
    'sidebar',
    'chatLog',
    'playersList',
    'windows'
]);

const FOUNDRY_LAYOUT_FIELD_IDS = Object.freeze(['x', 'y', 'width', 'height', 'scale']);
const FOUNDRY_COMPONENT_STYLE_FIELD_IDS = Object.freeze([
    'opacity',
    'backgroundImage',
    'backgroundOpacity',
    'borderColor',
    'borderWidth',
    'borderStyle',
    'borderRadius'
]);
const FOUNDRY_ICON_COLOR_FIELD_IDS = Object.freeze([
    'color',
    'hoverColor',
    'activeColor',
    'backgroundColor',
    'hoverBackgroundColor',
    'activeBackgroundColor'
]);
const FOUNDRY_PAUSE_FIELD_IDS = Object.freeze(Object.keys(DEFAULT_FOUNDRY_CUSTOMIZATION.pause || {}));

export class FlavorConfigStore {
    constructor({ manager, foundryCustomizer }) {
        this.manager = manager;
        this.foundryCustomizer = foundryCustomizer;
        this.workingConfig = null;
        this.savedConfigSnapshot = null;
        this.workingFoundryConfig = null;
        this.savedFoundryConfigSnapshot = null;
        this.editingActorId = null;
    }

    async initialize() {
        await this.manager.initialize();
        this.editingActorId = null;
        this.workingConfig = this.normalizeChatConfig(this.manager.getCurrentConfig());
        this.savedConfigSnapshot = foundry.utils.deepClone(this.workingConfig);
        this.workingFoundryConfig = this.normalizeFoundryConfig(
            this.foundryCustomizer?.getConfig?.()
        );
        this.savedFoundryConfigSnapshot = this.normalizeFoundryConfig(
            this.foundryCustomizer?.getEffectiveConfig?.()
        );
    }

    selectActor(actorId) {
        this.editingActorId = actorId || null;

        if (this.editingActorId) {
            const actorConfig = this.manager.getActorConfig(this.editingActorId);
            this.workingConfig = actorConfig
                ? this.normalizeChatConfig(actorConfig)
                : this.normalizeChatConfig(this.manager.getCurrentConfig());
        } else {
            this.workingConfig = this.normalizeChatConfig(this.manager.getCurrentConfig());
        }

        this.savedConfigSnapshot = foundry.utils.deepClone(this.workingConfig);
    }

    async save({ saveFoundry = false } = {}) {
        if (this.editingActorId) {
            await this.manager.saveActorConfig(this.editingActorId, this.workingConfig);
        } else {
            await this.manager.saveConfig(this.workingConfig);
        }
        this.savedConfigSnapshot = foundry.utils.deepClone(this.workingConfig);

        if (saveFoundry && this.foundryCustomizer) {
            this.workingFoundryConfig = await this.foundryCustomizer.saveConfig(this.workingFoundryConfig);
            this.savedFoundryConfigSnapshot = foundry.utils.deepClone(this.foundryCustomizer.getEffectiveConfig());
        }
    }

    resetChat() {
        this.workingConfig = this.normalizeChatConfig(DEFAULT_CONFIG);
    }

    resetChatArea(areaId) {
        if (areaId === 'chat') {
            this.workingConfig = this.normalizeChatConfig(DEFAULT_CONFIG);
            return true;
        }

        if (areaId === 'rolls') {
            this.workingConfig.rolls = foundry.utils.deepClone(DEFAULT_ROLL_CONFIG);
            return true;
        }

        if (areaId === 'cards') {
            this.workingConfig.cards = foundry.utils.deepClone(DEFAULT_CARD_CONFIG);
            return true;
        }

        return false;
    }

    async resetFoundry() {
        if (this.foundryCustomizer?.resetConfig) {
            this.workingFoundryConfig = await this.foundryCustomizer.resetConfig();
        } else {
            const defaults = foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION);
            await game.settings.set(MODULE_ID, 'sharedFoundryCustomization', defaults);
            await game.settings.set(MODULE_ID, 'foundryCustomization', foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION));
            this.foundryCustomizer?.applyConfig?.(defaults);
            this.workingFoundryConfig = defaults;
        }

        this.savedFoundryConfigSnapshot = this.foundryCustomizer
            ? foundry.utils.deepClone(this.foundryCustomizer.getEffectiveConfig())
            : foundry.utils.deepClone(this.workingFoundryConfig);
    }

    async resetFoundryToStockEditingBaseline() {
        this.foundryCustomizer?.clearCustomization?.();

        const baseline = this.#buildStockFoundryEditingBaseline();
        baseline.enabled = true;
        baseline.categories = Object.fromEntries(
            Object.keys(DEFAULT_FOUNDRY_CUSTOMIZATION.categories || {})
                .map(categoryId => [categoryId, true])
        );
        baseline.areaEnabled = Object.fromEntries(
            Object.keys(DEFAULT_FOUNDRY_CUSTOMIZATION.areaEnabled || {})
                .map(areaId => [areaId, true])
        );
        baseline.fieldOverrides = {};
        baseline.customCss = '';

        if (this.foundryCustomizer?.saveConfig) {
            this.workingFoundryConfig = await this.foundryCustomizer.saveConfig(baseline);
        } else {
            await game.settings.set(MODULE_ID, 'sharedFoundryCustomization', baseline);
            await game.settings.set(MODULE_ID, 'foundryCustomization', foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION));
            this.foundryCustomizer?.applyConfig?.(baseline);
            this.workingFoundryConfig = baseline;
        }

        this.savedFoundryConfigSnapshot = this.foundryCustomizer
            ? foundry.utils.deepClone(this.foundryCustomizer.getEffectiveConfig())
            : foundry.utils.deepClone(this.workingFoundryConfig);
    }

    #buildStockFoundryEditingBaseline() {
        const baseline = this.normalizeFoundryConfig(DEFAULT_FOUNDRY_CUSTOMIZATION);
        baseline.fieldOverrides = {};
        baseline.theme = FlavorConfigStore.#buildStockTheme();
        baseline.visibility = Object.fromEntries(
            Object.keys(DEFAULT_FOUNDRY_CUSTOMIZATION.visibility || {})
                .map(componentId => [componentId, true])
        );
        baseline.layout = FlavorConfigStore.#buildStockLayout();
        baseline.componentStyles = FlavorConfigStore.#buildStockComponentStyles();
        baseline.sceneNavigation = FlavorConfigStore.#buildStockSection('sceneNavigation');
        baseline.tokenControls = FlavorConfigStore.#buildStockSection('tokenControls');
        baseline.hotbar = FlavorConfigStore.#buildStockSection('hotbar');
        baseline.sidebar = FlavorConfigStore.#buildStockSection('sidebar');
        baseline.chatLog = FlavorConfigStore.#buildStockSection('chatLog');
        baseline.playersList = FlavorConfigStore.#buildStockSection('playersList');
        baseline.windows = FlavorConfigStore.#buildStockSection('windows');
        baseline.pause = {
            ...foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION.pause),
            enabled: false,
            assetPath: '',
            effect: 'none',
            motion: 'off',
            hideLabel: false,
            labelText: '',
            labelFont: 'inherit',
            labelColor: null,
            labelGlow: 0,
            barColor: null,
            barOpacity: 0,
            barBlur: 0,
            barBorderStrength: 0
        };
        baseline.icons = normalizeLegacyIcons({
            theme: baseline.theme,
            icons: {
                enabled: true,
                groups: {},
                overrides: {},
                selectedIconId: null
            }
        });

        return this.normalizeFoundryConfig(baseline);
    }

    importChatConfig(config) {
        this.workingConfig = this.normalizeChatConfig(config);
    }

    importFoundryConfig(config) {
        this.workingFoundryConfig = this.normalizeFoundryConfig(config);
    }

    normalizeFoundryConfig(config) {
        const sourceIcons = config?.icons
            ? foundry.utils.deepClone(config.icons)
            : null;
        const sourceFieldOverrides = FlavorConfigStore.#isPlainObject(config?.fieldOverrides)
            ? FlavorConfigStore.#sanitizeFieldOverrides(config.fieldOverrides)
            : null;
        const merged = foundry.utils.mergeObject(
            foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION),
            foundry.utils.deepClone(config || {})
        );
        merged.preserveCustomIconColors = merged.preserveCustomIconColors !== false;
        merged.preserveCustomFonts = merged.preserveCustomFonts !== false;
        merged.themeFontsCustomized = merged.themeFontsCustomized === true;
        if (sourceFieldOverrides) merged.fieldOverrides = sourceFieldOverrides;
        delete merged.areaEnabled?.directories;
        delete merged.areas?.directories;

        merged.hotbar = normalizeHotbarConfig(merged.hotbar);
        merged.sidebar = normalizeSidebarConfig(merged.sidebar);
        merged.chatLog = normalizeChatLogConfig(config?.chatLog ?? config?.areas?.chatLog?.chatLog ?? merged.chatLog);
        merged.playersList = normalizePlayersListConfig(config?.playersList ?? config?.areas?.players?.playersList ?? merged.playersList);
        merged.windows = normalizeWindowsConfig(config?.windows ?? config?.areas?.windows?.windows ?? merged.windows);
        merged.layout ||= {};
        merged.layout.hotbar ||= foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION.layout.hotbar);
        merged.layout.hotbar.x = null;
        merged.layout.hotbar.y = null;
        merged.areas ||= {};
        merged.areas.hotbar ||= {};
        merged.areas.hotbar.hotbar = foundry.utils.deepClone(merged.hotbar);
        merged.areas.sidebar ||= {};
        merged.areas.sidebar.sidebar = foundry.utils.deepClone(merged.sidebar);
        merged.areas.chatLog ||= {};
        merged.areas.chatLog.chatLog = foundry.utils.deepClone(merged.chatLog);
        merged.areas.players ||= {};
        merged.areas.players.playersList = foundry.utils.deepClone(merged.playersList);
        merged.areas.windows ||= {};
        merged.areas.windows.windows = foundry.utils.deepClone(merged.windows);
        merged.icons = normalizeLegacyIcons({
            ...merged,
            icons: sourceIcons ?? merged.icons
        });
        if (FlavorConfigStore.#usesGranularFieldOverrides(merged)) {
            FlavorConfigStore.#stripNonOverriddenFoundryFields(merged);
        }

        return merged;
    }

    normalizeChatConfig(config) {
        return foundry.utils.mergeObject(
            foundry.utils.deepClone(DEFAULT_CONFIG),
            foundry.utils.deepClone(config || {})
        );
    }

    resetFoundryArea(areaId) {
        if (!this.workingFoundryConfig) {
            this.workingFoundryConfig = foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION);
        }

        if (areaId === 'foundry') {
            this.workingFoundryConfig = foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION);
            return true;
        }

        if (areaId === 'icons') {
            this.workingFoundryConfig.theme ||= {};
            this.workingFoundryConfig.theme.iconColor = DEFAULT_FOUNDRY_CUSTOMIZATION.theme.iconColor;
            this.workingFoundryConfig.theme.iconHoverColor = DEFAULT_FOUNDRY_CUSTOMIZATION.theme.iconHoverColor;
            this.workingFoundryConfig.icons = normalizeLegacyIcons(DEFAULT_FOUNDRY_CUSTOMIZATION);
            return true;
        }

        return false;
    }

    getDirtyAreas() {
        const chatDirty = !FlavorConfigStore.#sameValue(
            FlavorConfigStore.#pickChatConfig(this.workingConfig),
            FlavorConfigStore.#pickChatConfig(this.savedConfigSnapshot)
        );
        const rollsDirty = !FlavorConfigStore.#sameValue(
            FlavorConfigStore.#pickRollConfig(this.workingConfig),
            FlavorConfigStore.#pickRollConfig(this.savedConfigSnapshot)
        );
        const cardsDirty = !FlavorConfigStore.#sameValue(
            FlavorConfigStore.#pickCardConfig(this.workingConfig),
            FlavorConfigStore.#pickCardConfig(this.savedConfigSnapshot)
        );
        const iconsDirty = !FlavorConfigStore.#sameValue(
            FlavorConfigStore.#pickIconConfig(this.workingFoundryConfig),
            FlavorConfigStore.#pickIconConfig(this.savedFoundryConfigSnapshot)
        );
        const foundryDirty = !FlavorConfigStore.#sameValue(
            this.workingFoundryConfig,
            this.savedFoundryConfigSnapshot
        );

        return {
            overview: chatDirty || rollsDirty || cardsDirty || foundryDirty,
            chat: chatDirty,
            rolls: rollsDirty,
            cards: cardsDirty,
            foundry: foundryDirty,
            icons: iconsDirty,
            diagnostics: false
        };
    }

    static #pickIconConfig(config = {}) {
        return normalizeLegacyIcons(config);
    }

    static #readStockFoundryTheme() {
        const theme = { ...STOCK_FOUNDRY_THEME_FALLBACK };

        for (const [field, variableNames] of Object.entries(STOCK_FOUNDRY_THEME_CSS_VARS)) {
            theme[field] = FlavorConfigStore.#readCssVariableColor(variableNames, theme[field]);
        }

        return theme;
    }

    static #readCssVariableColor(variableNames = [], fallback) {
        const doc = globalThis.document;
        if (!doc || !globalThis.getComputedStyle) return fallback;

        const elements = [doc.body, doc.documentElement].filter(Boolean);
        for (const element of elements) {
            const styles = globalThis.getComputedStyle(element);
            for (const variableName of variableNames) {
                const value = styles.getPropertyValue(variableName).trim();
                const normalized = FlavorConfigStore.#cssColorToHex(value, element);
                if (normalized) return normalized;
            }
        }

        return fallback;
    }

    static #cssColorToHex(value, contextElement = null) {
        if (typeof value !== 'string' || !value.trim()) return null;

        const trimmed = value.trim();
        if (/^transparent$/i.test(trimmed)) return null;

        const hexMatch = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
        if (hexMatch) {
            const hex = hexMatch[1].toLowerCase();
            if (hex.length === 6) return `#${hex}`;
            return `#${hex.split('').map(channel => `${channel}${channel}`).join('')}`;
        }

        const rgbMatch = trimmed.match(/^rgba?\(\s*([0-9.]+%?)\s*[,\s]\s*([0-9.]+%?)\s*[,\s]\s*([0-9.]+%?)/i);
        if (rgbMatch) {
            const channels = rgbMatch.slice(1, 4).map(channel => FlavorConfigStore.#cssChannelToHex(channel));
            return channels.every(Boolean) ? `#${channels.join('')}` : null;
        }

        const doc = globalThis.document;
        if (!doc || !globalThis.getComputedStyle) return null;

        const probe = doc.createElement('span');
        probe.style.color = trimmed;
        if (!probe.style.color && !trimmed.startsWith('var(')) return null;

        const parent = contextElement?.isConnected
            ? contextElement
            : doc.body || doc.documentElement;
        if (!parent) return null;

        probe.style.position = 'absolute';
        probe.style.pointerEvents = 'none';
        probe.style.opacity = '0';
        parent.appendChild(probe);
        const resolved = globalThis.getComputedStyle(probe).color;
        probe.remove();

        return resolved && resolved !== trimmed
            ? FlavorConfigStore.#cssColorToHex(resolved)
            : null;
    }

    static #cssChannelToHex(value) {
        const source = String(value || '').trim();
        if (!source) return null;

        const numeric = source.endsWith('%')
            ? Number.parseFloat(source) * 2.55
            : Number.parseFloat(source);
        if (!Number.isFinite(numeric)) return null;

        const byte = Math.max(0, Math.min(255, Math.round(numeric)));
        return byte.toString(16).padStart(2, '0');
    }

    static #pickChatConfig(config = {}) {
        const { rolls, cards, ...chat } = config || {};
        return chat;
    }

    static #pickRollConfig(config = {}) {
        return config?.rolls ?? DEFAULT_ROLL_CONFIG;
    }

    static #pickCardConfig(config = {}) {
        return config?.cards ?? DEFAULT_CARD_CONFIG;
    }

    static #buildStockTheme() {
        return Object.fromEntries(FOUNDRY_THEME_FIELD_IDS.map(fieldId => [
            fieldId,
            fieldId === 'interfaceFont' || fieldId === 'windowFont' ? 'inherit' : null
        ]));
    }

    static #buildStockLayout() {
        return Object.fromEntries(Object.keys(DEFAULT_FOUNDRY_CUSTOMIZATION.layout || {}).map(componentId => [
            componentId,
            Object.fromEntries(FOUNDRY_LAYOUT_FIELD_IDS.map(fieldId => [fieldId, null]))
        ]));
    }

    static #buildStockComponentStyles() {
        return Object.fromEntries(Object.keys(DEFAULT_FOUNDRY_CUSTOMIZATION.componentStyles || {}).map(componentId => [
            componentId,
            {
                opacity: 100,
                backgroundImage: '',
                backgroundOpacity: 100,
                borderColor: '',
                borderWidth: 0,
                borderStyle: 'none',
                borderRadius: 0
            }
        ]));
    }

    static #buildStockSection(sectionId) {
        const defaults = DEFAULT_FOUNDRY_CUSTOMIZATION[sectionId] || {};
        return Object.fromEntries(Object.keys(defaults).map(fieldId => [
            fieldId,
            FlavorConfigStore.#getStockFieldValue(`${sectionId}.${fieldId}`, defaults[fieldId])
        ]));
    }

    static #stripNonOverriddenFoundryFields(config) {
        config.fieldOverrides = FlavorConfigStore.#sanitizeFieldOverrides(config.fieldOverrides);

        config.theme ||= {};
        for (const fieldId of FOUNDRY_THEME_FIELD_IDS) {
            const path = `theme.${fieldId}`;
            if (!FlavorConfigStore.#hasFieldOverride(config, path)) {
                config.theme[fieldId] = FlavorConfigStore.#getStockFieldValue(path, config.theme[fieldId]);
            }
        }

        config.layout ||= {};
        for (const componentId of Object.keys(DEFAULT_FOUNDRY_CUSTOMIZATION.layout || {})) {
            config.layout[componentId] ||= {};
            for (const fieldId of FOUNDRY_LAYOUT_FIELD_IDS) {
                const path = `layout.${componentId}.${fieldId}`;
                if (!FlavorConfigStore.#hasFieldOverride(config, path)) config.layout[componentId][fieldId] = null;
            }
        }

        config.componentStyles ||= {};
        for (const componentId of Object.keys(DEFAULT_FOUNDRY_CUSTOMIZATION.componentStyles || {})) {
            config.componentStyles[componentId] ||= {};
            for (const fieldId of FOUNDRY_COMPONENT_STYLE_FIELD_IDS) {
                const path = `componentStyles.${componentId}.${fieldId}`;
                if (!FlavorConfigStore.#hasFieldOverride(config, path)) {
                    config.componentStyles[componentId][fieldId] = FlavorConfigStore.#getStockFieldValue(path, config.componentStyles[componentId][fieldId]);
                }
            }
        }

        for (const sectionId of FOUNDRY_SHELL_SECTION_IDS) {
            config[sectionId] ||= {};
            const defaults = DEFAULT_FOUNDRY_CUSTOMIZATION[sectionId] || {};
            for (const fieldId of Object.keys(defaults)) {
                const path = `${sectionId}.${fieldId}`;
                if (!FlavorConfigStore.#hasFieldOverride(config, path)) {
                    config[sectionId][fieldId] = FlavorConfigStore.#getStockFieldValue(path, config[sectionId][fieldId]);
                }
            }
        }

        config.pause ||= {};
        for (const fieldId of FOUNDRY_PAUSE_FIELD_IDS) {
            const path = `pause.${fieldId}`;
            if (!FlavorConfigStore.#hasFieldOverride(config, path)) {
                config.pause[fieldId] = FlavorConfigStore.#getStockFieldValue(path, config.pause[fieldId]);
            }
        }
        config.pause.enabled = Boolean(config.pause.enabled);
        config.pause.assetPath = typeof config.pause.assetPath === 'string' ? config.pause.assetPath : '';

        config.icons ||= {};
        config.icons.groups ||= {};
        for (const [groupId, group] of Object.entries(config.icons.groups)) {
            for (const fieldId of FOUNDRY_ICON_COLOR_FIELD_IDS) {
                const path = `icons.groups.${groupId}.${fieldId}`;
                if (!FlavorConfigStore.#hasFieldOverride(config, path)) group[fieldId] = null;
            }
        }

        config.areas ||= {};
        config.areas.navigation ||= {};
        config.areas.navigation.sceneNavigation = foundry.utils.deepClone(config.sceneNavigation);
        config.areas.controls ||= {};
        config.areas.controls.tokenControls = foundry.utils.deepClone(config.tokenControls);
        config.areas.hotbar ||= {};
        config.areas.hotbar.hotbar = foundry.utils.deepClone(config.hotbar);
        config.areas.sidebar ||= {};
        config.areas.sidebar.sidebar = foundry.utils.deepClone(config.sidebar);
        config.areas.chatLog ||= {};
        config.areas.chatLog.chatLog = foundry.utils.deepClone(config.chatLog);
        config.areas.players ||= {};
        config.areas.players.playersList = foundry.utils.deepClone(config.playersList);
        config.areas.windows ||= {};
        config.areas.windows.windows = foundry.utils.deepClone(config.windows);
    }

    static #getStockFieldValue(path, currentValue = null) {
        if (path === 'theme.interfaceFont' || path === 'theme.windowFont') return 'inherit';
        if (path.endsWith('.enabled') || path === 'pause.enabled') return false;
        if (path.endsWith('.assetPath') || path.endsWith('.backgroundImage') || path.endsWith('.customCss')) return '';
        if (path === 'pause.animationStrength') return DEFAULT_FOUNDRY_CUSTOMIZATION.pause.animationStrength;
        if (path.endsWith('.borderStyle')) return 'none';
        if (path.includes('Color') || path.includes('color') || path.includes('Background')) {
            return path.startsWith('theme.') || path.startsWith('pause.') ? null : '';
        }
        if (typeof currentValue === 'boolean') return false;
        if (typeof currentValue === 'number') return null;
        if (typeof currentValue === 'string') return '';
        return null;
    }

    static #usesGranularFieldOverrides(config = {}) {
        return FlavorConfigStore.#isPlainObject(config?.fieldOverrides);
    }

    static #hasFieldOverride(config = {}, path = '') {
        return config?.fieldOverrides?.[path] === true;
    }

    static #sanitizeFieldOverrides(fieldOverrides = {}) {
        if (!FlavorConfigStore.#isPlainObject(fieldOverrides)) return {};
        return Object.entries(fieldOverrides).reduce((sanitized, [path, enabled]) => {
            if (enabled !== true) return sanitized;
            const normalizedPath = String(path || '').trim();
            if (!normalizedPath || normalizedPath.length > 180 || /[^a-zA-Z0-9_.-]/.test(normalizedPath)) return sanitized;
            sanitized[normalizedPath] = true;
            return sanitized;
        }, {});
    }

    static #isPlainObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }

    static #sameValue(left, right) {
        return FlavorConfigStore.#stableStringify(left) === FlavorConfigStore.#stableStringify(right);
    }

    static #stableStringify(value) {
        return JSON.stringify(FlavorConfigStore.#sortValue(value));
    }

    static #sortValue(value) {
        if (!value || typeof value !== 'object') return value;
        if (Array.isArray(value)) return value.map(item => FlavorConfigStore.#sortValue(item));

        return Object.keys(value).sort().reduce((sorted, key) => {
            sorted[key] = FlavorConfigStore.#sortValue(value[key]);
            return sorted;
        }, {});
    }
}
