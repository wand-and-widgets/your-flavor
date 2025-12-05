/**
 * Your Flavor - Settings Registration
 * @module your-flavor/settings
 */

import { MODULE_ID } from './constants.js';

/**
 * Register all module settings
 */
export function registerSettings() {
    // GM Setting: Enable/disable module globally
    game.settings.register(MODULE_ID, 'moduleEnabled', {
        name: game.i18n.localize('YOUR_FLAVOR.Settings.ModuleEnabled.Name'),
        hint: game.i18n.localize('YOUR_FLAVOR.Settings.ModuleEnabled.Hint'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        requiresReload: false
    });

    // GM Setting: Allow players to customize their chat
    game.settings.register(MODULE_ID, 'allowPlayerCustomization', {
        name: game.i18n.localize('YOUR_FLAVOR.Settings.AllowPlayerCustomization.Name'),
        hint: game.i18n.localize('YOUR_FLAVOR.Settings.AllowPlayerCustomization.Hint'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        requiresReload: false
    });

    // GM Setting: Force players to use a specific layout
    game.settings.register(MODULE_ID, 'forcePlayerLayout', {
        name: game.i18n.localize('YOUR_FLAVOR.Settings.ForcePlayerLayout.Name'),
        hint: game.i18n.localize('YOUR_FLAVOR.Settings.ForcePlayerLayout.Hint'),
        scope: 'world',
        config: true,
        type: String,
        choices: {
            'none': game.i18n.localize('YOUR_FLAVOR.Settings.ForcePlayerLayout.Choices.None'),
            // Basic
            'elegant': game.i18n.localize('YOUR_FLAVOR.Layouts.Elegant.Name'),
            'parchment': game.i18n.localize('YOUR_FLAVOR.Layouts.Parchment.Name'),
            'royal': game.i18n.localize('YOUR_FLAVOR.Layouts.Royal.Name'),
            'shadow': game.i18n.localize('YOUR_FLAVOR.Layouts.Shadow.Name'),
            // Classes
            'warrior': game.i18n.localize('YOUR_FLAVOR.Layouts.Warrior.Name'),
            'thief': game.i18n.localize('YOUR_FLAVOR.Layouts.Thief.Name'),
            'bard': game.i18n.localize('YOUR_FLAVOR.Layouts.Bard.Name'),
            'druid': game.i18n.localize('YOUR_FLAVOR.Layouts.Druid.Name'),
            'barbarian': game.i18n.localize('YOUR_FLAVOR.Layouts.Barbarian.Name'),
            'cleric': game.i18n.localize('YOUR_FLAVOR.Layouts.Cleric.Name'),
            'paladin': game.i18n.localize('YOUR_FLAVOR.Layouts.Paladin.Name'),
            'monk': game.i18n.localize('YOUR_FLAVOR.Layouts.Monk.Name'),
            'sorcerer': game.i18n.localize('YOUR_FLAVOR.Layouts.Sorcerer.Name'),
            'mage': game.i18n.localize('YOUR_FLAVOR.Layouts.Mage.Name'),
            'ranger': game.i18n.localize('YOUR_FLAVOR.Layouts.Ranger.Name'),
            'warlock': game.i18n.localize('YOUR_FLAVOR.Layouts.Warlock.Name'),
            // Races
            'elf': game.i18n.localize('YOUR_FLAVOR.Layouts.Elf.Name'),
            'orc': game.i18n.localize('YOUR_FLAVOR.Layouts.Orc.Name'),
            'dwarf': game.i18n.localize('YOUR_FLAVOR.Layouts.Dwarf.Name'),
            'dragon': game.i18n.localize('YOUR_FLAVOR.Layouts.Dragon.Name'),
            // Themes
            'necromancer': game.i18n.localize('YOUR_FLAVOR.Layouts.Necromancer.Name'),
            'vampire': game.i18n.localize('YOUR_FLAVOR.Layouts.Vampire.Name'),
            'beholder': game.i18n.localize('YOUR_FLAVOR.Layouts.Beholder.Name'),
            'zombie': game.i18n.localize('YOUR_FLAVOR.Layouts.Zombie.Name'),
            'fire': game.i18n.localize('YOUR_FLAVOR.Layouts.Fire.Name'),
            'cold': game.i18n.localize('YOUR_FLAVOR.Layouts.Cold.Name'),
            'acid': game.i18n.localize('YOUR_FLAVOR.Layouts.Acid.Name'),
            'desert': game.i18n.localize('YOUR_FLAVOR.Layouts.Desert.Name'),
            'glacial': game.i18n.localize('YOUR_FLAVOR.Layouts.Glacial.Name'),
            'evil': game.i18n.localize('YOUR_FLAVOR.Layouts.Evil.Name'),
            'good': game.i18n.localize('YOUR_FLAVOR.Layouts.Good.Name'),
            // Modern
            'futuristic': game.i18n.localize('YOUR_FLAVOR.Layouts.Futuristic.Name'),
            'cyberpunk': game.i18n.localize('YOUR_FLAVOR.Layouts.Cyberpunk.Name'),
            'military': game.i18n.localize('YOUR_FLAVOR.Layouts.Military.Name'),
            // Misc
            'girly': game.i18n.localize('YOUR_FLAVOR.Layouts.Girly.Name'),
            'rebel': game.i18n.localize('YOUR_FLAVOR.Layouts.Rebel.Name'),
            'professor': game.i18n.localize('YOUR_FLAVOR.Layouts.Professor.Name'),
            'punk': game.i18n.localize('YOUR_FLAVOR.Layouts.Punk.Name'),
            'hiphop': game.i18n.localize('YOUR_FLAVOR.Layouts.HipHop.Name'),
            'bland': game.i18n.localize('YOUR_FLAVOR.Layouts.Bland.Name'),
            // New themes
            'steampunk': game.i18n.localize('YOUR_FLAVOR.Layouts.Steampunk.Name'),
            'eldritch': game.i18n.localize('YOUR_FLAVOR.Layouts.Eldritch.Name'),
            'feywild': game.i18n.localize('YOUR_FLAVOR.Layouts.Feywild.Name'),
            'celestial': game.i18n.localize('YOUR_FLAVOR.Layouts.Celestial.Name'),
            'pirate': game.i18n.localize('YOUR_FLAVOR.Layouts.Pirate.Name'),
            'noir': game.i18n.localize('YOUR_FLAVOR.Layouts.Noir.Name'),
            'alchemist': game.i18n.localize('YOUR_FLAVOR.Layouts.Alchemist.Name'),
            'infernal': game.i18n.localize('YOUR_FLAVOR.Layouts.Infernal.Name'),
            'merchant': game.i18n.localize('YOUR_FLAVOR.Layouts.Merchant.Name'),
            'tribal': game.i18n.localize('YOUR_FLAVOR.Layouts.Tribal.Name')
        },
        default: 'none',
        requiresReload: false
    });

    // GM Setting: Allow players to use custom HTML
    game.settings.register(MODULE_ID, 'allowCustomHtml', {
        name: game.i18n.localize('YOUR_FLAVOR.Settings.AllowCustomHtml.Name'),
        hint: game.i18n.localize('YOUR_FLAVOR.Settings.AllowCustomHtml.Hint'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        requiresReload: false
    });

    // GM Setting: Apply to whispers
    game.settings.register(MODULE_ID, 'applyToWhispers', {
        name: game.i18n.localize('YOUR_FLAVOR.Settings.ApplyToWhispers.Name'),
        hint: game.i18n.localize('YOUR_FLAVOR.Settings.ApplyToWhispers.Hint'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        requiresReload: false
    });

    // Client Setting: UI Scale for accessibility
    game.settings.register(MODULE_ID, 'uiScale', {
        name: game.i18n.localize('YOUR_FLAVOR.Settings.UIScale.Name'),
        hint: game.i18n.localize('YOUR_FLAVOR.Settings.UIScale.Hint'),
        scope: 'client',
        config: true,
        type: Number,
        range: {
            min: 80,
            max: 150,
            step: 5
        },
        default: 100,
        requiresReload: false,
        onChange: value => {
            document.querySelectorAll('.your-flavor-config').forEach(el => {
                el.style.setProperty('--yf-ui-scale', value / 100);
            });
        }
    });

    // Client Setting: User's flavor configuration (stored as JSON string)
    game.settings.register(MODULE_ID, 'userConfig', {
        name: 'User Flavor Configuration',
        scope: 'client',
        config: false,
        type: Object,
        default: null
    });

    // Register settings menu button
    game.settings.registerMenu(MODULE_ID, 'configureButton', {
        name: game.i18n.localize('YOUR_FLAVOR.Settings.Configure.Name'),
        label: game.i18n.localize('YOUR_FLAVOR.Settings.Configure.Label'),
        hint: game.i18n.localize('YOUR_FLAVOR.Settings.Configure.Hint'),
        icon: 'fas fa-palette',
        type: FlavorConfigMenuButton,
        restricted: false
    });
}

/**
 * Placeholder class for the settings menu button
 * Will be replaced with actual FlavorConfigApp import
 */
class FlavorConfigMenuButton extends FormApplication {
    constructor() {
        super();
        // Import and open the actual config app
        import('./ui/flavor-config-app.js').then(module => {
            new module.FlavorConfigApp().render(true);
        });
    }

    render() {
        // Don't render this form, just open the config app
        return this;
    }
}
