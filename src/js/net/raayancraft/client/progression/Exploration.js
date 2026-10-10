// Exploration progression: tracks discovered biomes across all runs,
// announces first visits, and unlocks milestone achievements.
// Persisted in localStorage. Throttled to ~1 lookup/second.
export default class Exploration {

    static NAMES = {
        plains: "Plains", desert: "Desert", forest: "Forest", mountains: "Mountains",
        snow: "Snowy Tundra", swamp: "Swamp", jungle: "Jungle", cherry: "Cherry Grove",
        taiga: "Taiga", ice_spikes: "Ice Spikes", meadow: "Meadow",
        birch: "Birch Forest", dark_forest: "Dark Forest", flower_forest: "Flower Forest",
        savanna: "Savanna", badlands: "Badlands", red_desert: "Red Desert",
        mangrove: "Mangrove Swamp", bamboo: "Bamboo Jungle", stony_peaks: "Stony Peaks",
        canyon: "Canyon", sunflower: "Sunflower Plains", mushroom: "Mushroom Island",
        grove: "Grove",
    };

    static TOTAL = Object.keys(Exploration.NAMES).length;

    static MILESTONES = [
        { count: 5, achievement: "explorer_5" },
        { count: 10, achievement: "explorer_10" },
        { count: 20, achievement: "explorer_20" },
        { count: Exploration.TOTAL, achievement: "explorer_all" },
    ];

    constructor(rayancraft) {
        this.rayancraft = rayancraft;
        this.visited = this.load();
        this.lastCheck = 0;
    }

    load() {
        try {
            const raw = localStorage.getItem("rc_biomes");
            if (raw) {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr)) return new Set(arr.filter((b) => b in Exploration.NAMES));
            }
        } catch (e) { }
        return new Set();
    }

    save() {
        try {
            localStorage.setItem("rc_biomes", JSON.stringify([...this.visited]));
        } catch (e) { }
    }

    static GUARDED = ["mushroom", "badlands", "ice_spikes", "stony_peaks", "bamboo", "dark_forest"];

    // Wakes a one-time guardian protector for rare biomes (singleplayer only)
    maybeSpawnGuardian(mc, p, biome) {
        if (!Exploration.GUARDED.includes(biome)) return;
        if (!mc.world || !(mc.isSingleplayer && mc.isSingleplayer())) return;
        let spawned = [];
        try {
            const raw = localStorage.getItem("rc_guardians");
            if (raw) spawned = JSON.parse(raw) || [];
        } catch (e) { spawned = []; }
        if (spawned.includes(biome)) return;
        spawned.push(biome);
        try { localStorage.setItem("rc_guardians", JSON.stringify(spawned)); } catch (e) { }
        import("../entity/EntitySkeleton.js").then(m => {
            try {
                const e = new m.default(mc, mc.world, Date.now() % 100000);
                e.maxHealth = 60;
                e.health = 60;
                e.isGuardian = true;
                const bx = Math.floor(p.x + 6), bz = Math.floor(p.z + 6);
                e.setPosition(bx + 0.5, mc.world.getHeightAt(bx, bz) + 1, bz + 0.5);
                mc.world.addEntity(e);
                mc.addMessageToChat("A guardian rises to protect the " + Exploration.NAMES[biome] + "!");
            } catch (err) { }
        }).catch(() => { });
    }

    tick() {
        const now = Date.now();
        if (now - this.lastCheck < 1000) return;
        this.lastCheck = now;

        const mc = this.rayancraft;
        const p = mc.player;
        if (!p || p.isDead || !mc.isInGame()) return;

        let biome = null;
        try {
            const w = mc.world;
            const cp = w && w.getChunkProvider ? w.getChunkProvider() : null;
            const g = cp && cp.generator;
            if (g && typeof g.getBiomeAt === "function") {
                biome = g.getBiomeAt(Math.floor(p.x), Math.floor(p.z));
            }
        } catch (e) { return; }
        if (!biome || !(biome in Exploration.NAMES) || this.visited.has(biome)) return;

        this.visited.add(biome);
        this.save();
        const n = this.visited.size;
        try { mc.addMessageToChat("Discovered: " + Exploration.NAMES[biome] + " (" + n + "/" + Exploration.TOTAL + " biomes)"); } catch (e) { }
        // Biome guardians: rare biomes are protected — first visit wakes one
        try { this.maybeSpawnGuardian(mc, p, biome); } catch (e) { }
        if (biome === "cherry" || biome === "grove") {
            try { mc.achievements.unlock("cherry"); } catch (e) { }
        }
        for (const m of Exploration.MILESTONES) {
            if (n >= m.count) {
                try { mc.achievements.unlock(m.achievement); } catch (e) { }
            }
        }
    }
}
