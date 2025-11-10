import { getRandomInt } from './utils.js';

export let gameState = {
    bunny: {
        name: "Binky",
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        baseStats: { attack: 1, defense: 0, maxHp: 10 },
        stats: { attack: 1, defense: 0, maxHp: 10 },
        hp: 10,
    },
    monster: null,
    zone: {
        name: "The Sunny Meadow",
        level: 1,
        monstersDefeated: 0,
        monstersToBoss: 10,
    },
    resources: {
        carrotShards: 0,
    },
    combat: {
        progress: 0,
        speed: 10, // progress per second
    },
    upgrades: {
        sharperFangs: { name: "Sharper Fangs", level: 0, baseCost: 10, cost: 10, bonus: 1, type: "attack" },
        fluffierArmor: { name: "Fluffier Armor", level: 0, baseCost: 15, cost: 15, bonus: 1, type: "defense" },
        carrotVitamins: { name: "Carrot Vitamins", level: 0, baseCost: 20, cost: 20, bonus: 5, type: "maxHp" }
    },
    log: ["Your adventure begins!"],
};

const MONSTER_ADJECTIVES = ["Grassy", "Slimy", "Fuzzy", "Angry", "Tiny"];
const MONSTER_NOUNS = ["Slime", "Squeaker", "Muncher", "Crawler", "Hopper"];

function generateMonster() {
    const level = gameState.zone.level;
    const name = `${MONSTER_ADJECTIVES[getRandomInt(0, MONSTER_ADJECTIVES.length - 1)]} ${MONSTER_NOUNS[getRandomInt(0, MONSTER_NOUNS.length - 1)]}`;
    const hp = Math.ceil(5 * Math.pow(1.2, level - 1));
    const attack = Math.ceil(1 * Math.pow(1.15, level - 1));
    const xpValue = 10 * level;
    const carrotValue = 5 * level;

    gameState.monster = {
        name,
        level,
        hp,
        maxHp: hp,
        attack,
        xpValue,
        carrotValue
    };
}

function addLog(message) {
    gameState.log.unshift(message);
    if (gameState.log.length > 20) {
        gameState.log.pop();
    }
}

function levelUpBunny() {
    if (gameState.bunny.xp >= gameState.bunny.xpToNextLevel) {
        gameState.bunny.level++;
        gameState.bunny.xp -= gameState.bunny.xpToNextLevel;
        gameState.bunny.xpToNextLevel = Math.floor(gameState.bunny.xpToNextLevel * 1.5);

        // Improve base stats on level up
        gameState.bunny.baseStats.maxHp += 2;
        gameState.bunny.baseStats.attack += 1;

        recalculateBunnyStats();
        gameState.bunny.hp = gameState.bunny.stats.maxHp; // Full heal on level up

        addLog(`Ding! ${gameState.bunny.name} reached level ${gameState.bunny.level}!`);
    }
}

function recalculateBunnyStats() {
    const { baseStats, stats } = gameState.bunny;
    const { sharperFangs, fluffierArmor, carrotVitamins } = gameState.upgrades;

    stats.attack = baseStats.attack + (sharperFangs.level * sharperFangs.bonus);
    stats.defense = baseStats.defense + (fluffierArmor.level * fluffierArmor.bonus);
    stats.maxHp = baseStats.maxHp + (carrotVitamins.level * carrotVitamins.bonus);
}

export function purchaseUpgrade(upgradeKey) {
    const upgrade = gameState.upgrades[upgradeKey];
    if (gameState.resources.carrotShards >= upgrade.cost) {
        gameState.resources.carrotShards -= upgrade.cost;
        upgrade.level++;
        upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.2, upgrade.level));
        recalculateBunnyStats();
        // Heal bunny to new max HP if HP upgrade is bought
        if (upgrade.type === "maxHp") {
            gameState.bunny.hp = gameState.bunny.stats.maxHp;
        }
        addLog(`Upgraded ${upgrade.name} to level ${upgrade.level}!`);
        return true;
    }
    return false;
}

export function update(deltaTime) {
    if (!gameState.monster) {
        generateMonster();
    }

    gameState.combat.progress += gameState.combat.speed * deltaTime;

    if (gameState.combat.progress >= 100) {
        gameState.combat.progress = 0;

        // Combat resolution (simplified)
        const monster = gameState.monster;
        addLog(`${gameState.bunny.name} defeated a ${monster.name}!`);

        gameState.resources.carrotShards += monster.carrotValue;
        gameState.bunny.xp += monster.xpValue;

        levelUpBunny();

        gameState.zone.monstersDefeated++;

        generateMonster();
    }
}

// Initialize
recalculateBunnyStats();
generateMonster();