# Changelog

All notable changes to the Your Flavor module will be documented in this file.

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
