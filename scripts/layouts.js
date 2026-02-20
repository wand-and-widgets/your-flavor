/**
 * Your Flavor - Layout Definitions
 * Pre-defined chat message layouts
 * @module your-flavor/layouts
 */

/**
 * Layout definitions with default styling
 */
export const LAYOUTS = {
    none: {
        id: 'none',
        name: 'YOUR_FLAVOR.Layouts.None.Name',
        description: 'YOUR_FLAVOR.Layouts.None.Description',
        icon: 'fas fa-ban',
        category: 'basic',
        defaults: {}
    },

    // ==========================================
    // BASIC LAYOUTS
    // ==========================================

    elegant: {
        id: 'elegant',
        name: 'YOUR_FLAVOR.Layouts.Elegant.Name',
        description: 'YOUR_FLAVOR.Layouts.Elegant.Description',
        icon: 'fas fa-gem',
        category: 'basic',
        defaults: {
            fontFamily: 'Cinzel',
            fontSize: 14,
            textColor: '#e8dcc8',
            backgroundColor: 'rgba(20, 16, 12, 0.95)',
            borderColor: '#c9a227',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 8,
            padding: 14,
            glowEnabled: false,
            glowColor: '#c9a227',
            glowIntensity: 8,
            shadowEnabled: true
        }
    },

    parchment: {
        id: 'parchment',
        name: 'YOUR_FLAVOR.Layouts.Parchment.Name',
        description: 'YOUR_FLAVOR.Layouts.Parchment.Description',
        icon: 'fas fa-scroll',
        category: 'basic',
        defaults: {
            fontFamily: 'IM Fell English',
            fontSize: 15,
            textColor: '#3d2b1f',
            backgroundColor: '#f4e4bc',
            borderColor: '#8b7355',
            borderStyle: 'double',
            borderWidth: 4,
            borderRadius: 4,
            padding: 16,
            glowEnabled: false,
            shadowEnabled: true
        }
    },

    royal: {
        id: 'royal',
        name: 'YOUR_FLAVOR.Layouts.Royal.Name',
        description: 'YOUR_FLAVOR.Layouts.Royal.Description',
        icon: 'fas fa-crown',
        category: 'basic',
        defaults: {
            fontFamily: 'Uncial Antiqua',
            fontSize: 15,
            textColor: '#ffd700',
            backgroundColor: 'rgba(80, 10, 20, 0.95)',
            borderColor: '#ffd700',
            borderStyle: 'double',
            borderWidth: 4,
            borderRadius: 6,
            padding: 16,
            glowEnabled: true,
            glowColor: '#ffd700',
            glowIntensity: 8,
            shadowEnabled: true
        }
    },

    shadow: {
        id: 'shadow',
        name: 'YOUR_FLAVOR.Layouts.Shadow.Name',
        description: 'YOUR_FLAVOR.Layouts.Shadow.Description',
        icon: 'fas fa-mask',
        category: 'basic',
        defaults: {
            fontFamily: 'Pirata One',
            fontSize: 14,
            textColor: '#b0b0b0',
            backgroundColor: 'rgba(5, 5, 5, 0.98)',
            borderColor: '#333333',
            borderStyle: 'solid',
            borderWidth: 1,
            borderRadius: 4,
            padding: 14,
            glowEnabled: false,
            shadowEnabled: true,
            nameColor: '#888888',
            timestampColor: '#666666'
        }
    },

    // ==========================================
    // CLASS LAYOUTS
    // ==========================================

    warrior: {
        id: 'warrior',
        name: 'YOUR_FLAVOR.Layouts.Warrior.Name',
        description: 'YOUR_FLAVOR.Layouts.Warrior.Description',
        icon: 'fas fa-shield-alt',
        category: 'class',
        defaults: {
            fontFamily: 'Cinzel',
            fontSize: 15,
            textColor: '#e0e0e0',
            backgroundColor: 'rgba(60, 50, 45, 0.95)',
            borderColor: '#8b4513',
            borderStyle: 'ridge',
            borderWidth: 4,
            borderRadius: 4,
            padding: 14,
            glowEnabled: false,
            shadowEnabled: true
        }
    },

    thief: {
        id: 'thief',
        name: 'YOUR_FLAVOR.Layouts.Thief.Name',
        description: 'YOUR_FLAVOR.Layouts.Thief.Description',
        icon: 'fas fa-user-ninja',
        category: 'class',
        defaults: {
            fontFamily: 'Pirata One',
            fontSize: 14,
            textColor: '#a0a0a0',
            backgroundColor: 'rgba(15, 15, 20, 0.98)',
            borderColor: '#4a4a4a',
            borderStyle: 'dashed',
            borderWidth: 2,
            borderRadius: 2,
            padding: 12,
            glowEnabled: false,
            shadowEnabled: true,
            nameColor: '#888888',
            timestampColor: '#666666'
        }
    },

    bard: {
        id: 'bard',
        name: 'YOUR_FLAVOR.Layouts.Bard.Name',
        description: 'YOUR_FLAVOR.Layouts.Bard.Description',
        icon: 'fas fa-music',
        category: 'class',
        defaults: {
            fontFamily: 'Tangerine',
            fontSize: 22,
            textColor: '#ffe4b5',
            backgroundColor: 'rgba(75, 35, 80, 0.95)',
            borderColor: '#da70d6',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 16,
            padding: 16,
            glowEnabled: true,
            glowColor: '#da70d6',
            glowIntensity: 8,
            shadowEnabled: true
        }
    },

    druid: {
        id: 'druid',
        name: 'YOUR_FLAVOR.Layouts.Druid.Name',
        description: 'YOUR_FLAVOR.Layouts.Druid.Description',
        icon: 'fas fa-leaf',
        category: 'class',
        defaults: {
            fontFamily: 'MedievalSharp',
            fontSize: 14,
            textColor: '#c8e6c9',
            backgroundColor: 'rgba(20, 50, 30, 0.95)',
            borderColor: '#4caf50',
            borderStyle: 'solid',
            borderWidth: 3,
            borderRadius: 12,
            padding: 14,
            glowEnabled: true,
            glowColor: '#2e7d32',
            glowIntensity: 10,
            shadowEnabled: true
        }
    },

    barbarian: {
        id: 'barbarian',
        name: 'YOUR_FLAVOR.Layouts.Barbarian.Name',
        description: 'YOUR_FLAVOR.Layouts.Barbarian.Description',
        icon: 'fas fa-axe-battle',
        category: 'class',
        defaults: {
            fontFamily: 'Cinzel',
            fontSize: 16,
            textColor: '#ffccbc',
            backgroundColor: 'rgba(60, 20, 15, 0.95)',
            borderColor: '#d84315',
            borderStyle: 'ridge',
            borderWidth: 5,
            borderRadius: 2,
            padding: 14,
            glowEnabled: true,
            glowColor: '#ff5722',
            glowIntensity: 6,
            shadowEnabled: true
        }
    },

    cleric: {
        id: 'cleric',
        name: 'YOUR_FLAVOR.Layouts.Cleric.Name',
        description: 'YOUR_FLAVOR.Layouts.Cleric.Description',
        icon: 'fas fa-cross',
        category: 'class',
        defaults: {
            fontFamily: 'Almendra',
            fontSize: 14,
            textColor: '#5d4037',
            backgroundColor: 'rgba(255, 248, 240, 0.95)',
            borderColor: '#ffc107',
            borderStyle: 'double',
            borderWidth: 4,
            borderRadius: 8,
            padding: 14,
            glowEnabled: true,
            glowColor: '#ffeb3b',
            glowIntensity: 12,
            shadowEnabled: false
        }
    },

    paladin: {
        id: 'paladin',
        name: 'YOUR_FLAVOR.Layouts.Paladin.Name',
        description: 'YOUR_FLAVOR.Layouts.Paladin.Description',
        icon: 'fas fa-sun',
        category: 'class',
        defaults: {
            fontFamily: 'Cinzel',
            fontSize: 15,
            textColor: '#ffd700',
            backgroundColor: 'rgba(30, 60, 90, 0.95)',
            borderColor: '#ffd700',
            borderStyle: 'double',
            borderWidth: 3,
            borderRadius: 6,
            padding: 14,
            glowEnabled: true,
            glowColor: '#ffd700',
            glowIntensity: 12,
            shadowEnabled: true
        }
    },

    monk: {
        id: 'monk',
        name: 'YOUR_FLAVOR.Layouts.Monk.Name',
        description: 'YOUR_FLAVOR.Layouts.Monk.Description',
        icon: 'fas fa-yin-yang',
        category: 'class',
        defaults: {
            fontFamily: 'Fondamento',
            fontSize: 14,
            textColor: '#d7ccc8',
            backgroundColor: 'rgba(50, 40, 35, 0.95)',
            borderColor: '#8d6e63',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 20,
            padding: 16,
            glowEnabled: false,
            shadowEnabled: true
        }
    },

    sorcerer: {
        id: 'sorcerer',
        name: 'YOUR_FLAVOR.Layouts.Sorcerer.Name',
        description: 'YOUR_FLAVOR.Layouts.Sorcerer.Description',
        icon: 'fas fa-fire',
        category: 'class',
        defaults: {
            fontFamily: 'Cinzel Decorative',
            fontSize: 14,
            textColor: '#ffab91',
            backgroundColor: 'rgba(50, 15, 15, 0.95)',
            borderColor: '#ff5722',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 10,
            padding: 14,
            glowEnabled: true,
            glowColor: '#ff9800',
            glowIntensity: 15,
            shadowEnabled: true
        }
    },

    mage: {
        id: 'mage',
        name: 'YOUR_FLAVOR.Layouts.Mage.Name',
        description: 'YOUR_FLAVOR.Layouts.Mage.Description',
        icon: 'fas fa-hat-wizard',
        category: 'class',
        defaults: {
            fontFamily: 'Cinzel Decorative',
            fontSize: 14,
            textColor: '#d4c4ff',
            backgroundColor: 'rgba(20, 10, 40, 0.95)',
            borderColor: '#8a2be2',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 12,
            padding: 14,
            glowEnabled: true,
            glowColor: '#8a2be2',
            glowIntensity: 12,
            shadowEnabled: true
        }
    },

    ranger: {
        id: 'ranger',
        name: 'YOUR_FLAVOR.Layouts.Ranger.Name',
        description: 'YOUR_FLAVOR.Layouts.Ranger.Description',
        icon: 'fas fa-bow-arrow',
        category: 'class',
        defaults: {
            fontFamily: 'MedievalSharp',
            fontSize: 14,
            textColor: '#c5e1a5',
            backgroundColor: 'rgba(35, 45, 30, 0.95)',
            borderColor: '#689f38',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 6,
            padding: 14,
            glowEnabled: false,
            shadowEnabled: true
        }
    },

    warlock: {
        id: 'warlock',
        name: 'YOUR_FLAVOR.Layouts.Warlock.Name',
        description: 'YOUR_FLAVOR.Layouts.Warlock.Description',
        icon: 'fas fa-skull',
        category: 'class',
        defaults: {
            fontFamily: 'Almendra',
            fontSize: 14,
            textColor: '#ce93d8',
            backgroundColor: 'rgba(30, 10, 35, 0.98)',
            borderColor: '#9c27b0',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 8,
            padding: 14,
            glowEnabled: true,
            glowColor: '#7b1fa2',
            glowIntensity: 10,
            shadowEnabled: true
        }
    },

    // ==========================================
    // RACE LAYOUTS
    // ==========================================

    elf: {
        id: 'elf',
        name: 'YOUR_FLAVOR.Layouts.Elf.Name',
        description: 'YOUR_FLAVOR.Layouts.Elf.Description',
        icon: 'fas fa-spa',
        category: 'race',
        defaults: {
            fontFamily: 'Tangerine',
            fontSize: 20,
            textColor: '#e8f5e9',
            backgroundColor: 'rgba(20, 40, 35, 0.95)',
            borderColor: '#80cbc4',
            borderStyle: 'solid',
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
            glowEnabled: true,
            glowColor: '#4db6ac',
            glowIntensity: 8,
            shadowEnabled: true
        }
    },

    orc: {
        id: 'orc',
        name: 'YOUR_FLAVOR.Layouts.Orc.Name',
        description: 'YOUR_FLAVOR.Layouts.Orc.Description',
        icon: 'fas fa-fist-raised',
        category: 'race',
        defaults: {
            fontFamily: 'Cinzel',
            fontSize: 16,
            textColor: '#a5d6a7',
            backgroundColor: 'rgba(30, 40, 20, 0.95)',
            borderColor: '#558b2f',
            borderStyle: 'ridge',
            borderWidth: 4,
            borderRadius: 2,
            padding: 12,
            glowEnabled: false,
            shadowEnabled: true
        }
    },

    dwarf: {
        id: 'dwarf',
        name: 'YOUR_FLAVOR.Layouts.Dwarf.Name',
        description: 'YOUR_FLAVOR.Layouts.Dwarf.Description',
        icon: 'fas fa-hammer',
        category: 'race',
        defaults: {
            fontFamily: 'Uncial Antiqua',
            fontSize: 14,
            textColor: '#ffe0b2',
            backgroundColor: 'rgba(55, 40, 30, 0.95)',
            borderColor: '#bf8040',
            borderStyle: 'groove',
            borderWidth: 5,
            borderRadius: 4,
            padding: 14,
            glowEnabled: true,
            glowColor: '#ff8f00',
            glowIntensity: 6,
            shadowEnabled: true
        }
    },

    dragon: {
        id: 'dragon',
        name: 'YOUR_FLAVOR.Layouts.Dragon.Name',
        description: 'YOUR_FLAVOR.Layouts.Dragon.Description',
        icon: 'fas fa-dragon',
        category: 'race',
        defaults: {
            fontFamily: 'Cinzel Decorative',
            fontSize: 15,
            textColor: '#ffecb3',
            backgroundColor: 'rgba(60, 20, 10, 0.95)',
            borderColor: '#ff6f00',
            borderStyle: 'ridge',
            borderWidth: 4,
            borderRadius: 8,
            padding: 16,
            glowEnabled: true,
            glowColor: '#ff9100',
            glowIntensity: 18,
            shadowEnabled: true
        }
    },

    // ==========================================
    // THEME LAYOUTS
    // ==========================================

    necromancer: {
        id: 'necromancer',
        name: 'YOUR_FLAVOR.Layouts.Necromancer.Name',
        description: 'YOUR_FLAVOR.Layouts.Necromancer.Description',
        icon: 'fas fa-skull-crossbones',
        category: 'theme',
        defaults: {
            fontFamily: 'Almendra',
            fontSize: 14,
            textColor: '#b8e6b8',
            backgroundColor: 'rgba(10, 15, 10, 0.98)',
            borderColor: '#2d5a2d',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 4,
            padding: 14,
            glowEnabled: true,
            glowColor: '#00ff00',
            glowIntensity: 8,
            shadowEnabled: true
        }
    },

    vampire: {
        id: 'vampire',
        name: 'YOUR_FLAVOR.Layouts.Vampire.Name',
        description: 'YOUR_FLAVOR.Layouts.Vampire.Description',
        icon: 'fas fa-teeth-open',
        category: 'theme',
        defaults: {
            fontFamily: 'Cinzel',
            fontSize: 14,
            textColor: '#e0e0e0',
            backgroundColor: 'rgba(30, 5, 10, 0.98)',
            borderColor: '#8b0000',
            borderStyle: 'double',
            borderWidth: 3,
            borderRadius: 6,
            padding: 14,
            glowEnabled: true,
            glowColor: '#cc0000',
            glowIntensity: 10,
            shadowEnabled: true
        }
    },

    beholder: {
        id: 'beholder',
        name: 'YOUR_FLAVOR.Layouts.Beholder.Name',
        description: 'YOUR_FLAVOR.Layouts.Beholder.Description',
        icon: 'fas fa-eye',
        category: 'theme',
        defaults: {
            fontFamily: 'Cinzel Decorative',
            fontSize: 14,
            textColor: '#ffccff',
            backgroundColor: 'rgba(40, 10, 50, 0.98)',
            borderColor: '#ff00ff',
            borderStyle: 'solid',
            borderWidth: 3,
            borderRadius: 50,
            padding: 16,
            glowEnabled: true,
            glowColor: '#ff00ff',
            glowIntensity: 15,
            shadowEnabled: true
        }
    },

    zombie: {
        id: 'zombie',
        name: 'YOUR_FLAVOR.Layouts.Zombie.Name',
        description: 'YOUR_FLAVOR.Layouts.Zombie.Description',
        icon: 'fas fa-biohazard',
        category: 'theme',
        defaults: {
            fontFamily: 'Pirata One',
            fontSize: 14,
            textColor: '#a8d8a8',
            backgroundColor: 'rgba(30, 35, 25, 0.95)',
            borderColor: '#556b2f',
            borderStyle: 'ridge',
            borderWidth: 4,
            borderRadius: 2,
            padding: 12,
            glowEnabled: false,
            shadowEnabled: true
        }
    },

    fire: {
        id: 'fire',
        name: 'YOUR_FLAVOR.Layouts.Fire.Name',
        description: 'YOUR_FLAVOR.Layouts.Fire.Description',
        icon: 'fas fa-fire-alt',
        category: 'theme',
        defaults: {
            fontFamily: 'Cinzel',
            fontSize: 15,
            textColor: '#ffdd99',
            backgroundColor: 'rgba(50, 15, 5, 0.95)',
            borderColor: '#ff4500',
            borderStyle: 'solid',
            borderWidth: 3,
            borderRadius: 8,
            padding: 14,
            glowEnabled: true,
            glowColor: '#ff6600',
            glowIntensity: 20,
            shadowEnabled: true
        }
    },

    cold: {
        id: 'cold',
        name: 'YOUR_FLAVOR.Layouts.Cold.Name',
        description: 'YOUR_FLAVOR.Layouts.Cold.Description',
        icon: 'fas fa-snowflake',
        category: 'theme',
        defaults: {
            fontFamily: 'Cinzel',
            fontSize: 14,
            textColor: '#e0f7fa',
            backgroundColor: 'rgba(10, 30, 50, 0.95)',
            borderColor: '#00bcd4',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 8,
            padding: 14,
            glowEnabled: true,
            glowColor: '#00e5ff',
            glowIntensity: 12,
            shadowEnabled: true
        }
    },

    acid: {
        id: 'acid',
        name: 'YOUR_FLAVOR.Layouts.Acid.Name',
        description: 'YOUR_FLAVOR.Layouts.Acid.Description',
        icon: 'fas fa-flask',
        category: 'theme',
        defaults: {
            fontFamily: 'MedievalSharp',
            fontSize: 14,
            textColor: '#ccff00',
            backgroundColor: 'rgba(20, 30, 10, 0.95)',
            borderColor: '#9acd32',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 6,
            padding: 14,
            glowEnabled: true,
            glowColor: '#adff2f',
            glowIntensity: 15,
            shadowEnabled: true
        }
    },

    desert: {
        id: 'desert',
        name: 'YOUR_FLAVOR.Layouts.Desert.Name',
        description: 'YOUR_FLAVOR.Layouts.Desert.Description',
        icon: 'fas fa-sun',
        category: 'theme',
        defaults: {
            fontFamily: 'Uncial Antiqua',
            fontSize: 14,
            textColor: '#f5deb3',
            backgroundColor: 'rgba(70, 50, 30, 0.95)',
            borderColor: '#daa520',
            borderStyle: 'double',
            borderWidth: 3,
            borderRadius: 4,
            padding: 14,
            glowEnabled: false,
            shadowEnabled: true
        }
    },

    glacial: {
        id: 'glacial',
        name: 'YOUR_FLAVOR.Layouts.Glacial.Name',
        description: 'YOUR_FLAVOR.Layouts.Glacial.Description',
        icon: 'fas fa-icicles',
        category: 'theme',
        defaults: {
            fontFamily: 'Cinzel',
            fontSize: 14,
            textColor: '#1a5276',
            backgroundColor: 'rgba(200, 230, 255, 0.9)',
            borderColor: '#87ceeb',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 12,
            padding: 14,
            glowEnabled: true,
            glowColor: '#add8e6',
            glowIntensity: 10,
            shadowEnabled: false,
            nameColor: '#1a5276',
            timestampColor: '#2980b9'
        }
    },

    evil: {
        id: 'evil',
        name: 'YOUR_FLAVOR.Layouts.Evil.Name',
        description: 'YOUR_FLAVOR.Layouts.Evil.Description',
        icon: 'fas fa-angry',
        category: 'theme',
        defaults: {
            fontFamily: 'Pirata One',
            fontSize: 15,
            textColor: '#ff6666',
            backgroundColor: 'rgba(20, 5, 5, 0.98)',
            borderColor: '#8b0000',
            borderStyle: 'ridge',
            borderWidth: 4,
            borderRadius: 2,
            padding: 14,
            glowEnabled: true,
            glowColor: '#ff0000',
            glowIntensity: 10,
            shadowEnabled: true
        }
    },

    good: {
        id: 'good',
        name: 'YOUR_FLAVOR.Layouts.Good.Name',
        description: 'YOUR_FLAVOR.Layouts.Good.Description',
        icon: 'fas fa-dove',
        category: 'theme',
        defaults: {
            fontFamily: 'Almendra',
            fontSize: 14,
            textColor: '#4a4a4a',
            backgroundColor: 'rgba(255, 255, 240, 0.95)',
            borderColor: '#ffd700',
            borderStyle: 'double',
            borderWidth: 3,
            borderRadius: 10,
            padding: 14,
            glowEnabled: true,
            glowColor: '#fffacd',
            glowIntensity: 15,
            shadowEnabled: false,
            nameColor: '#8b6914',
            timestampColor: '#6b5a4a'
        }
    },

    // ==========================================
    // MODERN LAYOUTS
    // ==========================================

    futuristic: {
        id: 'futuristic',
        name: 'YOUR_FLAVOR.Layouts.Futuristic.Name',
        description: 'YOUR_FLAVOR.Layouts.Futuristic.Description',
        icon: 'fas fa-rocket',
        category: 'modern',
        defaults: {
            fontFamily: 'inherit',
            fontSize: 13,
            textColor: '#00ffff',
            backgroundColor: 'rgba(5, 15, 25, 0.98)',
            borderColor: '#00ffff',
            borderStyle: 'solid',
            borderWidth: 1,
            borderRadius: 0,
            padding: 14,
            glowEnabled: true,
            glowColor: '#00ffff',
            glowIntensity: 8,
            shadowEnabled: true
        }
    },

    cyberpunk: {
        id: 'cyberpunk',
        name: 'YOUR_FLAVOR.Layouts.Cyberpunk.Name',
        description: 'YOUR_FLAVOR.Layouts.Cyberpunk.Description',
        icon: 'fas fa-microchip',
        category: 'modern',
        defaults: {
            fontFamily: 'inherit',
            fontSize: 13,
            textColor: '#ff00ff',
            backgroundColor: 'rgba(15, 5, 20, 0.98)',
            borderColor: '#ff00ff',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 2,
            padding: 14,
            glowEnabled: true,
            glowColor: '#ff00ff',
            glowIntensity: 15,
            shadowEnabled: true
        }
    },

    military: {
        id: 'military',
        name: 'YOUR_FLAVOR.Layouts.Military.Name',
        description: 'YOUR_FLAVOR.Layouts.Military.Description',
        icon: 'fas fa-crosshairs',
        category: 'modern',
        defaults: {
            fontFamily: 'inherit',
            fontSize: 13,
            textColor: '#90ee90',
            backgroundColor: 'rgba(20, 30, 20, 0.95)',
            borderColor: '#556b2f',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 0,
            padding: 12,
            glowEnabled: false,
            shadowEnabled: true
        }
    },

    // ==========================================
    // MISC LAYOUTS
    // ==========================================

    girly: {
        id: 'girly',
        name: 'YOUR_FLAVOR.Layouts.Girly.Name',
        description: 'YOUR_FLAVOR.Layouts.Girly.Description',
        icon: 'fas fa-heart',
        category: 'misc',
        defaults: {
            fontFamily: 'Great Vibes',
            fontSize: 18,
            textColor: '#ff69b4',
            backgroundColor: 'rgba(255, 240, 245, 0.95)',
            borderColor: '#ff69b4',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 20,
            padding: 16,
            glowEnabled: true,
            glowColor: '#ffb6c1',
            glowIntensity: 10,
            shadowEnabled: false
        }
    },

    rebel: {
        id: 'rebel',
        name: 'YOUR_FLAVOR.Layouts.Rebel.Name',
        description: 'YOUR_FLAVOR.Layouts.Rebel.Description',
        icon: 'fas fa-fist-raised',
        category: 'misc',
        defaults: {
            fontFamily: 'Pirata One',
            fontSize: 15,
            textColor: '#ff4444',
            backgroundColor: 'rgba(20, 20, 20, 0.98)',
            borderColor: '#ff0000',
            borderStyle: 'dashed',
            borderWidth: 3,
            borderRadius: 0,
            padding: 12,
            glowEnabled: false,
            shadowEnabled: true
        }
    },

    professor: {
        id: 'professor',
        name: 'YOUR_FLAVOR.Layouts.Professor.Name',
        description: 'YOUR_FLAVOR.Layouts.Professor.Description',
        icon: 'fas fa-graduation-cap',
        category: 'misc',
        defaults: {
            fontFamily: 'IM Fell English',
            fontSize: 14,
            textColor: '#2f4f4f',
            backgroundColor: 'rgba(245, 245, 220, 0.95)',
            borderColor: '#8b4513',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 4,
            padding: 14,
            glowEnabled: false,
            shadowEnabled: true
        }
    },

    punk: {
        id: 'punk',
        name: 'YOUR_FLAVOR.Layouts.Punk.Name',
        description: 'YOUR_FLAVOR.Layouts.Punk.Description',
        icon: 'fas fa-bolt',
        category: 'misc',
        defaults: {
            fontFamily: 'inherit',
            fontSize: 14,
            textColor: '#ffff00',
            backgroundColor: 'rgba(0, 0, 0, 0.98)',
            borderColor: '#ffff00',
            borderStyle: 'solid',
            borderWidth: 3,
            borderRadius: 0,
            padding: 12,
            glowEnabled: true,
            glowColor: '#ffff00',
            glowIntensity: 8,
            shadowEnabled: true
        }
    },

    hiphop: {
        id: 'hiphop',
        name: 'YOUR_FLAVOR.Layouts.HipHop.Name',
        description: 'YOUR_FLAVOR.Layouts.HipHop.Description',
        icon: 'fas fa-record-vinyl',
        category: 'misc',
        defaults: {
            fontFamily: 'inherit',
            fontSize: 15,
            textColor: '#ffd700',
            backgroundColor: 'rgba(25, 25, 25, 0.98)',
            borderColor: '#ffd700',
            borderStyle: 'solid',
            borderWidth: 3,
            borderRadius: 8,
            padding: 14,
            glowEnabled: true,
            glowColor: '#ffd700',
            glowIntensity: 6,
            shadowEnabled: true
        }
    },

    bland: {
        id: 'bland',
        name: 'YOUR_FLAVOR.Layouts.Bland.Name',
        description: 'YOUR_FLAVOR.Layouts.Bland.Description',
        icon: 'fas fa-square',
        category: 'misc',
        defaults: {
            fontFamily: 'inherit',
            fontSize: 14,
            textColor: '#333333',
            backgroundColor: 'rgba(245, 245, 245, 0.95)',
            borderColor: '#cccccc',
            borderStyle: 'solid',
            borderWidth: 1,
            borderRadius: 4,
            padding: 12,
            glowEnabled: false,
            shadowEnabled: false
        }
    },

    // ==========================================
    // NEW CREATIVE LAYOUTS
    // ==========================================

    steampunk: {
        id: 'steampunk',
        name: 'YOUR_FLAVOR.Layouts.Steampunk.Name',
        description: 'YOUR_FLAVOR.Layouts.Steampunk.Description',
        icon: 'fas fa-cog',
        category: 'theme',
        defaults: {
            fontFamily: 'IM Fell English',
            fontSize: 14,
            textColor: '#d4c4a8',
            backgroundColor: 'rgba(45, 35, 25, 0.95)',
            borderColor: '#b87333',
            borderStyle: 'ridge',
            borderWidth: 4,
            borderRadius: 6,
            padding: 14,
            glowEnabled: true,
            glowColor: '#cd7f32',
            glowIntensity: 8,
            shadowEnabled: true,
            nameColor: '#cd9b4a',
            timestampColor: '#a89070'
        }
    },

    eldritch: {
        id: 'eldritch',
        name: 'YOUR_FLAVOR.Layouts.Eldritch.Name',
        description: 'YOUR_FLAVOR.Layouts.Eldritch.Description',
        icon: 'fas fa-brain',
        category: 'theme',
        defaults: {
            fontFamily: 'Almendra',
            fontSize: 14,
            textColor: '#8fbc8f',
            backgroundColor: 'rgba(10, 15, 20, 0.98)',
            borderColor: '#2f4f4f',
            borderStyle: 'double',
            borderWidth: 3,
            borderRadius: 2,
            padding: 14,
            glowEnabled: true,
            glowColor: '#006666',
            glowIntensity: 12,
            shadowEnabled: true,
            nameColor: '#20b2aa',
            timestampColor: '#5f9ea0'
        }
    },

    feywild: {
        id: 'feywild',
        name: 'YOUR_FLAVOR.Layouts.Feywild.Name',
        description: 'YOUR_FLAVOR.Layouts.Feywild.Description',
        icon: 'fas fa-seedling',
        category: 'theme',
        defaults: {
            fontFamily: 'Tangerine',
            fontSize: 20,
            textColor: '#e6e6fa',
            backgroundColor: 'rgba(40, 20, 60, 0.92)',
            borderColor: '#dda0dd',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 20,
            padding: 16,
            glowEnabled: true,
            glowColor: '#ee82ee',
            glowIntensity: 15,
            shadowEnabled: true,
            nameColor: '#ff69b4',
            timestampColor: '#da70d6'
        }
    },

    celestial: {
        id: 'celestial',
        name: 'YOUR_FLAVOR.Layouts.Celestial.Name',
        description: 'YOUR_FLAVOR.Layouts.Celestial.Description',
        icon: 'fas fa-star',
        category: 'theme',
        defaults: {
            fontFamily: 'Cinzel',
            fontSize: 14,
            textColor: '#fffaf0',
            backgroundColor: 'rgba(20, 30, 60, 0.95)',
            borderColor: '#ffd700',
            borderStyle: 'double',
            borderWidth: 3,
            borderRadius: 10,
            padding: 14,
            glowEnabled: true,
            glowColor: '#fffacd',
            glowIntensity: 18,
            shadowEnabled: true,
            nameColor: '#ffd700',
            timestampColor: '#f0e68c'
        }
    },

    pirate: {
        id: 'pirate',
        name: 'YOUR_FLAVOR.Layouts.Pirate.Name',
        description: 'YOUR_FLAVOR.Layouts.Pirate.Description',
        icon: 'fas fa-skull-crossbones',
        category: 'theme',
        defaults: {
            fontFamily: 'Pirata One',
            fontSize: 15,
            textColor: '#deb887',
            backgroundColor: 'rgba(40, 30, 20, 0.95)',
            borderColor: '#8b4513',
            borderStyle: 'ridge',
            borderWidth: 4,
            borderRadius: 4,
            padding: 14,
            glowEnabled: false,
            shadowEnabled: true,
            nameColor: '#d2691e',
            timestampColor: '#a0522d'
        }
    },

    noir: {
        id: 'noir',
        name: 'YOUR_FLAVOR.Layouts.Noir.Name',
        description: 'YOUR_FLAVOR.Layouts.Noir.Description',
        icon: 'fas fa-user-secret',
        category: 'theme',
        defaults: {
            fontFamily: 'inherit',
            fontSize: 14,
            textColor: '#c0c0c0',
            backgroundColor: 'rgba(15, 15, 15, 0.98)',
            borderColor: '#404040',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 2,
            padding: 14,
            glowEnabled: false,
            shadowEnabled: true,
            nameColor: '#ffffff',
            timestampColor: '#808080'
        }
    },

    alchemist: {
        id: 'alchemist',
        name: 'YOUR_FLAVOR.Layouts.Alchemist.Name',
        description: 'YOUR_FLAVOR.Layouts.Alchemist.Description',
        icon: 'fas fa-vial',
        category: 'theme',
        defaults: {
            fontFamily: 'Almendra',
            fontSize: 14,
            textColor: '#e0d8b8',
            backgroundColor: 'rgba(30, 35, 25, 0.95)',
            borderColor: '#8fbc8f',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 8,
            padding: 14,
            glowEnabled: true,
            glowColor: '#98fb98',
            glowIntensity: 10,
            shadowEnabled: true,
            nameColor: '#9acd32',
            timestampColor: '#6b8e23'
        }
    },

    infernal: {
        id: 'infernal',
        name: 'YOUR_FLAVOR.Layouts.Infernal.Name',
        description: 'YOUR_FLAVOR.Layouts.Infernal.Description',
        icon: 'fas fa-fire-alt',
        category: 'theme',
        defaults: {
            fontFamily: 'Cinzel Decorative',
            fontSize: 14,
            textColor: '#ff6347',
            backgroundColor: 'rgba(25, 5, 5, 0.98)',
            borderColor: '#8b0000',
            borderStyle: 'ridge',
            borderWidth: 4,
            borderRadius: 4,
            padding: 14,
            glowEnabled: true,
            glowColor: '#ff4500',
            glowIntensity: 15,
            shadowEnabled: true,
            nameColor: '#ff6600',
            timestampColor: '#cc3300'
        }
    },

    merchant: {
        id: 'merchant',
        name: 'YOUR_FLAVOR.Layouts.Merchant.Name',
        description: 'YOUR_FLAVOR.Layouts.Merchant.Description',
        icon: 'fas fa-coins',
        category: 'theme',
        defaults: {
            fontFamily: 'Cinzel',
            fontSize: 14,
            textColor: '#2f2f2f',
            backgroundColor: 'rgba(250, 245, 235, 0.95)',
            borderColor: '#b8860b',
            borderStyle: 'double',
            borderWidth: 4,
            borderRadius: 8,
            padding: 16,
            glowEnabled: true,
            glowColor: '#ffd700',
            glowIntensity: 8,
            shadowEnabled: true,
            nameColor: '#8b6914',
            timestampColor: '#a0522d'
        }
    },

    tribal: {
        id: 'tribal',
        name: 'YOUR_FLAVOR.Layouts.Tribal.Name',
        description: 'YOUR_FLAVOR.Layouts.Tribal.Description',
        icon: 'fas fa-feather-alt',
        category: 'theme',
        defaults: {
            fontFamily: 'MedievalSharp',
            fontSize: 14,
            textColor: '#f5deb3',
            backgroundColor: 'rgba(50, 35, 25, 0.95)',
            borderColor: '#cd853f',
            borderStyle: 'ridge',
            borderWidth: 4,
            borderRadius: 2,
            padding: 14,
            glowEnabled: false,
            shadowEnabled: true,
            nameColor: '#d2691e',
            timestampColor: '#a0522d'
        }
    },

    // ==========================================
    // NEW PREMIUM LAYOUTS
    // ==========================================

    cosmic: {
        id: 'cosmic',
        name: 'YOUR_FLAVOR.Layouts.Cosmic.Name',
        description: 'YOUR_FLAVOR.Layouts.Cosmic.Description',
        icon: 'fas fa-star',
        category: 'theme',
        defaults: {
            fontFamily: 'Cinzel Decorative',
            fontSize: 14,
            textColor: '#e6e6fa',
            backgroundColor: 'rgba(10, 5, 20, 0.95)',
            borderColor: '#9370db',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 12,
            padding: 14,
            glowEnabled: true,
            glowColor: '#8a2be2',
            glowIntensity: 15,
            shadowEnabled: true,
            nameColor: '#e0b0ff',
            timestampColor: '#b19cd9'
        }
    },

    blueprint: {
        id: 'blueprint',
        name: 'YOUR_FLAVOR.Layouts.Blueprint.Name',
        description: 'YOUR_FLAVOR.Layouts.Blueprint.Description',
        icon: 'fas fa-drafting-compass',
        category: 'modern',
        defaults: {
            fontFamily: 'Courier Prime',
            fontSize: 13,
            textColor: '#ffffff',
            backgroundColor: 'rgba(0, 50, 100, 0.95)',
            borderColor: '#ffffff',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 0,
            padding: 14,
            glowEnabled: false,
            shadowEnabled: true,
            nameColor: '#ffffff',
            timestampColor: '#aaddff'
        }
    },

    sketch: {
        id: 'sketch',
        name: 'YOUR_FLAVOR.Layouts.Sketch.Name',
        description: 'YOUR_FLAVOR.Layouts.Sketch.Description',
        icon: 'fas fa-pencil-alt',
        category: 'misc',
        defaults: {
            fontFamily: 'Indie Flower',
            fontSize: 15,
            textColor: '#404040',
            backgroundColor: 'rgba(255, 255, 250, 0.95)',
            borderColor: '#808080',
            borderStyle: 'dashed',
            borderWidth: 1,
            borderRadius: 50,
            padding: 16,
            glowEnabled: false,
            shadowEnabled: true
        }
    },

    comic: {
        id: 'comic',
        name: 'YOUR_FLAVOR.Layouts.Comic.Name',
        description: 'YOUR_FLAVOR.Layouts.Comic.Description',
        icon: 'fas fa-comment-dots',
        category: 'misc',
        defaults: {
            fontFamily: 'Bangers',
            fontSize: 16,
            textColor: '#000000',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderColor: '#000000',
            borderStyle: 'solid',
            borderWidth: 4,
            borderRadius: 10,
            padding: 14,
            glowEnabled: true,
            glowColor: '#000000',
            glowIntensity: 5,
            shadowEnabled: true,
            nameColor: '#ed1c24',
            timestampColor: '#000000'
        }
    },

    arcade: {
        id: 'arcade',
        name: 'YOUR_FLAVOR.Layouts.Arcade.Name',
        description: 'YOUR_FLAVOR.Layouts.Arcade.Description',
        icon: 'fas fa-gamepad',
        category: 'modern',
        defaults: {
            fontFamily: 'Press Start 2P',
            fontSize: 12,
            textColor: '#00ff00',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            borderColor: '#ff00ff',
            borderStyle: 'double',
            borderWidth: 4,
            borderRadius: 0,
            padding: 16,
            glowEnabled: true,
            glowColor: '#00ff00',
            glowIntensity: 10,
            shadowEnabled: true,
            nameColor: '#ffff00',
            timestampColor: '#00ffff'
        }
    },

    biohazard: {
        id: 'biohazard',
        name: 'YOUR_FLAVOR.Layouts.Biohazard.Name',
        description: 'YOUR_FLAVOR.Layouts.Biohazard.Description',
        icon: 'fas fa-radiation',
        category: 'modern',
        defaults: {
            fontFamily: 'Black Ops One',
            fontSize: 14,
            textColor: '#ffff00',
            backgroundColor: 'rgba(20, 20, 0, 0.95)',
            borderColor: '#ffff00',
            borderStyle: 'dashed',
            borderWidth: 3,
            borderRadius: 4,
            padding: 14,
            glowEnabled: true,
            glowColor: '#adff2f',
            glowIntensity: 12,
            shadowEnabled: true,
            nameColor: '#ffff00',
            timestampColor: '#adff2f'
        }
    },

    spectral: {
        id: 'spectral',
        name: 'YOUR_FLAVOR.Layouts.Spectral.Name',
        description: 'YOUR_FLAVOR.Layouts.Spectral.Description',
        icon: 'fas fa-ghost',
        category: 'theme',
        defaults: {
            fontFamily: 'Cinzel',
            fontSize: 14,
            textColor: '#e0ffff',
            backgroundColor: 'rgba(0, 20, 20, 0.8)',
            borderColor: '#7fffd4',
            borderStyle: 'solid',
            borderWidth: 1,
            borderRadius: 12,
            padding: 14,
            glowEnabled: true,
            glowColor: '#7fffd4',
            glowIntensity: 20,
            shadowEnabled: false,
            nameColor: '#e0ffff',
            timestampColor: '#afEEEE'
        }
    },

    magma: {
        id: 'magma',
        name: 'YOUR_FLAVOR.Layouts.Magma.Name',
        description: 'YOUR_FLAVOR.Layouts.Magma.Description',
        icon: 'fas fa-fire',
        category: 'theme',
        defaults: {
            fontFamily: 'Cinzel Decorative',
            fontSize: 14,
            textColor: '#ffae42',
            backgroundColor: 'rgba(20, 5, 5, 0.95)',
            borderColor: '#ff4500',
            borderStyle: 'ridge',
            borderWidth: 4,
            borderRadius: 6,
            padding: 14,
            glowEnabled: true,
            glowColor: '#ff0000',
            glowIntensity: 15,
            shadowEnabled: true,
            nameColor: '#ff8c00',
            timestampColor: '#ff6347'
        }
    },

    abyssal: {
        id: 'abyssal',
        name: 'YOUR_FLAVOR.Layouts.Abyssal.Name',
        description: 'YOUR_FLAVOR.Layouts.Abyssal.Description',
        icon: 'fas fa-water',
        category: 'theme',
        defaults: {
            fontFamily: 'Cinzel',
            fontSize: 14,
            textColor: '#00ced1',
            backgroundColor: 'rgba(0, 5, 10, 0.98)',
            borderColor: '#008b8b',
            borderStyle: 'double',
            borderWidth: 3,
            borderRadius: 8,
            padding: 14,
            glowEnabled: true,
            glowColor: '#20b2aa',
            glowIntensity: 12,
            shadowEnabled: true,
            nameColor: '#40e0d0',
            timestampColor: '#48d1cc'
        }
    },

    jungle: {
        id: 'jungle',
        name: 'YOUR_FLAVOR.Layouts.Jungle.Name',
        description: 'YOUR_FLAVOR.Layouts.Jungle.Description',
        icon: 'fas fa-tree',
        category: 'theme',
        defaults: {
            fontFamily: 'MedievalSharp',
            fontSize: 14,
            textColor: '#f0fff0',
            backgroundColor: 'rgba(10, 30, 10, 0.95)',
            borderColor: '#32cd32',
            borderStyle: 'solid',
            borderWidth: 3,
            borderRadius: 16,
            padding: 14,
            glowEnabled: true,
            glowColor: '#006400',
            glowIntensity: 8,
            shadowEnabled: true,
            nameColor: '#98fb98',
            timestampColor: '#90ee90'
        }
    },

    pharaoh: {
        id: 'pharaoh',
        name: 'YOUR_FLAVOR.Layouts.Pharaoh.Name',
        description: 'YOUR_FLAVOR.Layouts.Pharaoh.Description',
        icon: 'fas fa-ankh',
        category: 'theme',
        defaults: {
            fontFamily: 'Cinzel',
            fontSize: 15,
            textColor: '#ffd700',
            backgroundColor: 'rgba(0, 0, 139, 0.95)',
            borderColor: '#ffd700',
            borderStyle: 'solid',
            borderWidth: 3,
            borderRadius: 4,
            padding: 14,
            glowEnabled: true,
            glowColor: '#daa520',
            glowIntensity: 10,
            shadowEnabled: true,
            nameColor: '#ffd700',
            timestampColor: '#f0e68c'
        }
    },

    matrix: {
        id: 'matrix',
        name: 'YOUR_FLAVOR.Layouts.Matrix.Name',
        description: 'YOUR_FLAVOR.Layouts.Matrix.Description',
        icon: 'fas fa-terminal',
        category: 'modern',
        defaults: {
            fontFamily: 'Courier Prime',
            fontSize: 13,
            textColor: '#00ff00',
            backgroundColor: 'rgba(0, 10, 0, 0.95)',
            borderColor: '#006400',
            borderStyle: 'solid',
            borderWidth: 1,
            borderRadius: 0,
            padding: 12,
            glowEnabled: true,
            glowColor: '#00ff00',
            glowIntensity: 8,
            shadowEnabled: true,
            nameColor: '#32cd32',
            timestampColor: '#008000'
        }
    },

    vaporwave: {
        id: 'vaporwave',
        name: 'YOUR_FLAVOR.Layouts.Vaporwave.Name',
        description: 'YOUR_FLAVOR.Layouts.Vaporwave.Description',
        icon: 'fas fa-music',
        category: 'modern',
        defaults: {
            fontFamily: 'Permanent Marker',
            fontSize: 14,
            textColor: '#00ffff',
            backgroundColor: 'rgba(255, 105, 180, 0.2)', // Translucent pink
            borderColor: '#ff00ff',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 8,
            padding: 14,
            glowEnabled: true,
            glowColor: '#00ffff',
            glowIntensity: 12,
            shadowEnabled: true,
            nameColor: '#ff69b4',
            timestampColor: '#00ffff'
        }
    },

    gothic: {
        id: 'gothic',
        name: 'YOUR_FLAVOR.Layouts.Gothic.Name',
        description: 'YOUR_FLAVOR.Layouts.Gothic.Description',
        icon: 'fas fa-church',
        category: 'theme',
        defaults: {
            fontFamily: 'Uncial Antiqua',
            fontSize: 15,
            textColor: '#d3d3d3',
            backgroundColor: 'rgba(20, 20, 20, 0.98)',
            borderColor: '#708090',
            borderStyle: 'ridge',
            borderWidth: 4,
            borderRadius: 4,
            padding: 14,
            glowEnabled: false,
            shadowEnabled: true,
            nameColor: '#c0c0c0',
            timestampColor: '#778899'
        }
    },

    harrowed: {
        id: 'harrowed',
        name: 'YOUR_FLAVOR.Layouts.Harrowed.Name',
        description: 'YOUR_FLAVOR.Layouts.Harrowed.Description',
        icon: 'fas fa-spider',
        category: 'theme',
        defaults: {
            fontFamily: 'Nosifer',
            fontSize: 14,
            textColor: '#8b0000',
            backgroundColor: 'rgba(10, 0, 0, 0.95)',
            borderColor: '#2f0000',
            borderStyle: 'dashed',
            borderWidth: 2,
            borderRadius: 0,
            padding: 16,
            glowEnabled: true,
            glowColor: '#ff0000',
            glowIntensity: 5,
            shadowEnabled: true,
            nameColor: '#800000',
            timestampColor: '#500000'
        }
    },

    // ==========================================
    // EXALTED LAYOUTS
    // ==========================================

    solar: {
        id: 'solar',
        name: 'YOUR_FLAVOR.Layouts.Solar.Name',
        description: 'YOUR_FLAVOR.Layouts.Solar.Description',
        icon: 'fas fa-sun',
        category: 'theme',
        defaults: {
            fontFamily: 'Metamorphous',
            fontSize: 15,
            textColor: '#fff8dc',
            backgroundColor: 'rgba(60, 35, 5, 0.96)',
            borderColor: '#ffc800',
            borderStyle: 'double',
            borderWidth: 4,
            borderRadius: 6,
            padding: 16,
            glowEnabled: true,
            glowColor: '#ffaa00',
            glowIntensity: 22,
            shadowEnabled: true,
            nameColor: '#ffd700',
            timestampColor: '#daa520'
        }
    },

    lunar: {
        id: 'lunar',
        name: 'YOUR_FLAVOR.Layouts.Lunar.Name',
        description: 'YOUR_FLAVOR.Layouts.Lunar.Description',
        icon: 'fas fa-moon',
        category: 'theme',
        defaults: {
            fontFamily: 'Cormorant Garamond',
            fontSize: 16,
            textColor: '#e0e8f0',
            backgroundColor: 'rgba(10, 15, 35, 0.96)',
            borderColor: '#c0c0c0',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 12,
            padding: 16,
            glowEnabled: true,
            glowColor: '#b8c8e8',
            glowIntensity: 18,
            shadowEnabled: true,
            nameColor: '#e8e8f0',
            timestampColor: '#8899bb'
        }
    },

    sidereal: {
        id: 'sidereal',
        name: 'YOUR_FLAVOR.Layouts.Sidereal.Name',
        description: 'YOUR_FLAVOR.Layouts.Sidereal.Description',
        icon: 'fas fa-stars',
        category: 'theme',
        defaults: {
            fontFamily: 'Philosopher',
            fontSize: 14,
            textColor: '#d8c8f0',
            backgroundColor: 'rgba(15, 8, 30, 0.97)',
            borderColor: '#9966cc',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 8,
            padding: 14,
            glowEnabled: true,
            glowColor: '#8855bb',
            glowIntensity: 15,
            shadowEnabled: true,
            nameColor: '#cc99ff',
            timestampColor: '#7755aa'
        }
    },

    dragonblooded: {
        id: 'dragonblooded',
        name: 'YOUR_FLAVOR.Layouts.DragonBlooded.Name',
        description: 'YOUR_FLAVOR.Layouts.DragonBlooded.Description',
        icon: 'fas fa-gem',
        category: 'theme',
        defaults: {
            fontFamily: 'Marcellus',
            fontSize: 15,
            textColor: '#d0e8d0',
            backgroundColor: 'rgba(15, 30, 20, 0.96)',
            borderColor: '#2e8b57',
            borderStyle: 'ridge',
            borderWidth: 4,
            borderRadius: 4,
            padding: 14,
            glowEnabled: true,
            glowColor: '#3cb371',
            glowIntensity: 12,
            shadowEnabled: true,
            nameColor: '#50c878',
            timestampColor: '#3a7a5a'
        }
    },

    // ==========================================
    // NEW CREATIVE LAYOUTS (Wave 3)
    // ==========================================

    sakura: {
        id: 'sakura',
        name: 'YOUR_FLAVOR.Layouts.Sakura.Name',
        description: 'YOUR_FLAVOR.Layouts.Sakura.Description',
        icon: 'fas fa-fan',
        category: 'theme',
        defaults: {
            fontFamily: 'Shippori Mincho',
            fontSize: 14,
            textColor: '#4a3040',
            backgroundColor: 'rgba(255, 240, 245, 0.95)',
            borderColor: '#e8a0b0',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 14,
            padding: 16,
            glowEnabled: true,
            glowColor: '#ffb7c5',
            glowIntensity: 10,
            shadowEnabled: false,
            nameColor: '#c06080',
            timestampColor: '#a07888'
        }
    },

    thunderstorm: {
        id: 'thunderstorm',
        name: 'YOUR_FLAVOR.Layouts.Thunderstorm.Name',
        description: 'YOUR_FLAVOR.Layouts.Thunderstorm.Description',
        icon: 'fas fa-bolt',
        category: 'theme',
        defaults: {
            fontFamily: 'Orbitron',
            fontSize: 13,
            textColor: '#c8e0ff',
            backgroundColor: 'rgba(10, 15, 25, 0.97)',
            borderColor: '#4488ff',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 4,
            padding: 14,
            glowEnabled: true,
            glowColor: '#2266ee',
            glowIntensity: 18,
            shadowEnabled: true,
            nameColor: '#66aaff',
            timestampColor: '#4477bb'
        }
    },

    bloodmoon: {
        id: 'bloodmoon',
        name: 'YOUR_FLAVOR.Layouts.Bloodmoon.Name',
        description: 'YOUR_FLAVOR.Layouts.Bloodmoon.Description',
        icon: 'fas fa-moon',
        category: 'theme',
        defaults: {
            fontFamily: 'Creepster',
            fontSize: 16,
            textColor: '#e8a0a0',
            backgroundColor: 'rgba(15, 5, 5, 0.98)',
            borderColor: '#8b0000',
            borderStyle: 'solid',
            borderWidth: 3,
            borderRadius: 2,
            padding: 14,
            glowEnabled: true,
            glowColor: '#cc0000',
            glowIntensity: 12,
            shadowEnabled: true,
            nameColor: '#ff3333',
            timestampColor: '#993333'
        }
    },

    crystalline: {
        id: 'crystalline',
        name: 'YOUR_FLAVOR.Layouts.Crystalline.Name',
        description: 'YOUR_FLAVOR.Layouts.Crystalline.Description',
        icon: 'fas fa-gem',
        category: 'theme',
        defaults: {
            fontFamily: 'Quicksand',
            fontSize: 14,
            textColor: '#3a3a50',
            backgroundColor: 'rgba(240, 248, 255, 0.92)',
            borderColor: '#88bbdd',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 16,
            padding: 16,
            glowEnabled: true,
            glowColor: '#aaddff',
            glowIntensity: 15,
            shadowEnabled: false,
            nameColor: '#5588aa',
            timestampColor: '#7799bb'
        }
    },

    sandstorm: {
        id: 'sandstorm',
        name: 'YOUR_FLAVOR.Layouts.Sandstorm.Name',
        description: 'YOUR_FLAVOR.Layouts.Sandstorm.Description',
        icon: 'fas fa-wind',
        category: 'theme',
        defaults: {
            fontFamily: 'Amatic SC',
            fontSize: 22,
            textColor: '#f5e6c8',
            backgroundColor: 'rgba(60, 45, 25, 0.93)',
            borderColor: '#c8a060',
            borderStyle: 'dashed',
            borderWidth: 2,
            borderRadius: 6,
            padding: 16,
            glowEnabled: false,
            glowColor: '#d4a840',
            glowIntensity: 8,
            shadowEnabled: true,
            nameColor: '#e8c070',
            timestampColor: '#a08050'
        }
    },

    plague: {
        id: 'plague',
        name: 'YOUR_FLAVOR.Layouts.Plague.Name',
        description: 'YOUR_FLAVOR.Layouts.Plague.Description',
        icon: 'fas fa-disease',
        category: 'theme',
        defaults: {
            fontFamily: 'Eater',
            fontSize: 16,
            textColor: '#c8d830',
            backgroundColor: 'rgba(15, 18, 8, 0.97)',
            borderColor: '#556b2f',
            borderStyle: 'ridge',
            borderWidth: 3,
            borderRadius: 2,
            padding: 14,
            glowEnabled: true,
            glowColor: '#9acd32',
            glowIntensity: 10,
            shadowEnabled: true,
            nameColor: '#a8c820',
            timestampColor: '#6b8830'
        }
    },

    runic: {
        id: 'runic',
        name: 'YOUR_FLAVOR.Layouts.Runic.Name',
        description: 'YOUR_FLAVOR.Layouts.Runic.Description',
        icon: 'fas fa-language',
        category: 'theme',
        defaults: {
            fontFamily: 'New Rocker',
            fontSize: 14,
            textColor: '#c0c8d8',
            backgroundColor: 'rgba(25, 28, 35, 0.96)',
            borderColor: '#5577aa',
            borderStyle: 'groove',
            borderWidth: 4,
            borderRadius: 4,
            padding: 14,
            glowEnabled: true,
            glowColor: '#4466aa',
            glowIntensity: 8,
            shadowEnabled: true,
            nameColor: '#7799cc',
            timestampColor: '#556688'
        }
    },

    synthwave: {
        id: 'synthwave',
        name: 'YOUR_FLAVOR.Layouts.Synthwave.Name',
        description: 'YOUR_FLAVOR.Layouts.Synthwave.Description',
        icon: 'fas fa-compact-disc',
        category: 'modern',
        defaults: {
            fontFamily: 'Audiowide',
            fontSize: 13,
            textColor: '#00ffff',
            backgroundColor: 'rgba(20, 5, 30, 0.97)',
            borderColor: '#ff1493',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 4,
            padding: 14,
            glowEnabled: true,
            glowColor: '#ff1493',
            glowIntensity: 15,
            shadowEnabled: true,
            nameColor: '#ff69b4',
            timestampColor: '#00cccc'
        }
    },

    tavern: {
        id: 'tavern',
        name: 'YOUR_FLAVOR.Layouts.Tavern.Name',
        description: 'YOUR_FLAVOR.Layouts.Tavern.Description',
        icon: 'fas fa-beer-mug-empty',
        category: 'theme',
        defaults: {
            fontFamily: 'Lora',
            fontSize: 14,
            textColor: '#f0e0c0',
            backgroundColor: 'rgba(50, 30, 15, 0.95)',
            borderColor: '#8b6530',
            borderStyle: 'ridge',
            borderWidth: 4,
            borderRadius: 8,
            padding: 16,
            glowEnabled: true,
            glowColor: '#d4872c',
            glowIntensity: 6,
            shadowEnabled: true,
            nameColor: '#daa520',
            timestampColor: '#a08050'
        }
    },

    enchanted: {
        id: 'enchanted',
        name: 'YOUR_FLAVOR.Layouts.Enchanted.Name',
        description: 'YOUR_FLAVOR.Layouts.Enchanted.Description',
        icon: 'fas fa-wand-sparkles',
        category: 'theme',
        defaults: {
            fontFamily: 'Cormorant Garamond',
            fontSize: 15,
            textColor: '#f0e8ff',
            backgroundColor: 'rgba(20, 10, 35, 0.94)',
            borderColor: '#cc77ff',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 14,
            padding: 16,
            glowEnabled: true,
            glowColor: '#aa55ff',
            glowIntensity: 18,
            shadowEnabled: true,
            nameColor: '#dd99ff',
            timestampColor: '#9966cc'
        }
    },

    witchcraft: {
        id: 'witchcraft',
        name: 'YOUR_FLAVOR.Layouts.Witchcraft.Name',
        description: 'YOUR_FLAVOR.Layouts.Witchcraft.Description',
        icon: 'fas fa-hat-wizard',
        category: 'theme',
        defaults: {
            fontFamily: 'Griffy',
            fontSize: 16,
            textColor: '#c8b8e0',
            backgroundColor: 'rgba(15, 10, 20, 0.97)',
            borderColor: '#6b3fa0',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 8,
            padding: 14,
            glowEnabled: true,
            glowColor: '#8844cc',
            glowIntensity: 12,
            shadowEnabled: true,
            nameColor: '#aa77dd',
            timestampColor: '#7755aa'
        }
    },

    // ==========================================
    // CUSTOM LAYOUT
    // ==========================================

    custom: {
        id: 'custom',
        name: 'YOUR_FLAVOR.Layouts.Custom.Name',
        description: 'YOUR_FLAVOR.Layouts.Custom.Description',
        icon: 'fas fa-paint-brush',
        category: 'custom',
        defaults: {
            fontFamily: 'inherit',
            fontSize: 14,
            textColor: '#e8dcc8',
            backgroundColor: 'rgba(20, 16, 12, 0.95)',
            borderColor: '#c9a227',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 8,
            padding: 12,
            glowEnabled: false,
            glowColor: '#c9a227',
            glowIntensity: 10,
            shadowEnabled: true
        }
    }
};

/**
 * Get layout by ID
 * @param {string} id - Layout ID
 * @returns {Object|null} Layout definition
 */
export function getLayout(id) {
    return LAYOUTS[id] || null;
}

/**
 * Get all layout IDs
 * @returns {string[]} Array of layout IDs
 */
export function getLayoutIds() {
    return Object.keys(LAYOUTS);
}

/**
 * Get layouts for dropdown/select
 * @returns {Array} Array of {id, name, icon, category} objects
 */
export function getLayoutChoices() {
    return Object.values(LAYOUTS).map(layout => ({
        id: layout.id,
        name: game.i18n.localize(layout.name),
        description: game.i18n.localize(layout.description),
        icon: layout.icon,
        category: layout.category
    }));
}

/**
 * Get layouts grouped by category
 * @returns {Object} Object with category keys and layout arrays
 */
export function getLayoutsByCategory() {
    const categories = {
        basic: [],
        class: [],
        race: [],
        theme: [],
        modern: [],
        misc: [],
        custom: []
    };

    for (const layout of Object.values(LAYOUTS)) {
        if (categories[layout.category]) {
            categories[layout.category].push({
                id: layout.id,
                name: game.i18n.localize(layout.name),
                icon: layout.icon
            });
        }
    }

    return categories;
}
