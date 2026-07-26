/**
 * Your Flavor Studio - Surface Picker (P11-003)
 *
 * Generalizes the icon selection mode (P8-003) to every Studio target: while
 * active, hovering a registered surface on the real Foundry DOM shows a gold
 * outline + label chip, and clicking it selects the target in the Studio app
 * instead of triggering the normal Foundry action.
 *
 * Only elements that match a registered target selector are intercepted;
 * everything else behaves normally. Events inside the Studio window itself
 * are always ignored.
 */

const BODY_CLASS = 'yf-studio-picking';
const HIGHLIGHT_CLASS = 'yf-studio-pick-highlight';
const SELECTED_CLASS = 'yf-studio-pick-selected';

export class StudioSurfacePicker {
    /**
     * @param {Object} options
     * @param {Function} options.onSelect - (targetId, element) => void
     * @param {Function} options.resolveLabel - (target) => string shown in the hover chip
     * @param {string} options.ignoredSelector - events inside this container are ignored
     */
    constructor({ onSelect, resolveLabel, ignoredSelector = '#your-flavor-studio' } = {}) {
        this.onSelect = typeof onSelect === 'function' ? onSelect : null;
        this.resolveLabel = typeof resolveLabel === 'function' ? resolveLabel : (target => target.id);
        this.ignoredSelector = ignoredSelector;
        this.active = false;
        this.targets = [];
        this.selectedTargetId = null;
        this._hovered = null;
        this._labelEl = null;
        this._selectedEls = [];
        this._boundMove = event => this._onPointerMove(event);
        this._boundDown = event => this._onPointerDown(event);
        this._boundClick = event => this._onClick(event);
        this._boundKey = event => this._onKeyDown(event);
        this._suppressClick = false;
    }

    enable(targets = []) {
        if (this.active) this.disable();
        this.targets = targets.filter(target => Array.isArray(target.selectors) && target.selectors.length);
        this.active = true;

        const doc = globalThis.document;
        if (!doc) return false;
        doc.body?.classList.add(BODY_CLASS);
        doc.addEventListener('pointermove', this._boundMove, true);
        doc.addEventListener('pointerdown', this._boundDown, true);
        doc.addEventListener('click', this._boundClick, true);
        doc.addEventListener('keydown', this._boundKey, true);
        return true;
    }

    disable() {
        const doc = globalThis.document;
        doc?.removeEventListener('pointermove', this._boundMove, true);
        doc?.removeEventListener('pointerdown', this._boundDown, true);
        doc?.removeEventListener('click', this._boundClick, true);
        doc?.removeEventListener('keydown', this._boundKey, true);
        doc?.body?.classList.remove(BODY_CLASS);
        this._clearHover();
        this.clearSelectionHighlight();
        this.active = false;
        this.targets = [];
        this._suppressClick = false;
    }

    /** Persistent highlight of the currently selected target. */
    setSelected(targetId) {
        this.selectedTargetId = targetId || null;
        this.clearSelectionHighlight();
        if (!this.selectedTargetId) return;

        const target = this.targets.find(entry => entry.id === this.selectedTargetId);
        if (!target) return;
        const element = this._firstMatch(target);
        if (!element) return;
        element.classList.add(SELECTED_CLASS);
        this._selectedEls.push(element);
    }

    clearSelectionHighlight() {
        for (const element of this._selectedEls) element.classList.remove(SELECTED_CLASS);
        this._selectedEls = [];
    }

    _firstMatch(target) {
        const doc = globalThis.document;
        if (!doc) return null;
        for (const selector of target.selectors) {
            try {
                const element = doc.querySelector(selector);
                if (element) return element;
            } catch (error) {
                void error; // invalid selector for this Foundry version — diagnostics cover it
            }
        }
        return null;
    }

    /**
     * From an event target, find the best (deepest) registered match.
     * @returns {{target: Object, element: Element}|null}
     */
    _match(eventTarget) {
        if (!(eventTarget instanceof Element)) return null;
        if (this.ignoredSelector && eventTarget.closest(this.ignoredSelector)) return null;

        let best = null;
        for (const target of this.targets) {
            for (const selector of target.selectors) {
                let element = null;
                try {
                    element = eventTarget.closest(selector);
                } catch (error) {
                    void error;
                }
                if (!element) continue;
                if (!best || best.element.contains(element)) best = { target, element };
                break;
            }
        }
        return best;
    }

    _onPointerMove(event) {
        const match = this._match(event.target);
        if (!match) {
            this._clearHover();
            return;
        }
        if (this._hovered?.element === match.element) {
            this._positionLabel(match.element);
            return;
        }
        this._clearHover();
        this._hovered = match;
        match.element.classList.add(HIGHLIGHT_CLASS);
        this._showLabel(match);
    }

    _onPointerDown(event) {
        const match = this._match(event.target);
        this._suppressClick = Boolean(match);
        if (!match) return;
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    _onClick(event) {
        const match = this._match(event.target);
        if (!match) {
            this._suppressClick = false;
            return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        this._suppressClick = false;
        this.onSelect?.(match.target.id, match.element);
    }

    _onKeyDown(event) {
        if (event.key !== 'Escape') return;
        this._clearHover();
    }

    _showLabel(match) {
        const doc = globalThis.document;
        if (!doc) return;
        if (!this._labelEl) {
            this._labelEl = doc.createElement('div');
            this._labelEl.className = 'yf-studio-pick-label';
            doc.body.appendChild(this._labelEl);
        }
        this._labelEl.textContent = this.resolveLabel(match.target);
        this._labelEl.hidden = false;
        this._positionLabel(match.element);
    }

    _positionLabel(element) {
        if (!this._labelEl || this._labelEl.hidden) return;
        const rect = element.getBoundingClientRect();
        const label = this._labelEl;
        const top = rect.top > 34 ? rect.top - 30 : rect.bottom + 6;
        label.style.top = `${Math.round(top)}px`;
        label.style.left = `${Math.round(Math.min(Math.max(rect.left, 8), (globalThis.innerWidth || 1200) - 220))}px`;
    }

    _clearHover() {
        if (this._hovered) {
            this._hovered.element.classList.remove(HIGHLIGHT_CLASS);
            this._hovered = null;
        }
        if (this._labelEl) this._labelEl.hidden = true;
    }
}
