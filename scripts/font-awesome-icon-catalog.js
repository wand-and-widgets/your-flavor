/**
 * Curated Font Awesome picker catalog for Foundry/RPG/UI icon overrides.
 * The config app runtime filters this list against the Font Awesome subset
 * actually loaded by Foundry before presenting choices.
 */

export const FONT_AWESOME_ICON_PICKER_CATEGORIES = Object.freeze([
    {
        id: 'recommended',
        icon: 'fas fa-star',
        labelKey: 'YOUR_FLAVOR.Config.IconTabs.IconPickerCategories.Recommended'
    },
    {
        id: 'common',
        icon: 'fas fa-icons',
        labelKey: 'YOUR_FLAVOR.Config.IconTabs.IconPickerCategories.Common'
    },
    {
        id: 'combat',
        icon: 'fas fa-shield-halved',
        labelKey: 'YOUR_FLAVOR.Config.IconTabs.IconPickerCategories.Combat'
    },
    {
        id: 'magic',
        icon: 'fas fa-wand-magic-sparkles',
        labelKey: 'YOUR_FLAVOR.Config.IconTabs.IconPickerCategories.Magic'
    },
    {
        id: 'music',
        icon: 'fas fa-record-vinyl',
        labelKey: 'YOUR_FLAVOR.Config.IconTabs.IconPickerCategories.MusicAudio'
    },
    {
        id: 'dice',
        icon: 'fas fa-dice-d20',
        labelKey: 'YOUR_FLAVOR.Config.IconTabs.IconPickerCategories.DiceRolls'
    },
    {
        id: 'characters',
        icon: 'fas fa-user-group',
        labelKey: 'YOUR_FLAVOR.Config.IconTabs.IconPickerCategories.Characters'
    },
    {
        id: 'creatures',
        icon: 'fas fa-dragon',
        labelKey: 'YOUR_FLAVOR.Config.IconTabs.IconPickerCategories.Creatures'
    },
    {
        id: 'items',
        icon: 'fas fa-gem',
        labelKey: 'YOUR_FLAVOR.Config.IconTabs.IconPickerCategories.Items'
    },
    {
        id: 'maps',
        icon: 'fas fa-map-location-dot',
        labelKey: 'YOUR_FLAVOR.Config.IconTabs.IconPickerCategories.MapsTravel'
    },
    {
        id: 'interface',
        icon: 'fas fa-sliders',
        labelKey: 'YOUR_FLAVOR.Config.IconTabs.IconPickerCategories.InterfaceActions'
    },
    {
        id: 'status',
        icon: 'fas fa-heart-pulse',
        labelKey: 'YOUR_FLAVOR.Config.IconTabs.IconPickerCategories.StatusConditions'
    },
    {
        id: 'social',
        icon: 'fas fa-comments',
        labelKey: 'YOUR_FLAVOR.Config.IconTabs.IconPickerCategories.Social'
    },
    {
        id: 'nature',
        icon: 'fas fa-cloud-bolt',
        labelKey: 'YOUR_FLAVOR.Config.IconTabs.IconPickerCategories.NatureWeather'
    },
    {
        id: 'horror',
        icon: 'fas fa-skull-crossbones',
        labelKey: 'YOUR_FLAVOR.Config.IconTabs.IconPickerCategories.HorrorDeath'
    },
    {
        id: 'tech',
        icon: 'fas fa-microchip',
        labelKey: 'YOUR_FLAVOR.Config.IconTabs.IconPickerCategories.TechModern'
    },
    {
        id: 'all',
        icon: 'fas fa-table-cells-large',
        labelKey: 'YOUR_FLAVOR.Config.IconTabs.IconPickerCategories.All'
    }
]);

export const FONT_AWESOME_ICON_PICKER_CATALOG = Object.freeze([
    icon('Icons', 'fas fa-icons', 'common', 'font awesome picker ui symbol', true),
    icon('Star', 'fas fa-star', 'common', 'favorite mark important estrela favorito', true),
    icon('Bookmark', 'fas fa-bookmark', 'common', 'save marker journal favorito'),
    icon('Flag', 'fas fa-flag', 'common', 'marker objective banner mission'),
    icon('Bell', 'fas fa-bell', 'common', 'alert notification aviso'),
    icon('Info', 'fas fa-circle-info', 'common', 'help notice information'),
    icon('Warning', 'fas fa-triangle-exclamation', 'common', 'danger alert warning aviso', true),
    icon('Question', 'fas fa-circle-question', 'common', 'help unknown mystery'),
    icon('Search', 'fas fa-magnifying-glass', 'common', 'find inspect buscar'),
    icon('Filter', 'fas fa-filter', 'common', 'sort search narrow'),
    icon('List', 'fas fa-list', 'common', 'menu list index'),
    icon('Bars', 'fas fa-bars', 'common', 'menu navigation'),
    icon('Layer Group', 'fas fa-layer-group', 'common', 'layers stack scene'),
    icon('Clipboard', 'fas fa-clipboard', 'common', 'notes copy checklist'),
    icon('Clipboard List', 'fas fa-clipboard-list', 'common', 'task checklist notes'),

    icon('Sword', 'fas fa-sword', 'combat', 'weapon attack melee blade espada', true),
    icon('Swords', 'fas fa-swords', 'combat', 'weapons combat melee attack'),
    icon('Shield', 'fas fa-shield-halved', 'combat', 'armor defense protection escudo', true),
    icon('Shield Plain', 'fas fa-shield', 'combat', 'armor defense guard'),
    icon('Crosshairs', 'fas fa-crosshairs', 'combat', 'target aim token mira', true),
    icon('Bullseye', 'fas fa-bullseye', 'combat', 'target aim select alvo'),
    icon('Bolt', 'fas fa-bolt', 'combat', 'damage lightning fast action'),
    icon('Explosion', 'fas fa-explosion', 'combat', 'blast damage area'),
    icon('Bomb', 'fas fa-bomb', 'combat', 'explosive trap attack'),
    icon('Fire', 'fas fa-fire', 'combat', 'flame burn damage fogo'),
    icon('Fist', 'fas fa-hand-fist', 'combat', 'unarmed strike monk punch'),
    icon('Gavel', 'fas fa-gavel', 'combat', 'hammer strike judgment'),
    icon('User Shield', 'fas fa-user-shield', 'combat', 'guard protector defense'),
    icon('Skull Crossbones', 'fas fa-skull-crossbones', 'combat', 'deadly poison death perigo'),
    icon('Chess Knight', 'fas fa-chess-knight', 'combat', 'tactics cavalry knight'),

    icon('Wand Sparkles', 'fas fa-wand-magic-sparkles', 'magic', 'spell magic wizard magia', true),
    icon('Magic Wand', 'fas fa-wand-sparkles', 'magic', 'spell cast arcane'),
    icon('Hat Wizard', 'fas fa-hat-wizard', 'magic', 'wizard mage spell'),
    icon('Scroll', 'fas fa-scroll', 'magic', 'spell parchment lore pergaminho', true),
    icon('Book Open', 'fas fa-book-open', 'magic', 'journal lore rules livro', true),
    icon('Book Skull', 'fas fa-book-skull', 'magic', 'necromancy cursed grimoire'),
    icon('Flask', 'fas fa-flask', 'magic', 'alchemy potion science alquimia'),
    icon('Vial', 'fas fa-vial', 'magic', 'potion sample alchemy'),
    icon('Mortar Pestle', 'fas fa-mortar-pestle', 'magic', 'alchemy herbs craft'),
    icon('Meteor', 'fas fa-meteor', 'magic', 'cosmic spell star'),
    icon('Moon', 'fas fa-moon', 'magic', 'night lunar dark'),
    icon('Sun', 'fas fa-sun', 'magic', 'light solar radiant'),
    icon('Atom', 'fas fa-atom', 'magic', 'arcane science energy'),
    icon('Ankh', 'fas fa-ankh', 'magic', 'divine symbol relic'),
    icon('Hamsa', 'fas fa-hamsa', 'magic', 'ward protection symbol'),
    icon('Yin Yang', 'fas fa-yin-yang', 'magic', 'balance mystic symbol'),

    icon('Music', 'fas fa-music', 'music', 'audio jukebox playlist song bard musica', true),
    icon('Record', 'fas fa-record-vinyl', 'music', 'music audio vinyl jukebox disco', true),
    icon('Compact Disc', 'fas fa-compact-disc', 'music', 'music audio cd'),
    icon('Play', 'fas fa-play', 'music', 'audio media start tocar', true),
    icon('Pause', 'fas fa-pause', 'music', 'audio media wait pausar', true),
    icon('Stop', 'fas fa-stop', 'music', 'audio media end parar', true),
    icon('Step Backward', 'fas fa-backward-step', 'music', 'audio previous track'),
    icon('Step Forward', 'fas fa-forward-step', 'music', 'audio next track'),
    icon('Volume High', 'fas fa-volume-high', 'music', 'audio sound speaker loud volume', true),
    icon('Volume Low', 'fas fa-volume-low', 'music', 'audio sound speaker quiet'),
    icon('Muted', 'fas fa-volume-xmark', 'music', 'audio sound speaker mute silent mudo', true),
    icon('Headphones', 'fas fa-headphones', 'music', 'audio listen'),
    icon('Microphone', 'fas fa-microphone', 'music', 'voice audio speak'),
    icon('Radio', 'fas fa-radio', 'music', 'audio broadcast'),
    icon('Podcast', 'fas fa-podcast', 'music', 'audio broadcast show'),

    icon('Dice D20', 'fas fa-dice-d20', 'dice', 'roll die rpg tabletop dado d20', true),
    icon('Dice D6', 'fas fa-dice-d6', 'dice', 'roll die cube dado'),
    icon('Dice', 'fas fa-dice', 'dice', 'roll random rpg tabletop dados', true),
    icon('Dice One', 'fas fa-dice-one', 'dice', 'roll die one'),
    icon('Dice Two', 'fas fa-dice-two', 'dice', 'roll die two'),
    icon('Dice Three', 'fas fa-dice-three', 'dice', 'roll die three'),
    icon('Dice Four', 'fas fa-dice-four', 'dice', 'roll die four'),
    icon('Dice Five', 'fas fa-dice-five', 'dice', 'roll die five'),
    icon('Dice Six', 'fas fa-dice-six', 'dice', 'roll die six'),
    icon('Shuffle', 'fas fa-shuffle', 'dice', 'random mix'),
    icon('Rotate', 'fas fa-rotate', 'dice', 'reroll refresh'),
    icon('Percent', 'fas fa-percent', 'dice', 'chance percentile'),

    icon('User', 'fas fa-user', 'characters', 'actor player character person usuario', true),
    icon('Users', 'fas fa-users', 'characters', 'party players group grupo', true),
    icon('User Group', 'fas fa-user-group', 'characters', 'party group team'),
    icon('User Plus', 'fas fa-user-plus', 'characters', 'add actor invite'),
    icon('User Check', 'fas fa-user-check', 'characters', 'ready active player'),
    icon('User Gear', 'fas fa-user-gear', 'characters', 'manage player actor settings'),
    icon('User Secret', 'fas fa-user-secret', 'characters', 'hidden npc spy'),
    icon('Person', 'fas fa-person', 'characters', 'actor token humanoid'),
    icon('Walking', 'fas fa-person-walking', 'characters', 'move travel walk'),
    icon('Running', 'fas fa-person-running', 'characters', 'move speed run'),
    icon('Hiking', 'fas fa-person-hiking', 'characters', 'travel adventurer'),
    icon('Crown', 'fas fa-crown', 'characters', 'king leader royal'),
    icon('Mask', 'fas fa-mask', 'characters', 'disguise rogue hidden'),
    icon('Theater Masks', 'fas fa-masks-theater', 'characters', 'roleplay drama bard'),

    icon('Dragon', 'fas fa-dragon', 'creatures', 'monster creature beast dragao', true),
    icon('Ghost', 'fas fa-ghost', 'creatures', 'undead spirit haunting fantasma', true),
    icon('Spider', 'fas fa-spider', 'creatures', 'monster web vermin'),
    icon('Horse', 'fas fa-horse', 'creatures', 'mount travel cavalry'),
    icon('Paw', 'fas fa-paw', 'creatures', 'beast animal companion'),
    icon('Fish', 'fas fa-fish', 'creatures', 'aquatic beast'),
    icon('Frog', 'fas fa-frog', 'creatures', 'swamp familiar'),
    icon('Bug', 'fas fa-bug', 'creatures', 'vermin swarm insect'),
    icon('Worm', 'fas fa-worm', 'creatures', 'vermin monster'),
    icon('Locust', 'fas fa-locust', 'creatures', 'swarm insect plague'),

    icon('Suitcase', 'fas fa-suitcase', 'items', 'inventory item bag mala', true),
    icon('Box Open', 'fas fa-box-open', 'items', 'inventory chest loot caixa'),
    icon('Boxes', 'fas fa-boxes-stacked', 'items', 'inventory storage loot'),
    icon('Gem', 'fas fa-gem', 'items', 'treasure jewel loot gema', true),
    icon('Coins', 'fas fa-coins', 'items', 'money treasure gold moedas'),
    icon('Sack Money', 'fas fa-sack-dollar', 'items', 'money treasure gold loot'),
    icon('Key', 'fas fa-key', 'items', 'lock door secret chave', true),
    icon('Lock', 'fas fa-lock', 'items', 'secure locked permission tranca'),
    icon('Unlock', 'fas fa-unlock', 'items', 'open unlocked permission'),
    icon('Bottle', 'fas fa-bottle-droplet', 'items', 'potion liquid vial'),
    icon('Wine Bottle', 'fas fa-wine-bottle', 'items', 'drink tavern bottle'),
    icon('Mug', 'fas fa-mug-saucer', 'items', 'drink tavern rest'),
    icon('Feather', 'fas fa-feather', 'items', 'quill note writing'),
    icon('Hammer', 'fas fa-hammer', 'items', 'craft forge tool'),
    icon('Wrench', 'fas fa-wrench', 'items', 'tool repair'),
    icon('Toolbox', 'fas fa-toolbox', 'items', 'tools repair craft'),
    icon('Magnet', 'fas fa-magnet', 'items', 'pull metal'),
    icon('Ring', 'fas fa-ring', 'items', 'jewelry magic item'),

    icon('Map', 'fas fa-map', 'maps', 'scene navigation travel mapa', true),
    icon('Map Location', 'fas fa-map-location-dot', 'maps', 'scene navigation travel pin'),
    icon('Location Dot', 'fas fa-location-dot', 'maps', 'pin marker place'),
    icon('Map Pin', 'fas fa-map-pin', 'maps', 'pin marker location'),
    icon('Compass', 'fas fa-compass', 'maps', 'navigation travel direction bussola', true),
    icon('Route', 'fas fa-route', 'maps', 'path travel journey'),
    icon('Road', 'fas fa-road', 'maps', 'path route travel'),
    icon('Mountain', 'fas fa-mountain', 'maps', 'terrain travel'),
    icon('Tent', 'fas fa-tent', 'maps', 'camp travel rest'),
    icon('Campground', 'fas fa-campground', 'maps', 'camp travel rest'),
    icon('Sign Posts', 'fas fa-signs-post', 'maps', 'direction travel sign'),
    icon('Globe', 'fas fa-globe', 'maps', 'world travel'),
    icon('Landmark', 'fas fa-landmark', 'maps', 'city place temple'),
    icon('Archway', 'fas fa-archway', 'maps', 'gate portal place'),
    icon('Dungeon', 'fas fa-dungeon', 'maps', 'dungeon gate adventure'),
    icon('House', 'fas fa-house', 'maps', 'home town building'),

    icon('Gear', 'fas fa-gear', 'interface', 'settings configure system engrenagem', true),
    icon('Gears', 'fas fa-gears', 'interface', 'settings configure tools', true),
    icon('Sliders', 'fas fa-sliders', 'interface', 'settings adjust controls'),
    icon('Palette', 'fas fa-palette', 'interface', 'color style theme'),
    icon('Brush', 'fas fa-paintbrush', 'interface', 'paint style color'),
    icon('Pen', 'fas fa-pen', 'interface', 'edit write'),
    icon('Edit', 'fas fa-pen-to-square', 'interface', 'edit form'),
    icon('Plus', 'fas fa-plus', 'interface', 'add create new adicionar', true),
    icon('Minus', 'fas fa-minus', 'interface', 'remove collapse'),
    icon('Close', 'fas fa-xmark', 'interface', 'close cancel remove'),
    icon('Check', 'fas fa-check', 'interface', 'confirm done'),
    icon('Trash', 'fas fa-trash', 'interface', 'delete remove clear lixo', true),
    icon('Undo', 'fas fa-rotate-left', 'interface', 'undo reset back'),
    icon('Redo', 'fas fa-rotate-right', 'interface', 'redo forward'),
    icon('Refresh', 'fas fa-arrows-rotate', 'interface', 'refresh reload sync'),
    icon('Eye', 'fas fa-eye', 'interface', 'visible view observe olho', true),
    icon('Hidden', 'fas fa-eye-slash', 'interface', 'invisible hidden secret oculto', true),
    icon('Expand', 'fas fa-expand', 'interface', 'fullscreen open'),
    icon('Compress', 'fas fa-compress', 'interface', 'collapse shrink'),
    icon('Caret Up', 'fas fa-caret-up', 'interface', 'collapse up'),
    icon('Chevron Down', 'fas fa-chevron-down', 'interface', 'expand down'),

    icon('Heart', 'fas fa-heart', 'status', 'health life hp vida', true),
    icon('Heart Pulse', 'fas fa-heart-pulse', 'status', 'health life medicine'),
    icon('Heart Crack', 'fas fa-heart-crack', 'status', 'wounded broken condition'),
    icon('Droplet', 'fas fa-droplet', 'status', 'blood water condition'),
    icon('Circle', 'fas fa-circle', 'status', 'dot status active'),
    icon('Circle Dot', 'far fa-circle-dot', 'status', 'selected active target'),
    icon('Toggle On', 'fas fa-toggle-on', 'status', 'enabled active on'),
    icon('Toggle Off', 'fas fa-toggle-off', 'status', 'disabled inactive off'),
    icon('Check Circle', 'fas fa-circle-check', 'status', 'success ready'),
    icon('X Circle', 'fas fa-circle-xmark', 'status', 'failure blocked'),
    icon('Ban', 'fas fa-ban', 'status', 'blocked forbidden condition'),
    icon('Hourglass', 'fas fa-hourglass-half', 'status', 'time wait duration'),
    icon('Clock', 'fas fa-clock', 'status', 'time initiative turn'),
    icon('Snowflake', 'fas fa-snowflake', 'status', 'cold frozen gelo'),
    icon('Fire Flame', 'fas fa-fire-flame-curved', 'status', 'burning fire condition'),

    icon('Comments', 'fas fa-comments', 'social', 'chat talk conversation', true),
    icon('Comment', 'fas fa-comment', 'social', 'chat message'),
    icon('Comment Dots', 'fas fa-comment-dots', 'social', 'chat typing message'),
    icon('Envelope', 'fas fa-envelope', 'social', 'mail whisper message'),
    icon('Paper Plane', 'fas fa-paper-plane', 'social', 'send message'),
    icon('Hand', 'fas fa-hand', 'social', 'stop gesture'),
    icon('Point Up', 'fas fa-hand-point-up', 'social', 'select click gesture'),
    icon('Handshake', 'fas fa-handshake', 'social', 'deal agreement'),
    icon('People Group', 'fas fa-people-group', 'social', 'party faction group'),
    icon('Bullhorn', 'fas fa-bullhorn', 'social', 'announce shout'),
    icon('Smile', 'fas fa-face-smile', 'social', 'emotion happy'),
    icon('Frown', 'fas fa-face-frown', 'social', 'emotion sad'),

    icon('Tree', 'fas fa-tree', 'nature', 'forest nature arvore', true),
    icon('Leaf', 'fas fa-leaf', 'nature', 'nature plant druida'),
    icon('Seedling', 'fas fa-seedling', 'nature', 'plant growth'),
    icon('Water', 'fas fa-water', 'nature', 'river sea element agua'),
    icon('Cloud', 'fas fa-cloud', 'nature', 'weather sky'),
    icon('Cloud Rain', 'fas fa-cloud-rain', 'nature', 'weather rain chuva'),
    icon('Cloud Bolt', 'fas fa-cloud-bolt', 'nature', 'weather storm lightning'),
    icon('Wind', 'fas fa-wind', 'nature', 'weather air vento'),
    icon('Tornado', 'fas fa-tornado', 'nature', 'weather storm'),
    icon('Umbrella', 'fas fa-umbrella', 'nature', 'weather rain'),
    icon('Temperature', 'fas fa-temperature-half', 'nature', 'weather heat cold'),
    icon('Icicles', 'fas fa-icicles', 'nature', 'cold ice frozen'),

    icon('Skull', 'fas fa-skull', 'horror', 'death danger undead caveira', true),
    icon('Coffin', 'fas fa-coffin', 'horror', 'death burial vampire'),
    icon('Tombstone', 'fas fa-tombstone', 'horror', 'death grave undead'),
    icon('Biohazard', 'fas fa-biohazard', 'horror', 'plague disease danger'),
    icon('Radiation', 'fas fa-radiation', 'horror', 'hazard mutation'),
    icon('Virus', 'fas fa-virus', 'horror', 'disease infection'),
    icon('Disease', 'fas fa-disease', 'horror', 'plague infection'),
    icon('Cross', 'fas fa-cross', 'horror', 'grave holy ward'),

    icon('Desktop', 'fas fa-desktop', 'tech', 'computer screen modern'),
    icon('Laptop', 'fas fa-laptop', 'tech', 'computer modern'),
    icon('Mobile', 'fas fa-mobile-screen-button', 'tech', 'phone device'),
    icon('Tablet', 'fas fa-tablet-screen-button', 'tech', 'device screen'),
    icon('Server', 'fas fa-server', 'tech', 'computer data'),
    icon('Database', 'fas fa-database', 'tech', 'data storage'),
    icon('Network', 'fas fa-network-wired', 'tech', 'connection system'),
    icon('Microchip', 'fas fa-microchip', 'tech', 'chip computer'),
    icon('Robot', 'fas fa-robot', 'tech', 'machine automation'),
    icon('Plug', 'fas fa-plug', 'tech', 'power connection'),
    icon('Power', 'fas fa-power-off', 'tech', 'shutdown on off'),
    icon('Wifi', 'fas fa-wifi', 'tech', 'wireless signal'),
    icon('Signal', 'fas fa-signal', 'tech', 'wireless strength'),
    icon('Camera', 'fas fa-camera', 'tech', 'photo capture'),
    icon('Video', 'fas fa-video', 'tech', 'camera stream'),
    icon('Satellite Dish', 'fas fa-satellite-dish', 'tech', 'broadcast signal')
]);

function icon(label, iconClass, category, keywords = '', recommended = false) {
    return Object.freeze({
        label,
        iconClass,
        category,
        keywords,
        recommended
    });
}
