/**
 * Chat-tab helpers for layout selection, filtering, and token inheritance.
 * @module your-flavor/ui/chat-tab-controller
 */

import { DEFAULT_CONFIG } from '../constants.js';
import { getChatPreset } from '../chat-presets.js';
import { CHAT_RANDOMIZER_ANY, getChatRandomizerCandidates } from '../chat-randomizer.js';

export const CHAT_CUSTOMIZATION_TOKEN_KEYS = [
    'fontFamily',
    'fontSize',
    'textColor',
    'backgroundColor',
    'borderColor',
    'backgroundOpacity',
    'nameColor',
    'timestampColor',
    'borderStyle',
    'borderWidth',
    'borderRadius',
    'glowEnabled',
    'shadowEnabled',
    'glowColor',
    'glowIntensity'
];

export class FlavorChatTabController {
    constructor({ manager, localize }) {
        this.manager = manager;
        this.localize = localize;
    }

    filterLayoutsByCategory(element, category) {
        this.filterLayouts(element, { category });
    }

    /**
     * Filter the preset gallery by the category tags AND by the tone/intensity/motion
     * selects. Those three used to feed the randomizer only, so they read as filters
     * sitting above the gallery while changing nothing in it.
     */
    filterLayouts(element, { category = null, constraints = null, page = 0, pageSize = 0 } = {}) {
        if (!element) return null;

        const favorites = this.manager.getFavorites();
        const allowedByConstraints = this.#buildConstraintAllowList(constraints);
        const layouts = [...element.querySelectorAll('.yf-layout-option')];
        const eligible = [];
        const pinned = [];

        for (const layout of layouts) {
            const layoutCategory = layout.dataset.category;
            const layoutId = layout.dataset.layout;
            // 'none' and 'custom' are escape hatches: never filtered, never paged away.
            if (layoutId === 'none' || layoutId === 'custom') {
                pinned.push(layout);
                continue;
            }

            let shouldShow;
            if (category === 'favorites') {
                shouldShow = favorites.includes(layoutId);
            } else if (category === null) {
                shouldShow = true;
            } else {
                shouldShow = layoutCategory === category;
            }

            if (shouldShow && allowedByConstraints) {
                shouldShow = allowedByConstraints.has(layoutId);
            }

            if (shouldShow) eligible.push(layout);
            else layout.style.display = 'none';
        }

        const size = pageSize > 0 ? pageSize : eligible.length || 1;
        const pageCount = Math.max(1, Math.ceil(eligible.length / size));
        const current = Math.max(0, Math.min(page, pageCount - 1));
        const start = current * size;
        const shown = eligible.slice(start, start + size);
        const shownSet = new Set(shown);

        for (const layout of eligible) layout.style.display = shownSet.has(layout) ? '' : 'none';
        for (const layout of pinned) layout.style.display = '';

        const empty = element.querySelector('[data-layout-empty]');
        if (empty) empty.hidden = eligible.length > 0;

        return {
            total: eligible.length,
            page: current,
            pageCount,
            first: eligible.length ? start + 1 : 0,
            last: start + shown.length
        };
    }

    /**
     * @returns {Set<string>|null} allowed preset ids, or null when nothing is constrained.
     */
    #buildConstraintAllowList(constraints) {
        if (!constraints) return null;
        const narrowed = ['tone', 'intensity', 'motion']
            .some(key => constraints[key] && constraints[key] !== CHAT_RANDOMIZER_ANY);
        if (!narrowed) return null;

        return new Set(
            getChatRandomizerCandidates({
                tone: constraints.tone,
                intensity: constraints.intensity,
                motion: constraints.motion
            }).map(preset => preset.id)
        );
    }

    applyPreset(config, presetId) {
        if (!config || !presetId) return;

        const preset = getChatPreset(presetId);
        if (!preset) return;

        config.layout = preset.layoutId;
        config.presetId = preset.id;

        if (preset.id !== 'none' && preset.id !== 'custom' && preset.defaults) {
            config.customizations = {
                ...config.customizations,
                ...preset.defaults
            };
        }
    }

    applyLayout(config, layoutId) {
        this.applyPreset(config, layoutId);
    }

    toBackgroundColorInput(config) {
        const bg = config?.customizations?.backgroundColor;
        if (!bg) return '#141210';

        if (bg.startsWith('#')) return bg;

        if (bg.startsWith('rgba')) {
            const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (match) {
                const r = parseInt(match[1]).toString(16).padStart(2, '0');
                const g = parseInt(match[2]).toString(16).padStart(2, '0');
                const b = parseInt(match[3]).toString(16).padStart(2, '0');
                return `#${r}${g}${b}`;
            }
        }

        return '#141210';
    }

    colorInputToRgba(hexColor, opacity = 95) {
        if (typeof hexColor !== 'string' || !hexColor.startsWith('#')) return hexColor;

        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
    }

    buildTokenStates(config) {
        const states = {};

        for (const tokenKey of CHAT_CUSTOMIZATION_TOKEN_KEYS) {
            states[tokenKey] = this.buildTokenState(tokenKey, config);
        }

        return states;
    }

    buildTokenState(tokenKey, config) {
        const currentValue = config?.customizations?.[tokenKey];
        const presetValue = this.getPresetTokenValue(tokenKey, config?.layout);
        const defaultValue = DEFAULT_CONFIG.customizations[tokenKey];
        const hasPresetValue = presetValue !== undefined;

        let source = 'custom';
        if (hasPresetValue && this.sameTokenValue(currentValue, presetValue)) {
            source = 'preset';
        } else if (!hasPresetValue && this.sameTokenValue(currentValue, defaultValue)) {
            source = 'default';
        }

        return {
            source,
            statusClass: `is-${source}`,
            label: this.tokenStatusLabel(source),
            title: this.tokenStatusTitle(source),
            resetTitle: this.tokenResetTitle(hasPresetValue ? 'preset' : 'default')
        };
    }

    getResetValue(tokenKey, layoutId) {
        const presetValue = this.getPresetTokenValue(tokenKey, layoutId);
        if (presetValue !== undefined) return presetValue;
        return DEFAULT_CONFIG.customizations[tokenKey];
    }

    getPresetTokenValue(tokenKey, layoutId) {
        if (!layoutId || layoutId === 'none' || layoutId === 'custom') return undefined;
        const preset = getChatPreset(layoutId);
        if (!preset?.defaults || !(tokenKey in preset.defaults)) return undefined;
        return preset.defaults[tokenKey];
    }

    isPresetEdited(config, presetId = config?.layout) {
        if (!config || !presetId || presetId === 'none' || presetId === 'custom') return false;
        const preset = getChatPreset(presetId);
        if (!preset?.defaults) return false;

        return CHAT_CUSTOMIZATION_TOKEN_KEYS.some(tokenKey => (
            tokenKey in preset.defaults
            && !this.sameTokenValue(config.customizations?.[tokenKey], preset.defaults[tokenKey])
        ));
    }

    isCustomizationToken(tokenKey) {
        return CHAT_CUSTOMIZATION_TOKEN_KEYS.includes(tokenKey);
    }

    sameTokenValue(left, right) {
        return this.normalizeTokenValue(left) === this.normalizeTokenValue(right);
    }

    normalizeTokenValue(value) {
        if (typeof value === 'string') return value.replace(/\s+/g, '').toLowerCase();
        return JSON.stringify(value ?? null);
    }

    tokenStatusLabel(source) {
        const key = {
            default: 'YOUR_FLAVOR.Config.TokenStatus.Default',
            preset: 'YOUR_FLAVOR.Config.TokenStatus.Preset',
            custom: 'YOUR_FLAVOR.Config.TokenStatus.Custom'
        }[source] ?? 'YOUR_FLAVOR.Config.TokenStatus.Custom';
        return this.localize(key);
    }

    tokenStatusTitle(source) {
        const key = {
            default: 'YOUR_FLAVOR.Config.TokenStatus.DefaultTitle',
            preset: 'YOUR_FLAVOR.Config.TokenStatus.PresetTitle',
            custom: 'YOUR_FLAVOR.Config.TokenStatus.CustomTitle'
        }[source] ?? 'YOUR_FLAVOR.Config.TokenStatus.CustomTitle';
        return this.localize(key);
    }

    tokenResetTitle(targetSource) {
        const key = targetSource === 'preset'
            ? 'YOUR_FLAVOR.Config.TokenStatus.ResetToPreset'
            : 'YOUR_FLAVOR.Config.TokenStatus.ResetToDefault';
        return this.localize(key);
    }
}
