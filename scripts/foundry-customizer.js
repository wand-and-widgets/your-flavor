/**
 * Your Flavor - Foundry shell customizer
 * Applies client-side theme, visibility, layout, and pause overrides.
 * v4: Transform-based positioning, granular categories, custom CSS, per-component styling.
 */

import {
    DEFAULT_FOUNDRY_CUSTOMIZATION,
    FOUNDRY_UI_COMPONENTS,
    MODULE_ID
} from './constants.js';

const STYLE_ELEMENT_ID = `${MODULE_ID}-foundry-customization`;
const ARRANGE_HANDLE_CLASS = 'yf-arrange-handle';

export class FoundryCustomizer {
    constructor() {
        this._styleElement = null;
        this._lastAppliedConfig = foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION);
        this._refreshTimeout = null;
        this._naturalRects = new Map();
        this._arrangeState = {
            active: false,
            config: null,
            onChange: null,
            handles: new Map(),
            drag: null
        };
        this._boundRefresh = () => this.refreshArrangeMode();
        this._boundPointerMove = (event) => this._onArrangePointerMove(event);
        this._boundPointerUp = () => this._onArrangePointerUp();
    }

    async initialize() {
        this._ensureStyleElement();

        Hooks.on('pauseGame', () => this._scheduleRefresh());
        Hooks.on('renderApplicationV2', () => this._scheduleRefresh());
        Hooks.on('collapseSidebar', (_sidebar, collapsed) => this._onSidebarCollapse(collapsed));

        window.addEventListener('resize', () => {
            this._naturalRects.clear();
            this._boundRefresh();
        });
        // Mark sidebar as expanded initially (Foundry starts expanded by default)
        // The collapseSidebar hook will toggle this class as needed.
        const sidebar = document.querySelector('#sidebar');
        if (sidebar && !ui.sidebar?._collapsed) {
            sidebar.classList.add('yf-sidebar-expanded');
        }

        await this._migrateLegacyConfigIfNeeded();
        this.refreshFromSettings();
    }

    isFeatureEnabled() {
        return game.settings.get(MODULE_ID, 'enableFoundryCustomization');
    }

    canEditConfig() {
        return game.user.isGM;
    }

    shouldShareWithPlayers() {
        return game.settings.get(MODULE_ID, 'shareFoundryCustomization');
    }

    isArrangeModeActive() {
        return this._arrangeState.active;
    }

    getConfig() {
        const config = game.settings.get(MODULE_ID, 'sharedFoundryCustomization');
        return this._sanitizeConfig(config);
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
        this.refreshFromSettings();
        return sanitized;
    }

    async resetConfig({ restoreStock = true } = {}) {
        if (!this.canEditConfig()) {
            throw new Error('Only the GM can reset Foundry customization.');
        }

        const defaults = foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION);
        defaults.enabled = restoreStock ? false : Boolean(this.getConfig()?.enabled);
        await this.saveConfig(defaults);
        return defaults;
    }

    refreshFromSettings() {
        this.applyConfig(this.getEffectiveConfig());
    }

    applyConfig(config) {
        const sanitized = this._sanitizeConfig(config);
        this._lastAppliedConfig = foundry.utils.deepClone(sanitized);

        if (!this.isFeatureEnabled() || !sanitized.enabled) {
            this.clearCustomization();
            return;
        }

        this._ensureStyleElement();
        this._styleElement.textContent = this._buildCss(sanitized);
        document.body.classList.add('yf-foundry-customized');
        this._applyComponentTransforms(sanitized);
        this._applyPauseCustomization(sanitized);

        if (this._arrangeState.active) {
            this.refreshArrangeMode();
        }
    }

    clearCustomization() {
        this._ensureStyleElement();
        this._styleElement.textContent = '';
        document.body.classList.remove('yf-foundry-customized');
        this._clearComponentTransforms();
        this._clearPauseCustomization();

        if (this._arrangeState.active) {
            this.disableArrangeMode();
        }
    }

    async handleFeatureToggle(enabled) {
        if (!enabled) {
            this.clearCustomization();
            return;
        }

        this.refreshFromSettings();
    }

    /* -------------------------------------------- */
    /*  Transform-based Positioning                  */
    /* -------------------------------------------- */

    _measureNaturalRect(component) {
        const cached = this._naturalRects.get(component.id);
        if (cached) return cached;

        const target = document.querySelector(component.selector);
        if (!target) return null;

        const prevTransform = target.style.transform;
        target.style.transform = 'none';
        const rect = target.getBoundingClientRect();
        target.style.transform = prevTransform;

        const natural = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
        this._naturalRects.set(component.id, natural);
        return natural;
    }

    _applyComponentTransforms(config) {
        const categories = config.categories || {};
        const layoutEnabled = categories.layout !== false;

        for (const component of FOUNDRY_UI_COMPONENTS) {
            if (component.id === 'pause') continue;
            const target = document.querySelector(component.selector);
            if (!target) continue;

            const layout = config.layout[component.id];
            const hasPosition = layoutEnabled && (Number.isFinite(layout?.x) || Number.isFinite(layout?.y));
            const hasScale = layoutEnabled && Number.isFinite(layout?.scale) && layout.scale !== 100;

            // Sidebar uses CSS custom properties instead of inline transform
            // so that CSS .yf-sidebar-expanded guards can control it properly.
            if (component.id === 'sidebar') {
                this._applySidebarTransform(target, layout, hasPosition, hasScale);
                continue;
            }

            if (!hasPosition && !hasScale) {
                target.style.transform = '';
                target.style.transformOrigin = '';
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

            target.style.transform = parts.length ? parts.join(' ') : '';
            target.style.transformOrigin = parts.length ? 'top left' : '';
        }
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
            const target = document.querySelector(component.selector);
            if (!target) continue;

            if (component.id === 'sidebar') {
                target.style.removeProperty('--yf-sidebar-tx');
                target.style.removeProperty('--yf-sidebar-ty');
                target.style.removeProperty('--yf-sidebar-scale');
            } else {
                target.style.transform = '';
                target.style.transformOrigin = '';
            }
        }
        this._naturalRects.clear();
    }

    /**
     * When the sidebar collapses/expands, toggle our own marker class
     * and manage the CSS custom properties. We use our own class (.yf-sidebar-expanded)
     * instead of relying on Foundry's internal classes which may vary by version.
     */
    _onSidebarCollapse(collapsed) {
        const sidebar = document.querySelector('#sidebar');
        if (!sidebar) return;

        if (collapsed) {
            sidebar.classList.remove('yf-sidebar-expanded');
            // Clear custom properties so no transform lingers
            sidebar.style.removeProperty('--yf-sidebar-tx');
            sidebar.style.removeProperty('--yf-sidebar-ty');
            sidebar.style.removeProperty('--yf-sidebar-scale');
        } else {
            sidebar.classList.add('yf-sidebar-expanded');
            // Re-measure and reapply after expansion animation
            this._naturalRects.delete('sidebar');
            requestAnimationFrame(() => {
                this._naturalRects.delete('sidebar');
                if (this._lastAppliedConfig) {
                    this._applyComponentTransforms(this._lastAppliedConfig);
                }
            });
        }
    }

    /* -------------------------------------------- */
    /*  Arrange Mode                                 */
    /* -------------------------------------------- */

    enableArrangeMode(config, onChange) {
        if (!this.canEditConfig() || !this.isFeatureEnabled() || !config?.enabled) return false;

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

    disableArrangeMode() {
        if (!this._arrangeState.active) return;

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
            const visible = target && getComputedStyle(target).display !== 'none';

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
            startRect: rect
        };
    }

    _onArrangePointerMove(event) {
        const drag = this._arrangeState.drag;
        if (!drag) return;

        const dx = event.clientX - drag.startClientX;
        const dy = event.clientY - drag.startClientY;
        const componentId = drag.component.id;
        const layout = this._arrangeState.config.layout[componentId];

        if (drag.mode === 'move') {
            layout.x = Math.round(drag.startRect.left + dx);
            layout.y = Math.round(drag.startRect.top + dy);
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

        this.applyConfig(this._arrangeState.config);
        this._arrangeState.onChange?.(componentId);
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
            if (this.isFeatureEnabled() && this._lastAppliedConfig?.enabled) {
                this._applyPauseCustomization(this._lastAppliedConfig);
            } else {
                this._clearPauseCustomization();
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

    /* -------------------------------------------- */
    /*  CSS Generation                                */
    /* -------------------------------------------- */

    _buildCss(config) {
        const { theme, visibility, layout, pause, categories, componentStyles, customCss } = config;
        const cat = categories || {};

        const themeEnabled = cat.theme !== false;
        const fontsEnabled = cat.fonts !== false;
        const visibilityEnabled = cat.visibility !== false;
        const layoutEnabled = cat.layout !== false;
        const componentsEnabled = cat.components !== false;
        const pauseEnabled = cat.pause !== false;
        const customCssEnabled = cat.customCss !== false;

        const sections = [];

        // ── Theme Colors ──
        if (themeEnabled) {
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
body.yf-foundry-customized {
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
    --color-text-primary: var(--yf-foundry-font-color);
    --color-text-secondary: var(--yf-foundry-font-secondary);
    --color-text-subtle: var(--yf-foundry-font-subtle);
    --color-form-hint: var(--yf-foundry-font-secondary);
    --input-placeholder-color: var(--yf-foundry-font-subtle);
    --placeholder-color: var(--yf-foundry-font-subtle);
    --group-separator: var(--yf-foundry-divider-color);
}

body.yf-foundry-customized,
body.yf-foundry-customized * {
    scrollbar-width: thin;
    scrollbar-color: var(--yf-foundry-scrollbar-color) var(--yf-foundry-scrollbar-track);
}

body.yf-foundry-customized *::-webkit-scrollbar { width: 10px; height: 10px; }
body.yf-foundry-customized *::-webkit-scrollbar-track { background: var(--yf-foundry-scrollbar-track); border-radius: 999px; }
body.yf-foundry-customized *::-webkit-scrollbar-thumb { background: var(--yf-foundry-scrollbar-color); border: 2px solid transparent; border-radius: 999px; background-clip: padding-box; }
body.yf-foundry-customized *::-webkit-scrollbar-thumb:hover { background: var(--yf-foundry-icon-hover-color); border: 2px solid transparent; background-clip: padding-box; }

body.yf-foundry-customized :is(#navigation, #scene-navigation, #controls, #scene-controls, #players, #hotbar, #sidebar, #sidebar-tabs, .sidebar-tab, .sidebar-popout, #pause, .window-app, .application) {
    --color-text-primary: var(--yf-foundry-font-color) !important;
    --color-text-secondary: var(--yf-foundry-font-secondary) !important;
    --color-text-subtle: var(--yf-foundry-font-subtle) !important;
    --color-form-hint: var(--yf-foundry-font-secondary) !important;
    --input-placeholder-color: var(--yf-foundry-font-subtle) !important;
    --placeholder-color: var(--yf-foundry-font-subtle) !important;
    --group-separator: var(--yf-foundry-divider-color) !important;
    color: var(--yf-foundry-font-color);
}

body.yf-foundry-customized :is(.window-app, .application) {
    --background: var(--yf-foundry-window-bg) !important;
    --color-header-background: var(--yf-foundry-window-header-bg) !important;
    --color-border: var(--yf-foundry-accent-medium) !important;
    border-color: var(--yf-foundry-accent-medium) !important;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45), 0 0 20px var(--yf-foundry-accent-soft) !important;
}

body.yf-foundry-customized :is(.window-app, .application) .window-header {
    color: var(--yf-foundry-font-color) !important;
    border-bottom: 1px solid var(--yf-foundry-accent-medium) !important;
}

body.yf-foundry-customized :is(#sidebar, .sidebar-popout) {
    --sidebar-background: var(--yf-foundry-surface-bg-strong) !important;
    --sidebar-separator: 1px solid var(--yf-foundry-accent-soft) !important;
    --sidebar-entry-hover-bg: var(--yf-foundry-accent-soft) !important;
    --sidebar-folder-color: var(--yf-foundry-window-header-bg) !important;
    --input-background: var(--yf-foundry-surface-bg) !important;
}

body.yf-foundry-customized :is(.sidebar-tab, .sidebar-popout) {
    color: var(--yf-foundry-font-color) !important;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
}

body.yf-foundry-customized :is(.hint, .notes, p.hint, p.notes, small.hint, .form-footer, .window-content .hint, .window-content .notes, .window-content .form-description, .window-content .instructions) {
    color: var(--yf-foundry-font-secondary) !important;
}

body.yf-foundry-customized :is(.caption, .metadata, .subtitle, .document-id, .window-content .editor-note, .window-content .subheader) {
    color: var(--yf-foundry-font-subtle) !important;
}

body.yf-foundry-customized :is(input, textarea)::placeholder { color: var(--yf-foundry-font-subtle) !important; }
body.yf-foundry-customized :is(hr, .window-content hr) { border-color: var(--yf-foundry-divider-color) !important; }

body.yf-foundry-customized :is(
    #scene-navigation, #scene-controls, #players, #hotbar, #sidebar, .sidebar-popout, .application .window-header
) :is(i, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin) {
    color: var(--yf-foundry-icon-color) !important;
    --fa-primary-color: var(--yf-foundry-icon-color);
    --fa-secondary-color: var(--yf-foundry-font-color);
}

body.yf-foundry-customized :is(
    .ui-control:hover, .placeable-hud:hover, #measurement .waypoint-label:hover,
    .application .window-header :is(button.header-control, a.header-control, .header-button):hover,
    #hotbar button:hover, #players button:hover, .directory button:hover, .directory .create-button:hover
) :is(i, .fa-solid, .fa-regular, .fa-duotone, .fa-light, .fa-thin) {
    color: var(--yf-foundry-icon-hover-color) !important;
    --fa-primary-color: var(--yf-foundry-icon-hover-color);
}

body.yf-foundry-customized :is(
    .application .window-header :is(button.header-control, a.header-control, .header-button),
    #hotbar button, #players button, .directory button, .directory .create-button
) {
    --button-text-color: var(--yf-foundry-icon-color) !important;
    --button-hover-text-color: var(--yf-foundry-icon-hover-color) !important;
    color: var(--yf-foundry-icon-color) !important;
}

body.yf-foundry-customized :is(.ui-control, .placeable-hud, #measurement .waypoint-label) {
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

body.yf-foundry-customized #scene-navigation .scene-navigation-menu .scene {
    background: var(--yf-foundry-surface-bg) !important;
    border: 1px solid var(--yf-foundry-accent-soft) !important;
    color: var(--yf-foundry-font-color) !important;
    backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
}
body.yf-foundry-customized #scene-navigation .scene-navigation-menu .scene:is(.active, .view, .gm) { box-shadow: inset 0 0 0 1px var(--yf-foundry-accent-medium) !important; }
body.yf-foundry-customized #scene-navigation #scene-navigation-expand { --button-text-color: var(--yf-foundry-icon-color) !important; --button-hover-text-color: var(--yf-foundry-icon-hover-color) !important; color: var(--yf-foundry-icon-color) !important; }
body.yf-foundry-customized #scene-navigation .scene-navigation-menu .scene::after { color: var(--yf-foundry-icon-color) !important; }
body.yf-foundry-customized #scene-navigation .scene-navigation-menu .scene:hover::after { color: var(--yf-foundry-icon-hover-color) !important; }
body.yf-foundry-customized #scene-navigation .scene-navigation-menu .scene-players .scene-player { background: var(--yf-foundry-surface-bg-strong) !important; border-color: var(--yf-foundry-accent-soft) !important; color: var(--yf-foundry-icon-color) !important; }

body.yf-foundry-customized #players {
    --background-color: var(--yf-foundry-surface-bg) !important;
    --border-color: var(--yf-foundry-accent-soft) !important;
    --text-color: var(--yf-foundry-font-color) !important;
    --player-name-color: var(--yf-foundry-font-color) !important;
    --player-name-idle-color: var(--yf-foundry-font-subtle) !important;
    --player-name-self-color: var(--yf-foundry-accent) !important;
}
body.yf-foundry-customized :is(#players #players-active, #players #players-inactive) { backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }

body.yf-foundry-customized #hotbar {
    --slot-color: var(--yf-foundry-surface-bg) !important;
    --key-bg-color-empty: var(--yf-foundry-window-header-bg) !important;
    --key-bg-color-full: var(--yf-foundry-window-header-bg) !important;
    --key-text-color: var(--yf-foundry-font-color) !important;
    --page-control-color: var(--yf-foundry-icon-color) !important;
}
body.yf-foundry-customized #hotbar #action-bar .slot { box-shadow: inset 0 0 0 1px var(--yf-foundry-accent-soft); }

body.yf-foundry-customized #chat-message {
    --text-color: var(--yf-foundry-font-color) !important;
    --placeholder-color: var(--yf-foundry-font-subtle) !important;
    --background-color: var(--yf-foundry-surface-bg-strong) !important;
    --border-color: var(--yf-foundry-accent-soft) !important;
    color: var(--yf-foundry-font-color) !important;
}

body.yf-foundry-customized .chat-message {
    background-image: var(--yf-foundry-chat-texture) !important;
    background-repeat: repeat !important;
    background-blend-mode: multiply, normal !important;
    border-color: var(--yf-foundry-accent-soft) !important;
    color: var(--yf-foundry-font-color) !important;
}
body.yf-foundry-customized .chat-message :is(.message-metadata, .flavor-text, .whisper-to) { color: var(--yf-foundry-font-secondary) !important; }
body.yf-foundry-customized .chat-message .message-sender { color: var(--yf-foundry-font-color) !important; }
body.yf-foundry-customized .chat-message :is(.dice-formula, .dice-total, .table-draw .table-description, .table-draw ul.table-results li) { border-color: var(--yf-foundry-accent-soft) !important; }

body.yf-foundry-customized :is(.directory .directory-header search input, .directory .directory-header .header-search input) { background: var(--yf-foundry-surface-bg) !important; border-color: var(--yf-foundry-accent-soft) !important; color: var(--yf-foundry-font-color) !important; }
body.yf-foundry-customized :is(.directory .directory-header .action-buttons button, .directory .directory-footer button) { --button-background-color: var(--yf-foundry-surface-bg) !important; --button-border-color: var(--yf-foundry-accent-soft) !important; }
body.yf-foundry-customized .directory .directory-item.entry:hover { background: var(--yf-foundry-accent-soft) !important; }
body.yf-foundry-customized li.folder > .folder-header { background: var(--yf-foundry-window-header-bg) !important; color: var(--yf-foundry-font-color) !important; }
`);
        }

        // ── Fonts ──
        if (fontsEnabled) {
            sections.push(`
body.yf-foundry-customized :is(#navigation, #scene-navigation, #controls, #scene-controls, #players, #hotbar, #sidebar, #sidebar-tabs, .sidebar-tab, .sidebar-popout, #pause) {
    font-family: ${this._fontStack(theme.interfaceFont)} !important;
}
body.yf-foundry-customized :is(.window-app, .application) .window-header {
    font-family: ${this._fontStack(theme.interfaceFont)} !important;
}
body.yf-foundry-customized :is(.window-app, .application) .window-content {
    font-family: ${this._fontStack(theme.windowFont)} !important;
}
body.yf-foundry-customized #chat-message {
    font-family: ${this._fontStack(theme.windowFont)} !important;
}
body.yf-foundry-customized :is(.directory .directory-header search input, .directory .directory-header .header-search input) {
    font-family: ${this._fontStack(theme.windowFont)} !important;
}
`);
        }

        // ── Visibility ──
        if (visibilityEnabled) {
            const visibilityCss = FOUNDRY_UI_COMPONENTS
                .filter(c => visibility[c.id] === false)
                .map(c => `body.yf-foundry-customized ${c.selector} { display: none !important; }`)
                .join('\n');
            if (visibilityCss) sections.push(visibilityCss);
        }

        // ── Layout (width/height only, position handled via transform in JS) ──
        if (layoutEnabled) {
            const layoutCss = FOUNDRY_UI_COMPONENTS
                .filter(c => c.id !== 'pause')
                .map(c => this._buildComponentLayoutCss(c, layout[c.id]))
                .filter(Boolean)
                .join('\n');
            if (layoutCss) sections.push(layoutCss);
        }

        // ── Per-Component Styling ──
        if (componentsEnabled && componentStyles) {
            const componentCss = FOUNDRY_UI_COMPONENTS
                .filter(c => c.id !== 'pause')
                .map(c => this._buildComponentStyleCss(c, componentStyles[c.id]))
                .filter(Boolean)
                .join('\n');
            if (componentCss) sections.push(componentCss);
        }

        // ── Pause ──
        if (pauseEnabled) {
            sections.push(this._buildPauseCss(config));
        }

        // ── Custom CSS ──
        if (customCssEnabled && typeof customCss === 'string' && customCss.trim()) {
            sections.push(`/* ── User Custom CSS ── */\n${customCss}`);
        }

        return sections.join('\n').trim();
    }

    _buildComponentLayoutCss(component, layout = {}) {
        const rules = [];

        if (Number.isFinite(layout?.width) && component.resize) {
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
            ? `body.yf-foundry-customized ${component.selector}.yf-sidebar-expanded`
            : `body.yf-foundry-customized ${component.selector}`;

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

        if (style?.borderStyle && style.borderStyle !== 'none' && style.borderWidth > 0) {
            const borderColor = style.borderColor || 'var(--yf-foundry-accent-medium)';
            rules.push(`border: ${style.borderWidth}px ${style.borderStyle} ${borderColor} !important;`);
        }

        if (Number.isFinite(style?.borderRadius) && style.borderRadius > 0) {
            rules.push(`border-radius: ${style.borderRadius}px !important;`);
        }

        if (!rules.length) return '';
        return `body.yf-foundry-customized ${component.selector} { ${rules.join(' ')} }`;
    }

    _buildPauseCss(config) {
        const { pause } = config;
        const pauseScale = this._clamp(pause.scale, 40, 180) / 100;
        const pauseOpacity = this._clamp(pause.opacity, 10, 100) / 100;
        const pauseBarColor = this._hexToRgba(pause.barColor, this._clamp(pause.barOpacity, 0, 100) / 100);
        const pauseBarHeight = this._clamp(pause.barHeight, 80, 360);
        const pauseLabelSize = this._clamp(pause.labelSize, 12, 60);
        const pauseLabelSpacing = this._clamp(pause.labelLetterSpacing, 0, 24);
        const pauseLabelOffsetY = this._clamp(pause.labelOffsetY, -120, 120);
        const pauseLabelFont = pause.labelFont && pause.labelFont !== 'inherit'
            ? this._fontStack(pause.labelFont)
            : 'var(--font-serif)';
        const pauseEffect = this._normalizePauseEffect(pause.effect);
        const pauseEffectAnimation = this._getPauseEffectAnimation(pauseEffect);

        return `
body.yf-foundry-customized #pause.yf-pause-custom > img { display: none !important; }

body.yf-foundry-customized #pause {
    height: ${pauseBarHeight}px !important;
    top: calc(50vh - ${Math.round(pauseBarHeight / 2)}px) !important;
    background: linear-gradient(to right, transparent 0%, ${pauseBarColor} 26%, ${pauseBarColor} 74%, transparent 100%) !important;
}

body.yf-foundry-customized #pause figcaption {
    display: ${pause.hideLabel ? 'none' : 'block'} !important;
    color: ${pause.labelColor} !important;
    font-family: ${pauseLabelFont} !important;
    font-size: ${pauseLabelSize}px !important;
    letter-spacing: ${pauseLabelSpacing}px !important;
    line-height: 1.1 !important;
    transform: translateY(${pauseLabelOffsetY}px) !important;
    position: relative;
    z-index: 2;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
}

body.yf-foundry-customized #pause .yf-pause-media {
    position: absolute;
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%) scale(${pauseScale});
    transform-origin: center;
    pointer-events: none;
    opacity: ${pauseOpacity};
    z-index: 1;
    max-width: min(70vw, 900px);
    max-height: min(50vh, 520px);
    filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.45));
}

body.yf-foundry-customized #pause .yf-pause-media-inner {
    display: block;
    animation: ${pauseEffectAnimation};
    transform-origin: center;
}

body.yf-foundry-customized #pause .yf-pause-media img,
body.yf-foundry-customized #pause .yf-pause-media video {
    display: block;
    max-width: 100%;
    max-height: 100%;
}

@keyframes yf-pause-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes yf-pause-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
@keyframes yf-pause-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
@keyframes yf-pause-sway { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-6deg); } 75% { transform: rotate(6deg); } }
`;
    }

    /* -------------------------------------------- */
    /*  Pause Customization                          */
    /* -------------------------------------------- */

    _applyPauseCustomization(config) {
        const pauseElement = document.querySelector('#pause');
        if (!pauseElement) return;

        this._clearPauseCustomization();

        const pauseVisible = config.enabled && config.visibility?.pause !== false;
        if (!pauseVisible) return;

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

        pauseElement.classList.remove('yf-pause-custom');
        pauseElement.querySelectorAll('.yf-pause-media').forEach(element => element.remove());

        const figcaption = pauseElement.querySelector('figcaption');
        if (figcaption?.dataset?.yfOriginalText) {
            figcaption.textContent = figcaption.dataset.yfOriginalText;
            delete figcaption.dataset.yfOriginalText;
        }
    }

    /* -------------------------------------------- */
    /*  Config Sanitization                          */
    /* -------------------------------------------- */

    _sanitizeConfig(config) {
        const merged = foundry.utils.mergeObject(
            foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION),
            foundry.utils.deepClone(config || {})
        );

        merged.enabled = Boolean(merged.enabled);

        // Categories
        const catDefaults = DEFAULT_FOUNDRY_CUSTOMIZATION.categories;
        for (const key of Object.keys(catDefaults)) {
            merged.categories[key] = merged.categories[key] !== false;
        }

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
        merged.pause.effect = this._normalizePauseEffect(merged.pause.effect);
        merged.pause.opacity = this._clamp(merged.pause.opacity, 10, 100);
        merged.pause.scale = this._clamp(merged.pause.scale, 40, 180);
        merged.pause.hideLabel = Boolean(merged.pause.hideLabel);
        merged.pause.labelText = typeof merged.pause.labelText === 'string' ? merged.pause.labelText.trim() : '';
        merged.pause.labelFont = this._normalizeFont(merged.pause.labelFont, DEFAULT_FOUNDRY_CUSTOMIZATION.pause.labelFont);
        merged.pause.labelColor = this._normalizeColor(merged.pause.labelColor, DEFAULT_FOUNDRY_CUSTOMIZATION.pause.labelColor);
        merged.pause.labelSize = this._clamp(merged.pause.labelSize, 12, 60);
        merged.pause.labelLetterSpacing = this._clamp(merged.pause.labelLetterSpacing, 0, 24);
        merged.pause.labelOffsetY = this._clamp(merged.pause.labelOffsetY, -120, 120);
        merged.pause.barColor = this._normalizeColor(merged.pause.barColor, DEFAULT_FOUNDRY_CUSTOMIZATION.pause.barColor);
        merged.pause.barOpacity = this._clamp(merged.pause.barOpacity, 0, 100);
        merged.pause.barHeight = this._clamp(merged.pause.barHeight, 80, 360);

        // Custom CSS
        merged.customCss = typeof merged.customCss === 'string' ? merged.customCss : '';

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

    _getPauseEffectAnimation(effect) {
        switch (effect) {
            case 'spin-slow': return 'yf-pause-spin 12s linear infinite';
            case 'spin-fast': return 'yf-pause-spin 4s linear infinite';
            case 'pulse': return 'yf-pause-pulse 2.2s ease-in-out infinite';
            case 'float': return 'yf-pause-float 3s ease-in-out infinite';
            case 'sway': return 'yf-pause-sway 3.2s ease-in-out infinite';
            default: return 'none';
        }
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
