/**
 * Your Flavor - Factory reset workflow
 * Clears every setting and flag owned by this module without touching world data
 * owned by Foundry or other modules.
 * @module your-flavor/factory-reset
 */

import {
    DEFAULT_FOUNDRY_CUSTOMIZATION,
    MESSAGE_STYLING_POLICY_IDS,
    MODULE_ID,
    WORLD_PROFILE_V2_SETTING
} from './constants.js';
import {
    ACTOR_CHAT_OVERRIDES_V2_FLAG,
    USER_PROFILE_V2_FLAG
} from './flavor-manager.js';

const WORLD_SETTING_DEFAULTS = Object.freeze([
    ['moduleEnabled', true],
    ['allowPlayerCustomization', true],
    ['forcePlayerLayout', 'none'],
    ['allowCustomHtml', false],
    ['applyToWhispers', true],
    ['messageStylingPolicy', MESSAGE_STYLING_POLICY_IDS.SIMPLE_ONLY],
    ['applyToAllMessages', false],
    ['messageStylingPolicyMigrated', false],
    ['sharedFoundryCustomization', () => foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION)],
    ['enableFoundryCustomization', false],
    ['shareFoundryCustomization', true],
    [WORLD_PROFILE_V2_SETTING, null]
]);

const CLIENT_SETTING_DEFAULTS = Object.freeze([
    ['uiScale', 100],
    ['userConfig', null],
    ['foundryCustomization', () => foundry.utils.deepClone(DEFAULT_FOUNDRY_CUSTOMIZATION)]
]);

const USER_FLAG_KEYS = Object.freeze([
    'config',
    'favorites',
    'actorConfigs',
    USER_PROFILE_V2_FLAG,
    ACTOR_CHAT_OVERRIDES_V2_FLAG
]);

/**
 * Restore every Your Flavor-controlled setting, user flag, and runtime DOM state
 * to module defaults. This intentionally does not delete scenes, actors, items,
 * chat messages, playlists, or data owned by other modules.
 * @param {Object} options
 * @param {FlavorManager|null} options.manager
 * @param {FoundryCustomizer|null} options.foundryCustomizer
 * @param {YourFlavor|null} options.runtime
 * @returns {Promise<Object>}
 */
export async function factoryResetYourFlavor({
    manager = null,
    foundryCustomizer = null,
    runtime = null
} = {}) {
    if (!game.user?.isGM) {
        throw new Error('Only the GM can run the Your Flavor factory reset.');
    }

    clearFoundryCustomizerRuntime(foundryCustomizer);
    runtime?.clearRuntimeState?.();

    const result = {
        worldSettings: 0,
        clientSettings: 0,
        usersReset: 0,
        userFlags: 0
    };

    for (const [key, defaultValue] of WORLD_SETTING_DEFAULTS) {
        await game.settings.set(MODULE_ID, key, cloneDefault(defaultValue));
        result.worldSettings += 1;
    }

    for (const [key, defaultValue] of CLIENT_SETTING_DEFAULTS) {
        await game.settings.set(MODULE_ID, key, cloneDefault(defaultValue));
        result.clientSettings += 1;
    }

    const users = getWorldUsers();
    for (const user of users) {
        const unsetCount = await unsetModuleUserFlags(user);
        if (unsetCount > 0) {
            result.usersReset += 1;
            result.userFlags += unsetCount;
        }
    }

    manager?._resetRuntimeState?.();
    runtime?.clearRuntimeState?.();
    clearFoundryCustomizerRuntime(foundryCustomizer);
    foundryCustomizer?.refreshFromSettings?.();

    return result;
}

function clearFoundryCustomizerRuntime(foundryCustomizer) {
    if (typeof foundryCustomizer?.clearRuntimeState === 'function') {
        foundryCustomizer.clearRuntimeState();
        return;
    }
    foundryCustomizer?.clearCustomization?.();
}

function cloneDefault(defaultValue) {
    const value = typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    return foundry.utils.deepClone(value);
}

function getWorldUsers() {
    if (Array.isArray(game.users)) return game.users;
    if (Array.isArray(game.users?.contents)) return game.users.contents;
    if (typeof game.users?.forEach === 'function') {
        const users = [];
        game.users.forEach(user => users.push(user));
        return users;
    }
    return game.user ? [game.user] : [];
}

async function unsetModuleUserFlags(user) {
    if (!user?.unsetFlag || !user?.getFlag) return 0;

    let count = 0;
    for (const key of USER_FLAG_KEYS) {
        if (user.getFlag(MODULE_ID, key) === undefined) continue;
        await user.unsetFlag(MODULE_ID, key);
        count += 1;
    }
    return count;
}
