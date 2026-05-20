/**
 * Message classification helpers for chat styling policy and future renderers.
 * @module your-flavor/message-classifier
 */

import { MESSAGE_STYLING_POLICY_IDS } from './constants.js';

export const MESSAGE_CLASSIFICATION_TYPES = Object.freeze({
    SIMPLE: 'simple',
    ROLL: 'roll',
    ITEM_CARD: 'item-card',
    SYSTEM_CARD: 'system-card',
    UNSUPPORTED_COMPLEX: 'unsupported-complex'
});

export const MESSAGE_SAFE_FALLBACKS = Object.freeze({
    OUTER_ONLY: 'safe-outer-only'
});

const ROLL_SELECTORS = [
    '.dice-roll',
    '.dice-result',
    '.dice-formula',
    '.dice-total',
    '.dice-tooltip',
    '.dice-rolls',
    '.inline-roll',
    '.inline-result',
    '.ability-check',
    '.skill-check',
    '.saving-throw',
    '.attack-roll',
    '.damage-roll'
];

const FIRST_CLASS_CARD_SYSTEM_IDS = new Set(['dnd5e', 'pf2e', 'generic']);

const ITEM_CARD_SELECTORS = [
    '.item-card',
    '.yf-preview-item-card',
    '.dnd5e.item-card',
    '.dnd5e.chat-card.item-card',
    '.dnd5e .item-card',
    '.dnd5e .card-header',
    '.pf2e.item-card'
];

const DND5E_SYSTEM_CARD_SELECTORS = [
    '.activation-card',
    '.bastion-card',
    '.order-card',
    '.request-card',
    '.rest-card',
    '.turn-card'
];

const SYSTEM_CARD_SELECTORS = [
    '.system-card',
    '.yf-preview-system-card',
    '.dnd5e.chat-card',
    '.dnd5e .chat-card',
    '.pf2e.chat-card',
    '.pf2e.action-card',
    '.pf2e.spell-card',
    ...DND5E_SYSTEM_CARD_SELECTORS
];

const UNKNOWN_CARD_SELECTORS = [
    '.chat-card',
    '.card-header',
    '.card-content',
    '.card-buttons'
];

const UNSUPPORTED_SYSTEM_SELECTORS = [
    '.swade',
    '.wfrp4e',
    '.coc7'
];

const COMPLEX_CONTENT_SELECTORS = [
    'table',
    'form',
    'button',
    'input',
    'select',
    'textarea',
    '.flexrow',
    '.flexcol'
];

/**
 * Classify a Foundry chat message into the coarse groups needed by P6.
 * @param {ChatMessage|Object} message
 * @param {HTMLElement|Object} html
 * @returns {Object}
 */
export function classifyChatMessage(message, html) {
    if (!html?.querySelector) {
        return buildClassification(MESSAGE_CLASSIFICATION_TYPES.UNSUPPORTED_COMPLEX, {
            supported: false,
            reason: 'missing-html'
        });
    }

    const messageContent = html.querySelector('.message-content');
    if (!messageContent?.querySelector) {
        return buildClassification(MESSAGE_CLASSIFICATION_TYPES.UNSUPPORTED_COMPLEX, {
            supported: false,
            reason: 'missing-message-content'
        });
    }

    const systemId = detectSystemId(message, html);
    const flags = message?.flags || {};
    const reasons = [];

    if (matchesAny(html, UNSUPPORTED_SYSTEM_SELECTORS)) {
        reasons.push('unsupported-system-marker');
        return buildSafeFallbackClassification({ systemId, reasons });
    }

    if (matchesAny(html, ITEM_CARD_SELECTORS)) {
        reasons.push('item-card-marker');
        if (isUnknownCardSystem(systemId)) {
            return buildSafeFallbackClassification({ systemId, reasons });
        }
        return buildClassification(MESSAGE_CLASSIFICATION_TYPES.ITEM_CARD, {
            systemId,
            reasons,
            cardType: detectCardType(message, html, MESSAGE_CLASSIFICATION_TYPES.ITEM_CARD, systemId)
        });
    }

    if (matchesAny(html, SYSTEM_CARD_SELECTORS)) {
        reasons.push('system-card-marker');
        if (isUnknownCardSystem(systemId)) {
            return buildSafeFallbackClassification({ systemId, reasons });
        }
        return buildClassification(MESSAGE_CLASSIFICATION_TYPES.SYSTEM_CARD, {
            systemId,
            reasons,
            cardType: detectCardType(message, html, MESSAGE_CLASSIFICATION_TYPES.SYSTEM_CARD, systemId)
        });
    }

    if (matchesAny(html, UNKNOWN_CARD_SELECTORS)) {
        reasons.push('unknown-card-marker');
        return buildSafeFallbackClassification({ systemId, reasons });
    }

    if (isRollMessage(message, html)) {
        reasons.push('roll-marker');
        return buildClassification(MESSAGE_CLASSIFICATION_TYPES.ROLL, { systemId, reasons });
    }

    if (hasItemCardFlags(flags)) {
        reasons.push('item-card-flag');
        return buildClassification(MESSAGE_CLASSIFICATION_TYPES.ITEM_CARD, {
            systemId,
            reasons,
            cardType: detectCardType(message, html, MESSAGE_CLASSIFICATION_TYPES.ITEM_CARD, systemId)
        });
    }

    if (hasSystemCardFlags(flags)) {
        reasons.push('system-card-flag');
        return buildClassification(MESSAGE_CLASSIFICATION_TYPES.SYSTEM_CARD, {
            systemId,
            reasons,
            cardType: detectCardType(message, html, MESSAGE_CLASSIFICATION_TYPES.SYSTEM_CARD, systemId)
        });
    }

    if (matchesAny(messageContent, COMPLEX_CONTENT_SELECTORS)) {
        reasons.push('complex-content');
        return buildSafeFallbackClassification({ systemId, reasons });
    }

    return buildClassification(MESSAGE_CLASSIFICATION_TYPES.SIMPLE, { systemId });
}

function buildSafeFallbackClassification({ systemId = null, reasons = [] } = {}) {
    return buildClassification(MESSAGE_CLASSIFICATION_TYPES.UNSUPPORTED_COMPLEX, {
        supported: false,
        safeFallback: MESSAGE_SAFE_FALLBACKS.OUTER_ONLY,
        systemId,
        reasons
    });
}

/**
 * Decide if a classification can be styled under a policy.
 * @param {Object} classification
 * @param {string} policy
 * @returns {boolean}
 */
export function canStyleMessageClassification(classification, policy) {
    if (!classification?.supported) {
        return canApplySafeFallbackClassification(classification, policy);
    }

    switch (policy) {
        case MESSAGE_STYLING_POLICY_IDS.SIMPLE_ROLLS:
            return classification.isSimple || classification.isRoll;
        case MESSAGE_STYLING_POLICY_IDS.SIMPLE_CARDS:
            return classification.isSimple || classification.isCard;
        case MESSAGE_STYLING_POLICY_IDS.SUPPORTED_FIXTURES:
            return classification.isSimple || classification.isRoll || classification.isCard;
        case MESSAGE_STYLING_POLICY_IDS.SIMPLE_ONLY:
        default:
            return classification.isSimple;
    }
}

/**
 * Decide if a complex unsupported card can receive the safe outer-only fallback.
 * @param {Object} classification
 * @param {string} policy
 * @returns {boolean}
 */
export function canApplySafeFallbackClassification(classification, policy) {
    if (!usesSafeFallbackClassification(classification)) return false;
    return policy === MESSAGE_STYLING_POLICY_IDS.SIMPLE_CARDS
        || policy === MESSAGE_STYLING_POLICY_IDS.SUPPORTED_FIXTURES;
}

/**
 * @param {Object} classification
 * @returns {boolean}
 */
export function usesSafeFallbackClassification(classification) {
    return classification?.safeFallback === MESSAGE_SAFE_FALLBACKS.OUTER_ONLY;
}

/**
 * @param {ChatMessage|Object} message
 * @param {HTMLElement|Object} html
 * @returns {boolean}
 */
export function isRollMessage(message, html) {
    return Boolean(
        message?.isRoll
        || message?.rolls?.length
        || matchesAny(html, ROLL_SELECTORS)
    );
}

function buildClassification(type, {
    supported = true,
    systemId = null,
    cardType = null,
    reason = null,
    reasons = [],
    safeFallback = null
} = {}) {
    const reasonList = reason ? [reason, ...reasons] : [...reasons];
    return {
        type,
        supported,
        safeFallback,
        systemId,
        cardType,
        reasons: [...new Set(reasonList)],
        isSimple: type === MESSAGE_CLASSIFICATION_TYPES.SIMPLE,
        isRoll: type === MESSAGE_CLASSIFICATION_TYPES.ROLL,
        isCard: type === MESSAGE_CLASSIFICATION_TYPES.ITEM_CARD
            || type === MESSAGE_CLASSIFICATION_TYPES.SYSTEM_CARD,
        isItemCard: type === MESSAGE_CLASSIFICATION_TYPES.ITEM_CARD,
        isSystemCard: type === MESSAGE_CLASSIFICATION_TYPES.SYSTEM_CARD,
        isUnsupportedComplex: type === MESSAGE_CLASSIFICATION_TYPES.UNSUPPORTED_COMPLEX,
        isSafeFallback: safeFallback === MESSAGE_SAFE_FALLBACKS.OUTER_ONLY
    };
}

function detectCardType(message, html, classificationType, systemId) {
    const flags = message?.flags || {};

    if (systemId === 'dnd5e') {
        if (
            hasItemCardFlags(flags)
            || matchesAny(html, ['.item-card', '.dnd5e.chat-card.item-card', '.dnd5e .item-card'])
        ) {
            return 'itemCards';
        }
        if (
            classificationType === MESSAGE_CLASSIFICATION_TYPES.SYSTEM_CARD
            || matchesAny(html, DND5E_SYSTEM_CARD_SELECTORS)
            || matchesAny(html, ['.dnd5e.chat-card', '.dnd5e .chat-card'])
        ) {
            return 'abilityCards';
        }
        return 'abilityCards';
    }

    if (systemId === 'pf2e') {
        if (
            matchesAny(html, ['.spell-card'])
            || Boolean(flags.pf2e?.casting || flags.pf2e?.spell)
        ) {
            return 'spellCards';
        }
        return 'actionCards';
    }

    return 'generic';
}

function hasItemCardFlags(flags = {}) {
    return Boolean(
        flags.dnd5e?.item
        || flags.dnd5e?.spell
        || flags.dnd5e?.itemData
        || flags.pf2e?.item
    );
}

function hasSystemCardFlags(flags = {}) {
    return Boolean(
        flags.dnd5e
        || flags.pf2e?.origin
        || flags.pf2e?.casting
        || flags.pf2e?.context
    );
}

function detectSystemId(message, html) {
    const flagIds = ['dnd5e', 'pf2e', 'swade', 'wfrp4e', 'coc7'];
    const flags = message?.flags || {};
    for (const id of flagIds) {
        if (flags[id]) return id;
    }

    for (const id of flagIds) {
        if (matchesAny(html, [`.${id}`])) return id;
    }

    return globalThis.game?.system?.id ?? null;
}

function matchesAny(element, selectors) {
    if (!element?.querySelector) return false;
    return selectors.some(selector => Boolean(element.querySelector(selector)));
}

function isUnknownCardSystem(systemId) {
    return Boolean(systemId && !FIRST_CLASS_CARD_SYSTEM_IDS.has(systemId));
}
