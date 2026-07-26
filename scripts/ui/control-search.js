/**
 * Your Flavor - global control search for the classic config window (Fase 11).
 *
 * A search field above the tab bar: type "glow", "pausa", "border" and jump
 * straight to the control — the app switches tab (and Foundry section when
 * needed), scrolls to the row and flashes it. The index is generated from the
 * templates by tools/build-control-index.mjs, so it can never drift from the
 * real UI.
 */

import { CONTROL_SEARCH_INDEX } from './control-search-index.js';
import { MODULE_ID } from '../constants.js';

const GM_ONLY_TABS = new Set(['foundry', 'icons']);
const MAX_RESULTS = 10;

/**
 * (Re)build the search UI inside the app's [data-control-search] host.
 * Called from FlavorConfigApp._onRender — the DOM is replaced every render.
 */
export function attachControlSearch(app, root) {
    const host = root?.querySelector?.('[data-control-search]');
    if (!host) return;

    host.replaceChildren();

    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = game.i18n.localize('YOUR_FLAVOR.Studio.Search.Placeholder');
    input.setAttribute('aria-label', game.i18n.localize('YOUR_FLAVOR.Studio.Search.Placeholder'));
    input.value = app._controlSearchQuery ?? '';

    const results = document.createElement('div');
    results.className = 'yf-control-search-results';

    input.addEventListener('input', () => {
        app._controlSearchQuery = input.value;
        renderResults(app, input.value, results);
    });
    input.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            input.value = '';
            app._controlSearchQuery = '';
            results.replaceChildren();
        }
        if (event.key === 'Enter') {
            results.querySelector('button')?.click();
            event.preventDefault();
        }
    });

    host.append(input, results);
    if (app._controlSearchQuery) renderResults(app, app._controlSearchQuery, results);

    highlightPendingControl(app, root);
}

function visibleEntries() {
    const isGM = game.user.isGM;
    const canCustomize = isGM || game.settings.get(MODULE_ID, 'allowPlayerCustomization');
    const forcedLayout = game.settings.get(MODULE_ID, 'forcePlayerLayout');
    const hasForcedLayout = !isGM && forcedLayout && forcedLayout !== 'none';
    const allowCustomHtml = isGM || game.settings.get(MODULE_ID, 'allowCustomHtml');
    const canUseCustomHtml = canCustomize && !hasForcedLayout && allowCustomHtml;

    return CONTROL_SEARCH_INDEX.filter(entry => (
        (isGM || !GM_ONLY_TABS.has(entry.tab))
        && (isGM || entry.tab !== 'changes' || (
            !entry.name.startsWith('settings.')
            && !entry.name.startsWith('foundry.')
        ))
        && (entry.name !== 'customHtml' || canUseCustomHtml)
    ));
}

function entryLabel(entry) {
    if (entry.labelKey) {
        const localized = game.i18n.localize(entry.labelKey);
        if (localized !== entry.labelKey) return localized;
    }
    return entry.name;
}

function tabLabel(app, entry) {
    const key = `YOUR_FLAVOR.Config.Tabs.${entry.tab.charAt(0).toUpperCase()}${entry.tab.slice(1)}`;
    const localized = game.i18n.localize(key);
    return localized !== key ? localized : entry.tab;
}

function renderResults(app, query, results) {
    results.replaceChildren();
    const clean = String(query ?? '').trim().toLowerCase();
    if (clean.length < 2) return;

    const words = clean.split(/\s+/);
    const hits = visibleEntries()
        .map(entry => ({ entry, label: entryLabel(entry), context: tabLabel(app, entry) }))
        .filter(({ entry, label, context }) => {
            const haystack = `${label} ${context} ${entry.name} ${entry.section ?? ''}`.toLowerCase();
            return words.every(word => haystack.includes(word));
        })
        .slice(0, MAX_RESULTS);

    for (const { entry, label, context } of hits) {
        const button = document.createElement('button');
        button.type = 'button';
        const text = document.createElement('span');
        text.textContent = label;
        const small = document.createElement('small');
        small.textContent = entry.section ? `${context} · ${entry.section}` : context;
        button.append(text, small);
        button.addEventListener('click', () => jumpToControl(app, entry));
        results.appendChild(button);
    }

    if (!hits.length) {
        const empty = document.createElement('div');
        empty.className = 'yf-control-search-empty';
        empty.textContent = game.i18n.localize('YOUR_FLAVOR.Studio.Search.Empty');
        results.appendChild(empty);
    }
}

function jumpToControl(app, entry) {
    app._syncCustomHtmlDraftFromDom?.();
    app._activeTab = entry.tab;
    if (entry.tab === 'chat') {
        const opensCustomHtml = entry.name === 'customHtml';
        app._chatEditorMode = opensCustomHtml ? 'customHtml' : 'flavor';
        app._pendingChatEditorFocus = opensCustomHtml ? 'editor' : null;
    }
    if (entry.tab === 'foundry' && entry.section) app._activeFoundrySection = entry.section;
    if (entry.tab === 'rolls') {
        if (entry.name.includes('.critical.')) app._activeRollPreviewState = 'critical';
        else if (entry.name.includes('.failure.')) app._activeRollPreviewState = 'failure';
        else if (entry.name.includes('.terms.') || entry.name.includes('.tooltip.')) app._activeRollPreviewState = 'breakdown';
        else app._activeRollPreviewState = 'basic';
    }
    app._pendingControlFocus = entry.name;
    app.render();
}

function highlightPendingControl(app, root) {
    const name = app._pendingControlFocus;
    if (!name) return;
    app._pendingControlFocus = null;

    const control = root.querySelector(`[name="${CSS.escape(name)}"]`);
    if (!control) return;
    control.closest('details')?.setAttribute('open', '');

    const row = control.closest('.yf-control-row')
        ?? control.closest('.yf-token-control')
        ?? control.closest('.yf-configuration-setting-row')
        ?? control.closest('.yf-configuration-select-row')
        ?? control.closest('.yf-chat-html-field')
        ?? control.closest('label')
        ?? control;
    row.classList.add('yf-ctl-found');
    queueMicrotask(() => row.scrollIntoView({ block: 'center', behavior: 'smooth' }));
    globalThis.setTimeout?.(() => row.classList.remove('yf-ctl-found'), 2200);
}
