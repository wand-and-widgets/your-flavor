/**
 * Your Flavor Studio - Main Application (P11-004..P11-008)
 *
 * The new face of Your Flavor: the real Foundry UI is the canvas. Two modes:
 * - Simple: rendered preset gallery + quick knobs. One click restyles the draft.
 * - Studio: click any registered surface on the real UI (surface picker) and a
 *   contextual inspector opens with that surface's essentials up front and the
 *   complete 4.0 control set inside the "all options" drawer.
 *
 * Everything edits drafts through FlavorConfigStore; nothing persists until
 * Save. Live feedback uses the existing preview sandboxes:
 * - chat domain  -> module api applyChatLogPreview / clearChatLogPreview
 * - foundry domain -> FoundryCustomizer.applyPreviewConfig (draft style element)
 */

import { MODULE_ID } from '../../constants.js';
import { ApplicationV2, openFilePicker } from '../../compatibility.js';
import { FlavorConfigStore } from '../config-store.js';
import { FlavorManager } from '../../flavor-manager.js';
import { buildChatContrastWarnings } from '../../contrast-diagnostics.js';
import { getChatPreset, getChatPresetChoices } from '../../chat-presets.js';
import {
    buildStudioSearchIndex,
    getStudioTarget,
    getVisibleStudioTargets
} from './target-registry.js';
import { StudioSurfacePicker } from './surface-picker.js';

const WELCOME_SETTING = 'studioWelcomeDone';

const i18n = key => game.i18n?.localize?.(key) ?? key;
const i18nOr = (key, fallback) => {
    const localized = i18n(key);
    return localized === key && fallback ? fallback : localized;
};

export class FlavorStudioApp extends ApplicationV2 {
    static DEFAULT_OPTIONS = {
        id: 'your-flavor-studio',
        classes: ['your-flavor-studio-app'],
        tag: 'div',
        window: {
            frame: true,
            positioned: true,
            title: 'YOUR_FLAVOR.Studio.Title',
            icon: 'fas fa-wand-magic-sparkles',
            minimizable: true,
            resizable: true
        },
        position: { width: 430, height: 720 }
    };

    constructor(options = {}) {
        super(options);
        this.manager = game.modules.get(MODULE_ID)?.api?.getManager() || new FlavorManager();
        this.foundryCustomizer = game.modules.get(MODULE_ID)?.api?.getFoundryCustomizer?.() || null;
        this.store = new FlavorConfigStore({
            manager: this.manager,
            foundryCustomizer: this.foundryCustomizer
        });
        this.mode = 'simples';
        this.selectedTargetId = null;
        this.searchQuery = '';
        this.galleryCategory = 'all';
        this._initialized = false;
        this._saving = false;
        this.picker = new StudioSurfacePicker({
            onSelect: targetId => this.#onSurfacePicked(targetId),
            resolveLabel: target => i18nOr(target.titleKey, target.titleFallback),
            ignoredSelector: '#your-flavor-studio'
        });
    }

    /* ══════════ lifecycle ══════════ */

    async _prepareContext() {
        if (!this._initialized) {
            await this.store.initialize();
            this._initialized = true;
        }
        return {};
    }

    async _renderHTML() {
        const root = document.createElement('div');
        root.className = 'yf-studio';
        root.appendChild(this.#buildHeader());
        const body = document.createElement('div');
        body.className = 'yf-studio-body';
        if (this.mode === 'simples') body.appendChild(this.#buildSimplePane());
        else body.appendChild(this.selectedTargetId ? this.#buildInspectorPane() : this.#buildStudioHome());
        root.appendChild(body);
        root.appendChild(this.#buildFooter());
        if (this.#needsWelcome()) root.appendChild(this.#buildWelcome());
        return root;
    }

    _replaceHTML(result, content) {
        content.replaceChildren(result);
    }

    _onRender() {
        this.#syncPicker();
    }

    async _preClose(options) {
        await super._preClose(options);
        this.picker.disable();
        game.modules.get(MODULE_ID)?.api?.clearChatLogPreview?.();
        if (this.foundryCustomizer && game.user.isGM) {
            this.foundryCustomizer.commitPreview?.(this.store.savedFoundryConfigSnapshot);
        }
    }

    /* ══════════ header / footer ══════════ */

    #buildHeader() {
        const header = document.createElement('div');
        header.className = 'yf-studio-topbar';

        const modes = document.createElement('div');
        modes.className = 'yf-studio-modes';
        for (const mode of ['simples', 'estudio']) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = this.mode === mode ? 'on' : '';
            button.textContent = i18n(`YOUR_FLAVOR.Studio.Mode.${mode === 'simples' ? 'Simple' : 'Studio'}`);
            button.addEventListener('click', () => this.#setMode(mode));
            modes.appendChild(button);
        }
        header.appendChild(modes);

        const dirty = document.createElement('span');
        dirty.className = 'yf-studio-dirty';
        dirty.textContent = i18n('YOUR_FLAVOR.Studio.UnsavedChanges');
        dirty.hidden = !this.#isDirty();
        header.appendChild(dirty);
        this._dirtyChip = dirty;

        return header;
    }

    #buildFooter() {
        const footer = document.createElement('div');
        footer.className = 'yf-studio-footer';

        const legacy = document.createElement('button');
        legacy.type = 'button';
        legacy.className = 'yf-studio-link';
        legacy.textContent = i18n('YOUR_FLAVOR.Studio.OpenClassic');
        legacy.addEventListener('click', () => {
            this.close();
            game.modules.get(MODULE_ID)?.api?.openConfig?.({ forceClassic: true });
        });
        footer.appendChild(legacy);

        const spacer = document.createElement('span');
        spacer.className = 'yf-studio-spacer';
        footer.appendChild(spacer);

        const discard = document.createElement('button');
        discard.type = 'button';
        discard.className = 'yf-studio-btn';
        discard.textContent = i18n('YOUR_FLAVOR.Studio.Discard');
        discard.addEventListener('click', () => this.#discard());
        footer.appendChild(discard);

        const save = document.createElement('button');
        save.type = 'button';
        save.className = 'yf-studio-btn primary';
        save.textContent = i18n('YOUR_FLAVOR.Studio.Save');
        save.disabled = !this.#isDirty();
        save.addEventListener('click', () => this.#save());
        footer.appendChild(save);
        this._saveButton = save;

        return footer;
    }

    #refreshDirtyUi() {
        const dirty = this.#isDirty();
        if (this._dirtyChip) this._dirtyChip.hidden = !dirty;
        if (this._saveButton) this._saveButton.disabled = !dirty;
    }

    #isDirty() {
        if (!this._initialized) return false;
        const areas = this.store.getDirtyAreas();
        return Boolean(areas.overview || areas.icons);
    }

    /* ══════════ modo simples ══════════ */

    #buildSimplePane() {
        const pane = document.createElement('div');
        pane.className = 'yf-studio-pane';

        pane.appendChild(this.#heading(
            i18n('YOUR_FLAVOR.Studio.Simple.Heading'),
            i18n('YOUR_FLAVOR.Studio.Simple.Sub')
        ));

        const presets = getChatPresetChoices({ favorites: this.manager.getFavorites?.() ?? [] });
        const categories = [...new Set(presets.map(preset => preset.category).filter(Boolean))];

        const chips = document.createElement('div');
        chips.className = 'yf-studio-chips';
        for (const category of ['all', ...categories]) {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = this.galleryCategory === category ? 'on' : '';
            chip.textContent = category === 'all'
                ? i18n('YOUR_FLAVOR.Studio.Gallery.All')
                : i18nOr(`YOUR_FLAVOR.Categories.${category.charAt(0).toUpperCase()}${category.slice(1)}`, category);
            chip.addEventListener('click', () => {
                this.galleryCategory = category;
                this.render();
            });
            chips.appendChild(chip);
        }
        pane.appendChild(chips);

        pane.appendChild(this.#buildGallery(presets.filter(preset =>
            this.galleryCategory === 'all' || preset.category === this.galleryCategory
        )));

        return pane;
    }

    #buildGallery(presets, { onPick = null } = {}) {
        const grid = document.createElement('div');
        grid.className = 'yf-studio-gallery';
        const activeId = this.store.workingConfig?.presetId ?? this.store.workingConfig?.layout;

        for (const choice of presets) {
            const preset = getChatPreset(choice.id);
            if (!preset) continue;
            const defaults = preset.defaults ?? {};
            const card = document.createElement('button');
            card.type = 'button';
            card.className = `yf-studio-vibe${choice.id === activeId ? ' on' : ''}`;

            const sample = document.createElement('span');
            sample.className = 'yf-studio-vibe-sample';
            const bg = defaults.backgroundColor ?? 'rgba(24,20,14,.95)';
            const border = defaults.borderColor ?? '#665533';
            sample.style.background = bg;
            sample.style.borderBottom = `2px ${defaults.borderStyle ?? 'solid'} ${border}`;
            const name = document.createElement('b');
            name.textContent = choice.name;
            name.style.color = defaults.textColor ?? '#e8dcc8';
            if (defaults.fontFamily && defaults.fontFamily !== 'inherit') {
                name.style.fontFamily = `'${defaults.fontFamily}', serif`;
            }
            if (defaults.glowEnabled && defaults.glowColor) {
                name.style.textShadow = `0 0 8px ${defaults.glowColor}`;
            }
            sample.appendChild(name);
            const line = document.createElement('i');
            line.textContent = i18n('YOUR_FLAVOR.Studio.Gallery.SampleLine');
            line.style.color = defaults.textColor ?? '#e8dcc8';
            line.style.opacity = '0.75';
            sample.appendChild(line);
            card.appendChild(sample);

            const label = document.createElement('span');
            label.className = 'yf-studio-vibe-name';
            label.textContent = choice.name;
            card.appendChild(label);

            card.addEventListener('click', () => {
                this.#applyPresetToDraft(choice.id);
                if (onPick) onPick(choice.id);
                else this.render();
            });
            grid.appendChild(card);
        }
        return grid;
    }

    #applyPresetToDraft(presetId) {
        const config = this.store.workingConfig;
        const preset = getChatPreset(presetId);
        if (!config || !preset) return;
        config.layout = preset.layoutId;
        config.presetId = preset.id;
        if (preset.id !== 'none' && preset.id !== 'custom' && preset.defaults) {
            config.customizations = { ...config.customizations, ...preset.defaults };
        }
        this.#applyLive('chat');
    }

    /* ══════════ modo estúdio: home + busca ══════════ */

    #buildStudioHome() {
        const pane = document.createElement('div');
        pane.className = 'yf-studio-pane';

        pane.appendChild(this.#heading(
            i18n('YOUR_FLAVOR.Studio.Home.Heading'),
            i18n('YOUR_FLAVOR.Studio.Home.Sub')
        ));

        const search = document.createElement('input');
        search.type = 'search';
        search.className = 'yf-studio-search';
        search.placeholder = i18n('YOUR_FLAVOR.Studio.Search.Placeholder');
        search.value = this.searchQuery;
        const results = document.createElement('div');
        results.className = 'yf-studio-search-results';
        search.addEventListener('input', () => {
            this.searchQuery = search.value;
            this.#renderSearchResults(results);
        });
        pane.appendChild(search);
        pane.appendChild(results);
        this.#renderSearchResults(results);

        const hint = document.createElement('div');
        hint.className = 'yf-studio-hint';
        hint.textContent = i18n('YOUR_FLAVOR.Studio.Home.Hint');
        pane.appendChild(hint);

        pane.appendChild(this.#sectionLabel(i18n('YOUR_FLAVOR.Studio.Home.AllAreas')));
        const list = document.createElement('div');
        list.className = 'yf-studio-areas';
        for (const target of getVisibleStudioTargets({ isGM: game.user.isGM })) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = i18nOr(target.titleKey, target.titleFallback);
            button.addEventListener('click', () => this.#selectTarget(target.id));
            list.appendChild(button);
        }
        pane.appendChild(list);

        return pane;
    }

    #renderSearchResults(container) {
        container.replaceChildren();
        const query = this.searchQuery.trim().toLowerCase();
        if (query.length < 2) return;

        const words = query.split(/\s+/);
        const hits = buildStudioSearchIndex({ isGM: game.user.isGM })
            .map(entry => ({
                ...entry,
                label: i18n(entry.labelKey),
                targetTitle: i18nOr(entry.targetTitleKey, entry.targetTitleFallback)
            }))
            .filter(entry => {
                const haystack = `${entry.label} ${entry.targetTitle}`.toLowerCase();
                return words.every(word => haystack.includes(word));
            })
            .slice(0, 10);

        for (const hit of hits) {
            const button = document.createElement('button');
            button.type = 'button';
            const label = document.createElement('span');
            label.textContent = hit.label;
            const context = document.createElement('small');
            context.textContent = hit.targetTitle;
            button.append(label, context);
            button.addEventListener('click', () => this.#selectTarget(hit.targetId, { focusLabelKey: hit.labelKey }));
            container.appendChild(button);
        }

        if (!hits.length) {
            const empty = document.createElement('div');
            empty.className = 'yf-studio-hint';
            empty.textContent = i18n('YOUR_FLAVOR.Studio.Search.Empty');
            container.appendChild(empty);
        }
    }

    /* ══════════ inspetor ══════════ */

    #buildInspectorPane() {
        const target = getStudioTarget(this.selectedTargetId);
        if (!target) return this.#buildStudioHome();

        const pane = document.createElement('div');
        pane.className = 'yf-studio-pane';

        const back = document.createElement('button');
        back.type = 'button';
        back.className = 'yf-studio-link';
        back.textContent = `← ${i18n('YOUR_FLAVOR.Studio.Inspector.Back')}`;
        back.addEventListener('click', () => this.#selectTarget(null));
        pane.appendChild(back);

        const crumb = document.createElement('span');
        crumb.className = 'yf-studio-crumb';
        crumb.textContent = i18n(target.crumbKey);
        pane.appendChild(crumb);

        pane.appendChild(this.#heading(
            i18nOr(target.titleKey, target.titleFallback),
            i18n(target.descKey)
        ));

        const controls = document.createElement('div');
        controls.className = 'yf-studio-controls';
        for (const control of target.essentials ?? []) this.#buildControl(control, target, controls);

        const drawerControls = (target.drawer ?? []);
        if (drawerControls.length) {
            const drawer = document.createElement('details');
            drawer.className = 'yf-studio-drawer';
            if (this._openDrawer) drawer.open = true;
            const count = drawerControls.filter(control => !control.sec).length;
            const summary = document.createElement('summary');
            summary.textContent = game.i18n?.format?.('YOUR_FLAVOR.Studio.Inspector.AllOptions', { count })
                ?? `All options (+${count})`;
            drawer.appendChild(summary);
            const inner = document.createElement('div');
            inner.className = 'yf-studio-drawer-inner';
            for (const control of drawerControls) this.#buildControl(control, target, inner);
            drawer.appendChild(inner);
            controls.appendChild(drawer);
        }
        pane.appendChild(controls);
        this._controlsRoot = controls;

        this.#appendContrastCard(pane, target);
        this._openDrawer = false;

        if (this._focusLabelKey) {
            const row = controls.querySelector(`[data-label-key="${CSS.escape(this._focusLabelKey)}"]`);
            if (row) {
                const drawer = row.closest('details.yf-studio-drawer');
                if (drawer) drawer.open = true;
                row.classList.add('flash');
                queueMicrotask(() => row.scrollIntoView({ block: 'center', behavior: 'smooth' }));
            }
            this._focusLabelKey = null;
        }

        return pane;
    }

    #buildControl(control, target, container) {
        if (control.sec) {
            container.appendChild(this.#sectionLabel(i18n(control.sec)));
            return;
        }
        if (control.showIf && !this.#getRaw(target, { path: control.showIf })) return;
        if (control.hideIfOnSegments && this.#getRaw(target, { segments: control.hideIfOnSegments })) return;
        if (control.gate === 'customHtml') {
            try {
                if (!game.settings.get(MODULE_ID, 'allowCustomHtml')) return;
            } catch (error) {
                void error;
                return;
            }
        }

        const row = document.createElement('div');
        row.className = 'yf-studio-ctl';
        row.dataset.labelKey = control.labelKey;

        const label = document.createElement('label');
        label.textContent = i18n(control.labelKey);
        row.appendChild(label);

        const wrap = document.createElement('div');
        wrap.className = 'yf-studio-ctl-wrap';
        const value = this.#getValue(target, control);

        switch (control.type) {
            case 'color': {
                const input = document.createElement('input');
                input.type = 'color';
                input.value = typeof value === 'string' && value.startsWith('#') ? value : '#777777';
                if (control.nullable && (value === null || value === '' || value === undefined)) {
                    row.classList.add('is-stock');
                }
                input.addEventListener('input', () => {
                    row.classList.remove('is-stock');
                    this.#setValue(target, control, input.value);
                });
                wrap.appendChild(input);
                if (control.nullable) {
                    const clear = document.createElement('button');
                    clear.type = 'button';
                    clear.className = 'yf-studio-clear';
                    clear.title = i18n('YOUR_FLAVOR.Studio.Control.Stock');
                    clear.textContent = '∅';
                    clear.addEventListener('click', () => {
                        this.#setValue(target, control, null);
                        row.classList.add('is-stock');
                    });
                    wrap.appendChild(clear);
                }
                break;
            }
            case 'range': {
                const input = document.createElement('input');
                input.type = 'range';
                input.min = control.min;
                input.max = control.max;
                if (control.step) input.step = control.step;
                input.value = Number.isFinite(Number(value)) ? Number(value) : control.min;
                const readout = document.createElement('span');
                readout.className = 'yf-studio-rv';
                readout.textContent = `${input.value}${control.unit ?? ''}`;
                input.addEventListener('input', () => {
                    readout.textContent = `${input.value}${control.unit ?? ''}`;
                    this.#setValue(target, control, Number(input.value));
                });
                wrap.append(input, readout);
                break;
            }
            case 'toggle': {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = `yf-studio-tgl${value ? ' on' : ''}`;
                button.setAttribute('role', 'switch');
                button.setAttribute('aria-checked', String(Boolean(value)));
                button.setAttribute('aria-label', i18n(control.labelKey));
                button.addEventListener('click', () => {
                    this.#setValue(target, control, !this.#getValue(target, control));
                    this.render();
                });
                wrap.appendChild(button);
                break;
            }
            case 'select':
            case 'font': {
                const selectEl = document.createElement('select');
                const options = control.options ?? [];
                for (const option of options) {
                    const optionEl = document.createElement('option');
                    optionEl.value = String(option.value);
                    optionEl.textContent = option.labelKey ? i18n(option.labelKey) : option.label ?? String(option.value);
                    if (String(option.value) === String(value)) optionEl.selected = true;
                    selectEl.appendChild(optionEl);
                }
                selectEl.addEventListener('change', () => {
                    const raw = options.find(option => String(option.value) === selectEl.value)?.value ?? selectEl.value;
                    this.#setValue(target, control, raw);
                });
                wrap.appendChild(selectEl);
                break;
            }
            case 'text': {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'yf-studio-text';
                input.value = value ?? '';
                input.addEventListener('input', () => this.#setValue(target, control, input.value));
                wrap.appendChild(input);
                break;
            }
            case 'textarea': {
                row.classList.add('stack');
                const input = document.createElement('textarea');
                input.className = 'yf-studio-textarea';
                input.rows = 4;
                input.value = value ?? '';
                input.addEventListener('input', () => this.#setValue(target, control, input.value));
                wrap.appendChild(input);
                break;
            }
            case 'file': {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'yf-studio-text';
                input.value = value ?? '';
                input.addEventListener('input', () => this.#setValue(target, control, input.value));
                const browse = document.createElement('button');
                browse.type = 'button';
                browse.className = 'yf-studio-clear';
                browse.innerHTML = '<i class="fas fa-folder-open"></i>';
                browse.title = i18n('YOUR_FLAVOR.Studio.Control.Browse');
                browse.addEventListener('click', () => {
                    openFilePicker({
                        type: 'imagevideo',
                        current: input.value || '',
                        callback: path => {
                            input.value = path;
                            this.#setValue(target, control, path);
                        }
                    });
                });
                wrap.append(input, browse);
                break;
            }
            default:
                return;
        }

        const reset = document.createElement('button');
        reset.type = 'button';
        reset.className = 'yf-studio-reset';
        reset.title = i18n('YOUR_FLAVOR.Studio.Control.ResetToSaved');
        reset.textContent = '↺';
        reset.addEventListener('click', () => {
            const saved = this.#getSavedValue(target, control);
            this.#setValue(target, control, saved === undefined ? null : saved);
            this._openDrawer = Boolean(row.closest('details.yf-studio-drawer'));
            this.render();
        });
        wrap.appendChild(reset);

        row.appendChild(wrap);
        container.appendChild(row);
    }

    #appendContrastCard(pane, target) {
        if (target.domain !== 'chat') return;
        const warnings = buildChatContrastWarnings(this.store.workingConfig ?? {});
        if (!warnings.length) return;

        const card = document.createElement('div');
        card.className = 'yf-studio-contrast';
        const message = document.createElement('div');
        message.textContent = i18n('YOUR_FLAVOR.Studio.Contrast.Warning');
        card.appendChild(message);
        const fix = document.createElement('button');
        fix.type = 'button';
        fix.className = 'yf-studio-btn';
        fix.textContent = i18n('YOUR_FLAVOR.Studio.Contrast.Fix');
        fix.addEventListener('click', () => {
            this.#autoFixContrast();
            this.render();
        });
        card.appendChild(fix);
        pane.appendChild(card);
    }

    #autoFixContrast() {
        const customizations = this.store.workingConfig?.customizations;
        if (!customizations) return;
        let guard = 0;
        while (buildChatContrastWarnings(this.store.workingConfig).length && guard++ < 24) {
            customizations.textColor = FlavorStudioApp.#lighten(customizations.textColor ?? '#888888', 0.18);
        }
        this.#applyLive('chat');
    }

    static #lighten(hex, amount) {
        const clean = String(hex).replace('#', '');
        const full = clean.length === 3 ? [...clean].map(c => c + c).join('') : clean.padEnd(6, '0');
        const channels = [0, 2, 4].map(index => Number.parseInt(full.slice(index, index + 2), 16) || 0);
        return `#${channels.map(channel =>
            Math.round(channel + (255 - channel) * amount).toString(16).padStart(2, '0')
        ).join('')}`;
    }

    /* ══════════ estado: get/set/apply ══════════ */

    #domainObject(target) {
        return target.domain === 'foundry' ? this.store.workingFoundryConfig : this.store.workingConfig;
    }

    #savedDomainObject(target) {
        return target.domain === 'foundry' ? this.store.savedFoundryConfigSnapshot : this.store.savedConfigSnapshot;
    }

    static #segmentsOf(control) {
        return control.segments ?? String(control.path ?? '').split('.');
    }

    #getRaw(target, control) {
        let value = this.#domainObject(target);
        for (const segment of FlavorStudioApp.#segmentsOf(control)) value = value?.[segment];
        return value;
    }

    #getValue(target, control) {
        const raw = this.#getRaw(target, control);
        if (control.format === 'hex-in-rgba') return FlavorStudioApp.#rgbaToHex(raw);
        return raw;
    }

    #getSavedValue(target, control) {
        let value = this.#savedDomainObject(target);
        for (const segment of FlavorStudioApp.#segmentsOf(control)) value = value?.[segment];
        if (control.format === 'hex-in-rgba') return FlavorStudioApp.#rgbaToHex(value);
        return value;
    }

    #setValue(target, control, value) {
        const segments = FlavorStudioApp.#segmentsOf(control);
        let node = this.#domainObject(target);
        if (!node) return;
        for (const segment of segments.slice(0, -1)) {
            if (typeof node[segment] !== 'object' || node[segment] === null) node[segment] = {};
            node = node[segment];
        }
        const leaf = segments.at(-1);

        if (control.format === 'hex-in-rgba') {
            const opacity = Number(this.store.workingConfig?.customizations?.backgroundOpacity ?? 95) / 100;
            node[leaf] = FlavorStudioApp.#hexToRgba(String(value), opacity);
        } else {
            node[leaf] = value;
        }

        if (target.domain === 'foundry' && !segments.includes('overrides')) {
            const config = this.store.workingFoundryConfig;
            if (config && typeof config.fieldOverrides === 'object' && config.fieldOverrides !== null) {
                config.fieldOverrides[segments.join('.')] = true;
            }
        }

        this.#applyLive(target.domain);
    }

    static #rgbaToHex(value) {
        if (typeof value !== 'string') return '#141210';
        if (value.startsWith('#')) return value;
        const match = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
        if (!match) return '#141210';
        return `#${match.slice(1, 4).map(channel =>
            Math.max(0, Math.min(255, Number(channel))).toString(16).padStart(2, '0')
        ).join('')}`;
    }

    static #hexToRgba(hex, alpha) {
        const clean = hex.replace('#', '');
        const full = clean.length === 3 ? [...clean].map(c => c + c).join('') : clean.padEnd(6, '0');
        const [r, g, b] = [0, 2, 4].map(index => Number.parseInt(full.slice(index, index + 2), 16) || 0);
        return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha)).toFixed(2)})`;
    }

    #applyLive(domain) {
        if (domain === 'chat') {
            const api = game.modules.get(MODULE_ID)?.api;
            api?.applyChatLogPreview?.(this.store.workingConfig, {
                userId: game.user.id,
                actorId: this.store.editingActorId || null
            });
        } else if (this.foundryCustomizer && game.user.isGM) {
            this.foundryCustomizer.applyPreviewConfig?.(this.store.workingFoundryConfig, {
                forceFeatureEnabled: true
            });
        }
        this.#refreshDirtyUi();
    }

    /* ══════════ seleção / picker ══════════ */

    #setMode(mode) {
        if (this.mode === mode) return;
        this.mode = mode;
        if (mode === 'simples') this.selectedTargetId = null;
        this.render();
    }

    #selectTarget(targetId, { focusLabelKey = null } = {}) {
        this.selectedTargetId = targetId;
        this._focusLabelKey = focusLabelKey;
        this._openDrawer = Boolean(focusLabelKey);
        if (targetId && this.mode !== 'estudio') this.mode = 'estudio';
        this.render();
    }

    #onSurfacePicked(targetId) {
        this.#selectTarget(targetId);
        ui.notifications?.info?.(game.i18n?.format?.('YOUR_FLAVOR.Studio.PickedNotice', {
            target: i18nOr(getStudioTarget(targetId)?.titleKey, targetId)
        }));
    }

    #syncPicker() {
        if (this.mode === 'estudio') {
            const targets = getVisibleStudioTargets({ isGM: game.user.isGM })
                .filter(target => target.selectors.length);
            this.picker.enable(targets);
            this.picker.setSelected(this.selectedTargetId);
        } else {
            this.picker.disable();
        }
    }

    /* ══════════ save / discard ══════════ */

    async #save() {
        if (this._saving) return;
        this._saving = true;
        try {
            const dirty = this.store.getDirtyAreas();
            await this.store.save({
                saveFoundry: Boolean(game.user.isGM && this.foundryCustomizer && (dirty.foundry || dirty.icons))
            });
            game.modules.get(MODULE_ID)?.api?.commitChatLogPreview?.();
            if (this.foundryCustomizer && game.user.isGM) {
                this.foundryCustomizer.commitPreview?.(this.store.workingFoundryConfig);
            }
            ui.notifications?.info?.(i18n('YOUR_FLAVOR.Studio.Saved'));
            this.render();
        } catch (error) {
            console.error(`${MODULE_ID} | Studio save failed`, error);
            ui.notifications?.error?.(i18n('YOUR_FLAVOR.Studio.SaveFailed'));
        } finally {
            this._saving = false;
        }
    }

    #discard() {
        this.store.workingConfig = foundry.utils.deepClone(this.store.savedConfigSnapshot);
        this.store.workingFoundryConfig = foundry.utils.deepClone(this.store.savedFoundryConfigSnapshot);
        game.modules.get(MODULE_ID)?.api?.clearChatLogPreview?.();
        if (this.foundryCustomizer && game.user.isGM) {
            this.foundryCustomizer.commitPreview?.(this.store.savedFoundryConfigSnapshot);
        }
        this.render();
    }

    /* ══════════ onboarding (P11-007) ══════════ */

    #needsWelcome() {
        try {
            return !game.settings.get(MODULE_ID, WELCOME_SETTING);
        } catch (error) {
            void error;
            return false;
        }
    }

    #buildWelcome() {
        const overlay = document.createElement('div');
        overlay.className = 'yf-studio-welcome';

        const card = document.createElement('div');
        card.className = 'yf-studio-welcome-card';

        const title = document.createElement('h2');
        title.textContent = i18n('YOUR_FLAVOR.Studio.Welcome.Title');
        card.appendChild(title);

        const lead = document.createElement('p');
        lead.textContent = i18n('YOUR_FLAVOR.Studio.Welcome.Lead');
        card.appendChild(lead);

        const suggestedIds = ['elegant', 'parchment', 'shadow', 'cosmic', 'fire', 'druid'];
        const presets = getChatPresetChoices({})
            .filter(preset => suggestedIds.includes(preset.id));
        const gallery = this.#buildGallery(presets, { onPick: () => this.#finishWelcome() });
        card.appendChild(gallery);

        const actions = document.createElement('div');
        actions.className = 'yf-studio-welcome-actions';
        const skip = document.createElement('button');
        skip.type = 'button';
        skip.className = 'yf-studio-link';
        skip.textContent = i18n('YOUR_FLAVOR.Studio.Welcome.Skip');
        skip.addEventListener('click', () => this.#finishWelcome());
        actions.appendChild(skip);
        card.appendChild(actions);

        overlay.appendChild(card);
        return overlay;
    }

    async #finishWelcome() {
        try {
            await game.settings.set(MODULE_ID, WELCOME_SETTING, true);
        } catch (error) {
            void error;
        }
        this.render();
    }

    /* ══════════ helpers ══════════ */

    #heading(titleText, subText) {
        const fragment = document.createDocumentFragment();
        const title = document.createElement('h2');
        title.className = 'yf-studio-h';
        title.textContent = titleText;
        fragment.appendChild(title);
        if (subText) {
            const sub = document.createElement('p');
            sub.className = 'yf-studio-sub';
            sub.textContent = subText;
            fragment.appendChild(sub);
        }
        return fragment;
    }

    #sectionLabel(labelText) {
        const label = document.createElement('div');
        label.className = 'yf-studio-sec';
        label.textContent = labelText;
        return label;
    }
}
