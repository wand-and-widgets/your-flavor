/**
 * Pure presentation helpers for the Icons tab.
 *
 * The registry and FoundryCustomizer remain authoritative for discovery and
 * application. These helpers only describe an already-selected registry entry
 * against saved and working icon configurations.
 */

export const ICON_OVERRIDE_COLOR_FIELDS = Object.freeze([
    'color',
    'hoverColor',
    'activeColor',
    'backgroundColor',
    'hoverBackgroundColor',
    'activeBackgroundColor'
]);

export function iconOverrideHasCustomization(override = null) {
    return Boolean(override && (
        override.inheritGroup === false
        || override.iconClass
        || ICON_OVERRIDE_COLOR_FIELDS.some(field => Boolean(override[field]))
        || override.hidden === true
    ));
}

export function canHideIconEntry(entry = null) {
    if (!entry) return false;
    return Boolean(
        entry.dynamic
        || entry.supportsIconClass !== false
        || (entry.styleSelectors ?? []).some(selector => String(selector).includes('::'))
    );
}

export function buildIconSelectionIdentity(entry = null, {
    areaLabel = null,
    groupLabel = null
} = {}) {
    if (!entry?.id) return null;
    return {
        id: entry.id,
        label: entry.label ?? entry.id,
        area: entry.area,
        areaLabel: areaLabel ?? entry.area,
        groupId: entry.defaultGroup,
        groupLabel: groupLabel ?? entry.defaultGroup,
        dynamic: Boolean(entry.dynamic || String(entry.id).startsWith('dynamic.'))
    };
}

export function getEffectiveIconClass(entry = null, iconConfig = {}) {
    if (!entry) return 'fas fa-icons';
    const override = iconConfig?.overrides?.[entry.id] ?? null;
    if (
        entry.supportsIconClass !== false
        && override?.inheritGroup === false
        && typeof override.iconClass === 'string'
        && override.iconClass.trim()
    ) {
        return override.iconClass.trim();
    }
    return entry.iconClass || override?.baseIconClass || 'fas fa-icons';
}

export function buildIconSavedDraftComparison(entry = null, {
    savedIconConfig = {},
    draftIconConfig = {},
    savedColors = {},
    draftColors = {}
} = {}) {
    if (!entry?.id) return null;

    const savedOverride = savedIconConfig?.overrides?.[entry.id] ?? null;
    const draftOverride = draftIconConfig?.overrides?.[entry.id] ?? null;
    const savedIconClass = getEffectiveIconClass(entry, savedIconConfig);
    const draftIconClass = getEffectiveIconClass(entry, draftIconConfig);
    const savedHidden = Boolean(savedOverride?.hidden);
    const draftHidden = Boolean(draftOverride?.hidden);
    const savedInheritGroup = savedOverride?.inheritGroup ?? true;
    const draftInheritGroup = draftOverride?.inheritGroup ?? true;
    const colorsChanged = !sameIconColorSet(savedColors, draftColors);

    return {
        savedIconClass,
        draftIconClass,
        savedHidden,
        draftHidden,
        savedInheritGroup,
        draftInheritGroup,
        savedHasOverride: iconOverrideHasCustomization(savedOverride),
        draftHasOverride: iconOverrideHasCustomization(draftOverride),
        glyphChanged: savedIconClass !== draftIconClass,
        visibilityChanged: savedHidden !== draftHidden,
        inheritanceChanged: savedInheritGroup !== draftInheritGroup,
        colorsChanged,
        hasDraftDifference: !sameIconOverride(savedOverride, draftOverride) || colorsChanged
    };
}

function sameIconOverride(left = null, right = null) {
    const pick = override => ({
        ...Object.fromEntries(ICON_OVERRIDE_COLOR_FIELDS.map(field => [field, override?.[field] ?? null])),
        inheritGroup: override?.inheritGroup ?? true,
        iconClass: override?.iconClass ?? null,
        hidden: Boolean(override?.hidden)
    });
    return JSON.stringify(pick(left)) === JSON.stringify(pick(right));
}

function sameIconColorSet(left = {}, right = {}) {
    const pick = colors => Object.fromEntries(
        ICON_OVERRIDE_COLOR_FIELDS.map(field => [field, colors?.[field] ?? null])
    );
    return JSON.stringify(pick(left)) === JSON.stringify(pick(right));
}
