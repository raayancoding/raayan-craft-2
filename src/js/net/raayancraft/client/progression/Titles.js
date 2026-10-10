// Legacy/prestige titles: cosmetic chat tags unlocked by accomplishments.
// Availability is recomputed from persisted progression stores; the active
// choice persists. Shown via /title, rendered in chat by PlayerController.
export default class Titles {

    static DEFS = [
        { id: "novice", name: "Novice", test: () => true },
        { id: "explorer", name: "Explorer", test: (mc) => Titles.visited(mc) >= 5 },
        { id: "pathfinder", name: "Pathfinder", test: (mc) => Titles.visited(mc) >= 10 },
        { id: "walker", name: "World Walker", test: (mc) => Titles.visited(mc) >= 24 },
        { id: "brawler", name: "Brawler", test: (mc) => Titles.skill(mc, "combat") >= 5 },
        { id: "miner", name: "Master Miner", test: (mc) => Titles.skill(mc, "mining") >= 8 },
        { id: "architect", name: "Architect", test: (mc) => Titles.skill(mc, "building") >= 8 },
        { id: "legend", name: "Legend", test: (mc) => { try { return mc.quests && !mc.quests.current(); } catch (e) { return false; } } },
        { id: "champion", name: "Champion", test: (mc) => Titles.champion(mc) },
        { id: "challenger", name: "Challenger", test: (mc) => { try { return mc.dailyChallenge && mc.dailyChallenge.state.done; } catch (e) { return false; } } },
    ];

    static visited(mc) {
        try { return mc.exploration ? mc.exploration.visited.size : 0; } catch (e) { return 0; }
    }

    static skill(mc, track) {
        try { return mc.skills ? mc.skills.level(track) : 0; } catch (e) { return 0; }
    }

    static champion(mc) {
        try {
            if (mc.achievements && mc.achievements.unlocked && mc.achievements.unlocked.has("boss")) return true;
            if (mc.stats && mc.stats.s.kills >= 50) return true;
        } catch (e) { }
        return false;
    }

    constructor(rayancraft) {
        this.rayancraft = rayancraft;
        this.active = null;
        try {
            const raw = localStorage.getItem("rc_title");
            if (raw) this.active = raw;
        } catch (e) { }
    }

    unlocked() {
        const mc = this.rayancraft;
        return Titles.DEFS.filter((d) => {
            try { return d.test(mc); } catch (e) { return false; }
        });
    }

    activeTag() {
        if (!this.active || this.active === "novice") return "";
        const ok = this.unlocked().some((d) => d.id === this.active);
        if (!ok) return "";
        const d = Titles.DEFS.find((x) => x.id === this.active);
        return d ? "[" + d.name + "]" : "";
    }

    set(id) {
        const mc = this.rayancraft;
        const d = Titles.DEFS.find((x) => x.id === (id || "").toLowerCase());
        if (!d) return false;
        if (!this.unlocked().some((x) => x.id === d.id)) {
            try { mc.addMessageToChat("Title not unlocked yet: " + d.name); } catch (e) { }
            return true;
        }
        this.active = d.id;
        try { localStorage.setItem("rc_title", d.id); } catch (e) { }
        try { mc.addMessageToChat("Title set: " + d.name); } catch (e) { }
        return true;
    }
}
