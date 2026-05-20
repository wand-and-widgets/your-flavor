/**
 * Your Flavor - Foundry compatibility helpers
 * Keep version and API shape differences in one place while v13/v14 support settles.
 */

export const FOUNDRY_HOOKS = Object.freeze({
    CHAT_RENDER_HTML: 'renderChatMessageHTML',
    CHAT_RENDER_LEGACY: 'renderChatMessage',
    SCENE_CONTROL_BUTTONS: 'getSceneControlButtons',
    APPLICATION_V2_RENDER: 'renderApplicationV2',
    PAUSE_GAME: 'pauseGame',
    COLLAPSE_SIDEBAR: 'collapseSidebar'
});

export const ApplicationV2 = foundry.applications.api.ApplicationV2;
export const HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

const TOKEN_CONTROL_NAMES = ['tokens', 'token'];

export function getFoundryVersion() {
    return game?.version ?? game?.data?.version ?? '0';
}

export function getFoundryMajorVersion(version = getFoundryVersion()) {
    const match = String(version).match(/^(\d+)/);
    return Number(match?.[1] ?? 0);
}

export function isFoundryMajorAtLeast(majorVersion) {
    return getFoundryMajorVersion() >= majorVersion;
}

export function normalizeHtmlElement(html) {
    if (html instanceof HTMLElement) return html;
    if (Array.isArray(html)) return html[0] instanceof HTMLElement ? html[0] : null;
    if (globalThis.jQuery && html instanceof globalThis.jQuery) return html[0] ?? null;
    if (html?.[0] instanceof HTMLElement) return html[0];
    return null;
}

export function addSceneControlTool(controls, tool, { controlNames = TOKEN_CONTROL_NAMES } = {}) {
    const control = findSceneControl(controls, controlNames);
    const tools = control?.tools;
    if (!tools) return false;

    const normalizedTool = {
        ...tool,
        order: tool.order ?? getNextSceneToolOrder(tools)
    };

    if (Array.isArray(tools)) {
        const existingIndex = tools.findIndex(existing => existing.name === normalizedTool.name);
        if (existingIndex >= 0) tools[existingIndex] = normalizedTool;
        else tools.push(normalizedTool);
        return true;
    }

    if (tools instanceof Map) {
        tools.set(normalizedTool.name, normalizedTool);
        return true;
    }

    if (typeof tools === 'object') {
        tools[normalizedTool.name] = normalizedTool;
        return true;
    }

    return false;
}

export async function confirmDialog({
    title,
    content,
    yes,
    no,
    defaultYes = true
} = {}) {
    const yesCallback = async (...args) => {
        const result = yes ? await yes(...args) : true;
        return result ?? true;
    };
    const noCallback = async (...args) => {
        const result = no ? await no(...args) : false;
        return result ?? false;
    };

    const DialogV2 = foundry.applications?.api?.DialogV2;
    if (DialogV2?.confirm) {
        const result = await DialogV2.confirm({
            window: title ? { title } : undefined,
            content,
            yes: { callback: yesCallback, default: defaultYes },
            no: { callback: noCallback, default: !defaultYes },
            rejectClose: false,
            modal: true
        });
        return Boolean(result);
    }

    return Boolean(await Dialog.confirm({
        title,
        content,
        yes: yesCallback,
        no: noCallback,
        defaultYes
    }));
}

export function openFilePicker(options = {}) {
    const FilePickerClass = getFilePickerClass();
    if (!FilePickerClass) {
        throw new Error('Foundry FilePicker API is unavailable.');
    }

    const picker = new FilePickerClass(options);
    renderApplication(picker, { force: true });
    return picker;
}

export function getFilePickerClass() {
    return foundry.applications?.apps?.FilePicker ?? globalThis.FilePicker ?? null;
}

export async function preloadHandlebarsTemplates(paths = []) {
    const loader = foundry.applications?.handlebars?.loadTemplates ?? globalThis.loadTemplates;
    if (typeof loader !== 'function') return [];
    return loader(paths);
}

function findSceneControl(controls, controlNames) {
    if (Array.isArray(controls)) {
        return controls.find(control => controlNames.includes(control.name));
    }

    for (const name of controlNames) {
        if (controls?.[name]) return controls[name];
    }

    return null;
}

function getNextSceneToolOrder(tools) {
    if (Array.isArray(tools)) return tools.length;
    if (tools instanceof Map) return tools.size;
    if (typeof tools === 'object') return Object.keys(tools).length;
    return 0;
}

export function renderApplication(application, options = { force: true }) {
    try {
        application.render(options);
    } catch (error) {
        if (!options?.force) throw error;
        application.render(true);
    }
}
