// Tiny achievement + toast system (pure celebration, zero dependencies).
export default class Achievements {
    static DEFS = {
        diamond: { title: "DIAMONDS!", desc: "Mine your first diamond" },
        copper: { title: "Copper Age", desc: "Mine copper (latest!)" },
        myth: { title: "Myth Slayer", desc: "Defeat a mythical creature" },
        cherry: { title: "Pink Paradise", desc: "Enter a Cherry Grove" },
        bloodmoon: { title: "Survivor", desc: "Survive a Blood Moon" },
        dog: { title: "Best Friend", desc: "Summon a loyal dog" },
        chest: { title: "Hoarder", desc: "Open a chest" },
        explorer_5: { title: "Explorer", desc: "Discover 5 biomes" },
        explorer_10: { title: "Cartographer", desc: "Discover 10 biomes" },
        explorer_20: { title: "Pathfinder", desc: "Discover 20 biomes" },
        explorer_all: { title: "World Walker", desc: "Discover every biome" },
        challenger: { title: "Challenger", desc: "Complete a daily challenge" },
        quest_master: { title: "Quest Master", desc: "Finish the entire quest chain" },
        boss: { title: "Boss Slayer", desc: "Defeat a Blood Moon boss" },
        trialist: { title: "Trialist", desc: "Complete a mastery trial" },
        guardian: { title: "Guardian Bane", desc: "Fell a biome guardian" },
        treasure: { title: "Treasure Hunter", desc: "Dig up buried treasure" },
        milestone_adapter: { title: "Adapter", desc: "Complete an adaptive milestone" },
        combo: { title: "Combo Artist", desc: "Unlock a skill-combo" },
        mastery: { title: "Master", desc: "Complete a weekly mastery challenge" },
        gate: { title: "Gatecrasher", desc: "Push a community gate over the line" },
        mentor: { title: "Apprentice", desc: "Complete a mentor lesson" },
        curator: { title: "Curator", desc: "Enshrine your first museum exhibit" },
        curator_5: { title: "Archivist", desc: "Enshrine 5 museum exhibits" },
        vault_keeper: { title: "Vaultkeeper", desc: "Claim an anniversary vault cosmetic" },
        prestige: { title: "Prestigious", desc: "Reach a prestige tier" },
        prestige_1: { title: "Wayfarer", desc: "Prestige tier 1 (cosmetic)" },
        prestige_2: { title: "Veteran", desc: "Prestige tier 2 (cosmetic)" },
        prestige_3: { title: "Warden", desc: "Prestige tier 3 (cosmetic)" },
        time_capsule: { title: "Time Traveler", desc: "Open a time capsule" },
    };
    constructor(rayancraft) {
        this.rayancraft = rayancraft;
        this.unlocked = new Set();
        this.queue = []; // {title, desc, time}
    }
    unlock(id) {
        if (this.unlocked.has(id)) return;
        this.unlocked.add(id);
        const d = Achievements.DEFS[id];
        if (!d) return;
        this.queue.push({ ...d, time: Date.now() });
        try { this.rayancraft.addMessageToChat("§eAchievement: " + d.title); } catch (e) { }
    }
    // Called each overlay tick; returns active toast or null
    currentToast() {
        if (this.queue.length === 0) return null;
        const t = this.queue[0];
        if (Date.now() - t.time > 4000) { this.queue.shift(); return this.currentToast(); }
        return t;
    }
}
