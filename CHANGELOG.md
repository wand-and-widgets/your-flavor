# Changelog

All notable changes to the Your Flavor module will be documented in this file.

## [5.0.0] - 2026-07-26

Your Flavor 5.0 is a complete visual and usability redesign of the module.
The underlying settings remain compatible with existing worlds, while the
workbench, previews, navigation, Foundry themes, and recovery tools now form one
clear and consistent customization studio.

### Fixed

- **Applying a theme no longer erases your folder colours.** Choosing a colour
  for a folder is a core Foundry feature, and the theme was painting over it —
  both on the folder header and on the coloured line beside an open folder's
  contents. Your per-folder colours now always win; the theme only paints
  folders you have not given a colour to.
- **Choosing a theme now actually turns Foundry customization on.** Picking a
  theme used to write it to the draft and change nothing on screen, because the
  master switch ships off. Picking a theme is the request, so it now enables the
  feature and the theme category, and says so. Nothing is saved until you press
  Save.
- **The configuration window can always be closed.** A single failure anywhere
  in its cleanup used to leave the window open *and* leave the live preview
  applied to your real Foundry, with no window left to switch it off.
- **Dragging a slider in the Foundry tab is much smoother.** The preview was
  being rebuilt on every single mouse sample. It now updates as fast as your
  machine can keep up with, and the value you stop on is always the one applied.
- **The preset carousel in Chat Basic works**, the second row of preset cards is
  no longer clipped at any window width, and the slider handles are no longer
  sliced off.
- **Tone / intensity / motion filters actually filter** the preset gallery
  instead of only feeding the Randomize button.
- The Configuration tab now renders its tab bar like every other tab, instead of
  hiding the neighbouring tabs' labels.
- The Rolls contrast warning now matches the one in Chat Basic and Cards.
- Many low-contrast labels across the Icons, Token Controls, Scene Navigation
  and Macro Bar tabs, where dark-theme ink was showing through on the parchment
  surfaces. On the Icons tab this went from 25 unreadable labels to 5.

### Added

- **43 one-click Foundry themes** that coordinate the visual language of the
  Foundry shell and can be changed quickly during a session.
- **A rebuilt Icons workspace** with 215 curated choices across eight interface
  areas, guided selection, search, recommendations, and saved/draft previews.
- **A "Configuration" tab** that brings the world settings into the app: module
  enable, Foundry customization master switch and sharing, the eight
  customization category gates, player chat permissions, custom CSS and the
  window's UI scale — with a plain-language summary of everything you have
  changed but not yet saved.
- **Global control search**, so you can type the name of a control and jump
  straight to it, wherever it lives.
- **A rendered preset gallery**: the layout cards show the actual preset —
  background, border, font and glow — instead of an icon and a name.
- **Sidebar surface controls** (rail, panel, folder, input, action and tab
  strength), and five sidebar presets that now really differ from each other,
  including one that removes the rail entirely. Presets never overwrite your
  colours: they change depth and weight, and the palette stays yours.
- A first-run welcome that suggests a few starting looks, applied as a draft.

### Changed

- Chat now presents 80 built-in visual styles in a clearer rendered gallery,
  with faster filtering and customization.
- Chat, Rolls, and Cards now use dedicated workspaces with readable live
  previews and controls grouped around the surface being styled.
- **One window size for everybody.** The window used to resize itself per tab
  and squeeze itself into small screens, so no two people saw the same layout.
  It is now a fixed 1512×1040 frame for every tab, and screens too small for it
  get the whole frame scaled down rather than reflowed — same proportions, same
  line breaks, just smaller.
- The eight tabs are now visually grouped into four families, so the tab strip
  reads as fewer things at a glance.
- The Overview tab became a calm home screen; status cards and factory reset
  moved to Diagnostics.
- The Macro Bar, Token Controls and Scene Navigation tabs were rebalanced —
  between 30% and 40% less empty space, with no control removed.
- The Rolls and Share icons were redrawn.

### Compatibility

- Verified against **Foundry 14.360** with dnd5e 5.3.2, and on Foundry 13.
  `minimum: 13, verified: 14` is now backed by an actual smoke test on both.
- **No settings migration is required and no saved configuration changes
  meaning.** The six new sidebar fields default to exactly the values that were
  previously hard-coded, so an existing world looks identical after upgrading.

## [4.0.1] - 2026-05-20

### Fixed
- Rolls and card messages now use the 4.0 roll/card styling surfaces by default instead of being blocked by the legacy simple-chat-only policy.
- Existing 4.0.0 worlds with the accidental simple-chat-only default are migrated once to the supported roll/card policy.
- Shadowdark cards are treated as supported generic cards, and roll surfaces inside supported cards can now receive the configured roll styling.

## [4.0.0] - 2026-05-20

### Added
- Foundry VTT v13 and v14 shared compatibility target.
- Expanded Your Flavor 4.0 customization studio with preview, Foundry shell styling, icon customization, safer roll/card handling, diagnostics, visual sharing, and factory reset support.

### Changed
- Updated manifest compatibility to `minimum: 13` and `verified: 14` without a hard `maximum` cap.

## [1.0.0] - 2024-12-03

### Added - Initial Release

#### Features
- **40+ Layout Presets** - Comprehensive collection of chat message styles
  - Basic: Elegant, Parchment, Royal, Shadow
  - Classes: Warrior, Thief, Bard, Druid, Barbarian, Cleric, Paladin, Monk, Sorcerer, Mage, Ranger, Warlock
  - Races: Elf, Orc, Dwarf, Dragon
  - Themes: Necromancer, Vampire, Beholder, Zombie, Fire, Cold, Acid, Desert, Glacial, Evil, Good
  - Modern: Futuristic, Cyberpunk, Military
  - Misc: Girly, Rebel, Professor, Punk, Hip-Hop, Bland
  - Custom: Full customization option

#### Customization Options
- **Font Family** - 10 Google Fonts optimized for fantasy themes
- **Font Size** - Adjustable text size
- **Colors** - Text, background, border, and glow colors
- **Borders** - Width, style (solid, dashed, double, etc.), and radius
- **Effects** - Glow with customizable intensity, shadows

#### GM Controls
- **Force Player Layout** - Enforce a specific layout for all players
- **Allow Player Customization** - Toggle player access to customization
- **Apply to Whispers** - Control styling on whispered messages

#### Smart Detection
- Automatically skips system roll messages
- Preserves D&D 5e item cards
- Compatible with PF2e, SWADE, WFRP4e, CoC7 systems
- Detects and skips complex HTML content

#### Technical
- **ApplicationV2** - Modern Foundry v13 application framework
- **Per-User Storage** - Settings saved per user via flags
- **Public API** - Exposed API for module integration
- **Re-styling** - Messages re-styled on page reload
- **Scene Controls** - Quick access button in token controls

#### Localization
- English (en)
- Portuguese Brazil (pt-BR)

---

## Support

For issues and feature requests, please use the [GitHub issue tracker](https://github.com/wand-and-widgets/your-flavor/issues).
