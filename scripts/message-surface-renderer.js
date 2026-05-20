/**
 * Internal chat surface renderers for supported roll and card content.
 * These helpers mark known nested surfaces so CSS can style them with v2
 * tokens instead of relying only on the outer .chat-message.yf-card wrapper.
 */

import { MESSAGE_CLASSIFICATION_TYPES } from './message-classifier.js';

const SURFACE_CLASS_PREFIXES = [
    'yf-surface-',
    'yf-roll-surface-',
    'yf-card-surface-'
];

const ROLL_SURFACES = Object.freeze({
    formula: [
        '.dice-formula',
        '.roll-formula'
    ],
    terms: [
        '.dice-rolls',
        '.dice-rolls .roll',
        '.dice .part-formula',
        '.dice .part-total',
        '.inline-roll',
        '.inline-result',
        '.roll.die'
    ],
    tooltip: [
        '.dice-tooltip',
        '.dice-tooltip .tooltip-part'
    ],
    total: [
        '.dice-total',
        '.dice-result .total',
        '.roll-total'
    ],
    critical: [
        '.dice-total.critical',
        '.dice-total.success',
        '.roll.critical',
        '.roll.success'
    ],
    failure: [
        '.dice-total.failure',
        '.dice-total.fumble',
        '.roll.failure',
        '.roll.fumble',
        '.roll.min'
    ]
});

const CARD_SURFACES = Object.freeze({
    itemTitle: [
        '.card-header',
        '.item-card .card-header',
        '.chat-card .card-header',
        '.action-card header',
        '.spell-card header',
        '.yf-preview-item-card .card-header',
        '.yf-preview-system-card header'
    ],
    itemBody: [
        '.card-content',
        '.card-description',
        '.card-footer',
        '.pf2e.chat-card footer',
        '.item-card .description',
        '.chat-card .description',
        '.action-card .content',
        '.spell-card .content',
        '.yf-preview-item-card .card-content',
        '.yf-preview-system-card p'
    ],
    buttons: [
        '.card-buttons',
        '.card-buttons button',
        '.chat-card button',
        '.item-card button',
        'button[data-action]'
    ],
    tables: [
        '.chat-card table',
        '.item-card table',
        '.system-card table',
        '.yf-preview-system-card table',
        '.yf-preview-system-card th',
        '.yf-preview-system-card td'
    ]
});

/**
 * Mark supported nested roll/card surfaces.
 * @param {HTMLElement} root
 * @param {Object} classification
 * @param {Object} [options]
 * @param {boolean} [options.rolls=true]
 * @param {boolean} [options.cards=true]
 * @returns {{rollSurfaces: number, cardSurfaces: number}}
 */
export function renderMessageSurfaces(root, classification = {}, options = {}) {
    const result = { rollSurfaces: 0, cardSurfaces: 0 };
    if (!root?.querySelectorAll) return result;

    clearMessageSurfaces(root);

    if (options.rolls !== false && isRollClassification(classification)) {
        result.rollSurfaces = renderSurfaceGroup(root, 'roll', ROLL_SURFACES);
    }

    if (options.cards !== false && isCardClassification(classification)) {
        result.cardSurfaces = renderSurfaceGroup(root, 'card', CARD_SURFACES);
    }

    root.classList.toggle('yf-has-roll-surfaces', result.rollSurfaces > 0);
    root.classList.toggle('yf-has-card-surfaces', result.cardSurfaces > 0);

    return result;
}

/**
 * Remove markers added by renderMessageSurfaces.
 * @param {HTMLElement} root
 */
export function clearMessageSurfaces(root) {
    if (!root?.querySelectorAll) return;

    for (const element of [root, ...root.querySelectorAll('[data-yf-surface]')]) {
        removeSurfaceClasses(element);
        delete element.dataset.yfSurface;
        delete element.dataset.yfSurfaceRole;
    }

    root.classList.remove('yf-has-roll-surfaces', 'yf-has-card-surfaces');
}

function renderSurfaceGroup(root, role, surfaceMap) {
    let marked = 0;
    for (const [surface, selectors] of Object.entries(surfaceMap)) {
        for (const element of queryAll(root, selectors)) {
            markSurface(element, role, surface);
            marked++;
        }
    }
    return marked;
}

function markSurface(element, role, surface) {
    if (!element?.classList) return;

    element.classList.add(
        'yf-surface',
        `yf-surface-${surface}`,
        `yf-${role}-surface`,
        `yf-${role}-surface-${surface}`
    );
    element.dataset.yfSurface = `${role}.${surface}`;
    element.dataset.yfSurfaceRole = role;
}

function queryAll(root, selectors) {
    const elements = new Set();
    for (const selector of selectors) {
        try {
            root.querySelectorAll(selector).forEach(element => elements.add(element));
        } catch (error) {
            // Ignore selector support differences across Foundry/browser versions.
        }
    }
    return elements;
}

function removeSurfaceClasses(element) {
    if (!element?.classList) return;
    const classes = Array.from(element.classList).filter(className => (
        className === 'yf-surface'
        || className === 'yf-roll-surface'
        || className === 'yf-card-surface'
        || SURFACE_CLASS_PREFIXES.some(prefix => className.startsWith(prefix))
    ));
    if (classes.length > 0) element.classList.remove(...classes);
}

function isRollClassification(classification) {
    return Boolean(
        classification?.isRoll
        || classification?.type === MESSAGE_CLASSIFICATION_TYPES.ROLL
    );
}

function isCardClassification(classification) {
    return Boolean(
        classification?.isCard
        || classification?.isItemCard
        || classification?.isSystemCard
        || classification?.type === MESSAGE_CLASSIFICATION_TYPES.ITEM_CARD
        || classification?.type === MESSAGE_CLASSIFICATION_TYPES.SYSTEM_CARD
    );
}
