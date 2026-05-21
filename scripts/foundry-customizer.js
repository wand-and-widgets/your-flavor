/**
 * Your Flavor - Foundry shell customizer
 * Applies client-side theme, visibility, layout, and pause overrides.
 * v4: Transform-based positioning, granular categories, custom CSS, per-component styling.
 */

import {
    DEFAULT_FOUNDRY_CUSTOMIZATION,
    FOUNDRY_UI_COMPONENTS,
    MESSAGE_STYLING_POLICY_IDS,
    MODULE_ID,
    WORLD_PROFILE_V2_SETTING
} from './constants.js';
import { FOUNDRY_HOOKS } from './compatibility.js';
import {
    CONFIG_SCHEMA_VERSION,
    normalizeConfigV2,
    normalizeChatLogConfig,
    normalizeHotbarConfig,
    normalizeLegacyFoundryConfig,
    normalizeLegacyIcons,
    normalizePlayersListConfig,
    normalizeSceneNavigationConfig,
    normalizeSidebarConfig,
    normalizeTokenControlsConfig,
    normalizeWindowsConfig,
    normalizePolicy
} from './config-normalizer.js';
import { buildFoundryContrastWarnings } from './contrast-diagnostics.js';
import {
    FA_ICON_SELECTOR,
    FOUNDRY_ICON_REGISTRY,
    findIconRegistryTarget,
    getIconDiscoveryDiagnostics as buildIconDiscoveryDiagnostics,
    resolveIconRegistryEntry
} from './icon-registry.js';

const STYLE_ELEMENT_ID = `${MODULE_ID}-foundry-customization`;
const PREVIEW_STYLE_ELEMENT_ID = `${MODULE_ID}-foundry-customization-preview`;
const ARRANGE_HANDLE_CLASS = 'yf-arrange-handle';
const ICON_SELECTION_BODY_CLASS = 'yf-icon-selection-active';
const ICON_SELECTION_HIGHLIGHT_CLASS = 'yf-icon-selection-highlight';
const ICON_SELECTION_TARGET_ATTRIBUTE = 'data-yf-icon-target-id';
const FOUNDRY_STYLE_SCOPE = 'body.yf-foundry-customized';
const FONT_AWESOME_CLASS_PATTERN = /^(fa|fas|far|fal|fad|fab|fat|fass|fasr|fasl|fa-solid|fa-regular|fa-light|fa-thin|fa-duotone|fa-brands|fa-[a-z0-9-]+)$/i;
const ICON_SELECTION_EXACT_ROOT_SELECTORS = Object.freeze([
    '#scene-controls',
    '#controls',
    '#ui-left',
    '#ui-left-column-1',
    '#scene-navigation',
    '#navigation',
    '#players',
    '#hotbar',
    '#sidebar',
    '#sidebar-tabs',
    '#sidebar-content',
    '#chat',
    '#chat-log',
    '.window-app',
    '.application'
]);
const ICON_SELECTION_EXACT_ATTRIBUTES = Object.freeze([
    'data-tool',
    'data-action',
    'data-control',
    'data-module',
    'data-tab',
    'data-tooltip',
    'aria-label',
    'title'
]);
const PAUSE_VISUAL_MODES = new Set(['cinematic', 'arcane-seal', 'parchment-sigil', 'neon-breach', 'minimal-utility', 'dark-ritual', 'divine-light', 'blood-moon', 'frost-stasis', 'solar-anima']);
const PAUSE_MOTION_MODES = new Set(['full', 'gentle', 'off']);
const PAUSE_LABEL_PLACEMENTS = new Set(['below', 'above', 'overlay']);
const PAUSE_SYMBOL_FILTERS = new Set(['none', 'radiant', 'arcane', 'ember', 'frost', 'shadow', 'blood', 'neon']);
const PAUSE_BLEND_MODES = new Set(['normal', 'screen', 'overlay', 'plus-lighter', 'luminosity']);
const PAUSE_BAR_SHAPES = new Set(['mode', 'square', 'soft', 'rounded', 'pill']);
const PAUSE_LABEL_WEIGHTS = new Set([400, 500, 600, 700, 800, 900]);
const FOUNDRY_THEME_COLOR_FIELDS = Object.freeze([
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
const FOUNDRY_THEME_FONT_FIELDS = Object.freeze(['interfaceFont', 'windowFont']);
const FOUNDRY_THEME_FIELD_IDS = Object.freeze([...FOUNDRY_THEME_COLOR_FIELDS, ...FOUNDRY_THEME_FONT_FIELDS]);
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
const FOUNDRY_STOCK_THEME_FALLBACK = Object.freeze({
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

const FOUNDRY_AREA_SELECTORS = Object.freeze({
    navigation: ['#navigation', '#scene-navigation'],
    controls: ['#controls', '#scene-controls'],
    controlTools: ['.ui-control', '.placeable-hud', '#measurement .waypoint-label'],
    players: ['#players'],
    hotbar: ['#hotbar'],
    sidebar: [
        '#sidebar',
        '#sidebar-content',
        '#sidebar-tabs',
        '.sidebar-tab',
        '.sidebar-popout',
        '#sidebar-content .directory',
        '.sidebar-popout .directory',
        '.directory.sidebar-tab',
        '#sidebar-content .directory .directory-header',
        '#sidebar-content .directory .directory-list',
        '#sidebar-content .directory .directory-item'
    ],
    sidebarPanels: ['.sidebar-tab', '.sidebar-popout'],
    chatLog: [
        '#chat',
        '.chat-sidebar',
        '#chat-log',
        '.chat-log',
        '#chat-form',
        '.chat-form',
        '.chat-input',
        '#chat-notifications',
        '#chat-message',
        '#chat-log .chat-message',
        '.chat-log .chat-message',
        '#chat .chat-message'
    ],
    pause: ['#pause'],
    windows: ['.window-app', '.application'],
    windowHeaders: ['.window-app .window-header', '.application .window-header']
});

const FOUNDRY_SELECTOR_HEALTH_LABELS = Object.freeze({
    navigation: 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.Navigation',
    controls: 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.Controls',
    controlTools: 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.ControlTools',
    players: 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.Players',
    hotbar: 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.Hotbar',
    sidebar: 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.Sidebar',
    sidebarPanels: 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.SidebarPanels',
    chatLog: 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.ChatLog',
    pause: 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.Pause',
    windows: 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.Windows',
    windowHeaders: 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.WindowHeaders'
});

export class FoundryCustomizer {
    constructor() {
        this._styleElement = null;
        this._previewStyleElement = null;
        this._lastAppliedConfig = foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION);
        this._cssAreaEnabled = null;
        this._previewState = {
            active: false,
            config: null,
            restoreConfig: null,
            mainStyleWasDisabled: false,
            forceFeatureEnabled: false
        };
        this._refreshTimeout = null;
        this._naturalRects = new Map();
        this._arrangeState = {
            active: false,
            config: null,
            onChange: null,
            handles: new Map(),
            drag: null
        };
        this._iconSelectionState = {
            active: false,
            selectedIconId: null,
            onSelect: null,
            ignoredSelector: '#your-flavor-config',
            highlightedElement: null,
            suppressClick: false
        };
        this._iconClassOverrides = new Map();
        this._iconStyleOverrides = new Map();
        this._dynamicIconTargets = new Map();
        this._boundRefresh = () => this.refreshArrangeMode();
        this._boundPointerMove = (event) => this._onArrangePointerMove(event);
        this._boundPointerUp = () => this._onArrangePointerUp();
        this._boundIconSelectionPointerDown = (event) => this._onIconSelectionPointerDown(event);
        this._boundIconSelectionClick = (event) => this._onIconSelectionClick(event);
    }

    async initialize() {
        this._ensureStyleElement();

        Hooks.on(FOUNDRY_HOOKS.PAUSE_GAME, () => this._scheduleRefresh());
        Hooks.on(FOUNDRY_HOOKS.APPLICATION_V2_RENDER, () => this._scheduleRefresh());
        Hooks.on(FOUNDRY_HOOKS.COLLAPSE_SIDEBAR, (_sidebar, collapsed) => this._onSidebarCollapse(collapsed));

        window.addEventListener('resize', () => {
            this._naturalRects.clear();
            this._boundRefresh();
        });
        this._syncSidebarExpandedClass();

        await this._migrateLegacyConfigIfNeeded();
        await this._migrateSharedConfigToV2();
        this.refreshFromSettings();
    }

    isFeatureEnabled() {
        return game.settings.get(MODULE_ID, 'enableFoundryCustomization');
    }

    _isFeatureEnabledForDom() {
        return this.isFeatureEnabled()
            || Boolean(this._previewState.active && this._previewState.forceFeatureEnabled);
    }

    canEditConfig() {
        return game.user.isGM;
    }

    getSelectorHealth({ root = globalThis.document } = {}) {
        const areas = Object.entries(FOUNDRY_AREA_SELECTORS).map(([areaId, selectors]) => (
            this._inspectSelectorArea(areaId, selectors, root)
        ));

        return {
            checkedAt: new Date().toISOString(),
            foundryVersion: game.version ?? game.release?.version ?? null,
            systemId: game.system?.id ?? null,
            totalAreas: areas.length,
            presentAreas: areas.filter(area => area.present).length,
            missingAreas: areas.filter(area => !area.present).length,
            invalidSelectors: areas.reduce((total, area) => total + area.invalidSelectors, 0),
            areas
        };
    }

    getIconDiscoveryDiagnostics({ root = globalThis.document, localize = null } = {}) {
        return buildIconDiscoveryDiagnostics({
            root,
            localize,
            foundryVersion: game.version ?? game.release?.version ?? null,
            systemId: game.system?.id ?? null
        });
    }

    getIconOverrideDiagnostics({ config = null } = {}) {
        const activeConfig = config || this._getActiveDomConfig() || this.getEffectiveConfig();
        const sanitized = this._sanitizeConfig(activeConfig);
        const iconConfig = normalizeLegacyIcons(sanitized);
        const rawOverrideKeys = Object.keys(iconConfig.overrides || {});
        const entries = this._getResolvedIconOverrideEntries(iconConfig)
            .filter(({ override }) => override?.inheritGroup === false || override?.hidden === true)
            .map(({ override, entry }) => {
                const styleTargets = this._findIconStyleTargets(entry);
                const classTargets = this._findIconClassTargets(entry);
                const hiddenTargets = this._findIconHiddenTargets(entry);
                return {
                    id: entry.id,
                    label: entry.label ?? override.label ?? entry.id,
                    dynamic: Boolean(entry.dynamic),
                    area: entry.area,
                    hidden: Boolean(override.hidden),
                    iconClass: override.iconClass || null,
                    color: override.color || null,
                    hoverColor: override.hoverColor || null,
                    activeColor: override.activeColor || null,
                    selector: entry.selector,
                    matchSelectors: [...(entry.matchSelectors ?? [])],
                    styleSelectors: [...(entry.styleSelectors ?? [])],
                    styleTargetCount: styleTargets.size,
                    classTargetCount: classTargets.size,
                    hiddenTargetCount: hiddenTargets.size,
                    rememberedTargetConnected: Boolean(this._getRememberedDynamicIconTarget(entry))
                };
            });

        return {
            featureEnabled: this.isFeatureEnabled(),
            configEnabled: sanitized.enabled !== false,
            iconsEnabled: sanitized.categories?.icons !== false && iconConfig.enabled !== false,
            selectedIconId: iconConfig.selectedIconId,
            rawOverrideCount: rawOverrideKeys.length,
            rawOverrideKeys,
            overrideCount: entries.length,
            styleTargetCount: entries.reduce((total, entry) => total + entry.styleTargetCount, 0),
            classTargetCount: entries.reduce((total, entry) => total + entry.classTargetCount, 0),
            hiddenTargetCount: entries.reduce((total, entry) => total + entry.hiddenTargetCount, 0),
            entries
        };
    }

    shouldShareWithPlayers() {
        return game.settings.get(MODULE_ID, 'shareFoundryCustomization');
    }

    isArrangeModeActive() {
        return this._arrangeState.active;
    }

    isIconSelectionModeActive() {
        return this._iconSelectionState.active;
    }

    enableIconSelectionMode({
        selectedIconId = null,
        onSelect = null,
        ignoredSelector = '#your-flavor-config'
    } = {}) {
        if (!this.canEditConfig()) return false;

        this._iconSelectionState.active = true;
        this._iconSelectionState.selectedIconId = selectedIconId || null;
        this._iconSelectionState.onSelect = typeof onSelect === 'function' ? onSelect : null;
        this._iconSelectionState.ignoredSelector = ignoredSelector || null;
        this._iconSelectionState.suppressClick = false;

        globalThis.document?.body?.classList.add(ICON_SELECTION_BODY_CLASS);
        globalThis.document?.addEventListener('pointerdown', this._boundIconSelectionPointerDown, true);
        globalThis.document?.addEventListener('click', this._boundIconSelectionClick, true);
        this.highlightIconSelection(selectedIconId);
        return true;
    }

    disableIconSelectionMode() {
        globalThis.document?.removeEventListener('pointerdown', this._boundIconSelectionPointerDown, true);
        globalThis.document?.removeEventListener('click', this._boundIconSelectionClick, true);
        globalThis.document?.body?.classList.remove(ICON_SELECTION_BODY_CLASS);
        this._clearIconSelectionHighlight();
        this._iconSelectionState.active = false;
        this._iconSelectionState.onSelect = null;
        this._iconSelectionState.suppressClick = false;
        this._iconSelectionState.selectedIconId = null;
    }

    highlightIconSelection(iconId = this._iconSelectionState.selectedIconId) {
        this._clearIconSelectionHighlight();
        if (!iconId || !globalThis.document?.querySelector) return false;

        const entry = typeof iconId === 'object'
            ? iconId
            : resolveIconRegistryEntry(iconId, {
                overrides: this._getActiveIconOverrides(),
                localize: key => globalThis.game?.i18n?.localize?.(key) ?? key
            });
        if (!entry) return false;

        let target = null;
        for (const selector of entry.matchSelectors ?? [entry.selector]) {
            try {
                target = globalThis.document.querySelector(selector);
            } catch (_error) {
                continue;
            }
            if (target) break;
        }

        if (!target) return false;
        if (entry.dynamic) target.setAttribute?.(ICON_SELECTION_TARGET_ATTRIBUTE, entry.id);
        target.classList.add(ICON_SELECTION_HIGHLIGHT_CLASS);
        this._iconSelectionState.highlightedElement = target;
        return true;
    }

    _getActiveIconOverrides() {
        const activeConfig = this._previewState?.active && this._previewState.config
            ? this._previewState.config
            : this._lastAppliedConfig;
        return normalizeLegacyIcons(activeConfig || {}).overrides || {};
    }

    forgetLayoutMeasurement(componentId = null) {
        if (componentId) {
            this._naturalRects.delete(componentId);
        } else {
            this._naturalRects.clear();
        }
    }

    _onIconSelectionPointerDown(event) {
        if (!this._iconSelectionState.active) return;
        const match = this._getIconSelectionMatch(event);
        if (!match) return;

        this._selectIconMatch(match);
        this._iconSelectionState.suppressClick = true;
        this._suppressIconSelectionEvent(event);
    }

    _onIconSelectionClick(event) {
        if (!this._iconSelectionState.active) return;

        if (this._iconSelectionState.suppressClick) {
            this._suppressIconSelectionEvent(event);
            this._iconSelectionState.suppressClick = false;
            return;
        }

        const match = this._getIconSelectionMatch(event);
        if (match) {
            this._selectIconMatch(match);
            this._suppressIconSelectionEvent(event);
            this._iconSelectionState.suppressClick = false;
            return;
        }
    }

    _getIconSelectionMatch(event) {
        const targets = this._getIconSelectionEventTargets(event);
        if (!targets.length) return null;

        const ignoredSelector = this._iconSelectionState.ignoredSelector;
        if (ignoredSelector && targets.some(target => target.closest?.(ignoredSelector))) return null;

        for (const target of targets) {
            const match = findIconRegistryTarget(target, {
                root: globalThis.document,
                localize: key => globalThis.game?.i18n?.localize?.(key) ?? key
            });
            if (match) return match;
        }

        return null;
    }

    _getIconSelectionEventTargets(event) {
        const path = typeof event?.composedPath === 'function' ? event.composedPath() : [];
        const targets = path.length ? path : [event?.target];
        const seen = new Set();

        return targets.filter(target => {
            const element = this._getElementFromEventTarget(target);
            if (!element || seen.has(element)) return false;
            seen.add(element);
            return true;
        }).map(target => this._getElementFromEventTarget(target));
    }

    _getElementFromEventTarget(target) {
        if (typeof Element !== 'undefined' && target instanceof Element) return target;
        if (typeof Element !== 'undefined' && target?.parentElement instanceof Element) return target.parentElement;
        return null;
    }

    _selectIconMatch(match) {
        const iconId = match?.entry?.id;
        if (!iconId) return;
        const entry = this._prepareSelectedIconEntry(match.entry, match.element);

        this._iconSelectionState.selectedIconId = entry?.id || iconId;
        this._clearIconSelectionHighlight();
        match.element?.classList?.add(ICON_SELECTION_HIGHLIGHT_CLASS);
        this._iconSelectionState.highlightedElement = match.element || null;
        this._iconSelectionState.onSelect?.({
            entry,
            element: match.element
        });
    }

    _prepareSelectedIconEntry(entry, element) {
        if (!entry?.id || !element?.setAttribute) return entry;

        const entryIsDynamic = entry.dynamic === true || String(entry.id).startsWith('dynamic.');
        const stableSelectors = entryIsDynamic ? [] : this._buildIconSelectionStableSelectors(element);
        const targetId = entryIsDynamic
            ? entry.id
            : this._buildIconSelectionDynamicId(entry, stableSelectors[0] || element.getAttribute?.('data-tooltip') || element.getAttribute?.('aria-label') || element.getAttribute?.('title') || entry.id);

        element.setAttribute(ICON_SELECTION_TARGET_ATTRIBUTE, targetId);
        this._dynamicIconTargets.set(targetId, element);
        const sessionSelector = `[${ICON_SELECTION_TARGET_ATTRIBUTE}="${this._cssAttributeValue(targetId)}"]`;
        const exactStyleSelectors = this._prependUniqueSelectors(stableSelectors, [
            sessionSelector,
            `${sessionSelector} ${FA_ICON_SELECTOR}`
        ]);
        const selectors = this._prependUniqueSelectors(entryIsDynamic ? entry.selectors : [], exactStyleSelectors);
        const matchSelectors = this._prependUniqueSelectors(entryIsDynamic ? entry.matchSelectors : stableSelectors, [sessionSelector]);
        const styleSelectors = this._prependUniqueSelectors(entryIsDynamic ? entry.styleSelectors : [], exactStyleSelectors);

        return {
            ...entry,
            id: targetId,
            dynamic: true,
            selector: selectors.join(', '),
            selectors: Object.freeze(selectors),
            matchSelectors: Object.freeze(matchSelectors),
            styleSelectors: Object.freeze(styleSelectors)
        };
    }

    _buildIconSelectionDynamicId(entry, signature) {
        const area = String(entry?.area || 'controls').replace(/[^a-z0-9_-]/gi, '-') || 'controls';
        const label = this._slugifyIconSelectionValue(entry?.label || entry?.labelKey || entry?.id || 'icon').slice(0, 48) || 'icon';
        return `dynamic.${area}.${label}-${this._hashIconSelectionValue(`${entry?.id || ''}|${signature || ''}`)}`;
    }

    _buildIconSelectionStableSelectors(element) {
        const rootInfo = this._getIconSelectionRootInfo(element);
        if (!rootInfo?.element || !rootInfo.selector) return [];

        const localSelector = this._buildIconSelectionLocalSelector(element, rootInfo.element);
        if (!localSelector) return [];

        const selector = rootInfo.selector === 'body'
            ? localSelector
            : `${rootInfo.selector} ${localSelector}`;
        if (!this._selectorMatchesOnlyElement(globalThis.document, selector, element)) return [];

        return [selector, `${selector} ${FA_ICON_SELECTOR}`];
    }

    _getIconSelectionRootInfo(element) {
        for (const selector of ICON_SELECTION_EXACT_ROOT_SELECTORS) {
            const root = element.closest?.(selector);
            if (!root) continue;
            return {
                element: root,
                selector: root.id ? `#${this._cssIdentifier(root.id)}` : selector
            };
        }

        const root = globalThis.document?.body || globalThis.document?.documentElement || null;
        return root ? { element: root, selector: root === globalThis.document?.body ? 'body' : this._buildIconSelectionNthPath(root, null) } : null;
    }

    _buildIconSelectionLocalSelector(element, rootElement) {
        if (!element || !rootElement) return null;

        if (element.id) {
            const selector = `#${this._cssIdentifier(element.id)}`;
            if (this._selectorMatchesElement(rootElement, selector, element)) return selector;
        }

        for (const selector of this._buildIconSelectionAttributeSelectors(element)) {
            if (this._selectorMatchesElement(rootElement, selector, element)) return selector;
        }

        const classSelector = this._buildIconSelectionClassSelector(element);
        if (classSelector && this._selectorMatchesElement(rootElement, classSelector, element)) return classSelector;

        return this._buildIconSelectionNthPath(element, rootElement);
    }

    _buildIconSelectionAttributeSelectors(element) {
        const selectors = [];
        const tagName = element.localName || '*';
        const dataControl = this._getElementAttribute(element, 'data-control');
        const dataTool = this._getElementAttribute(element, 'data-tool');
        const dataModule = this._getElementAttribute(element, 'data-module');
        const dataAction = this._getElementAttribute(element, 'data-action');

        if (dataControl && dataTool) selectors.push(`${tagName}[data-control="${this._cssAttributeValue(dataControl)}"][data-tool="${this._cssAttributeValue(dataTool)}"]`);
        if (dataModule && dataTool) selectors.push(`${tagName}[data-module="${this._cssAttributeValue(dataModule)}"][data-tool="${this._cssAttributeValue(dataTool)}"]`);
        if (dataModule && dataAction) selectors.push(`${tagName}[data-module="${this._cssAttributeValue(dataModule)}"][data-action="${this._cssAttributeValue(dataAction)}"]`);

        for (const attribute of ICON_SELECTION_EXACT_ATTRIBUTES) {
            const value = this._getElementAttribute(element, attribute);
            if (!value) continue;
            selectors.push(`${tagName}[${attribute}="${this._cssAttributeValue(value)}"]`);
            selectors.push(`[${attribute}="${this._cssAttributeValue(value)}"]`);
        }

        return [...new Set(selectors)];
    }

    _buildIconSelectionClassSelector(element) {
        const usefulClasses = Array.from(element?.classList || [])
            .filter(className => ![
                'active',
                'disabled',
                'hidden',
                'hover',
                'selected',
                'ui-control',
                'control-tool',
                'scene-control',
                'control-icon',
                ICON_SELECTION_HIGHLIGHT_CLASS
            ].includes(className))
            .filter(className => /^[a-z0-9_-]+$/i.test(className))
            .slice(0, 3);

        if (!usefulClasses.length) return null;
        return `${element.localName}${usefulClasses.map(className => `.${this._cssIdentifier(className)}`).join('')}`;
    }

    _buildIconSelectionNthPath(element, rootElement) {
        if (!element || element === rootElement) return element?.localName || null;

        const parts = [];
        let current = element;
        while (current && current !== rootElement && current.localName) {
            parts.unshift(`${current.localName}:nth-of-type(${this._getElementIndexOfType(current)})`);
            current = current.parentElement;
        }
        return parts.join(' > ') || null;
    }

    _getElementIndexOfType(element) {
        let index = 1;
        let sibling = element.previousElementSibling;
        while (sibling) {
            if (sibling.localName === element.localName) index += 1;
            sibling = sibling.previousElementSibling;
        }
        return index;
    }

    _selectorMatchesElement(root, selector, element) {
        if (!root?.querySelectorAll || !selector || !element) return false;
        try {
            return Array.from(root.querySelectorAll(selector)).includes(element);
        } catch (_error) {
            return false;
        }
    }

    _selectorMatchesOnlyElement(root, selector, element) {
        if (!root?.querySelectorAll || !selector || !element) return false;
        try {
            const matches = Array.from(root.querySelectorAll(selector));
            return matches.length === 1 && matches[0] === element;
        } catch (_error) {
            return false;
        }
    }

    _getElementAttribute(element, attribute) {
        if (!element?.getAttribute) return null;
        const value = element.getAttribute(attribute);
        return typeof value === 'string' && value.trim() ? value.trim() : null;
    }

    _slugifyIconSelectionValue(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    _hashIconSelectionValue(value) {
        let hash = 0;
        const input = String(value || '');
        for (let index = 0; index < input.length; index += 1) {
            hash = ((hash << 5) - hash) + input.charCodeAt(index);
            hash |= 0;
        }
        return Math.abs(hash).toString(36);
    }

    _prependUniqueSelectors(existingSelectors = [], selectorsToPrepend = []) {
        return [...new Set([
            ...selectorsToPrepend.filter(selector => typeof selector === 'string' && selector.trim()),
            ...(existingSelectors || []).filter(selector => typeof selector === 'string' && selector.trim())
        ])];
    }

    _suppressIconSelectionEvent(event) {
        event.preventDefault?.();
        event.stopPropagation?.();
        event.stopImmediatePropagation?.();
    }

    _clearIconSelectionHighlight() {
        const highlighted = this._iconSelectionState.highlightedElement;
        highlighted?.classList?.remove(ICON_SELECTION_HIGHLIGHT_CLASS);
        this._iconSelectionState.highlightedElement = null;
    }

    getConfig() {
        const config = game.settings.get(MODULE_ID, 'sharedFoundryCustomization');
        return this._sanitizeConfig(config);
    }

    getWorldProfileV2() {
        return game.settings.get(MODULE_ID, WORLD_PROFILE_V2_SETTING) || null;
    }

    getEffectiveConfig() {
        const config = this.getConfig();
        if (!this.isFeatureEnabled()) {
            const disabled = foundry.utils.deepClone(config);
            disabled.enabled = false;
            return disabled;
        }

        if (this.canEditConfig() || this.shouldShareWithPlayers()) {
            return config;
        }

        const disabled = foundry.utils.deepClone(config);
        disabled.enabled = false;
        return disabled;
    }

    async saveConfig(config) {
        if (!this.canEditConfig()) {
            throw new Error('Only the GM can save Foundry customization.');
        }

        const sanitized = this._sanitizeConfig(config);
        await game.settings.set(MODULE_ID, 'sharedFoundryCustomization', sanitized);
        await game.settings.set(MODULE_ID, 'foundryCustomization', foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION));
        await this._saveWorldProfileV2(sanitized);
        this.commitPreview(sanitized);
        this.refreshFromSettings();
        return sanitized;
    }

    async resetConfig({ restoreStock = true } = {}) {
        if (!this.canEditConfig()) {
            throw new Error('Only the GM can reset Foundry customization.');
        }

        const defaults = foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION);
        if (restoreStock) defaults.fieldOverrides = {};
        defaults.enabled = restoreStock ? false : Boolean(this.getConfig()?.enabled);
        return this.saveConfig(defaults);
    }

    refreshFromSettings() {
        const effectiveConfig = this.getEffectiveConfig();
        if (this._previewState.active) {
            this._previewState.restoreConfig = foundry.utils.deepClone(effectiveConfig);
            return;
        }

        this.applyConfig(effectiveConfig);
    }

    applyConfig(config) {
        const sanitized = this._sanitizeConfig(config);
        this._lastAppliedConfig = foundry.utils.deepClone(sanitized);

        if (!this._previewState.active) {
            this._ensureStyleElement();
            this._styleElement.disabled = false;
        }

        if (!this.isFeatureEnabled() || !sanitized.enabled) {
            this.clearCustomization();
            return;
        }

        this._ensureStyleElement();
        this._styleElement.textContent = this._buildCss(sanitized);
        document.body.classList.add('yf-foundry-customized');
        this._syncSidebarExpandedClass();
        this._applyComponentTransforms(sanitized);
        this._applyPauseCustomization(sanitized);
        this._applyIconClassOverrides(sanitized);
        this._applyIconStyleOverrides(sanitized);

        if (this._arrangeState.active) {
            this.refreshArrangeMode();
        }
    }

    applyPreviewConfig(config, { forceFeatureEnabled = false } = {}) {
        const sanitized = this._sanitizeConfig(config);
        this._beginPreviewSandbox();
        this._previewState.forceFeatureEnabled = Boolean(forceFeatureEnabled);
        this._previewState.config = foundry.utils.deepClone(sanitized);

        if (!this._isFeatureEnabledForDom() || !sanitized.enabled) {
            this._clearPreviewApplication();
            return sanitized;
        }

        this._ensurePreviewStyleElement();
        this._previewStyleElement.textContent = this._buildCss(sanitized);
        document.body.classList.add('yf-foundry-customized');
        this._syncSidebarExpandedClass();
        this._applyComponentTransforms(sanitized);
        this._applyPauseCustomization(sanitized);
        this._applyIconClassOverrides(sanitized);
        this._applyIconStyleOverrides(sanitized);

        if (this._arrangeState.active) {
            this.refreshArrangeMode();
        }

        return sanitized;
    }

    clearPreview() {
        if (!this._previewState.active) return;

        const restoreConfig = foundry.utils.deepClone(
            this._previewState.restoreConfig || this.getEffectiveConfig()
        );
        this._endPreviewSandbox();
        this.applyConfig(restoreConfig);
    }

    commitPreview(config = null) {
        if (!this._previewState.active) return;

        const nextConfig = config
            ? this._sanitizeConfig(config)
            : foundry.utils.deepClone(this._previewState.config);
        this._endPreviewSandbox();
        if (nextConfig) this.applyConfig(nextConfig);
    }

    isPreviewActive() {
        return this._previewState.active;
    }

    clearCustomization() {
        this._removePreviewStyleElement();
        this._previewState.active = false;
        this._previewState.config = null;
        this._previewState.restoreConfig = null;
        this._previewState.mainStyleWasDisabled = false;
        this._previewState.forceFeatureEnabled = false;
        this._ensureStyleElement();
        this._styleElement.disabled = false;
        this._styleElement.textContent = '';
        document.body.classList.remove('yf-foundry-customized');
        this._clearComponentTransforms();
        this._clearPauseCustomization();
        this._clearIconClassOverrides();
        this._clearIconStyleOverrides();
        document.querySelector('#sidebar')?.classList.remove('yf-sidebar-expanded');

        if (this._arrangeState.active) {
            this.disableArrangeMode();
        }
        this.disableIconSelectionMode();
    }

    clearRuntimeState() {
        window.clearTimeout(this._refreshTimeout);
        this._refreshTimeout = null;
        this.clearCustomization();
        this._lastAppliedConfig = foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION);
        this._cssAreaEnabled = null;
        this._naturalRects.clear();
        this._dynamicIconTargets.clear();
        this._lastIconOverrideDiagnostics = [];
        this._clearDynamicIconTargetMarkers();
    }

    async handleFeatureToggle(enabled) {
        if (!enabled) {
            this.clearCustomization();
        } else {
            this.refreshFromSettings();
        }

        await this.syncWorldProfileV2();
    }

    async syncWorldProfileV2() {
        if (!this.canEditConfig()) return null;
        return this._saveWorldProfileV2(this.getConfig());
    }

    /* -------------------------------------------- */
    /*  Transform-based Positioning                  */
    /* -------------------------------------------- */

    _measureNaturalRect(component) {
        const cached = this._naturalRects.get(component.id);
        if (cached) return cached;

        const target = this._getComponentTargets(component)[0];
        if (!target) return null;

        const rect = component.id === 'hotbar'
            ? this._measureHotbarNaturalRect(target)
            : this._measureElementWithoutInlineTransform(target);

        const natural = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
        this._naturalRects.set(component.id, natural);
        return natural;
    }

    _getComponentTargets(component) {
        if (!component?.selector || !globalThis.document?.querySelectorAll) return [];
        return Array.from(document.querySelectorAll(component.selector));
    }

    _measureElementWithoutInlineTransform(target) {
        const prevTransform = target.style.transform;
        target.style.transform = 'none';
        const rect = target.getBoundingClientRect();
        target.style.transform = prevTransform;
        return rect;
    }

    _measureHotbarNaturalRect(target) {
        const saved = this._captureInlineStyleProperties(target, [
            '--yf-hotbar-native-offset',
            '--yf-hotbar-tx',
            '--yf-hotbar-ty',
            '--yf-hotbar-scale',
            'transform'
        ]);

        target.style.setProperty('--yf-hotbar-native-offset', '0px');
        target.style.setProperty('--yf-hotbar-tx', '0px');
        target.style.setProperty('--yf-hotbar-ty', '0px');
        target.style.setProperty('--yf-hotbar-scale', '1');
        target.style.setProperty('transform', 'none', 'important');

        const rect = target.getBoundingClientRect();
        this._restoreInlineStyleProperties(target, saved);
        return rect;
    }

    _captureInlineStyleProperties(target, properties) {
        return properties.map(property => ({
            property,
            value: target.style.getPropertyValue(property),
            priority: target.style.getPropertyPriority(property)
        }));
    }

    _restoreInlineStyleProperties(target, entries) {
        for (const { property, value, priority } of entries) {
            if (value) {
                target.style.setProperty(property, value, priority);
            } else {
                target.style.removeProperty(property);
            }
        }
    }

    _applyComponentTransforms(config) {
        const categories = config.categories || {};
        const granularFields = this._usesGranularFieldOverrides(config);
        const layoutEnabled = categories.layout !== false
            && (!granularFields || this._hasFieldOverridePrefix(config, 'layout.'));
        const hotbarLayoutEnabled = categories.layout !== false
            && (!granularFields
                || this._hasFieldOverridePrefix(config, 'layout.hotbar.')
                || this._hasFieldOverride(config, 'hotbar.anchor')
                || this._hasFieldOverride(config, 'hotbar.offsetX')
                || this._hasFieldOverride(config, 'hotbar.offsetY'));

        for (const component of FOUNDRY_UI_COMPONENTS) {
            if (component.id === 'pause') continue;
            const targets = this._getComponentTargets(component);
            const target = targets[0] ?? null;
            if (!target) continue;

            if (!this._isAreaEnabled(config, component.id)) {
                for (const element of targets) {
                    this._clearComponentTransform(component, element);
                }
                continue;
            }

            const layout = config.layout?.[component.id] || {};
            const hasPosition = layoutEnabled && (Number.isFinite(layout?.x) || Number.isFinite(layout?.y));
            const hasScale = layoutEnabled && Number.isFinite(layout?.scale) && layout.scale !== 100;

            if (component.id === 'hotbar') {
                this._applyHotbarTransform(target, component, layout, config.hotbar, {
                    hasPosition: false,
                    hasScale: hotbarLayoutEnabled && Number.isFinite(layout?.scale) && layout.scale !== 100,
                    layoutEnabled: hotbarLayoutEnabled
                });
                continue;
            }

            // Sidebar uses CSS custom properties instead of inline transform
            // so that CSS .yf-sidebar-expanded guards can control it properly.
            if (component.id === 'sidebar') {
                this._applySidebarTransform(target, layout, hasPosition, false);
                continue;
            }

            if (!hasPosition && !hasScale) {
                for (const element of targets) {
                    element.style.transform = '';
                    element.style.transformOrigin = '';
                }
                continue;
            }

            const parts = [];

            if (hasPosition) {
                const natural = this._measureNaturalRect(component);
                if (natural) {
                    const dx = (layout.x ?? natural.left) - natural.left;
                    const dy = (layout.y ?? natural.top) - natural.top;
                    if (dx !== 0 || dy !== 0) {
                        parts.push(`translate(${Math.round(dx)}px, ${Math.round(dy)}px)`);
                    }
                }
            }

            if (hasScale) {
                const scale = this._clamp(layout.scale, 60, 160) / 100;
                parts.push(`scale(${scale})`);
            }

            for (const element of targets) {
                element.style.transform = parts.length ? parts.join(' ') : '';
                element.style.transformOrigin = parts.length ? 'top left' : '';
            }
        }
    }

    _applyHotbarTransform(target, component, layout = {}, hotbarConfig = {}, {
        hasPosition = false,
        hasScale = false,
        layoutEnabled = true
    } = {}) {
        target.style.transform = '';
        target.style.transformOrigin = '';

        if (!layoutEnabled) {
            this._clearHotbarTransform(target);
            return;
        }

        const hotbar = normalizeHotbarConfig(hotbarConfig);
        this._naturalRects.delete(component.id);
        const natural = this._measureNaturalRect(component);
        if (!natural) {
            this._clearHotbarTransform(target);
            return;
        }

        const scale = hasScale ? this._clamp(layout.scale, 60, 160) / 100 : 1;
        const targetRect = this._getHotbarTargetRect(hotbar, natural, scale);
        const x = hasPosition ? (layout.x ?? natural.left) : targetRect.left;
        const y = hasPosition ? (layout.y ?? natural.top) : targetRect.top;
        const dx = Math.round(x - natural.left);
        const dy = Math.round(y - natural.top);

        target.style.setProperty('--yf-hotbar-tx', `${dx}px`);
        target.style.setProperty('--yf-hotbar-ty', `${dy}px`);
        target.style.setProperty('--yf-hotbar-scale', String(scale));
    }

    _clearHotbarTransform(target) {
        target.style.removeProperty('--yf-hotbar-tx');
        target.style.removeProperty('--yf-hotbar-ty');
        target.style.removeProperty('--yf-hotbar-scale');
    }

    _getHotbarTargetRect(hotbar, natural, scale = 1) {
        const viewportWidth = globalThis.innerWidth || 1920;
        const viewportHeight = globalThis.innerHeight || 1080;
        const edgeOffset = Math.max(0, hotbar.offsetX);
        const bottom = this._clamp(hotbar.offsetY, 0, 220);
        let left = Math.round((viewportWidth - natural.width) / 2 + hotbar.offsetX);

        if (hotbar.anchor === 'bottom-left') {
            left = Math.round(edgeOffset - (natural.width * (1 - scale) / 2));
        } else if (hotbar.anchor === 'bottom-right') {
            left = Math.round(viewportWidth - edgeOffset - (natural.width * (1 + scale) / 2));
        }

        return {
            left,
            top: Math.round(viewportHeight - natural.height - bottom)
        };
    }

    /**
     * Sidebar gets CSS custom properties instead of inline transform.
     * The actual transform is applied via a CSS rule with .yf-sidebar-expanded,
     * so Foundry's native collapse animation keeps working.
     */
    _applySidebarTransform(target, layout, hasPosition, hasScale) {
        if (!hasPosition && !hasScale) {
            target.style.removeProperty('--yf-sidebar-tx');
            target.style.removeProperty('--yf-sidebar-ty');
            target.style.removeProperty('--yf-sidebar-scale');
            return;
        }

        if (hasPosition) {
            const sidebarComp = FOUNDRY_UI_COMPONENTS.find(c => c.id === 'sidebar');
            const natural = this._measureNaturalRect(sidebarComp);
            if (natural) {
                const dx = (layout.x ?? natural.left) - natural.left;
                const dy = (layout.y ?? natural.top) - natural.top;
                target.style.setProperty('--yf-sidebar-tx', `${Math.round(dx)}px`);
                target.style.setProperty('--yf-sidebar-ty', `${Math.round(dy)}px`);
            }
        } else {
            target.style.removeProperty('--yf-sidebar-tx');
            target.style.removeProperty('--yf-sidebar-ty');
        }

        if (hasScale) {
            const scale = this._clamp(layout.scale, 60, 160) / 100;
            target.style.setProperty('--yf-sidebar-scale', `${scale}`);
        } else {
            target.style.removeProperty('--yf-sidebar-scale');
        }
    }

    _clearComponentTransforms() {
        for (const component of FOUNDRY_UI_COMPONENTS) {
            if (component.id === 'pause') continue;
            for (const target of this._getComponentTargets(component)) {
                this._clearComponentTransform(component, target);
            }
        }
        this._naturalRects.clear();
    }

    _clearComponentTransform(component, target = document.querySelector(component.selector)) {
        if (!target) return;

        if (component.id === 'sidebar') {
            target.style.removeProperty('--yf-sidebar-tx');
            target.style.removeProperty('--yf-sidebar-ty');
            target.style.removeProperty('--yf-sidebar-scale');
        } else if (component.id === 'hotbar') {
            this._clearHotbarTransform(target);
            target.style.transform = '';
            target.style.transformOrigin = '';
        } else {
            target.style.transform = '';
            target.style.transformOrigin = '';
        }
    }

    /**
     * When the sidebar collapses/expands, toggle our own marker class
     * and manage the CSS custom properties. We use our own class (.yf-sidebar-expanded)
     * instead of relying on Foundry's internal classes which may vary by version.
     */
    _onSidebarCollapse(collapsed) {
        const sidebar = document.querySelector('#sidebar');
        if (!sidebar) return;

        const activeConfig = this._getActiveDomConfig();
        if (!this._isFeatureEnabledForDom() || !activeConfig?.enabled) {
            sidebar.classList.remove('yf-sidebar-expanded');
            sidebar.style.removeProperty('--yf-sidebar-tx');
            sidebar.style.removeProperty('--yf-sidebar-ty');
            sidebar.style.removeProperty('--yf-sidebar-scale');
            this._removeArrangeHandle('sidebar');
            return;
        }

        if (collapsed) {
            this._syncSidebarExpandedClass(false);
            // Clear custom properties so no transform lingers
            sidebar.style.removeProperty('--yf-sidebar-tx');
            sidebar.style.removeProperty('--yf-sidebar-ty');
            sidebar.style.removeProperty('--yf-sidebar-scale');
            this._removeArrangeHandle('sidebar');
        } else {
            this._syncSidebarExpandedClass(true);
            // Re-measure and reapply after expansion animation
            this._naturalRects.delete('sidebar');
            requestAnimationFrame(() => {
                this._naturalRects.delete('sidebar');
                const currentConfig = this._getActiveDomConfig();
                if (currentConfig) {
                    this._applyComponentTransforms(currentConfig);
                }
                if (this._arrangeState.active) {
                    this.refreshArrangeMode();
                }
            });
        }
    }

    /* -------------------------------------------- */
    /*  Arrange Mode                                 */
    /* -------------------------------------------- */

    enableArrangeMode(config, onChange) {
        if (!this.canEditConfig() || !this._isFeatureEnabledForDom() || !config?.enabled) return false;

        this.disableArrangeMode();

        this._arrangeState.active = true;
        this._arrangeState.config = config;
        this._arrangeState.onChange = onChange;

        document.body.classList.add('yf-arrange-mode');
        document.addEventListener('pointermove', this._boundPointerMove);
        document.addEventListener('pointerup', this._boundPointerUp);

        this.refreshArrangeMode();
        ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.ArrangeModeEnabled'));
        return true;
    }

    updateArrangeModeConfig(config) {
        if (!this._arrangeState.active || !config) return;
        this._arrangeState.config = config;
    }

    captureArrangeModeConfig(config) {
        if (!config) return null;

        this._captureHotbarArrangeConfig(config);
        return config;
    }

    disableArrangeMode() {
        document.body.classList.remove('yf-arrange-mode');
        document.removeEventListener('pointermove', this._boundPointerMove);
        document.removeEventListener('pointerup', this._boundPointerUp);

        for (const handle of this._arrangeState.handles.values()) {
            handle.remove();
        }

        this._arrangeState.handles.clear();
        this._arrangeState.active = false;
        this._arrangeState.config = null;
        this._arrangeState.onChange = null;
        this._arrangeState.drag = null;
    }

    refreshArrangeMode() {
        if (!this._arrangeState.active || !this._arrangeState.config?.enabled) return;

        for (const component of FOUNDRY_UI_COMPONENTS) {
            if (component.id === 'pause') continue;

            const target = document.querySelector(component.selector);
            const visible = target
                && getComputedStyle(target).display !== 'none'
                && (component.id !== 'sidebar' || this._isSidebarExpanded());

            if (!target || !visible) {
                this._removeArrangeHandle(component.id);
                continue;
            }

            let handle = this._arrangeState.handles.get(component.id);
            if (!handle) {
                handle = this._createArrangeHandle(component);
                this._arrangeState.handles.set(component.id, handle);
                document.body.appendChild(handle);
            }

            this._positionArrangeHandle(handle, target);
        }
    }

    _createArrangeHandle(component) {
        const handle = document.createElement('div');
        handle.className = ARRANGE_HANDLE_CLASS;
        handle.dataset.component = component.id;

        const label = document.createElement('span');
        label.className = 'yf-arrange-label';
        label.textContent = game.i18n.localize(`YOUR_FLAVOR.Foundry.Components.${component.id}`);
        handle.appendChild(label);

        if (component.resize) {
            const resize = document.createElement('button');
            resize.type = 'button';
            resize.className = 'yf-arrange-resize';
            resize.dataset.component = component.id;
            resize.dataset.mode = 'resize';
            resize.title = game.i18n.localize('YOUR_FLAVOR.Config.Foundry.ArrangeResize');
            resize.innerHTML = '<i class="fas fa-up-right-and-down-left-from-center"></i>';
            handle.appendChild(resize);
        }

        handle.addEventListener('pointerdown', (event) => this._onArrangePointerDown(event, component));
        return handle;
    }

    _removeArrangeHandle(componentId) {
        const handle = this._arrangeState.handles.get(componentId);
        if (!handle) return;
        handle.remove();
        this._arrangeState.handles.delete(componentId);
    }

    _positionArrangeHandle(handle, target) {
        const rect = target.getBoundingClientRect();
        handle.style.left = `${Math.round(rect.left)}px`;
        handle.style.top = `${Math.round(rect.top)}px`;
        handle.style.width = `${Math.round(rect.width)}px`;
        handle.style.height = `${Math.round(rect.height)}px`;
    }

    _onArrangePointerDown(event, component) {
        event.preventDefault();
        event.stopPropagation();

        const target = document.querySelector(component.selector);
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const mode = event.target.closest('.yf-arrange-resize') ? 'resize' : 'move';

        this._arrangeState.drag = {
            component,
            mode,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startRect: rect,
            startHotbar: component.id === 'hotbar'
                ? normalizeHotbarConfig(this._arrangeState.config?.hotbar)
                : null
        };
    }

    _onArrangePointerMove(event) {
        const drag = this._arrangeState.drag;
        if (!drag) return;
        event.preventDefault();

        const dx = event.clientX - drag.startClientX;
        const dy = event.clientY - drag.startClientY;
        const componentId = drag.component.id;
        const layout = this._getComponentLayout(this._arrangeState.config, drag.component);

        if (drag.mode === 'move') {
            if (componentId === 'hotbar') {
                this._applyHotbarArrangeMove(drag, dx, dy, layout);
            } else {
                layout.x = Math.round(drag.startRect.left + dx);
                layout.y = Math.round(drag.startRect.top + dy);
            }
            this._naturalRects.delete(componentId);
        } else {
            if (drag.component.resize === 'width' || drag.component.resize === 'both') {
                const nextWidth = drag.startRect.width + dx;
                layout.width = this._clamp(
                    nextWidth,
                    drag.component.minWidth ?? 120,
                    this._getLayoutMaxWidth(drag.component)
                );
            }

            if (drag.component.resize === 'both') {
                const nextHeight = drag.startRect.height + dy;
                layout.height = this._clamp(
                    nextHeight,
                    drag.component.minHeight ?? 160,
                    this._getLayoutMaxHeight(drag.component)
                );
            }
        }

        this._applyActiveConfig(this._arrangeState.config);
        this._arrangeState.onChange?.(componentId);
    }

    _applyHotbarArrangeMove(drag, dx, dy, layout) {
        const target = document.querySelector(drag.component.selector);
        const nativeOffset = this._getHotbarNativeOffset(target);
        const desiredRect = {
            left: drag.startRect.left + dx - nativeOffset,
            top: drag.startRect.top + dy,
            width: drag.startRect.width,
            height: drag.startRect.height
        };
        const preferredAnchor = drag.startHotbar?.anchor || this._arrangeState.config?.hotbar?.anchor || 'bottom-center';
        const nextHotbar = this._getHotbarConfigForVisualRect(desiredRect, preferredAnchor);

        this._arrangeState.config.hotbar = normalizeHotbarConfig({
            ...(this._arrangeState.config.hotbar || {}),
            ...nextHotbar
        });

        layout.x = null;
        layout.y = null;
    }

    _captureHotbarArrangeConfig(config) {
        config.layout ||= {};
        config.layout.hotbar ||= {};
        config.layout.hotbar.x = null;
        config.layout.hotbar.y = null;

        const target = document.querySelector('#hotbar');
        if (!target) {
            config.hotbar = normalizeHotbarConfig(config.hotbar);
            return;
        }

        const rect = target.getBoundingClientRect();
        if (!Number.isFinite(rect.left) || !Number.isFinite(rect.width) || rect.width <= 0) {
            config.hotbar = normalizeHotbarConfig(config.hotbar);
            return;
        }

        const nativeOffset = this._getHotbarNativeOffset(target);
        const preferredAnchor = config.hotbar?.anchor || 'bottom-center';
        const capturedRect = {
            left: rect.left - nativeOffset,
            top: rect.top,
            width: rect.width,
            height: rect.height
        };
        const nextHotbar = this._getHotbarConfigForVisualRect(capturedRect, preferredAnchor);

        config.hotbar = normalizeHotbarConfig({
            ...(config.hotbar || {}),
            ...nextHotbar
        });
        config.areas ||= {};
        config.areas.hotbar ||= {};
        config.areas.hotbar.hotbar = foundry.utils.deepClone(config.hotbar);
        this._naturalRects.delete('hotbar');
    }

    _getHotbarNativeOffset(target = document.querySelector('#hotbar')) {
        if (!target) return 0;
        if (target.classList.contains('min')) return -70;
        if (!target.classList.contains('offset') || target.classList.contains('lg')) return 0;

        const offset = Number.parseFloat(getComputedStyle(target).getPropertyValue('--offset'));
        return Number.isFinite(offset) ? offset : 0;
    }

    _getHotbarConfigForVisualRect(rect, preferredAnchor = 'bottom-center') {
        const viewportWidth = globalThis.innerWidth || 1920;
        const viewportHeight = globalThis.innerHeight || 1080;
        const offsetY = this._clamp(
            Math.round(viewportHeight - (rect.top + rect.height)),
            0,
            220
        );
        const anchors = ['bottom-center', 'bottom-left', 'bottom-right'];
        const candidates = anchors.map(anchor => {
            const offsetX = this._getHotbarOffsetXForVisualRect(rect, anchor, viewportWidth);
            const normalized = normalizeHotbarConfig({ anchor, offsetX, offsetY });
            const targetRect = this._getHotbarVisualRectFromConfig(normalized, rect);
            const error = Math.abs(targetRect.left - rect.left) + Math.abs(targetRect.top - rect.top);

            return {
                hotbar: normalized,
                error: anchor === preferredAnchor ? error - 0.25 : error
            };
        });

        candidates.sort((a, b) => a.error - b.error);
        return {
            anchor: candidates[0].hotbar.anchor,
            offsetX: candidates[0].hotbar.offsetX,
            offsetY: candidates[0].hotbar.offsetY
        };
    }

    _getHotbarOffsetXForVisualRect(rect, anchor, viewportWidth) {
        if (anchor === 'bottom-left') return Math.round(rect.left);
        if (anchor === 'bottom-right') return Math.round(viewportWidth - (rect.left + rect.width));
        return Math.round(rect.left + (rect.width / 2) - (viewportWidth / 2));
    }

    _getHotbarVisualRectFromConfig(hotbar, rect) {
        const viewportWidth = globalThis.innerWidth || 1920;
        const viewportHeight = globalThis.innerHeight || 1080;
        const width = rect.width;
        const height = rect.height;
        const edgeOffset = Math.max(0, hotbar.offsetX);
        let left = Math.round((viewportWidth - width) / 2 + hotbar.offsetX);

        if (hotbar.anchor === 'bottom-left') {
            left = edgeOffset;
        } else if (hotbar.anchor === 'bottom-right') {
            left = Math.round(viewportWidth - width - edgeOffset);
        }

        return {
            left,
            top: Math.round(viewportHeight - height - hotbar.offsetY)
        };
    }

    _onArrangePointerUp() {
        this._arrangeState.drag = null;
    }

    /* -------------------------------------------- */
    /*  Internal Helpers                              */
    /* -------------------------------------------- */

    _scheduleRefresh() {
        window.clearTimeout(this._refreshTimeout);
        this._refreshTimeout = window.setTimeout(() => {
            const activeConfig = this._getActiveDomConfig();
            if (this._isFeatureEnabledForDom() && activeConfig?.enabled) {
                this._syncSidebarExpandedClass();
                this._applyComponentTransforms(activeConfig);
                this._applyPauseCustomization(activeConfig);
                this._applyIconClassOverrides(activeConfig);
                this._applyIconStyleOverrides(activeConfig);
            } else {
                this._clearComponentTransforms();
                this._clearPauseCustomization();
                this._clearIconClassOverrides();
                this._clearIconStyleOverrides();
                document.querySelector('#sidebar')?.classList.remove('yf-sidebar-expanded');
            }

            if (this._arrangeState.active) {
                this.refreshArrangeMode();
            }
        }, 0);
    }

    _ensureStyleElement() {
        this._styleElement = document.getElementById(STYLE_ELEMENT_ID);
        if (this._styleElement) return;

        this._styleElement = document.createElement('style');
        this._styleElement.id = STYLE_ELEMENT_ID;
        document.head.appendChild(this._styleElement);
    }

    _ensurePreviewStyleElement() {
        this._previewStyleElement = document.getElementById(PREVIEW_STYLE_ELEMENT_ID);
        if (this._previewStyleElement) return;

        this._previewStyleElement = document.createElement('style');
        this._previewStyleElement.id = PREVIEW_STYLE_ELEMENT_ID;
        document.head.appendChild(this._previewStyleElement);
    }

    _removePreviewStyleElement() {
        const previewStyleElement = document.getElementById(PREVIEW_STYLE_ELEMENT_ID);
        previewStyleElement?.remove();
        this._previewStyleElement = null;
    }

    _beginPreviewSandbox() {
        if (this._previewState.active) return;

        this._ensureStyleElement();
        this._previewState.active = true;
        this._previewState.restoreConfig = foundry.utils.deepClone(this._lastAppliedConfig);
        this._previewState.mainStyleWasDisabled = Boolean(this._styleElement.disabled);
        this._styleElement.disabled = true;
        this._ensurePreviewStyleElement();
    }

    _endPreviewSandbox() {
        const mainStyleWasDisabled = this._previewState.mainStyleWasDisabled;
        this._removePreviewStyleElement();

        this._ensureStyleElement();
        this._styleElement.disabled = mainStyleWasDisabled;

        this._previewState.active = false;
        this._previewState.config = null;
        this._previewState.restoreConfig = null;
        this._previewState.mainStyleWasDisabled = false;
        this._previewState.forceFeatureEnabled = false;
    }

    _clearPreviewApplication() {
        this._ensurePreviewStyleElement();
        this._previewStyleElement.textContent = '';
        document.body.classList.remove('yf-foundry-customized');
        this._clearComponentTransforms();
        this._clearPauseCustomization();
        this._clearIconClassOverrides();
        this._clearIconStyleOverrides();
        document.querySelector('#sidebar')?.classList.remove('yf-sidebar-expanded');

        if (this._arrangeState.active) {
            this.disableArrangeMode();
        }
        this.disableIconSelectionMode();
    }

    _clearDynamicIconTargetMarkers() {
        document.querySelectorAll?.(`[${ICON_SELECTION_TARGET_ATTRIBUTE}]`)
            .forEach(element => element.removeAttribute(ICON_SELECTION_TARGET_ATTRIBUTE));
        document.querySelectorAll?.(`.${ICON_SELECTION_HIGHLIGHT_CLASS}`)
            .forEach(element => element.classList.remove(ICON_SELECTION_HIGHLIGHT_CLASS));
        this._iconSelectionState.highlightedElement = null;
    }

    _getActiveDomConfig() {
        return this._previewState.active
            ? this._previewState.config
            : this._lastAppliedConfig;
    }

    _applyActiveConfig(config) {
        if (this._previewState.active) {
            this.applyPreviewConfig(config, {
                forceFeatureEnabled: this._previewState.forceFeatureEnabled || config?.enabled !== false
            });
            return;
        }

        this.applyConfig(config);
    }

    _getComponentLayout(config, component) {
        config.layout ||= {};
        if (!config.layout[component.id]) {
            config.layout[component.id] = foundry.utils.deepClone(
                DEFAULT_FOUNDRY_CUSTOMIZATION.layout[component.id] || {}
            );
        }
        return config.layout[component.id];
    }

    _isSidebarExpanded() {
        const expanded = globalThis.ui?.sidebar?.expanded;
        return typeof expanded === 'boolean' ? expanded : true;
    }

    _syncSidebarExpandedClass(expanded = this._isSidebarExpanded()) {
        const sidebar = document.querySelector('#sidebar');
        if (!sidebar) return;
        sidebar.classList.toggle('yf-sidebar-expanded', expanded !== false);
    }

    _isAreaEnabled(config, areaId) {
        const normalizedAreaId = this._normalizeAreaId(areaId);
        return config?.areaEnabled?.[normalizedAreaId] !== false;
    }

    _buildAreaEnabledMap(config) {
        const defaults = DEFAULT_FOUNDRY_CUSTOMIZATION.areaEnabled || {};
        const source = config?.areaEnabled || {};
        return new Map(
            Object.keys({ ...defaults, ...source }).map(areaId => [
                this._normalizeAreaId(areaId),
                source[areaId] ?? defaults[areaId] ?? true
            ])
        );
    }

    _normalizeAreaId(areaId) {
        switch (areaId) {
            case 'controlTools': return 'controls';
            case 'sidebarPanels': return 'sidebar';
            case 'windowHeaders': return 'windows';
            default: return areaId;
        }
    }

    _inspectSelectorArea(areaId, selectors = [], root = globalThis.document) {
        const selectorResults = selectors.map(selector => this._inspectSelector(selector, root));
        const targetCount = selectorResults.reduce((total, result) => total + result.count, 0);
        const matchedSelectors = selectorResults.filter(result => result.present).length;
        const invalidSelectors = selectorResults.filter(result => result.invalid).length;
        const present = targetCount > 0;

        return {
            id: areaId,
            labelKey: FOUNDRY_SELECTOR_HEALTH_LABELS[areaId] || 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.Unknown',
            present,
            status: invalidSelectors === selectors.length ? 'invalid' : present ? 'found' : 'missing',
            targetCount,
            matchedSelectors,
            selectorCount: selectors.length,
            invalidSelectors,
            selectors: selectorResults
        };
    }

    _inspectSelector(selector, root = globalThis.document) {
        if (!root?.querySelectorAll) {
            return {
                selector,
                count: 0,
                present: false,
                invalid: false,
                error: null
            };
        }

        try {
            const count = root.querySelectorAll(selector).length;
            return {
                selector,
                count,
                present: count > 0,
                invalid: false,
                error: null
            };
        } catch (error) {
            return {
                selector,
                count: 0,
                present: false,
                invalid: true,
                error: error?.message || String(error)
            };
        }
    }

    /* -------------------------------------------- */
    /*  CSS Generation                                */
    /* -------------------------------------------- */

    _scopeSelector(selector) {
        const trimmed = String(selector || '').trim();
        if (!trimmed) return FOUNDRY_STYLE_SCOPE;
        if (trimmed === FOUNDRY_STYLE_SCOPE || trimmed.startsWith(`${FOUNDRY_STYLE_SCOPE} `)) return trimmed;
        if (/^body(?=$|[\s>+~.#[:])/.test(trimmed)) return trimmed.replace(/^body/, FOUNDRY_STYLE_SCOPE);
        if (/^html\s+body(?=$|[\s>+~.#[:])/.test(trimmed)) return trimmed.replace(/^html\s+body/, `html ${FOUNDRY_STYLE_SCOPE}`);
        return `${FOUNDRY_STYLE_SCOPE} ${trimmed}`;
    }

    _scopeSelectors(selectors = []) {
        return selectors
            .filter(Boolean)
            .map(selector => this._scopeSelector(selector))
            .join(',\n');
    }

    _areaSelector(areaIds = [], suffix = '') {
        const selectors = areaIds
            .filter(areaId => this._isCssAreaEnabled(areaId))
            .flatMap(areaId => FOUNDRY_AREA_SELECTORS[areaId] ?? []);
        if (selectors.length === 0) return this._neverSelector();
        return this._scopeSelectors([...new Set(selectors)].map(selector => `${selector}${suffix}`));
    }

    _scopeSelectorsForArea(areaId, selectors = []) {
        return this._isCssAreaEnabled(areaId) ? this._scopeSelectors(selectors) : this._neverSelector();
    }

    _scopeSelectorForArea(areaId, selector) {
        return this._isCssAreaEnabled(areaId) ? this._scopeSelector(selector) : this._neverSelector();
    }

    _neverSelector() {
        return `${FOUNDRY_STYLE_SCOPE} .yf-never-match`;
    }

    _isCssAreaEnabled(areaId) {
        if (!this._cssAreaEnabled) return true;
        const normalizedAreaId = this._normalizeAreaId(areaId);
        return !this._cssAreaEnabled.has(normalizedAreaId) || this._cssAreaEnabled.get(normalizedAreaId) !== false;
    }

    _buildCss(config) {
        const { theme, visibility, layout, pause, categories, componentStyles, sceneNavigation, tokenControls, hotbar, sidebar, chatLog, playersList, windows, customCss } = config;
        const cat = categories || {};
        const previousCssAreaEnabled = this._cssAreaEnabled;
        this._cssAreaEnabled = this._buildAreaEnabledMap(config);
        const granularFields = this._usesGranularFieldOverrides(config);

        const themeEnabled = cat.theme !== false;
        const fontsEnabled = cat.fonts !== false;
        const iconsEnabled = cat.icons !== false;
        const visibilityEnabled = cat.visibility !== false;
        const layoutEnabled = cat.layout !== false;
        const componentsEnabled = cat.components !== false;
        const pauseEnabled = cat.pause !== false;
        const customCssEnabled = cat.customCss !== false;
        const resolvedThemeForCss = this._resolveThemeForCss(theme);
        const themeForCss = themeEnabled
            ? resolvedThemeForCss
            : {
                ...DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
                interfaceFont: theme.interfaceFont,
                windowFont: theme.windowFont
            };

        const sections = [];
        let perIconOverrideCss = '';

        // ── Theme Colors ──
        if (themeEnabled && granularFields) {
            const themeCss = this._buildGranularThemeCss(config);
            if (themeCss) sections.push(themeCss);
        }

        if (themeEnabled && !granularFields) {
            const surfaceBg = this._hexToRgba(theme.surfaceBackground, 0.74);
            const surfaceBgStrong = this._hexToRgba(theme.surfaceBackground, 0.9);
            const windowBg = this._hexToRgba(theme.windowBackground, 0.92);
            const headerBg = this._hexToRgba(theme.windowHeaderBackground, 0.94);
            const accentSoft = this._hexToRgba(theme.accentColor, 0.24);
            const accentMedium = this._hexToRgba(theme.accentColor, 0.52);
            const accentStrong = this._hexToRgba(theme.accentColor, 0.84);
            const chatTint = this._hexToRgba(theme.chatTint, 0.6);
            const fontSecondary = theme.secondaryFontColor;
            const fontSubtle = this._hexToRgba(theme.secondaryFontColor, 0.78);
            const dividerColor = this._hexToRgba(theme.secondaryFontColor, 0.28);
            const scrollbarTrack = this._hexToRgba(theme.surfaceBackground, 0.24);

            sections.push(`
${FOUNDRY_STYLE_SCOPE} {
    --yf-foundry-font-color: ${theme.fontColor};
    --yf-foundry-font-secondary: ${fontSecondary};
    --yf-foundry-font-subtle: ${fontSubtle};
    --yf-foundry-divider-color: ${dividerColor};
    --yf-foundry-surface-bg: ${surfaceBg};
    --yf-foundry-surface-bg-strong: ${surfaceBgStrong};
    --yf-foundry-window-bg: ${windowBg};
    --yf-foundry-window-header-bg: ${headerBg};
    --yf-foundry-accent: ${theme.accentColor};
    --yf-foundry-accent-soft: ${accentSoft};
    --yf-foundry-accent-medium: ${accentMedium};
    --yf-foundry-accent-strong: ${accentStrong};
    --yf-foundry-chat-tint: ${chatTint};
    --yf-foundry-chat-texture: linear-gradient(0deg, var(--yf-foundry-chat-tint), var(--yf-foundry-chat-tint)), url("ui/parchment.jpg");
    --yf-foundry-icon-color: ${theme.iconColor};
    --yf-foundry-icon-hover-color: ${theme.iconHoverColor};
    --yf-foundry-scrollbar-color: ${theme.scrollbarColor};
    --yf-foundry-scrollbar-track: ${scrollbarTrack};
}

${FOUNDRY_STYLE_SCOPE},
${FOUNDRY_STYLE_SCOPE} * {
    scrollbar-width: thin;
    scrollbar-color: var(--yf-foundry-scrollbar-color) var(--yf-foundry-scrollbar-track);
}

${FOUNDRY_STYLE_SCOPE}::-webkit-scrollbar,
${FOUNDRY_STYLE_SCOPE} *::-webkit-scrollbar { width: 10px; height: 10px; }
${FOUNDRY_STYLE_SCOPE}::-webkit-scrollbar-track,
${FOUNDRY_STYLE_SCOPE} *::-webkit-scrollbar-track { background: var(--yf-foundry-scrollbar-track); border-radius: 999px; }
${FOUNDRY_STYLE_SCOPE}::-webkit-scrollbar-thumb,
${FOUNDRY_STYLE_SCOPE} *::-webkit-scrollbar-thumb { background: var(--yf-foundry-scrollbar-color); border: 2px solid transparent; border-radius: 999px; background-clip: padding-box; }
${FOUNDRY_STYLE_SCOPE}::-webkit-scrollbar-thumb:hover,
${FOUNDRY_STYLE_SCOPE} *::-webkit-scrollbar-thumb:hover { background: var(--yf-foundry-icon-hover-color); border: 2px solid transparent; background-clip: padding-box; }

${this._areaSelector(['navigation', 'controls', 'players', 'hotbar', 'sidebar', 'pause', 'windows'])} {
    --color-text-primary: var(--yf-foundry-font-color) !important;
    --color-text-secondary: var(--yf-foundry-font-secondary) !important;
    --color-text-subtle: var(--yf-foundry-font-subtle) !important;
    --color-form-hint: var(--yf-foundry-font-secondary) !important;
    --input-placeholder-color: var(--yf-foundry-font-subtle) !important;
    --placeholder-color: var(--yf-foundry-font-subtle) !important;
    --group-separator: var(--yf-foundry-divider-color) !important;
    color: var(--yf-foundry-font-color);
}

${this._areaSelector(['windows'])} {
    --background: var(--yf-foundry-window-bg) !important;
    --color-header-background: var(--yf-foundry-window-header-bg) !important;
    --color-border: var(--yf-foundry-accent-medium) !important;
    border-color: var(--yf-foundry-accent-medium) !important;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45), 0 0 20px var(--yf-foundry-accent-soft) !important;
}

${this._areaSelector(['windows'], ' .window-header')} {
    color: var(--yf-foundry-font-color) !important;
    border-bottom: 1px solid var(--yf-foundry-accent-medium) !important;
}

${this._areaSelector(['sidebar'])} {
    --sidebar-background: var(--yf-foundry-surface-bg-strong) !important;
    --sidebar-separator: 1px solid var(--yf-foundry-accent-soft) !important;
    --sidebar-entry-hover-bg: var(--yf-foundry-accent-soft) !important;
    --sidebar-folder-color: var(--yf-foundry-window-header-bg) !important;
    --input-background: var(--yf-foundry-surface-bg) !important;
}

${this._areaSelector(['sidebarPanels'])} {
    color: var(--yf-foundry-font-color) !important;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
}

${this._areaSelector(['windows'], ' :is(.hint, .notes, p.hint, p.notes, small.hint, .form-footer, .window-content .hint, .window-content .notes, .window-content .form-description, .window-content .instructions)')} {
    color: var(--yf-foundry-font-secondary) !important;
}

${this._areaSelector(['windows'], ' :is(.caption, .metadata, .subtitle, .document-id, .window-content .editor-note, .window-content .subheader)')} {
    color: var(--yf-foundry-font-subtle) !important;
}

${this._areaSelector(['windows'], ' :is(input, textarea)::placeholder')} { color: var(--yf-foundry-font-subtle) !important; }
${this._areaSelector(['windows'], ' :is(hr, .window-content hr)')} { border-color: var(--yf-foundry-divider-color) !important; }

${this._areaSelector(['navigation', 'controls', 'players', 'hotbar', 'sidebar', 'windowHeaders'], ' :is(i, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin)')} {
    color: var(--yf-foundry-icon-color) !important;
    --fa-primary-color: var(--yf-foundry-icon-color);
    --fa-secondary-color: var(--yf-foundry-font-color);
}

${[
    this._scopeSelectorsForArea('controlTools', [
        '.ui-control:hover :is(i, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin)',
        '.placeable-hud:hover :is(i, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin)',
        '#measurement .waypoint-label:hover :is(i, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin)'
    ]),
    this._scopeSelectorsForArea('windowHeaders', [
        '.application .window-header :is(button.header-control, a.header-control, .header-button):hover :is(i, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin)'
    ]),
    this._scopeSelectorsForArea('hotbar', ['#hotbar button:hover :is(i, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin)']),
    this._scopeSelectorsForArea('players', ['#players button:hover :is(i, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin)'])
].filter(Boolean).join(',\n')} {
    color: var(--yf-foundry-icon-hover-color) !important;
    --fa-primary-color: var(--yf-foundry-icon-hover-color);
}

${[
    this._scopeSelectorsForArea('windowHeaders', ['.application .window-header :is(button.header-control, a.header-control, .header-button)']),
    this._scopeSelectorsForArea('hotbar', ['#hotbar button']),
    this._scopeSelectorsForArea('players', ['#players button'])
].filter(Boolean).join(',\n')} {
    --button-text-color: var(--yf-foundry-icon-color) !important;
    --button-hover-text-color: var(--yf-foundry-icon-hover-color) !important;
    color: var(--yf-foundry-icon-color) !important;
}

${this._areaSelector(['controlTools'])} {
    --control-bg-color: var(--yf-foundry-surface-bg) !important;
    --control-border-color: var(--yf-foundry-accent-soft) !important;
    --control-icon-color: var(--yf-foundry-icon-color) !important;
    --control-hover-bg-color: var(--yf-foundry-surface-bg-strong) !important;
    --control-hover-border-color: var(--yf-foundry-accent-medium) !important;
    --control-hover-icon-color: var(--yf-foundry-icon-hover-color) !important;
    --control-active-bg-color: var(--yf-foundry-window-header-bg) !important;
    --control-active-border-color: var(--yf-foundry-accent-strong) !important;
    --control-active-icon-color: var(--yf-foundry-font-color) !important;
    --control-button-border-color: var(--yf-foundry-accent-medium) !important;
    --control-button-hover-bg-color: var(--yf-foundry-accent-soft) !important;
    --control-button-hover-border-color: var(--yf-foundry-accent-medium) !important;
}

${this._scopeSelectorForArea('navigation', '#scene-navigation .scene-navigation-menu .scene')} {
    background: var(--yf-foundry-surface-bg) !important;
    border: 1px solid var(--yf-foundry-accent-soft) !important;
    color: var(--yf-foundry-font-color) !important;
    backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
}
${this._scopeSelectorForArea('navigation', '#scene-navigation .scene-navigation-menu .scene:is(.active, .view, .gm)')} { box-shadow: inset 0 0 0 1px var(--yf-foundry-accent-medium) !important; }
${this._scopeSelectorForArea('navigation', '#scene-navigation #scene-navigation-expand')} { --button-text-color: var(--yf-foundry-icon-color) !important; --button-hover-text-color: var(--yf-foundry-icon-hover-color) !important; color: var(--yf-foundry-icon-color) !important; }
${this._scopeSelectorForArea('navigation', '#scene-navigation .scene-navigation-menu .scene::after')} { color: var(--yf-foundry-icon-color) !important; }
${this._scopeSelectorForArea('navigation', '#scene-navigation .scene-navigation-menu .scene:hover::after')} { color: var(--yf-foundry-icon-hover-color) !important; }
${this._scopeSelectorForArea('navigation', '#scene-navigation .scene-navigation-menu .scene-players .scene-player')} { background: var(--yf-foundry-surface-bg-strong) !important; border-color: var(--yf-foundry-accent-soft) !important; color: var(--yf-foundry-icon-color) !important; }

${this._areaSelector(['players'])} {
    --background-color: var(--yf-foundry-surface-bg) !important;
    --border-color: var(--yf-foundry-accent-soft) !important;
    --text-color: var(--yf-foundry-font-color) !important;
    --player-name-color: var(--yf-foundry-font-color) !important;
    --player-name-idle-color: var(--yf-foundry-font-subtle) !important;
    --player-name-self-color: var(--yf-foundry-accent) !important;
}
${this._scopeSelectorsForArea('players', ['#players #players-active', '#players #players-inactive'])} { backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }

${this._areaSelector(['hotbar'])} {
    --slot-color: var(--yf-foundry-surface-bg) !important;
    --key-bg-color-empty: var(--yf-foundry-window-header-bg) !important;
    --key-bg-color-full: var(--yf-foundry-window-header-bg) !important;
    --key-text-color: var(--yf-foundry-font-color) !important;
    --page-control-color: var(--yf-foundry-icon-color) !important;
}
${this._scopeSelectorForArea('hotbar', '#hotbar #action-bar .slot')} { box-shadow: inset 0 0 0 1px var(--yf-foundry-accent-soft); }

${this._scopeSelectorForArea('chatLog', '#chat-message')} {
    --text-color: var(--yf-foundry-font-color) !important;
    --placeholder-color: var(--yf-foundry-font-subtle) !important;
    --background-color: var(--yf-foundry-surface-bg-strong) !important;
    --border-color: var(--yf-foundry-accent-soft) !important;
    color: var(--yf-foundry-font-color) !important;
}

${this._scopeSelectorsForArea('chatLog', ['#chat-log .chat-message', '.chat-log .chat-message', '#chat .chat-message', '.chat-message'])} {
    background-image: var(--yf-foundry-chat-texture) !important;
    background-repeat: repeat !important;
    background-blend-mode: multiply, normal !important;
    border-color: var(--yf-foundry-accent-soft) !important;
    color: var(--yf-foundry-font-color) !important;
}
${this._scopeSelectorsForArea('chatLog', ['#chat-log .chat-message', '.chat-log .chat-message', '#chat .chat-message', '.chat-message'].map(selector => `${selector} :is(.message-metadata, .flavor-text, .whisper-to)`))} {
    color: var(--yf-foundry-font-secondary) !important;
}
${this._scopeSelectorsForArea('chatLog', ['#chat-log .chat-message .message-sender', '.chat-log .chat-message .message-sender', '#chat .chat-message .message-sender', '.chat-message .message-sender'])} {
    color: var(--yf-foundry-font-color) !important;
}
${this._scopeSelectorsForArea('chatLog', ['#chat-log .chat-message', '.chat-log .chat-message', '#chat .chat-message', '.chat-message'].map(selector => `${selector} :is(.dice-formula, .dice-total, .table-draw .table-description, .table-draw ul.table-results li)`))} {
    border-color: var(--yf-foundry-accent-soft) !important;
}
`);
        }

        // ── Fonts ──
        const fontFieldsEnabled = !granularFields
            || this._hasFieldOverride(config, 'theme.interfaceFont')
            || this._hasFieldOverride(config, 'theme.windowFont');
        if (fontsEnabled && fontFieldsEnabled) {
            sections.push(`
${this._areaSelector(['navigation', 'controls', 'players', 'hotbar', 'sidebar', 'pause'])} {
    font-family: ${this._fontStack(themeForCss.interfaceFont)} !important;
}
${this._areaSelector(['windows'], ' .window-header')} {
    font-family: ${this._fontStack(themeForCss.interfaceFont)} !important;
}
${this._areaSelector(['windows'], ' .window-content')} {
    font-family: ${this._fontStack(themeForCss.windowFont)} !important;
}
${this._scopeSelectorForArea('chatLog', '#chat-message')} {
    font-family: ${this._fontStack(themeForCss.windowFont)} !important;
}
`);
        }

        // ── Visibility ──
        const sceneNavigationCss = (!granularFields || this._hasFieldOverridePrefix(config, 'sceneNavigation.'))
            ? this._buildSceneNavigationCss(sceneNavigation, {
            theme: themeForCss,
            fontsEnabled,
            layoutEnabled,
            componentsEnabled
        })
            : '';
        if (sceneNavigationCss) sections.push(sceneNavigationCss);

        const tokenControlsCss = (!granularFields || this._hasFieldOverridePrefix(config, 'tokenControls.'))
            ? this._buildTokenControlsCss(tokenControls, {
            theme: themeForCss,
            layoutEnabled,
            componentsEnabled
        })
            : '';
        if (tokenControlsCss) sections.push(tokenControlsCss);

        const hotbarCss = (!granularFields || this._hasFieldOverridePrefix(config, 'hotbar.'))
            ? this._buildHotbarCss(hotbar, {
            theme: themeForCss,
            layoutEnabled,
            componentsEnabled
        })
            : '';
        if (hotbarCss) sections.push(hotbarCss);

        const sidebarCss = (!granularFields || this._hasFieldOverridePrefix(config, 'sidebar.'))
            ? this._buildSidebarCss(sidebar, {
            theme: themeForCss,
            layoutEnabled,
            componentsEnabled
        })
            : '';
        if (sidebarCss) sections.push(sidebarCss);

        const chatLogCss = componentsEnabled && (!granularFields || this._hasFieldOverridePrefix(config, 'chatLog.'))
            ? this._buildChatLogCss(chatLog, { theme: themeForCss })
            : '';
        if (chatLogCss) sections.push(chatLogCss);

        const playersListCss = (!granularFields || this._hasFieldOverridePrefix(config, 'playersList.'))
            ? this._buildPlayersListCss(playersList, {
            theme: themeForCss,
            layout: layout?.players,
            layoutEnabled,
            componentsEnabled
        })
            : '';
        if (playersListCss) sections.push(playersListCss);

        const windowsCss = (!granularFields || this._hasFieldOverridePrefix(config, 'windows.'))
            ? this._buildWindowsCss(windows, {
            theme: themeForCss,
            componentsEnabled
        })
            : '';
        if (windowsCss) sections.push(windowsCss);

        if (iconsEnabled && (!granularFields || this._hasFieldOverridePrefix(config, 'icons.'))) {
            const iconConfig = normalizeLegacyIcons({ ...config, theme: themeForCss });
            const iconCss = this._buildIconCustomizationCss(iconConfig, themeForCss, {
                includeIndividualOverrides: false
            });
            if (iconCss) sections.push(iconCss);
            perIconOverrideCss = this._buildPerIconOverrideCss(iconConfig, themeForCss);
        }

        if (visibilityEnabled) {
            const visibilityCss = FOUNDRY_UI_COMPONENTS
                .filter(c => this._isCssAreaEnabled(c.id) && visibility[c.id] === false)
                .map(c => `${this._scopeSelector(c.selector)} { display: none !important; }`)
                .join('\n');
            if (visibilityCss) sections.push(visibilityCss);
        }

        // ── Layout (width/height only, position handled via transform in JS) ──
        if (layoutEnabled && (!granularFields || this._hasFieldOverridePrefix(config, 'layout.'))) {
            const layoutCss = FOUNDRY_UI_COMPONENTS
                .filter(c => c.id !== 'pause' && this._isCssAreaEnabled(c.id))
                .map(c => this._buildComponentLayoutCss(c, layout[c.id]))
                .filter(Boolean)
                .join('\n');
            if (layoutCss) sections.push(layoutCss);
        }

        // ── Per-Component Styling ──
        if (componentsEnabled && componentStyles && (!granularFields || this._hasFieldOverridePrefix(config, 'componentStyles.'))) {
            const componentCss = FOUNDRY_UI_COMPONENTS
                .filter(c => !['pause', 'players'].includes(c.id) && this._isCssAreaEnabled(c.id))
                .map(c => this._buildComponentStyleCss(c, componentStyles[c.id]))
                .filter(Boolean)
                .join('\n');
            if (componentCss) sections.push(componentCss);
        }

        // ── Pause ──
        if (pauseEnabled && this._isCssAreaEnabled('pause') && (!granularFields || this._hasFieldOverridePrefix(config, 'pause.'))) {
            sections.push(this._buildPauseCss({ ...config, theme: themeForCss }));
        }

        // ── Custom CSS ──
        if (
            customCssEnabled
            && (!granularFields || this._hasFieldOverride(config, 'customCss'))
            && typeof customCss === 'string'
            && customCss.trim()
        ) {
            sections.push(`/* ── User Custom CSS ── */\n${customCss}`);
        }

        if (perIconOverrideCss) {
            sections.push(`/* Per-icon icon overrides */\n${perIconOverrideCss}`);
        }

        const css = sections.join('\n').trim();
        this._cssAreaEnabled = previousCssAreaEnabled;
        return css;
    }

    _buildGranularThemeCss(config = {}) {
        const theme = this._resolveThemeForCss(config.theme);
        const has = fieldId => this._hasFieldOverride(config, `theme.${fieldId}`);
        const sections = [];
        const rootVars = [];

        if (has('fontColor')) rootVars.push(`--yf-foundry-font-color: ${theme.fontColor};`);
        if (has('secondaryFontColor')) {
            rootVars.push(`--yf-foundry-font-secondary: ${theme.secondaryFontColor};`);
            rootVars.push(`--yf-foundry-font-subtle: ${this._hexToRgba(theme.secondaryFontColor, 0.78)};`);
            rootVars.push(`--yf-foundry-divider-color: ${this._hexToRgba(theme.secondaryFontColor, 0.28)};`);
        }
        if (has('surfaceBackground')) {
            rootVars.push(`--yf-foundry-surface-bg: ${this._hexToRgba(theme.surfaceBackground, 0.74)};`);
            rootVars.push(`--yf-foundry-surface-bg-strong: ${this._hexToRgba(theme.surfaceBackground, 0.9)};`);
        }
        if (has('windowBackground')) rootVars.push(`--yf-foundry-window-bg: ${this._hexToRgba(theme.windowBackground, 0.92)};`);
        if (has('windowHeaderBackground')) rootVars.push(`--yf-foundry-window-header-bg: ${this._hexToRgba(theme.windowHeaderBackground, 0.94)};`);
        if (has('accentColor')) {
            rootVars.push(`--yf-foundry-accent: ${theme.accentColor};`);
            rootVars.push(`--yf-foundry-accent-soft: ${this._hexToRgba(theme.accentColor, 0.24)};`);
            rootVars.push(`--yf-foundry-accent-medium: ${this._hexToRgba(theme.accentColor, 0.52)};`);
            rootVars.push(`--yf-foundry-accent-strong: ${this._hexToRgba(theme.accentColor, 0.84)};`);
        }
        if (has('chatTint')) {
            rootVars.push(`--yf-foundry-chat-tint: ${this._hexToRgba(theme.chatTint, 0.6)};`);
            rootVars.push('--yf-foundry-chat-texture: linear-gradient(0deg, var(--yf-foundry-chat-tint), var(--yf-foundry-chat-tint)), url("ui/parchment.jpg");');
        }
        if (has('iconColor')) rootVars.push(`--yf-foundry-icon-color: ${theme.iconColor};`);
        if (has('iconHoverColor')) rootVars.push(`--yf-foundry-icon-hover-color: ${theme.iconHoverColor};`);
        if (has('scrollbarColor')) {
            rootVars.push(`--yf-foundry-scrollbar-color: ${theme.scrollbarColor};`);
            rootVars.push('--yf-foundry-scrollbar-track: transparent;');
        }

        if (rootVars.length) {
            sections.push(`${FOUNDRY_STYLE_SCOPE} {\n    ${rootVars.join('\n    ')}\n}`);
        }

        if (has('chatTint')) {
            sections.push(`
${this._scopeSelectorsForArea('chatLog', ['#chat-log .chat-message', '.chat-log .chat-message', '#chat .chat-message', '.chat-message'])} {
    background-image: var(--yf-foundry-chat-texture) !important;
    background-repeat: repeat !important;
    background-blend-mode: multiply, normal !important;
}
`);
        }

        if (has('scrollbarColor')) {
            const hoverColor = has('iconHoverColor') ? 'var(--yf-foundry-icon-hover-color)' : 'var(--yf-foundry-scrollbar-color)';
            sections.push(`
${FOUNDRY_STYLE_SCOPE},
${FOUNDRY_STYLE_SCOPE} * {
    scrollbar-width: thin;
    scrollbar-color: var(--yf-foundry-scrollbar-color) var(--yf-foundry-scrollbar-track);
}

${FOUNDRY_STYLE_SCOPE}::-webkit-scrollbar,
${FOUNDRY_STYLE_SCOPE} *::-webkit-scrollbar { width: 10px; height: 10px; }
${FOUNDRY_STYLE_SCOPE}::-webkit-scrollbar-track,
${FOUNDRY_STYLE_SCOPE} *::-webkit-scrollbar-track { background: var(--yf-foundry-scrollbar-track); border-radius: 999px; }
${FOUNDRY_STYLE_SCOPE}::-webkit-scrollbar-thumb,
${FOUNDRY_STYLE_SCOPE} *::-webkit-scrollbar-thumb { background: var(--yf-foundry-scrollbar-color); border: 2px solid transparent; border-radius: 999px; background-clip: padding-box; }
${FOUNDRY_STYLE_SCOPE}::-webkit-scrollbar-thumb:hover,
${FOUNDRY_STYLE_SCOPE} *::-webkit-scrollbar-thumb:hover { background: ${hoverColor}; border: 2px solid transparent; background-clip: padding-box; }
`);
        }

        if (has('fontColor')) {
            sections.push(`
${this._areaSelector(['navigation', 'controls', 'players', 'hotbar', 'sidebar', 'pause', 'windows'])} {
    --color-text-primary: var(--yf-foundry-font-color) !important;
    color: var(--yf-foundry-font-color);
}
${this._areaSelector(['windows'], ' .window-header')} {
    color: var(--yf-foundry-font-color) !important;
}
${this._areaSelector(['hotbar'])} {
    --key-text-color: var(--yf-foundry-font-color) !important;
}
`);
        }

        if (has('secondaryFontColor')) {
            sections.push(`
${this._areaSelector(['navigation', 'controls', 'players', 'hotbar', 'sidebar', 'pause', 'windows'])} {
    --color-text-secondary: var(--yf-foundry-font-secondary) !important;
    --color-text-subtle: var(--yf-foundry-font-subtle) !important;
    --color-form-hint: var(--yf-foundry-font-secondary) !important;
    --input-placeholder-color: var(--yf-foundry-font-subtle) !important;
    --placeholder-color: var(--yf-foundry-font-subtle) !important;
    --group-separator: var(--yf-foundry-divider-color) !important;
}
${this._areaSelector(['windows'], ' :is(.hint, .notes, p.hint, p.notes, small.hint, .form-footer, .window-content .hint, .window-content .notes, .window-content .form-description, .window-content .instructions)')} {
    color: var(--yf-foundry-font-secondary) !important;
}
${this._areaSelector(['windows'], ' :is(.caption, .metadata, .subtitle, .document-id, .window-content .editor-note, .window-content .subheader)')} {
    color: var(--yf-foundry-font-subtle) !important;
}
${this._areaSelector(['windows'], ' :is(input, textarea)::placeholder')} { color: var(--yf-foundry-font-subtle) !important; }
${this._areaSelector(['windows'], ' :is(hr, .window-content hr)')} { border-color: var(--yf-foundry-divider-color) !important; }
`);
        }

        if (has('windowBackground') || has('windowHeaderBackground') || has('accentColor')) {
            const windowRules = [];
            if (has('windowBackground')) windowRules.push('--background: var(--yf-foundry-window-bg) !important;');
            if (has('windowHeaderBackground')) windowRules.push('--color-header-background: var(--yf-foundry-window-header-bg) !important;');
            if (has('accentColor')) {
                windowRules.push('--color-border: var(--yf-foundry-accent-medium) !important;');
                windowRules.push('border-color: var(--yf-foundry-accent-medium) !important;');
                windowRules.push('box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45), 0 0 20px var(--yf-foundry-accent-soft) !important;');
            }
            if (windowRules.length) sections.push(`${this._areaSelector(['windows'])} {\n    ${windowRules.join('\n    ')}\n}`);
        }

        if (has('accentColor')) {
            sections.push(`
${this._areaSelector(['windows'], ' .window-header')} {
    border-bottom: 1px solid var(--yf-foundry-accent-medium) !important;
}
${this._areaSelector(['controlTools'])} {
    --control-border-color: var(--yf-foundry-accent-soft) !important;
    --control-hover-border-color: var(--yf-foundry-accent-medium) !important;
    --control-active-border-color: var(--yf-foundry-accent-strong) !important;
    --control-button-border-color: var(--yf-foundry-accent-medium) !important;
    --control-button-hover-border-color: var(--yf-foundry-accent-medium) !important;
}
${this._scopeSelectorForArea('navigation', '#scene-navigation .scene-navigation-menu .scene:is(.active, .view, .gm)')} {
    box-shadow: inset 0 0 0 1px var(--yf-foundry-accent-medium) !important;
}
${this._areaSelector(['players'])} {
    --border-color: var(--yf-foundry-accent-soft) !important;
    --player-name-self-color: var(--yf-foundry-accent) !important;
}
${this._scopeSelectorForArea('hotbar', '#hotbar #action-bar .slot')} {
    box-shadow: inset 0 0 0 1px var(--yf-foundry-accent-soft);
}
`);
        }

        if (has('surfaceBackground') || has('windowHeaderBackground')) {
            const sidebarRules = [];
            if (has('surfaceBackground')) {
                sidebarRules.push('--sidebar-background: var(--yf-foundry-surface-bg-strong) !important;');
                sidebarRules.push('--input-background: var(--yf-foundry-surface-bg) !important;');
            }
            if (has('windowHeaderBackground')) sidebarRules.push('--sidebar-folder-color: var(--yf-foundry-window-header-bg) !important;');
            if (sidebarRules.length) sections.push(`${this._areaSelector(['sidebar'])} {\n    ${sidebarRules.join('\n    ')}\n}`);
        }

        if (has('iconColor') || has('iconHoverColor')) {
            const baseIcon = has('iconColor') ? 'var(--yf-foundry-icon-color)' : null;
            const hoverIcon = has('iconHoverColor') ? 'var(--yf-foundry-icon-hover-color)' : baseIcon;
            if (baseIcon) {
                sections.push(`
${this._areaSelector(['navigation', 'controls', 'players', 'hotbar', 'sidebar', 'windowHeaders'], ' :is(i, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin)')} {
    color: ${baseIcon} !important;
    --fa-primary-color: ${baseIcon};
    --fa-secondary-color: ${has('fontColor') ? 'var(--yf-foundry-font-color)' : baseIcon};
}
${[
    this._scopeSelectorsForArea('windowHeaders', ['.application .window-header :is(button.header-control, a.header-control, .header-button)']),
    this._scopeSelectorsForArea('hotbar', ['#hotbar button']),
    this._scopeSelectorsForArea('players', ['#players button'])
].filter(Boolean).join(',\n')} {
    --button-text-color: ${baseIcon} !important;
    color: ${baseIcon} !important;
}
`);
            }
            if (hoverIcon) {
                sections.push(`
${[
    this._scopeSelectorsForArea('controlTools', [
        '.ui-control:hover :is(i, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin)',
        '.placeable-hud:hover :is(i, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin)',
        '#measurement .waypoint-label:hover :is(i, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin)'
    ]),
    this._scopeSelectorsForArea('windowHeaders', [
        '.application .window-header :is(button.header-control, a.header-control, .header-button):hover :is(i, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin)'
    ]),
    this._scopeSelectorsForArea('hotbar', ['#hotbar button:hover :is(i, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin)']),
    this._scopeSelectorsForArea('players', ['#players button:hover :is(i, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin)'])
].filter(Boolean).join(',\n')} {
    color: ${hoverIcon} !important;
    --fa-primary-color: ${hoverIcon};
}
`);
            }
        }

        return sections.join('\n').trim();
    }

    _buildWindowsCss(windowsConfig = {}, {
        theme = DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
        componentsEnabled = true
    } = {}) {
        if (!this._isCssAreaEnabled('windows') || !componentsEnabled) return '';

        const windows = normalizeWindowsConfig(windowsConfig);
        const resolvedTheme = {
            ...DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
            ...(theme || {})
        };
        const frameAlpha = windows.frameOpacity / 100;
        const inactiveAlpha = Math.min(frameAlpha, windows.inactiveOpacity / 100);
        const dividerAlpha = windows.headerDividerStrength / 100;
        const gripAlpha = windows.headerGripStrength / 100;
        const scrollbarStrength = windows.scrollbarStrength / 100;
        const scrollbarAlpha = windows.visualMode === 'high-contrast'
            ? Math.max(0.28, scrollbarStrength)
            : Math.max(0.03, scrollbarStrength * 0.92);
        const scrollbarTrackAlpha = Math.min(0.24, Math.max(0.01, scrollbarStrength * 0.18));
        const borderAlpha = windows.visualMode === 'high-contrast'
            ? 0.95
            : Math.max(0.18, 0.24 + windows.frameBorderWidth * 0.14);
        const borderColor = this._hexToRgba(resolvedTheme.accentColor, borderAlpha);
        const dividerColor = this._hexToRgba(
            windows.visualMode === 'high-contrast' ? resolvedTheme.accentColor : resolvedTheme.secondaryFontColor,
            Math.max(0.08, dividerAlpha)
        );
        const gripColor = this._hexToRgba(resolvedTheme.accentColor, Math.max(0.04, gripAlpha));
        const contentTint = this._hexToRgba(
            windows.visualMode === 'high-contrast' ? resolvedTheme.accentColor : resolvedTheme.surfaceBackground,
            Math.min(0.48, windows.contentContrast / 150)
        );
        const frameBackground = this._getWindowsFrameBackground(windows, resolvedTheme, frameAlpha);
        const headerBackground = this._getWindowsHeaderBackground(windows, resolvedTheme);
        const contentBackground = this._getWindowsContentBackground(windows, resolvedTheme, contentTint);
        const frameShadow = this._getWindowsFrameShadow(windows, resolvedTheme);
        const colors = this._resolveWindowsCssColors(windows, resolvedTheme, {
            frameBackground,
            frameBorder: borderColor,
            headerBackground,
            headerText: resolvedTheme.fontColor,
            headerDivider: dividerColor,
            headerGrip: gripColor,
            contentBackground,
            contentText: resolvedTheme.fontColor,
            scrollbarThumb: this._hexToRgba(resolvedTheme.accentColor, scrollbarAlpha),
            scrollbarTrack: this._hexToRgba(resolvedTheme.surfaceBackground, scrollbarTrackAlpha),
            scrollbarBorder: this._hexToRgba(resolvedTheme.windowBackground, Math.min(0.34, 0.08 + scrollbarStrength * 0.22)),
            resizeHandle: this._hexToRgba(resolvedTheme.accentColor, 0.48)
        });
        const backdrop = ['glass', 'arcane', 'neon'].includes(windows.visualMode) && windows.glassBlur > 0
            ? `blur(${windows.glassBlur}px) saturate(1.08)`
            : 'none';
        const contentSelectorList = [
            '.application:not(.sidebar-popout):not(.chat-popout):not(#chat-popout) .window-content',
            '.window-app:not(.sidebar-popout):not(.chat-popout):not(#chat-popout) .window-content'
        ];
        const contentSelectors = this._scopeSelectorsForArea('windows', contentSelectorList);
        const contentAndDescendantSelectors = this._scopeSelectorsForArea('windows', [
            ...contentSelectorList,
            ...contentSelectorList.map(selector => `${selector} *`)
        ]);
        const scrollbarSelectors = this._scopeSelectorsForArea(
            'windows',
            contentSelectorList.map(selector => `${selector}::-webkit-scrollbar`)
        );
        const nestedScrollbarSelectors = this._scopeSelectorsForArea(
            'windows',
            contentSelectorList.map(selector => `${selector} *::-webkit-scrollbar`)
        );
        const scrollbarTrackSelectors = this._scopeSelectorsForArea(
            'windows',
            contentSelectorList.map(selector => `${selector}::-webkit-scrollbar-track`)
        );
        const nestedScrollbarTrackSelectors = this._scopeSelectorsForArea(
            'windows',
            contentSelectorList.map(selector => `${selector} *::-webkit-scrollbar-track`)
        );
        const scrollbarThumbSelectors = this._scopeSelectorsForArea(
            'windows',
            contentSelectorList.map(selector => `${selector}::-webkit-scrollbar-thumb`)
        );
        const nestedScrollbarThumbSelectors = this._scopeSelectorsForArea(
            'windows',
            contentSelectorList.map(selector => `${selector} *::-webkit-scrollbar-thumb`)
        );
        const headerControlSelectors = this._scopeSelectorsForArea('windowHeaders', [
            '.application .window-header :is(button.header-control, a.header-control, .header-button)',
            '.window-app .window-header :is(button.header-control, a.header-control, .header-button)'
        ]);

        return `
${this._areaSelector(['windows'])} {
    --yf-windows-frame-bg: ${colors.frameBackground};
    --yf-windows-header-bg: ${colors.headerBackground};
    --yf-windows-content-bg: ${colors.contentBackground};
    --yf-windows-border: ${colors.frameBorder};
    --yf-windows-divider: ${colors.headerDivider};
    --yf-windows-header-text: ${colors.headerText};
    --yf-windows-content-text: ${colors.contentText};
    --yf-windows-radius: ${windows.frameRadius}px;
    --yf-windows-border-width: ${windows.frameBorderWidth}px;
    --yf-windows-shadow: ${frameShadow};
    --yf-windows-opacity: ${frameAlpha};
    --yf-windows-inactive-opacity: ${inactiveAlpha};
    --yf-windows-header-height: ${windows.headerHeight}px;
    --yf-windows-content-padding: ${windows.contentPadding}px;
    --yf-windows-backdrop: ${backdrop};
    --yf-windows-scrollbar-thumb: ${colors.scrollbarThumb};
    --yf-windows-scrollbar-track: ${colors.scrollbarTrack};
    --yf-windows-scrollbar-border: ${colors.scrollbarBorder};
    --color-scrollbar: var(--yf-windows-scrollbar-thumb) !important;
    --color-scrollbar-track: var(--yf-windows-scrollbar-track) !important;
    --background: var(--yf-windows-frame-bg) !important;
    --color-header-background: var(--yf-windows-header-bg) !important;
    --color-border: var(--yf-windows-border) !important;
    box-sizing: border-box !important;
    border: var(--yf-windows-border-width) solid var(--yf-windows-border) !important;
    border-radius: var(--yf-windows-radius) !important;
    background: var(--yf-windows-frame-bg) !important;
    box-shadow: var(--yf-windows-shadow) !important;
    opacity: var(--yf-windows-opacity);
    overflow: hidden !important;
    backdrop-filter: var(--yf-windows-backdrop);
    -webkit-backdrop-filter: var(--yf-windows-backdrop);
    transition: opacity 0.16s ease, filter 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease !important;
}

${this._areaSelector(['windows'], ':not(.minimized):not(.minimizing):not(.maximizing):not(:hover):not(:focus-within)')} {
    opacity: var(--yf-windows-inactive-opacity);
    filter: saturate(0.92) brightness(0.96);
}

${this._areaSelector(['windows'], ':is(:hover, :focus-within, .zhover)')} {
    opacity: var(--yf-windows-opacity);
    filter: none;
}

${this._areaSelector(['windows'], '.minimized')} {
    border-radius: var(--yf-windows-radius) !important;
    box-shadow: var(--yf-windows-shadow) !important;
}

${this._areaSelector(['windows'], ' .window-header')} {
    min-height: var(--yf-windows-header-height) !important;
    height: var(--yf-windows-header-height) !important;
    flex: 0 0 var(--yf-windows-header-height) !important;
    position: relative !important;
    padding-inline-start: ${windows.headerGripStrength > 0 ? '14px' : '8px'} !important;
    background: var(--yf-windows-header-bg) !important;
    color: var(--yf-windows-header-text) !important;
    border-bottom: 1px solid var(--yf-windows-divider) !important;
    box-shadow: inset 0 -1px 0 var(--yf-windows-divider) !important;
}

${this._areaSelector(['windows'], ' .window-header::before')} {
    content: "";
    position: absolute;
    inset: 6px auto 6px 6px;
    width: 3px;
    border-radius: 999px;
    pointer-events: none;
    background: linear-gradient(180deg, transparent, ${colors.headerGrip}, transparent);
    opacity: ${gripAlpha};
}

${this._areaSelector(['windows'], ' .window-header .window-title')} {
    line-height: var(--yf-windows-header-height) !important;
    color: var(--yf-windows-header-text) !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.42);
}

${headerControlSelectors} {
    min-height: max(20px, calc(var(--yf-windows-header-height) - 8px)) !important;
    align-items: center;
}

${contentSelectors} {
    box-sizing: border-box !important;
    padding: var(--yf-windows-content-padding) !important;
    background: var(--yf-windows-content-bg) !important;
    color: var(--yf-windows-content-text) !important;
    scrollbar-color: var(--yf-windows-scrollbar-thumb) var(--yf-windows-scrollbar-track);
}

${contentAndDescendantSelectors} {
    scrollbar-color: var(--yf-windows-scrollbar-thumb) var(--yf-windows-scrollbar-track) !important;
}

${scrollbarSelectors},
${nestedScrollbarSelectors} {
    width: 10px;
    height: 10px;
}

${scrollbarTrackSelectors},
${nestedScrollbarTrackSelectors} {
    background: var(--yf-windows-scrollbar-track) !important;
    border-radius: 999px !important;
}

${scrollbarThumbSelectors},
${nestedScrollbarThumbSelectors} {
    background: var(--yf-windows-scrollbar-thumb) !important;
    border: 2px solid var(--yf-windows-scrollbar-border) !important;
    border-radius: 999px !important;
    background-clip: padding-box !important;
    box-shadow: none !important;
}

${this._areaSelector(['windows'], ' .controls-dropdown')} {
    background: var(--yf-windows-frame-bg) !important;
    border: 1px solid var(--yf-windows-border) !important;
    box-shadow: var(--yf-windows-shadow) !important;
}

${this._scopeSelectorsForArea('windows', ['.application .window-resize-handle', '.window-app .window-resizable-handle'])} {
    opacity: ${Math.max(0.28, windows.scrollbarStrength / 100)} !important;
    filter: drop-shadow(0 0 ${Math.max(2, Math.round(windows.frameShadowIntensity * 0.35))}px ${colors.resizeHandle});
}

${this._scopeSelectorsForArea('windows', ['.application.dialog', '.window-app.dialog'])} {
    border-color: ${colors.frameBorder} !important;
}
`;
    }

    _resolveWindowsCssColors(windows, theme = {}, fallbacks = {}) {
        const resolvedTheme = {
            ...DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
            ...(theme || {})
        };
        const frameAlpha = windows.frameOpacity / 100;
        const dividerAlpha = windows.headerDividerStrength / 100;
        const gripAlpha = windows.headerGripStrength / 100;
        const scrollbarStrength = windows.scrollbarStrength / 100;
        const scrollbarAlpha = windows.visualMode === 'high-contrast'
            ? Math.max(0.28, scrollbarStrength)
            : Math.max(0.03, scrollbarStrength * 0.92);
        const scrollbarTrackAlpha = Math.min(0.24, Math.max(0.01, scrollbarStrength * 0.18));
        const borderAlpha = windows.visualMode === 'high-contrast'
            ? 0.95
            : Math.max(0.18, 0.24 + windows.frameBorderWidth * 0.14);

        return {
            frameBackground: this._optionalWindowsSurfaceColor(windows.frameBackgroundColor, fallbacks.frameBackground || this._getWindowsFrameBackground(windows, resolvedTheme, frameAlpha), this._getWindowsFrameSurfaceAlpha(windows, frameAlpha), { gradient: true }),
            frameBorder: this._optionalWindowsSurfaceColor(windows.frameBorderColor, fallbacks.frameBorder || this._hexToRgba(resolvedTheme.accentColor, borderAlpha), borderAlpha),
            headerBackground: this._optionalWindowsSurfaceColor(windows.headerBackgroundColor, fallbacks.headerBackground || this._getWindowsHeaderBackground(windows, resolvedTheme), this._getWindowsHeaderSurfaceAlpha(windows)),
            headerText: this._optionalCssColor(windows.headerTextColor, fallbacks.headerText || resolvedTheme.fontColor),
            headerDivider: this._optionalWindowsSurfaceColor(windows.headerDividerColor, fallbacks.headerDivider || this._hexToRgba(windows.visualMode === 'high-contrast' ? resolvedTheme.accentColor : resolvedTheme.secondaryFontColor, Math.max(0.08, dividerAlpha)), Math.max(0.08, dividerAlpha)),
            headerGrip: this._optionalWindowsSurfaceColor(windows.headerGripColor, fallbacks.headerGrip || this._hexToRgba(resolvedTheme.accentColor, Math.max(0.04, gripAlpha)), Math.max(0.04, gripAlpha)),
            contentBackground: this._optionalWindowsSurfaceColor(windows.contentBackgroundColor, fallbacks.contentBackground || this._getWindowsContentBackground(windows, resolvedTheme, this._hexToRgba(windows.visualMode === 'high-contrast' ? resolvedTheme.accentColor : resolvedTheme.surfaceBackground, Math.min(0.48, windows.contentContrast / 150))), this._getWindowsContentSurfaceAlpha(windows), { gradient: true }),
            contentText: this._optionalCssColor(windows.contentTextColor, fallbacks.contentText || resolvedTheme.fontColor),
            scrollbarThumb: this._optionalWindowsSurfaceColor(windows.scrollbarThumbColor, fallbacks.scrollbarThumb || this._hexToRgba(resolvedTheme.accentColor, scrollbarAlpha), scrollbarAlpha),
            scrollbarTrack: this._optionalWindowsSurfaceColor(windows.scrollbarTrackColor, fallbacks.scrollbarTrack || this._hexToRgba(resolvedTheme.surfaceBackground, scrollbarTrackAlpha), scrollbarTrackAlpha),
            scrollbarBorder: fallbacks.scrollbarBorder || this._hexToRgba(resolvedTheme.windowBackground, Math.min(0.34, 0.08 + scrollbarStrength * 0.22)),
            resizeHandle: this._optionalWindowsSurfaceColor(windows.resizeHandleColor, fallbacks.resizeHandle || this._hexToRgba(resolvedTheme.accentColor, 0.48), 0.48)
        };
    }

    _optionalWindowsSurfaceColor(value, fallback, alpha = 1, { gradient = false, topAlpha = null } = {}) {
        if (typeof value !== 'string') return fallback;
        const trimmed = value.trim();
        if (!trimmed) return fallback;
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
            const resolvedAlpha = Math.max(0, Math.min(1, alpha));
            if (gradient) {
                const resolvedTopAlpha = Math.max(0, Math.min(1, topAlpha ?? Math.min(1, resolvedAlpha + 0.08)));
                return `linear-gradient(180deg, ${this._hexToRgba(trimmed, resolvedTopAlpha)} 0%, ${this._hexToRgba(trimmed, resolvedAlpha)} 100%)`;
            }
            return this._hexToRgba(trimmed, resolvedAlpha);
        }
        return trimmed;
    }

    _getWindowsFrameSurfaceAlpha(windows, frameAlpha) {
        switch (windows.visualMode) {
            case 'compact': return Math.min(1, frameAlpha + 0.02);
            case 'high-contrast': return 1;
            case 'parchment': return 0.86;
            case 'neon': return Math.max(0.72, frameAlpha);
            case 'glass': return Math.max(0.62, frameAlpha - 0.12);
            case 'arcane':
            case 'solid':
            default: return frameAlpha;
        }
    }

    _getWindowsHeaderSurfaceAlpha(windows) {
        switch (windows.visualMode) {
            case 'compact': return 0.9;
            case 'high-contrast': return 1;
            case 'parchment': return 0.86;
            case 'arcane': return 0.94;
            case 'neon': return 0.9;
            case 'glass': return 0.72;
            case 'solid':
            default: return 0.96;
        }
    }

    _getWindowsContentSurfaceAlpha(windows) {
        switch (windows.visualMode) {
            case 'compact': return 0.82;
            case 'high-contrast': return 1;
            case 'parchment': return 0.74;
            case 'arcane': return 0.9;
            case 'neon': return 0.88;
            case 'glass': return 0.68;
            case 'solid':
            default: return 0.92;
        }
    }

    _getWindowsFrameBackground(windows, theme, frameAlpha) {
        const windowBg = this._hexToRgba(theme.windowBackground, frameAlpha);
        const headerSoft = this._hexToRgba(theme.windowHeaderBackground, Math.min(1, frameAlpha + 0.02));
        const accentSoft = this._hexToRgba(theme.accentColor, 0.18);
        switch (windows.visualMode) {
            case 'compact':
                return this._hexToRgba(theme.windowBackground, Math.min(1, frameAlpha + 0.02));
            case 'parchment':
                return `linear-gradient(180deg, ${this._hexToRgba(theme.windowHeaderBackground, 0.42)} 0%, ${this._hexToRgba(theme.windowBackground, 0.86)} 100%), url("ui/parchment.jpg") repeat`;
            case 'arcane':
                return `radial-gradient(circle at 12% 0%, ${this._hexToRgba(theme.accentColor, 0.24)} 0%, transparent 34%), linear-gradient(180deg, ${headerSoft} 0%, ${windowBg} 100%)`;
            case 'high-contrast':
                return `linear-gradient(180deg, ${this._hexToRgba(theme.windowHeaderBackground, 1)} 0%, ${this._hexToRgba(theme.windowBackground, 1)} 100%)`;
            case 'neon':
                return `linear-gradient(180deg, ${this._hexToRgba(theme.surfaceBackground, 0.84)} 0%, ${this._hexToRgba(theme.windowBackground, frameAlpha)} 100%), radial-gradient(circle at 100% 0%, ${accentSoft}, transparent 38%)`;
            case 'glass':
                return `linear-gradient(180deg, ${this._hexToRgba(theme.windowHeaderBackground, 0.74)} 0%, ${this._hexToRgba(theme.windowBackground, Math.max(0.62, frameAlpha - 0.12))} 100%)`;
            case 'solid':
            default:
                return `linear-gradient(180deg, ${headerSoft} 0%, ${windowBg} 100%)`;
        }
    }

    _getWindowsHeaderBackground(windows, theme) {
        switch (windows.visualMode) {
            case 'compact':
                return this._hexToRgba(theme.windowHeaderBackground, 0.9);
            case 'parchment':
                return `linear-gradient(180deg, ${this._hexToRgba(theme.accentColor, 0.2)} 0%, ${this._hexToRgba(theme.windowHeaderBackground, 0.86)} 100%)`;
            case 'arcane':
                return `linear-gradient(90deg, ${this._hexToRgba(theme.accentColor, 0.22)} 0%, ${this._hexToRgba(theme.windowHeaderBackground, 0.94)} 42%, ${this._hexToRgba(theme.surfaceBackground, 0.78)} 100%)`;
            case 'high-contrast':
                return this._hexToRgba(theme.windowHeaderBackground, 1);
            case 'neon':
                return `linear-gradient(90deg, ${this._hexToRgba(theme.accentColor, 0.24)} 0%, ${this._hexToRgba(theme.windowHeaderBackground, 0.9)} 100%)`;
            case 'glass':
                return this._hexToRgba(theme.windowHeaderBackground, 0.72);
            case 'solid':
            default:
                return this._hexToRgba(theme.windowHeaderBackground, 0.96);
        }
    }

    _getWindowsContentBackground(windows, theme, contentTint) {
        switch (windows.visualMode) {
            case 'compact':
                return this._hexToRgba(theme.windowBackground, 0.82);
            case 'parchment':
                return `linear-gradient(0deg, ${this._hexToRgba(theme.surfaceBackground, 0.16)}, ${this._hexToRgba(theme.surfaceBackground, 0.16)}), url("ui/parchment.jpg") repeat`;
            case 'arcane':
                return `radial-gradient(circle at 100% 0%, ${this._hexToRgba(theme.accentColor, 0.14)} 0%, transparent 34%), linear-gradient(180deg, ${contentTint} 0%, ${this._hexToRgba(theme.windowBackground, 0.9)} 100%)`;
            case 'high-contrast':
                return `linear-gradient(180deg, ${this._hexToRgba(theme.surfaceBackground, 0.98)} 0%, ${this._hexToRgba(theme.windowBackground, 1)} 100%)`;
            case 'neon':
                return `linear-gradient(180deg, ${this._hexToRgba(theme.windowBackground, 0.8)} 0%, ${this._hexToRgba(theme.surfaceBackground, 0.88)} 100%)`;
            case 'glass':
                return `linear-gradient(180deg, ${contentTint} 0%, ${this._hexToRgba(theme.windowBackground, 0.68)} 100%)`;
            case 'solid':
            default:
                return `linear-gradient(180deg, ${contentTint} 0%, ${this._hexToRgba(theme.windowBackground, 0.92)} 100%)`;
        }
    }

    _getWindowsFrameShadow(windows, theme) {
        const amount = windows.visualMode === 'compact'
            ? Math.round(windows.frameShadowIntensity * 0.45)
            : windows.frameShadowIntensity;
        if (amount <= 0) return 'none';

        const y = Math.max(2, Math.round(amount * 0.3));
        const blur = Math.max(8, Math.round(amount * 1.25));
        const alpha = Math.min(0.56, 0.16 + amount / 120);
        const base = `0 ${y}px ${blur}px rgba(0, 0, 0, ${alpha})`;
        if (windows.visualMode === 'neon') {
            return `${base}, 0 0 ${Math.max(10, Math.round(amount * 0.95))}px ${this._hexToRgba(theme.accentColor, 0.38)}`;
        }
        if (windows.visualMode === 'arcane') {
            return `${base}, inset 0 0 0 1px ${this._hexToRgba(theme.accentColor, 0.18)}`;
        }
        if (windows.visualMode === 'high-contrast') {
            return `${base}, 0 0 0 1px ${this._hexToRgba(theme.accentColor, 0.62)}`;
        }
        return base;
    }

    _buildPlayersListCss(playersListConfig = {}, {
        theme = DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
        layout = {},
        layoutEnabled = true,
        componentsEnabled = true
    } = {}) {
        if (!this._isCssAreaEnabled('players')) return '';

        const playersList = normalizePlayersListConfig(playersListConfig);
        const resolvedTheme = {
            ...DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
            ...(theme || {})
        };
        const width = Number.isFinite(layout?.width)
            ? Math.round(this._clamp(layout.width, 180, this._getLayoutMaxWidth({ maxWidth: 420 })))
            : DEFAULT_FOUNDRY_CUSTOMIZATION.layout.players.width;
        const panelBorder = this._hexToRgba(resolvedTheme.accentColor, Math.max(0.16, playersList.selfHighlight / 180));
        const divider = this._hexToRgba(resolvedTheme.secondaryFontColor, 0.26);
        const hoverBg = this._hexToRgba(resolvedTheme.accentColor, Math.min(0.28, playersList.hoverStrength / 260));
        const hoverBorder = this._hexToRgba(resolvedTheme.accentColor, Math.max(0.18, playersList.hoverStrength / 110));
        const selfBg = this._hexToRgba(resolvedTheme.accentColor, Math.min(0.36, playersList.selfHighlight / 250));
        const selfBorder = this._hexToRgba(resolvedTheme.accentColor, Math.max(0.28, playersList.selfHighlight / 115));
        const gmBg = this._hexToRgba(resolvedTheme.windowHeaderBackground, Math.min(0.78, 0.22 + playersList.gmHighlight / 170));
        const gmBorder = this._hexToRgba(resolvedTheme.accentColor, Math.max(0.18, playersList.gmHighlight / 140));
        const inactiveText = this._hexToRgba(resolvedTheme.secondaryFontColor, 0.82);
        const panelShadow = playersList.panelShadowIntensity > 0
            ? `0 ${Math.max(3, Math.round(playersList.panelShadowIntensity * 0.35))}px ${Math.max(8, Math.round(playersList.panelShadowIntensity * 1.1))}px rgba(0, 0, 0, ${Math.min(0.46, 0.16 + playersList.panelShadowIntensity / 120)})`
            : 'none';
        const neonShadow = playersList.visualMode === 'neon' && playersList.panelShadowIntensity > 0
            ? `, 0 0 ${Math.max(8, Math.round(playersList.panelShadowIntensity * 1.25))}px ${this._hexToRgba(resolvedTheme.accentColor, 0.32)}`
            : '';
        const panelBg = this._getPlayersListPanelBackground(playersList.visualMode, resolvedTheme);
        const rowBg = this._getPlayersListRowBackground(playersList.visualMode, resolvedTheme);
        const panelBackdrop = ['glass', 'neon'].includes(playersList.visualMode)
            ? 'blur(7px) saturate(1.08)'
            : 'none';
        const rowBorderWidth = playersList.visualMode === 'banner' ? 1 : 0;
        const colors = this._resolvePlayersListCssColors(playersList, resolvedTheme, {
            panelBackground: panelBg,
            panelBorder,
            rowBackground: rowBg,
            rowBorder: divider,
            text: resolvedTheme.fontColor,
            inactiveText,
            hoverBackground: hoverBg,
            hoverBorder,
            selfBackground: selfBg,
            selfBorder,
            gmBackground: gmBg,
            gmBorder,
            controlText: 'var(--yf-foundry-icon-color)',
            controlHoverText: 'var(--yf-foundry-icon-hover-color)',
            controlHoverBackground: hoverBg
        });
        const rootRules = [
            `--yf-players-list-width: ${width}px;`
        ];
        const sections = [];

        if (layoutEnabled) {
            sections.push(`
${this._scopeSelectorForArea('players', '#players')} {
    ${rootRules.join(' ')}
    width: var(--yf-players-list-width) !important;
    max-width: var(--yf-players-list-width) !important;
}

${this._scopeSelectorsForArea('players', ['#players #players-active', '#players #players-inactive'])} {
    width: var(--yf-players-list-width) !important;
    max-width: var(--yf-players-list-width) !important;
}
`);
        }

        if (componentsEnabled) {
            sections.push(`
${this._scopeSelectorForArea('players', '#players')} {
    --background-color: ${colors.panelBackground} !important;
    --border-color: ${colors.panelBorder} !important;
    --text-color: ${colors.text} !important;
    --player-name-color: ${colors.text} !important;
    --player-name-idle-color: ${colors.inactiveText} !important;
    --player-name-self-color: ${colors.selfBorder} !important;
    gap: ${playersList.panelGap}px !important;
    color: ${colors.text} !important;
}

${this._scopeSelectorsForArea('players', ['#players #players-active', '#players #players-inactive'])} {
    box-sizing: border-box !important;
    padding: ${playersList.panelPadding}px !important;
    border: ${playersList.panelBorderWidth}px solid ${colors.panelBorder} !important;
    border-radius: ${playersList.panelRadius}px !important;
    background: ${colors.panelBackground} !important;
    box-shadow: ${panelShadow}${neonShadow} !important;
    backdrop-filter: ${panelBackdrop};
    -webkit-backdrop-filter: ${panelBackdrop};
    pointer-events: all;
}

${this._scopeSelectorForArea('players', '#players #players-inactive:not(:empty)')} {
    margin-top: ${Math.max(2, Math.round(playersList.panelGap * 0.75))}px !important;
}

${this._scopeSelectorsForArea('players', ['#players .players-list', '#players ol'])} {
    display: flex !important;
    flex-direction: column !important;
    gap: ${playersList.rowGap}px !important;
}

${this._scopeSelectorForArea('players', '#players .players-list > .player')} {
    box-sizing: border-box !important;
    min-height: ${playersList.rowHeight}px !important;
    padding: 0 ${playersList.rowPaddingX}px !important;
    gap: ${playersList.rowGap}px !important;
    border: ${rowBorderWidth}px solid ${rowBorderWidth ? colors.rowBorder : 'transparent'} !important;
    border-radius: ${playersList.rowRadius}px !important;
    background: ${colors.rowBackground} !important;
    color: ${colors.text} !important;
    line-height: ${playersList.rowHeight}px !important;
    align-items: center !important;
    overflow: hidden !important;
    transition: background 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease, opacity 0.16s ease !important;
}

${this._scopeSelectorForArea('players', '#players .players-list > .player::before')} {
    content: "" !important;
    flex: 0 0 auto !important;
    width: ${this._getPlayersListStatusWidth(playersList)}px !important;
    height: ${playersList.statusSize}px !important;
    border-radius: ${playersList.statusStyle === 'pill' ? 999 : Math.round(playersList.statusSize / 2)}px !important;
    ${this._getPlayersListStatusRules(playersList.statusStyle)}
}

${this._scopeSelectorForArea('players', '#players .player .player-name')} {
    min-width: 0 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    color: inherit !important;
}

${this._scopeSelectorsForArea('players', [
    '#players .players-list > .player:is(:hover, :focus-within, .context, .selected)',
    '#players .players-list > .player[aria-selected="true"]'
])} {
    border-color: ${colors.hoverBorder} !important;
    background: ${colors.hoverBackground} !important;
    box-shadow: inset 0 0 0 1px ${colors.hoverBorder} !important;
    filter: brightness(1.08) saturate(1.06);
}

${this._scopeSelectorForArea('players', '#players .players-list > .player.self')} {
    border-color: ${colors.selfBorder} !important;
    background: ${colors.selfBackground} !important;
    box-shadow: inset 3px 0 0 ${colors.selfBorder} !important;
    color: ${colors.text} !important;
}

${this._scopeSelectorForArea('players', '#players .players-list > .player.gm')} {
    border-color: ${colors.gmBorder} !important;
    background: ${colors.gmBackground} !important;
}

${this._scopeSelectorForArea('players', '#players #players-inactive')} {
    opacity: ${playersList.inactiveOpacity / 100} !important;
}

${this._scopeSelectorsForArea('players', [
    '#players .players-list > .player.inactive',
    '#players .players-list > .player.offline',
    '#players .players-list > .player[data-status="offline"]'
])} {
    opacity: ${playersList.inactiveOpacity / 100} !important;
}

${this._scopeSelectorsForArea('players', [
    '#players #players-inactive .player',
    '#players .players-list > .player.inactive',
    '#players .players-list > .player.offline',
    '#players .players-list > .player[data-status="offline"]'
])} {
    color: ${colors.inactiveText} !important;
    filter: saturate(0.72);
}

${this._scopeSelectorForArea('players', '#players .player.idle .player-name')} {
    color: ${colors.inactiveText} !important;
}

${this._scopeSelectorsForArea('players', ['#players #performance-stats', '#players #players-expand'])} {
    min-height: ${Math.max(20, Math.round(playersList.rowHeight * 0.82))}px !important;
    border-radius: ${Math.max(3, Math.round(playersList.rowRadius * 0.8))}px !important;
    color: ${colors.controlText} !important;
}

${this._scopeSelectorsForArea('players', ['#players #performance-stats:hover', '#players #players-expand:hover'])} {
    background: ${colors.controlHoverBackground} !important;
    color: ${colors.controlHoverText} !important;
}
`);
        }

        return sections.join('\n').trim();
    }

    _resolvePlayersListCssColors(playersList, theme = {}, fallbacks = {}) {
        const resolvedTheme = {
            ...DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
            ...(theme || {})
        };

        return {
            panelBackground: this._optionalCssColor(playersList.panelBackgroundColor, fallbacks.panelBackground || this._getPlayersListPanelBackground(playersList.visualMode, resolvedTheme)),
            panelBorder: this._optionalCssColor(playersList.panelBorderColor, fallbacks.panelBorder || this._hexToRgba(resolvedTheme.accentColor, Math.max(0.16, playersList.selfHighlight / 180))),
            rowBackground: this._optionalCssColor(playersList.rowBackgroundColor, fallbacks.rowBackground || this._getPlayersListRowBackground(playersList.visualMode, resolvedTheme)),
            rowBorder: this._optionalCssColor(playersList.rowBorderColor, fallbacks.rowBorder || this._hexToRgba(resolvedTheme.secondaryFontColor, 0.26)),
            text: this._optionalCssColor(playersList.textColor, fallbacks.text || resolvedTheme.fontColor),
            inactiveText: this._optionalCssColor(playersList.inactiveTextColor, fallbacks.inactiveText || this._hexToRgba(resolvedTheme.secondaryFontColor, 0.82)),
            hoverBackground: this._optionalCssColor(playersList.hoverBackgroundColor, fallbacks.hoverBackground || this._hexToRgba(resolvedTheme.accentColor, Math.min(0.28, playersList.hoverStrength / 260))),
            hoverBorder: this._optionalCssColor(playersList.hoverBorderColor, fallbacks.hoverBorder || this._hexToRgba(resolvedTheme.accentColor, Math.max(0.18, playersList.hoverStrength / 110))),
            selfBackground: this._optionalCssColor(playersList.selfBackgroundColor, fallbacks.selfBackground || this._hexToRgba(resolvedTheme.accentColor, Math.min(0.36, playersList.selfHighlight / 250))),
            selfBorder: this._optionalCssColor(playersList.selfBorderColor, fallbacks.selfBorder || this._hexToRgba(resolvedTheme.accentColor, Math.max(0.28, playersList.selfHighlight / 115))),
            gmBackground: this._optionalCssColor(playersList.gmBackgroundColor, fallbacks.gmBackground || this._hexToRgba(resolvedTheme.windowHeaderBackground, Math.min(0.78, 0.22 + playersList.gmHighlight / 170))),
            gmBorder: this._optionalCssColor(playersList.gmBorderColor, fallbacks.gmBorder || this._hexToRgba(resolvedTheme.accentColor, Math.max(0.18, playersList.gmHighlight / 140))),
            controlText: this._optionalCssColor(playersList.controlTextColor, fallbacks.controlText || 'var(--yf-foundry-icon-color)'),
            controlHoverText: this._optionalCssColor(playersList.controlHoverTextColor, fallbacks.controlHoverText || 'var(--yf-foundry-icon-hover-color)'),
            controlHoverBackground: this._optionalCssColor(playersList.controlHoverBackgroundColor, fallbacks.controlHoverBackground || this._hexToRgba(resolvedTheme.accentColor, Math.min(0.28, playersList.hoverStrength / 260)))
        };
    }

    _getPlayersListPanelBackground(mode, theme) {
        switch (mode) {
            case 'compact':
                return this._hexToRgba(theme.surfaceBackground, 0.9);
            case 'minimal':
                return this._hexToRgba(theme.surfaceBackground, 0.36);
            case 'neon':
                return `linear-gradient(180deg, ${this._hexToRgba(theme.surfaceBackground, 0.86)} 0%, ${this._hexToRgba(theme.windowBackground, 0.78)} 100%)`;
            case 'banner':
                return `linear-gradient(180deg, ${this._hexToRgba(theme.windowHeaderBackground, 0.96)} 0%, ${this._hexToRgba(theme.surfaceBackground, 0.88)} 100%)`;
            case 'glass':
            default:
                return `linear-gradient(180deg, ${this._hexToRgba(theme.surfaceBackground, 0.78)} 0%, ${this._hexToRgba(theme.windowBackground, 0.7)} 100%)`;
        }
    }

    _getPlayersListRowBackground(mode, theme) {
        switch (mode) {
            case 'banner':
                return this._hexToRgba(theme.surfaceBackground, 0.56);
            case 'compact':
                return this._hexToRgba(theme.surfaceBackground, 0.18);
            case 'neon':
                return this._hexToRgba(theme.windowBackground, 0.22);
            case 'minimal':
                return 'transparent';
            case 'glass':
            default:
                return this._hexToRgba(theme.windowBackground, 0.28);
        }
    }

    _getPlayersListStatusWidth(playersList) {
        if (playersList.statusStyle === 'pill') return Math.round(playersList.statusSize * 1.85);
        return playersList.statusSize;
    }

    _getPlayersListStatusRules(statusStyle) {
        switch (statusStyle) {
            case 'ring':
                return [
                    'background: transparent !important;',
                    'border: 2px solid var(--player-color, var(--yf-foundry-accent)) !important;',
                    'box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--player-border, rgba(255,255,255,0.35)) !important;'
                ].join(' ');
            case 'pill':
                return [
                    'background: var(--player-color, var(--yf-foundry-accent)) !important;',
                    'border: 1px solid var(--player-border, rgba(255,255,255,0.35)) !important;',
                    'box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18), 0 0 8px color-mix(in srgb, var(--player-color, var(--yf-foundry-accent)) 45%, transparent) !important;'
                ].join(' ');
            case 'dot':
            default:
                return [
                    'background: var(--player-color, var(--yf-foundry-accent)) !important;',
                    'border: 1px solid var(--player-border, rgba(255,255,255,0.35)) !important;',
                    'box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.32) !important;'
                ].join(' ');
        }
    }

    _buildChatLogCss(chatLogConfig = {}, {
        theme = DEFAULT_FOUNDRY_CUSTOMIZATION.theme
    } = {}) {
        if (!this._isCssAreaEnabled('chatLog')) return '';

        const chatLog = normalizeChatLogConfig(chatLogConfig);
        const resolvedTheme = {
            ...DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
            ...(theme || {})
        };
        const dividerColor = this._hexToRgba(resolvedTheme.secondaryFontColor, chatLog.dividerStrength / 100);
        const messageBorder = this._hexToRgba(resolvedTheme.accentColor, Math.max(0.12, chatLog.dividerStrength / 150));
        const hoverBorder = this._hexToRgba(resolvedTheme.accentColor, Math.max(0.16, chatLog.hoverStrength / 130));
        const hoverSurface = this._hexToRgba(resolvedTheme.accentColor, Math.min(0.18, chatLog.hoverStrength / 320));
        const contextBorder = this._hexToRgba(resolvedTheme.accentColor, Math.max(0.22, chatLog.contextStrength / 100));
        const colors = this._resolveChatLogComposerCssColors(chatLog, resolvedTheme, {
            dividerColor
        });
        const messageShadow = chatLog.messageShadowIntensity > 0
            ? `0 ${Math.max(1, Math.round(chatLog.messageShadowIntensity / 7))}px ${Math.max(5, Math.round(chatLog.messageShadowIntensity * 0.9))}px rgba(0, 0, 0, ${Math.min(0.36, 0.12 + chatLog.messageShadowIntensity / 140)})`
            : '0 0 0 rgba(0, 0, 0, 0)';

        const chatLogRoots = [
            '#chat',
            '.chat-sidebar',
            '#chat-log',
            '.chat-log',
            '#chat-form',
            '.chat-form',
            '.chat-input',
            '#chat-notifications',
            '#chat-message'
        ];
        const chatLogContainers = ['#chat-log', '.chat-log', '#chat .chat-log'];
        const chatLogMessages = [
            '#chat-log .chat-message',
            '.chat-log .chat-message',
            '#chat .chat-message'
        ];
        const chatLogForms = [
            '#chat-form',
            '.chat-form',
            '#chat > form',
            '#chat .chat-input',
            '#chat [data-application-part="input"]',
            '.chat-sidebar .chat-input',
            '.chat-sidebar [data-application-part="input"]',
            '.chat-popout .chat-input',
            '.chat-popout [data-application-part="input"]',
            '#chat-notifications',
            '#chat-notifications .chat-input',
            '#chat-notifications [data-application-part="input"]',
            '#notifications .chat-input'
        ];
        const chatLogInputWrappers = [
            '#chat-message:not(textarea):not(input)',
            '#chat-form .chat-message-input',
            '#chat-form .chat-editor',
            '#chat-form .editor',
            '#chat-form .editor-container',
            '.chat-form .chat-message-input',
            '.chat-form .chat-editor',
            '.chat-form .editor',
            '.chat-form .editor-container',
            '#chat .chat-input .chat-message-input',
            '#chat .chat-input .chat-editor',
            '#chat .chat-input .editor',
            '#chat .chat-input .editor-container',
            '#chat [data-application-part="input"] .chat-message-input',
            '#chat [data-application-part="input"] .chat-editor',
            '#chat [data-application-part="input"] .editor',
            '#chat [data-application-part="input"] .editor-container',
            '.chat-sidebar .chat-input .editor',
            '.chat-sidebar .chat-input .editor-container',
            '.chat-sidebar [data-application-part="input"] .editor',
            '.chat-sidebar [data-application-part="input"] .editor-container',
            '.chat-popout .chat-input .editor',
            '.chat-popout .chat-input .editor-container',
            '.chat-popout [data-application-part="input"] .editor',
            '.chat-popout [data-application-part="input"] .editor-container',
            '#chat-notifications .chat-input .editor',
            '#chat-notifications .chat-input .editor-container',
            '#chat-notifications [data-application-part="input"] .editor',
            '#chat-notifications [data-application-part="input"] .editor-container',
            '#notifications .chat-input .editor',
            '#notifications .chat-input .editor-container'
        ];
        const chatLogDirectInputs = [
            '#chat-message:is(textarea, input, [contenteditable="true"])',
            '#chat-form textarea',
            '#chat-form input[name="message"]',
            '#chat-form [name="message"]',
            '.chat-form textarea',
            '.chat-form input[name="message"]',
            '.chat-form [name="message"]',
            '#chat textarea[name="message"]',
            '#chat .chat-input textarea',
            '#chat .chat-input input[name="message"]',
            '#chat [data-application-part="input"] textarea',
            '#chat [data-application-part="input"] input[name="message"]',
            '.chat-sidebar .chat-input textarea',
            '.chat-sidebar [data-application-part="input"] textarea',
            '.chat-popout .chat-input textarea',
            '.chat-popout [data-application-part="input"] textarea',
            '#chat-notifications textarea',
            '#chat-notifications input[name="message"]',
            '#chat-notifications [data-application-part="input"] textarea',
            '#chat-notifications [data-application-part="input"] input[name="message"]',
            '#notifications .chat-input textarea',
            '#notifications .chat-input input[name="message"]'
        ];
        const chatLogEditableInputs = [
            '#chat-message .ProseMirror',
            '#chat-message .editor-content',
            '#chat-message [contenteditable="true"]',
            '#chat-form .ProseMirror',
            '#chat-form .editor-content',
            '#chat-form [contenteditable="true"]',
            '.chat-form .ProseMirror',
            '.chat-form .editor-content',
            '.chat-form [contenteditable="true"]',
            '#chat .chat-input .ProseMirror',
            '#chat .chat-input .editor-content',
            '#chat .chat-input [contenteditable="true"]',
            '#chat [data-application-part="input"] .ProseMirror',
            '#chat [data-application-part="input"] .editor-content',
            '#chat [data-application-part="input"] [contenteditable="true"]',
            '.chat-sidebar .chat-input .ProseMirror',
            '.chat-sidebar .chat-input .editor-content',
            '.chat-sidebar .chat-input [contenteditable="true"]',
            '.chat-sidebar [data-application-part="input"] .ProseMirror',
            '.chat-sidebar [data-application-part="input"] .editor-content',
            '.chat-sidebar [data-application-part="input"] [contenteditable="true"]',
            '.chat-popout .chat-input .ProseMirror',
            '.chat-popout .chat-input .editor-content',
            '.chat-popout .chat-input [contenteditable="true"]',
            '.chat-popout [data-application-part="input"] .ProseMirror',
            '.chat-popout [data-application-part="input"] .editor-content',
            '.chat-popout [data-application-part="input"] [contenteditable="true"]',
            '#chat-notifications .ProseMirror',
            '#chat-notifications .editor-content',
            '#chat-notifications [contenteditable="true"]',
            '#chat-notifications [data-application-part="input"] .ProseMirror',
            '#chat-notifications [data-application-part="input"] .editor-content',
            '#chat-notifications [data-application-part="input"] [contenteditable="true"]',
            '#notifications .chat-input .ProseMirror',
            '#notifications .chat-input .editor-content',
            '#notifications .chat-input [contenteditable="true"]'
        ];

        return `
${FOUNDRY_STYLE_SCOPE},
${this._scopeSelectorsForArea('chatLog', chatLogRoots)} {
    --yf-chatlog-log-padding: ${chatLog.logPadding}px;
    --yf-chatlog-message-gap: ${chatLog.messageGap}px;
    --yf-chatlog-content-max-width: ${chatLog.contentMaxWidth}px;
    --yf-chatlog-message-padding: ${chatLog.messagePadding}px;
    --yf-chatlog-message-radius: ${chatLog.messageRadius}px;
    --yf-chatlog-message-border-width: ${chatLog.messageBorderWidth}px;
    --yf-chatlog-message-border: ${messageBorder};
    --yf-chatlog-message-shadow: ${messageShadow};
    --yf-chatlog-header-gap: ${chatLog.headerGap}px;
    --yf-chatlog-divider: ${dividerColor};
    --yf-chatlog-hover-border: ${hoverBorder};
    --yf-chatlog-hover-surface: ${hoverSurface};
    --yf-chatlog-context-border: ${contextBorder};
    --yf-chatlog-composer-min-height: ${chatLog.composerMinHeight}px;
    --yf-chatlog-composer-max-height: ${chatLog.composerMaxHeight}px;
    --yf-chatlog-composer-padding: ${chatLog.composerPadding}px;
    --yf-chatlog-composer-radius: ${chatLog.composerRadius}px;
    --yf-chatlog-composer-border-width: ${chatLog.composerBorderWidth}px;
    --yf-chatlog-composer-bg: ${colors.composerBackground};
    --yf-chatlog-composer-border: ${colors.composerBorder};
    --yf-chatlog-composer-focus: ${colors.composerFocus};
    --yf-chatlog-composer-focus-soft: ${colors.composerFocusSoft};
    --yf-chatlog-composer-text: ${colors.composerText};
    --yf-chatlog-composer-placeholder: ${colors.composerPlaceholder};
}

${this._scopeSelectorsForArea('chatLog', chatLogContainers)} {
    box-sizing: border-box !important;
    padding: var(--yf-chatlog-log-padding) !important;
    overflow-y: auto !important;
    scrollbar-gutter: stable;
}

${this._scopeSelectorsForArea('chatLog', chatLogMessages)} {
    box-sizing: border-box !important;
    max-width: min(100%, var(--yf-chatlog-content-max-width)) !important;
    margin: 0 auto var(--yf-chatlog-message-gap) !important;
    padding: var(--yf-chatlog-message-padding) !important;
    border-radius: var(--yf-chatlog-message-radius) !important;
    border: var(--yf-chatlog-message-border-width) solid var(--yf-chatlog-message-border) !important;
    box-shadow: var(--yf-chatlog-message-shadow) !important;
    transition: border-color 0.16s ease, box-shadow 0.16s ease, outline-color 0.16s ease !important;
}

${this._scopeSelectorsForArea('chatLog', chatLogMessages.map(selector => `${selector}:is(:hover, :focus-within)`))} {
    border-color: var(--yf-chatlog-hover-border) !important;
    box-shadow: var(--yf-chatlog-message-shadow), inset 0 0 0 999px var(--yf-chatlog-hover-surface) !important;
}

${this._scopeSelectorsForArea('chatLog', [
    '#chat-log .chat-message:is(.context, .selected, :focus-within)',
    '#chat-log .chat-message[aria-selected="true"]',
    '.chat-log .chat-message:is(.context, .selected, :focus-within)',
    '.chat-log .chat-message[aria-selected="true"]',
    '#chat .chat-message:is(.context, .selected, :focus-within)',
    '#chat .chat-message[aria-selected="true"]'
])} {
    border-color: var(--yf-chatlog-context-border) !important;
    box-shadow: var(--yf-chatlog-message-shadow), 0 0 0 1px var(--yf-chatlog-context-border) !important;
}

${this._scopeSelectorsForArea('chatLog', chatLogMessages.map(selector => `${selector} .message-header`))} {
    margin-bottom: var(--yf-chatlog-header-gap) !important;
    padding-bottom: max(0px, calc(var(--yf-chatlog-header-gap) * 0.45)) !important;
    border-bottom: 1px solid var(--yf-chatlog-divider) !important;
}

${this._scopeSelectorsForArea('chatLog', chatLogMessages.map(selector => `${selector} .message-content`))} {
    overflow-wrap: anywhere;
}

${this._scopeSelectorsForArea('chatLog', chatLogForms)} {
    box-sizing: border-box !important;
    padding: max(4px, calc(var(--yf-chatlog-log-padding) * 0.75)) var(--yf-chatlog-log-padding) var(--yf-chatlog-log-padding) !important;
    border-top: 1px solid var(--yf-chatlog-divider) !important;
    min-height: calc(var(--yf-chatlog-composer-min-height) + var(--yf-chatlog-log-padding)) !important;
}

${this._scopeSelectorsForArea('chatLog', chatLogInputWrappers)} {
    box-sizing: border-box !important;
    display: block !important;
    width: 100% !important;
    height: var(--yf-chatlog-composer-min-height) !important;
    min-height: var(--yf-chatlog-composer-min-height) !important;
    max-height: var(--yf-chatlog-composer-max-height) !important;
    border: var(--yf-chatlog-composer-border-width) solid var(--yf-chatlog-composer-border) !important;
    border-radius: var(--yf-chatlog-composer-radius) !important;
    background: var(--yf-chatlog-composer-bg) !important;
    color: var(--yf-chatlog-composer-text) !important;
    box-shadow: inset 0 0 0 var(--yf-chatlog-composer-border-width) var(--yf-chatlog-composer-border) !important;
    overflow: hidden !important;
}

${this._scopeSelectorsForArea('chatLog', chatLogDirectInputs)} {
    box-sizing: border-box !important;
    display: block !important;
    width: 100% !important;
    height: var(--yf-chatlog-composer-min-height) !important;
    min-height: var(--yf-chatlog-composer-min-height) !important;
    max-height: var(--yf-chatlog-composer-max-height) !important;
    padding: var(--yf-chatlog-composer-padding) !important;
    border-radius: var(--yf-chatlog-composer-radius) !important;
    border: var(--yf-chatlog-composer-border-width) solid var(--yf-chatlog-composer-border) !important;
    background: var(--yf-chatlog-composer-bg) !important;
    color: var(--yf-chatlog-composer-text) !important;
    --text-color: var(--yf-chatlog-composer-text) !important;
    --placeholder-color: var(--yf-chatlog-composer-placeholder) !important;
    resize: vertical;
    overflow-y: auto;
    box-shadow: inset 0 0 0 var(--yf-chatlog-composer-border-width) var(--yf-chatlog-composer-border) !important;
}

${this._scopeSelectorsForArea('chatLog', chatLogEditableInputs)} {
    box-sizing: border-box !important;
    width: 100% !important;
    height: 100% !important;
    min-height: 100% !important;
    max-height: var(--yf-chatlog-composer-max-height) !important;
    padding: var(--yf-chatlog-composer-padding) !important;
    border: 0 !important;
    border-radius: max(0px, calc(var(--yf-chatlog-composer-radius) - var(--yf-chatlog-composer-border-width))) !important;
    background: transparent !important;
    color: var(--yf-chatlog-composer-text) !important;
    outline: none !important;
    overflow-y: auto !important;
}

${this._scopeSelectorsForArea('chatLog', [
    ...chatLogInputWrappers.map(selector => `${selector}:focus-within`),
    ...chatLogDirectInputs.map(selector => `${selector}:is(:focus, :focus-visible)`),
    ...chatLogEditableInputs.map(selector => `${selector}:is(:focus, :focus-visible)`)
])} {
    height: var(--yf-chatlog-composer-max-height) !important;
    outline: none !important;
    border-color: var(--yf-chatlog-composer-focus) !important;
    box-shadow: inset 0 0 0 var(--yf-chatlog-composer-border-width) var(--yf-chatlog-composer-focus), 0 0 0 2px var(--yf-chatlog-composer-focus-soft) !important;
}
`;
    }

    _resolveChatLogComposerCssColors(chatLog, theme = {}, {
        dividerColor = null
    } = {}) {
        const resolvedTheme = {
            ...DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
            ...(theme || {})
        };
        const composerFocus = this._optionalCssColor(
            chatLog.composerFocusColor,
            this._hexToRgba(resolvedTheme.accentColor, Math.max(0.24, chatLog.composerFocusStrength / 100))
        );
        const composerFocusBase = this._optionalCssColor(chatLog.composerFocusColor, resolvedTheme.accentColor);
        const composerFocusSoft = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(composerFocusBase)
            ? this._hexToRgba(composerFocusBase, Math.min(0.26, Math.max(0.08, chatLog.composerFocusStrength / 360)))
            : this._hexToRgba(resolvedTheme.accentColor, Math.min(0.26, Math.max(0.08, chatLog.composerFocusStrength / 360)));

        return {
            composerBackground: this._optionalCssColor(chatLog.composerBackgroundColor, this._hexToRgba(resolvedTheme.surfaceBackground, 0.88)),
            composerBorder: this._optionalCssColor(chatLog.composerBorderColor, dividerColor || this._hexToRgba(resolvedTheme.secondaryFontColor, chatLog.dividerStrength / 100)),
            composerFocus,
            composerFocusSoft,
            composerText: this._optionalCssColor(chatLog.composerTextColor, resolvedTheme.fontColor),
            composerPlaceholder: this._optionalCssColor(chatLog.composerPlaceholderColor, this._hexToRgba(resolvedTheme.secondaryFontColor, 0.78))
        };
    }

    _buildSidebarCss(sidebarConfig = {}, {
        theme = DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
        layoutEnabled = true,
        componentsEnabled = true
    } = {}) {
        if (!this._isCssAreaEnabled('sidebar') || !componentsEnabled) return '';

        const sidebar = normalizeSidebarConfig(sidebarConfig);
        const colors = this._resolveSidebarCssColors(sidebar, theme);
        const shadow = sidebar.panelShadowIntensity > 0
            ? `0 ${Math.max(4, Math.round(sidebar.panelShadowIntensity / 2))}px ${Math.max(10, sidebar.panelShadowIntensity * 2)}px rgba(0, 0, 0, ${Math.min(0.52, 0.18 + sidebar.panelShadowIntensity / 100)})`
            : 'none';

        return `
${this._scopeSelectorForArea('sidebar', '#sidebar')},
${this._scopeSelectorForArea('sidebar', '.sidebar-popout')} {
    --yf-sidebar-rail-width: ${sidebar.railWidth}px;
    --yf-sidebar-rail-padding: ${sidebar.railPadding}px;
    --yf-sidebar-tab-size: ${sidebar.tabSize}px;
    --yf-sidebar-tab-gap: ${sidebar.tabGap}px;
    --yf-sidebar-tab-offset-x: ${sidebar.tabOffsetX}px;
    --yf-sidebar-tab-offset-y: ${sidebar.tabOffsetY}px;
    --yf-sidebar-panel-padding: ${sidebar.panelPadding}px;
    --yf-sidebar-panel-gap: ${sidebar.panelGap}px;
    --yf-sidebar-panel-radius: ${sidebar.panelRadius}px;
    --yf-sidebar-panel-border-width: ${sidebar.panelBorderWidth}px;
    --yf-sidebar-panel-shadow: ${shadow};
    --yf-sidebar-search-height: ${sidebar.searchHeight}px;
    --yf-sidebar-action-height: ${sidebar.actionHeight}px;
    --yf-sidebar-row-height: ${sidebar.rowHeight}px;
    --yf-sidebar-folder-height: ${sidebar.folderHeight}px;
    --yf-sidebar-folder-indent: ${sidebar.folderIndent}px;
    --yf-sidebar-font-size: ${sidebar.fontSize}px;
    --yf-sidebar-divider: ${colors.divider};
    --yf-sidebar-hover-bg: ${colors.rowHoverBackground};
    --yf-sidebar-active-bg: ${colors.active};
    --yf-sidebar-active-soft: ${colors.tabActiveBackground};
    --yf-sidebar-rail-bg: ${colors.railBackground};
    --yf-sidebar-tab-bg: ${colors.tabBackground};
    --yf-sidebar-tab-hover-bg: ${colors.tabHoverBackground};
    --yf-sidebar-tab-active-bg: ${colors.tabActiveBackground};
    --yf-sidebar-panel-bg: ${colors.panelBackground};
    --yf-sidebar-panel-border: ${colors.panelBorder};
    --yf-sidebar-folder-bg: ${colors.folderBackground};
    --yf-sidebar-input-bg: ${colors.inputBackground};
    --yf-sidebar-action-bg: ${colors.actionButtonBackground};
    --yf-sidebar-action-hover-bg: ${colors.actionButtonHoverBackground};
    --yf-sidebar-text: ${colors.text};
    --yf-sidebar-text-muted: ${colors.secondaryText};
    --sidebar-background: var(--yf-sidebar-panel-bg) !important;
    --sidebar-separator: 1px solid var(--yf-sidebar-divider) !important;
    --sidebar-entry-hover-bg: var(--yf-sidebar-hover-bg) !important;
    --sidebar-folder-color: var(--yf-sidebar-folder-bg) !important;
    --sidebar-item-height: var(--yf-sidebar-row-height) !important;
    --sidebar-header-height: var(--yf-sidebar-search-height) !important;
    --sidebar-folder-height: var(--yf-sidebar-folder-height) !important;
    --input-background: var(--yf-sidebar-input-bg) !important;
    --color-text-primary: var(--yf-sidebar-text) !important;
    --color-text-secondary: var(--yf-sidebar-text-muted) !important;
    color: var(--yf-sidebar-text) !important;
}

${this._scopeSelectorsForArea('sidebar', ['#sidebar-tabs'])} {
    position: relative !important;
    z-index: 2 !important;
    box-sizing: border-box !important;
    width: var(--yf-sidebar-rail-width) !important;
    padding: var(--yf-sidebar-rail-padding) max(4px, calc((var(--yf-sidebar-rail-width) - var(--yf-sidebar-tab-size)) / 2)) !important;
    overflow: visible !important;
    border: 0 !important;
    border-radius: var(--yf-sidebar-panel-radius) 0 0 var(--yf-sidebar-panel-radius) !important;
    background: var(--yf-sidebar-rail-bg) !important;
}

${this._scopeSelectorsForArea('sidebar', ['#sidebar-tabs > menu'])} {
    gap: var(--yf-sidebar-tab-gap) !important;
    align-items: center !important;
    overflow: visible !important;
    transform: translate(var(--yf-sidebar-tab-offset-x), var(--yf-sidebar-tab-offset-y)) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-tabs > menu li',
    '#sidebar-tabs > menu .ui-control[data-action="tab"]',
    '#sidebar-tabs > menu .ui-control.collapse'
])} {
    width: var(--yf-sidebar-tab-size) !important;
    min-width: var(--yf-sidebar-tab-size) !important;
    height: var(--yf-sidebar-tab-size) !important;
    min-height: var(--yf-sidebar-tab-size) !important;
}

${this._scopeSelectorsForArea('sidebar', ['#sidebar-tabs > menu .ui-control'])} {
    --button-size: var(--yf-sidebar-tab-size) !important;
    border: 1px solid transparent !important;
    border-radius: max(4px, calc(var(--yf-sidebar-panel-radius) * 0.75)) !important;
    background: var(--yf-sidebar-tab-bg) !important;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04) !important;
    color: var(--yf-sidebar-text) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-tabs > menu .ui-control:is(:hover, :focus-visible)'
])} {
    border-color: var(--yf-sidebar-panel-border) !important;
    background: var(--yf-sidebar-tab-hover-bg) !important;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.38) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-tabs > menu .ui-control[aria-pressed="true"]',
    '#sidebar-tabs > menu .ui-control.active'
])} {
    border-color: var(--yf-sidebar-panel-border) !important;
    background: var(--yf-sidebar-tab-active-bg) !important;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.38) !important;
}

${this._scopeSelectorsForArea('sidebar', ['#sidebar-tabs .notification-pip.active'])} {
    width: max(7px, calc(var(--yf-sidebar-tab-size) * 0.22)) !important;
    height: max(7px, calc(var(--yf-sidebar-tab-size) * 0.22)) !important;
    right: -2px !important;
    top: -2px !important;
    background: var(--yf-sidebar-active-bg) !important;
    border: 1px solid var(--yf-sidebar-panel-bg) !important;
    box-shadow: 0 0 8px var(--yf-sidebar-active-bg) !important;
}

${this._scopeSelectorsForArea('sidebar', ['#sidebar-content .sidebar-tab:not(.sidebar-popout)', '.sidebar-popout'])} {
    border-radius: var(--yf-sidebar-panel-radius) 0 0 var(--yf-sidebar-panel-radius) !important;
    border: var(--yf-sidebar-panel-border-width) solid var(--yf-sidebar-panel-border) !important;
    background: var(--yf-sidebar-panel-bg) !important;
    box-shadow: var(--yf-sidebar-panel-shadow) !important;
    overflow: hidden !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-content .sidebar-tab',
    '.sidebar-popout .directory',
    '.directory.sidebar-tab'
])} {
    font-size: var(--yf-sidebar-font-size) !important;
    color: var(--yf-sidebar-text) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-content .directory .directory-header',
    '.sidebar-popout .directory .directory-header'
])} {
    gap: var(--yf-sidebar-panel-gap) !important;
    margin-block: var(--yf-sidebar-panel-padding) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-content .directory .directory-header .action-buttons',
    '.sidebar-popout .directory .directory-header .action-buttons',
    '#sidebar-content .directory .directory-header search',
    '.sidebar-popout .directory .directory-header search'
])} {
    padding-inline: var(--yf-sidebar-panel-padding) !important;
    gap: var(--yf-sidebar-panel-gap) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-content .directory .directory-header search input',
    '.sidebar-popout .directory .directory-header search input'
])} {
    min-height: var(--yf-sidebar-search-height) !important;
    height: var(--yf-sidebar-search-height) !important;
    background: var(--yf-sidebar-input-bg) !important;
    border-color: var(--yf-sidebar-divider) !important;
    color: var(--yf-sidebar-text) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-content .directory .directory-header .action-buttons button',
    '.sidebar-popout .directory .directory-header .action-buttons button',
    '#sidebar-content .directory .directory-footer button',
    '.sidebar-popout .directory .directory-footer button'
])} {
    min-height: var(--yf-sidebar-action-height) !important;
    height: var(--yf-sidebar-action-height) !important;
    border-color: var(--yf-sidebar-divider) !important;
    background: var(--yf-sidebar-action-bg) !important;
    color: var(--yf-sidebar-text) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-content .directory .directory-header .action-buttons button:is(:hover, :focus-visible)',
    '.sidebar-popout .directory .directory-header .action-buttons button:is(:hover, :focus-visible)',
    '#sidebar-content .directory .directory-footer button:is(:hover, :focus-visible)',
    '.sidebar-popout .directory .directory-footer button:is(:hover, :focus-visible)'
])} {
    background: var(--yf-sidebar-action-hover-bg) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-content .directory .directory-item',
    '.sidebar-popout .directory .directory-item'
])} {
    border-top-color: var(--yf-sidebar-divider) !important;
    color: var(--yf-sidebar-text) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-content .directory .directory-item.entry',
    '#sidebar-content .directory .directory-item.document',
    '.sidebar-popout .directory .directory-item.entry',
    '.sidebar-popout .directory .directory-item.document'
])} {
    min-height: var(--yf-sidebar-row-height) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-content .directory .directory-item img',
    '.sidebar-popout .directory .directory-item img'
])} {
    flex-basis: var(--yf-sidebar-row-height) !important;
    width: var(--yf-sidebar-row-height) !important;
    height: var(--yf-sidebar-row-height) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-content .directory .directory-item .entry-name',
    '.sidebar-popout .directory .directory-item .entry-name'
])} {
    line-height: var(--yf-sidebar-row-height) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-content li.folder > .folder-header',
    '.sidebar-popout li.folder > .folder-header'
])} {
    min-height: var(--yf-sidebar-folder-height) !important;
    line-height: var(--yf-sidebar-folder-height) !important;
    padding: max(3px, calc((var(--yf-sidebar-folder-height) - 18px) / 2)) var(--yf-sidebar-panel-padding) !important;
    background: var(--yf-sidebar-folder-bg) !important;
    color: var(--yf-sidebar-text) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-content li.folder > .folder-header .folder-name',
    '.sidebar-popout li.folder > .folder-header .folder-name'
])} {
    font-size: var(--yf-sidebar-font-size) !important;
    line-height: var(--yf-sidebar-folder-height) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-content .directory .directory-item .subdirectory',
    '.sidebar-popout .directory .directory-item .subdirectory'
])} {
    border-left-width: var(--yf-sidebar-folder-indent) !important;
    border-left-color: var(--yf-sidebar-folder-bg) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-content .directory .directory-item.entry:hover',
    '.sidebar-popout .directory .directory-item.entry:hover'
])} {
    background: var(--yf-sidebar-hover-bg) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-content .directory .directory-item:is(.context, .active)::after',
    '.sidebar-popout .directory .directory-item:is(.context, .active)::after'
])} {
    border-color: var(--yf-sidebar-active-bg) !important;
    border-width: max(1px, var(--yf-sidebar-panel-border-width)) !important;
}

${this._scopeSelectorsForArea('sidebar', [
    '#sidebar-content .directory .directory-footer',
    '.sidebar-popout .directory .directory-footer'
])} {
    min-height: var(--yf-sidebar-action-height) !important;
    padding: var(--yf-sidebar-panel-padding) !important;
    border-top: 1px solid var(--yf-sidebar-divider) !important;
}

${layoutEnabled ? '' : this._scopeSelectorsForArea('sidebar', ['#sidebar']) + ' { transform: none !important; }'}
`;
    }

    _resolveSidebarCssColors(sidebar, theme = {}) {
        const resolvedTheme = {
            ...DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
            ...(theme || {})
        };
        const dividerColor = this._hexToRgba(resolvedTheme.secondaryFontColor, sidebar.dividerStrength / 100);
        const hoverColor = this._hexToRgba(resolvedTheme.accentColor, sidebar.hoverStrength / 100);
        const activeColor = this._hexToRgba(resolvedTheme.accentColor, sidebar.activeStrength / 100);
        const activeSoft = this._hexToRgba(resolvedTheme.accentColor, Math.min(0.34, Math.max(0.12, sidebar.activeStrength / 220)));
        const railBg = this._hexToRgba(resolvedTheme.surfaceBackground, 0.58);
        const panelBg = this._hexToRgba(resolvedTheme.windowBackground, 0.94);
        const panelBorder = this._hexToRgba(resolvedTheme.accentColor, Math.max(0.18, sidebar.activeStrength / 180));
        const folderBg = this._hexToRgba(resolvedTheme.windowHeaderBackground, 0.96);
        const inputBg = this._hexToRgba(resolvedTheme.surfaceBackground, 0.78);
        const actionBg = this._hexToRgba(resolvedTheme.surfaceBackground, 0.42);

        return {
            railBackground: this._optionalCssColor(sidebar.railBackgroundColor, railBg),
            tabBackground: this._optionalCssColor(sidebar.tabBackgroundColor, 'rgba(0, 0, 0, 0.14)'),
            tabHoverBackground: this._optionalCssColor(sidebar.tabHoverBackgroundColor, activeSoft),
            tabActiveBackground: this._optionalCssColor(sidebar.tabActiveBackgroundColor, activeSoft),
            panelBackground: this._optionalCssColor(sidebar.panelBackgroundColor, panelBg),
            panelBorder: this._optionalCssColor(sidebar.panelBorderColor, panelBorder),
            divider: this._optionalCssColor(sidebar.dividerColor, dividerColor),
            folderBackground: this._optionalCssColor(sidebar.folderBackgroundColor, folderBg),
            inputBackground: this._optionalCssColor(sidebar.inputBackgroundColor, inputBg),
            actionButtonBackground: this._optionalCssColor(sidebar.actionButtonBackgroundColor, actionBg),
            actionButtonHoverBackground: this._optionalCssColor(sidebar.actionButtonHoverBackgroundColor, hoverColor),
            rowHoverBackground: this._optionalCssColor(sidebar.rowHoverBackgroundColor, hoverColor),
            active: this._optionalCssColor(sidebar.activeColor, activeColor),
            text: this._optionalCssColor(sidebar.textColor, resolvedTheme.fontColor),
            secondaryText: this._optionalCssColor(sidebar.secondaryTextColor, resolvedTheme.secondaryFontColor)
        };
    }

    _buildSceneNavigationCss(sceneNavigation = {}, {
        theme = DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
        fontsEnabled = true,
        layoutEnabled = true,
        componentsEnabled = true
    } = {}) {
        if (!this._isCssAreaEnabled('navigation')) return '';

        const nav = normalizeSceneNavigationConfig(sceneNavigation);
        const rootSelectors = this._getSceneNavigationRootSelectors();
        const sceneSelectors = this._getSceneNavigationSceneSelectors();
        const menuSelectors = this._getSceneNavigationMenuSelectors();
        const expandSelectors = this._getSceneNavigationExpandSelectors();
        const labelSelectors = sceneSelectors.map(selector => `${selector} :is(.scene-name, .name, .label, strong)`);
        const colors = this._resolveSceneNavigationCssColors(nav, theme);
        const sections = [];
        const activeStateSelector = ':is(.active, .current, .is-active, [aria-current="true"], [aria-selected="true"], [data-active="true"], [data-current="true"], [data-state="active"])';
        const viewedStateSelector = ':is(.view, .viewed, .is-viewed, [data-viewed="true"], [data-state="viewed"])';
        const hiddenStateSelector = `:is(.gm, .hidden, .scene-hidden, .is-hidden, [data-visible="false"], [aria-hidden="true"], [data-hidden="true"], [data-state="hidden"]):not(${activeStateSelector}):not(${viewedStateSelector})`;

        if (layoutEnabled) {
            const nonNativeLayoutCss = this._buildSceneNavigationNonNativeLayoutCss(nav, rootSelectors);
            if (nonNativeLayoutCss) sections.push(nonNativeLayoutCss);

            sections.push(`
${this._scopeSelectorsForArea('navigation', menuSelectors)} {
    display: flex !important;
    box-sizing: border-box !important;
    min-width: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    list-style: none !important;
    gap: ${nav.gap}px !important;
    ${this._getSceneNavigationMenuLayoutRules(nav.layoutMode)}
}

${this._scopeSelectorsForArea('navigation', sceneSelectors)} {
    box-sizing: border-box !important;
    min-height: ${nav.rowHeight}px !important;
    padding: ${nav.paddingY}px ${nav.paddingX}px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: max(6px, ${Math.round(nav.gap)}px) !important;
    line-height: 1.1 !important;
    min-width: 0 !important;
    overflow: hidden !important;
    ${this._getSceneNavigationSceneLayoutRules(nav.layoutMode)}
}

${this._scopeSelectorsForArea('navigation', expandSelectors)} {
    box-sizing: border-box !important;
    min-height: ${nav.rowHeight}px !important;
    padding: ${nav.paddingY}px ${Math.max(8, Math.round(nav.paddingX * 0.8))}px !important;
}

${this._scopeSelectorsForArea('navigation', labelSelectors)} {
    min-width: 0 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
}
`);
        }

        if (fontsEnabled) {
            sections.push(`
${this._scopeSelectorsForArea('navigation', [...sceneSelectors, ...labelSelectors])} {
    font-family: ${this._fontStack(nav.fontFamily)} !important;
    font-size: ${nav.fontSize}px !important;
    font-weight: ${nav.fontWeight} !important;
    letter-spacing: ${nav.letterSpacing}px !important;
    text-transform: ${nav.uppercase ? 'uppercase' : 'none'} !important;
}
`);
        }

        if (componentsEnabled) {
            const baseBorder = this._getSceneNavigationBorderRule(nav, colors.border);
            sections.push(`
${this._scopeSelectorsForArea('navigation', sceneSelectors)} {
    background: ${colors.normalBackground} !important;
    ${baseBorder}
    border-radius: ${nav.borderRadius}px !important;
    color: ${colors.text} !important;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.22) !important;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
}

${this._scopeSelectorsForArea('navigation', labelSelectors)} {
    color: ${colors.text} !important;
}

${this._scopeSelectorsForArea('navigation', expandSelectors)} {
    background: ${colors.normalBackground} !important;
    ${baseBorder}
    border-radius: ${nav.borderRadius}px !important;
    color: ${colors.text} !important;
}

${this._buildSceneNavigationStateCss(sceneSelectors, labelSelectors, hiddenStateSelector, {
    background: colors.hiddenBackground,
    text: colors.text,
    border: colors.border,
    extra: `opacity: ${nav.hiddenOpacity / 100} !important;`
})}

${this._buildSceneNavigationStateCss(sceneSelectors, labelSelectors, viewedStateSelector, {
    background: colors.viewedBackground,
    text: colors.text,
    border: colors.border
})}

${this._buildSceneNavigationStateCss(sceneSelectors, labelSelectors, activeStateSelector, {
    background: colors.activeBackground,
    text: colors.text,
    border: colors.border,
    extra: `box-shadow: inset 0 0 0 1px ${colors.border}, 0 0 0 1px rgba(0, 0, 0, 0.28) !important;`
})}

${this._buildSceneNavigationStateCss(sceneSelectors, labelSelectors, ':is(:hover, :focus-visible, .hover)', {
    background: colors.hoverBackground,
    text: colors.text,
    border: colors.border,
    extra: 'filter: brightness(1.08) saturate(1.06) !important;'
})}
`);
        }

        return sections.join('\n').trim();
    }

    _getSceneNavigationMenuSelectors() {
        return [
            '#scene-navigation > .scene-navigation-menu',
            '#scene-navigation > #scene-navigation-active',
            '#scene-navigation > #scene-navigation-inactive',
            '#scene-navigation > :is(ol, ul, menu)',
            '#scene-navigation > .inactive-container > .scene-navigation-menu',
            '#scene-navigation > .inactive-container > #scene-navigation-inactive',
            '#scene-navigation > .inactive-container > :is(ol, ul, menu)',
            '#scene-navigation .scene-list',
            '#navigation > #scene-list',
            '#navigation > .scene-list',
            '#navigation > ol',
            '#navigation .nav-item-container + #scene-list'
        ];
    }

    _getSceneNavigationSceneSelectors() {
        return [
            '#scene-navigation .scene-navigation-menu .scene',
            '#scene-navigation .scene-list .scene',
            '#scene-navigation .scene',
            '#navigation #scene-list .scene',
            '#navigation .scene-list .scene',
            '#navigation .scene.nav-item'
        ];
    }

    _getSceneNavigationExpandSelectors() {
        return [
            '#scene-navigation #scene-navigation-expand',
            '#scene-navigation .scene-navigation-toggle',
            '#navigation #nav-toggle',
            '#navigation [data-action="toggle"]'
        ];
    }

    _getSceneNavigationRootSelectors() {
        return [
            '#scene-navigation',
            '#navigation'
        ];
    }

    _buildSceneNavigationNonNativeLayoutCss(nav, rootSelectors = []) {
        if (nav.layoutMode === 'vertical') return '';

        const isTrayLayout = nav.layoutMode === 'tray';
        const rootLayout = isTrayLayout
            ? [
                'flex-wrap: nowrap !important;',
                'align-items: flex-start !important;',
                'align-content: flex-start !important;',
                'overflow: visible !important;'
            ]
            : [
                'flex-wrap: wrap !important;',
                'align-items: flex-start !important;',
                'align-content: flex-start !important;',
                'overflow: visible !important;'
            ];
        const rootSizingLayout = isTrayLayout
            ? [
                'width: max(280px, min(1120px, calc(100vw - var(--sidebar-width, 300px) - 56px))) !important;',
                'max-width: calc(100vw - 32px) !important;'
            ]
            : [
                'width: max(420px, min(920px, calc(100vw - var(--sidebar-width, 300px) - 56px))) !important;',
                'max-width: calc(100vw - 32px) !important;'
            ];
        const rowButtonSize = Math.max(24, Math.round(nav.rowHeight));
        const activeContainerLayout = isTrayLayout
            ? [
                'flex: 0 0 auto !important;',
                'min-width: 0 !important;'
            ]
            : [
                `flex: 0 1 min(260px, calc(100% - ${rowButtonSize + nav.gap}px)) !important;`,
                'min-width: min(150px, 100%) !important;',
                'max-width: min(260px, 100%) !important;'
            ];
        const inactiveContainerLayout = isTrayLayout
            ? [
                'flex: 1 1 auto !important;',
                'overflow-x: auto !important;',
                'overflow-y: hidden !important;',
                'scrollbar-width: thin !important;'
            ]
            : [
                'flex: 1 0 100% !important;',
                'width: 100% !important;',
                'min-width: 100% !important;',
                'overflow: visible !important;'
            ];
        const inactiveMenuLayout = isTrayLayout
            ? [
                'width: max-content !important;',
                'max-width: none !important;',
                'flex: 0 0 auto !important;'
            ]
            : [
                'width: 100% !important;',
                'max-width: 100% !important;',
                'flex: 1 0 100% !important;',
                'justify-content: flex-start !important;'
            ];

        return `
${this._scopeSelectorsForArea('navigation', rootSelectors)} {
    box-sizing: border-box !important;
    display: flex !important;
    flex-direction: row !important;
    ${rootLayout.join('\n    ')}
    gap: ${nav.gap}px !important;
    ${rootSizingLayout.join('\n    ')}
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    margin: 0 !important;
    padding: 0 !important;
    pointer-events: none !important;
}

${this._scopeSelectorsForArea('navigation', [
        '#scene-navigation > #scene-navigation-previous',
        '#scene-navigation > #scene-navigation-expand',
        '#scene-navigation :is(#scene-navigation-previous, #scene-navigation-expand, .scene-navigation-toggle)',
        '#scene-navigation > :has(#scene-navigation-previous)',
        '#scene-navigation > :has(#scene-navigation-expand)',
        '#scene-navigation > :has(.scene-navigation-toggle)',
        '#scene-navigation > #scene-navigation-active',
        '#scene-navigation > .scene-navigation-menu:first-of-type',
        '#scene-navigation > :is(ol, ul, menu):first-of-type',
        '#scene-navigation > .inactive-container',
        '#scene-navigation > #scene-navigation-inactive',
        '#scene-navigation > .inactive-container > #scene-navigation-inactive',
        '#scene-navigation > .inactive-container > :is(ol, ul, menu)',
        '#scene-navigation > .scene-navigation-menu ~ .scene-navigation-menu',
        '#scene-navigation > :is(ol, ul, menu) ~ :is(ol, ul, menu)',
        '#navigation > .nav-item-container',
        '#navigation > #scene-list',
        '#navigation > .scene-list',
        '#navigation > ol'
    ])} {
    position: static !important;
    inset: auto !important;
    top: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    transform: none !important;
    margin: 0 !important;
    pointer-events: auto !important;
}

${this._scopeSelectorsForArea('navigation', ['#scene-navigation > #scene-navigation-previous', '#scene-navigation :is(#scene-navigation-previous)', '#scene-navigation > :has(#scene-navigation-previous)', '#navigation > .nav-item-container #nav-back'])} {
    order: 0 !important;
}

${this._scopeSelectorsForArea('navigation', ['#scene-navigation > #scene-navigation-active', '#scene-navigation > .scene-navigation-menu:first-of-type', '#scene-navigation > :is(ol, ul, menu):first-of-type'])} {
    order: 1 !important;
    ${activeContainerLayout.join('\n    ')}
    align-self: flex-start !important;
}

${this._scopeSelectorsForArea('navigation', ['#scene-navigation > #scene-navigation-expand', '#scene-navigation :is(#scene-navigation-expand, .scene-navigation-toggle)', '#scene-navigation > :has(#scene-navigation-expand)', '#scene-navigation > :has(.scene-navigation-toggle)', '#navigation > .nav-item-container', '#navigation > .nav-item-container #nav-toggle'])} {
    order: 2 !important;
    flex: 0 0 ${rowButtonSize}px !important;
    width: ${rowButtonSize}px !important;
    min-width: ${rowButtonSize}px !important;
    height: ${rowButtonSize}px !important;
    min-height: ${rowButtonSize}px !important;
    display: grid !important;
    place-items: center !important;
    align-self: flex-start !important;
}

${this._scopeSelectorsForArea('navigation', ['#scene-navigation > .inactive-container', '#scene-navigation > #scene-navigation-inactive', '#scene-navigation > .inactive-container > #scene-navigation-inactive', '#scene-navigation > .inactive-container > :is(ol, ul, menu)', '#scene-navigation > .scene-navigation-menu ~ .scene-navigation-menu', '#scene-navigation > :is(ol, ul, menu) ~ :is(ol, ul, menu)', '#navigation > #scene-list', '#navigation > .scene-list', '#navigation > ol'])} {
    order: 3 !important;
    display: flex !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    align-self: flex-start !important;
    ${inactiveContainerLayout.join('\n    ')}
}

${this._scopeSelectorsForArea('navigation', ['#scene-navigation > .inactive-container > #scene-navigation-inactive', '#scene-navigation > #scene-navigation-inactive', '#scene-navigation > .scene-navigation-menu ~ .scene-navigation-menu', '#scene-navigation > :is(ol, ul, menu) ~ :is(ol, ul, menu)', '#navigation > #scene-list', '#navigation > .scene-list', '#navigation > ol'])} {
    min-width: 0 !important;
    ${inactiveMenuLayout.join('\n    ')}
}
`;
    }

    _getSceneNavigationMenuLayoutRules(layoutMode) {
        switch (layoutMode) {
            case 'horizontal':
                return [
                    'flex-direction: row !important;',
                    'flex-wrap: wrap !important;',
                    'align-items: flex-start !important;',
                    'align-content: flex-start !important;',
                    'justify-content: flex-start !important;',
                    'width: 100% !important;',
                    'max-width: 100% !important;'
                ].join(' ');
            case 'tray':
                return [
                    'flex-direction: row !important;',
                    'flex-wrap: nowrap !important;',
                    'align-items: center !important;',
                    'overflow-x: auto !important;',
                    'overflow-y: hidden !important;',
                    'max-width: 100% !important;',
                    'scrollbar-width: thin !important;'
                ].join(' ');
            default:
                return [
                    'flex-direction: column !important;',
                    'flex-wrap: nowrap !important;',
                    'align-items: stretch !important;'
                ].join(' ');
        }
    }

    _getSceneNavigationSceneLayoutRules(layoutMode) {
        switch (layoutMode) {
            case 'horizontal':
                return 'width: auto !important; min-width: min(116px, 100%) !important; max-width: min(220px, 100%) !important; flex: 1 1 148px !important; white-space: nowrap !important;';
            case 'tray':
                return 'width: max-content !important; min-width: min(180px, calc(100vw - 96px)) !important; max-width: min(360px, calc(100vw - 96px)) !important; flex: 0 0 auto !important; white-space: nowrap !important;';
            default:
                return 'width: 100% !important; max-width: 100% !important;';
        }
    }

    _buildSceneNavigationStateCss(sceneSelectors, labelSelectors, stateSelector, {
        background,
        text,
        border,
        extra = ''
    } = {}) {
        const sceneStateSelectors = sceneSelectors.map(selector => `${selector}${stateSelector}`);
        const labelStateSelectors = sceneSelectors.map(selector => `${selector}${stateSelector} :is(.scene-name, .name, .label, strong)`);
        return `
${this._scopeSelectorsForArea('navigation', sceneStateSelectors)} {
    background: ${background} !important;
    border-color: ${border} !important;
    color: ${text} !important;
    ${extra}
}

${this._scopeSelectorsForArea('navigation', labelStateSelectors.length ? labelStateSelectors : labelSelectors)} {
    color: ${text} !important;
}`;
    }

    _getSceneNavigationBorderRule(nav, color) {
        if (nav.borderStyle === 'none' || nav.borderWidth <= 0) return 'border: none !important;';
        return `border: ${nav.borderWidth}px ${nav.borderStyle} ${color} !important;`;
    }

    _resolveSceneNavigationCssColors(nav, theme = {}) {
        const resolvedTheme = {
            ...DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
            ...(theme || {})
        };
        const accentSoft = this._hexToRgba(resolvedTheme.accentColor, 0.26);
        const accentMedium = this._hexToRgba(resolvedTheme.accentColor, 0.58);
        const surface = this._hexToRgba(resolvedTheme.surfaceBackground, 0.78);
        const surfaceStrong = this._hexToRgba(resolvedTheme.surfaceBackground, 0.92);
        const header = this._hexToRgba(resolvedTheme.windowHeaderBackground, 0.94);
        const hiddenSurface = this._hexToRgba(resolvedTheme.surfaceBackground, 0.52);

        return {
            text: this._optionalCssColor(nav.textColor, resolvedTheme.fontColor),
            border: this._optionalCssColor(nav.borderColor, accentSoft),
            normalBackground: this._optionalCssColor(nav.normalBackgroundColor, surface),
            activeBackground: this._optionalCssColor(nav.activeBackgroundColor, header),
            viewedBackground: this._optionalCssColor(nav.viewedBackgroundColor, surfaceStrong),
            hiddenBackground: this._optionalCssColor(nav.hiddenBackgroundColor, hiddenSurface),
            hoverBackground: this._optionalCssColor(nav.hoverBackgroundColor, accentMedium)
        };
    }

    _optionalCssColor(value, fallback) {
        return typeof value === 'string' && value.trim() ? value.trim() : fallback;
    }

    _buildTokenControlsCss(tokenControls = {}, {
        theme = DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
        layoutEnabled = true,
        componentsEnabled = true
    } = {}) {
        if (!this._isCssAreaEnabled('controls')) return '';

        const controls = normalizeTokenControlsConfig(tokenControls);
        const colors = this._resolveTokenControlsCssColors(controls, theme);
        const buttonSelectors = this._getTokenControlButtonSelectors();
        const menuSelectors = this._getTokenControlMenuSelectors();
        const toolMenuSelectors = this._getTokenControlToolMenuSelectors();
        const shellSelectors = this._getTokenControlShellSelectors();
        const activeSelectors = buttonSelectors.map(selector => `${selector}:is(.active, .selected, [aria-pressed=true], [aria-current=true], [data-active=true])`);
        const disabledSelectors = buttonSelectors.map(selector => `${selector}:is(:disabled, [disabled], .disabled, [aria-disabled=true])`);
        const hoverSelectors = buttonSelectors.map(selector => `${selector}:is(:hover, :focus-visible)`);
        const sections = [];
        const railWidth = (controls.columnCount * controls.buttonSize)
            + ((controls.columnCount - 1) * controls.columnGap);

        if (layoutEnabled) {
            sections.push(`
${this._scopeSelectorForArea('controls', '#ui-left')} {
    --control-size: ${controls.buttonSize}px !important;
    --control-columns: ${controls.columnCount} !important;
    --yf-token-controls-columns: ${controls.columnCount};
}

${this._scopeSelectorForArea('controls', '#ui-left #ui-left-column-1')} {
    width: ${railWidth}px !important;
}

${this._scopeSelectorsForArea('controls', shellSelectors)} {
    --control-size: ${controls.buttonSize}px !important;
    gap: ${controls.columnGap}px !important;
}

${this._scopeSelectorsForArea('controls', menuSelectors)} {
    gap: ${controls.gap}px ${controls.columnGap}px !important;
    align-content: flex-start !important;
    align-items: center !important;
}

${this._scopeSelectorsForArea('controls', toolMenuSelectors)} {
    flex-wrap: wrap !important;
    gap: ${controls.gap}px ${controls.columnGap}px !important;
    align-content: flex-start !important;
    align-items: center !important;
}

${this._scopeSelectorsForArea('controls', buttonSelectors)} {
    --control-size: ${controls.buttonSize}px !important;
    width: ${controls.buttonSize}px !important;
    height: ${controls.buttonSize}px !important;
    min-width: ${controls.buttonSize}px !important;
    min-height: ${controls.buttonSize}px !important;
    padding: 0 !important;
    font-size: ${controls.iconSize}px !important;
    line-height: 1 !important;
}

${this._scopeSelectorsForArea('controls', buttonSelectors.map(selector => `${selector} :is(i, svg, img)`))} {
    width: ${controls.iconSize}px !important;
    height: ${controls.iconSize}px !important;
    font-size: ${controls.iconSize}px !important;
    line-height: 1 !important;
}
`);
        }

        if (componentsEnabled) {
            const baseBorder = this._getTokenControlsBorderRule(controls, colors.normalBorder);
            const hoverBorder = this._getTokenControlsBorderRule(controls, colors.hoverBorder);
            const activeBorder = this._getTokenControlsBorderRule(controls, colors.activeBorder);
            sections.push(`
${this._scopeSelectorsForArea('controls', [...shellSelectors, ...buttonSelectors])} {
    --control-bg-color: ${colors.normalBackground} !important;
    --control-border-color: ${colors.normalBorder} !important;
    --control-hover-bg-color: ${colors.hoverBackground} !important;
    --control-hover-border-color: ${colors.hoverBorder} !important;
    --control-active-bg-color: ${colors.activeBackground} !important;
    --control-active-border-color: ${colors.activeBorder} !important;
    --toggle-bg-color: ${colors.normalBackground} !important;
    --toggle-border-color: ${colors.normalBorder} !important;
    --toggle-active-bg-color: ${colors.activeBackground} !important;
    --toggle-active-border-color: ${colors.activeBorder} !important;
}

${this._scopeSelectorsForArea('controls', buttonSelectors)} {
    background: ${colors.normalBackground} !important;
    ${baseBorder}
    border-radius: ${controls.borderRadius}px !important;
    box-shadow: ${this._getTokenControlsShadow(controls.shadowIntensity, 'normal')} !important;
    transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease !important;
}

${this._scopeSelectorsForArea('controls', hoverSelectors)} {
    background: ${colors.hoverBackground} !important;
    ${hoverBorder}
    box-shadow: ${this._getTokenControlsShadow(controls.shadowIntensity, 'hover')} !important;
    filter: brightness(1.06) saturate(1.04) !important;
}

${this._scopeSelectorsForArea('controls', activeSelectors)} {
    background: ${colors.activeBackground} !important;
    ${activeBorder}
    box-shadow: ${this._getTokenControlsShadow(controls.shadowIntensity, 'active', colors.activeBorder)} !important;
    filter: none !important;
}

${this._scopeSelectorsForArea('controls', disabledSelectors)} {
    opacity: ${controls.disabledOpacity / 100} !important;
    filter: saturate(0.78) !important;
}
`);
        }

        return sections.join('\n').trim();
    }

    _getTokenControlShellSelectors() {
        return [
            '#scene-controls',
            '#controls'
        ];
    }

    _getTokenControlMenuSelectors() {
        return [
            '#scene-controls > menu',
            '#scene-controls #scene-controls-controls',
            '#scene-controls #scene-controls-tools',
            '#controls .main-controls',
            '#controls .control-tools',
            '#controls ol',
            '#controls ul'
        ];
    }

    _getTokenControlToolMenuSelectors() {
        return [
            '#scene-controls #scene-controls-tools',
            '#controls .control-tools'
        ];
    }

    _getTokenControlButtonSelectors() {
        return [
            '#scene-controls :is(button.ui-control, a.ui-control, li.ui-control)',
            '#controls :is(.control-tool, button[data-tool], a[data-tool], [role="button"][data-tool])'
        ];
    }

    _getTokenControlsBorderRule(controls, color) {
        if (controls.borderStyle === 'none' || controls.borderWidth <= 0) return 'border: none !important;';
        return `border: ${controls.borderWidth}px ${controls.borderStyle} ${color} !important;`;
    }

    _getTokenControlsShadow(intensity = 0, state = 'normal', color = null) {
        const amount = this._clamp(intensity, 0, 32);
        if (amount <= 0) return 'none';

        const alpha = state === 'active' ? 0.38 : state === 'hover' ? 0.32 : 0.24;
        const blur = Math.max(4, Math.round(amount * (state === 'active' ? 1.45 : state === 'hover' ? 1.2 : 0.9)));
        const y = Math.max(1, Math.round(amount / 5));
        const glow = state === 'active' && color
            ? `, 0 0 ${Math.max(4, Math.round(amount * 0.75))}px ${color}`
            : '';
        return `0 ${y}px ${blur}px rgba(0, 0, 0, ${alpha})${glow}`;
    }

    _resolveTokenControlsCssColors(tokenControls, theme = {}) {
        const resolvedTheme = {
            ...DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
            ...(theme || {})
        };
        const accentSoft = this._hexToRgba(resolvedTheme.accentColor, 0.26);
        const accentMedium = this._hexToRgba(resolvedTheme.accentColor, 0.58);
        const accentStrong = this._hexToRgba(resolvedTheme.accentColor, 0.86);
        const surface = this._hexToRgba(resolvedTheme.surfaceBackground, 0.78);
        const surfaceStrong = this._hexToRgba(resolvedTheme.surfaceBackground, 0.92);
        const header = this._hexToRgba(resolvedTheme.windowHeaderBackground, 0.94);

        return {
            normalBackground: this._optionalCssColor(tokenControls.normalBackgroundColor, surface),
            normalBorder: this._optionalCssColor(tokenControls.normalBorderColor, accentSoft),
            hoverBackground: this._optionalCssColor(tokenControls.hoverBackgroundColor, surfaceStrong),
            hoverBorder: this._optionalCssColor(tokenControls.hoverBorderColor, accentMedium),
            activeBackground: this._optionalCssColor(tokenControls.activeBackgroundColor, header),
            activeBorder: this._optionalCssColor(tokenControls.activeBorderColor, accentStrong)
        };
    }

    _buildHotbarCss(hotbarConfig = {}, {
        theme = DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
        layoutEnabled = true,
        componentsEnabled = true
    } = {}) {
        if (!this._isCssAreaEnabled('hotbar')) return '';

        const hotbar = normalizeHotbarConfig(hotbarConfig);
        const colors = this._resolveHotbarCssColors(hotbar, theme);
        const rows = Math.ceil(10 / hotbar.slotsPerRow);
        const actionBarWidth = (hotbar.slotsPerRow * hotbar.slotSize)
            + ((hotbar.slotsPerRow - 1) * hotbar.slotGap);
        const barHeight = (rows * hotbar.slotSize) + ((rows - 1) * hotbar.slotGap);
        const buttonFontSize = Math.max(12, Math.round(hotbar.controlSize * 0.72));
        const sections = [];

        if (layoutEnabled) {
            sections.push(`
${this._scopeSelectorForArea('hotbar', '#hotbar')} {
    --yf-hotbar-native-offset: 0px;
    --hotbar-size: ${hotbar.slotSize}px !important;
    --button-size: ${hotbar.controlSize}px !important;
    width: max-content !important;
    max-width: none !important;
    height: ${barHeight}px !important;
    margin: 0 !important;
    gap: ${hotbar.controlGap}px !important;
    transform: translateX(var(--yf-hotbar-native-offset, 0px)) translate(var(--yf-hotbar-tx, 0px), var(--yf-hotbar-ty, 0px)) scale(var(--yf-hotbar-scale, 1)) !important;
    transform-origin: bottom center !important;
}

${this._scopeSelectorForArea('hotbar', '#hotbar.offset:not(.lg, .min)')} {
    --yf-hotbar-native-offset: var(--offset, 0px);
}

${this._scopeSelectorForArea('hotbar', '#hotbar.min')} {
    --yf-hotbar-native-offset: -70px;
}

${this._scopeSelectorsForArea('hotbar', ['#hotbar.compact', '#hotbar.md.offset', '#hotbar.sm'])} {
    height: ${barHeight}px !important;
}

${this._scopeSelectorsForArea('hotbar', ['#hotbar #action-bar', '#hotbar.compact #action-bar', '#hotbar.md.offset #action-bar', '#hotbar.sm #action-bar'])} {
    width: ${actionBarWidth}px !important;
    height: ${barHeight}px !important;
    gap: ${hotbar.slotGap}px !important;
    flex-wrap: wrap !important;
    justify-content: flex-start !important;
    align-content: flex-start !important;
    align-items: flex-start !important;
}

${this._scopeSelectorForArea('hotbar', '#hotbar #action-bar .slot')} {
    width: ${hotbar.slotSize}px !important;
    height: ${hotbar.slotSize}px !important;
}

${this._scopeSelectorsForArea('hotbar', ['#hotbar .hotbar-controls', '#hotbar #hotbar-page-controls'])} {
    height: ${barHeight}px !important;
    gap: ${hotbar.controlGap}px !important;
}

${this._scopeSelectorForArea('hotbar', '#hotbar .hotbar-controls button')} {
    --button-size: ${hotbar.controlSize}px !important;
    --control-size: ${hotbar.controlSize}px !important;
    width: ${hotbar.controlSize}px !important;
    height: ${hotbar.controlSize}px !important;
    min-width: ${hotbar.controlSize}px !important;
    min-height: ${hotbar.controlSize}px !important;
    font-size: ${buttonFontSize}px !important;
    line-height: 1 !important;
}

${this._scopeSelectorForArea('hotbar', '#hotbar #hotbar-page-controls .hotbar-page-control')} {
    font-size: ${buttonFontSize}px !important;
}

${this._scopeSelectorForArea('hotbar', '#hotbar #hotbar-page-controls .hotbar-page-number')} {
    font-size: ${Math.max(10, Math.round(hotbar.controlSize * 0.58))}px !important;
}
`);
        }

        if (componentsEnabled) {
            const baseBorder = this._getHotbarBorderRule(hotbar, colors.emptyBorder);
            const fullBorder = this._getHotbarBorderRule(hotbar, colors.fullBorder);
            const hoverBorder = this._getHotbarBorderRule(hotbar, colors.hoverBorder);
            const dropBorder = this._getHotbarBorderRule(hotbar, colors.dropTargetBorder);
            const controlBorder = hotbar.controlBorderColor
                ? `border: 1px solid ${colors.controlBorder} !important;`
                : 'border: 1px solid transparent !important;';

            sections.push(`
${this._scopeSelectorForArea('hotbar', '#hotbar #action-bar .slot')} {
    opacity: ${hotbar.slotOpacity / 100} !important;
    border-radius: ${hotbar.slotRadius}px !important;
    box-shadow: ${this._getHotbarShadow(hotbar.slotShadowIntensity, 'normal')} !important;
    transition: background 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease !important;
}

${this._scopeSelectorForArea('hotbar', '#hotbar #action-bar .slot.open')} {
    background: ${colors.emptyBackground} !important;
    ${baseBorder}
}

${this._scopeSelectorForArea('hotbar', '#hotbar #action-bar .slot.full')} {
    background: ${colors.fullBackground} !important;
    ${fullBorder}
}

${this._scopeSelectorForArea('hotbar', '#hotbar #action-bar .slot:hover')} {
    background: ${colors.hoverBackground} !important;
    ${hoverBorder}
    box-shadow: ${this._getHotbarShadow(hotbar.slotShadowIntensity, 'hover')} !important;
    filter: brightness(1.08) saturate(1.04) !important;
}

${this._scopeSelectorForArea('hotbar', '#hotbar #action-bar .slot.drop-target')} {
    background: ${colors.dropTargetBackground} !important;
    ${dropBorder}
    box-shadow: ${this._getHotbarShadow(hotbar.slotShadowIntensity, 'drop', colors.dropTargetBorder)} !important;
}

${this._scopeSelectorForArea('hotbar', '#hotbar #action-bar .slot .slot-icon')} {
    border-radius: max(0px, ${hotbar.slotRadius - hotbar.slotBorderWidth}px) !important;
    object-fit: cover !important;
}

${this._scopeSelectorForArea('hotbar', '#hotbar #action-bar .slot .key')} {
    width: ${hotbar.keyBadgeSize}px !important;
    height: ${hotbar.keyBadgeSize}px !important;
    line-height: ${hotbar.keyBadgeSize}px !important;
    font-size: ${hotbar.keyFontSize}px !important;
    opacity: ${hotbar.keyOpacity / 100} !important;
    color: ${colors.keyText} !important;
    border-radius: ${hotbar.slotRadius}px 0 ${Math.max(0, hotbar.slotRadius - 2)}px 0 !important;
}

${this._scopeSelectorForArea('hotbar', '#hotbar #action-bar .slot.open .key')} {
    background: ${colors.keyEmptyBackground} !important;
}

${this._scopeSelectorForArea('hotbar', '#hotbar #action-bar .slot.full .key')} {
    background: ${colors.keyFullBackground} !important;
}

${this._scopeSelectorsForArea('hotbar', ['#hotbar .hotbar-controls button', '#hotbar #hotbar-page-controls .hotbar-page-control'])} {
    background: ${colors.controlBackground} !important;
    ${controlBorder}
    border-radius: ${hotbar.controlRadius}px !important;
    box-shadow: none !important;
}

${this._scopeSelectorsForArea('hotbar', ['#hotbar .hotbar-controls button:hover', '#hotbar #hotbar-page-controls .hotbar-page-control:hover'])} {
    background: ${colors.controlHoverBackground} !important;
    box-shadow: none !important;
}
`);
        }

        return sections.join('\n').trim();
    }

    _getHotbarBorderRule(hotbar, color) {
        if (hotbar.slotBorderStyle === 'none' || hotbar.slotBorderWidth <= 0) return 'border: none !important;';
        return `border: ${hotbar.slotBorderWidth}px ${hotbar.slotBorderStyle} ${color} !important;`;
    }

    _getHotbarShadow(intensity = 0, state = 'normal', color = null) {
        const amount = this._clamp(intensity, 0, 36);
        if (amount <= 0) return 'none';

        const alpha = state === 'drop' ? 0.38 : state === 'hover' ? 0.32 : 0.24;
        const blur = Math.max(4, Math.round(amount * (state === 'drop' ? 1.35 : state === 'hover' ? 1.1 : 0.85)));
        const y = Math.max(1, Math.round(amount / 6));
        const glow = color ? `, 0 0 ${Math.max(4, Math.round(amount * 0.65))}px ${color}` : '';
        return `0 ${y}px ${blur}px rgba(0, 0, 0, ${alpha})${glow}`;
    }

    _resolveHotbarCssColors(hotbar, theme = {}) {
        const resolvedTheme = {
            ...DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
            ...(theme || {})
        };
        const surface = this._hexToRgba(resolvedTheme.surfaceBackground, 0.78);
        const surfaceStrong = this._hexToRgba(resolvedTheme.surfaceBackground, 0.92);
        const header = this._hexToRgba(resolvedTheme.windowHeaderBackground, 0.94);
        const accentSoft = this._hexToRgba(resolvedTheme.accentColor, 0.32);
        const accentMedium = this._hexToRgba(resolvedTheme.accentColor, 0.62);
        const accentStrong = this._hexToRgba(resolvedTheme.accentColor, 0.88);
        const controlSurface = this._hexToRgba(resolvedTheme.surfaceBackground, 0.56);

        return {
            emptyBackground: this._optionalCssColor(hotbar.emptyBackgroundColor, surface),
            emptyBorder: this._optionalCssColor(hotbar.emptyBorderColor, accentSoft),
            fullBackground: this._optionalCssColor(hotbar.fullBackgroundColor, surfaceStrong),
            fullBorder: this._optionalCssColor(hotbar.fullBorderColor, accentMedium),
            hoverBackground: this._optionalCssColor(hotbar.hoverBackgroundColor, header),
            hoverBorder: this._optionalCssColor(hotbar.hoverBorderColor, accentStrong),
            dropTargetBackground: this._optionalCssColor(hotbar.dropTargetBackgroundColor, accentSoft),
            dropTargetBorder: this._optionalCssColor(hotbar.dropTargetBorderColor, accentStrong),
            keyText: this._optionalCssColor(hotbar.keyTextColor, resolvedTheme.fontColor),
            keyEmptyBackground: this._optionalCssColor(hotbar.keyEmptyBackgroundColor, header),
            keyFullBackground: this._optionalCssColor(hotbar.keyFullBackgroundColor, accentMedium),
            controlBackground: this._optionalCssColor(hotbar.controlBackgroundColor, 'transparent'),
            controlBorder: this._optionalCssColor(hotbar.controlBorderColor, accentSoft),
            controlHoverBackground: this._optionalCssColor(hotbar.controlHoverBackgroundColor, controlSurface)
        };
    }

    _buildIconCustomizationCss(iconConfig = {}, theme = {}, {
        includeIndividualOverrides = true
    } = {}) {
        if (iconConfig.enabled === false) return '';

        const sections = [];
        for (const entry of FOUNDRY_ICON_REGISTRY) {
            const groupColors = this._resolveIconColorSet(iconConfig.groups?.[entry.defaultGroup], theme);
            sections.push(this._buildIconEntryCss(entry, groupColors));
        }

        const overrideEntries = this._getResolvedIconOverrideEntries(iconConfig);

        for (const { override, entry } of overrideEntries) {
            if (!entry.dynamic || override?.inheritGroup === false) continue;

            const groupColors = this._resolveIconColorSet(iconConfig.groups?.[entry.defaultGroup], theme);
            sections.push(this._buildIconEntryCss(entry, groupColors));
        }

        if (!includeIndividualOverrides) return sections.filter(Boolean).join('\n');

        for (const { override, entry } of overrideEntries) {
            if (override?.inheritGroup !== false) continue;

            const groupColors = this._resolveIconColorSet(iconConfig.groups?.[entry.defaultGroup], theme);
            const overrideColors = this._resolveIconColorSet(override, theme, groupColors);
            sections.push(this._buildIconEntryCss(entry, overrideColors, { specificityBoost: true }));
        }

        for (const { override, entry } of overrideEntries) {
            if (override?.hidden !== true) continue;
            sections.push(this._buildIconHiddenCss(entry, { specificityBoost: true }));
        }

        return sections.filter(Boolean).join('\n');
    }

    _buildPerIconOverrideCss(iconConfig = {}, theme = {}) {
        if (iconConfig.enabled === false) return '';

        const sections = [];
        for (const { override, entry } of this._getResolvedIconOverrideEntries(iconConfig)) {
            if (override?.inheritGroup === false) {
                const groupColors = this._resolveIconColorSet(iconConfig.groups?.[entry.defaultGroup], theme);
                const overrideColors = this._resolveIconColorSet(override, theme, groupColors);
                sections.push(this._buildIconEntryCss(entry, overrideColors, { specificityBoost: true }));
            }
            if (override?.hidden === true) {
                sections.push(this._buildIconHiddenCss(entry, { specificityBoost: true }));
            }
        }

        return sections.filter(Boolean).join('\n');
    }

    _getResolvedIconOverrideEntries(iconConfig = {}) {
        const overrideEntries = Object.entries(iconConfig.overrides || {})
            .map(([iconId, override]) => ({
                iconId,
                override,
                entry: resolveIconRegistryEntry(iconId, { overrides: iconConfig.overrides })
            }))
            .filter(item => item.entry);

        overrideEntries.sort((left, right) => Number(right.entry.legacy) - Number(left.entry.legacy));
        return overrideEntries;
    }

    _buildIconEntryCss(entry, colors = {}, {
        specificityBoost = false
    } = {}) {
        if (!entry?.selector) return '';

        const stateColors = [
            { selector: '', color: colors.color, backgroundColor: colors.backgroundColor },
            { selector: ':is(:hover, :focus-visible)', color: colors.hoverColor, backgroundColor: colors.hoverBackgroundColor },
            { selector: ':is(.active, .selected, [aria-pressed="true"], [aria-current="true"], [data-active="true"])', color: colors.activeColor, backgroundColor: colors.activeBackgroundColor }
        ];
        const styleSelectors = entry.styleSelectors?.length ? entry.styleSelectors : [entry.selector];

        return stateColors
            .flatMap(state => styleSelectors.flatMap(styleSelector => (
                this._buildIconStateCssRules(styleSelector, state, entry.area, { specificityBoost })
            )))
            .join('\n');
    }

    _buildIconStateCssRules(styleSelector, state, area, {
        specificityBoost = false
    } = {}) {
        const rules = [];
        const backgroundRules = this._buildIconBackgroundRules(state.backgroundColor);
        if (backgroundRules && !this._isIconGlyphSelector(styleSelector)) {
            const statefulSelector = this._appendIconStateSelector(styleSelector, state.selector);
            const scopedSelector = this._scopeSelectorForArea(area, statefulSelector);
            const finalSelector = specificityBoost
                ? this._boostIconOverrideSelector(scopedSelector)
                : scopedSelector;
            rules.push(`${finalSelector} { ${backgroundRules} }`);
        }

        const colorRules = this._buildIconColorRules(state.color);
        if (colorRules) {
            rules.push(...this._expandIconStateSelectors(styleSelector, state.selector).map(selector => {
                const scopedSelector = this._scopeSelectorForArea(area, selector);
                const finalSelector = specificityBoost
                    ? this._boostIconOverrideSelector(scopedSelector)
                    : scopedSelector;
                return `${finalSelector} { ${colorRules} }`;
            }));
        }

        return rules;
    }

    _buildIconHiddenCss(entry, {
        specificityBoost = false
    } = {}) {
        const selectors = this._getIconHiddenSelectors(entry);
        if (!selectors.length) return '';

        return selectors.map(selector => {
            const scopedSelector = this._scopeSelectorForArea(entry.area, selector);
            const finalSelector = specificityBoost
                ? this._boostIconOverrideSelector(scopedSelector)
                : scopedSelector;
            return `${finalSelector} { display: none !important; pointer-events: none !important; }`;
        }).join('\n');
    }

    _getIconHiddenSelectors(entry) {
        if (!entry) return [];

        const primarySelectors = entry.matchSelectors?.length
            ? entry.matchSelectors
            : (entry.selectors?.length ? entry.selectors : [entry.selector]);
        if (entry.dynamic || entry.supportsIconClass !== false) {
            return this._normalizeIconSelectorListForCss(primarySelectors);
        }

        return this._normalizeIconSelectorListForCss(entry.styleSelectors)
            .filter(selector => selector.includes('::') || selector.includes(FA_ICON_SELECTOR));
    }

    _boostIconOverrideSelector(selector) {
        if (typeof selector !== 'string' || !selector.trim()) return selector;
        const pseudoIndex = selector.indexOf('::');
        if (pseudoIndex >= 0) {
            return `${selector.slice(0, pseudoIndex)}:not(.yf-icon-override-sentinel)${selector.slice(pseudoIndex)}`;
        }
        return `${selector}:not(.yf-icon-override-sentinel)`;
    }

    _expandIconStateSelectors(selector, stateSelector = '') {
        const statefulSelector = this._appendIconStateSelector(selector, stateSelector);
        if (selector.includes('::') || selector.includes(FA_ICON_SELECTOR)) return [statefulSelector];
        return [
            statefulSelector,
            `${statefulSelector} ${FA_ICON_SELECTOR}`
        ];
    }

    _appendIconStateSelector(selector, stateSelector = '') {
        if (!stateSelector) return selector;
        const pseudoIndex = selector.indexOf('::');
        if (pseudoIndex >= 0) {
            return `${selector.slice(0, pseudoIndex)}${stateSelector}${selector.slice(pseudoIndex)}`;
        }
        return `${selector}${stateSelector}`;
    }

    _buildIconColorRules(color) {
        if (!color) return '';
        return [
            `color: ${color} !important;`,
            `fill: ${color} !important;`,
            `stroke: ${color} !important;`,
            `--fa-primary-color: ${color};`,
            `--fa-secondary-color: ${color};`,
            `--button-text-color: ${color} !important;`,
            `--button-hover-text-color: ${color} !important;`,
            `--control-icon-color: ${color} !important;`,
            `--control-hover-icon-color: ${color} !important;`,
            `--control-active-icon-color: ${color} !important;`,
            `--toggle-icon-color: ${color} !important;`
        ].join(' ');
    }

    _buildIconBackgroundRules(backgroundColor) {
        if (!backgroundColor) return '';
        return [
            `background-color: ${backgroundColor} !important;`,
            `--button-background-color: ${backgroundColor} !important;`,
            `--button-hover-background-color: ${backgroundColor} !important;`,
            `--control-bg-color: ${backgroundColor} !important;`,
            `--control-hover-bg-color: ${backgroundColor} !important;`,
            `--control-active-bg-color: ${backgroundColor} !important;`,
            `--control-button-hover-bg-color: ${backgroundColor} !important;`
        ].join(' ');
    }

    _isIconGlyphSelector(selector) {
        return typeof selector === 'string' && (
            selector.includes('::')
            || selector.includes(FA_ICON_SELECTOR)
        );
    }

    _normalizeIconSelectorListForCss(value) {
        const list = Array.isArray(value) ? value : [value];
        return [...new Set(list
            .filter(selector => typeof selector === 'string')
            .map(selector => selector.trim())
            .filter(Boolean))];
    }

    _resolveIconColorSet(colorSet = {}, theme = {}, fallback = null) {
        const fallbackColor = fallback?.color || theme.iconColor || DEFAULT_FOUNDRY_CUSTOMIZATION.theme.iconColor;
        const color = this._normalizeColor(colorSet?.color, fallbackColor);
        const hoverColor = this._normalizeColor(
            colorSet?.hoverColor,
            fallback?.hoverColor || theme.iconHoverColor || color
        );
        const activeColor = this._normalizeColor(
            colorSet?.activeColor,
            fallback?.activeColor || hoverColor || color
        );
        const backgroundColor = this._normalizeOptionalIconColor(
            colorSet?.backgroundColor,
            fallback?.backgroundColor || null
        );
        const hoverBackgroundColor = this._normalizeOptionalIconColor(
            colorSet?.hoverBackgroundColor,
            fallback?.hoverBackgroundColor || backgroundColor
        );
        const activeBackgroundColor = this._normalizeOptionalIconColor(
            colorSet?.activeBackgroundColor,
            fallback?.activeBackgroundColor || hoverBackgroundColor || backgroundColor
        );

        return {
            color,
            hoverColor,
            activeColor,
            backgroundColor,
            hoverBackgroundColor,
            activeBackgroundColor
        };
    }

    _normalizeOptionalIconColor(value, fallback = null) {
        return this._normalizeColor(value, null) || fallback || null;
    }

    _applyIconClassOverrides(config = {}) {
        this._clearIconClassOverrides();
        const iconConfig = normalizeLegacyIcons(config);
        if (
            !this._isFeatureEnabledForDom()
            || config.enabled === false
            || config.categories?.icons === false
            || iconConfig.enabled === false
            || (this._usesGranularFieldOverrides(config) && !this._hasFieldOverridePrefix(config, 'icons.'))
        ) return;

        const overrideEntries = Object.entries(iconConfig.overrides || {})
            .map(([iconId, override]) => ({
                override,
                entry: resolveIconRegistryEntry(iconId, { overrides: iconConfig.overrides })
            }))
            .filter(item => item.entry)
            .sort((left, right) => Number(right.entry.legacy) - Number(left.entry.legacy));

        for (const { override, entry } of overrideEntries) {
            if (override?.inheritGroup !== false || !override.iconClass) continue;
            if (!entry?.supportsIconClass) continue;

            const replacementClasses = this._normalizeIconClassList(override.iconClass);
            if (!replacementClasses.length) continue;

            for (const element of this._findIconClassTargets(entry)) {
                this._replaceFontAwesomeClasses(element, replacementClasses);
            }
        }
    }

    _applyIconStyleOverrides(config = {}) {
        this._clearIconStyleOverrides();
        const iconConfig = normalizeLegacyIcons(config);
        const diagnostics = [];
        if (
            !this._isFeatureEnabledForDom()
            || config.enabled === false
            || config.categories?.icons === false
            || iconConfig.enabled === false
            || (this._usesGranularFieldOverrides(config) && !this._hasFieldOverridePrefix(config, 'icons.'))
        ) return;

        for (const { override, entry } of this._getResolvedIconOverrideEntries(iconConfig)) {
            if (override?.inheritGroup !== false) continue;

            const groupColors = this._resolveIconColorSet(iconConfig.groups?.[entry.defaultGroup], config.theme);
            const colors = this._resolveIconColorSet(override, config.theme, groupColors);
            const targets = this._findIconStyleTargets(entry);
            diagnostics.push({
                id: entry.id,
                label: entry.label ?? override.label ?? entry.id,
                targetCount: targets.size,
                selectors: [...(entry.matchSelectors ?? [])]
            });
            for (const element of targets) {
                this._applyIconInlineColorRules(element, colors);
            }
        }

        this._lastIconOverrideDiagnostics = diagnostics;
        if (diagnostics.length && diagnostics.every(entry => entry.targetCount === 0)) {
            console.warn(`${MODULE_NAME} | Icon overrides are configured, but no live icon targets were found.`, diagnostics);
        }
    }

    _findIconStyleTargets(entry) {
        const selectors = entry.matchSelectors?.length ? entry.matchSelectors : (entry.selectors?.length ? entry.selectors : [entry.selector]);
        const targets = new Set();
        const rememberedTarget = this._getRememberedDynamicIconTarget(entry);
        if (rememberedTarget) this._addIconStyleTarget(targets, rememberedTarget);

        for (const selector of selectors) {
            let elements = [];
            try {
                elements = Array.from(document.querySelectorAll(selector));
            } catch (_error) {
                continue;
            }

            for (const element of elements) {
                this._addIconStyleTarget(targets, element);
            }
        }

        return targets;
    }

    _findIconHiddenTargets(entry) {
        const selectors = this._getIconHiddenSelectors(entry);
        const targets = new Set();
        const rememberedTarget = this._getRememberedDynamicIconTarget(entry);
        if (rememberedTarget) targets.add(rememberedTarget);

        for (const selector of selectors) {
            let elements = [];
            try {
                elements = Array.from(document.querySelectorAll(selector));
            } catch (_error) {
                continue;
            }

            for (const element of elements) targets.add(element);
        }

        return targets;
    }

    _addIconStyleTarget(targets, element) {
        if (!element) return;
        targets.add(element);
        const buttonTarget = element.closest?.('button, a, [role="button"], [data-action], [data-tool], [data-control], .ui-control, .control-tool, .scene-control, .control-icon');
        if (buttonTarget) targets.add(buttonTarget);
        element.querySelectorAll?.(FA_ICON_SELECTOR).forEach(icon => targets.add(icon));
    }

    _applyIconInlineColorRules(element, colors = {}) {
        if (!element?.style || !colors.color) return;

        const rules = {
            color: colors.color,
            fill: colors.color,
            stroke: colors.color,
            '--fa-primary-color': colors.color,
            '--fa-secondary-color': colors.color,
            '--button-text-color': colors.color,
            '--button-hover-text-color': colors.hoverColor || colors.color,
            '--control-icon-color': colors.color,
            '--control-hover-icon-color': colors.hoverColor || colors.color,
            '--control-active-icon-color': colors.activeColor || colors.hoverColor || colors.color,
            '--toggle-icon-color': colors.color
        };

        if (colors.backgroundColor) {
            rules['background-color'] = colors.backgroundColor;
            rules['--button-background-color'] = colors.backgroundColor;
            rules['--control-bg-color'] = colors.backgroundColor;
        }
        if (colors.hoverBackgroundColor || colors.backgroundColor) {
            const hoverBackgroundColor = colors.hoverBackgroundColor || colors.backgroundColor;
            rules['--button-hover-background-color'] = hoverBackgroundColor;
            rules['--control-hover-bg-color'] = hoverBackgroundColor;
            rules['--control-button-hover-bg-color'] = hoverBackgroundColor;
        }
        if (colors.activeBackgroundColor || colors.hoverBackgroundColor || colors.backgroundColor) {
            rules['--control-active-bg-color'] = colors.activeBackgroundColor || colors.hoverBackgroundColor || colors.backgroundColor;
        }

        for (const [property, value] of Object.entries(rules)) {
            this._rememberIconInlineStyle(element, property);
            element.style.setProperty(property, value);
        }
    }

    _rememberIconInlineStyle(element, property) {
        if (!this._iconStyleOverrides.has(element)) this._iconStyleOverrides.set(element, new Map());
        const elementStyles = this._iconStyleOverrides.get(element);
        if (elementStyles.has(property)) return;
        elementStyles.set(property, {
            value: element.style.getPropertyValue(property),
            priority: element.style.getPropertyPriority(property)
        });
    }

    _clearIconStyleOverrides() {
        for (const [element, properties] of this._iconStyleOverrides.entries()) {
            if (!element?.style) continue;
            for (const [property, previous] of properties.entries()) {
                if (previous.value) {
                    element.style.setProperty(property, previous.value, previous.priority || '');
                } else {
                    element.style.removeProperty(property);
                }
            }
        }
        this._iconStyleOverrides.clear();
    }

    _findIconClassTargets(entry) {
        const selectors = entry.matchSelectors?.length ? entry.matchSelectors : [entry.selector];
        const targets = new Set();
        const rememberedTarget = this._getRememberedDynamicIconTarget(entry);
        if (rememberedTarget) this._addIconClassTarget(targets, rememberedTarget);

        for (const selector of selectors) {
            let elements = [];
            try {
                elements = Array.from(document.querySelectorAll(selector));
            } catch (_error) {
                continue;
            }

            for (const element of elements) {
                this._addIconClassTarget(targets, element);
            }
        }

        return targets;
    }

    _addIconClassTarget(targets, element) {
        if (!element) return;
        if (this._isFontAwesomeElement(element)) {
            targets.add(element);
            return;
        }

        element.querySelectorAll?.(FA_ICON_SELECTOR).forEach(icon => {
            if (this._isFontAwesomeElement(icon)) targets.add(icon);
        });
    }

    _getRememberedDynamicIconTarget(entry) {
        if (!entry?.dynamic || !entry.id) return null;
        const target = this._dynamicIconTargets.get(entry.id);
        if (!target?.isConnected) return null;
        return target;
    }

    _replaceFontAwesomeClasses(element, replacementClasses) {
        if (!element?.classList) return;

        if (!this._iconClassOverrides.has(element)) {
            this._iconClassOverrides.set(element, element.getAttribute('class') || '');
        }
        for (const className of Array.from(element.classList)) {
            if (FONT_AWESOME_CLASS_PATTERN.test(className)) {
                element.classList.remove(className);
            }
        }
        element.classList.add(...replacementClasses);
    }

    _clearIconClassOverrides() {
        for (const [element, className] of this._iconClassOverrides.entries()) {
            if (!element?.setAttribute) continue;
            if (className) {
                element.setAttribute('class', className);
            } else {
                element.removeAttribute('class');
            }
        }
        this._iconClassOverrides.clear();
    }

    _normalizeIconClassList(value) {
        if (typeof value !== 'string') return [];
        const classes = value
            .trim()
            .split(/\s+/)
            .map(className => className.replace(/[^a-z0-9_-]/gi, ''))
            .filter(Boolean);
        if (!classes.some(className => className.startsWith('fa-'))) return [];
        if (!classes.some(className => [
            'fa',
            'fas',
            'far',
            'fal',
            'fad',
            'fab',
            'fat',
            'fass',
            'fasr',
            'fasl',
            'fa-solid',
            'fa-regular',
            'fa-light',
            'fa-thin',
            'fa-duotone',
            'fa-brands'
        ].includes(className))) {
            classes.unshift('fas');
        }
        return [...new Set(classes)];
    }

    _isFontAwesomeElement(element) {
        return Boolean(element?.classList && Array.from(element.classList).some(className => (
            className === 'fa'
            || className.startsWith('fa-')
            || ['fas', 'far', 'fal', 'fad', 'fab', 'fat', 'fass', 'fasr', 'fasl'].includes(className)
        )));
    }

    _buildComponentLayoutCss(component, layout = {}) {
        const rules = [];

        if (component.id === 'sidebar' && Number.isFinite(layout?.width) && component.resize) {
            const width = Math.round(layout.width);
            rules.push(`--sidebar-width: ${width}px !important;`);
            rules.push(`--yf-sidebar-layout-width: ${width}px;`);
            rules.push(`width: calc(${width}px + var(--yf-sidebar-rail-width, 54px)) !important;`);
            rules.push(`max-width: calc(${width}px + var(--yf-sidebar-rail-width, 54px)) !important;`);
        } else if (Number.isFinite(layout?.width) && component.resize) {
            rules.push(`width: ${Math.round(layout.width)}px !important;`);
            rules.push(`max-width: ${Math.round(layout.width)}px !important;`);
        }

        if (Number.isFinite(layout?.height) && component.resize === 'both') {
            rules.push(`height: ${Math.round(layout.height)}px !important;`);
            rules.push(`max-height: ${Math.round(layout.height)}px !important;`);
        }

        // Sidebar transform is driven by CSS custom properties (not inline styles)
        // so the .yf-sidebar-expanded guard can disable it and preserve Foundry's collapse.
        if (component.id === 'sidebar') {
            rules.push('transform: translate(var(--yf-sidebar-tx, 0px), var(--yf-sidebar-ty, 0px)) scale(var(--yf-sidebar-scale, 1));');
            rules.push('transform-origin: top left;');
        }

        if (!rules.length) return '';

        // For the sidebar, only apply when expanded (our own class, version-agnostic).
        const selector = component.id === 'sidebar'
            ? `${this._scopeSelector(component.selector)}.yf-sidebar-expanded`
            : this._scopeSelector(component.selector);

        return `${selector} { ${rules.join(' ')} }`;
    }

    _buildComponentStyleCss(component, style = {}) {
        const rules = [];

        if (Number.isFinite(style?.opacity) && style.opacity < 100) {
            rules.push(`opacity: ${this._clamp(style.opacity, 10, 100) / 100} !important;`);
        }

        if (style?.backgroundImage) {
            const bgOpacity = this._clamp(style.backgroundOpacity ?? 100, 10, 100) / 100;
            rules.push(`background-image: linear-gradient(rgba(0,0,0,${1 - bgOpacity}), rgba(0,0,0,${1 - bgOpacity})), url("${style.backgroundImage}") !important;`);
            rules.push('background-size: cover !important;');
            rules.push('background-position: center !important;');
        }

        if (component.id !== 'controls' && style?.borderStyle && style.borderStyle !== 'none' && style.borderWidth > 0) {
            const borderColor = style.borderColor || 'var(--yf-foundry-accent-medium)';
            rules.push(`border: ${style.borderWidth}px ${style.borderStyle} ${borderColor} !important;`);
        }

        if (Number.isFinite(style?.borderRadius) && style.borderRadius > 0) {
            rules.push(`border-radius: ${style.borderRadius}px !important;`);
        }

        if (!rules.length) return '';
        return `${this._scopeSelector(component.selector)} { ${rules.join(' ')} }`;
    }

    _buildPauseCss(config) {
        const { pause, theme } = config;
        const visualMode = this._normalizePauseVisualMode(pause.visualMode);
        const motion = this._normalizePauseMotionMode(pause.motion);
        const labelPlacement = this._normalizePauseLabelPlacement(pause.labelPlacement);
        const blendMode = this._normalizePauseBlendMode(pause.blendMode);
        const symbolFilterMode = this._normalizePauseSymbolFilter(pause.symbolFilter);
        const modeStyle = this._getPauseModeStyle(visualMode, theme, pause);
        const pauseScale = this._clamp(pause.scale, 40, 300) / 100;
        const pauseOpacity = this._clamp(pause.opacity, 10, 100) / 100;
        const pauseBarColor = this._hexToRgba(pause.barColor, this._clamp(pause.barOpacity, 0, 100) / 100);
        const pauseBarHeight = this._clamp(pause.barHeight, 80, 360);
        const pauseBarWidth = this._clamp(pause.barWidth, 35, 100);
        const pauseBarBlur = this._clamp(pause.barBlur, 0, 16);
        const pauseBarRadius = this._getPauseBarRadius(this._normalizePauseBarShape(pause.barShape), modeStyle);
        const pauseBarBorderStrength = this._clamp(pause.barBorderStrength, 0, 100);
        const pausePositionX = this._clamp(pause.positionX, 10, 90);
        const pausePositionY = this._clamp(pause.positionY, 20, 80);
        const pauseRotation = this._clamp(pause.rotation, -180, 180);
        const pauseLabelSize = this._clamp(pause.labelSize, 12, 60);
        const pauseLabelWeight = this._normalizePauseLabelWeight(pause.labelWeight);
        const pauseLabelSpacing = this._clamp(pause.labelLetterSpacing, 0, 24);
        const pauseLabelOffsetY = this._clamp(pause.labelOffsetY, -120, 120);
        const pauseLabelGlow = this._clamp(pause.labelGlow, 0, 100);
        const pauseGlowStrength = this._clamp(pause.glowStrength, 0, 100);
        const pauseShadowStrength = this._clamp(pause.shadowStrength, 0, 100);
        const pauseLabelFont = pause.labelFont && pause.labelFont !== 'inherit'
            ? this._fontStack(pause.labelFont)
            : 'var(--font-serif)';
        const pauseEffect = this._normalizePauseEffect(pause.effect);
        const pauseEffectAnimation = this._getPauseEffectAnimation(pauseEffect, motion);
        const auraAnimation = this._getPauseAuraAnimation(visualMode, motion);
        const animationStrength = this._normalizePauseAnimationStrength(pause.animationStrength) / 100;
        const pulseScale = Math.min(3.4, pauseScale + (0.08 * animationStrength));
        const floatDistance = Math.round((motion === 'gentle' ? 8 : 18) * animationStrength);
        const swayDistance = Number(((motion === 'gentle' ? 3 : 7) * animationStrength).toFixed(2));
        const hasCustomAsset = Boolean(pause.enabled && String(pause.assetPath || '').trim());
        const symbolFilter = this._getPauseSymbolFilter(symbolFilterMode, modeStyle, pauseShadowStrength, {
            includeModeFilter: !hasCustomAsset,
            includeShadow: !hasCustomAsset
        });
        const customAssetShadow = hasCustomAsset ? this._getPauseSymbolBoxShadow(pauseShadowStrength) : 'none';
        const labelShadow = this._getPauseLabelShadow(pause.labelColor, pauseLabelGlow);
        const barBorder = this._hexToRgba(modeStyle.borderColor, Math.max(0, Math.min(0.68, pauseBarBorderStrength / 100)));
        const symbolSize = 100;
        const labelTop = this._getPauseLabelTop(labelPlacement, pauseScale);
        const labelTranslateY = labelPlacement === 'overlay'
            ? `calc(-50% + ${pauseLabelOffsetY}px)`
            : `${pauseLabelOffsetY}px`;

        return `
${this._areaSelector(['pause'])},
${this._scopeSelector('#pause.yf-pause-enhanced')} {
    --yf-pause-symbol-scale: ${pauseScale};
    --yf-pause-symbol-pulse-scale: ${pulseScale};
    --yf-pause-symbol-rotation: ${pauseRotation}deg;
    --yf-pause-symbol-x: ${pausePositionX}%;
    --yf-pause-symbol-y: 50%;
    --yf-pause-float-distance: ${floatDistance}px;
    --yf-pause-sway-distance: ${swayDistance}deg;
    height: ${pauseBarHeight}px !important;
    top: calc(${pausePositionY}vh - ${Math.round(pauseBarHeight / 2)}px) !important;
    background: transparent !important;
    isolation: isolate;
    overflow: visible !important;
    pointer-events: none !important;
}

${this._scopeSelector('#pause.yf-pause-enhanced.paused')} {
    animation: none !important;
}

${this._scopeSelector('#pause.yf-pause-enhanced::before')} {
    content: '';
    position: absolute;
    z-index: 0;
    left: 50%;
    top: 50%;
    width: ${pauseBarWidth}vw;
    max-width: 100vw;
    height: 100%;
    transform: translate(-50%, -50%);
    border-top: ${pauseBarBorderStrength > 0 ? 1 : 0}px solid ${barBorder};
    border-bottom: ${pauseBarBorderStrength > 0 ? 1 : 0}px solid ${barBorder};
    border-radius: ${pauseBarRadius};
    background: ${modeStyle.barBackground(pauseBarColor)};
    box-shadow: ${modeStyle.barShadow(pauseGlowStrength)};
    backdrop-filter: blur(${pauseBarBlur}px);
    -webkit-backdrop-filter: blur(${pauseBarBlur}px);
    pointer-events: none;
}

${this._scopeSelector('#pause.yf-pause-enhanced::after')} {
    content: '';
    position: absolute;
    z-index: 1;
    left: ${pausePositionX}%;
    top: 50%;
    width: ${Math.round(150 + pauseGlowStrength * 2.8)}px;
    height: ${Math.round(150 + pauseGlowStrength * 2.8)}px;
    transform: translate(-50%, -50%);
    border-radius: ${modeStyle.haloRadius};
    background: ${modeStyle.haloBackground};
    opacity: ${Math.max(0, Math.min(0.92, pauseGlowStrength / 100))};
    filter: blur(${modeStyle.haloBlur}px);
    mix-blend-mode: ${modeStyle.haloBlend};
    box-shadow: ${modeStyle.haloShadow(pauseGlowStrength)};
    animation: ${auraAnimation};
    pointer-events: none;
}

${this._scopeSelector('#pause.yf-pause-custom > img')} {
    display: none !important;
}

${this._scopeSelector('#pause.yf-pause-enhanced > img')},
${this._scopeSelector('#pause.yf-pause-enhanced .yf-pause-media')} {
    position: absolute !important;
    z-index: 2;
    left: var(--yf-pause-symbol-x) !important;
    top: var(--yf-pause-symbol-y) !important;
    width: ${symbolSize}px;
    height: ${symbolSize}px;
    max-width: min(70vw, 900px);
    max-height: min(50vh, 520px);
    transform: translate(-50%, -50%) scale(var(--yf-pause-symbol-scale)) rotate(var(--yf-pause-symbol-rotation));
    transform-origin: center;
    opacity: ${pauseOpacity};
    filter: ${symbolFilter || 'none'};
    mix-blend-mode: ${blendMode};
    box-shadow: ${customAssetShadow};
    pointer-events: none;
    animation: ${pauseEffectAnimation};
}

${this._scopeSelector('#pause.yf-pause-enhanced > img')} {
    border: 0 !important;
    box-shadow: none !important;
}

${this._scopeSelector('#pause.yf-pause-enhanced .yf-pause-media')} {
    width: auto;
    height: auto;
}

${this._scopeSelector('#pause.yf-pause-enhanced .yf-pause-media-inner')} {
    display: block;
    transform-origin: center;
}

${this._scopeSelector('#pause.yf-pause-enhanced .yf-pause-media img')},
${this._scopeSelector('#pause.yf-pause-enhanced .yf-pause-media video')} {
    display: block;
    width: auto !important;
    height: auto !important;
    max-width: min(70vw, 900px) !important;
    max-height: min(50vh, 520px) !important;
    object-fit: contain !important;
    object-position: center !important;
    opacity: 1 !important;
    filter: none !important;
    mix-blend-mode: normal !important;
    transform: none !important;
    animation: none !important;
    border: 0 !important;
    border-radius: ${modeStyle.assetRadius};
    box-shadow: none !important;
}

${this._scopeSelector('#pause.yf-pause-enhanced figcaption')} {
    display: ${pause.hideLabel ? 'none' : 'block'} !important;
    position: absolute !important;
    z-index: 3;
    left: ${pausePositionX}% !important;
    top: ${labelTop} !important;
    width: min(92vw, 900px);
    max-width: min(92vw, 900px);
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden;
    color: ${pause.labelColor} !important;
    font-family: ${pauseLabelFont} !important;
    font-size: ${pauseLabelSize}px !important;
    font-weight: ${pauseLabelWeight} !important;
    letter-spacing: ${pauseLabelSpacing}px !important;
    line-height: 1.1 !important;
    text-align: center;
    text-overflow: ellipsis;
    text-shadow: ${labelShadow};
    text-transform: ${pause.labelUppercase ? 'uppercase' : 'none'} !important;
    transform: translate(-50%, ${labelTranslateY}) !important;
    white-space: nowrap;
    pointer-events: none;
}

@keyframes yf-pause-spin {
    from { transform: translate(-50%, -50%) scale(var(--yf-pause-symbol-scale)) rotate(var(--yf-pause-symbol-rotation)); }
    to { transform: translate(-50%, -50%) scale(var(--yf-pause-symbol-scale)) rotate(calc(var(--yf-pause-symbol-rotation) + 360deg)); }
}

@keyframes yf-pause-pulse {
    0%, 100% { transform: translate(-50%, -50%) scale(var(--yf-pause-symbol-scale)) rotate(var(--yf-pause-symbol-rotation)); }
    50% { transform: translate(-50%, -50%) scale(var(--yf-pause-symbol-pulse-scale)) rotate(var(--yf-pause-symbol-rotation)); }
}

@keyframes yf-pause-float {
    0%, 100% { transform: translate(-50%, -50%) scale(var(--yf-pause-symbol-scale)) rotate(var(--yf-pause-symbol-rotation)); }
    50% { transform: translate(-50%, calc(-50% - var(--yf-pause-float-distance))) scale(var(--yf-pause-symbol-scale)) rotate(var(--yf-pause-symbol-rotation)); }
}

@keyframes yf-pause-sway {
    0%, 100% { transform: translate(-50%, -50%) scale(var(--yf-pause-symbol-scale)) rotate(var(--yf-pause-symbol-rotation)); }
    25% { transform: translate(-50%, -50%) scale(var(--yf-pause-symbol-scale)) rotate(calc(var(--yf-pause-symbol-rotation) - var(--yf-pause-sway-distance))); }
    75% { transform: translate(-50%, -50%) scale(var(--yf-pause-symbol-scale)) rotate(calc(var(--yf-pause-symbol-rotation) + var(--yf-pause-sway-distance))); }
}

@keyframes yf-pause-aura-breathe {
    0%, 100% { opacity: ${Math.max(0.04, Math.min(0.88, pauseGlowStrength / 120))}; transform: translate(-50%, -50%) scale(0.98); }
    50% { opacity: ${Math.max(0.08, Math.min(0.96, pauseGlowStrength / 92))}; transform: translate(-50%, -50%) scale(1.04); }
}

@keyframes yf-pause-aura-shimmer {
    0%, 100% { filter: blur(${modeStyle.haloBlur}px) hue-rotate(0deg); transform: translate(-50%, -50%) scale(0.98); }
    50% { filter: blur(${modeStyle.haloBlur + 1}px) hue-rotate(16deg); transform: translate(-50%, -50%) scale(1.05); }
}

@media (prefers-reduced-motion: reduce) {
    ${this._scopeSelector('#pause.yf-pause-enhanced.paused')},
    ${this._scopeSelector('#pause.yf-pause-enhanced::after')},
    ${this._scopeSelector('#pause.yf-pause-enhanced > img')},
    ${this._scopeSelector('#pause.yf-pause-enhanced .yf-pause-media')} {
        animation: none !important;
    }
}
`;
    }

    /* -------------------------------------------- */
    /*  Pause Customization                          */
    /* -------------------------------------------- */

    _applyPauseCustomization(config) {
        const pauseElement = document.querySelector('#pause');
        if (!pauseElement) return;

        this._clearPauseCustomization();

        const categories = config.categories || {};
        if (categories.pause === false) return;
        if (this._usesGranularFieldOverrides(config) && !this._hasFieldOverridePrefix(config, 'pause.')) return;

        const visibilityEnabled = categories.visibility !== false;
        const pauseVisible = config.enabled && (!visibilityEnabled || config.visibility?.pause !== false);
        if (!this._isAreaEnabled(config, 'pause')) return;
        if (!pauseVisible) return;

        const visualMode = this._normalizePauseVisualMode(config.pause?.visualMode);
        const labelPlacement = this._normalizePauseLabelPlacement(config.pause?.labelPlacement);
        pauseElement.classList.add('yf-pause-enhanced', `yf-pause-mode-${visualMode}`, `yf-pause-label-${labelPlacement}`);
        pauseElement.dataset.yfPauseMode = visualMode;
        pauseElement.dataset.yfPauseMotion = this._normalizePauseMotionMode(config.pause?.motion);

        const figcaption = pauseElement.querySelector('figcaption');
        if (figcaption) {
            figcaption.dataset.yfOriginalText ||= figcaption.textContent?.trim() || game.i18n.localize('GAME.Paused');
            figcaption.textContent = config.pause?.labelText?.trim() || figcaption.dataset.yfOriginalText;
        }

        const enabled = config.pause?.enabled && config.pause?.assetPath;
        if (!enabled) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'yf-pause-media';
        const inner = document.createElement('div');
        inner.className = 'yf-pause-media-inner';

        if (this._isVideoAsset(config.pause.assetPath)) {
            const video = document.createElement('video');
            video.src = config.pause.assetPath;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            inner.appendChild(video);
        } else {
            const image = document.createElement('img');
            image.src = config.pause.assetPath;
            image.alt = 'Custom pause';
            inner.appendChild(image);
        }

        wrapper.appendChild(inner);
        pauseElement.prepend(wrapper);
        pauseElement.classList.add('yf-pause-custom');
    }

    _clearPauseCustomization() {
        const pauseElement = document.querySelector('#pause');
        if (!pauseElement) return;

        pauseElement.classList.remove('yf-pause-custom', 'yf-pause-enhanced');
        for (const className of Array.from(pauseElement.classList)) {
            if (className.startsWith('yf-pause-mode-') || className.startsWith('yf-pause-label-')) {
                pauseElement.classList.remove(className);
            }
        }
        delete pauseElement.dataset.yfPauseMode;
        delete pauseElement.dataset.yfPauseMotion;
        pauseElement.querySelectorAll('.yf-pause-media').forEach(element => element.remove());

        const figcaption = pauseElement.querySelector('figcaption');
        if (figcaption?.dataset?.yfOriginalText) {
            figcaption.textContent = figcaption.dataset.yfOriginalText;
            delete figcaption.dataset.yfOriginalText;
        }
    }

    _usesGranularFieldOverrides(config = {}) {
        return this._isPlainObject(config?.fieldOverrides);
    }

    _hasFieldOverride(config = {}, path = '') {
        return config?.fieldOverrides?.[path] === true;
    }

    _hasFieldOverridePrefix(config = {}, prefix = '') {
        if (!this._usesGranularFieldOverrides(config)) return true;
        return Object.keys(config.fieldOverrides || {}).some(path => path.startsWith(prefix));
    }

    _sanitizeFieldOverrides(fieldOverrides = {}) {
        if (!this._isPlainObject(fieldOverrides)) return {};
        return Object.entries(fieldOverrides).reduce((sanitized, [path, enabled]) => {
            if (enabled !== true) return sanitized;
            const normalizedPath = String(path || '').trim();
            if (!normalizedPath || normalizedPath.length > 180 || /[^a-zA-Z0-9_.-]/.test(normalizedPath)) return sanitized;
            sanitized[normalizedPath] = true;
            return sanitized;
        }, {});
    }

    _resolveThemeForCss(theme = {}) {
        const source = this._isPlainObject(theme) ? theme : {};
        return {
            ...FOUNDRY_STOCK_THEME_FALLBACK,
            ...Object.fromEntries(FOUNDRY_THEME_FIELD_IDS.map(fieldId => {
                const fallback = FOUNDRY_STOCK_THEME_FALLBACK[fieldId];
                const value = FOUNDRY_THEME_FONT_FIELDS.includes(fieldId)
                    ? this._normalizeFont(source[fieldId], fallback)
                    : this._normalizeColor(source[fieldId], fallback);
                return [fieldId, value];
            }))
        };
    }

    _stripNonOverriddenFoundryFields(config = {}) {
        if (!this._usesGranularFieldOverrides(config)) return config;
        config.fieldOverrides = this._sanitizeFieldOverrides(config.fieldOverrides);

        config.theme ||= {};
        for (const fieldId of FOUNDRY_THEME_FIELD_IDS) {
            const path = `theme.${fieldId}`;
            if (!this._hasFieldOverride(config, path)) {
                config.theme[fieldId] = this._getStockFieldValue(path, config.theme[fieldId]);
            }
        }

        config.layout ||= {};
        for (const component of FOUNDRY_UI_COMPONENTS) {
            if (component.id === 'pause') continue;
            config.layout[component.id] ||= {};
            for (const fieldId of FOUNDRY_LAYOUT_FIELD_IDS) {
                const path = `layout.${component.id}.${fieldId}`;
                if (!this._hasFieldOverride(config, path)) config.layout[component.id][fieldId] = null;
            }
        }

        config.componentStyles ||= {};
        for (const component of FOUNDRY_UI_COMPONENTS) {
            if (component.id === 'pause') continue;
            config.componentStyles[component.id] ||= {};
            for (const fieldId of FOUNDRY_COMPONENT_STYLE_FIELD_IDS) {
                const path = `componentStyles.${component.id}.${fieldId}`;
                if (!this._hasFieldOverride(config, path)) {
                    config.componentStyles[component.id][fieldId] = this._getStockFieldValue(path, config.componentStyles[component.id][fieldId]);
                }
            }
        }

        for (const sectionId of FOUNDRY_SHELL_SECTION_IDS) {
            config[sectionId] ||= {};
            const defaults = DEFAULT_FOUNDRY_CUSTOMIZATION[sectionId] || {};
            for (const fieldId of Object.keys(defaults)) {
                const path = `${sectionId}.${fieldId}`;
                if (!this._hasFieldOverride(config, path)) {
                    config[sectionId][fieldId] = this._getStockFieldValue(path, config[sectionId][fieldId]);
                }
            }
        }

        config.pause ||= {};
        for (const fieldId of Object.keys(DEFAULT_FOUNDRY_CUSTOMIZATION.pause || {})) {
            const path = `pause.${fieldId}`;
            if (!this._hasFieldOverride(config, path)) {
                config.pause[fieldId] = this._getStockFieldValue(path, config.pause[fieldId]);
            }
        }
        config.pause.enabled = Boolean(config.pause.enabled);
        config.pause.assetPath = typeof config.pause.assetPath === 'string' ? config.pause.assetPath : '';

        config.icons ||= {};
        config.icons.groups ||= {};
        for (const [groupId, group] of Object.entries(config.icons.groups)) {
            for (const fieldId of FOUNDRY_ICON_COLOR_FIELD_IDS) {
                const path = `icons.groups.${groupId}.${fieldId}`;
                if (!this._hasFieldOverride(config, path)) group[fieldId] = null;
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

        return config;
    }

    _getStockFieldValue(path, currentValue = null) {
        if (path === 'theme.interfaceFont' || path === 'theme.windowFont') return 'inherit';
        if (path.endsWith('.enabled') || path === 'pause.enabled') return false;
        if (path.endsWith('.assetPath') || path.endsWith('.backgroundImage') || path === 'customCss') return '';
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

    _isPlainObject(value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    }

    /* -------------------------------------------- */
    /*  Config Sanitization                          */
    /* -------------------------------------------- */

    _sanitizeConfig(config) {
        const sourceIcons = config?.icons
            ? foundry.utils.deepClone(config.icons)
            : null;
        const sourceFieldOverrides = this._isPlainObject(config?.fieldOverrides)
            ? this._sanitizeFieldOverrides(config.fieldOverrides)
            : null;
        const merged = foundry.utils.mergeObject(
            foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION),
            foundry.utils.deepClone(config || {})
        );
        if (sourceFieldOverrides !== null) merged.fieldOverrides = sourceFieldOverrides;

        merged.enabled = Boolean(merged.enabled);

        // Categories
        const catDefaults = DEFAULT_FOUNDRY_CUSTOMIZATION.categories;
        for (const key of Object.keys(catDefaults)) {
            merged.categories[key] = merged.categories[key] !== false;
        }

        merged.areaEnabled ||= {};
        const areaDefaults = DEFAULT_FOUNDRY_CUSTOMIZATION.areaEnabled;
        for (const key of Object.keys(areaDefaults)) {
            merged.areaEnabled[key] = merged.areaEnabled[key] !== false;
        }
        delete merged.areaEnabled.directories;
        delete merged.areas?.directories;

        // Theme
        const theme = merged.theme;
        theme.fontColor = this._normalizeColor(theme.fontColor, DEFAULT_FOUNDRY_CUSTOMIZATION.theme.fontColor);
        theme.secondaryFontColor = this._normalizeColor(theme.secondaryFontColor, DEFAULT_FOUNDRY_CUSTOMIZATION.theme.secondaryFontColor);
        theme.surfaceBackground = this._normalizeColor(theme.surfaceBackground, DEFAULT_FOUNDRY_CUSTOMIZATION.theme.surfaceBackground);
        theme.windowBackground = this._normalizeColor(theme.windowBackground, DEFAULT_FOUNDRY_CUSTOMIZATION.theme.windowBackground);
        theme.windowHeaderBackground = this._normalizeColor(theme.windowHeaderBackground, DEFAULT_FOUNDRY_CUSTOMIZATION.theme.windowHeaderBackground);
        theme.accentColor = this._normalizeColor(theme.accentColor, DEFAULT_FOUNDRY_CUSTOMIZATION.theme.accentColor);
        theme.chatTint = this._normalizeColor(theme.chatTint, DEFAULT_FOUNDRY_CUSTOMIZATION.theme.chatTint);
        theme.iconColor = this._normalizeColor(theme.iconColor, DEFAULT_FOUNDRY_CUSTOMIZATION.theme.iconColor);
        theme.iconHoverColor = this._normalizeColor(theme.iconHoverColor, DEFAULT_FOUNDRY_CUSTOMIZATION.theme.iconHoverColor);
        theme.scrollbarColor = this._normalizeColor(theme.scrollbarColor, DEFAULT_FOUNDRY_CUSTOMIZATION.theme.scrollbarColor);
        theme.interfaceFont = this._normalizeFont(theme.interfaceFont, DEFAULT_FOUNDRY_CUSTOMIZATION.theme.interfaceFont);
        theme.windowFont = this._normalizeFont(theme.windowFont, DEFAULT_FOUNDRY_CUSTOMIZATION.theme.windowFont);
        merged.icons = normalizeLegacyIcons({
            ...merged,
            icons: sourceIcons ?? merged.icons
        });
        merged.sceneNavigation = normalizeSceneNavigationConfig(merged.sceneNavigation);
        merged.tokenControls = normalizeTokenControlsConfig(merged.tokenControls);
        merged.hotbar = normalizeHotbarConfig(merged.hotbar);
        merged.sidebar = normalizeSidebarConfig(merged.sidebar);
        merged.chatLog = normalizeChatLogConfig(config?.chatLog ?? config?.areas?.chatLog?.chatLog ?? merged.chatLog);
        merged.playersList = normalizePlayersListConfig(config?.playersList ?? config?.areas?.players?.playersList ?? merged.playersList);
        merged.windows = normalizeWindowsConfig(config?.windows ?? config?.areas?.windows?.windows ?? merged.windows);
        merged.areas ||= {};
        merged.areas.sidebar ||= {};
        merged.areas.sidebar.sidebar = foundry.utils.deepClone(merged.sidebar);
        merged.areas.chatLog ||= {};
        merged.areas.chatLog.chatLog = foundry.utils.deepClone(merged.chatLog);
        merged.areas.players ||= {};
        merged.areas.players.playersList = foundry.utils.deepClone(merged.playersList);
        merged.areas.windows ||= {};
        merged.areas.windows.windows = foundry.utils.deepClone(merged.windows);

        // Visibility
        for (const component of FOUNDRY_UI_COMPONENTS) {
            merged.visibility[component.id] = Boolean(merged.visibility[component.id]);
        }

        // Layout
        for (const component of FOUNDRY_UI_COMPONENTS) {
            if (component.id === 'pause') continue;

            const layout = merged.layout[component.id] ||= {};
            layout.x = Number.isFinite(layout.x) ? Math.round(layout.x) : null;
            layout.y = Number.isFinite(layout.y) ? Math.round(layout.y) : null;
            if (component.id === 'hotbar') {
                layout.x = null;
                layout.y = null;
            }
            layout.width = Number.isFinite(layout.width)
                ? this._clamp(layout.width, component.minWidth ?? 120, this._getLayoutMaxWidth(component))
                : DEFAULT_FOUNDRY_CUSTOMIZATION.layout[component.id].width;
            layout.height = Number.isFinite(layout.height)
                ? this._clamp(layout.height, component.minHeight ?? 160, this._getLayoutMaxHeight(component))
                : DEFAULT_FOUNDRY_CUSTOMIZATION.layout[component.id].height;
            layout.scale = Number.isFinite(layout.scale)
                ? this._clamp(layout.scale, 60, 160)
                : DEFAULT_FOUNDRY_CUSTOMIZATION.layout[component.id].scale;
        }

        // Component Styles
        const defaultStyle = DEFAULT_FOUNDRY_CUSTOMIZATION.componentStyles;
        for (const component of FOUNDRY_UI_COMPONENTS) {
            if (component.id === 'pause') continue;
            const style = merged.componentStyles[component.id] ||= {};
            style.opacity = Number.isFinite(style.opacity) ? this._clamp(style.opacity, 10, 100) : 100;
            style.backgroundImage = typeof style.backgroundImage === 'string' ? style.backgroundImage.trim() : '';
            style.backgroundOpacity = Number.isFinite(style.backgroundOpacity) ? this._clamp(style.backgroundOpacity, 10, 100) : 100;
            style.borderColor = this._normalizeColor(style.borderColor, '') || '';
            style.borderWidth = Number.isFinite(style.borderWidth) ? this._clamp(style.borderWidth, 0, 10) : 0;
            style.borderStyle = ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge'].includes(style.borderStyle) ? style.borderStyle : 'none';
            style.borderRadius = Number.isFinite(style.borderRadius) ? this._clamp(style.borderRadius, 0, 50) : 0;
        }

        // Pause
        merged.pause.enabled = Boolean(merged.pause.enabled);
        merged.pause.assetPath = typeof merged.pause.assetPath === 'string' ? merged.pause.assetPath.trim() : '';
        merged.pause.visualMode = this._normalizePauseVisualMode(merged.pause.visualMode);
        merged.pause.effect = this._normalizePauseEffect(merged.pause.effect);
        merged.pause.motion = this._normalizePauseMotionMode(merged.pause.motion);
        merged.pause.animationStrength = this._normalizePauseAnimationStrength(merged.pause.animationStrength);
        merged.pause.opacity = this._clamp(merged.pause.opacity, 10, 100);
        merged.pause.scale = this._clamp(merged.pause.scale, 40, 300);
        merged.pause.positionX = this._clamp(merged.pause.positionX, 10, 90);
        merged.pause.positionY = this._clamp(merged.pause.positionY, 20, 80);
        merged.pause.rotation = this._clamp(merged.pause.rotation, -180, 180);
        merged.pause.blendMode = this._normalizePauseBlendMode(merged.pause.blendMode);
        merged.pause.symbolFilter = this._normalizePauseSymbolFilter(merged.pause.symbolFilter);
        merged.pause.glowStrength = this._clamp(merged.pause.glowStrength, 0, 100);
        merged.pause.shadowStrength = this._clamp(merged.pause.shadowStrength, 0, 100);
        merged.pause.hideLabel = Boolean(merged.pause.hideLabel);
        merged.pause.labelText = typeof merged.pause.labelText === 'string' ? merged.pause.labelText.trim() : '';
        merged.pause.labelFont = this._normalizeFont(merged.pause.labelFont, DEFAULT_FOUNDRY_CUSTOMIZATION.pause.labelFont);
        merged.pause.labelColor = this._normalizeColor(merged.pause.labelColor, DEFAULT_FOUNDRY_CUSTOMIZATION.pause.labelColor);
        merged.pause.labelSize = this._clamp(merged.pause.labelSize, 12, 60);
        merged.pause.labelWeight = this._normalizePauseLabelWeight(merged.pause.labelWeight);
        merged.pause.labelUppercase = merged.pause.labelUppercase !== false;
        merged.pause.labelLetterSpacing = this._clamp(merged.pause.labelLetterSpacing, 0, 24);
        merged.pause.labelOffsetY = this._clamp(merged.pause.labelOffsetY, -120, 120);
        merged.pause.labelPlacement = this._normalizePauseLabelPlacement(merged.pause.labelPlacement);
        merged.pause.labelGlow = this._clamp(merged.pause.labelGlow, 0, 100);
        merged.pause.barColor = this._normalizeColor(merged.pause.barColor, DEFAULT_FOUNDRY_CUSTOMIZATION.pause.barColor);
        merged.pause.barOpacity = this._clamp(merged.pause.barOpacity, 0, 100);
        merged.pause.barHeight = this._clamp(merged.pause.barHeight, 80, 360);
        merged.pause.barWidth = this._clamp(merged.pause.barWidth, 35, 100);
        merged.pause.barBlur = this._clamp(merged.pause.barBlur, 0, 16);
        merged.pause.barShape = this._normalizePauseBarShape(merged.pause.barShape);
        merged.pause.barBorderStrength = this._clamp(merged.pause.barBorderStrength, 0, 100);

        // Custom CSS
        merged.customCss = typeof merged.customCss === 'string' ? merged.customCss : '';

        if (this._usesGranularFieldOverrides(merged)) {
            this._stripNonOverriddenFoundryFields(merged);
        }

        return merged;
    }

    /* -------------------------------------------- */
    /*  Utility Methods                              */
    /* -------------------------------------------- */

    _getLayoutMaxWidth(component) {
        const viewportWidth = globalThis.innerWidth || 1920;
        return Math.max(component.maxWidth ?? 1600, Math.round(viewportWidth * 0.9));
    }

    _getLayoutMaxHeight(component) {
        const viewportHeight = globalThis.innerHeight || 1080;
        return Math.max(component.maxHeight ?? 1600, Math.round(viewportHeight * 1.5));
    }

    _normalizePauseEffect(value) {
        const allowed = new Set(['none', 'spin-slow', 'spin-fast', 'pulse', 'float', 'sway']);
        return allowed.has(value) ? value : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.effect;
    }

    _normalizePauseVisualMode(value) {
        return PAUSE_VISUAL_MODES.has(value) ? value : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.visualMode;
    }

    _normalizePauseMotionMode(value) {
        return PAUSE_MOTION_MODES.has(value) ? value : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.motion;
    }

    _normalizePauseAnimationStrength(value) {
        if (value === null || value === undefined || value === '') {
            return DEFAULT_FOUNDRY_CUSTOMIZATION.pause.animationStrength;
        }
        const numeric = Number(value);
        return Number.isFinite(numeric)
            ? this._clamp(numeric, 0, 200)
            : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.animationStrength;
    }

    _normalizePauseLabelPlacement(value) {
        return PAUSE_LABEL_PLACEMENTS.has(value) ? value : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.labelPlacement;
    }

    _normalizePauseSymbolFilter(value) {
        return PAUSE_SYMBOL_FILTERS.has(value) ? value : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.symbolFilter;
    }

    _normalizePauseBlendMode(value) {
        return PAUSE_BLEND_MODES.has(value) ? value : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.blendMode;
    }

    _normalizePauseBarShape(value) {
        return PAUSE_BAR_SHAPES.has(value) ? value : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.barShape;
    }

    _normalizePauseLabelWeight(value) {
        const numeric = Number(value);
        return PAUSE_LABEL_WEIGHTS.has(numeric) ? numeric : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.labelWeight;
    }

    _getPauseEffectAnimation(effect, motion = 'full') {
        if (motion === 'off') return 'none';
        const gentle = motion === 'gentle';
        switch (effect) {
            case 'spin-slow': return `yf-pause-spin ${gentle ? 20 : 12}s linear infinite`;
            case 'spin-fast': return `yf-pause-spin ${gentle ? 8 : 4}s linear infinite`;
            case 'pulse': return `yf-pause-pulse ${gentle ? 3.6 : 2.2}s ease-in-out infinite`;
            case 'float': return `yf-pause-float ${gentle ? 4.8 : 3}s ease-in-out infinite`;
            case 'sway': return `yf-pause-sway ${gentle ? 5 : 3.2}s ease-in-out infinite`;
            default: return 'none';
        }
    }

    _getPauseAuraAnimation(visualMode, motion = 'full') {
        if (motion === 'off' || visualMode === 'minimal-utility') return 'none';
        const duration = motion === 'gentle' ? 7.5 : 4.5;
        const keyframe = ['neon-breach', 'arcane-seal', 'solar-anima'].includes(visualMode)
            ? 'yf-pause-aura-shimmer'
            : 'yf-pause-aura-breathe';
        return `${keyframe} ${duration}s ease-in-out infinite`;
    }

    _getPauseLabelTop(placement, scale) {
        const distance = Math.round(68 * Math.max(0.78, Math.min(1.45, scale)));
        switch (placement) {
            case 'above': return `calc(50% - ${distance}px)`;
            case 'overlay': return '50%';
            default: return `calc(50% + ${distance}px)`;
        }
    }

    _getPauseLabelShadow(color, strength) {
        const alpha = Math.max(0, Math.min(0.95, strength / 100));
        if (alpha <= 0) return '0 2px 8px rgba(0, 0, 0, 0.45)';
        const glow = this._hexToRgba(color, alpha);
        return `0 2px 8px rgba(0, 0, 0, 0.55), 0 0 ${Math.round(8 + strength * 0.28)}px ${glow}`;
    }

    _getPauseSymbolFilter(filterMode, modeStyle, shadowStrength, { includeModeFilter = true, includeShadow = true } = {}) {
        const shadowAlpha = Math.max(0, Math.min(0.7, shadowStrength / 100));
        const shadow = `drop-shadow(0 ${Math.round(5 + shadowStrength * 0.08)}px ${Math.round(12 + shadowStrength * 0.38)}px rgba(0, 0, 0, ${shadowAlpha}))`;
        const filters = {
            none: '',
            radiant: 'brightness(1.16) saturate(1.18)',
            arcane: 'saturate(1.35) hue-rotate(18deg)',
            ember: 'sepia(0.28) saturate(1.45) hue-rotate(-10deg)',
            frost: 'brightness(1.12) saturate(0.76) hue-rotate(165deg)',
            shadow: 'brightness(0.72) contrast(1.22) saturate(0.8)',
            blood: 'sepia(0.46) saturate(1.75) hue-rotate(-34deg)',
            neon: 'brightness(1.18) saturate(1.8) contrast(1.08)'
        };
        return [
            filters[filterMode] || '',
            includeModeFilter ? modeStyle.symbolFilter : '',
            includeShadow ? shadow : ''
        ].filter(Boolean).join(' ');
    }

    _getPauseSymbolBoxShadow(shadowStrength) {
        const alpha = Math.max(0, Math.min(0.55, shadowStrength / 140));
        if (alpha <= 0) return 'none';
        return `0 ${Math.round(5 + shadowStrength * 0.08)}px ${Math.round(12 + shadowStrength * 0.38)}px rgba(0, 0, 0, ${alpha})`;
    }

    _getPauseBarRadius(shape, modeStyle) {
        switch (shape) {
            case 'square': return '0';
            case 'soft': return '6px';
            case 'rounded': return '24px';
            case 'pill': return '999px';
            default: return modeStyle.barRadius;
        }
    }

    _getPauseModeStyle(visualMode, theme = {}, pause = {}) {
        const accent = theme?.accentColor || DEFAULT_FOUNDRY_CUSTOMIZATION.theme.accentColor;
        const labelColor = pause?.labelColor || DEFAULT_FOUNDRY_CUSTOMIZATION.pause.labelColor;
        const mode = {
            cinematic: {
                accent,
                secondary: labelColor,
                barRadius: '999px',
                haloRadius: '50%',
                haloBlur: 9,
                haloBlend: 'screen',
                assetRadius: '10px',
                symbolFilter: 'saturate(1.08)',
                barBackground: bar => `linear-gradient(to right, transparent 0%, ${bar} 24%, ${bar} 76%, transparent 100%)`,
                barShadow: strength => `0 0 ${Math.round(10 + strength * 0.26)}px ${this._hexToRgba(accent, strength / 240)}`,
                haloBackground: `radial-gradient(circle, ${this._hexToRgba(accent, 0.52)} 0%, ${this._hexToRgba(labelColor, 0.18)} 34%, transparent 70%)`,
                haloShadow: strength => `0 0 ${Math.round(16 + strength * 0.38)}px ${this._hexToRgba(accent, strength / 140)}`
            },
            'arcane-seal': {
                accent: '#9f7cff',
                secondary: '#65f5d2',
                barRadius: '999px',
                haloRadius: '50%',
                haloBlur: 5,
                haloBlend: 'screen',
                assetRadius: '50%',
                symbolFilter: 'saturate(1.45) hue-rotate(12deg)',
                barBackground: bar => `repeating-linear-gradient(90deg, transparent 0 22px, ${this._hexToRgba('#9f7cff', 0.16)} 22px 24px), linear-gradient(to right, transparent 0%, ${bar} 22%, ${bar} 78%, transparent 100%)`,
                barShadow: strength => `inset 0 0 ${Math.round(8 + strength * 0.18)}px ${this._hexToRgba('#65f5d2', strength / 260)}`,
                haloBackground: `radial-gradient(circle, transparent 36%, ${this._hexToRgba('#65f5d2', 0.5)} 38%, transparent 42%, ${this._hexToRgba('#9f7cff', 0.28)} 58%, transparent 72%)`,
                haloShadow: strength => `0 0 ${Math.round(18 + strength * 0.44)}px ${this._hexToRgba('#9f7cff', strength / 135)}`
            },
            'parchment-sigil': {
                accent: '#c89a57',
                secondary: '#fff0c9',
                barRadius: '6px',
                haloRadius: '18px',
                haloBlur: 2,
                haloBlend: 'normal',
                assetRadius: '8px',
                symbolFilter: 'sepia(0.34) saturate(1.08)',
                barBackground: bar => `linear-gradient(90deg, transparent 0%, ${bar} 18%, ${this._hexToRgba('#f0d7a6', 0.2)} 50%, ${bar} 82%, transparent 100%)`,
                barShadow: strength => `0 0 ${Math.round(6 + strength * 0.18)}px ${this._hexToRgba('#f0d7a6', strength / 300)}`,
                haloBackground: `radial-gradient(ellipse, ${this._hexToRgba('#f0d7a6', 0.42)} 0%, ${this._hexToRgba('#7a5430', 0.16)} 55%, transparent 74%)`,
                haloShadow: strength => `0 0 ${Math.round(10 + strength * 0.28)}px ${this._hexToRgba('#c89a57', strength / 180)}`
            },
            'neon-breach': {
                accent: '#00e5ff',
                secondary: '#ff2bd6',
                barRadius: '2px',
                haloRadius: '16px',
                haloBlur: 4,
                haloBlend: 'screen',
                assetRadius: '6px',
                symbolFilter: 'brightness(1.2) saturate(1.8) contrast(1.08)',
                barBackground: bar => `linear-gradient(90deg, transparent 0%, ${this._hexToRgba('#ff2bd6', 0.28)} 21%, ${bar} 50%, ${this._hexToRgba('#00e5ff', 0.32)} 79%, transparent 100%)`,
                barShadow: strength => `0 0 ${Math.round(12 + strength * 0.34)}px ${this._hexToRgba('#00e5ff', strength / 140)}`,
                haloBackground: `linear-gradient(135deg, ${this._hexToRgba('#00e5ff', 0.52)}, transparent 45%, ${this._hexToRgba('#ff2bd6', 0.46)})`,
                haloShadow: strength => `0 0 ${Math.round(18 + strength * 0.55)}px ${this._hexToRgba('#ff2bd6', strength / 135)}`
            },
            'minimal-utility': {
                accent: '#d7dde8',
                secondary: '#8f9aaa',
                barRadius: '0',
                haloRadius: '50%',
                haloBlur: 12,
                haloBlend: 'normal',
                assetRadius: '4px',
                symbolFilter: 'saturate(0.8)',
                barBackground: bar => `linear-gradient(to right, transparent 0%, ${bar} 30%, ${bar} 70%, transparent 100%)`,
                barShadow: () => 'none',
                haloBackground: 'transparent',
                haloShadow: () => 'none'
            },
            'dark-ritual': {
                accent: '#8e2dff',
                secondary: '#1a0409',
                barRadius: '999px',
                haloRadius: '50%',
                haloBlur: 7,
                haloBlend: 'screen',
                assetRadius: '50%',
                symbolFilter: 'contrast(1.18) saturate(1.24)',
                barBackground: bar => `radial-gradient(circle at 50% 50%, ${this._hexToRgba('#8e2dff', 0.24)}, transparent 28%), linear-gradient(to right, transparent 0%, ${bar} 18%, ${this._hexToRgba('#1a0409', 0.82)} 50%, ${bar} 82%, transparent 100%)`,
                barShadow: strength => `inset 0 0 ${Math.round(12 + strength * 0.26)}px ${this._hexToRgba('#8e2dff', strength / 180)}`,
                haloBackground: `radial-gradient(circle, transparent 28%, ${this._hexToRgba('#8e2dff', 0.48)} 33%, ${this._hexToRgba('#1a0409', 0.36)} 56%, transparent 72%)`,
                haloShadow: strength => `0 0 ${Math.round(18 + strength * 0.42)}px ${this._hexToRgba('#8e2dff', strength / 145)}`
            },
            'divine-light': {
                accent: '#fff2a8',
                secondary: '#7fd7ff',
                barRadius: '999px',
                haloRadius: '50%',
                haloBlur: 12,
                haloBlend: 'screen',
                assetRadius: '14px',
                symbolFilter: 'brightness(1.22) saturate(1.1)',
                barBackground: bar => `linear-gradient(to right, transparent 0%, ${this._hexToRgba('#fff2a8', 0.26)} 18%, ${bar} 50%, ${this._hexToRgba('#7fd7ff', 0.22)} 82%, transparent 100%)`,
                barShadow: strength => `0 0 ${Math.round(14 + strength * 0.38)}px ${this._hexToRgba('#fff2a8', strength / 145)}`,
                haloBackground: `radial-gradient(circle, ${this._hexToRgba('#fff2a8', 0.62)} 0%, ${this._hexToRgba('#7fd7ff', 0.2)} 44%, transparent 72%)`,
                haloShadow: strength => `0 0 ${Math.round(22 + strength * 0.52)}px ${this._hexToRgba('#fff2a8', strength / 130)}`
            },
            'blood-moon': {
                accent: '#dc2f4f',
                secondary: '#ff9d7a',
                barRadius: '999px',
                haloRadius: '50%',
                haloBlur: 6,
                haloBlend: 'screen',
                assetRadius: '50%',
                symbolFilter: 'sepia(0.38) saturate(1.65) hue-rotate(-28deg)',
                barBackground: bar => `linear-gradient(to right, transparent 0%, ${bar} 18%, ${this._hexToRgba('#dc2f4f', 0.38)} 50%, ${bar} 82%, transparent 100%)`,
                barShadow: strength => `0 0 ${Math.round(10 + strength * 0.35)}px ${this._hexToRgba('#dc2f4f', strength / 145)}`,
                haloBackground: `radial-gradient(circle, ${this._hexToRgba('#dc2f4f', 0.5)} 0%, ${this._hexToRgba('#22050a', 0.42)} 58%, transparent 73%)`,
                haloShadow: strength => `0 0 ${Math.round(18 + strength * 0.45)}px ${this._hexToRgba('#dc2f4f', strength / 135)}`
            },
            'frost-stasis': {
                accent: '#9fe9ff',
                secondary: '#d8fbff',
                barRadius: '999px',
                haloRadius: '18px',
                haloBlur: 5,
                haloBlend: 'screen',
                assetRadius: '8px',
                symbolFilter: 'brightness(1.12) saturate(0.72) hue-rotate(170deg)',
                barBackground: bar => `repeating-linear-gradient(115deg, transparent 0 18px, ${this._hexToRgba('#d8fbff', 0.12)} 18px 20px), linear-gradient(to right, transparent 0%, ${bar} 22%, ${this._hexToRgba('#9fe9ff', 0.25)} 50%, ${bar} 78%, transparent 100%)`,
                barShadow: strength => `0 0 ${Math.round(10 + strength * 0.34)}px ${this._hexToRgba('#9fe9ff', strength / 150)}`,
                haloBackground: `radial-gradient(circle, ${this._hexToRgba('#d8fbff', 0.5)} 0%, ${this._hexToRgba('#3c8fac', 0.24)} 48%, transparent 72%)`,
                haloShadow: strength => `0 0 ${Math.round(18 + strength * 0.46)}px ${this._hexToRgba('#9fe9ff', strength / 135)}`
            },
            'solar-anima': {
                accent: '#ffb83d',
                secondary: '#fff4ba',
                barRadius: '999px',
                haloRadius: '50%',
                haloBlur: 8,
                haloBlend: 'screen',
                assetRadius: '50%',
                symbolFilter: 'brightness(1.16) saturate(1.38)',
                barBackground: bar => `linear-gradient(90deg, transparent 0%, ${bar} 18%, ${this._hexToRgba('#ffb83d', 0.44)} 50%, ${bar} 82%, transparent 100%)`,
                barShadow: strength => `0 0 ${Math.round(12 + strength * 0.4)}px ${this._hexToRgba('#ffb83d', strength / 138)}`,
                haloBackground: `radial-gradient(circle, ${this._hexToRgba('#fff4ba', 0.5)} 0%, ${this._hexToRgba('#ffb83d', 0.42)} 34%, transparent 72%)`,
                haloShadow: strength => `0 0 ${Math.round(18 + strength * 0.52)}px ${this._hexToRgba('#ffb83d', strength / 128)}`
            }
        }[visualMode];

        return {
            ...mode,
            borderColor: mode.accent || accent
        };
    }

    _normalizeColor(value, fallback) {
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value || '')) return value;
        return fallback;
    }

    _normalizeFont(value, fallback) {
        if (typeof value !== 'string') return fallback;
        const trimmed = value.trim();
        return trimmed || fallback;
    }

    _cssAttributeValue(value) {
        return String(value ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }

    _cssIdentifier(value) {
        const source = String(value ?? '');
        if (globalThis.CSS?.escape) return globalThis.CSS.escape(source);
        return source.replace(/[^a-zA-Z0-9_-]/g, match => `\\${match}`);
    }

    _hexToRgba(hex, alpha) {
        const normalized = this._normalizeColor(hex, '#000000').slice(1);
        const factor = normalized.length === 3 ? 1 : 2;
        const read = (start) => {
            const chunk = factor === 1 ? normalized[start] : normalized.slice(start * 2, start * 2 + 2);
            return parseInt(factor === 1 ? `${chunk}${chunk}` : chunk, 16);
        };

        return `rgba(${read(0)}, ${read(1)}, ${read(2)}, ${alpha})`;
    }

    _fontStack(fontFamily) {
        return fontFamily && fontFamily !== 'inherit'
            ? `"${fontFamily}", serif`
            : 'inherit';
    }

    _isVideoAsset(path) {
        return /\.(webm|mp4|m4v|mov)$/i.test(path || '');
    }

    _clamp(value, min, max) {
        return Math.max(min, Math.min(max, Math.round(value)));
    }

    async _migrateSharedConfigToV2() {
        if (!this.canEditConfig()) return;

        const existing = this.getWorldProfileV2();
        if (existing?.schemaVersion === CONFIG_SCHEMA_VERSION) return;

        await this._saveWorldProfileV2(this.getConfig(), {
            migratedFrom: 'sharedFoundryCustomization-v1'
        });
        console.log(`${MODULE_ID} | Mirrored shared Foundry customization into the v2 world profile.`);
    }

    async _saveWorldProfileV2(config, { migratedFrom = null } = {}) {
        const existing = this.getWorldProfileV2();
        const sanitized = this._sanitizeConfig(config);
        const now = new Date().toISOString();
        const profile = normalizeConfigV2(existing || {}, {
            owner: { scope: 'world', userId: game.user?.id ?? null },
            profileId: existing?.profileId ?? 'world:default',
            profileName: existing?.profileName ?? game.world?.title ?? game.world?.id ?? 'World Default',
            policy: this._getPolicySettings(),
            foundryConfig: sanitized,
            now
        });

        profile.foundry = normalizeLegacyFoundryConfig(sanitized);
        profile.icons = normalizeLegacyIcons(sanitized);
        profile.policy = normalizePolicy(this._getPolicySettings());
        profile.owner = {
            scope: 'world',
            userId: existing?.owner?.userId ?? game.user?.id ?? null,
            actorId: null
        };
        profile.meta.createdAt = existing?.meta?.createdAt ?? profile.meta.createdAt ?? now;
        profile.meta.updatedAt = now;
        profile.meta.migratedFrom = existing?.meta?.migratedFrom ?? migratedFrom;
        profile.diagnostics.lastFoundryVersion = game.version ?? profile.diagnostics.lastFoundryVersion ?? null;
        profile.diagnostics.lastSystemId = game.system?.id ?? profile.diagnostics.lastSystemId ?? null;
        profile.diagnostics.selectorHealth = this.getSelectorHealth();
        profile.diagnostics.iconDiscovery = this.getIconDiscoveryDiagnostics();
        profile.diagnostics.contrastWarnings = buildFoundryContrastWarnings(sanitized);

        await game.settings.set(MODULE_ID, WORLD_PROFILE_V2_SETTING, profile);
        return profile;
    }

    _getPolicySettings() {
        return {
            moduleEnabled: game.settings.get(MODULE_ID, 'moduleEnabled'),
            allowPlayerCustomization: game.settings.get(MODULE_ID, 'allowPlayerCustomization'),
            forcePlayerLayout: game.settings.get(MODULE_ID, 'forcePlayerLayout'),
            allowCustomHtml: game.settings.get(MODULE_ID, 'allowCustomHtml'),
            applyToWhispers: game.settings.get(MODULE_ID, 'applyToWhispers'),
            messageStylingPolicy: this._getEffectiveMessageStylingPolicySetting(),
            enableFoundryCustomization: game.settings.get(MODULE_ID, 'enableFoundryCustomization'),
            shareFoundryCustomization: game.settings.get(MODULE_ID, 'shareFoundryCustomization')
        };
    }

    _getEffectiveMessageStylingPolicySetting() {
        const policy = game.settings.get(MODULE_ID, 'messageStylingPolicy');
        const migrationDone = game.settings.get(MODULE_ID, 'messageStylingPolicyMigrated');
        const v401MigrationDone = game.settings.get(MODULE_ID, 'messageStylingPolicyV401Migrated');
        if (
            !migrationDone
            && policy === MESSAGE_STYLING_POLICY_IDS.SIMPLE_ONLY
            && game.settings.get(MODULE_ID, 'applyToAllMessages')
        ) {
            return MESSAGE_STYLING_POLICY_IDS.SUPPORTED_FIXTURES;
        }
        if (!v401MigrationDone && policy === MESSAGE_STYLING_POLICY_IDS.SIMPLE_ONLY) {
            return MESSAGE_STYLING_POLICY_IDS.SUPPORTED_FIXTURES;
        }
        return policy;
    }

    async _migrateLegacyConfigIfNeeded() {
        if (!this.canEditConfig()) return;

        const sharedConfig = this.getConfig();
        const legacyConfig = this._sanitizeConfig(game.settings.get(MODULE_ID, 'foundryCustomization'));
        const defaultConfig = this._sanitizeConfig(DEFAULT_FOUNDRY_CUSTOMIZATION);

        if (!this._isSameConfig(sharedConfig, defaultConfig)) return;
        if (this._isSameConfig(legacyConfig, defaultConfig)) return;

        await game.settings.set(MODULE_ID, 'sharedFoundryCustomization', legacyConfig);
        await game.settings.set(MODULE_ID, 'foundryCustomization', foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION));
        console.log(`${MODULE_ID} | Migrated legacy Foundry customization to the shared world profile.`);
    }

    _isSameConfig(left, right) {
        return JSON.stringify(this._sanitizeConfig(left)) === JSON.stringify(this._sanitizeConfig(right));
    }
}
