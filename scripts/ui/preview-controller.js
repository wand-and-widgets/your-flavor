/**
 * Preview and diagnostics controller for the Your Flavor config app.
 * @module your-flavor/ui/preview-controller
 */

import {
    DEFAULT_CHAT_LOG_CUSTOMIZATION,
    DEFAULT_FOUNDRY_CUSTOMIZATION,
    DEFAULT_HOTBAR_CUSTOMIZATION,
    DEFAULT_PLAYERS_LIST_CUSTOMIZATION,
    DEFAULT_SCENE_NAVIGATION_CUSTOMIZATION,
    DEFAULT_SIDEBAR_CUSTOMIZATION,
    DEFAULT_WINDOWS_CUSTOMIZATION,
    FOUNDRY_UI_COMPONENTS,
    MODULE_ID
} from '../constants.js';
import { applyFlavorStyles } from '../style-utils.js';
import {
    buildChatContrastWarnings,
    buildFoundryContrastWarnings
} from '../contrast-diagnostics.js';
import { MESSAGE_CLASSIFICATION_TYPES } from '../message-classifier.js';
import {
    renderMessageSurfaces
} from '../message-surface-renderer.js';
import {
    normalizeChatLogConfig,
    normalizeHotbarConfig,
    normalizeLegacyIcons,
    normalizePlayersListConfig,
    normalizeSceneNavigationConfig,
    normalizeSidebarConfig,
    normalizeTokenControlsConfig,
    normalizeWindowsConfig
} from '../config-normalizer.js';
import { getIconRegistryEntries } from '../icon-registry.js';

const STOCK_FOUNDRY_PREVIEW_THEME = Object.freeze({
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

const SCENE_NAVIGATION_PREVIEW_COLOR_FIELDS = Object.freeze([
    'textColor',
    'borderColor',
    'normalBackgroundColor',
    'activeBackgroundColor',
    'viewedBackgroundColor',
    'hiddenBackgroundColor',
    'hoverBackgroundColor'
]);
const TOKEN_CONTROLS_PREVIEW_COLOR_FIELDS = Object.freeze([
    'normalBackgroundColor',
    'normalBorderColor',
    'hoverBackgroundColor',
    'hoverBorderColor',
    'activeBackgroundColor',
    'activeBorderColor'
]);
const HOTBAR_PREVIEW_COLOR_FIELDS = Object.freeze([
    'emptyBackgroundColor',
    'emptyBorderColor',
    'fullBackgroundColor',
    'fullBorderColor',
    'hoverBackgroundColor',
    'hoverBorderColor',
    'dropTargetBackgroundColor',
    'dropTargetBorderColor',
    'keyTextColor',
    'keyEmptyBackgroundColor',
    'keyFullBackgroundColor',
    'controlBackgroundColor',
    'controlBorderColor',
    'controlHoverBackgroundColor'
]);
const PLAYERS_LIST_PREVIEW_COLOR_FIELDS = Object.freeze([
    'panelBackgroundColor',
    'panelBorderColor',
    'rowBackgroundColor',
    'rowBorderColor',
    'textColor',
    'inactiveTextColor',
    'hoverBackgroundColor',
    'hoverBorderColor',
    'selfBackgroundColor',
    'selfBorderColor',
    'gmBackgroundColor',
    'gmBorderColor',
    'controlTextColor',
    'controlHoverTextColor',
    'controlHoverBackgroundColor'
]);
const WINDOWS_PREVIEW_COLOR_FIELDS = Object.freeze([
    'frameBackgroundColor',
    'frameBorderColor',
    'headerBackgroundColor',
    'headerTextColor',
    'headerDividerColor',
    'headerGripColor',
    'contentBackgroundColor',
    'contentTextColor',
    'scrollbarThumbColor',
    'scrollbarTrackColor',
    'resizeHandleColor'
]);

const FOUNDRY_PREVIEW_AREAS = [
    {
        id: 'navigation',
        icon: 'fas fa-map',
        labelKey: 'YOUR_FLAVOR.Foundry.Components.navigation',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.AreaPreviewDescriptions.Navigation'
    },
    {
        id: 'controls',
        icon: 'fas fa-hand-pointer',
        labelKey: 'YOUR_FLAVOR.Foundry.Components.controls',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.AreaPreviewDescriptions.Controls'
    },
    {
        id: 'players',
        icon: 'fas fa-users',
        labelKey: 'YOUR_FLAVOR.Foundry.Components.players',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.AreaPreviewDescriptions.Players'
    },
    {
        id: 'hotbar',
        icon: 'fas fa-th',
        labelKey: 'YOUR_FLAVOR.Foundry.Components.hotbar',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.AreaPreviewDescriptions.Hotbar'
    },
    {
        id: 'sidebar',
        icon: 'fas fa-columns',
        labelKey: 'YOUR_FLAVOR.Foundry.Components.sidebar',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.AreaPreviewDescriptions.Sidebar'
    },
    {
        id: 'chatLog',
        icon: 'fas fa-comments',
        labelKey: 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.ChatLog',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.AreaPreviewDescriptions.ChatLog'
    },
    {
        id: 'windows',
        icon: 'far fa-window-maximize',
        labelKey: 'YOUR_FLAVOR.Config.Diagnostics.SelectorAreas.Windows',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.AreaPreviewDescriptions.Windows'
    },
    {
        id: 'pause',
        icon: 'fas fa-pause-circle',
        labelKey: 'YOUR_FLAVOR.Foundry.Components.pause',
        descriptionKey: 'YOUR_FLAVOR.Config.Foundry.AreaPreviewDescriptions.Pause'
    }
];

const COMPONENT_PREVIEW_AREA_IDS = new Set(['navigation', 'controls', 'players', 'hotbar', 'sidebar']);
const REAL_SNAPSHOT_MIN_SIZE = 8;
const REAL_SNAPSHOT_PADDING = 20;
const REAL_SNAPSHOT_MAX_SCALE = 1;
const REAL_SNAPSHOT_EXCLUDED_SELECTOR = [
    '#your-flavor-config',
    '.your-flavor-config',
    '.yf-foundry-area-preview',
    '.yf-foundry-area-real-snapshot'
].join(', ');
const PAUSE_VISUAL_MODES = new Set(['cinematic', 'arcane-seal', 'parchment-sigil', 'neon-breach', 'minimal-utility', 'dark-ritual', 'divine-light', 'blood-moon', 'frost-stasis', 'solar-anima']);
const PAUSE_EFFECTS = new Set(['none', 'spin-slow', 'spin-fast', 'pulse', 'float', 'sway']);
const PAUSE_MOTION_MODES = new Set(['full', 'gentle', 'off']);
const PAUSE_LABEL_PLACEMENTS = new Set(['below', 'above', 'overlay']);
const PAUSE_SYMBOL_FILTERS = new Set(['none', 'radiant', 'arcane', 'ember', 'frost', 'shadow', 'blood', 'neon']);
const PAUSE_BLEND_MODES = new Set(['normal', 'screen', 'overlay', 'plus-lighter', 'luminosity']);
const PAUSE_BAR_SHAPES = new Set(['mode', 'square', 'soft', 'rounded', 'pill']);

const FOUNDRY_REAL_PREVIEW_TARGETS = Object.freeze({
    navigation: ['#scene-navigation', '#navigation'],
    controls: [],
    players: ['#players'],
    hotbar: [],
    sidebar: ['#sidebar'],
    chatLog: [],
    windows: [
        '.window-app:not(#your-flavor-config)',
        '.application:not(#your-flavor-config)'
    ],
    pause: ['#pause']
});

export class FlavorPreviewController {
    _dismissedContrastFingerprints = new Map();

    constructor({ app }) {
        this.app = app;
    }

    update() {
        const app = this.app;
        if (app._getActivePreviewMode?.() === 'foundry') {
            this.clearChatLogPreview();
            const shellPreviews = Array.from(app.element?.querySelectorAll('.yf-foundry-preview-shell') ?? []);
            for (const shellPreview of shellPreviews) {
                const foundryConfig = shellPreview.dataset.previewState === 'before'
                    ? app._savedFoundryConfigSnapshot
                    : app._workingFoundryConfig;
                this.applyFoundryPreviewToShell(shellPreview, foundryConfig || DEFAULT_FOUNDRY_CUSTOMIZATION);
            }

            this.updateFoundryChangeList(app._savedFoundryConfigSnapshot, app._workingFoundryConfig);
            this.clearFoundryAreaRealSnapshots();
            const areaPreviews = Array.from(app.element?.querySelectorAll('.yf-foundry-area-preview') ?? []);
            for (const areaPreview of areaPreviews) {
                const foundryConfig = areaPreview.dataset.previewState === 'before'
                    ? app._savedFoundryConfigSnapshot
                    : app._workingFoundryConfig;
                this.applyFoundryAreaPreview(areaPreview, foundryConfig || DEFAULT_FOUNDRY_CUSTOMIZATION);
            }
            this.updateFoundryAreaPreviewChrome(app._savedFoundryConfigSnapshot, app._workingFoundryConfig);

            const statusEl = app.element?.querySelector('.yf-preview-status');
            const foundryConfig = app._workingFoundryConfig;
            if (statusEl) {
                statusEl.className = `yf-preview-status ${foundryConfig.enabled ? 'enabled' : 'disabled'}`;
                statusEl.innerHTML = foundryConfig.enabled
                    ? `<i class="fas fa-wand-magic-sparkles"></i> ${this.localize('YOUR_FLAVOR.Config.Foundry.LiveApplied')}`
                    : `<i class="fas fa-power-off"></i> ${this.localize('YOUR_FLAVOR.Config.Foundry.DisabledState')}`;
            }
            return;
        }

        const previewCards = Array.from(app.element?.querySelectorAll('.yf-preview-card') ?? []);
        if (previewCards.length === 0) {
            this.applyChatLogPreview();
            return;
        }

        const config = app._workingConfig;
        const savedConfig = app._savedConfigSnapshot || config;

        for (const previewCard of previewCards) {
            const cardConfig = previewCard.dataset.previewState === 'before'
                ? savedConfig
                : config;
            const layoutId = cardConfig?.layout ?? 'none';
            const fixtureClasses = (previewCard.dataset.fixtureClasses || '')
                .split(/\s+/)
                .filter(Boolean);
            const classes = [
                'yf-preview-card',
                'yf-card',
                `yf-card-${layoutId}`,
                ...fixtureClasses
            ];
            if (previewCard.dataset.previewSlot === 'comparison') {
                classes.push('yf-preview-compare-card', `is-${previewCard.dataset.previewState || 'after'}`);
            }
            if (!previewCard.dataset.previewState && previewCard.dataset.previewFixture === app._activePreviewFixtureId) {
                classes.push('is-active');
            }
            previewCard.className = classes.join(' ');

            if (layoutId !== 'none' && cardConfig?.customizations) {
                applyFlavorStyles(previewCard, cardConfig.customizations, {}, {
                    rolls: cardConfig.rolls,
                    cards: cardConfig.cards
                });
            }
            this.applyRollPreviewOutcome(previewCard, previewCard.dataset.previewRollOutcome);
            const classification = this.getFixtureSurfaceClassification(fixtureClasses);
            renderMessageSurfaces(previewCard, classification, {
                rolls: this.canStyleRollSurfaces(cardConfig, classification),
                cards: this.canStyleCardSurfaces(cardConfig, classification)
            });
        }

        const statusEl = app.element?.querySelector('.yf-preview-status');
        if (statusEl) {
            const rollsEnabled = app._activeTab !== 'rolls' || config?.rolls?.enabled !== false;
            const previewEnabled = config.enabled && rollsEnabled;
            statusEl.className = `yf-preview-status ${previewEnabled ? 'enabled' : 'disabled'}`;
            statusEl.innerHTML = app._activeTab === 'rolls'
                ? previewEnabled
                    ? `<span class="yf-roll-status-dot" aria-hidden="true"></span>${this.localize('YOUR_FLAVOR.Config.RollsDesign.LiveActive')}`
                    : `<span class="yf-roll-status-dot" aria-hidden="true"></span>${this.localize('YOUR_FLAVOR.Config.RollsDesign.LiveInactive')}`
                : config.enabled
                    ? `<i class="fas fa-check-circle"></i> ${this.localize('YOUR_FLAVOR.Config.StatusEnabled')}`
                    : `<i class="fas fa-times-circle"></i> ${this.localize('YOUR_FLAVOR.Config.StatusDisabled')}`;
        }

        this.applyChatLogPreview();
    }

    clearFoundryAreaRealSnapshots() {
        const containers = Array.from(this.app.element?.querySelectorAll('[data-foundry-real-snapshot]') ?? []);
        for (const container of containers) {
            container.replaceChildren();
            container.closest?.('.yf-foundry-area-preview')?.classList.remove('has-real-snapshot');
        }
    }

    applyChatLogPreview() {
        const app = this.app;
        const api = game.modules.get(MODULE_ID)?.api;
        if (!['chat', 'rolls', 'cards'].includes(app._activeTab)) {
            api?.clearChatLogPreview?.();
            return;
        }

        const canCustomize = game.user.isGM || game.settings.get(MODULE_ID, 'allowPlayerCustomization');
        const forcedLayout = game.settings.get(MODULE_ID, 'forcePlayerLayout');
        const hasForcedLayout = !game.user.isGM && forcedLayout && forcedLayout !== 'none';
        if (!canCustomize || hasForcedLayout || typeof api?.applyChatLogPreview !== 'function') {
            api?.clearChatLogPreview?.();
            return;
        }

        api.applyChatLogPreview(app._workingConfig, {
            userId: game.user.id,
            actorId: app._editingActorId || null
        });
    }

    clearChatLogPreview() {
        game.modules.get(MODULE_ID)?.api?.clearChatLogPreview?.();
    }

    commitChatLogPreview() {
        game.modules.get(MODULE_ID)?.api?.commitChatLogPreview?.();
    }

    updateContrastDiagnostics() {
        const container = this.app.element?.querySelector('[data-contrast-diagnostics]');
        if (!container) return;

        const domain = this.getActiveContrastDomain();
        const warnings = this.getContrastWarnings(domain);
        const fingerprint = this.getContrastWarningFingerprint(warnings);
        container.replaceChildren();
        container.removeAttribute('aria-labelledby');

        if (warnings.length === 0) {
            this._dismissedContrastFingerprints.delete(domain);
            container.classList.add('is-empty');
            container.classList.remove('is-dismissed');
            return;
        }

        const isDismissed = this._dismissedContrastFingerprints.get(domain) === fingerprint;
        if (!isDismissed) this._dismissedContrastFingerprints.delete(domain);
        container.classList.toggle('is-empty', isDismissed);
        container.classList.toggle('is-dismissed', isDismissed);
        if (isDismissed) return;

        const header = document.createElement('div');
        header.className = 'yf-contrast-header';
        const title = document.createElement('span');
        const titleId = `${this.app.id || MODULE_ID}-contrast-title`;
        title.id = titleId;
        title.textContent = this.localize('YOUR_FLAVOR.Config.Contrast.Title');
        /* The warning icon used to be skipped on the Rolls tab, which left the
         * same warning looking like a different component there. Rolls now
         * shares the panel styling of Chat Basic and Cards, so it carries the
         * same icon: a per-tab exception here is how the three drifted apart. */
        const icon = document.createElement('i');
        icon.className = 'fas fa-triangle-exclamation';
        icon.setAttribute('aria-hidden', 'true');
        header.appendChild(icon);
        header.appendChild(title);

        const dismissLabel = this.localize('YOUR_FLAVOR.Config.Contrast.Dismiss');
        const dismissButton = document.createElement('button');
        dismissButton.type = 'button';
        dismissButton.className = 'yf-contrast-dismiss';
        dismissButton.title = dismissLabel;
        dismissButton.setAttribute('aria-label', dismissLabel);
        const dismissIcon = document.createElement('i');
        dismissIcon.className = 'fas fa-xmark';
        dismissIcon.setAttribute('aria-hidden', 'true');
        dismissButton.appendChild(dismissIcon);
        dismissButton.addEventListener('click', () => {
            this._dismissedContrastFingerprints.set(domain, fingerprint);
            const focusTarget = container.closest('.yf-preview-panel')?.querySelector('h2, h3');
            this.updateContrastDiagnostics();
            if (focusTarget instanceof HTMLElement) {
                const hadTabIndex = focusTarget.hasAttribute('tabindex');
                if (!hadTabIndex) focusTarget.tabIndex = -1;
                focusTarget.focus({ preventScroll: true });
                if (!hadTabIndex) {
                    focusTarget.addEventListener('blur', () => focusTarget.removeAttribute('tabindex'), { once: true });
                }
            }
        });
        header.appendChild(dismissButton);
        container.setAttribute('aria-labelledby', titleId);
        container.appendChild(header);

        const summary = document.createElement('div');
        summary.className = 'yf-contrast-summary';
        summary.textContent = this.localize('YOUR_FLAVOR.Config.Contrast.Summary');
        container.appendChild(summary);

        const list = document.createElement('ul');
        list.className = 'yf-contrast-list';
        for (const warning of warnings.slice(0, 4)) {
            const item = document.createElement('li');
            const label = document.createElement('span');
            label.className = 'yf-contrast-label';
            label.textContent = warning.label;

            const ratio = document.createElement('span');
            ratio.className = 'yf-contrast-ratio';
            ratio.textContent = warning.ratioLabel;

            item.append(label, ratio);
            list.appendChild(item);
        }
        container.appendChild(list);

        if (warnings.length > 4) {
            const more = document.createElement('div');
            more.className = 'yf-contrast-more';
            more.textContent = this.formatI18n('YOUR_FLAVOR.Config.Contrast.More', {
                count: warnings.length - 4
            });
            container.appendChild(more);
        }
    }

    getActiveContrastWarnings() {
        return this.getContrastWarnings(this.getActiveContrastDomain());
    }

    getActiveContrastDomain() {
        return this.app._getActivePreviewMode?.() === 'foundry' ? 'foundry' : 'chat';
    }

    getContrastWarningFingerprint(warnings = []) {
        return warnings
            .map(warning => [
                warning.id,
                warning.foreground,
                warning.background,
                warning.ratio,
                warning.minimum
            ].join('|'))
            .sort()
            .join('||');
    }

    getContrastWarnings(scope = 'chat', config = null) {
        const warnings = scope === 'foundry'
            ? buildFoundryContrastWarnings(config || this.app._workingFoundryConfig)
            : buildChatContrastWarnings(config || this.app._workingConfig);

        return warnings.map(warning => ({
            ...warning,
            label: this.localize(`YOUR_FLAVOR.Config.Contrast.Targets.${warning.id}`),
            ratioLabel: this.formatI18n('YOUR_FLAVOR.Config.Contrast.Ratio', {
                ratio: warning.ratio.toFixed(2),
                minimum: warning.minimum.toFixed(1)
            })
        }));
    }

    buildFoundryPreviewContext(foundryConfig = DEFAULT_FOUNDRY_CUSTOMIZATION, state = 'after') {
        const config = this.getEffectiveFoundryPreviewConfig(foundryConfig);
        return {
            state,
            label: this.localize(
                state === 'before'
                    ? 'YOUR_FLAVOR.Config.PreviewBefore'
                    : 'YOUR_FLAVOR.Config.PreviewAfter'
            ),
            shellClass: this.getFoundryPreviewShellClass(config),
            style: this.buildFoundryPreviewStyle(config),
            pauseClass: this.getPausePreviewClass(config.pause),
            pauseLabel: this.getPausePreviewLabel(config.pause),
            pauseAsset: this.getPausePreviewAsset(config.pause)
        };
    }

    buildFoundryPreviewAreas(
        beforeConfig = DEFAULT_FOUNDRY_CUSTOMIZATION,
        afterConfig = DEFAULT_FOUNDRY_CUSTOMIZATION,
        activeAreaId = 'navigation'
    ) {
        const activeId = this.normalizeFoundryPreviewAreaId(activeAreaId);
        const after = this.getEffectiveFoundryPreviewConfig(afterConfig);

        return FOUNDRY_PREVIEW_AREAS.map(area => {
            const areaChanges = this.buildFoundryAreaPreviewChanges(beforeConfig, afterConfig, area.id);
            const isEnabled = after.areaEnabled?.[area.id] !== false;
            const isVisible = this.isFoundryPreviewAreaVisible(after, area.id);
            return {
                ...area,
                label: this.localize(area.labelKey),
                description: this.localize(area.descriptionKey),
                isActive: area.id === activeId,
                isChanged: areaChanges.length > 0,
                isEnabled,
                isVisible,
                className: [
                    area.id === activeId ? 'is-active' : '',
                    areaChanges.length > 0 ? 'is-changed' : '',
                    !isEnabled ? 'is-disabled' : '',
                    !isVisible ? 'is-hidden' : ''
                ].filter(Boolean).join(' ')
            };
        });
    }

    buildFoundryAreaPreviewContext(
        foundryConfig = DEFAULT_FOUNDRY_CUSTOMIZATION,
        areaId = 'navigation',
        state = 'after'
    ) {
        const config = this.getEffectiveFoundryPreviewConfig(foundryConfig);
        const normalizedAreaId = this.normalizeFoundryPreviewAreaId(areaId);
        const area = FOUNDRY_PREVIEW_AREAS.find(entry => entry.id === normalizedAreaId) ?? FOUNDRY_PREVIEW_AREAS[0];
        const isEnabled = config.areaEnabled?.[area.id] !== false;
        const isVisible = this.isFoundryPreviewAreaVisible(config, area.id);

        return {
            ...area,
            state,
            label: this.localize(
                state === 'before'
                    ? 'YOUR_FLAVOR.Config.PreviewBefore'
                    : 'YOUR_FLAVOR.Config.PreviewAfter'
            ),
            areaLabel: this.localize(area.labelKey),
            description: this.localize(area.descriptionKey),
            className: this.getFoundryAreaPreviewClass(config, area.id),
            style: this.buildFoundryPreviewStyle(config, area.id),
            isEnabled,
            isVisible,
            pauseClass: this.getPausePreviewClass(config.pause),
            pauseLabel: this.getPausePreviewLabel(config.pause),
            pauseAsset: this.getPausePreviewAsset(config.pause)
        };
    }

    buildFoundryAreaPreviewChanges(
        beforeConfig = DEFAULT_FOUNDRY_CUSTOMIZATION,
        afterConfig = DEFAULT_FOUNDRY_CUSTOMIZATION,
        areaId = 'navigation'
    ) {
        const normalizedAreaId = this.normalizeFoundryPreviewAreaId(areaId);
        const before = this.normalizeFoundryPreviewConfig(beforeConfig);
        const after = this.normalizeFoundryPreviewConfig(afterConfig);
        const changeDefs = [
            {
                id: 'enabled',
                icon: 'fas fa-toggle-on',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeLabels.Enabled',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeDetails.Enabled',
                applies: () => true,
                select: config => config.areaEnabled?.[normalizedAreaId] !== false
            },
            {
                id: 'visibility',
                icon: 'fas fa-eye',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeLabels.Visibility',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeDetails.Visibility',
                applies: () => ['navigation', 'controls', 'players', 'hotbar', 'sidebar', 'pause'].includes(normalizedAreaId),
                select: config => this.isFoundryPreviewAreaVisible(config, normalizedAreaId)
            },
            {
                id: 'layout',
                icon: 'fas fa-up-down-left-right',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeLabels.Layout',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeDetails.Layout',
                applies: () => COMPONENT_PREVIEW_AREA_IDS.has(normalizedAreaId),
                select: config => config.layout?.[normalizedAreaId] ?? {}
            },
            {
                id: 'style',
                icon: 'fas fa-brush',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeLabels.Style',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeDetails.Style',
                applies: () => COMPONENT_PREVIEW_AREA_IDS.has(normalizedAreaId) && normalizedAreaId !== 'players',
                select: config => config.componentStyles?.[normalizedAreaId] ?? {}
            },
            {
                id: 'sceneNavigation',
                icon: 'fas fa-map-location-dot',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeLabels.SceneNavigation',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeDetails.SceneNavigation',
                applies: () => normalizedAreaId === 'navigation',
                select: config => normalizeSceneNavigationConfig(config.sceneNavigation)
            },
            {
                id: 'tokenControls',
                icon: 'fas fa-crosshairs',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeLabels.TokenControls',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeDetails.TokenControls',
                applies: () => normalizedAreaId === 'controls',
                select: config => normalizeTokenControlsConfig(config.tokenControls)
            },
            {
                id: 'hotbar',
                icon: 'fas fa-keyboard',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeLabels.Hotbar',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeDetails.Hotbar',
                applies: () => normalizedAreaId === 'hotbar',
                select: config => normalizeHotbarConfig(config.hotbar)
            },
            {
                id: 'sidebar',
                icon: 'fas fa-columns',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeLabels.Sidebar',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeDetails.Sidebar',
                applies: () => normalizedAreaId === 'sidebar',
                select: config => normalizeSidebarConfig(config.sidebar)
            },
            {
                id: 'chatLog',
                icon: 'fas fa-comments',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeLabels.ChatLog',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeDetails.ChatLog',
                applies: () => normalizedAreaId === 'chatLog',
                select: config => normalizeChatLogConfig(config.chatLog)
            },
            {
                id: 'playersList',
                icon: 'fas fa-user-group',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeLabels.PlayersList',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeDetails.PlayersList',
                applies: () => normalizedAreaId === 'players',
                select: config => normalizePlayersListConfig(config.playersList ?? config.areas?.players?.playersList)
            },
            {
                id: 'windows',
                icon: 'far fa-window-maximize',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeLabels.Windows',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeDetails.Windows',
                applies: () => normalizedAreaId === 'windows',
                select: config => normalizeWindowsConfig(config.windows ?? config.areas?.windows?.windows)
            },
            {
                id: 'theme',
                icon: 'fas fa-palette',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeLabels.Theme',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeDetails.Theme',
                applies: () => true,
                select: config => this.getFoundryAreaThemeSignature(config, normalizedAreaId)
            },
            {
                id: 'icons',
                icon: 'fas fa-icons',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeLabels.Icons',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeDetails.Icons',
                applies: () => getIconRegistryEntries({ area: normalizedAreaId }).length > 0,
                select: config => this.getFoundryAreaIconSignature(config, normalizedAreaId)
            },
            {
                id: 'pause',
                icon: 'fas fa-circle-pause',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeLabels.Pause',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeDetails.Pause',
                applies: () => normalizedAreaId === 'pause',
                select: config => config.pause
            },
            {
                id: 'customCss',
                icon: 'fas fa-code',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeLabels.CustomCSS',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.AreaChangeDetails.CustomCSS',
                applies: () => true,
                select: config => config.customCss || ''
            }
        ];

        return changeDefs
            .filter(change => change.applies())
            .filter(change => !this.deepEqual(change.select(before), change.select(after)))
            .map(change => ({
                id: change.id,
                icon: change.icon,
                className: `is-${change.id}`,
                label: this.localize(change.labelKey),
                detail: this.localize(change.detailKey)
            }));
    }

    buildFoundryPreviewChanges(beforeConfig = DEFAULT_FOUNDRY_CUSTOMIZATION, afterConfig = DEFAULT_FOUNDRY_CUSTOMIZATION) {
        const before = this.normalizeFoundryPreviewConfig(beforeConfig);
        const after = this.normalizeFoundryPreviewConfig(afterConfig);
        const changeDefs = [
            {
                id: 'state',
                icon: 'fas fa-power-off',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeLabels.State',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeDetails.State',
                select: config => config.enabled
            },
            {
                id: 'modules',
                icon: 'fas fa-sliders-h',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeLabels.Modules',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeDetails.Modules',
                select: config => config.categories
            },
            {
                id: 'areas',
                icon: 'fas fa-layer-group',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeLabels.Areas',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeDetails.Areas',
                select: config => config.areaEnabled
            },
            {
                id: 'theme',
                icon: 'fas fa-palette',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeLabels.Theme',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeDetails.Theme',
                select: config => config.theme
            },
            {
                id: 'visibility',
                icon: 'fas fa-eye',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeLabels.Visibility',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeDetails.Visibility',
                select: config => config.visibility
            },
            {
                id: 'layout',
                icon: 'fas fa-up-down-left-right',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeLabels.Layout',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeDetails.Layout',
                select: config => config.layout
            },
            {
                id: 'components',
                icon: 'fas fa-cubes',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeLabels.Components',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeDetails.Components',
                select: config => config.componentStyles
            },
            {
                id: 'sceneNavigation',
                icon: 'fas fa-map-location-dot',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeLabels.SceneNavigation',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeDetails.SceneNavigation',
                select: config => normalizeSceneNavigationConfig(config.sceneNavigation)
            },
            {
                id: 'tokenControls',
                icon: 'fas fa-crosshairs',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeLabels.TokenControls',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeDetails.TokenControls',
                select: config => normalizeTokenControlsConfig(config.tokenControls)
            },
            {
                id: 'hotbar',
                icon: 'fas fa-keyboard',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeLabels.Hotbar',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeDetails.Hotbar',
                select: config => normalizeHotbarConfig(config.hotbar)
            },
            {
                id: 'sidebar',
                icon: 'fas fa-columns',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeLabels.Sidebar',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeDetails.Sidebar',
                select: config => normalizeSidebarConfig(config.sidebar)
            },
            {
                id: 'chatLog',
                icon: 'fas fa-comments',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeLabels.ChatLog',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeDetails.ChatLog',
                select: config => normalizeChatLogConfig(config.chatLog)
            },
            {
                id: 'playersList',
                icon: 'fas fa-user-group',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeLabels.PlayersList',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeDetails.PlayersList',
                select: config => normalizePlayersListConfig(config.playersList ?? config.areas?.players?.playersList)
            },
            {
                id: 'windows',
                icon: 'far fa-window-maximize',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeLabels.Windows',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeDetails.Windows',
                select: config => normalizeWindowsConfig(config.windows ?? config.areas?.windows?.windows)
            },
            {
                id: 'pause',
                icon: 'fas fa-circle-pause',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeLabels.Pause',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeDetails.Pause',
                select: config => config.pause
            },
            {
                id: 'customCss',
                icon: 'fas fa-code',
                labelKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeLabels.CustomCSS',
                detailKey: 'YOUR_FLAVOR.Config.Foundry.PreviewChangeDetails.CustomCSS',
                select: config => config.customCss || ''
            }
        ];

        return changeDefs
            .filter(change => !this.deepEqual(change.select(before), change.select(after)))
            .map(change => ({
                id: change.id,
                icon: change.icon,
                className: `is-${change.id}`,
                label: this.localize(change.labelKey),
                detail: this.localize(change.detailKey)
            }));
    }

    updateFoundryChangeList(beforeConfig = DEFAULT_FOUNDRY_CUSTOMIZATION, afterConfig = DEFAULT_FOUNDRY_CUSTOMIZATION) {
        const list = this.app.element?.querySelector?.('[data-foundry-change-list]');
        if (!list) return;

        this.renderFoundryChangeList(list, this.buildFoundryPreviewChanges(beforeConfig, afterConfig));
    }

    renderFoundryChangeList(list, changes = []) {
        list.replaceChildren();

        if (!changes.length) {
            const empty = document.createElement('span');
            empty.className = 'yf-foundry-change-empty';
            empty.textContent = this.localize('YOUR_FLAVOR.Config.Foundry.PreviewNoChanges');
            list.appendChild(empty);
            return;
        }

        for (const change of changes) {
            const chip = document.createElement('span');
            chip.className = `yf-foundry-change-chip ${change.className}`;
            chip.dataset.changeId = change.id;
            chip.title = change.detail;

            const icon = document.createElement('i');
            icon.className = change.icon;
            chip.appendChild(icon);

            const label = document.createElement('span');
            label.textContent = change.label;
            chip.appendChild(label);

            list.appendChild(chip);
        }
    }

    updateFoundryAreaPreviewChrome(
        beforeConfig = DEFAULT_FOUNDRY_CUSTOMIZATION,
        afterConfig = DEFAULT_FOUNDRY_CUSTOMIZATION
    ) {
        const activeAreaId = this.normalizeFoundryPreviewAreaId(this.app._activeFoundryPreviewArea);
        const changes = this.buildFoundryAreaPreviewChanges(beforeConfig, afterConfig, activeAreaId);
        const changeList = this.app.element?.querySelector?.('[data-foundry-area-change-list]');
        if (changeList) {
            this.renderFoundryChangeList(changeList, changes);
        }

        const areaButtons = Array.from(this.app.element?.querySelectorAll?.('[data-foundry-preview-area-button]') ?? []);
        if (!areaButtons.length) return;

        const areaStates = new Map(
            this.buildFoundryPreviewAreas(beforeConfig, afterConfig, activeAreaId)
                .map(area => [area.id, area])
        );

        for (const button of areaButtons) {
            const area = areaStates.get(button.dataset.area);
            if (!area) continue;
            button.className = `yf-foundry-area-pill ${area.className}`.trim();
            button.setAttribute('aria-pressed', area.isActive ? 'true' : 'false');

            const marker = button.querySelector('[data-foundry-area-change-marker]');
            if (marker) marker.hidden = !area.isChanged;
        }
    }

    applyFoundryAreaPreview(areaPreview, foundryConfig = DEFAULT_FOUNDRY_CUSTOMIZATION) {
        if (!areaPreview) return;

        const config = this.getEffectiveFoundryPreviewConfig(foundryConfig);
        const areaId = this.normalizeFoundryPreviewAreaId(areaPreview.dataset.previewArea);
        areaPreview.className = this.getFoundryAreaPreviewClass(config, areaId);

        for (const declaration of this.buildFoundryPreviewStyle(config, areaId).split(';')) {
            const [property, ...valueParts] = declaration.split(':');
            const value = valueParts.join(':').trim();
            if (property?.trim() && value) {
                areaPreview.style.setProperty(property.trim(), value);
            }
        }

        const pauseFixture = areaPreview.querySelector('.yf-area-fixture-pause');
        if (pauseFixture) {
            pauseFixture.className = `yf-foundry-area-fixture yf-area-fixture-pause ${this.getPausePreviewClass(config.pause)}`.trim();
        }

        const pauseLabel = areaPreview.querySelector('.yf-area-pause-label');
        if (pauseLabel) {
            pauseLabel.textContent = this.getPausePreviewLabel(config.pause);
        }

        const pauseMedia = areaPreview.querySelector('.yf-area-pause-media');
        if (pauseMedia) {
            this.applyPausePreviewMedia(pauseMedia, config.pause, 'yf-area-pause-native-symbol');
        }

        this.applyFoundryComponentPreviewStyles(areaPreview, config);
        this.applyFoundryAreaRealSnapshot(areaPreview, config, areaId);
    }

    applyFoundryAreaRealSnapshot(areaPreview, foundryConfig = DEFAULT_FOUNDRY_CUSTOMIZATION, areaId = 'navigation') {
        const container = areaPreview?.querySelector?.('[data-foundry-real-snapshot]');
        if (!container) return;

        container.replaceChildren();
        areaPreview.classList.remove('has-real-snapshot');

        if (['players', 'sidebar', 'chatLog'].includes(this.normalizeFoundryPreviewAreaId(areaId))) return;

        const snapshot = this.buildFoundryAreaRealSnapshotForConfig(
            this.normalizeFoundryPreviewAreaId(areaId),
            foundryConfig,
            areaPreview.dataset.previewState || 'after',
            areaPreview
        );
        if (!snapshot) return;

        container.appendChild(snapshot);
        areaPreview.classList.add('has-real-snapshot');
    }

    buildFoundryAreaRealSnapshotForConfig(
        areaId = 'navigation',
        foundryConfig = DEFAULT_FOUNDRY_CUSTOMIZATION,
        state = 'after',
        areaPreview = null
    ) {
        const customizer = this.app.foundryCustomizer;
        const canSwitchPreviewConfig = typeof customizer?.applyPreviewConfig === 'function'
            && !customizer?.isArrangeModeActive?.();

        if (state !== 'before') {
            return this.buildFoundryAreaRealSnapshot(areaId, areaPreview);
        }

        if (!canSwitchPreviewConfig) {
            return null;
        }

        const restoreConfig = this.app._workingFoundryConfig || DEFAULT_FOUNDRY_CUSTOMIZATION;

        try {
            customizer.applyPreviewConfig(foundryConfig, {
                forceFeatureEnabled: foundryConfig?.enabled !== false
            });
            return this.buildFoundryAreaRealSnapshot(areaId, areaPreview);
        } catch (error) {
            console.warn(`${MODULE_ID} | Failed to build live Foundry area preview.`, error);
            return null;
        } finally {
            try {
                customizer.applyPreviewConfig(restoreConfig, {
                    forceFeatureEnabled: restoreConfig?.enabled !== false
                });
            } catch (error) {
                console.warn(`${MODULE_ID} | Failed to restore live Foundry preview state.`, error);
            }
        }
    }

    buildFoundryAreaRealSnapshot(areaId = 'navigation', areaPreview = null) {
        const target = this.findFoundryAreaSnapshotTarget(areaId);
        if (!target) return null;

        const { element, rect, sourceRect = rect, offsetX = 0, offsetY = 0 } = target;
        if (!this.hasUsableFoundrySnapshotContent(element)) return null;

        const clone = element.cloneNode(true);
        this.prepareFoundrySnapshotClone(clone, sourceRect, { offsetX, offsetY });

        const frame = document.createElement('div');
        frame.className = 'yf-foundry-real-snapshot-frame';
        frame.style.width = `${Math.ceil(rect.width)}px`;
        frame.style.height = `${Math.ceil(rect.height)}px`;
        frame.style.setProperty('--yf-real-snapshot-scale', String(this.getFoundrySnapshotScale(areaPreview, rect)));
        frame.appendChild(clone);
        return frame;
    }

    findFoundryAreaSnapshotTarget(areaId = 'navigation') {
        const normalizedAreaId = this.normalizeFoundryPreviewAreaId(areaId);
        const selectors = FOUNDRY_REAL_PREVIEW_TARGETS[normalizedAreaId] ?? [];
        const candidates = [];

        for (const selector of selectors) {
            let elements = [];
            try {
                elements = Array.from(document.querySelectorAll(selector));
            } catch (_error) {
                continue;
            }

            for (const element of elements) {
                const rect = this.getFoundrySnapshotCandidateRect(element);
                if (!rect) continue;
                if (!this.hasUsableFoundrySnapshotContent(element)) continue;

                const candidate = normalizedAreaId === 'navigation'
                    ? this.buildNavigationSnapshotCandidate(element, rect)
                    : {
                        element,
                        rect,
                        sourceRect: rect,
                        offsetX: 0,
                        offsetY: 0,
                        area: rect.width * rect.height
                    };
                if (candidate) candidates.push(candidate);
            }
        }

        if (!candidates.length) return null;
        if (normalizedAreaId === 'windows') {
            candidates.sort((a, b) => b.area - a.area);
        }
        return candidates[0];
    }

    buildNavigationSnapshotCandidate(element, rootRect) {
        const contentRect = this.getNavigationSnapshotContentRect(element, rootRect);
        if (!contentRect) return null;

        return {
            element,
            rect: contentRect,
            sourceRect: rootRect,
            offsetX: Math.round(rootRect.left - contentRect.left),
            offsetY: Math.round(rootRect.top - contentRect.top),
            area: contentRect.width * contentRect.height
        };
    }

    getNavigationSnapshotContentRect(root, rootRect) {
        const primarySelectors = [
            '#scene-navigation-previous',
            '#scene-navigation-expand',
            '.scene-navigation-toggle',
            '#nav-back',
            '#nav-toggle',
            '[data-action="toggle"]',
            '.scene-navigation-menu .scene',
            '.scene-list .scene',
            '#scene-list .scene',
            '.scene.nav-item',
            '.nav-item.scene',
            '.scene',
            '.nav-item'
        ];
        const fallbackSelectors = [
            '#scene-navigation-active',
            '#scene-navigation-inactive',
            '.scene-navigation-menu',
            '.inactive-container',
            '#scene-list',
            '.scene-list',
            '.nav-item-container',
            'ol',
            'ul',
            'menu',
            'button',
            'a'
        ];

        const primaryRects = this.getSnapshotDescendantRects(root, primarySelectors, rootRect);
        const rects = primaryRects.length
            ? primaryRects
            : this.getSnapshotDescendantRects(root, fallbackSelectors, rootRect);
        const contentRect = rects.length ? this.unionSnapshotRects(rects) : rootRect;
        if (!contentRect) return null;

        // Scene navigation roots can span most of the tabletop; crop to visible controls.
        return this.expandSnapshotRect(contentRect, rootRect, 8);
    }

    getSnapshotDescendantRects(root, selectors = [], rootRect = null) {
        const descendants = new Set();
        for (const selector of selectors) {
            try {
                root.querySelectorAll(selector).forEach(element => descendants.add(element));
            } catch (_error) {
                // Ignore selectors unsupported by the current Foundry browser.
            }
        }

        return Array.from(descendants)
            .map(element => this.getVisibleSnapshotElementRect(element, rootRect))
            .filter(Boolean);
    }

    getVisibleSnapshotElementRect(element, rootRect = null) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;
        if (element.closest?.(REAL_SNAPSHOT_EXCLUDED_SELECTOR)) return null;

        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') return null;

        const rect = element.getBoundingClientRect();
        if (rect.width < REAL_SNAPSHOT_MIN_SIZE || rect.height < REAL_SNAPSHOT_MIN_SIZE) return null;
        if (rootRect && (
            rect.right <= rootRect.left
            || rect.left >= rootRect.right
            || rect.bottom <= rootRect.top
            || rect.top >= rootRect.bottom
        )) return null;

        return rect;
    }

    unionSnapshotRects(rects = []) {
        if (!rects.length) return null;

        const left = Math.min(...rects.map(rect => rect.left));
        const top = Math.min(...rects.map(rect => rect.top));
        const right = Math.max(...rects.map(rect => rect.right));
        const bottom = Math.max(...rects.map(rect => rect.bottom));
        return {
            left,
            top,
            right,
            bottom,
            width: Math.max(1, right - left),
            height: Math.max(1, bottom - top)
        };
    }

    expandSnapshotRect(rect, bounds, padding = 0) {
        if (!rect || !bounds) return rect;

        const left = Math.max(bounds.left, rect.left - padding);
        const top = Math.max(bounds.top, rect.top - padding);
        const right = Math.min(bounds.right, rect.right + padding);
        const bottom = Math.min(bounds.bottom, rect.bottom + padding);
        return {
            left,
            top,
            right,
            bottom,
            width: Math.max(1, right - left),
            height: Math.max(1, bottom - top)
        };
    }

    hasUsableFoundrySnapshotContent(element) {
        if (!element?.querySelector) return false;
        const text = element.textContent?.replace(/\s+/g, ' ').trim();
        if (text) return true;

        return Boolean(element.querySelector([
            'img',
            'svg',
            'canvas',
            'i',
            'button',
            'a',
            'input',
            'select',
            'textarea',
            '[role="button"]',
            '[role="tab"]',
            '.scene',
            '.control-tool',
            '.ui-control',
            '.directory-item',
            '.chat-message',
            '.window-header',
            '.window-content'
        ].join(', ')));
    }

    getFoundrySnapshotCandidateRect(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;
        const appElement = this.app.element;
        if (appElement?.contains?.(element)) return null;
        if (appElement && element.contains?.(appElement)) return null;
        if (element.closest?.(REAL_SNAPSHOT_EXCLUDED_SELECTOR)) return null;

        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') return null;

        const rect = element.getBoundingClientRect();
        if (rect.width < REAL_SNAPSHOT_MIN_SIZE || rect.height < REAL_SNAPSHOT_MIN_SIZE) return null;

        return rect;
    }

    prepareFoundrySnapshotClone(clone, rect, { offsetX = 0, offsetY = 0 } = {}) {
        if (!clone) return;

        clone.classList?.add('yf-foundry-real-snapshot-clone');
        clone.setAttribute?.('aria-hidden', 'true');
        try {
            clone.inert = true;
        } catch (_error) {
            // Some Foundry-supported browser versions may not expose inert.
        }

        clone.querySelectorAll?.('script, style, .yf-arrange-handle').forEach(element => element.remove());
        clone.querySelectorAll?.('a, button, input, select, textarea, [tabindex]').forEach(element => {
            element.setAttribute('tabindex', '-1');
        });
        clone.querySelectorAll?.('video, audio').forEach(element => {
            element.pause?.();
            element.controls = false;
        });

        const setImportant = (property, value) => clone.style.setProperty(property, value, 'important');
        setImportant('position', 'relative');
        setImportant('top', 'auto');
        setImportant('right', 'auto');
        setImportant('bottom', 'auto');
        setImportant('left', 'auto');
        setImportant('margin', '0');
        setImportant('transform', offsetX || offsetY ? `translate(${offsetX}px, ${offsetY}px)` : 'none');
        setImportant('transform-origin', 'top left');
        setImportant('width', `${Math.ceil(rect.width)}px`);
        setImportant('height', `${Math.ceil(rect.height)}px`);
        setImportant('min-width', '0');
        setImportant('max-width', 'none');
        setImportant('min-height', '0');
        setImportant('max-height', 'none');
        setImportant('pointer-events', 'none');
    }

    getFoundrySnapshotScale(areaPreview, rect) {
        const previewRect = areaPreview?.getBoundingClientRect?.();
        const availableWidth = Math.max(1, (previewRect?.width ?? rect.width) - REAL_SNAPSHOT_PADDING);
        const availableHeight = Math.max(1, (previewRect?.height ?? rect.height) - REAL_SNAPSHOT_PADDING);
        const scale = Math.min(
            availableWidth / Math.max(1, rect.width),
            availableHeight / Math.max(1, rect.height),
            REAL_SNAPSHOT_MAX_SCALE
        );
        return Math.max(0.08, Math.round(scale * 1000) / 1000);
    }

    applyFoundryPreviewToShell(shellPreview, foundryConfig = DEFAULT_FOUNDRY_CUSTOMIZATION) {
        if (!shellPreview) return;

        const config = this.getEffectiveFoundryPreviewConfig(foundryConfig);
        const preview = this.buildFoundryPreviewContext(
            config,
            shellPreview.dataset.previewState || 'after'
        );
        const sizeClasses = Array.from(shellPreview.classList)
            .filter(className => className === 'is-compact' || className === 'is-expanded');
        shellPreview.className = [preview.shellClass, ...sizeClasses].join(' ');
        for (const declaration of preview.style.split(';')) {
            const [property, ...valueParts] = declaration.split(':');
            const value = valueParts.join(':').trim();
            if (property?.trim() && value) {
                shellPreview.style.setProperty(property.trim(), value);
            }
        }

        const pausePreview = shellPreview.querySelector('.yf-foundry-preview-pause');
        if (pausePreview) {
            pausePreview.className = `yf-foundry-preview-pause ${preview.pauseClass}`.trim();
        }

        const pauseLabel = shellPreview.querySelector('.yf-foundry-preview-pause-label');
        if (pauseLabel) {
            pauseLabel.textContent = preview.pauseLabel;
        }

        const pauseMedia = shellPreview.querySelector('.yf-foundry-preview-pause-media');
        if (pauseMedia) {
            this.applyPausePreviewMedia(pauseMedia, config.pause, 'yf-foundry-preview-pause-native-symbol');
        }

        this.applyFoundryComponentPreviewStyles(shellPreview, config);
    }

    buildFoundryPreviewStyle(foundryConfig = DEFAULT_FOUNDRY_CUSTOMIZATION, areaId = null) {
        const config = this.getEffectiveFoundryPreviewConfig(foundryConfig);
        const theme = this.resolveFoundryPreviewTheme(config.theme);
        const { pause } = config;
        const iconColors = this.resolveFoundryPreviewIconColors(config, areaId);
        const sceneNavigation = normalizeSceneNavigationConfig(config.sceneNavigation);
        const sceneNavigationColors = this.resolveSceneNavigationPreviewColors(sceneNavigation, theme);
        const tokenControls = normalizeTokenControlsConfig(config.tokenControls);
        const tokenControlColors = this.resolveTokenControlsPreviewColors(tokenControls, theme);
        const tokenControlsRailWidth = (tokenControls.columnCount * tokenControls.buttonSize)
            + ((tokenControls.columnCount - 1) * tokenControls.columnGap);
        const tokenControlsPreviewScale = 0.42;
        const hotbar = normalizeHotbarConfig(config.hotbar);
        const hotbarColors = this.resolveHotbarPreviewColors(hotbar, theme);
        const hotbarRows = Math.ceil(10 / hotbar.slotsPerRow);
        const hotbarPreviewScale = 0.42;
        const hotbarPreviewSlotSize = Math.max(10, Math.round(hotbar.slotSize * hotbarPreviewScale));
        const hotbarPreviewGap = Math.max(0, Math.round(hotbar.slotGap * hotbarPreviewScale));
        const hotbarPreviewControlSize = Math.max(8, Math.round(hotbar.controlSize * hotbarPreviewScale));
        const hotbarPreviewBarHeight = (hotbarRows * hotbarPreviewSlotSize)
            + ((hotbarRows - 1) * hotbarPreviewGap);
        const sidebar = normalizeSidebarConfig(config.sidebar);
        const sidebarPreviewScale = 0.72;
        const sidebarPreviewWidth = Math.round(
            this.clampNumber(config.layout?.sidebar?.width ?? DEFAULT_FOUNDRY_CUSTOMIZATION.layout.sidebar.width, 260, 700)
            * sidebarPreviewScale
        );
        const sidebarPreviewRailWidth = Math.round(sidebar.railWidth * sidebarPreviewScale);
        const sidebarPreviewTabSize = Math.round(sidebar.tabSize * sidebarPreviewScale);
        const sidebarPreviewRowHeight = Math.round(sidebar.rowHeight * sidebarPreviewScale);
        const sidebarPreviewFolderHeight = Math.round(sidebar.folderHeight * sidebarPreviewScale);
        const sidebarPreviewSearchHeight = Math.round(sidebar.searchHeight * sidebarPreviewScale);
        const sidebarDivider = this.hexToRgba(theme.secondaryFontColor, sidebar.dividerStrength / 100);
        const sidebarHover = this.hexToRgba(theme.accentColor, sidebar.hoverStrength / 100);
        const sidebarActive = this.hexToRgba(theme.accentColor, sidebar.activeStrength / 100);
        const sidebarActiveSoft = this.hexToRgba(theme.accentColor, Math.min(0.34, Math.max(0.12, sidebar.activeStrength / 220)));
        const sidebarRailBg = this.hexToRgba(theme.surfaceBackground, 0.58);
        const sidebarPanelBg = this.hexToRgba(theme.windowBackground, 0.94);
        const sidebarPanelBorder = this.hexToRgba(theme.accentColor, Math.max(0.18, sidebar.activeStrength / 180));
        const sidebarFolderBg = this.hexToRgba(theme.windowHeaderBackground, 0.96);
        const sidebarInputBg = this.hexToRgba(theme.surfaceBackground, 0.78);
        const sidebarPanelShadow = sidebar.panelShadowIntensity > 0
            ? `0 ${Math.max(3, Math.round(sidebar.panelShadowIntensity * 0.28))}px ${Math.max(8, Math.round(sidebar.panelShadowIntensity * 0.72))}px rgba(0, 0, 0, ${Math.min(0.48, 0.18 + sidebar.panelShadowIntensity / 120)})`
            : 'none';
        const chatLog = normalizeChatLogConfig(config.chatLog);
        const chatLogDivider = this.hexToRgba(theme.secondaryFontColor, chatLog.dividerStrength / 100);
        const chatLogMessageBorder = this.hexToRgba(theme.accentColor, Math.max(0.12, chatLog.dividerStrength / 150));
        const chatLogHoverBorder = this.hexToRgba(theme.accentColor, Math.max(0.16, chatLog.hoverStrength / 130));
        const chatLogHoverSurface = this.hexToRgba(theme.accentColor, Math.min(0.18, chatLog.hoverStrength / 320));
        const chatLogContextBorder = this.hexToRgba(theme.accentColor, Math.max(0.22, chatLog.contextStrength / 100));
        const chatLogComposerFocus = this.hexToRgba(theme.accentColor, Math.max(0.24, chatLog.composerFocusStrength / 100));
        const chatLogComposerFocusSoft = this.hexToRgba(theme.accentColor, Math.min(0.26, Math.max(0.08, chatLog.composerFocusStrength / 360)));
        const chatLogComposerBg = this.hexToRgba(theme.surfaceBackground, 0.88);
        const chatLogMessageShadow = chatLog.messageShadowIntensity > 0
            ? `0 ${Math.max(1, Math.round(chatLog.messageShadowIntensity / 7))}px ${Math.max(5, Math.round(chatLog.messageShadowIntensity * 0.9))}px rgba(0, 0, 0, ${Math.min(0.36, 0.12 + chatLog.messageShadowIntensity / 140)})`
            : '0 0 0 rgba(0, 0, 0, 0)';
        const playersList = normalizePlayersListConfig(config.playersList ?? config.areas?.players?.playersList);
        const playersListColors = this.resolvePlayersListPreviewColors(playersList, theme);
        const playersPreviewScale = 0.78;
        const playersPreviewWidth = Math.round(
            this.clampNumber(config.layout?.players?.width ?? DEFAULT_FOUNDRY_CUSTOMIZATION.layout.players.width, 180, 420)
            * playersPreviewScale
        );
        const playersPreviewStatusSize = Math.max(6, Math.round(playersList.statusSize * playersPreviewScale));
        const playersPreviewRowHeight = Math.max(16, Math.round(playersList.rowHeight * playersPreviewScale));
        const windows = normalizeWindowsConfig(config.windows ?? config.areas?.windows?.windows);
        const windowsPreview = this.resolveWindowsPreviewStyle(windows, theme);
        const pausePreview = this.resolvePausePreviewStyle(pause, theme);
        const pauseScale = this.clampNumber(pause.scale, 40, 300) / 100;
        const pauseAnimationStrength = this.normalizePauseAnimationStrength(pause.animationStrength) / 100;
        const pauseLabelSize = this.clampNumber(pause.labelSize, 12, 60);
        const pauseLabelSpacing = this.clampNumber(pause.labelLetterSpacing, 0, 24);
        const pauseLabelOffsetY = this.clampNumber(pause.labelOffsetY, -120, 120);

        return [
            `--yf-foundry-preview-font-color:${theme.fontColor}`,
            `--yf-foundry-preview-font-secondary:${theme.secondaryFontColor}`,
            `--yf-foundry-preview-surface:${theme.surfaceBackground}`,
            `--yf-foundry-preview-window:${theme.windowBackground}`,
            `--yf-foundry-preview-header:${theme.windowHeaderBackground}`,
            `--yf-foundry-preview-accent:${theme.accentColor}`,
            `--yf-foundry-preview-chat:${theme.chatTint}`,
            `--yf-foundry-preview-icon:${iconColors.color}`,
            `--yf-foundry-preview-icon-hover:${iconColors.hoverColor}`,
            `--yf-foundry-preview-icon-active:${iconColors.activeColor}`,
            `--yf-foundry-preview-scrollbar:${theme.scrollbarColor}`,
            `--yf-foundry-preview-pause-bar:${pausePreview.bar}`,
            `--yf-foundry-preview-pause-bar-gradient:${pausePreview.barGradient}`,
            `--yf-foundry-preview-pause-bar-height:${pausePreview.barHeight}px`,
            `--yf-foundry-preview-pause-bar-width:${pausePreview.barWidth}%`,
            `--yf-foundry-preview-pause-bar-blur:${pausePreview.barBlur}px`,
            `--yf-foundry-preview-pause-bar-radius:${pausePreview.barRadius}`,
            `--yf-foundry-preview-pause-bar-border:${pausePreview.barBorder}`,
            `--yf-foundry-preview-pause-bar-shadow:${pausePreview.barShadow}`,
            `--yf-foundry-preview-pause-halo:${pausePreview.halo}`,
            `--yf-foundry-preview-pause-halo-size:${pausePreview.haloSize}px`,
            `--yf-foundry-preview-pause-halo-radius:${pausePreview.haloRadius}`,
            `--yf-foundry-preview-pause-halo-blur:${pausePreview.haloBlur}px`,
            `--yf-foundry-preview-pause-halo-shadow:${pausePreview.haloShadow}`,
            `--yf-foundry-preview-pause-halo-blend:${pausePreview.haloBlend}`,
            `--yf-foundry-preview-pause-label-color:${pause.labelColor}`,
            `--yf-foundry-preview-pause-label-size:${Math.round(Math.min(22, Math.max(10, pauseLabelSize * 0.45)))}px`,
            `--yf-foundry-preview-pause-label-weight:${pausePreview.labelWeight}`,
            `--yf-foundry-preview-pause-label-spacing:${Math.round(Math.min(10, Math.max(0, pauseLabelSpacing * 0.4)))}px`,
            `--yf-foundry-preview-pause-label-offset:${Math.round(pauseLabelOffsetY * 0.35)}px`,
            `--yf-foundry-preview-pause-label-top:${pausePreview.labelTop}`,
            `--yf-foundry-preview-pause-label-transform-y:${pausePreview.labelTransformY}`,
            `--yf-foundry-preview-pause-label-transform:${pausePreview.labelTransform}`,
            `--yf-foundry-preview-pause-label-shadow:${pausePreview.labelShadow}`,
            `--yf-foundry-preview-pause-label-case:${pause.labelUppercase === false ? 'none' : 'uppercase'}`,
            `--yf-foundry-preview-pause-scale:${pauseScale}`,
            `--yf-foundry-preview-pause-pulse-scale:${Math.min(3.4, pauseScale + (0.08 * pauseAnimationStrength))}`,
            `--yf-foundry-preview-pause-float-distance:${Number((6 * pauseAnimationStrength).toFixed(2))}px`,
            `--yf-foundry-preview-pause-sway-distance:${Number((6 * pauseAnimationStrength).toFixed(2))}deg`,
            `--yf-foundry-preview-pause-rotation:${pausePreview.rotation}deg`,
            `--yf-foundry-preview-pause-position-x:${pausePreview.positionX}%`,
            `--yf-foundry-preview-pause-position-y:${pausePreview.positionY}%`,
            `--yf-foundry-preview-pause-symbol-filter:${pausePreview.symbolFilter}`,
            `--yf-foundry-preview-pause-symbol-blend:${pausePreview.blendMode}`,
            `--yf-foundry-preview-pause-symbol-shadow:${pausePreview.symbolShadow}`,
            `--yf-foundry-preview-pause-asset-radius:${pausePreview.assetRadius}`,
            `--yf-foundry-preview-pause-font:${this.pauseFontStack(pause.labelFont)}`,
            `--yf-scene-nav-font:${this.fontStack(sceneNavigation.fontFamily)}`,
            `--yf-scene-nav-font-size:${sceneNavigation.fontSize}px`,
            `--yf-scene-nav-font-weight:${sceneNavigation.fontWeight}`,
            `--yf-scene-nav-text-transform:${sceneNavigation.uppercase ? 'uppercase' : 'none'}`,
            `--yf-scene-nav-letter-spacing:${sceneNavigation.letterSpacing}px`,
            `--yf-scene-nav-row-height:${sceneNavigation.rowHeight}px`,
            `--yf-scene-nav-padding-x:${sceneNavigation.paddingX}px`,
            `--yf-scene-nav-padding-y:${sceneNavigation.paddingY}px`,
            `--yf-scene-nav-gap:${sceneNavigation.gap}px`,
            `--yf-scene-nav-border-radius:${sceneNavigation.borderRadius}px`,
            `--yf-scene-nav-border-width:${sceneNavigation.borderWidth}px`,
            `--yf-scene-nav-border-style:${sceneNavigation.borderStyle}`,
            `--yf-scene-nav-text:${sceneNavigationColors.text}`,
            `--yf-scene-nav-border:${sceneNavigationColors.border}`,
            `--yf-scene-nav-normal-bg:${sceneNavigationColors.normalBackground}`,
            `--yf-scene-nav-active-bg:${sceneNavigationColors.activeBackground}`,
            `--yf-scene-nav-viewed-bg:${sceneNavigationColors.viewedBackground}`,
            `--yf-scene-nav-hidden-bg:${sceneNavigationColors.hiddenBackground}`,
            `--yf-scene-nav-hidden-opacity:${sceneNavigation.hiddenOpacity / 100}`,
            `--yf-scene-nav-hover-bg:${sceneNavigationColors.hoverBackground}`,
            `--yf-token-controls-button-size:${tokenControls.buttonSize}px`,
            `--yf-token-controls-icon-size:${tokenControls.iconSize}px`,
            `--yf-token-controls-gap:${tokenControls.gap}px`,
            `--yf-token-controls-column-gap:${tokenControls.columnGap}px`,
            `--yf-token-controls-columns:${tokenControls.columnCount}`,
            `--yf-token-controls-rail-width:${tokenControlsRailWidth}px`,
            `--yf-token-controls-preview-rail-width:${Math.round(tokenControlsRailWidth * tokenControlsPreviewScale)}px`,
            `--yf-token-controls-preview-button-size:${Math.round(tokenControls.buttonSize * tokenControlsPreviewScale)}px`,
            `--yf-token-controls-preview-gap:${Math.round(tokenControls.gap * tokenControlsPreviewScale)}px`,
            `--yf-token-controls-preview-column-gap:${Math.round(tokenControls.columnGap * tokenControlsPreviewScale)}px`,
            `--yf-token-controls-radius:${tokenControls.borderRadius}px`,
            `--yf-token-controls-border-width:${tokenControls.borderWidth}px`,
            `--yf-token-controls-border-style:${tokenControls.borderStyle}`,
            `--yf-token-controls-shadow:${this.getTokenControlsPreviewShadow(tokenControls.shadowIntensity, 'normal')}`,
            `--yf-token-controls-shadow-hover:${this.getTokenControlsPreviewShadow(tokenControls.shadowIntensity, 'hover')}`,
            `--yf-token-controls-shadow-active:${this.getTokenControlsPreviewShadow(tokenControls.shadowIntensity, 'active')}`,
            `--yf-token-controls-disabled-opacity:${tokenControls.disabledOpacity / 100}`,
            `--yf-token-controls-normal-bg:${tokenControlColors.normalBackground}`,
            `--yf-token-controls-normal-border:${tokenControlColors.normalBorder}`,
            `--yf-token-controls-hover-bg:${tokenControlColors.hoverBackground}`,
            `--yf-token-controls-hover-border:${tokenControlColors.hoverBorder}`,
            `--yf-token-controls-active-bg:${tokenControlColors.activeBackground}`,
            `--yf-token-controls-active-border:${tokenControlColors.activeBorder}`,
            `--yf-hotbar-slot-size:${hotbar.slotSize}px`,
            `--yf-hotbar-slot-gap:${hotbar.slotGap}px`,
            `--yf-hotbar-slots-per-row:${hotbar.slotsPerRow}`,
            `--yf-hotbar-control-size:${hotbar.controlSize}px`,
            `--yf-hotbar-control-gap:${hotbar.controlGap}px`,
            `--yf-hotbar-control-radius:${hotbar.controlRadius}px`,
            `--yf-hotbar-slot-opacity:${hotbar.slotOpacity / 100}`,
            `--yf-hotbar-slot-radius:${hotbar.slotRadius}px`,
            `--yf-hotbar-slot-border-width:${hotbar.slotBorderWidth}px`,
            `--yf-hotbar-slot-border-style:${hotbar.slotBorderStyle}`,
            `--yf-hotbar-slot-shadow:${this.getHotbarPreviewShadow(hotbar.slotShadowIntensity, 'normal')}`,
            `--yf-hotbar-slot-shadow-hover:${this.getHotbarPreviewShadow(hotbar.slotShadowIntensity, 'hover')}`,
            `--yf-hotbar-slot-shadow-drop:${this.getHotbarPreviewShadow(hotbar.slotShadowIntensity, 'drop')}`,
            `--yf-hotbar-key-badge-size:${hotbar.keyBadgeSize}px`,
            `--yf-hotbar-key-font-size:${hotbar.keyFontSize}px`,
            `--yf-hotbar-key-opacity:${hotbar.keyOpacity / 100}`,
            `--yf-hotbar-preview-slot-size:${hotbarPreviewSlotSize}px`,
            `--yf-hotbar-preview-gap:${hotbarPreviewGap}px`,
            `--yf-hotbar-preview-control-size:${hotbarPreviewControlSize}px`,
            `--yf-hotbar-preview-bar-height:${hotbarPreviewBarHeight}px`,
            `--yf-hotbar-empty-bg:${hotbarColors.emptyBackground}`,
            `--yf-hotbar-empty-border:${hotbarColors.emptyBorder}`,
            `--yf-hotbar-full-bg:${hotbarColors.fullBackground}`,
            `--yf-hotbar-full-border:${hotbarColors.fullBorder}`,
            `--yf-hotbar-hover-bg:${hotbarColors.hoverBackground}`,
            `--yf-hotbar-hover-border:${hotbarColors.hoverBorder}`,
            `--yf-hotbar-drop-bg:${hotbarColors.dropTargetBackground}`,
            `--yf-hotbar-drop-border:${hotbarColors.dropTargetBorder}`,
            `--yf-hotbar-key-text:${hotbarColors.keyText}`,
            `--yf-hotbar-key-empty-bg:${hotbarColors.keyEmptyBackground}`,
            `--yf-hotbar-key-full-bg:${hotbarColors.keyFullBackground}`,
            `--yf-hotbar-control-bg:${hotbarColors.controlBackground}`,
            `--yf-hotbar-control-border:${hotbarColors.controlBorder}`,
            `--yf-hotbar-control-hover-bg:${hotbarColors.controlHoverBackground}`,
            `--yf-sidebar-preview-width:${sidebarPreviewWidth}px`,
            `--yf-sidebar-preview-rail-width:${sidebarPreviewRailWidth}px`,
            `--yf-sidebar-preview-rail-padding:${Math.max(4, Math.round(sidebar.railPadding * sidebarPreviewScale))}px`,
            `--yf-sidebar-preview-tab-size:${sidebarPreviewTabSize}px`,
            `--yf-sidebar-preview-tab-gap:${Math.max(2, Math.round(sidebar.tabGap * sidebarPreviewScale))}px`,
            `--yf-sidebar-preview-tab-offset-x:${Math.round(sidebar.tabOffsetX * sidebarPreviewScale)}px`,
            `--yf-sidebar-preview-tab-offset-y:${Math.round(sidebar.tabOffsetY * sidebarPreviewScale)}px`,
            `--yf-sidebar-preview-panel-padding:${Math.round(sidebar.panelPadding * sidebarPreviewScale)}px`,
            `--yf-sidebar-preview-panel-gap:${Math.round(sidebar.panelGap * sidebarPreviewScale)}px`,
            `--yf-sidebar-preview-panel-radius:${Math.round(sidebar.panelRadius * sidebarPreviewScale)}px`,
            `--yf-sidebar-preview-panel-border-width:${Math.round(sidebar.panelBorderWidth * sidebarPreviewScale)}px`,
            `--yf-sidebar-preview-panel-shadow:${sidebarPanelShadow}`,
            `--yf-sidebar-preview-search-height:${sidebarPreviewSearchHeight}px`,
            `--yf-sidebar-preview-action-height:${Math.round(sidebar.actionHeight * sidebarPreviewScale)}px`,
            `--yf-sidebar-preview-row-height:${sidebarPreviewRowHeight}px`,
            `--yf-sidebar-preview-folder-height:${sidebarPreviewFolderHeight}px`,
            `--yf-sidebar-preview-folder-indent:${Math.max(3, Math.round(sidebar.folderIndent * sidebarPreviewScale))}px`,
            `--yf-sidebar-preview-font-size:${Math.max(9, Math.round(sidebar.fontSize * 0.85))}px`,
            `--yf-sidebar-preview-divider:${sidebarDivider}`,
            `--yf-sidebar-preview-hover-bg:${sidebarHover}`,
            `--yf-sidebar-preview-active-bg:${sidebarActive}`,
            `--yf-sidebar-preview-active-soft:${sidebarActiveSoft}`,
            `--yf-sidebar-preview-rail-bg:${sidebarRailBg}`,
            `--yf-sidebar-preview-panel-bg:${sidebarPanelBg}`,
            `--yf-sidebar-preview-panel-border:${sidebarPanelBorder}`,
            `--yf-sidebar-preview-folder-bg:${sidebarFolderBg}`,
            `--yf-sidebar-preview-input-bg:${sidebarInputBg}`,
            `--yf-chatlog-preview-log-padding:${chatLog.logPadding}px`,
            `--yf-chatlog-preview-message-gap:${chatLog.messageGap}px`,
            `--yf-chatlog-preview-content-max-width:${chatLog.contentMaxWidth}px`,
            `--yf-chatlog-preview-message-padding:${chatLog.messagePadding}px`,
            `--yf-chatlog-preview-message-radius:${chatLog.messageRadius}px`,
            `--yf-chatlog-preview-message-border-width:${chatLog.messageBorderWidth}px`,
            `--yf-chatlog-preview-message-border:${chatLogMessageBorder}`,
            `--yf-chatlog-preview-message-shadow:${chatLogMessageShadow}`,
            `--yf-chatlog-preview-header-gap:${chatLog.headerGap}px`,
            `--yf-chatlog-preview-divider:${chatLogDivider}`,
            `--yf-chatlog-preview-hover-border:${chatLogHoverBorder}`,
            `--yf-chatlog-preview-hover-surface:${chatLogHoverSurface}`,
            `--yf-chatlog-preview-context-border:${chatLogContextBorder}`,
            `--yf-chatlog-preview-composer-min-height:${chatLog.composerMinHeight}px`,
            `--yf-chatlog-preview-composer-max-height:${chatLog.composerMaxHeight}px`,
            `--yf-chatlog-preview-composer-padding:${chatLog.composerPadding}px`,
            `--yf-chatlog-preview-composer-radius:${chatLog.composerRadius}px`,
            `--yf-chatlog-preview-composer-border-width:${chatLog.composerBorderWidth}px`,
            `--yf-chatlog-preview-composer-bg:${chatLogComposerBg}`,
            `--yf-chatlog-preview-composer-focus:${chatLogComposerFocus}`,
            `--yf-chatlog-preview-composer-focus-soft:${chatLogComposerFocusSoft}`,
            `--yf-players-preview-width:${playersPreviewWidth}px`,
            `--yf-players-panel-padding:${Math.round(playersList.panelPadding * playersPreviewScale)}px`,
            `--yf-players-panel-gap:${Math.round(playersList.panelGap * playersPreviewScale)}px`,
            `--yf-players-panel-radius:${Math.round(playersList.panelRadius * playersPreviewScale)}px`,
            `--yf-players-panel-border-width:${Math.max(0, Math.round(playersList.panelBorderWidth * playersPreviewScale))}px`,
            `--yf-players-panel-border:${playersListColors.panelBorder}`,
            `--yf-players-panel-bg:${playersListColors.panelBackground}`,
            `--yf-players-panel-shadow:${playersListColors.panelShadow}`,
            `--yf-players-panel-filter:${playersListColors.panelFilter}`,
            `--yf-players-text:${playersListColors.text}`,
            `--yf-players-row-height:${playersPreviewRowHeight}px`,
            `--yf-players-row-padding-x:${Math.round(playersList.rowPaddingX * playersPreviewScale)}px`,
            `--yf-players-row-gap:${Math.round(playersList.rowGap * playersPreviewScale)}px`,
            `--yf-players-row-radius:${Math.round(playersList.rowRadius * playersPreviewScale)}px`,
            `--yf-players-row-bg:${playersListColors.rowBackground}`,
            `--yf-players-row-border:${playersListColors.rowBorder}`,
            `--yf-players-status-size:${playersPreviewStatusSize}px`,
            `--yf-players-status-width:${this.getPlayersListPreviewStatusWidth(playersList, playersPreviewStatusSize)}px`,
            `--yf-players-inactive-opacity:${playersList.inactiveOpacity / 100}`,
            `--yf-players-hover-bg:${playersListColors.hoverBackground}`,
            `--yf-players-hover-border:${playersListColors.hoverBorder}`,
            `--yf-players-self-bg:${playersListColors.selfBackground}`,
            `--yf-players-self-border:${playersListColors.selfBorder}`,
            `--yf-players-gm-bg:${playersListColors.gmBackground}`,
            `--yf-players-gm-border:${playersListColors.gmBorder}`,
            `--yf-players-idle-text:${playersListColors.idleText}`,
            `--yf-players-control-text:${playersListColors.controlText}`,
            `--yf-players-control-hover-text:${playersListColors.controlHoverText}`,
            `--yf-players-control-hover-bg:${playersListColors.controlHoverBackground}`,
            `--yf-windows-preview-frame-bg:${windowsPreview.frameBackground}`,
            `--yf-windows-preview-header-bg:${windowsPreview.headerBackground}`,
            `--yf-windows-preview-content-bg:${windowsPreview.contentBackground}`,
            `--yf-windows-preview-border:${windowsPreview.borderColor}`,
            `--yf-windows-preview-divider:${windowsPreview.dividerColor}`,
            `--yf-windows-preview-header-text:${windowsPreview.headerText}`,
            `--yf-windows-preview-content-text:${windowsPreview.contentText}`,
            `--yf-windows-preview-shadow:${windowsPreview.shadow}`,
            `--yf-windows-preview-radius:${Math.round(windows.frameRadius * 0.78)}px`,
            `--yf-windows-preview-border-width:${Math.max(0, Math.round(windows.frameBorderWidth * 0.85))}px`,
            `--yf-windows-preview-opacity:${windows.frameOpacity / 100}`,
            `--yf-windows-preview-inactive-opacity:${Math.min(windows.frameOpacity, windows.inactiveOpacity) / 100}`,
            `--yf-windows-preview-header-height:${Math.round(windows.headerHeight * 0.76)}px`,
            `--yf-windows-preview-content-padding:${Math.round(windows.contentPadding * 0.72)}px`,
            `--yf-windows-preview-grip:${windowsPreview.gripColor}`,
            `--yf-windows-preview-grip-opacity:${windows.headerGripStrength / 100}`,
            `--yf-windows-preview-scrollbar-thumb:${windowsPreview.scrollbarThumb}`,
            `--yf-windows-preview-scrollbar-track:${windowsPreview.scrollbarTrack}`,
            `--yf-windows-preview-scrollbar-opacity:${windowsPreview.scrollbarOpacity}`,
            `--yf-windows-preview-resize-handle:${windowsPreview.resizeHandle}`,
            `--yf-windows-preview-backdrop:${windowsPreview.backdrop}`
        ].join(';');
    }

    getFoundryPreviewShellClass(foundryConfig = DEFAULT_FOUNDRY_CUSTOMIZATION) {
        const config = this.normalizeFoundryPreviewConfig(foundryConfig);
        const visibility = config.visibility;
        const visibilityEnabled = config.enabled !== false && config.categories?.visibility !== false;
        const classes = ['yf-foundry-preview-shell'];

        if (config.enabled === false) classes.push('is-foundry-stock');
        if (visibilityEnabled && !visibility.navigation) classes.push('is-nav-hidden');
        if (visibilityEnabled && !visibility.controls) classes.push('is-controls-hidden');
        if (visibilityEnabled && !visibility.players) classes.push('is-players-hidden');
        if (visibilityEnabled && !visibility.hotbar) classes.push('is-hotbar-hidden');
        if (visibilityEnabled && !visibility.sidebar) classes.push('is-sidebar-hidden');
        if (visibilityEnabled && !visibility.pause) classes.push('is-pause-hidden');

        return classes.join(' ');
    }

    getFoundryAreaPreviewClass(foundryConfig = DEFAULT_FOUNDRY_CUSTOMIZATION, areaId = 'navigation') {
        const config = this.normalizeFoundryPreviewConfig(foundryConfig);
        const normalizedAreaId = this.normalizeFoundryPreviewAreaId(areaId);
        const classes = ['yf-foundry-area-preview', `is-area-${normalizedAreaId}`];

        if (config.enabled === false) classes.push('is-foundry-stock');
        if (config.enabled !== false && config.areaEnabled?.[normalizedAreaId] === false) classes.push('is-area-disabled');
        if (config.enabled !== false && !this.isFoundryPreviewAreaVisible(config, normalizedAreaId)) classes.push('is-area-hidden');
        if (normalizedAreaId === 'navigation') {
            classes.push(`is-scene-nav-${normalizeSceneNavigationConfig(config.sceneNavigation).layoutMode}`);
        }
        if (normalizedAreaId === 'players') {
            const playersList = normalizePlayersListConfig(config.playersList ?? config.areas?.players?.playersList);
            classes.push(`is-players-mode-${playersList.visualMode}`);
            classes.push(`is-players-status-${playersList.statusStyle}`);
        }
        if (normalizedAreaId === 'windows') {
            const windows = normalizeWindowsConfig(config.windows ?? config.areas?.windows?.windows);
            classes.push(`is-windows-mode-${windows.visualMode}`);
        }

        return classes.join(' ');
    }

    isFoundryPreviewAreaVisible(foundryConfig = DEFAULT_FOUNDRY_CUSTOMIZATION, areaId = 'navigation') {
        if (foundryConfig.enabled === false || foundryConfig.categories?.visibility === false) return true;
        const normalizedAreaId = this.normalizeFoundryPreviewAreaId(areaId);
        if (['navigation', 'controls', 'players', 'hotbar', 'sidebar', 'pause'].includes(normalizedAreaId)) {
            return foundryConfig.visibility?.[normalizedAreaId] !== false;
        }
        return true;
    }

    getFoundryAreaThemeSignature(foundryConfig = DEFAULT_FOUNDRY_CUSTOMIZATION, areaId = 'navigation') {
        const theme = this.resolveFoundryPreviewTheme(foundryConfig.theme);
        switch (this.normalizeFoundryPreviewAreaId(areaId)) {
            case 'chatLog':
                return {
                    chatTint: theme.chatTint,
                    fontColor: theme.fontColor,
                    secondaryFontColor: theme.secondaryFontColor
                };
            case 'windows':
            case 'sidebar':
                return {
                    windowBackground: theme.windowBackground,
                    windowHeaderBackground: theme.windowHeaderBackground,
                    fontColor: theme.fontColor,
                    secondaryFontColor: theme.secondaryFontColor,
                    accentColor: theme.accentColor
                };
            case 'controls':
            case 'hotbar':
            case 'players':
            case 'navigation':
                return {
                    surfaceBackground: theme.surfaceBackground,
                    fontColor: theme.fontColor,
                    accentColor: theme.accentColor
                };
            case 'pause':
                return {
                    accentColor: theme.accentColor
                };
            default:
                return theme;
        }
    }

    resolveFoundryPreviewTheme(theme = {}) {
        const source = theme && typeof theme === 'object' ? theme : {};
        return Object.fromEntries(Object.entries(STOCK_FOUNDRY_PREVIEW_THEME).map(([fieldId, fallback]) => {
            const value = source[fieldId];
            return [fieldId, typeof value === 'string' && value.trim() ? value.trim() : fallback];
        }));
    }

    normalizeFoundryPreviewAreaId(areaId = 'navigation') {
        const id = String(areaId || '').trim();
        return FOUNDRY_PREVIEW_AREAS.some(area => area.id === id) ? id : FOUNDRY_PREVIEW_AREAS[0].id;
    }

    getFoundryAreaIconSignature(foundryConfig = DEFAULT_FOUNDRY_CUSTOMIZATION, areaId = 'navigation') {
        const normalizedAreaId = this.normalizeFoundryPreviewAreaId(areaId);
        const iconConfig = normalizeLegacyIcons(foundryConfig);
        return getIconRegistryEntries({ area: normalizedAreaId }).map(entry => ({
            id: entry.id,
            group: entry.defaultGroup,
            groupColors: iconConfig.groups?.[entry.defaultGroup] ?? null,
            override: iconConfig.overrides?.[entry.id] ?? null,
            iconClass: iconConfig.overrides?.[entry.id]?.iconClass ?? null
        }));
    }

    resolveFoundryPreviewIconColors(foundryConfig = DEFAULT_FOUNDRY_CUSTOMIZATION, areaId = null) {
        const config = this.normalizeFoundryPreviewConfig(foundryConfig);
        const theme = this.resolveFoundryPreviewTheme(config.theme);
        const fallback = {
            color: theme.iconColor,
            hoverColor: theme.iconHoverColor,
            activeColor: theme.iconHoverColor
        };
        const normalizedAreaId = areaId ? this.normalizeFoundryPreviewAreaId(areaId) : null;
        if (!normalizedAreaId) return fallback;

        const iconConfig = normalizeLegacyIcons(config);
        if (config.enabled === false || config.categories?.icons === false || iconConfig.enabled === false) return fallback;

        const entries = getIconRegistryEntries({ area: normalizedAreaId });
        if (!entries.length) return fallback;

        const entry = entries.find(candidate => iconConfig.overrides?.[candidate.id]?.inheritGroup === false) ?? entries[0];
        const groupColors = this.resolveIconPreviewColorSet(iconConfig.groups?.[entry.defaultGroup], fallback);
        const override = iconConfig.overrides?.[entry.id] ?? null;
        if (override?.inheritGroup === false) {
            return this.resolveIconPreviewColorSet(override, groupColors);
        }

        return groupColors;
    }

    resolveIconPreviewColorSet(colorSet = {}, fallback = {}) {
        const color = this.normalizePreviewColor(colorSet?.color, fallback.color || DEFAULT_FOUNDRY_CUSTOMIZATION.theme.iconColor);
        const hoverColor = this.normalizePreviewColor(colorSet?.hoverColor, fallback.hoverColor || color);
        const activeColor = this.normalizePreviewColor(colorSet?.activeColor, fallback.activeColor || hoverColor);
        return { color, hoverColor, activeColor };
    }

    resolveSceneNavigationPreviewColors(sceneNavigation = {}, theme = DEFAULT_FOUNDRY_CUSTOMIZATION.theme) {
        const nav = normalizeSceneNavigationConfig(sceneNavigation);
        this.preserveStockPreviewColorFields(nav, sceneNavigation, SCENE_NAVIGATION_PREVIEW_COLOR_FIELDS);
        const resolvedTheme = this.resolveFoundryPreviewTheme(theme);
        const accentSoft = this.hexToRgba(resolvedTheme.accentColor, 0.26);
        const accentMedium = this.hexToRgba(resolvedTheme.accentColor, 0.58);
        const surface = this.hexToRgba(resolvedTheme.surfaceBackground, 0.78);
        const surfaceStrong = this.hexToRgba(resolvedTheme.surfaceBackground, 0.92);
        const header = this.hexToRgba(resolvedTheme.windowHeaderBackground, 0.94);
        const hiddenSurface = this.hexToRgba(resolvedTheme.surfaceBackground, 0.52);

        return {
            text: this.normalizePreviewColor(nav.textColor, resolvedTheme.fontColor),
            border: this.normalizePreviewColor(nav.borderColor, accentSoft),
            normalBackground: this.normalizePreviewColor(nav.normalBackgroundColor, surface),
            activeBackground: this.normalizePreviewColor(nav.activeBackgroundColor, header),
            viewedBackground: this.normalizePreviewColor(nav.viewedBackgroundColor, surfaceStrong),
            hiddenBackground: this.normalizePreviewColor(nav.hiddenBackgroundColor, hiddenSurface),
            hoverBackground: this.normalizePreviewColor(nav.hoverBackgroundColor, accentMedium)
        };
    }

    resolveTokenControlsPreviewColors(tokenControls = {}, theme = DEFAULT_FOUNDRY_CUSTOMIZATION.theme) {
        const controls = normalizeTokenControlsConfig(tokenControls);
        this.preserveStockPreviewColorFields(controls, tokenControls, TOKEN_CONTROLS_PREVIEW_COLOR_FIELDS);
        const resolvedTheme = this.resolveFoundryPreviewTheme(theme);
        const accentSoft = this.hexToRgba(resolvedTheme.accentColor, 0.26);
        const accentMedium = this.hexToRgba(resolvedTheme.accentColor, 0.58);
        const accentStrong = this.hexToRgba(resolvedTheme.accentColor, 0.86);
        const surface = this.hexToRgba(resolvedTheme.surfaceBackground, 0.78);
        const surfaceStrong = this.hexToRgba(resolvedTheme.surfaceBackground, 0.92);
        const header = this.hexToRgba(resolvedTheme.windowHeaderBackground, 0.94);

        return {
            normalBackground: this.normalizePreviewColor(controls.normalBackgroundColor, surface),
            normalBorder: this.normalizePreviewColor(controls.normalBorderColor, accentSoft),
            hoverBackground: this.normalizePreviewColor(controls.hoverBackgroundColor, surfaceStrong),
            hoverBorder: this.normalizePreviewColor(controls.hoverBorderColor, accentMedium),
            activeBackground: this.normalizePreviewColor(controls.activeBackgroundColor, header),
            activeBorder: this.normalizePreviewColor(controls.activeBorderColor, accentStrong)
        };
    }

    resolveHotbarPreviewColors(hotbarConfig = {}, theme = DEFAULT_FOUNDRY_CUSTOMIZATION.theme) {
        const hotbar = normalizeHotbarConfig(hotbarConfig);
        this.preserveStockPreviewColorFields(hotbar, hotbarConfig, HOTBAR_PREVIEW_COLOR_FIELDS);
        const resolvedTheme = this.resolveFoundryPreviewTheme(theme);
        const surface = this.hexToRgba(resolvedTheme.surfaceBackground, 0.78);
        const surfaceStrong = this.hexToRgba(resolvedTheme.surfaceBackground, 0.92);
        const header = this.hexToRgba(resolvedTheme.windowHeaderBackground, 0.94);
        const accentSoft = this.hexToRgba(resolvedTheme.accentColor, 0.32);
        const accentMedium = this.hexToRgba(resolvedTheme.accentColor, 0.62);
        const accentStrong = this.hexToRgba(resolvedTheme.accentColor, 0.88);
        const controlSurface = this.hexToRgba(resolvedTheme.surfaceBackground, 0.56);

        return {
            emptyBackground: this.normalizePreviewColor(hotbar.emptyBackgroundColor, surface),
            emptyBorder: this.normalizePreviewColor(hotbar.emptyBorderColor, accentSoft),
            fullBackground: this.normalizePreviewColor(hotbar.fullBackgroundColor, surfaceStrong),
            fullBorder: this.normalizePreviewColor(hotbar.fullBorderColor, accentMedium),
            hoverBackground: this.normalizePreviewColor(hotbar.hoverBackgroundColor, header),
            hoverBorder: this.normalizePreviewColor(hotbar.hoverBorderColor, accentStrong),
            dropTargetBackground: this.normalizePreviewColor(hotbar.dropTargetBackgroundColor, accentSoft),
            dropTargetBorder: this.normalizePreviewColor(hotbar.dropTargetBorderColor, accentStrong),
            keyText: this.normalizePreviewColor(hotbar.keyTextColor, resolvedTheme.fontColor),
            keyEmptyBackground: this.normalizePreviewColor(hotbar.keyEmptyBackgroundColor, header),
            keyFullBackground: this.normalizePreviewColor(hotbar.keyFullBackgroundColor, accentMedium),
            controlBackground: this.normalizePreviewColor(hotbar.controlBackgroundColor, 'transparent'),
            controlBorder: this.normalizePreviewColor(hotbar.controlBorderColor, accentSoft),
            controlHoverBackground: this.normalizePreviewColor(hotbar.controlHoverBackgroundColor, controlSurface)
        };
    }

    resolvePlayersListPreviewColors(playersListConfig = {}, theme = DEFAULT_FOUNDRY_CUSTOMIZATION.theme) {
        const playersList = normalizePlayersListConfig(playersListConfig);
        const resolvedTheme = this.resolveFoundryPreviewTheme(theme);
        const panelShadow = playersList.panelShadowIntensity > 0
            ? `0 ${Math.max(2, Math.round(playersList.panelShadowIntensity * 0.22))}px ${Math.max(5, Math.round(playersList.panelShadowIntensity * 0.7))}px rgba(0, 0, 0, ${Math.min(0.38, 0.12 + playersList.panelShadowIntensity / 150)})`
            : 'none';
        const neonShadow = playersList.visualMode === 'neon' && playersList.panelShadowIntensity > 0
            ? `, 0 0 ${Math.max(6, Math.round(playersList.panelShadowIntensity * 0.75))}px ${this.hexToRgba(resolvedTheme.accentColor, 0.3)}`
            : '';

        return {
            panelBackground: this.normalizePreviewColor(playersList.panelBackgroundColor, this.getPlayersListPreviewPanelBackground(playersList.visualMode, resolvedTheme)),
            rowBackground: this.normalizePreviewColor(playersList.rowBackgroundColor, this.getPlayersListPreviewRowBackground(playersList.visualMode, resolvedTheme)),
            rowBorder: this.normalizePreviewColor(playersList.rowBorderColor, playersList.visualMode === 'banner'
                ? this.hexToRgba(resolvedTheme.secondaryFontColor, 0.24)
                : 'transparent'),
            panelBorder: this.normalizePreviewColor(playersList.panelBorderColor, this.hexToRgba(resolvedTheme.accentColor, Math.max(0.16, playersList.selfHighlight / 180))),
            panelShadow: `${panelShadow}${neonShadow}`,
            panelFilter: ['glass', 'neon'].includes(playersList.visualMode) ? 'blur(5px) saturate(1.08)' : 'none',
            text: this.normalizePreviewColor(playersList.textColor, resolvedTheme.fontColor),
            hoverBackground: this.normalizePreviewColor(playersList.hoverBackgroundColor, this.hexToRgba(resolvedTheme.accentColor, Math.min(0.28, playersList.hoverStrength / 260))),
            hoverBorder: this.normalizePreviewColor(playersList.hoverBorderColor, this.hexToRgba(resolvedTheme.accentColor, Math.max(0.18, playersList.hoverStrength / 110))),
            selfBackground: this.normalizePreviewColor(playersList.selfBackgroundColor, this.hexToRgba(resolvedTheme.accentColor, Math.min(0.36, playersList.selfHighlight / 250))),
            selfBorder: this.normalizePreviewColor(playersList.selfBorderColor, this.hexToRgba(resolvedTheme.accentColor, Math.max(0.28, playersList.selfHighlight / 115))),
            gmBackground: this.normalizePreviewColor(playersList.gmBackgroundColor, this.hexToRgba(resolvedTheme.windowHeaderBackground, Math.min(0.78, 0.22 + playersList.gmHighlight / 170))),
            gmBorder: this.normalizePreviewColor(playersList.gmBorderColor, this.hexToRgba(resolvedTheme.accentColor, Math.max(0.18, playersList.gmHighlight / 140))),
            idleText: this.normalizePreviewColor(playersList.inactiveTextColor, this.hexToRgba(resolvedTheme.secondaryFontColor, 0.82)),
            controlText: this.normalizePreviewColor(playersList.controlTextColor, resolvedTheme.iconColor),
            controlHoverText: this.normalizePreviewColor(playersList.controlHoverTextColor, resolvedTheme.iconHoverColor),
            controlHoverBackground: this.normalizePreviewColor(playersList.controlHoverBackgroundColor, this.hexToRgba(resolvedTheme.accentColor, Math.min(0.28, playersList.hoverStrength / 260)))
        };
    }

    resolveWindowsPreviewStyle(windowsConfig = {}, theme = DEFAULT_FOUNDRY_CUSTOMIZATION.theme) {
        const windows = normalizeWindowsConfig(windowsConfig);
        const resolvedTheme = this.resolveFoundryPreviewTheme(theme);
        const frameAlpha = windows.frameOpacity / 100;
        const borderColor = this.hexToRgba(
            resolvedTheme.accentColor,
            windows.visualMode === 'high-contrast' ? 0.95 : Math.max(0.18, 0.24 + windows.frameBorderWidth * 0.14)
        );
        const dividerColor = this.hexToRgba(
            windows.visualMode === 'high-contrast' ? resolvedTheme.accentColor : resolvedTheme.secondaryFontColor,
            Math.max(0.08, windows.headerDividerStrength / 100)
        );
        const contentTint = this.hexToRgba(
            windows.visualMode === 'high-contrast' ? resolvedTheme.accentColor : resolvedTheme.surfaceBackground,
            Math.min(0.48, windows.contentContrast / 150)
        );
        const scrollbarStrength = windows.scrollbarStrength / 100;
        const scrollbarAlpha = windows.visualMode === 'high-contrast'
            ? Math.max(0.28, scrollbarStrength)
            : Math.max(0.03, scrollbarStrength * 0.92);
        const scrollbarTrackAlpha = Math.min(0.24, Math.max(0.01, scrollbarStrength * 0.18));

        return {
            frameBackground: this.normalizePreviewSurfaceColor(windows.frameBackgroundColor, this.getWindowsPreviewFrameBackground(windows, resolvedTheme, frameAlpha), this.getWindowsPreviewFrameSurfaceAlpha(windows, frameAlpha), { gradient: true }),
            headerBackground: this.normalizePreviewSurfaceColor(windows.headerBackgroundColor, this.getWindowsPreviewHeaderBackground(windows, resolvedTheme), this.getWindowsPreviewHeaderSurfaceAlpha(windows)),
            contentBackground: this.normalizePreviewSurfaceColor(windows.contentBackgroundColor, this.getWindowsPreviewContentBackground(windows, resolvedTheme, contentTint), this.getWindowsPreviewContentSurfaceAlpha(windows), { gradient: true }),
            borderColor: this.normalizePreviewSurfaceColor(windows.frameBorderColor, borderColor, windows.visualMode === 'high-contrast' ? 0.95 : Math.max(0.18, 0.24 + windows.frameBorderWidth * 0.14)),
            dividerColor: this.normalizePreviewSurfaceColor(windows.headerDividerColor, dividerColor, Math.max(0.08, windows.headerDividerStrength / 100)),
            headerText: this.normalizePreviewColor(windows.headerTextColor, resolvedTheme.fontColor),
            contentText: this.normalizePreviewColor(windows.contentTextColor, resolvedTheme.fontColor),
            gripColor: this.normalizePreviewSurfaceColor(windows.headerGripColor, this.hexToRgba(resolvedTheme.accentColor, Math.max(0.04, windows.headerGripStrength / 100)), Math.max(0.04, windows.headerGripStrength / 100)),
            scrollbarThumb: this.normalizePreviewSurfaceColor(windows.scrollbarThumbColor, this.hexToRgba(resolvedTheme.accentColor, scrollbarAlpha), scrollbarAlpha),
            scrollbarTrack: this.normalizePreviewSurfaceColor(windows.scrollbarTrackColor, this.hexToRgba(resolvedTheme.surfaceBackground, scrollbarTrackAlpha), scrollbarTrackAlpha),
            scrollbarOpacity: Math.max(0.04, scrollbarStrength),
            resizeHandle: this.normalizePreviewSurfaceColor(windows.resizeHandleColor, this.hexToRgba(resolvedTheme.accentColor, 0.72), 0.72),
            shadow: this.getWindowsPreviewShadow(windows, resolvedTheme),
            backdrop: ['glass', 'arcane', 'neon'].includes(windows.visualMode) && windows.glassBlur > 0
                ? `blur(${Math.max(1, Math.round(windows.glassBlur * 0.65))}px) saturate(1.08)`
                : 'none'
        };
    }

    getWindowsPreviewFrameSurfaceAlpha(windows, frameAlpha) {
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

    getWindowsPreviewHeaderSurfaceAlpha(windows) {
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

    getWindowsPreviewContentSurfaceAlpha(windows) {
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

    getWindowsPreviewFrameBackground(windows, theme, frameAlpha) {
        const windowBg = this.hexToRgba(theme.windowBackground, frameAlpha);
        const headerSoft = this.hexToRgba(theme.windowHeaderBackground, Math.min(1, frameAlpha + 0.02));
        switch (windows.visualMode) {
            case 'compact':
                return this.hexToRgba(theme.windowBackground, Math.min(1, frameAlpha + 0.02));
            case 'parchment':
                return `linear-gradient(180deg, ${this.hexToRgba(theme.windowHeaderBackground, 0.42)} 0%, ${this.hexToRgba(theme.windowBackground, 0.86)} 100%)`;
            case 'arcane':
                return `radial-gradient(circle at 12% 0%, ${this.hexToRgba(theme.accentColor, 0.24)} 0%, transparent 34%), linear-gradient(180deg, ${headerSoft} 0%, ${windowBg} 100%)`;
            case 'high-contrast':
                return `linear-gradient(180deg, ${this.hexToRgba(theme.windowHeaderBackground, 1)} 0%, ${this.hexToRgba(theme.windowBackground, 1)} 100%)`;
            case 'neon':
                return `linear-gradient(180deg, ${this.hexToRgba(theme.surfaceBackground, 0.84)} 0%, ${this.hexToRgba(theme.windowBackground, frameAlpha)} 100%), radial-gradient(circle at 100% 0%, ${this.hexToRgba(theme.accentColor, 0.18)}, transparent 38%)`;
            case 'glass':
                return `linear-gradient(180deg, ${this.hexToRgba(theme.windowHeaderBackground, 0.74)} 0%, ${this.hexToRgba(theme.windowBackground, Math.max(0.62, frameAlpha - 0.12))} 100%)`;
            case 'solid':
            default:
                return `linear-gradient(180deg, ${headerSoft} 0%, ${windowBg} 100%)`;
        }
    }

    getWindowsPreviewHeaderBackground(windows, theme) {
        switch (windows.visualMode) {
            case 'compact':
                return this.hexToRgba(theme.windowHeaderBackground, 0.9);
            case 'parchment':
                return `linear-gradient(180deg, ${this.hexToRgba(theme.accentColor, 0.2)} 0%, ${this.hexToRgba(theme.windowHeaderBackground, 0.86)} 100%)`;
            case 'arcane':
                return `linear-gradient(90deg, ${this.hexToRgba(theme.accentColor, 0.22)} 0%, ${this.hexToRgba(theme.windowHeaderBackground, 0.94)} 42%, ${this.hexToRgba(theme.surfaceBackground, 0.78)} 100%)`;
            case 'high-contrast':
                return this.hexToRgba(theme.windowHeaderBackground, 1);
            case 'neon':
                return `linear-gradient(90deg, ${this.hexToRgba(theme.accentColor, 0.24)} 0%, ${this.hexToRgba(theme.windowHeaderBackground, 0.9)} 100%)`;
            case 'glass':
                return this.hexToRgba(theme.windowHeaderBackground, 0.72);
            case 'solid':
            default:
                return this.hexToRgba(theme.windowHeaderBackground, 0.96);
        }
    }

    getWindowsPreviewContentBackground(windows, theme, contentTint) {
        switch (windows.visualMode) {
            case 'compact':
                return this.hexToRgba(theme.windowBackground, 0.82);
            case 'parchment':
                return `linear-gradient(0deg, ${this.hexToRgba(theme.surfaceBackground, 0.16)}, ${this.hexToRgba(theme.surfaceBackground, 0.16)}), linear-gradient(0deg, ${this.hexToRgba(theme.windowBackground, 0.74)}, ${this.hexToRgba(theme.windowBackground, 0.74)})`;
            case 'arcane':
                return `radial-gradient(circle at 100% 0%, ${this.hexToRgba(theme.accentColor, 0.14)} 0%, transparent 34%), linear-gradient(180deg, ${contentTint} 0%, ${this.hexToRgba(theme.windowBackground, 0.9)} 100%)`;
            case 'high-contrast':
                return `linear-gradient(180deg, ${this.hexToRgba(theme.surfaceBackground, 0.98)} 0%, ${this.hexToRgba(theme.windowBackground, 1)} 100%)`;
            case 'neon':
                return `linear-gradient(180deg, ${this.hexToRgba(theme.windowBackground, 0.8)} 0%, ${this.hexToRgba(theme.surfaceBackground, 0.88)} 100%)`;
            case 'glass':
                return `linear-gradient(180deg, ${contentTint} 0%, ${this.hexToRgba(theme.windowBackground, 0.68)} 100%)`;
            case 'solid':
            default:
                return `linear-gradient(180deg, ${contentTint} 0%, ${this.hexToRgba(theme.windowBackground, 0.92)} 100%)`;
        }
    }

    getWindowsPreviewShadow(windows, theme) {
        const amount = windows.visualMode === 'compact'
            ? Math.round(windows.frameShadowIntensity * 0.45)
            : windows.frameShadowIntensity;
        if (amount <= 0) return 'none';

        const y = Math.max(2, Math.round(amount * 0.18));
        const blur = Math.max(7, Math.round(amount * 0.85));
        const alpha = Math.min(0.48, 0.14 + amount / 150);
        const base = `0 ${y}px ${blur}px rgba(0, 0, 0, ${alpha})`;
        if (windows.visualMode === 'neon') {
            return `${base}, 0 0 ${Math.max(8, Math.round(amount * 0.65))}px ${this.hexToRgba(theme.accentColor, 0.38)}`;
        }
        if (windows.visualMode === 'arcane') {
            return `${base}, inset 0 0 0 1px ${this.hexToRgba(theme.accentColor, 0.18)}`;
        }
        if (windows.visualMode === 'high-contrast') {
            return `${base}, 0 0 0 1px ${this.hexToRgba(theme.accentColor, 0.62)}`;
        }
        return base;
    }

    getPlayersListPreviewPanelBackground(mode, theme) {
        switch (mode) {
            case 'compact':
                return this.hexToRgba(theme.surfaceBackground, 0.9);
            case 'minimal':
                return this.hexToRgba(theme.surfaceBackground, 0.36);
            case 'neon':
                return `linear-gradient(180deg, ${this.hexToRgba(theme.surfaceBackground, 0.86)} 0%, ${this.hexToRgba(theme.windowBackground, 0.78)} 100%)`;
            case 'banner':
                return `linear-gradient(180deg, ${this.hexToRgba(theme.windowHeaderBackground, 0.96)} 0%, ${this.hexToRgba(theme.surfaceBackground, 0.88)} 100%)`;
            case 'glass':
            default:
                return `linear-gradient(180deg, ${this.hexToRgba(theme.surfaceBackground, 0.78)} 0%, ${this.hexToRgba(theme.windowBackground, 0.7)} 100%)`;
        }
    }

    getPlayersListPreviewRowBackground(mode, theme) {
        switch (mode) {
            case 'banner':
                return this.hexToRgba(theme.surfaceBackground, 0.56);
            case 'compact':
                return this.hexToRgba(theme.surfaceBackground, 0.18);
            case 'neon':
                return this.hexToRgba(theme.windowBackground, 0.22);
            case 'minimal':
                return 'transparent';
            case 'glass':
            default:
                return this.hexToRgba(theme.windowBackground, 0.28);
        }
    }

    getPlayersListPreviewStatusWidth(playersList, statusSize) {
        if (playersList.statusStyle === 'pill') return Math.round(statusSize * 1.85);
        return statusSize;
    }

    getTokenControlsPreviewShadow(intensity = 0, state = 'normal') {
        const amount = this.clampNumber(intensity, 0, 32);
        if (amount <= 0) return 'none';

        const alpha = state === 'active' ? 0.38 : state === 'hover' ? 0.32 : 0.24;
        const blur = Math.max(2, Math.round(amount * (state === 'active' ? 0.7 : state === 'hover' ? 0.58 : 0.45)));
        const y = Math.max(1, Math.round(amount / 9));
        return `0 ${y}px ${blur}px rgba(0, 0, 0, ${alpha})`;
    }

    getHotbarPreviewShadow(intensity = 0, state = 'normal') {
        const amount = this.clampNumber(intensity, 0, 36);
        if (amount <= 0) return 'none';

        const alpha = state === 'drop' ? 0.38 : state === 'hover' ? 0.32 : 0.24;
        const blur = Math.max(2, Math.round(amount * (state === 'drop' ? 0.7 : state === 'hover' ? 0.58 : 0.45)));
        const y = Math.max(1, Math.round(amount / 9));
        return `0 ${y}px ${blur}px rgba(0, 0, 0, ${alpha})`;
    }

    normalizePreviewColor(value, fallback) {
        if (typeof value !== 'string') return fallback;
        const trimmed = value.trim();
        return trimmed || fallback;
    }

    normalizePreviewSurfaceColor(value, fallback, alpha = 1, { gradient = false, topAlpha = null } = {}) {
        if (typeof value !== 'string') return fallback;
        const trimmed = value.trim();
        if (!trimmed) return fallback;
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
            const resolvedAlpha = Math.max(0, Math.min(1, alpha));
            if (gradient) {
                const resolvedTopAlpha = Math.max(0, Math.min(1, topAlpha ?? Math.min(1, resolvedAlpha + 0.08)));
                return `linear-gradient(180deg, ${this.hexToRgba(trimmed, resolvedTopAlpha)} 0%, ${this.hexToRgba(trimmed, resolvedAlpha)} 100%)`;
            }
            return this.hexToRgba(trimmed, resolvedAlpha);
        }
        return trimmed;
    }

    preserveStockPreviewColorFields(target, source, fields = []) {
        if (!target || !source || typeof source !== 'object') return;
        for (const field of fields) {
            if (!Object.prototype.hasOwnProperty.call(source, field)) continue;
            const value = source[field];
            const isExplicitColor = typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value.trim());
            if (!isExplicitColor) target[field] = '';
        }
    }

    normalizeFoundryPreviewConfig(foundryConfig = DEFAULT_FOUNDRY_CUSTOMIZATION) {
        const source = foundryConfig || {};
        const normalized = {
            ...DEFAULT_FOUNDRY_CUSTOMIZATION,
            ...source,
            categories: {
                ...DEFAULT_FOUNDRY_CUSTOMIZATION.categories,
                ...(source.categories || {})
            },
            areaEnabled: {
                ...DEFAULT_FOUNDRY_CUSTOMIZATION.areaEnabled,
                ...(source.areaEnabled || {})
            },
            theme: {
                ...DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
                ...(source.theme || {})
            },
            visibility: {
                ...DEFAULT_FOUNDRY_CUSTOMIZATION.visibility,
                ...(source.visibility || {})
            },
            layout: {},
            pause: {
                ...DEFAULT_FOUNDRY_CUSTOMIZATION.pause,
                ...(source.pause || {})
            },
            sceneNavigation: {
                ...DEFAULT_SCENE_NAVIGATION_CUSTOMIZATION,
                ...(source.sceneNavigation || {})
            },
            tokenControls: {
                ...DEFAULT_FOUNDRY_CUSTOMIZATION.tokenControls,
                ...(source.tokenControls || {})
            },
            hotbar: {
                ...DEFAULT_HOTBAR_CUSTOMIZATION,
                ...(source.hotbar || {})
            },
            sidebar: {
                ...DEFAULT_SIDEBAR_CUSTOMIZATION,
                ...(source.sidebar || {})
            },
            chatLog: {
                ...DEFAULT_CHAT_LOG_CUSTOMIZATION,
                ...(source.chatLog || source.areas?.chatLog?.chatLog || {})
            },
            playersList: {
                ...DEFAULT_PLAYERS_LIST_CUSTOMIZATION,
                ...(source.playersList || source.areas?.players?.playersList || {})
            },
            windows: {
                ...DEFAULT_WINDOWS_CUSTOMIZATION,
                ...(source.windows || source.areas?.windows?.windows || {})
            }
        };
        delete normalized.areaEnabled.directories;
        delete normalized.areas?.directories;
        normalized.sceneNavigation = normalizeSceneNavigationConfig(normalized.sceneNavigation);
        normalized.tokenControls = normalizeTokenControlsConfig(normalized.tokenControls);
        normalized.hotbar = normalizeHotbarConfig(normalized.hotbar);
        this.preserveStockPreviewColorFields(normalized.sceneNavigation, source.sceneNavigation, SCENE_NAVIGATION_PREVIEW_COLOR_FIELDS);
        this.preserveStockPreviewColorFields(normalized.tokenControls, source.tokenControls, TOKEN_CONTROLS_PREVIEW_COLOR_FIELDS);
        this.preserveStockPreviewColorFields(normalized.hotbar, source.hotbar, HOTBAR_PREVIEW_COLOR_FIELDS);
        normalized.sidebar = normalizeSidebarConfig(normalized.sidebar);
        normalized.chatLog = normalizeChatLogConfig(normalized.chatLog);
        normalized.playersList = normalizePlayersListConfig(normalized.playersList);
        this.preserveStockPreviewColorFields(normalized.playersList, source.playersList || source.areas?.players?.playersList, PLAYERS_LIST_PREVIEW_COLOR_FIELDS);
        normalized.windows = normalizeWindowsConfig(normalized.windows);
        this.preserveStockPreviewColorFields(normalized.windows, source.windows || source.areas?.windows?.windows, WINDOWS_PREVIEW_COLOR_FIELDS);

        normalized.componentStyles = {};
        for (const component of FOUNDRY_UI_COMPONENTS) {
            if (component.id === 'pause') continue;
            normalized.layout[component.id] = {
                ...(DEFAULT_FOUNDRY_CUSTOMIZATION.layout?.[component.id] || {}),
                ...(source.layout?.[component.id] || {})
            };
            normalized.componentStyles[component.id] = {
                ...(DEFAULT_FOUNDRY_CUSTOMIZATION.componentStyles?.[component.id] || {}),
                ...(source.componentStyles?.[component.id] || {})
            };
        }

        return normalized;
    }

    getEffectiveFoundryPreviewConfig(foundryConfig = DEFAULT_FOUNDRY_CUSTOMIZATION) {
        const config = this.normalizeFoundryPreviewConfig(foundryConfig);
        const effective = clonePreviewValue(config);
        const categories = effective.categories || {};

        if (effective.enabled === false) {
            this.applyStockFoundryPreviewConfig(effective);
            return effective;
        }

        if (categories.theme === false) {
            effective.theme = {
                ...DEFAULT_FOUNDRY_CUSTOMIZATION.theme,
                interfaceFont: effective.theme.interfaceFont,
                windowFont: effective.theme.windowFont
            };
        }

        if (categories.fonts === false) {
            effective.sceneNavigation = {
                ...effective.sceneNavigation,
                fontFamily: DEFAULT_SCENE_NAVIGATION_CUSTOMIZATION.fontFamily,
                fontSize: DEFAULT_SCENE_NAVIGATION_CUSTOMIZATION.fontSize,
                fontWeight: DEFAULT_SCENE_NAVIGATION_CUSTOMIZATION.fontWeight,
                uppercase: DEFAULT_SCENE_NAVIGATION_CUSTOMIZATION.uppercase,
                letterSpacing: DEFAULT_SCENE_NAVIGATION_CUSTOMIZATION.letterSpacing
            };
        }

        if (categories.icons === false) {
            effective.icons = {
                ...normalizeLegacyIcons(effective),
                enabled: false
            };
        }

        if (categories.visibility === false) {
            effective.visibility = clonePreviewValue(DEFAULT_FOUNDRY_CUSTOMIZATION.visibility);
        }

        if (categories.layout === false) {
            effective.layout = clonePreviewValue(DEFAULT_FOUNDRY_CUSTOMIZATION.layout);
        }

        if (categories.components === false) {
            this.applyDefaultFoundryComponentPreviewConfig(effective);
        }

        if (categories.pause === false) {
            effective.pause = clonePreviewValue(DEFAULT_FOUNDRY_CUSTOMIZATION.pause);
        }

        return effective;
    }

    applyStockFoundryPreviewConfig(config) {
        config.areaEnabled = clonePreviewValue(DEFAULT_FOUNDRY_CUSTOMIZATION.areaEnabled);
        config.visibility = clonePreviewValue(DEFAULT_FOUNDRY_CUSTOMIZATION.visibility);
        config.layout = clonePreviewValue(DEFAULT_FOUNDRY_CUSTOMIZATION.layout);
        config.theme = clonePreviewValue(DEFAULT_FOUNDRY_CUSTOMIZATION.theme);
        config.pause = clonePreviewValue(DEFAULT_FOUNDRY_CUSTOMIZATION.pause);
        config.icons = {
            ...normalizeLegacyIcons(config),
            enabled: false
        };
        this.applyDefaultFoundryComponentPreviewConfig(config);
    }

    applyDefaultFoundryComponentPreviewConfig(config) {
        config.componentStyles = {};
        for (const component of FOUNDRY_UI_COMPONENTS) {
            if (component.id === 'pause') continue;
            config.componentStyles[component.id] = clonePreviewValue(
                DEFAULT_FOUNDRY_CUSTOMIZATION.componentStyles?.[component.id] || {}
            );
        }
        config.sceneNavigation = clonePreviewValue(DEFAULT_SCENE_NAVIGATION_CUSTOMIZATION);
        config.tokenControls = clonePreviewValue(DEFAULT_FOUNDRY_CUSTOMIZATION.tokenControls);
        config.hotbar = clonePreviewValue(DEFAULT_HOTBAR_CUSTOMIZATION);
        config.sidebar = clonePreviewValue(DEFAULT_SIDEBAR_CUSTOMIZATION);
        config.chatLog = clonePreviewValue(DEFAULT_CHAT_LOG_CUSTOMIZATION);
        config.playersList = clonePreviewValue(DEFAULT_PLAYERS_LIST_CUSTOMIZATION);
        config.windows = clonePreviewValue(DEFAULT_WINDOWS_CUSTOMIZATION);
    }

    applyFoundryComponentPreviewStyles(shellPreview, foundryConfig = DEFAULT_FOUNDRY_CUSTOMIZATION) {
        const config = this.getEffectiveFoundryPreviewConfig(foundryConfig);
        const componentPreviews = Array.from(shellPreview.querySelectorAll('[data-foundry-preview-component]'));
        const componentStylesEnabled = config.categories.components !== false;

        for (const element of componentPreviews) {
            const componentId = element.dataset.foundryPreviewComponent;
            const areaEnabled = config.areaEnabled?.[componentId] !== false;
            const style = componentId !== 'players' && componentStylesEnabled && areaEnabled
                ? config.componentStyles?.[componentId]
                : null;
            this.applyFoundryComponentPreviewStyle(element, style, componentId);
        }
    }

    applyFoundryComponentPreviewStyle(element, componentStyle = null, componentId = null) {
        if (!element) return;

        this.clearFoundryComponentPreviewStyle(element);
        if (!componentStyle) return;

        const opacity = Number(componentStyle.opacity);
        if (Number.isFinite(opacity) && opacity < 100) {
            element.style.opacity = String(this.clampNumber(opacity, 10, 100) / 100);
        }

        if (componentStyle.backgroundImage) {
            const bgOpacity = this.clampNumber(componentStyle.backgroundOpacity ?? 100, 10, 100) / 100;
            const overlayAlpha = Number((1 - bgOpacity).toFixed(2));
            const safeUrl = this.escapeCssUrl(componentStyle.backgroundImage);
            element.style.backgroundImage = `linear-gradient(rgba(0,0,0,${overlayAlpha}), rgba(0,0,0,${overlayAlpha})), url("${safeUrl}")`;
            element.style.backgroundSize = 'cover';
            element.style.backgroundPosition = 'center';
            element.classList.add('has-component-bg');
        }

        const borderWidth = this.clampNumber(componentStyle.borderWidth ?? 0, 0, 10);
        const borderStyle = componentStyle.borderStyle || 'none';
        if (componentId !== 'controls' && borderStyle !== 'none' && borderWidth > 0) {
            const borderColor = componentStyle.borderColor || 'var(--yf-foundry-preview-accent)';
            element.style.border = `${borderWidth}px ${borderStyle} ${borderColor}`;
        }

        const borderRadius = this.clampNumber(componentStyle.borderRadius ?? 0, 0, 50);
        if (borderRadius > 0) {
            element.style.borderRadius = `${borderRadius}px`;
        }
    }

    clearFoundryComponentPreviewStyle(element) {
        element.style.removeProperty('opacity');
        element.style.removeProperty('background-image');
        element.style.removeProperty('background-size');
        element.style.removeProperty('background-position');
        element.style.removeProperty('border');
        element.style.removeProperty('border-radius');
        element.classList.remove('has-component-bg');
    }

    getPausePreviewClass(pauseConfig = {}) {
        const classes = [];
        const visualMode = this.normalizePauseVisualMode(pauseConfig.visualMode);
        const motion = this.normalizePauseMotionMode(pauseConfig.motion);
        const labelPlacement = this.normalizePauseLabelPlacement(pauseConfig.labelPlacement);
        const effect = this.normalizePauseEffect(pauseConfig.effect);
        const filter = this.normalizePauseSymbolFilter(pauseConfig.symbolFilter);
        const blend = this.normalizePauseBlendMode(pauseConfig.blendMode);
        classes.push('is-enhanced', `mode-${visualMode}`, `motion-${motion}`, `placement-${labelPlacement}`, `filter-${filter}`, `blend-${blend}`);
        if (pauseConfig.enabled && String(pauseConfig.assetPath || '').trim()) classes.push('is-custom');
        if (pauseConfig.hideLabel) classes.push('is-label-hidden');
        if (effect && effect !== 'none') classes.push(`effect-${effect}`);
        return classes.join(' ');
    }

    getPausePreviewLabel(pauseConfig = {}) {
        return pauseConfig.labelText?.trim() || this.localize('GAME.Paused');
    }

    getPausePreviewAsset(pauseConfig = {}) {
        const path = pauseConfig.enabled ? String(pauseConfig.assetPath || '').trim() : '';
        const isVideo = /\.(webm|mp4|ogg|ogv|mov)$/i.test(path);
        return {
            path,
            hasAsset: Boolean(path),
            isVideo,
            isImage: Boolean(path && !isVideo)
        };
    }

    applyPausePreviewMedia(mediaElement, pauseConfig = {}, fallbackClass = 'yf-area-pause-native-symbol') {
        const asset = this.getPausePreviewAsset(pauseConfig);
        mediaElement.replaceChildren();

        if (asset.hasAsset) {
            const element = document.createElement(asset.isVideo ? 'video' : 'img');
            element.src = asset.path;
            if (asset.isVideo) {
                element.autoplay = true;
                element.loop = true;
                element.muted = true;
                element.playsInline = true;
            } else {
                element.alt = '';
            }
            mediaElement.appendChild(element);
            return;
        }

        const fallback = document.createElement('span');
        fallback.className = fallbackClass;
        mediaElement.appendChild(fallback);
    }

    resolvePausePreviewStyle(pauseConfig = {}, theme = DEFAULT_FOUNDRY_CUSTOMIZATION.theme) {
        const pause = {
            ...DEFAULT_FOUNDRY_CUSTOMIZATION.pause,
            ...(pauseConfig || {})
        };
        const mode = this.normalizePauseVisualMode(pause.visualMode);
        const modeStyle = this.getPauseModePreviewStyle(mode, theme, pause);
        const hasCustomAsset = Boolean(pause.enabled && String(pause.assetPath || '').trim());
        const glow = this.clampNumber(pause.glowStrength, 0, 100);
        const shadow = this.clampNumber(pause.shadowStrength, 0, 100);
        const labelGlow = this.clampNumber(pause.labelGlow, 0, 100);
        const labelPlacement = this.normalizePauseLabelPlacement(pause.labelPlacement);
        const barOpacity = this.clampNumber(pause.barOpacity, 0, 100) / 100;
        const bar = this.hexToRgba(pause.barColor, barOpacity);
        const borderAlpha = Math.max(0, Math.min(0.68, this.clampNumber(pause.barBorderStrength, 0, 100) / 100));

        return {
            bar,
            barGradient: modeStyle.barGradient(bar),
            barHeight: Math.round(Math.min(110, Math.max(26, pause.barHeight * 0.32))),
            barWidth: this.clampNumber(pause.barWidth, 35, 100),
            barBlur: this.clampNumber(pause.barBlur, 0, 16),
            barRadius: this.getPausePreviewBarRadius(this.normalizePauseBarShape(pause.barShape), modeStyle),
            barBorder: this.hexToRgba(modeStyle.borderColor, borderAlpha),
            barShadow: modeStyle.barShadow(glow),
            halo: modeStyle.halo,
            haloSize: Math.round(64 + glow * 1.6),
            haloRadius: modeStyle.haloRadius,
            haloBlur: modeStyle.haloBlur,
            haloShadow: modeStyle.haloShadow(glow),
            haloBlend: modeStyle.haloBlend,
            labelWeight: this.normalizePauseLabelWeight(pause.labelWeight),
            labelTop: this.getPausePreviewLabelTop(labelPlacement, pause.scale),
            labelTransformY: labelPlacement === 'overlay'
                ? `calc(-50% + ${Math.round(pause.labelOffsetY * 0.35)}px)`
                : `${Math.round(pause.labelOffsetY * 0.35)}px`,
            labelTransform: labelPlacement === 'overlay'
                ? `translate(-50%, calc(-50% + ${Math.round(pause.labelOffsetY * 0.35)}px))`
                : `translate(-50%, ${Math.round(pause.labelOffsetY * 0.35)}px)`,
            labelShadow: this.getPausePreviewLabelShadow(pause.labelColor, labelGlow),
            rotation: this.clampNumber(pause.rotation, -180, 180),
            positionX: this.clampNumber(pause.positionX, 10, 90),
            positionY: this.clampNumber(pause.positionY, 20, 80),
            symbolFilter: this.getPausePreviewSymbolFilter(this.normalizePauseSymbolFilter(pause.symbolFilter), modeStyle, shadow, {
                includeModeFilter: !hasCustomAsset,
                includeShadow: !hasCustomAsset
            }),
            symbolShadow: `0 ${Math.round(3 + shadow * 0.06)}px ${Math.round(8 + shadow * 0.22)}px rgba(0, 0, 0, ${Math.max(0.12, Math.min(0.65, shadow / 100))})`,
            blendMode: this.normalizePauseBlendMode(pause.blendMode),
            assetRadius: modeStyle.assetRadius
        };
    }

    normalizePauseVisualMode(value) {
        return PAUSE_VISUAL_MODES.has(value) ? value : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.visualMode;
    }

    normalizePauseEffect(value) {
        return PAUSE_EFFECTS.has(value) ? value : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.effect;
    }

    normalizePauseMotionMode(value) {
        return PAUSE_MOTION_MODES.has(value) ? value : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.motion;
    }

    normalizePauseAnimationStrength(value) {
        if (value === null || value === undefined || value === '') {
            return DEFAULT_FOUNDRY_CUSTOMIZATION.pause.animationStrength;
        }
        const numeric = Number(value);
        return Number.isFinite(numeric)
            ? this.clampNumber(numeric, 0, 200)
            : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.animationStrength;
    }

    normalizePauseLabelPlacement(value) {
        return PAUSE_LABEL_PLACEMENTS.has(value) ? value : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.labelPlacement;
    }

    normalizePauseSymbolFilter(value) {
        return PAUSE_SYMBOL_FILTERS.has(value) ? value : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.symbolFilter;
    }

    normalizePauseBlendMode(value) {
        return PAUSE_BLEND_MODES.has(value) ? value : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.blendMode;
    }

    normalizePauseBarShape(value) {
        return PAUSE_BAR_SHAPES.has(value) ? value : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.barShape;
    }

    normalizePauseLabelWeight(value) {
        const numeric = Number(value);
        return [400, 500, 600, 700, 800, 900].includes(numeric)
            ? numeric
            : DEFAULT_FOUNDRY_CUSTOMIZATION.pause.labelWeight;
    }

    getPausePreviewLabelTop(placement, scale) {
        const distance = Math.round(Math.max(24, Math.min(50, scale * 0.38)));
        switch (placement) {
            case 'above': return `calc(50% - ${distance}px)`;
            case 'overlay': return '50%';
            default: return `calc(50% + ${distance}px)`;
        }
    }

    getPausePreviewLabelShadow(color, strength) {
        const alpha = Math.max(0, Math.min(0.9, strength / 100));
        if (alpha <= 0) return '0 1px 5px rgba(0, 0, 0, 0.52)';
        return `0 1px 5px rgba(0, 0, 0, 0.6), 0 0 ${Math.round(4 + strength * 0.18)}px ${this.hexToRgba(color, alpha)}`;
    }

    getPausePreviewSymbolFilter(filterMode, modeStyle, shadowStrength, { includeModeFilter = true, includeShadow = true } = {}) {
        const filters = {
            none: '',
            radiant: 'brightness(1.14) saturate(1.16)',
            arcane: 'saturate(1.35) hue-rotate(18deg)',
            ember: 'sepia(0.28) saturate(1.42) hue-rotate(-10deg)',
            frost: 'brightness(1.1) saturate(0.76) hue-rotate(165deg)',
            shadow: 'brightness(0.72) contrast(1.2) saturate(0.8)',
            blood: 'sepia(0.46) saturate(1.72) hue-rotate(-34deg)',
            neon: 'brightness(1.18) saturate(1.8) contrast(1.08)'
        };
        const shadow = `drop-shadow(0 ${Math.round(3 + shadowStrength * 0.04)}px ${Math.round(7 + shadowStrength * 0.18)}px rgba(0, 0, 0, ${Math.max(0.12, Math.min(0.7, shadowStrength / 100))}))`;
        return [
            filters[filterMode] || '',
            includeModeFilter ? modeStyle.symbolFilter : '',
            includeShadow ? shadow : ''
        ].filter(Boolean).join(' ') || 'none';
    }

    getPausePreviewBarRadius(shape, modeStyle) {
        switch (shape) {
            case 'square': return '0';
            case 'soft': return '4px';
            case 'rounded': return '14px';
            case 'pill': return '999px';
            default: return modeStyle.barRadius;
        }
    }

    getPauseModePreviewStyle(mode, theme = DEFAULT_FOUNDRY_CUSTOMIZATION.theme, pause = {}) {
        const accent = theme?.accentColor || DEFAULT_FOUNDRY_CUSTOMIZATION.theme.accentColor;
        const labelColor = pause?.labelColor || DEFAULT_FOUNDRY_CUSTOMIZATION.pause.labelColor;
        const styles = {
            cinematic: {
                borderColor: accent,
                haloRadius: '50%',
                haloBlur: 5,
                haloBlend: 'screen',
                assetRadius: '7px',
                symbolFilter: 'saturate(1.08)',
                barGradient: bar => `linear-gradient(to right, transparent 0%, ${bar} 24%, ${bar} 76%, transparent 100%)`,
                barShadow: strength => `0 0 ${Math.round(4 + strength * 0.16)}px ${this.hexToRgba(accent, strength / 260)}`,
                halo: `radial-gradient(circle, ${this.hexToRgba(accent, 0.52)} 0%, ${this.hexToRgba(labelColor, 0.18)} 34%, transparent 70%)`,
                haloShadow: strength => `0 0 ${Math.round(8 + strength * 0.28)}px ${this.hexToRgba(accent, strength / 155)}`
            },
            'arcane-seal': {
                borderColor: '#9f7cff',
                haloRadius: '50%',
                haloBlur: 3,
                haloBlend: 'screen',
                assetRadius: '50%',
                symbolFilter: 'saturate(1.45) hue-rotate(12deg)',
                barGradient: bar => `repeating-linear-gradient(90deg, transparent 0 12px, ${this.hexToRgba('#9f7cff', 0.14)} 12px 14px), linear-gradient(to right, transparent 0%, ${bar} 22%, ${bar} 78%, transparent 100%)`,
                barShadow: strength => `inset 0 0 ${Math.round(5 + strength * 0.12)}px ${this.hexToRgba('#65f5d2', strength / 270)}`,
                halo: `radial-gradient(circle, transparent 36%, ${this.hexToRgba('#65f5d2', 0.5)} 38%, transparent 43%, ${this.hexToRgba('#9f7cff', 0.28)} 58%, transparent 72%)`,
                haloShadow: strength => `0 0 ${Math.round(9 + strength * 0.32)}px ${this.hexToRgba('#9f7cff', strength / 145)}`
            },
            'parchment-sigil': {
                borderColor: '#c89a57',
                haloRadius: '12px',
                haloBlur: 1,
                haloBlend: 'normal',
                assetRadius: '6px',
                symbolFilter: 'sepia(0.34) saturate(1.08)',
                barGradient: bar => `linear-gradient(90deg, transparent 0%, ${bar} 18%, ${this.hexToRgba('#f0d7a6', 0.2)} 50%, ${bar} 82%, transparent 100%)`,
                barShadow: strength => `0 0 ${Math.round(3 + strength * 0.12)}px ${this.hexToRgba('#f0d7a6', strength / 310)}`,
                halo: `radial-gradient(ellipse, ${this.hexToRgba('#f0d7a6', 0.42)} 0%, ${this.hexToRgba('#7a5430', 0.16)} 55%, transparent 74%)`,
                haloShadow: strength => `0 0 ${Math.round(6 + strength * 0.2)}px ${this.hexToRgba('#c89a57', strength / 190)}`
            },
            'neon-breach': {
                borderColor: '#00e5ff',
                haloRadius: '10px',
                haloBlur: 2,
                haloBlend: 'screen',
                assetRadius: '5px',
                symbolFilter: 'brightness(1.2) saturate(1.8) contrast(1.08)',
                barGradient: bar => `linear-gradient(90deg, transparent 0%, ${this.hexToRgba('#ff2bd6', 0.28)} 21%, ${bar} 50%, ${this.hexToRgba('#00e5ff', 0.32)} 79%, transparent 100%)`,
                barShadow: strength => `0 0 ${Math.round(6 + strength * 0.25)}px ${this.hexToRgba('#00e5ff', strength / 150)}`,
                halo: `linear-gradient(135deg, ${this.hexToRgba('#00e5ff', 0.52)}, transparent 45%, ${this.hexToRgba('#ff2bd6', 0.46)})`,
                haloShadow: strength => `0 0 ${Math.round(10 + strength * 0.36)}px ${this.hexToRgba('#ff2bd6', strength / 145)}`
            },
            'minimal-utility': {
                borderColor: '#d7dde8',
                haloRadius: '50%',
                haloBlur: 8,
                haloBlend: 'normal',
                assetRadius: '4px',
                symbolFilter: 'saturate(0.8)',
                barGradient: bar => `linear-gradient(to right, transparent 0%, ${bar} 30%, ${bar} 70%, transparent 100%)`,
                barShadow: () => 'none',
                halo: 'transparent',
                haloShadow: () => 'none'
            },
            'dark-ritual': {
                borderColor: '#8e2dff',
                haloRadius: '50%',
                haloBlur: 4,
                haloBlend: 'screen',
                assetRadius: '50%',
                symbolFilter: 'contrast(1.18) saturate(1.24)',
                barGradient: bar => `radial-gradient(circle at 50% 50%, ${this.hexToRgba('#8e2dff', 0.24)}, transparent 28%), linear-gradient(to right, transparent 0%, ${bar} 18%, ${this.hexToRgba('#1a0409', 0.82)} 50%, ${bar} 82%, transparent 100%)`,
                barShadow: strength => `inset 0 0 ${Math.round(6 + strength * 0.18)}px ${this.hexToRgba('#8e2dff', strength / 190)}`,
                halo: `radial-gradient(circle, transparent 28%, ${this.hexToRgba('#8e2dff', 0.48)} 33%, ${this.hexToRgba('#1a0409', 0.36)} 56%, transparent 72%)`,
                haloShadow: strength => `0 0 ${Math.round(9 + strength * 0.32)}px ${this.hexToRgba('#8e2dff', strength / 155)}`
            },
            'divine-light': {
                borderColor: '#fff2a8',
                haloRadius: '50%',
                haloBlur: 7,
                haloBlend: 'screen',
                assetRadius: '10px',
                symbolFilter: 'brightness(1.22) saturate(1.1)',
                barGradient: bar => `linear-gradient(to right, transparent 0%, ${this.hexToRgba('#fff2a8', 0.26)} 18%, ${bar} 50%, ${this.hexToRgba('#7fd7ff', 0.22)} 82%, transparent 100%)`,
                barShadow: strength => `0 0 ${Math.round(8 + strength * 0.28)}px ${this.hexToRgba('#fff2a8', strength / 155)}`,
                halo: `radial-gradient(circle, ${this.hexToRgba('#fff2a8', 0.62)} 0%, ${this.hexToRgba('#7fd7ff', 0.2)} 44%, transparent 72%)`,
                haloShadow: strength => `0 0 ${Math.round(12 + strength * 0.38)}px ${this.hexToRgba('#fff2a8', strength / 140)}`
            },
            'blood-moon': {
                borderColor: '#dc2f4f',
                haloRadius: '50%',
                haloBlur: 4,
                haloBlend: 'screen',
                assetRadius: '50%',
                symbolFilter: 'sepia(0.38) saturate(1.65) hue-rotate(-28deg)',
                barGradient: bar => `linear-gradient(to right, transparent 0%, ${bar} 18%, ${this.hexToRgba('#dc2f4f', 0.38)} 50%, ${bar} 82%, transparent 100%)`,
                barShadow: strength => `0 0 ${Math.round(6 + strength * 0.26)}px ${this.hexToRgba('#dc2f4f', strength / 155)}`,
                halo: `radial-gradient(circle, ${this.hexToRgba('#dc2f4f', 0.5)} 0%, ${this.hexToRgba('#22050a', 0.42)} 58%, transparent 73%)`,
                haloShadow: strength => `0 0 ${Math.round(10 + strength * 0.34)}px ${this.hexToRgba('#dc2f4f', strength / 145)}`
            },
            'frost-stasis': {
                borderColor: '#9fe9ff',
                haloRadius: '12px',
                haloBlur: 3,
                haloBlend: 'screen',
                assetRadius: '6px',
                symbolFilter: 'brightness(1.12) saturate(0.72) hue-rotate(170deg)',
                barGradient: bar => `repeating-linear-gradient(115deg, transparent 0 12px, ${this.hexToRgba('#d8fbff', 0.12)} 12px 14px), linear-gradient(to right, transparent 0%, ${bar} 22%, ${this.hexToRgba('#9fe9ff', 0.25)} 50%, ${bar} 78%, transparent 100%)`,
                barShadow: strength => `0 0 ${Math.round(6 + strength * 0.24)}px ${this.hexToRgba('#9fe9ff', strength / 160)}`,
                halo: `radial-gradient(circle, ${this.hexToRgba('#d8fbff', 0.5)} 0%, ${this.hexToRgba('#3c8fac', 0.24)} 48%, transparent 72%)`,
                haloShadow: strength => `0 0 ${Math.round(10 + strength * 0.34)}px ${this.hexToRgba('#9fe9ff', strength / 145)}`
            },
            'solar-anima': {
                borderColor: '#ffb83d',
                haloRadius: '50%',
                haloBlur: 5,
                haloBlend: 'screen',
                assetRadius: '50%',
                symbolFilter: 'brightness(1.16) saturate(1.38)',
                barGradient: bar => `linear-gradient(90deg, transparent 0%, ${bar} 18%, ${this.hexToRgba('#ffb83d', 0.44)} 50%, ${bar} 82%, transparent 100%)`,
                barShadow: strength => `0 0 ${Math.round(7 + strength * 0.28)}px ${this.hexToRgba('#ffb83d', strength / 148)}`,
                halo: `radial-gradient(circle, ${this.hexToRgba('#fff4ba', 0.5)} 0%, ${this.hexToRgba('#ffb83d', 0.42)} 34%, transparent 72%)`,
                haloShadow: strength => `0 0 ${Math.round(10 + strength * 0.38)}px ${this.hexToRgba('#ffb83d', strength / 138)}`
            }
        };

        return styles[mode] || styles.cinematic;
    }

    clampNumber(value, min, max) {
        const number = Number(value);
        if (!Number.isFinite(number)) return min;
        return Math.max(min, Math.min(max, number));
    }

    deepEqual(left, right) {
        return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
    }

    escapeCssUrl(value) {
        return String(value ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }

    hexToRgba(hex, alpha = 1) {
        const normalized = String(hex || '').trim().replace('#', '');
        if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(normalized)) {
            return `rgba(0, 0, 0, ${alpha})`;
        }

        const factor = normalized.length === 3 ? 1 : 2;
        const read = (start) => {
            const chunk = factor === 1 ? normalized[start] : normalized.slice(start * 2, start * 2 + 2);
            return parseInt(factor === 1 ? `${chunk}${chunk}` : chunk, 16);
        };

        return `rgba(${read(0)}, ${read(1)}, ${read(2)}, ${alpha})`;
    }

    fontStack(fontFamily) {
        return fontFamily && fontFamily !== 'inherit'
            ? `"${fontFamily}", serif`
            : 'inherit';
    }

    pauseFontStack(fontFamily) {
        return fontFamily && fontFamily !== 'inherit'
            ? this.fontStack(fontFamily)
            : 'var(--font-serif)';
    }

    localize(key) {
        return game.i18n.localize(key);
    }

    formatI18n(key, data = {}) {
        if (typeof game.i18n.format === 'function') {
            return game.i18n.format(key, data);
        }

        let value = this.localize(key);
        for (const [name, replacement] of Object.entries(data)) {
            value = value.replace(`{${name}}`, replacement);
        }
        return value;
    }

    getFixtureSurfaceClassification(fixtureClasses = []) {
        const classes = new Set(fixtureClasses);
        if (classes.has('roll-message')) {
            return {
                type: MESSAGE_CLASSIFICATION_TYPES.ROLL,
                systemId: 'generic',
                isRoll: true,
                isCard: false
            };
        }

        if (classes.has('item-card')) {
            return {
                type: MESSAGE_CLASSIFICATION_TYPES.ITEM_CARD,
                systemId: classes.has('dnd5e') ? 'dnd5e' : classes.has('pf2e') ? 'pf2e' : 'generic',
                cardType: classes.has('dnd5e') ? 'itemCards' : classes.has('pf2e') ? 'actionCards' : 'generic',
                isRoll: false,
                isCard: true,
                isItemCard: true
            };
        }

        if (classes.has('system-card')) {
            return {
                type: MESSAGE_CLASSIFICATION_TYPES.SYSTEM_CARD,
                systemId: classes.has('dnd5e') ? 'dnd5e' : classes.has('pf2e') ? 'pf2e' : 'generic',
                cardType: classes.has('pf2e') && classes.has('spell-card')
                    ? 'spellCards'
                    : classes.has('pf2e')
                        ? 'actionCards'
                        : classes.has('dnd5e')
                            ? 'abilityCards'
                            : 'generic',
                isRoll: false,
                isCard: true,
                isSystemCard: true
            };
        }

        return {
            type: MESSAGE_CLASSIFICATION_TYPES.SIMPLE,
            isRoll: false,
            isCard: false
        };
    }

    canStyleRollSurfaces(config, classification) {
        const rolls = config?.rolls;
        if (rolls?.enabled === false) return false;

        const systemId = classification?.systemId === 'dnd5e' || classification?.systemId === 'pf2e'
            ? classification.systemId
            : 'generic';
        return rolls?.systems?.[systemId]?.enabled !== false;
    }

    applyRollPreviewOutcome(root, outcomeId = '') {
        if (!root?.querySelectorAll || !outcomeId) return;

        const outcomeClasses = outcomeId === 'critical'
            ? ['critical', 'success']
            : outcomeId === 'failure'
                ? ['failure', 'fumble']
                : [];

        for (const total of root.querySelectorAll('.dice-total')) {
            total.classList.remove('critical', 'success', 'failure', 'fumble');
            total.classList.add(...outcomeClasses);
        }
    }

    canStyleCardSurfaces(config, classification) {
        if (!classification?.isCard) return true;
        const cards = config?.cards;
        if (cards?.enabled === false) return false;

        if (classification.systemId === 'dnd5e') {
            const cardType = classification.cardType === 'abilityCards'
                ? 'abilityCards'
                : 'itemCards';
            return cards?.systems?.dnd5e?.[cardType] !== false;
        }

        if (classification.systemId === 'pf2e') {
            const cardType = classification.cardType === 'spellCards'
                ? 'spellCards'
                : 'actionCards';
            return cards?.systems?.pf2e?.[cardType] !== false;
        }

        return cards?.systems?.generic?.enabled !== false;
    }
}

function clonePreviewValue(value) {
    if (globalThis.foundry?.utils?.deepClone) return foundry.utils.deepClone(value);
    return JSON.parse(JSON.stringify(value));
}
