/**
 * Your Flavor - Settings Registration
 * @module your-flavor/settings
 */

import {
    DEFAULT_FOUNDRY_CUSTOMIZATION,
    MESSAGE_STYLING_POLICIES,
    MESSAGE_STYLING_POLICY_IDS,
    MODULE_ID,
    WORLD_PROFILE_V2_SETTING
} from './constants.js';
import { getChatPresetChoices } from './chat-presets.js';
import { FlavorConfigApp } from './ui/flavor-config-app.js';
import { ApplicationV2, confirmDialog } from './compatibility.js';

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
            none: game.i18n.localize('YOUR_FLAVOR.Settings.ForcePlayerLayout.Choices.None'),
            ...Object.fromEntries(
                getChatPresetChoices()
                    .filter(preset => preset.id !== 'none')
                    .map(preset => [preset.id, preset.name])
            )
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

    // GM Setting: explicit chat message styling policy
    const messageStylingPolicyChoices = Object.fromEntries(
        MESSAGE_STYLING_POLICIES.map(policy => [policy.id, game.i18n.localize(policy.labelKey)])
    );
    game.settings.register(MODULE_ID, 'messageStylingPolicy', {
        name: game.i18n.localize('YOUR_FLAVOR.Settings.MessageStylingPolicy.Name'),
        hint: game.i18n.localize('YOUR_FLAVOR.Settings.MessageStylingPolicy.Hint'),
        scope: 'world',
        config: true,
        type: String,
        choices: messageStylingPolicyChoices,
        default: MESSAGE_STYLING_POLICY_IDS.SUPPORTED_FIXTURES,
        requiresReload: false
    });

    // Legacy world setting kept hidden for one-time migration from older versions.
    game.settings.register(MODULE_ID, 'applyToAllMessages', {
        name: game.i18n.localize('YOUR_FLAVOR.Settings.ApplyToAllMessages.Name'),
        hint: game.i18n.localize('YOUR_FLAVOR.Settings.ApplyToAllMessages.Hint'),
        scope: 'world',
        config: false,
        type: Boolean,
        default: false,
        requiresReload: false
    });

    game.settings.register(MODULE_ID, 'messageStylingPolicyMigrated', {
        name: 'Message Styling Policy Migrated',
        scope: 'world',
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register(MODULE_ID, 'messageStylingPolicyV401Migrated', {
        name: 'Message Styling Policy v4.0.1 Migrated',
        scope: 'world',
        config: false,
        type: Boolean,
        default: false
    });

    // GM Setting: Unlock global Foundry shell customization
    game.settings.register(MODULE_ID, 'enableFoundryCustomization', {
        name: game.i18n.localize('YOUR_FLAVOR.Settings.EnableFoundryCustomization.Name'),
        hint: game.i18n.localize('YOUR_FLAVOR.Settings.EnableFoundryCustomization.Hint'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        requiresReload: false,
        onChange: value => {
            void globalThis.YourFlavor?.getFoundryCustomizer?.().handleFeatureToggle?.(value);
        }
    });

    // GM Setting: Share the game-level Foundry customization with players
    game.settings.register(MODULE_ID, 'shareFoundryCustomization', {
        name: game.i18n.localize('YOUR_FLAVOR.Settings.ShareFoundryCustomization.Name'),
        hint: game.i18n.localize('YOUR_FLAVOR.Settings.ShareFoundryCustomization.Hint'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        requiresReload: false,
        onChange: () => {
            const customizer = globalThis.YourFlavor?.getFoundryCustomizer?.();
            customizer?.refreshFromSettings?.();
            void customizer?.syncWorldProfileV2?.();
        }
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

    // Legacy client setting kept for migration from older versions.
    game.settings.register(MODULE_ID, 'foundryCustomization', {
        name: 'Legacy Foundry Customization',
        scope: 'client',
        config: false,
        type: Object,
        default: DEFAULT_FOUNDRY_CUSTOMIZATION
    });

    // World Setting: Shared Foundry UI customization authored by the GM
    game.settings.register(MODULE_ID, 'sharedFoundryCustomization', {
        name: 'Shared Foundry Customization',
        scope: 'world',
        config: false,
        type: Object,
        default: DEFAULT_FOUNDRY_CUSTOMIZATION,
        onChange: () => {
            globalThis.YourFlavor?.getFoundryCustomizer?.().refreshFromSettings?.();
        }
    });

    // World Setting: v2 world profile mirror for migration. Legacy settings remain active for now.
    game.settings.register(MODULE_ID, WORLD_PROFILE_V2_SETTING, {
        name: 'World Profile v2',
        scope: 'world',
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
        type: FlavorConfigApp,
        restricted: false
    });

    // Emergency reset if someone takes customization a little too seriously
    game.settings.registerMenu(MODULE_ID, 'resetFoundryCustomization', {
        name: game.i18n.localize('YOUR_FLAVOR.Settings.ResetFoundryCustomization.Name'),
        label: game.i18n.localize('YOUR_FLAVOR.Settings.ResetFoundryCustomization.Label'),
        hint: game.i18n.localize('YOUR_FLAVOR.Settings.ResetFoundryCustomization.Hint'),
        icon: 'fas fa-life-ring',
        type: FoundryCustomizationResetMenuButton,
        restricted: true
    });
}

class FoundryCustomizationResetMenuButton extends ApplicationV2 {
    constructor() {
        super();
        const title = game.i18n.localize('YOUR_FLAVOR.Dialog.ResetFoundryTitle');
        const content = game.i18n.localize('YOUR_FLAVOR.Dialog.ResetFoundryContent');

        confirmDialog({
            title,
            content,
            yes: async () => {
                const customizer = globalThis.YourFlavor?.getFoundryCustomizer?.();
                if (customizer?.resetConfig) {
                    await customizer.resetConfig();
                } else {
                    const defaults = foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION);
                    defaults.enabled = false;
                    defaults.fieldOverrides = {};
                    await game.settings.set(MODULE_ID, 'sharedFoundryCustomization', defaults);
                    await game.settings.set(MODULE_ID, 'foundryCustomization', foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION));
                    customizer?.applyConfig?.(defaults);
                }
                ui.notifications.info(game.i18n.localize('YOUR_FLAVOR.Notifications.FoundryReset'));
            },
            no: () => false,
            defaultYes: false
        });
    }

    async render() {
        return this;
    }
}
