# Your Flavor

A visual customization studio for Foundry VTT v13 and v14. Style chat messages, rolls, item and system cards, the Foundry shell, interface icons, and shared table visuals with live previews and GM controls.

## Features

- **40+ Layout Presets** - Choose from elegant, parchment, royal, class-themed (mage, warrior, bard), race-themed (elf, dwarf, orc), and more
- **Full Customization** - Customize fonts, colors, borders, glows, shadows, and more
- **Google Fonts** - Beautiful fantasy fonts like Cinzel, Tangerine, Pirata One
- **Roll and Card Styling** - Theme dice rolls, item cards, supported system cards, and safe generic card fallbacks
- **Foundry Shell Styling** - Customize core interface surfaces, controls, sidebar, hotbar, scene navigation, player list, pause indicator, and more
- **Icon Customization** - Recolor, replace, hide, and tune Foundry interface icons
- **Visual Sharing** - Export and import themed visual profiles for chat, rolls, cards, Foundry shell, icons, and presets
- **Diagnostics and Reset Tools** - Check selector health, inspect safe fallbacks, and restore stock visuals without disabling the module
- **GM Controls** - Force layouts for players or allow free customization
- **Multi-language** - English and Portuguese (Brazil) support
- **Per-User Settings** - Each player can have their own style

## Installation

### Method 1: Foundry Module Browser
Search for "Your Flavor" in the Foundry VTT module browser.

### Method 2: Manifest URL
Use this manifest URL in Foundry VTT:
```
https://github.com/wand-and-widgets/your-flavor/releases/latest/download/module.json
```

## Usage

1. Enable the module in your world
2. Click the palette icon in the token controls, or access via module settings
3. Choose a layout preset or create your own custom style
4. Start chatting!

## Layout Categories

### Basic
- **Elegant** - Golden borders with Cinzel font
- **Parchment** - Classic scroll appearance
- **Royal** - Regal red and gold
- **Shadow** - Dark and mysterious

### Classes
Warrior, Thief, Bard, Druid, Barbarian, Cleric, Paladin, Monk, Sorcerer, Mage, Ranger, Warlock

### Races
Elf, Orc, Dwarf, Dragon

### Themes
Necromancer, Vampire, Beholder, Zombie, Fire, Cold, Acid, Desert, Glacial, Evil, Good

### Modern
Futuristic, Cyberpunk, Military

### Misc
Girly, Rebel, Professor, Punk, Hip-Hop, Bland

### Custom
Create your own unique style with full control over every option

## GM Controls

- **Force Player Layout** - Make all players use a specific layout
- **Allow Player Customization** - Toggle whether players can customize their own style
- **Apply to Whispers** - Choose if styling applies to whispered messages
- **Message Styling Policy** - Choose whether Your Flavor styles simple chat only, rolls, cards, or supported roll/card fixtures

## API

Access the module API:
```javascript
const api = game.modules.get('your-flavor').api;

// Open configuration
api.openConfig();

// Get available layouts
api.getLayouts();

// Get the flavor manager
api.getManager();
```

## Compatibility

- **Foundry VTT**: v13 and v14
- **Systems**: System-agnostic (works with any system)
- Safely detects:
  - Simple chat messages
  - Dice rolls
  - D&D5e item and ability cards
  - PF2e action and spell cards
  - Generic system cards with safe outer-only fallbacks
  - Complex HTML that should remain untouched

## Support

- [Report Issues](https://github.com/wand-and-widgets/your-flavor/issues)
- [Foundry VTT Discord](https://discord.gg/foundryvtt) - #module-discussion

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**Wand & Widgets**
- GitHub: [@wand-and-widgets](https://github.com/wand-and-widgets)
