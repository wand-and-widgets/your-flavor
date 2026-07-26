/**
 * Accessible, font-aware chooser for refined font controls.
 *
 * The native select remains the form source of truth. The enhanced trigger and
 * listbox exist only because native option font styling is inconsistent across
 * browsers and operating systems.
 *
 * @module your-flavor/ui/scene-navigation-font-chooser
 */

export const FONT_PREVIEW_SELECT_SELECTOR = 'select[data-yf-font-preview="true"]';
const SCENE_NAVIGATION_FONT_SELECTOR = 'select[name="foundry.sceneNavigation.fontFamily"]';
const FONT_FALLBACK_STACK = '"YF Crimson", Georgia, serif';
let chooserId = 0;

function safeFontFamily(value) {
    return String(value || '').replace(/["'\\;]/g, '').trim();
}

export function fontPreviewStack(fontFamily) {
    const family = safeFontFamily(fontFamily);
    return family && family !== 'inherit'
        ? `"${family}", ${FONT_FALLBACK_STACK}`
        : FONT_FALLBACK_STACK;
}

export function attachFontPreviewChooser(select) {
    if (!select || select.dataset.yfFontChooserEnhanced === 'true') return null;

    const chooser = new FontPreviewChooser(select);
    return chooser.mount() ? chooser : null;
}

export function attachFontPreviewChoosers(root) {
    return [...(root?.querySelectorAll?.(FONT_PREVIEW_SELECT_SELECTOR) || [])]
        .map(select => attachFontPreviewChooser(select))
        .filter(Boolean);
}

/**
 * Backwards-compatible single-control entry point retained for integrations
 * that explicitly target the proven Scene Navigation chooser.
 */
export function attachSceneNavigationFontChooser(root) {
    return attachFontPreviewChooser(root?.querySelector?.(SCENE_NAVIGATION_FONT_SELECTOR));
}

export class FontPreviewChooser {
    constructor(select) {
        this.select = select;
        this.document = select.ownerDocument;
        this.window = this.document.defaultView || globalThis;
        this.id = ++chooserId;
        this.label = select.labels?.[0]
            || select.closest('.yf-control-row, .yf-chat-field, .yf-foundry-customize-field')
                ?.querySelector('label')
            || null;
        this.originalLabelFor = this.label?.htmlFor || '';
        this.isOpen = false;
        this.activeIndex = -1;
        this.typeahead = '';
        this.typeaheadTimer = null;

        this.onTriggerClick = event => this.#handleTriggerClick(event);
        this.onTriggerKeydown = event => this.#handleTriggerKeydown(event);
        this.onOptionClick = event => this.#handleOptionClick(event);
        this.onNativeChange = () => this.#syncSelection();
        this.onDocumentPointerDown = event => this.#handleDocumentPointerDown(event);
        this.onDocumentScroll = event => this.#handleDocumentScroll(event);
        this.onWindowResize = () => this.close();
    }

    mount() {
        if (!this.select?.parentNode || !this.document?.body) return false;

        if (!this.select.id) {
            this.select.id = `yf-scene-navigation-font-native-${this.id}`;
        }

        this.wrapper = this.document.createElement('div');
        this.wrapper.className = 'yf-font-chooser';
        this.select.parentNode.insertBefore(this.wrapper, this.select);
        this.wrapper.appendChild(this.select);

        this.select.dataset.yfFontChooserEnhanced = 'true';
        this.select.classList.add('yf-font-native');
        this.select.setAttribute('aria-hidden', 'true');
        this.select.tabIndex = -1;

        this.trigger = this.document.createElement('button');
        this.trigger.type = 'button';
        this.trigger.id = `yf-font-trigger-${this.id}`;
        this.trigger.className = 'yf-select yf-refined-select yf-font-trigger';
        this.trigger.setAttribute('role', 'combobox');
        this.trigger.setAttribute('aria-haspopup', 'listbox');
        this.trigger.setAttribute('aria-expanded', 'false');
        this.trigger.setAttribute('aria-controls', `yf-font-listbox-${this.id}`);
        this.trigger.disabled = this.select.disabled;

        this.value = this.document.createElement('span');
        this.value.id = `yf-font-value-${this.id}`;
        this.value.className = 'yf-font-trigger-value';
        this.trigger.appendChild(this.value);
        this.wrapper.appendChild(this.trigger);

        if (this.label) {
            if (!this.label.id) this.label.id = `yf-font-label-${this.id}`;
            this.label.htmlFor = this.trigger.id;
            this.trigger.setAttribute('aria-labelledby', `${this.label.id} ${this.value.id}`);
        }

        this.listbox = this.document.createElement('div');
        this.listbox.id = `yf-font-listbox-${this.id}`;
        this.listbox.className = 'yf-font-listbox';
        this.listbox.setAttribute('role', 'listbox');
        if (this.label?.id) this.listbox.setAttribute('aria-labelledby', this.label.id);
        this.listbox.hidden = true;

        this.options = [...this.select.options].map((nativeOption, index) => {
            const option = this.document.createElement('div');
            option.id = `yf-font-option-${this.id}-${index}`;
            option.className = 'yf-font-option';
            option.dataset.index = String(index);
            option.dataset.value = nativeOption.value;
            option.setAttribute('role', 'option');
            option.setAttribute('aria-selected', nativeOption.selected ? 'true' : 'false');
            option.style.fontFamily = fontPreviewStack(nativeOption.value);

            const name = this.document.createElement('span');
            name.className = 'yf-font-option-name';
            name.textContent = nativeOption.textContent?.trim() || nativeOption.value;

            const sample = this.document.createElement('span');
            sample.className = 'yf-font-option-sample';
            sample.textContent = 'Aa';
            sample.setAttribute('aria-hidden', 'true');

            option.append(name, sample);
            option.addEventListener('click', this.onOptionClick);
            this.listbox.appendChild(option);
            return option;
        });
        this.document.body.appendChild(this.listbox);

        this.trigger.addEventListener('click', this.onTriggerClick);
        this.trigger.addEventListener('keydown', this.onTriggerKeydown);
        this.select.addEventListener('change', this.onNativeChange);
        this.#syncSelection();
        return true;
    }

    open({ activeIndex = this.select.selectedIndex } = {}) {
        if (this.isOpen || this.trigger?.disabled || !this.options?.length) return;

        this.isOpen = true;
        this.listbox.hidden = false;
        this.trigger.setAttribute('aria-expanded', 'true');
        this.#setActiveIndex(activeIndex >= 0 ? activeIndex : 0);
        this.#positionListbox();

        this.document.addEventListener('pointerdown', this.onDocumentPointerDown, true);
        this.document.addEventListener('scroll', this.onDocumentScroll, true);
        this.window.addEventListener('resize', this.onWindowResize);
    }

    close({ restoreFocus = false } = {}) {
        if (!this.listbox) return;

        this.isOpen = false;
        this.listbox.hidden = true;
        this.trigger?.setAttribute('aria-expanded', 'false');
        this.trigger?.removeAttribute('aria-activedescendant');
        this.options?.forEach(option => option.classList.remove('is-active'));
        this.document.removeEventListener('pointerdown', this.onDocumentPointerDown, true);
        this.document.removeEventListener('scroll', this.onDocumentScroll, true);
        this.window.removeEventListener('resize', this.onWindowResize);
        if (restoreFocus) this.trigger?.focus?.({ preventScroll: true });
    }

    destroy() {
        this.close();
        this.window.clearTimeout(this.typeaheadTimer);
        this.trigger?.removeEventListener('click', this.onTriggerClick);
        this.trigger?.removeEventListener('keydown', this.onTriggerKeydown);
        this.select?.removeEventListener('change', this.onNativeChange);
        this.options?.forEach(option => option.removeEventListener('click', this.onOptionClick));
        this.listbox?.remove();

        if (this.select) {
            this.select.classList.remove('yf-font-native');
            this.select.removeAttribute('aria-hidden');
            this.select.removeAttribute('data-yf-font-chooser-enhanced');
            this.select.removeAttribute('tabindex');
        }
        if (this.label) this.label.htmlFor = this.originalLabelFor;

        if (this.wrapper?.parentNode && this.select?.parentNode === this.wrapper) {
            this.wrapper.parentNode.insertBefore(this.select, this.wrapper);
            this.wrapper.remove();
        }
    }

    #handleTriggerClick(event) {
        event.preventDefault();
        if (this.isOpen) this.close({ restoreFocus: true });
        else this.open();
    }

    #handleTriggerKeydown(event) {
        const { key } = event;
        if (key === 'Escape' && this.isOpen) {
            event.preventDefault();
            event.stopPropagation();
            this.close({ restoreFocus: true });
            return;
        }
        if (key === 'Tab') {
            this.close();
            return;
        }
        if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End') {
            event.preventDefault();
            if (!this.isOpen) this.open();
            if (key === 'Home') this.#setActiveIndex(0);
            else if (key === 'End') this.#setActiveIndex(this.options.length - 1);
            else this.#moveActiveIndex(key === 'ArrowDown' ? 1 : -1);
            return;
        }
        if (key === 'Enter' || key === ' ') {
            event.preventDefault();
            if (!this.isOpen) this.open();
            else this.#selectIndex(this.activeIndex);
            return;
        }
        if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            this.#handleTypeahead(key);
        }
    }

    #handleOptionClick(event) {
        event.preventDefault();
        event.stopPropagation();
        this.#selectIndex(Number(event.currentTarget.dataset.index));
    }

    #handleDocumentPointerDown(event) {
        if (this.trigger?.contains(event.target) || this.listbox?.contains(event.target)) return;
        this.close();
    }

    #handleDocumentScroll(event) {
        if (this.listbox?.contains(event.target)) return;
        this.close();
    }

    #handleTypeahead(character) {
        this.typeahead += character.toLocaleLowerCase();
        this.window.clearTimeout(this.typeaheadTimer);
        this.typeaheadTimer = this.window.setTimeout(() => {
            this.typeahead = '';
        }, 650);

        if (!this.isOpen) this.open();
        const start = Math.max(0, this.activeIndex);
        const ordered = [
            ...this.options.slice(start + 1),
            ...this.options.slice(0, start + 1)
        ];
        const match = ordered.find(option => (
            option.querySelector('.yf-font-option-name')
                ?.textContent
                ?.trim()
                .toLocaleLowerCase()
                .startsWith(this.typeahead)
        ));
        if (match) this.#setActiveIndex(Number(match.dataset.index));
    }

    #moveActiveIndex(delta) {
        const length = this.options.length;
        const start = this.activeIndex >= 0 ? this.activeIndex : this.select.selectedIndex;
        this.#setActiveIndex((start + delta + length) % length);
    }

    #setActiveIndex(index) {
        if (!Number.isInteger(index) || index < 0 || index >= this.options.length) return;

        this.activeIndex = index;
        this.options.forEach((option, optionIndex) => {
            option.classList.toggle('is-active', optionIndex === index);
        });
        const activeOption = this.options[index];
        this.trigger.setAttribute('aria-activedescendant', activeOption.id);
        activeOption.scrollIntoView?.({ block: 'nearest' });
    }

    #selectIndex(index) {
        if (!Number.isInteger(index) || index < 0 || index >= this.select.options.length) return;

        const changed = this.select.selectedIndex !== index;
        this.select.selectedIndex = index;
        this.#syncSelection();
        this.close({ restoreFocus: true });
        if (changed) {
            this.select.dispatchEvent(new this.window.Event('change', { bubbles: true }));
        }
    }

    #syncSelection() {
        const selectedIndex = Math.max(0, this.select.selectedIndex);
        const nativeOption = this.select.options[selectedIndex];
        if (!nativeOption || !this.value) return;

        this.value.textContent = nativeOption.textContent?.trim() || nativeOption.value;
        this.value.style.fontFamily = fontPreviewStack(nativeOption.value);
        this.options?.forEach((option, index) => {
            option.setAttribute('aria-selected', index === selectedIndex ? 'true' : 'false');
            option.classList.toggle('is-selected', index === selectedIndex);
        });
        this.activeIndex = selectedIndex;
    }

    #positionListbox() {
        const rect = this.trigger.getBoundingClientRect();
        const viewportWidth = Number(this.window.innerWidth) || 1280;
        const viewportHeight = Number(this.window.innerHeight) || 720;
        const margin = 12;
        const gap = 6;
        const availableWidth = Math.max(0, viewportWidth - margin * 2);
        const width = Math.min(
            Math.max(250, rect.width),
            availableWidth
        );
        const viewportMaxHeight = Math.max(0, viewportHeight - margin * 2);

        this.listbox.style.width = `${Math.round(width)}px`;
        this.listbox.style.left = `${Math.round(Math.max(
            margin,
            Math.min(rect.left, viewportWidth - width - margin)
        ))}px`;
        this.listbox.style.maxHeight = `${Math.round(viewportMaxHeight)}px`;
        this.listbox.style.top = `${Math.round(rect.bottom + gap)}px`;

        const listboxRect = this.listbox.getBoundingClientRect();
        const spaceBelow = Math.max(0, viewportHeight - rect.bottom - margin - gap);
        const spaceAbove = Math.max(0, rect.top - margin - gap);
        if (listboxRect.height > spaceBelow && spaceAbove > spaceBelow) {
            const fittedHeight = Math.min(listboxRect.height, spaceAbove, viewportMaxHeight);
            this.listbox.style.top = `${Math.round(Math.max(
                margin,
                rect.top - fittedHeight - gap
            ))}px`;
            this.listbox.style.maxHeight = `${Math.round(Math.min(spaceAbove, viewportMaxHeight))}px`;
        } else {
            this.listbox.style.maxHeight = `${Math.round(Math.min(spaceBelow, viewportMaxHeight))}px`;
        }
    }
}

export const sceneNavigationFontStack = fontPreviewStack;
export const SceneNavigationFontChooser = FontPreviewChooser;
