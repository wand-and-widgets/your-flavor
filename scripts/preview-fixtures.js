/**
 * Local preview fixtures for the Your Flavor 4.0 preview workflow.
 * These are static, trusted examples that future preview UI can render without
 * needing live chat messages or system documents.
 */

export const PREVIEW_FIXTURE_IDS = Object.freeze({
    CHAT_SIMPLE: 'chat-simple',
    CHAT_WHISPER: 'chat-whisper',
    ROLL_BASIC: 'roll-basic',
    ROLL_TOOLTIP: 'roll-tooltip',
    ITEM_CARD_DND5E: 'item-card-dnd5e',
    ACTION_CARD_PF2E: 'action-card-pf2e',
    SYSTEM_CARD_GENERIC: 'system-card-generic'
});

export const PREVIEW_FIXTURE_GROUPS = Object.freeze({
    CHAT: 'chat',
    ROLLS: 'rolls',
    CARDS: 'cards',
    SYSTEM: 'system'
});

const DEFAULT_CONTEXT = Object.freeze({
    speakerName: 'Preview Hero',
    speakerAvatar: 'icons/svg/mystery-man.svg',
    timestamp: 'now'
});

const FIXTURE_BLUEPRINTS = Object.freeze([
    {
        id: PREVIEW_FIXTURE_IDS.CHAT_SIMPLE,
        group: PREVIEW_FIXTURE_GROUPS.CHAT,
        system: 'generic',
        labelKey: 'YOUR_FLAVOR.PreviewFixtures.ChatSimple.Label',
        descriptionKey: 'YOUR_FLAVOR.PreviewFixtures.ChatSimple.Description',
        contentKey: 'YOUR_FLAVOR.PreviewFixtures.ChatSimple.Content',
        buildHtml: ({ localize }) => `<p>${escapeHtml(localize('YOUR_FLAVOR.PreviewFixtures.ChatSimple.Content'))}</p>`
    },
    {
        id: PREVIEW_FIXTURE_IDS.CHAT_WHISPER,
        group: PREVIEW_FIXTURE_GROUPS.CHAT,
        system: 'generic',
        labelKey: 'YOUR_FLAVOR.PreviewFixtures.Whisper.Label',
        descriptionKey: 'YOUR_FLAVOR.PreviewFixtures.Whisper.Description',
        contentKey: 'YOUR_FLAVOR.PreviewFixtures.Whisper.Content',
        messageClasses: ['whisper'],
        buildHtml: ({ localize }) => `
            <div class="yf-preview-fixture-badge">
                <i class="fas fa-user-secret"></i>
                <span>${escapeHtml(localize('YOUR_FLAVOR.PreviewFixtures.Whisper.Badge'))}</span>
            </div>
            <p>${escapeHtml(localize('YOUR_FLAVOR.PreviewFixtures.Whisper.Content'))}</p>
        `
    },
    {
        id: PREVIEW_FIXTURE_IDS.ROLL_BASIC,
        group: PREVIEW_FIXTURE_GROUPS.ROLLS,
        system: 'generic',
        labelKey: 'YOUR_FLAVOR.PreviewFixtures.RollBasic.Label',
        descriptionKey: 'YOUR_FLAVOR.PreviewFixtures.RollBasic.Description',
        contentKey: 'YOUR_FLAVOR.PreviewFixtures.RollBasic.Content',
        messageClasses: ['roll-message'],
        buildHtml: ({ localize }) => `
            <p>${escapeHtml(localize('YOUR_FLAVOR.PreviewFixtures.RollBasic.Content'))}</p>
            <div class="yf-preview-roll">
                <div class="dice-formula">1d20 + 5</div>
                <div class="dice-result">
                    <span class="dice-total">18</span>
                </div>
            </div>
        `
    },
    {
        id: PREVIEW_FIXTURE_IDS.ROLL_TOOLTIP,
        group: PREVIEW_FIXTURE_GROUPS.ROLLS,
        system: 'generic',
        labelKey: 'YOUR_FLAVOR.PreviewFixtures.RollTooltip.Label',
        descriptionKey: 'YOUR_FLAVOR.PreviewFixtures.RollTooltip.Description',
        contentKey: 'YOUR_FLAVOR.PreviewFixtures.RollTooltip.Content',
        messageClasses: ['roll-message'],
        buildHtml: ({ localize }) => `
            <p>${escapeHtml(localize('YOUR_FLAVOR.PreviewFixtures.RollTooltip.Content'))}</p>
            <div class="yf-preview-roll">
                <div class="dice-formula">2d6 + 3</div>
                <div class="dice-tooltip expanded">
                    <section class="tooltip-part">
                        <div class="dice">
                            <span class="part-formula">2d6</span>
                            <span class="part-total">9</span>
                        </div>
                        <ol class="dice-rolls">
                            <li class="roll die d6">4</li>
                            <li class="roll die d6">5</li>
                        </ol>
                    </section>
                </div>
                <div class="dice-result">
                    <span class="dice-total">12</span>
                </div>
            </div>
        `
    },
    {
        id: PREVIEW_FIXTURE_IDS.ITEM_CARD_DND5E,
        group: PREVIEW_FIXTURE_GROUPS.CARDS,
        system: 'dnd5e',
        labelKey: 'YOUR_FLAVOR.PreviewFixtures.ItemCard.Label',
        descriptionKey: 'YOUR_FLAVOR.PreviewFixtures.ItemCard.Description',
        contentKey: 'YOUR_FLAVOR.PreviewFixtures.ItemCard.Content',
        messageClasses: ['item-card', 'dnd5e'],
        buildHtml: ({ localize }) => `
            <article class="yf-preview-item-card dnd5e chat-card item-card">
                <header class="card-header flexrow">
                    <img src="icons/svg/sword.svg" alt="" />
                    <h3>${escapeHtml(localize('YOUR_FLAVOR.PreviewFixtures.ItemCard.Title'))}</h3>
                </header>
                <div class="card-content">
                    <p>${escapeHtml(localize('YOUR_FLAVOR.PreviewFixtures.ItemCard.Content'))}</p>
                </div>
                <div class="card-buttons">
                    <button type="button">${escapeHtml(localize('YOUR_FLAVOR.PreviewFixtures.ItemCard.Button'))}</button>
                </div>
            </article>
        `
    },
    {
        id: PREVIEW_FIXTURE_IDS.ACTION_CARD_PF2E,
        group: PREVIEW_FIXTURE_GROUPS.CARDS,
        system: 'pf2e',
        labelKey: 'YOUR_FLAVOR.PreviewFixtures.Pf2eActionCard.Label',
        descriptionKey: 'YOUR_FLAVOR.PreviewFixtures.Pf2eActionCard.Description',
        contentKey: 'YOUR_FLAVOR.PreviewFixtures.Pf2eActionCard.Content',
        messageClasses: ['system-card', 'pf2e', 'chat-card', 'action-card'],
        buildHtml: ({ localize }) => `
            <article class="pf2e chat-card action-card yf-preview-pf2e-action-card">
                <header class="card-header flexrow">
                    <img src="icons/svg/aura.svg" alt="" />
                    <h3>${escapeHtml(localize('YOUR_FLAVOR.PreviewFixtures.Pf2eActionCard.Title'))}</h3>
                    <div class="tags paizo-style">
                        <span class="tag">${escapeHtml(localize('YOUR_FLAVOR.PreviewFixtures.Pf2eActionCard.Trait'))}</span>
                    </div>
                </header>
                <div class="card-content">
                    <p>${escapeHtml(localize('YOUR_FLAVOR.PreviewFixtures.Pf2eActionCard.Content'))}</p>
                </div>
                <div class="card-buttons">
                    <button type="button" data-action="strike-attack">${escapeHtml(localize('YOUR_FLAVOR.PreviewFixtures.Pf2eActionCard.Button'))}</button>
                </div>
                <footer>
                    <span>${escapeHtml(localize('YOUR_FLAVOR.PreviewFixtures.Pf2eActionCard.Footer'))}</span>
                </footer>
            </article>
        `
    },
    {
        id: PREVIEW_FIXTURE_IDS.SYSTEM_CARD_GENERIC,
        group: PREVIEW_FIXTURE_GROUPS.SYSTEM,
        system: 'generic',
        labelKey: 'YOUR_FLAVOR.PreviewFixtures.SystemCard.Label',
        descriptionKey: 'YOUR_FLAVOR.PreviewFixtures.SystemCard.Description',
        contentKey: 'YOUR_FLAVOR.PreviewFixtures.SystemCard.Content',
        messageClasses: ['system-card'],
        buildHtml: ({ localize }) => `
            <section class="yf-preview-system-card">
                <header>${escapeHtml(localize('YOUR_FLAVOR.PreviewFixtures.SystemCard.Title'))}</header>
                <p>${escapeHtml(localize('YOUR_FLAVOR.PreviewFixtures.SystemCard.Content'))}</p>
                <table>
                    <tbody>
                        <tr>
                            <th>${escapeHtml(localize('YOUR_FLAVOR.PreviewFixtures.SystemCard.TableLabel'))}</th>
                            <td>+2</td>
                        </tr>
                    </tbody>
                </table>
            </section>
        `
    }
]);

/**
 * Build all local preview fixtures.
 * @param {Object} context
 * @returns {Array<Object>}
 */
export function createPreviewFixtures(context = {}) {
    const fixtureContext = normalizeContext(context);

    return FIXTURE_BLUEPRINTS.map(blueprint => buildFixture(blueprint, fixtureContext));
}

/**
 * Return a single preview fixture by id.
 * @param {string} id
 * @param {Object} context
 * @returns {Object|null}
 */
export function getPreviewFixture(id, context = {}) {
    const fixtures = createPreviewFixtures(context);
    return fixtures.find(fixture => fixture.id === id) ?? null;
}

/**
 * Return the fixture used by the current single-card preview.
 * @param {Object} context
 * @returns {Object}
 */
export function getDefaultPreviewFixture(context = {}) {
    return getPreviewFixture(PREVIEW_FIXTURE_IDS.CHAT_SIMPLE, context)
        ?? createPreviewFixtures(context)[0];
}

function buildFixture(blueprint, context) {
    const localize = context.localize;

    return {
        id: blueprint.id,
        group: blueprint.group,
        system: blueprint.system,
        label: localize(blueprint.labelKey),
        description: localize(blueprint.descriptionKey),
        contentText: localize(blueprint.contentKey),
        speaker: {
            name: context.speakerName,
            avatar: context.speakerAvatar
        },
        timestamp: context.timestamp,
        messageClasses: [...(blueprint.messageClasses ?? [])],
        html: collapseFixtureHtml(blueprint.buildHtml({ localize }))
    };
}

function normalizeContext(context) {
    const source = { ...DEFAULT_CONTEXT, ...context };
    const localize = typeof source.localize === 'function'
        ? source.localize
        : key => key;

    return {
        speakerName: source.speakerName || DEFAULT_CONTEXT.speakerName,
        speakerAvatar: source.speakerAvatar || DEFAULT_CONTEXT.speakerAvatar,
        timestamp: source.timestamp || DEFAULT_CONTEXT.timestamp,
        localize
    };
}

function collapseFixtureHtml(html) {
    return String(html || '').replace(/\s{2,}/g, ' ').trim();
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
