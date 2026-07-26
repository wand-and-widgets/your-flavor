/**
 * Your Flavor Studio - Target Registry (P11-002)
 *
 * Declarative map of every clickable surface in the Studio UI. Each target
 * knows: how to highlight itself on the real Foundry DOM (selectors), which
 * config domain it edits, and its controls split into `essentials` (shown on
 * open) and `drawer` (the "all options" disclosure, preserving the full 4.0
 * power). This single structure feeds the contextual inspector, the global
 * control search and the parity manifest mapping.
 *
 * Control shape:
 *   { type, labelKey, path | segments, min?, max?, step?, unit?, options?,
 *     nullable?, format?, section? (via {sec: labelKey} rows in drawer) }
 *
 * - `path` is dot-notation inside the domain draft. When a key itself contains
 *   dots (icon override ids like "navigation.expand"), use `segments` instead —
 *   never dot-split those (see ICON_OVERRIDES_NOTES.md).
 * - `domain` is "chat" (workingConfig) or "foundry" (workingFoundryConfig).
 * - `format: "hex-in-rgba"` marks colors stored as rgba strings edited via hex.
 */

import {
    GOOGLE_FONTS,
    PAUSE_BAR_SHAPES,
    PAUSE_BLEND_MODES,
    PAUSE_EFFECTS,
    PAUSE_LABEL_PLACEMENTS,
    PAUSE_LABEL_WEIGHTS,
    PAUSE_MOTION_MODES,
    PAUSE_SYMBOL_FILTERS,
    PAUSE_VISUAL_MODES
} from '../../constants.js';
import { FOUNDRY_ICON_REGISTRY, ICON_GROUPS } from '../../icon-registry.js';

const L = key => `YOUR_FLAVOR.Studio.${key}`;

const enumOptions = list => list.map(entry => ({
    value: entry.id,
    labelKey: entry.labelKey ?? null,
    label: entry.label ?? null
}));

const fontOptions = () => GOOGLE_FONTS.map(font => ({ value: font.family, label: font.name }));

const BORDER_STYLE_OPTIONS = ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge']
    .map(value => ({ value, label: value }));

const color = (labelKey, path, extra = {}) => ({ type: 'color', labelKey: L(labelKey), path, ...extra });
const ncolor = (labelKey, path, extra = {}) => color(labelKey, path, { nullable: true, ...extra });
const range = (labelKey, path, min, max, unit = 'px', extra = {}) =>
    ({ type: 'range', labelKey: L(labelKey), path, min, max, unit, ...extra });
const toggle = (labelKey, path, extra = {}) => ({ type: 'toggle', labelKey: L(labelKey), path, ...extra });
const select = (labelKey, path, options, extra = {}) => ({ type: 'select', labelKey: L(labelKey), path, options, ...extra });
const text = (labelKey, path, extra = {}) => ({ type: 'text', labelKey: L(labelKey), path, ...extra });
const sec = labelKey => ({ sec: L(labelKey) });

/**
 * The registry. Order matters: it is the order shown in the "all areas" list.
 */
export const STUDIO_TARGETS = [
    /* ══════════ CHAT ══════════ */
    {
        id: 'chat-message',
        domain: 'chat',
        crumbKey: L('Crumb.Chat'),
        titleKey: L('Target.ChatMessage.Title'),
        descKey: L('Target.ChatMessage.Desc'),
        selectors: ['#chat-log .chat-message', '#chat .chat-message', '#chat-notifications .chat-message'],
        essentials: [
            { type: 'font', labelKey: L('Control.FontFamily'), path: 'customizations.fontFamily', options: fontOptions() },
            range('Control.FontSize', 'customizations.fontSize', 10, 24),
            color('Control.TextColor', 'customizations.textColor'),
            color('Control.Background', 'customizations.backgroundColor', { format: 'hex-in-rgba' })
        ],
        drawer: [
            sec('Section.BackgroundBorder'),
            range('Control.BackgroundOpacity', 'customizations.backgroundOpacity', 0, 100, '%'),
            color('Control.BorderColor', 'customizations.borderColor'),
            select('Control.BorderStyle', 'customizations.borderStyle', BORDER_STYLE_OPTIONS),
            range('Control.BorderWidth', 'customizations.borderWidth', 0, 8),
            range('Control.BorderRadius', 'customizations.borderRadius', 0, 50),
            range('Control.Padding', 'customizations.padding', 4, 30),
            sec('Section.Effects'),
            toggle('Control.GlowEnabled', 'customizations.glowEnabled'),
            color('Control.GlowColor', 'customizations.glowColor', { showIf: 'customizations.glowEnabled' }),
            range('Control.GlowIntensity', 'customizations.glowIntensity', 5, 25, 'px', { showIf: 'customizations.glowEnabled' }),
            toggle('Control.ShadowEnabled', 'customizations.shadowEnabled'),
            sec('Section.General'),
            toggle('Control.ChatEnabled', 'enabled'),
            { type: 'textarea', labelKey: L('Control.CustomHtml'), path: 'customHtml', gate: 'customHtml' }
        ]
    },
    {
        id: 'chat-header',
        domain: 'chat',
        crumbKey: L('Crumb.Chat'),
        titleKey: L('Target.ChatHeader.Title'),
        descKey: L('Target.ChatHeader.Desc'),
        selectors: ['#chat-log .chat-message .message-header', '#chat .chat-message .message-header'],
        essentials: [
            ncolor('Control.NameColor', 'customizations.nameColor'),
            ncolor('Control.TimestampColor', 'customizations.timestampColor')
        ],
        drawer: []
    },

    /* ══════════ ROLAGENS ══════════ */
    {
        id: 'roll-formula',
        domain: 'chat',
        crumbKey: L('Crumb.Rolls'),
        titleKey: L('Target.RollFormula.Title'),
        descKey: L('Target.RollFormula.Desc'),
        selectors: ['#chat-log .dice-formula', '#chat .dice-formula'],
        essentials: [
            ncolor('Control.Background', 'rolls.surfaces.formula.background'),
            ncolor('Control.TextColor', 'rolls.surfaces.formula.textColor'),
            ncolor('Control.BorderColor', 'rolls.surfaces.formula.borderColor')
        ],
        drawer: [
            sec('Section.General'),
            toggle('Control.RollsEnabled', 'rolls.enabled')
        ]
    },
    {
        id: 'roll-tooltip',
        domain: 'chat',
        crumbKey: L('Crumb.Rolls'),
        titleKey: L('Target.RollTooltip.Title'),
        descKey: L('Target.RollTooltip.Desc'),
        selectors: ['#chat-log .dice-tooltip', '#chat .dice-tooltip'],
        essentials: [
            ncolor('Control.Background', 'rolls.surfaces.tooltip.background'),
            ncolor('Control.TextColor', 'rolls.surfaces.tooltip.textColor')
        ],
        drawer: [
            sec('Section.RollTerms'),
            ncolor('Control.Background', 'rolls.surfaces.terms.background'),
            ncolor('Control.TextColor', 'rolls.surfaces.terms.textColor')
        ]
    },
    {
        id: 'roll-total',
        domain: 'chat',
        crumbKey: L('Crumb.Rolls'),
        titleKey: L('Target.RollTotal.Title'),
        descKey: L('Target.RollTotal.Desc'),
        selectors: ['#chat-log .dice-total', '#chat .dice-total'],
        essentials: [
            ncolor('Control.Background', 'rolls.surfaces.total.background'),
            ncolor('Control.TextColor', 'rolls.surfaces.total.textColor'),
            ncolor('Control.BorderColor', 'rolls.surfaces.total.borderColor')
        ],
        drawer: [
            sec('Section.RollOutcomes'),
            ncolor('Control.CriticalText', 'rolls.surfaces.critical.textColor'),
            ncolor('Control.CriticalAccent', 'rolls.surfaces.critical.accentColor'),
            ncolor('Control.FailureText', 'rolls.surfaces.failure.textColor'),
            ncolor('Control.FailureAccent', 'rolls.surfaces.failure.accentColor')
        ]
    },

    /* ══════════ CARDS ══════════ */
    {
        id: 'card-title',
        domain: 'chat',
        crumbKey: L('Crumb.Cards'),
        titleKey: L('Target.CardTitle.Title'),
        descKey: L('Target.CardTitle.Desc'),
        selectors: ['#chat-log .chat-card .card-header', '#chat .chat-card .card-header'],
        essentials: [
            ncolor('Control.Background', 'cards.surfaces.itemTitle.background'),
            ncolor('Control.TextColor', 'cards.surfaces.itemTitle.textColor'),
            ncolor('Control.Accent', 'cards.surfaces.itemTitle.accentColor')
        ],
        drawer: [
            sec('Section.General'),
            toggle('Control.CardsEnabled', 'cards.enabled')
        ]
    },
    {
        id: 'card-body',
        domain: 'chat',
        crumbKey: L('Crumb.Cards'),
        titleKey: L('Target.CardBody.Title'),
        descKey: L('Target.CardBody.Desc'),
        selectors: ['#chat-log .chat-card .card-content', '#chat .chat-card .card-content'],
        essentials: [
            ncolor('Control.Background', 'cards.surfaces.itemBody.background'),
            ncolor('Control.TextColor', 'cards.surfaces.itemBody.textColor')
        ],
        drawer: [
            sec('Section.CardTables'),
            ncolor('Control.TableOddRow', 'cards.surfaces.tables.oddRow'),
            ncolor('Control.TableEvenRow', 'cards.surfaces.tables.evenRow'),
            ncolor('Control.BorderColor', 'cards.surfaces.tables.borderColor')
        ]
    },
    {
        id: 'card-buttons',
        domain: 'chat',
        crumbKey: L('Crumb.Cards'),
        titleKey: L('Target.CardButtons.Title'),
        descKey: L('Target.CardButtons.Desc'),
        selectors: ['#chat-log .chat-card .card-buttons', '#chat .chat-card .card-buttons'],
        essentials: [
            ncolor('Control.Background', 'cards.surfaces.buttons.background'),
            ncolor('Control.TextColor', 'cards.surfaces.buttons.textColor'),
            ncolor('Control.BorderColor', 'cards.surfaces.buttons.borderColor')
        ],
        drawer: []
    },

    /* ══════════ FOUNDRY SHELL (GM) ══════════ */
    {
        id: 'foundry-theme',
        domain: 'foundry',
        gmOnly: true,
        crumbKey: L('Crumb.Foundry'),
        titleKey: L('Target.FoundryTheme.Title'),
        descKey: L('Target.FoundryTheme.Desc'),
        selectors: [],
        essentials: [
            ncolor('Control.ThemeFontColor', 'theme.fontColor'),
            ncolor('Control.ThemeAccent', 'theme.accentColor'),
            ncolor('Control.ThemeSurface', 'theme.surfaceBackground'),
            ncolor('Control.ThemeWindowBg', 'theme.windowBackground')
        ],
        drawer: [
            sec('Section.ThemeColors'),
            ncolor('Control.ThemeSecondaryFont', 'theme.secondaryFontColor'),
            ncolor('Control.ThemeWindowHeader', 'theme.windowHeaderBackground'),
            ncolor('Control.ThemeChatTint', 'theme.chatTint'),
            ncolor('Control.ThemeIconColor', 'theme.iconColor'),
            ncolor('Control.ThemeIconHover', 'theme.iconHoverColor'),
            ncolor('Control.ThemeScrollbar', 'theme.scrollbarColor'),
            sec('Section.ThemeFonts'),
            { type: 'font', labelKey: L('Control.InterfaceFont'), path: 'theme.interfaceFont', options: fontOptions() },
            { type: 'font', labelKey: L('Control.WindowFont'), path: 'theme.windowFont', options: fontOptions() },
            sec('Section.General'),
            toggle('Control.PreserveCustomIconColors', 'preserveCustomIconColors'),
            toggle('Control.PreserveCustomFonts', 'preserveCustomFonts'),
            toggle('Control.FoundryEnabled', 'enabled'),
            { type: 'textarea', labelKey: L('Control.CustomCss'), path: 'customCss' }
        ]
    },
    {
        id: 'scene-navigation',
        domain: 'foundry',
        gmOnly: true,
        crumbKey: L('Crumb.Foundry'),
        titleKey: L('Target.SceneNavigation.Title'),
        descKey: L('Target.SceneNavigation.Desc'),
        selectors: ['#navigation', '#scene-navigation'],
        essentials: [
            { type: 'font', labelKey: L('Control.FontFamily'), path: 'sceneNavigation.fontFamily', options: fontOptions() },
            range('Control.FontSize', 'sceneNavigation.fontSize', 10, 22),
            select('Control.LayoutMode', 'sceneNavigation.layoutMode', [
                { value: 'vertical', labelKey: L('Option.LayoutVertical') },
                { value: 'horizontal', labelKey: L('Option.LayoutHorizontal') },
                { value: 'tray', labelKey: L('Option.LayoutTray') }
            ]),
            range('Control.RowHeight', 'sceneNavigation.rowHeight', 24, 60)
        ],
        drawer: [
            sec('Section.Typography'),
            select('Control.FontWeight', 'sceneNavigation.fontWeight', PAUSE_LABEL_WEIGHTS.map(w => ({ value: w.id, label: w.label }))),
            range('Control.LetterSpacing', 'sceneNavigation.letterSpacing', 0, 6),
            toggle('Control.Uppercase', 'sceneNavigation.uppercase'),
            sec('Section.Geometry'),
            range('Control.Gap', 'sceneNavigation.gap', 0, 24),
            range('Control.PaddingX', 'sceneNavigation.paddingX', 0, 32),
            range('Control.PaddingY', 'sceneNavigation.paddingY', 0, 24),
            range('Control.BorderWidth', 'sceneNavigation.borderWidth', 0, 6),
            select('Control.BorderStyle', 'sceneNavigation.borderStyle', BORDER_STYLE_OPTIONS),
            range('Control.BorderRadius', 'sceneNavigation.borderRadius', 0, 30),
            sec('Section.States'),
            range('Control.HiddenOpacity', 'sceneNavigation.hiddenOpacity', 10, 100, '%')
        ]
    },
    {
        id: 'token-controls',
        domain: 'foundry',
        gmOnly: true,
        crumbKey: L('Crumb.Foundry'),
        titleKey: L('Target.TokenControls.Title'),
        descKey: L('Target.TokenControls.Desc'),
        selectors: ['#controls', '#scene-controls'],
        essentials: [
            range('Control.ButtonSize', 'tokenControls.buttonSize', 24, 64),
            range('Control.IconSize', 'tokenControls.iconSize', 12, 32),
            range('Control.BorderRadius', 'tokenControls.borderRadius', 0, 30)
        ],
        drawer: [
            sec('Section.Geometry'),
            range('Control.Gap', 'tokenControls.gap', 0, 20),
            range('Control.ColumnGap', 'tokenControls.columnGap', 0, 24),
            range('Control.BorderWidth', 'tokenControls.borderWidth', 0, 6),
            select('Control.BorderStyle', 'tokenControls.borderStyle', BORDER_STYLE_OPTIONS),
            sec('Section.States'),
            range('Control.DisabledOpacity', 'tokenControls.disabledOpacity', 10, 100, '%'),
            range('Control.ShadowIntensity', 'tokenControls.shadowIntensity', 0, 100, '%')
        ]
    },
    {
        id: 'hotbar',
        domain: 'foundry',
        gmOnly: true,
        crumbKey: L('Crumb.Foundry'),
        titleKey: L('Target.Hotbar.Title'),
        descKey: L('Target.Hotbar.Desc'),
        selectors: ['#hotbar'],
        essentials: [
            range('Control.SlotSize', 'hotbar.slotSize', 30, 80),
            range('Control.SlotGap', 'hotbar.slotGap', 0, 16),
            range('Control.SlotRadius', 'hotbar.slotRadius', 0, 30)
        ],
        drawer: [
            sec('Section.HotbarSlots'),
            range('Control.SlotOpacity', 'hotbar.slotOpacity', 10, 100, '%'),
            range('Control.SlotBorderWidth', 'hotbar.slotBorderWidth', 0, 6),
            select('Control.SlotBorderStyle', 'hotbar.slotBorderStyle', BORDER_STYLE_OPTIONS),
            range('Control.SlotShadowIntensity', 'hotbar.slotShadowIntensity', 0, 100, '%'),
            range('Control.SlotsPerRow', 'hotbar.slotsPerRow', 5, 20, ''),
            sec('Section.HotbarKeys'),
            range('Control.KeyBadgeSize', 'hotbar.keyBadgeSize', 10, 26),
            range('Control.KeyFontSize', 'hotbar.keyFontSize', 8, 18),
            range('Control.KeyOpacity', 'hotbar.keyOpacity', 0, 100, '%'),
            sec('Section.HotbarPosition'),
            select('Control.Anchor', 'hotbar.anchor', [
                { value: 'bottom-center', labelKey: L('Option.AnchorBottomCenter') },
                { value: 'bottom-left', labelKey: L('Option.AnchorBottomLeft') },
                { value: 'bottom-right', labelKey: L('Option.AnchorBottomRight') }
            ]),
            range('Control.OffsetX', 'hotbar.offsetX', -400, 400),
            range('Control.OffsetY', 'hotbar.offsetY', -200, 200),
            sec('Section.HotbarControls'),
            range('Control.ControlSize', 'hotbar.controlSize', 20, 48),
            range('Control.ControlGap', 'hotbar.controlGap', 0, 16),
            range('Control.ControlRadius', 'hotbar.controlRadius', 0, 24)
        ]
    },
    {
        id: 'sidebar',
        domain: 'foundry',
        gmOnly: true,
        crumbKey: L('Crumb.Foundry'),
        titleKey: L('Target.Sidebar.Title'),
        descKey: L('Target.Sidebar.Desc'),
        selectors: ['#sidebar'],
        essentials: [
            range('Control.PanelRadius', 'sidebar.panelRadius', 0, 30),
            range('Control.PanelPadding', 'sidebar.panelPadding', 0, 24),
            range('Control.FontSize', 'sidebar.fontSize', 10, 20)
        ],
        drawer: [
            sec('Section.SidebarPanel'),
            range('Control.PanelBorderWidth', 'sidebar.panelBorderWidth', 0, 6),
            range('Control.PanelShadowIntensity', 'sidebar.panelShadowIntensity', 0, 100, '%'),
            range('Control.RailWidth', 'sidebar.railWidth', 28, 64),
            sec('Section.SidebarTabs'),
            range('Control.TabSize', 'sidebar.tabSize', 24, 52),
            range('Control.TabGap', 'sidebar.tabGap', 0, 16),
            range('Control.TabOffsetX', 'sidebar.tabOffsetX', -30, 30),
            range('Control.TabOffsetY', 'sidebar.tabOffsetY', -30, 30),
            sec('Section.SidebarDirectory'),
            range('Control.RowHeight', 'sidebar.rowHeight', 20, 48),
            range('Control.FolderHeight', 'sidebar.folderHeight', 20, 48),
            range('Control.FolderIndent', 'sidebar.folderIndent', 0, 32),
            range('Control.SearchHeight', 'sidebar.searchHeight', 24, 48),
            sec('Section.States'),
            range('Control.HoverStrength', 'sidebar.hoverStrength', 0, 100, '%'),
            range('Control.ActiveStrength', 'sidebar.activeStrength', 0, 100, '%'),
            range('Control.DividerStrength', 'sidebar.dividerStrength', 0, 100, '%'),
            sec('Section.SidebarSurfaces'),
            range('Control.RailOpacity', 'sidebar.railOpacity', 0, 100, '%'),
            range('Control.PanelOpacity', 'sidebar.panelOpacity', 0, 100, '%'),
            range('Control.FolderOpacity', 'sidebar.folderOpacity', 0, 100, '%'),
            range('Control.InputOpacity', 'sidebar.inputOpacity', 0, 100, '%'),
            range('Control.ActionOpacity', 'sidebar.actionOpacity', 0, 100, '%'),
            range('Control.TabRestStrength', 'sidebar.tabRestStrength', 0, 100, '%')
        ]
    },
    {
        id: 'chat-log-shell',
        domain: 'foundry',
        gmOnly: true,
        crumbKey: L('Crumb.Foundry'),
        titleKey: L('Target.ChatLogShell.Title'),
        descKey: L('Target.ChatLogShell.Desc'),
        selectors: ['#chat-form', '#chat-message', '#chat .chat-form'],
        essentials: [
            range('Control.MessageGap', 'chatLog.messageGap', 0, 20),
            range('Control.MessageRadius', 'chatLog.messageRadius', 0, 24),
            range('Control.ComposerMinHeight', 'chatLog.composerMinHeight', 28, 120)
        ],
        drawer: [
            sec('Section.ChatMessages'),
            range('Control.MessagePadding', 'chatLog.messagePadding', 0, 24),
            range('Control.MessageBorderWidth', 'chatLog.messageBorderWidth', 0, 6),
            range('Control.MessageShadowIntensity', 'chatLog.messageShadowIntensity', 0, 100, '%'),
            range('Control.LogPadding', 'chatLog.logPadding', 0, 24),
            range('Control.ContentMaxWidth', 'chatLog.contentMaxWidth', 60, 100, '%'),
            range('Control.HeaderGap', 'chatLog.headerGap', 0, 16),
            sec('Section.ChatComposer'),
            range('Control.ComposerMaxHeight', 'chatLog.composerMaxHeight', 60, 240),
            range('Control.ComposerPadding', 'chatLog.composerPadding', 0, 24),
            range('Control.ComposerRadius', 'chatLog.composerRadius', 0, 24),
            range('Control.ComposerBorderWidth', 'chatLog.composerBorderWidth', 0, 6),
            range('Control.ComposerFocusStrength', 'chatLog.composerFocusStrength', 0, 100, '%'),
            sec('Section.States'),
            range('Control.HoverStrength', 'chatLog.hoverStrength', 0, 100, '%'),
            range('Control.DividerStrength', 'chatLog.dividerStrength', 0, 100, '%'),
            range('Control.ContextStrength', 'chatLog.contextStrength', 0, 100, '%')
        ]
    },
    {
        id: 'players-list',
        domain: 'foundry',
        gmOnly: true,
        crumbKey: L('Crumb.Foundry'),
        titleKey: L('Target.PlayersList.Title'),
        descKey: L('Target.PlayersList.Desc'),
        selectors: ['#players'],
        essentials: [
            select('Control.VisualMode', 'playersList.visualMode', [
                { value: 'compact', labelKey: L('Option.PlayersCompact') },
                { value: 'glass', labelKey: L('Option.PlayersGlass') },
                { value: 'neon', labelKey: L('Option.PlayersNeon') },
                { value: 'banner', labelKey: L('Option.PlayersBanner') },
                { value: 'minimal', labelKey: L('Option.PlayersMinimal') }
            ]),
            range('Control.RowHeight', 'playersList.rowHeight', 18, 44),
            range('Control.PanelRadius', 'playersList.panelRadius', 0, 24),
            select('Control.StatusStyle', 'playersList.statusStyle', [
                { value: 'dot', labelKey: L('Option.StatusDot') },
                { value: 'ring', labelKey: L('Option.StatusRing') },
                { value: 'pill', labelKey: L('Option.StatusPill') }
            ]),
            range('Control.StatusSize', 'playersList.statusSize', 6, 16)
        ],
        drawer: [
            sec('Section.PlayersPanel'),
            range('Control.PanelPadding', 'playersList.panelPadding', 0, 20),
            range('Control.PanelGap', 'playersList.panelGap', 0, 16),
            range('Control.PanelBorderWidth', 'playersList.panelBorderWidth', 0, 6),
            range('Control.PanelShadowIntensity', 'playersList.panelShadowIntensity', 0, 100, '%'),
            sec('Section.PlayersRows'),
            range('Control.RowGap', 'playersList.rowGap', 0, 12),
            range('Control.RowPaddingX', 'playersList.rowPaddingX', 0, 20),
            range('Control.RowRadius', 'playersList.rowRadius', 0, 20),
            sec('Section.States'),
            range('Control.HoverStrength', 'playersList.hoverStrength', 0, 100, '%'),
            range('Control.InactiveOpacity', 'playersList.inactiveOpacity', 10, 100, '%'),
            range('Control.GmHighlight', 'playersList.gmHighlight', 0, 100, '%'),
            range('Control.SelfHighlight', 'playersList.selfHighlight', 0, 100, '%')
        ]
    },
    {
        id: 'windows',
        domain: 'foundry',
        gmOnly: true,
        crumbKey: L('Crumb.Foundry'),
        titleKey: L('Target.Windows.Title'),
        descKey: L('Target.Windows.Desc'),
        selectors: ['.app.window-app', '.application.window-app', 'body > .application'],
        essentials: [
            select('Control.VisualMode', 'windows.visualMode', [
                { value: 'solid', labelKey: L('Option.WindowsSolid') },
                { value: 'glass', labelKey: L('Option.WindowsGlass') },
                { value: 'parchment', labelKey: L('Option.WindowsParchment') },
                { value: 'arcane', labelKey: L('Option.WindowsArcane') },
                { value: 'compact', labelKey: L('Option.WindowsCompact') },
                { value: 'high-contrast', labelKey: L('Option.WindowsHighContrast') },
                { value: 'neon', labelKey: L('Option.WindowsNeon') }
            ]),
            range('Control.FrameRadius', 'windows.frameRadius', 0, 24),
            range('Control.FrameOpacity', 'windows.frameOpacity', 30, 100, '%'),
            range('Control.HeaderHeight', 'windows.headerHeight', 24, 48)
        ],
        drawer: [
            sec('Section.WindowFrame'),
            range('Control.FrameBorderWidth', 'windows.frameBorderWidth', 0, 6),
            range('Control.FrameShadowIntensity', 'windows.frameShadowIntensity', 0, 100, '%'),
            range('Control.GlassBlur', 'windows.glassBlur', 0, 20),
            range('Control.InactiveOpacity', 'windows.inactiveOpacity', 30, 100, '%'),
            sec('Section.WindowHeader'),
            range('Control.HeaderDividerStrength', 'windows.headerDividerStrength', 0, 100, '%'),
            range('Control.HeaderGripStrength', 'windows.headerGripStrength', 0, 100, '%'),
            sec('Section.WindowContent'),
            range('Control.ContentPadding', 'windows.contentPadding', 0, 24),
            range('Control.ContentContrast', 'windows.contentContrast', 0, 100, '%'),
            range('Control.ScrollbarStrength', 'windows.scrollbarStrength', 0, 100, '%')
        ]
    },

    /* ══════════ TELA DE PAUSA (GM) — os 33 campos completos ══════════ */
    {
        id: 'pause',
        domain: 'foundry',
        gmOnly: true,
        crumbKey: L('Crumb.Foundry'),
        titleKey: L('Target.Pause.Title'),
        descKey: L('Target.Pause.Desc'),
        selectors: ['#pause'],
        essentials: [
            toggle('Control.PauseEnabled', 'pause.enabled'),
            select('Control.PauseVisualMode', 'pause.visualMode', enumOptions(PAUSE_VISUAL_MODES)),
            text('Control.PauseLabelText', 'pause.labelText'),
            ncolor('Control.PauseLabelColor', 'pause.labelColor')
        ],
        drawer: [
            sec('Section.PauseSymbol'),
            { type: 'file', labelKey: L('Control.PauseAssetPath'), path: 'pause.assetPath' },
            select('Control.PauseSymbolFilter', 'pause.symbolFilter', enumOptions(PAUSE_SYMBOL_FILTERS)),
            select('Control.PauseBlendMode', 'pause.blendMode', enumOptions(PAUSE_BLEND_MODES)),
            range('Control.PauseOpacity', 'pause.opacity', 0, 100, '%'),
            range('Control.PauseScale', 'pause.scale', 40, 200, '%'),
            range('Control.PauseRotation', 'pause.rotation', -180, 180, '°'),
            range('Control.PauseGlowStrength', 'pause.glowStrength', 0, 100, '%'),
            range('Control.PauseShadowStrength', 'pause.shadowStrength', 0, 100, '%'),
            sec('Section.PausePosition'),
            range('Control.PausePositionX', 'pause.positionX', 0, 100, '%'),
            range('Control.PausePositionY', 'pause.positionY', 0, 100, '%'),
            sec('Section.PauseMotion'),
            select('Control.PauseEffect', 'pause.effect', enumOptions(PAUSE_EFFECTS)),
            select('Control.PauseMotion', 'pause.motion', enumOptions(PAUSE_MOTION_MODES)),
            range('Control.PauseAnimationStrength', 'pause.animationStrength', 0, 200, '%'),
            sec('Section.PauseLabel'),
            toggle('Control.PauseHideLabel', 'pause.hideLabel'),
            { type: 'font', labelKey: L('Control.PauseLabelFont'), path: 'pause.labelFont', options: fontOptions() },
            range('Control.PauseLabelSize', 'pause.labelSize', 10, 60),
            select('Control.PauseLabelWeight', 'pause.labelWeight', PAUSE_LABEL_WEIGHTS.map(w => ({ value: w.id, label: w.label }))),
            toggle('Control.PauseLabelUppercase', 'pause.labelUppercase'),
            range('Control.PauseLabelLetterSpacing', 'pause.labelLetterSpacing', 0, 20),
            select('Control.PauseLabelPlacement', 'pause.labelPlacement', enumOptions(PAUSE_LABEL_PLACEMENTS)),
            range('Control.PauseLabelOffsetY', 'pause.labelOffsetY', -120, 120),
            range('Control.PauseLabelGlow', 'pause.labelGlow', 0, 100, '%'),
            sec('Section.PauseBar'),
            ncolor('Control.PauseBarColor', 'pause.barColor'),
            select('Control.PauseBarShape', 'pause.barShape', enumOptions(PAUSE_BAR_SHAPES)),
            range('Control.PauseBarWidth', 'pause.barWidth', 20, 100, '%'),
            range('Control.PauseBarHeight', 'pause.barHeight', 60, 400),
            range('Control.PauseBarOpacity', 'pause.barOpacity', 0, 100, '%'),
            range('Control.PauseBarBlur', 'pause.barBlur', 0, 20),
            range('Control.PauseBarBorderStrength', 'pause.barBorderStrength', 0, 100, '%')
        ]
    }
];

/* ══════════ ÍCONES: grupos + alvos individuais gerados do icon-registry ══════════ */

for (const group of ICON_GROUPS) {
    STUDIO_TARGETS.push({
        id: `icon-group-${group.id}`,
        domain: 'foundry',
        gmOnly: true,
        crumbKey: L('Crumb.Icons'),
        titleKey: group.labelKey ?? L('Target.IconGroup.Title'),
        titleFallback: group.id,
        descKey: L('Target.IconGroup.Desc'),
        selectors: [],
        essentials: [
            { type: 'color', labelKey: L('Control.IconColor'), segments: ['icons', 'groups', group.id, 'color'], nullable: true },
            { type: 'color', labelKey: L('Control.IconHoverColor'), segments: ['icons', 'groups', group.id, 'hoverColor'], nullable: true },
            { type: 'color', labelKey: L('Control.IconActiveColor'), segments: ['icons', 'groups', group.id, 'activeColor'], nullable: true }
        ],
        drawer: [
            sec('Section.IconBackgrounds'),
            { type: 'color', labelKey: L('Control.IconBackground'), segments: ['icons', 'groups', group.id, 'backgroundColor'], nullable: true },
            { type: 'color', labelKey: L('Control.IconHoverBackground'), segments: ['icons', 'groups', group.id, 'hoverBackgroundColor'], nullable: true },
            { type: 'color', labelKey: L('Control.IconActiveBackground'), segments: ['icons', 'groups', group.id, 'activeBackgroundColor'], nullable: true }
        ]
    });
}

/* Alvos individuais: ids contêm pontos ("navigation.expand"), então os paths
 * usam `segments` — NUNCA dot-split (ICON_OVERRIDES_NOTES.md). */
for (const target of FOUNDRY_ICON_REGISTRY) {
    STUDIO_TARGETS.push({
        id: `icon-${target.id.replace(/\./g, '--')}`,
        domain: 'foundry',
        gmOnly: true,
        iconTargetId: target.id,
        crumbKey: L('Crumb.IconsIndividual'),
        titleKey: target.labelKey ?? L('Target.Icon.Title'),
        titleFallback: target.id,
        descKey: L('Target.Icon.Desc'),
        selectors: Array.isArray(target.selectors) ? target.selectors.slice(0, 4) : [],
        essentials: [
            { type: 'toggle', labelKey: L('Control.IconInheritGroup'), segments: ['icons', 'overrides', target.id, 'inheritGroup'] },
            { type: 'color', labelKey: L('Control.IconColor'), segments: ['icons', 'overrides', target.id, 'color'], nullable: true, hideIfOnSegments: ['icons', 'overrides', target.id, 'inheritGroup'] },
            { type: 'color', labelKey: L('Control.IconHoverColor'), segments: ['icons', 'overrides', target.id, 'hoverColor'], nullable: true, hideIfOnSegments: ['icons', 'overrides', target.id, 'inheritGroup'] },
            { type: 'color', labelKey: L('Control.IconActiveColor'), segments: ['icons', 'overrides', target.id, 'activeColor'], nullable: true, hideIfOnSegments: ['icons', 'overrides', target.id, 'inheritGroup'] }
        ],
        drawer: [
            sec('Section.IconAdvanced'),
            { type: 'toggle', labelKey: L('Control.IconHidden'), segments: ['icons', 'overrides', target.id, 'hidden'] },
            { type: 'text', labelKey: L('Control.IconClass'), segments: ['icons', 'overrides', target.id, 'iconClass'] }
        ]
    });
}

/**
 * Lookup helpers.
 */
export function getStudioTarget(id) {
    return STUDIO_TARGETS.find(target => target.id === id) ?? null;
}

export function getVisibleStudioTargets({ isGM = false } = {}) {
    return STUDIO_TARGETS.filter(target => !target.gmOnly || isGM);
}

/**
 * Flat searchable index of every control (label resolution happens at render
 * time so localization stays live).
 */
export function buildStudioSearchIndex({ isGM = false } = {}) {
    const index = [];
    for (const target of getVisibleStudioTargets({ isGM })) {
        for (const control of [...(target.essentials ?? []), ...(target.drawer ?? [])]) {
            if (control.sec || !control.labelKey) continue;
            index.push({
                targetId: target.id,
                labelKey: control.labelKey,
                targetTitleKey: target.titleKey,
                targetTitleFallback: target.titleFallback ?? null,
                inDrawer: (target.drawer ?? []).includes(control)
            });
        }
    }
    return index;
}

/**
 * Every control of a target, flattened (used by parity tooling and tests).
 */
export function getStudioTargetControls(target) {
    return [...(target.essentials ?? []), ...(target.drawer ?? [])].filter(control => !control.sec);
}
