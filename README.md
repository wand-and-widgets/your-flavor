# Your Flavor

Your Flavor is a free module for customizing chat messages and the Foundry VTT interface. Choose a preset, adjust its colors and fonts, and preview the changes before saving.

The current release is [5.0.1](https://github.com/wand-and-widgets/your-flavor/releases/tag/v5.0.1), for Foundry VTT 13 and 14.

## What it includes

- Chat styles, fonts, colors, borders, and backgrounds.
- Separate controls for dice rolls, item cards, and supported system cards.
- Themes and controls for Foundry's sidebar, hotbar, scene tools, windows, and pause screen.
- Interface icon choices and previews.
- Import and export of visual profiles, plus backup and recovery controls.
- GM controls for player customization and shared table settings.
- English and Brazilian Portuguese translations.

## Installation

In Foundry's setup screen, open **Add-on Modules**, select **Install Module**, and search for **Your Flavor**. Enable it in your world's **Manage Modules** window.

You can also install with this manifest URL:

```text
https://github.com/wand-and-widgets/your-flavor/releases/latest/download/module.json
```

To update an existing installation, use **Update** beside Your Flavor in the setup screen, then reload your world.

## Getting started

Open the configuration window from the palette button in Foundry's token controls or from the module settings. Choose the area you want to customize, make your changes, and check the preview before saving.

The GM decides whether players can use their own chat styles and whether table settings are shared. Roll and card styling have separate controls, so you can leave them disabled when you only want to change ordinary chat messages.

## Compatibility and support

Your Flavor supports Foundry VTT 13 and 14. System cards and other modules use different layouts, so styling can vary. If a card or control becomes hard to read, disable styling for that area and [report the problem](https://github.com/wand-and-widgets/your-flavor/issues/new?template=bug_report.yml).

Include your Foundry version, game system and version, Your Flavor version, and steps to reproduce the issue. A screenshot helps when the problem is visual; remove private campaign information first.

Read the [changelog](CHANGELOG.md) for release details or visit the [official Foundry package page](https://foundryvtt.com/packages/your-flavor).

## API

```javascript
const api = game.modules.get('your-flavor').api;

api.openConfig();   // Open configuration
api.getLayouts();   // Get available layouts
api.getManager();   // Get the flavor manager
```

## License

Your Flavor is released under the [MIT License](LICENSE). Bundled fonts retain their own license notices.

Made by [Wand & Widgets](https://github.com/wand-and-widgets).
