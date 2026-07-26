/**
 * Rolls tab presentation model.
 * Keeps the redesign's display concerns separate from persistence and runtime rendering.
 * @module your-flavor/ui/rolls-tab-controller
 */

export const ROLL_PREVIEW_STATE_IDS = Object.freeze([
    'basic',
    'breakdown',
    'critical',
    'failure'
]);

export const ROLL_CONTROL_PATHS = Object.freeze([
    'rolls.enabled',
    'rolls.surfaces.formula.background',
    'rolls.surfaces.formula.textColor',
    'rolls.surfaces.formula.borderColor',
    'rolls.surfaces.terms.background',
    'rolls.surfaces.terms.textColor',
    'rolls.surfaces.tooltip.background',
    'rolls.surfaces.tooltip.textColor',
    'rolls.surfaces.total.background',
    'rolls.surfaces.total.textColor',
    'rolls.surfaces.total.borderColor',
    'rolls.surfaces.critical.textColor',
    'rolls.surfaces.critical.accentColor',
    'rolls.surfaces.failure.textColor',
    'rolls.surfaces.failure.accentColor',
    'rolls.systems.dnd5e.enabled',
    'rolls.systems.pf2e.enabled',
    'rolls.systems.generic.enabled'
]);

export const ROLL_CONTROL_SEARCH_ENTRIES = Object.freeze([
    { name: 'rolls.enabled', labelKey: 'YOUR_FLAVOR.Config.RollTabs.Enabled' },
    { name: 'rolls.surfaces.formula.background', labelKey: 'YOUR_FLAVOR.Config.RollTabs.Background' },
    { name: 'rolls.surfaces.formula.textColor', labelKey: 'YOUR_FLAVOR.Config.RollTabs.Text' },
    { name: 'rolls.surfaces.formula.borderColor', labelKey: 'YOUR_FLAVOR.Config.RollTabs.Border' },
    { name: 'rolls.surfaces.terms.background', labelKey: 'YOUR_FLAVOR.Config.RollTabs.Background' },
    { name: 'rolls.surfaces.terms.textColor', labelKey: 'YOUR_FLAVOR.Config.RollTabs.Text' },
    { name: 'rolls.surfaces.tooltip.background', labelKey: 'YOUR_FLAVOR.Config.RollTabs.Background' },
    { name: 'rolls.surfaces.tooltip.textColor', labelKey: 'YOUR_FLAVOR.Config.RollTabs.Text' },
    { name: 'rolls.surfaces.total.background', labelKey: 'YOUR_FLAVOR.Config.RollTabs.Background' },
    { name: 'rolls.surfaces.total.textColor', labelKey: 'YOUR_FLAVOR.Config.RollTabs.Text' },
    { name: 'rolls.surfaces.total.borderColor', labelKey: 'YOUR_FLAVOR.Config.RollTabs.Border' },
    { name: 'rolls.surfaces.critical.textColor', labelKey: 'YOUR_FLAVOR.Config.RollTabs.Text' },
    { name: 'rolls.surfaces.critical.accentColor', labelKey: 'YOUR_FLAVOR.Config.RollTabs.Accent' },
    { name: 'rolls.surfaces.failure.textColor', labelKey: 'YOUR_FLAVOR.Config.RollTabs.Text' },
    { name: 'rolls.surfaces.failure.accentColor', labelKey: 'YOUR_FLAVOR.Config.RollTabs.Accent' },
    { name: 'rolls.systems.dnd5e.enabled', labelKey: 'YOUR_FLAVOR.Config.RollsDesign.SystemDnd5e' },
    { name: 'rolls.systems.pf2e.enabled', labelKey: 'YOUR_FLAVOR.Config.RollsDesign.SystemPf2e' },
    { name: 'rolls.systems.generic.enabled', labelKey: 'YOUR_FLAVOR.Config.RollTabs.Generic' }
]);

const SURFACE_DEFINITIONS = Object.freeze([
    {
        id: 'formula',
        labelKey: 'YOUR_FLAVOR.Config.RollTabs.Formula',
        fields: [
            ['background', 'YOUR_FLAVOR.Config.RollTabs.Background'],
            ['textColor', 'YOUR_FLAVOR.Config.RollTabs.Text'],
            ['borderColor', 'YOUR_FLAVOR.Config.RollTabs.Border']
        ]
    },
    {
        id: 'terms',
        labelKey: 'YOUR_FLAVOR.Config.RollTabs.Terms',
        fields: [
            ['background', 'YOUR_FLAVOR.Config.RollTabs.Background'],
            ['textColor', 'YOUR_FLAVOR.Config.RollTabs.Text']
        ]
    },
    {
        id: 'tooltip',
        labelKey: 'YOUR_FLAVOR.Config.RollsDesign.TooltipBreakdown',
        fields: [
            ['background', 'YOUR_FLAVOR.Config.RollTabs.Background'],
            ['textColor', 'YOUR_FLAVOR.Config.RollTabs.Text']
        ]
    },
    {
        id: 'total',
        labelKey: 'YOUR_FLAVOR.Config.RollTabs.Total',
        fields: [
            ['background', 'YOUR_FLAVOR.Config.RollTabs.Background'],
            ['textColor', 'YOUR_FLAVOR.Config.RollTabs.Text'],
            ['borderColor', 'YOUR_FLAVOR.Config.RollTabs.Border']
        ]
    }
]);

const OUTCOME_DEFINITIONS = Object.freeze([
    {
        id: 'critical',
        labelKey: 'YOUR_FLAVOR.Config.RollsDesign.CriticalSuccess',
        fields: [
            ['textColor', 'YOUR_FLAVOR.Config.RollTabs.Text'],
            ['accentColor', 'YOUR_FLAVOR.Config.RollTabs.Accent']
        ]
    },
    {
        id: 'failure',
        labelKey: 'YOUR_FLAVOR.Config.RollsDesign.FailureFumble',
        fields: [
            ['textColor', 'YOUR_FLAVOR.Config.RollTabs.Text'],
            ['accentColor', 'YOUR_FLAVOR.Config.RollTabs.Accent']
        ]
    }
]);

const SYSTEM_DEFINITIONS = Object.freeze([
    {
        id: 'dnd5e',
        label: 'D&D 5e'
    },
    {
        id: 'pf2e',
        label: 'PF2e'
    },
    {
        id: 'generic',
        labelKey: 'YOUR_FLAVOR.Config.RollTabs.Generic'
    }
]);

export class FlavorRollsTabController {
    constructor({ localize, tokenStatusLabel, tokenStatusTitle, colorInputFromCss }) {
        this.localize = localize;
        this.tokenStatusLabel = tokenStatusLabel;
        this.tokenStatusTitle = tokenStatusTitle;
        this.colorInputFromCss = colorInputFromCss;
    }

    build(config = {}, {
        savedConfig = config,
        activePreviewState = 'breakdown',
        currentSystemId = 'generic',
        profileName = '',
        layoutLabel = '',
        isDirty = false
    } = {}) {
        const rollConfig = config.rolls ?? {};
        const fallbackColors = this.#buildFallbackColors(config);
        const previewState = ROLL_PREVIEW_STATE_IDS.includes(activePreviewState)
            ? activePreviewState
            : 'breakdown';
        const currentSystemGroup = this.#getSystemGroup(currentSystemId);
        const surfaces = SURFACE_DEFINITIONS.map(surface => (
            this.#buildSurface(surface, rollConfig, fallbackColors)
        ));

        return {
            enabled: rollConfig.enabled !== false,
            enabledTitle: this.localize('YOUR_FLAVOR.Config.RollTabs.EnabledTitle'),
            surfaces,
            surfaceColumns: [
                {
                    id: 'primary',
                    surfaces: [surfaces[0], surfaces[2]]
                },
                {
                    id: 'secondary',
                    surfaces: [surfaces[1], surfaces[3]]
                }
            ],
            outcomes: OUTCOME_DEFINITIONS.map(surface => this.#buildSurface(surface, rollConfig, fallbackColors)),
            systems: SYSTEM_DEFINITIONS.map(system => ({
                ...system,
                label: system.label ?? this.localize(system.labelKey),
                enabled: rollConfig.systems?.[system.id]?.enabled !== false,
                isCurrent: system.id === currentSystemGroup
            })),
            activePreviewState: previewState,
            preview: this.#buildPreviewStates(previewState),
            context: {
                profileName,
                layoutLabel,
                isDirty
            },
            savedLayout: savedConfig?.layout ?? 'none',
            draftLayout: config?.layout ?? 'none'
        };
    }

    #buildSurface(surface, rollConfig, fallbackColors) {
        return {
            ...surface,
            label: this.localize(surface.labelKey),
            fields: surface.fields.map(([field, labelKey]) => {
                const path = `rolls.surfaces.${surface.id}.${field}`;
                const value = rollConfig.surfaces?.[surface.id]?.[field] ?? null;
                const isCustom = isHexColor(value);
                const resolvedColor = isCustom ? value : fallbackColors[`${surface.id}.${field}`];

                return {
                    field,
                    path,
                    label: this.localize(labelKey),
                    value: isCustom
                        ? value
                        : this.colorInputFromCss(resolvedColor, '#c9a227'),
                    displayColor: resolvedColor,
                    statusClass: isCustom ? 'is-custom' : 'is-default',
                    statusLabel: isCustom
                        ? this.tokenStatusLabel('custom')
                        : this.localize('YOUR_FLAVOR.Config.RollTabs.Theme'),
                    statusTitle: isCustom
                        ? this.tokenStatusTitle('custom')
                        : this.localize('YOUR_FLAVOR.Config.RollTabs.ThemeTitle'),
                    resetTitle: this.localize('YOUR_FLAVOR.Config.RollTabs.ResetToTheme')
                };
            })
        };
    }

    #buildPreviewStates(activePreviewState) {
        return ROLL_PREVIEW_STATE_IDS.map(id => ({
            id,
            isActive: id === activePreviewState,
            label: this.localize(`YOUR_FLAVOR.Config.RollsDesign.Preview${capitalize(id)}`),
            isBasic: id === 'basic',
            isBreakdown: id === 'breakdown',
            isCritical: id === 'critical',
            isFailure: id === 'failure'
        }));
    }

    #buildFallbackColors(config) {
        const customizations = config?.customizations ?? {};
        const borderColor = this.colorInputFromCss(customizations.borderColor, '#c9a227');
        const backgroundColor = customizations.backgroundColor || '#141210';
        const textColor = this.colorInputFromCss(customizations.textColor, '#e8dcc8');
        const nameColor = this.colorInputFromCss(customizations.nameColor, borderColor);

        return {
            'formula.background': hexToRgba(borderColor, 0.16),
            'formula.textColor': nameColor,
            'formula.borderColor': borderColor,
            'terms.background': hexToRgba(borderColor, 0.12),
            'terms.textColor': textColor,
            'tooltip.background': backgroundColor,
            'tooltip.textColor': textColor,
            'total.background': hexToRgba(borderColor, 0.22),
            'total.textColor': nameColor,
            'total.borderColor': borderColor,
            'critical.textColor': '#8ff0a4',
            'critical.accentColor': '#36b85f',
            'failure.textColor': '#ff9d9d',
            'failure.accentColor': '#d94b4b'
        };
    }

    #getSystemGroup(systemId) {
        if (systemId === 'dnd5e' || systemId === 'pf2e') return systemId;
        return 'generic';
    }
}

function isHexColor(value) {
    return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

function hexToRgba(value, alpha) {
    const color = String(value || '').trim();
    if (!/^#[0-9a-f]{6}$/i.test(color)) return color;
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function capitalize(value) {
    return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
