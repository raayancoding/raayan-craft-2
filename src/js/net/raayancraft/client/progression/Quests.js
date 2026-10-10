// Staged quest chain with lore: break/place/kill events advance the active
// quest; biome discovery is polled. Progress + completion announced in chat,
// XP rewarded, finale unlocks an achievement. Persisted in localStorage.
export default class Quests {

    static LOGS = [17, 205, 210, 213, 216, 219, 222, 225];

    static DEFS = [
        { id: "lumber", title: "Punch Wood", desc: "Break 10 logs", kind: "break", ids: Quests.LOGS, target: 10, xp: 10, lore: "Every legend starts with a tree." },
        { id: "stone", title: "Stone Age", desc: "Mine 15 stone or cobblestone", kind: "break", ids: [1, 4], target: 15, xp: 15, lore: "The earth yields to persistence." },
        { id: "torch", title: "First Light", desc: "Place 8 torches", kind: "place", ids: [50], target: 8, xp: 15, lore: "Light keeps the dark at bay." },
        { id: "iron", title: "Iron Will", desc: "Mine 6 iron ore", kind: "break", ids: [15], target: 6, xp: 25, lore: "The age of metal begins." },
        { id: "diamond", title: "Pressure", desc: "Mine 3 diamonds", kind: "break", ids: [56], target: 3, xp: 40, lore: "Pressure makes legends." },
        { id: "slayer", title: "Slayer", desc: "Defeat 6 creatures", kind: "kill", target: 6, xp: 30, lore: "The night fears you now." },
        { id: "explorer", title: "Wayfarer", desc: "Discover 5 biomes", kind: "biomes", target: 5, xp: 40, lore: "The world is yours, Walker." },
    ];

    constructor(rayancraft) {
        this.rayancraft = rayancraft;
        this.state = this.load();
        this.announced = false;
    }

    load() {
        try {
            const raw = localStorage.getItem("rc_quests");
            if (raw) {
                const s = JSON.parse(raw);
                if (s && s.index >= 0 && s.index <= Quests.DEFS.length) {
                    return { index: s.index, progress: s.progress || 0 };
                }
            }
        } catch (e) { }
        return { index: 0, progress: 0 };
    }

    save() {
        try {
            localStorage.setItem("rc_quests", JSON.stringify(this.state));
        } catch (e) { }
    }

    current() {
        return this.state.index < Quests.DEFS.length ? Quests.DEFS[this.state.index] : null;
    }

    say(msg) {
        try { this.rayancraft.addMessageToChat(msg); } catch (e) { }
    }

    event(kind, data) {
        const q = this.current();
        if (!q || q.kind !== kind) return;
        if (q.ids && !q.ids.includes(data)) return;
        this.state.progress++;
        if (this.state.progress >= q.target) {
            this.complete();
        } else {
            if (this.state.progress % 5 === 0 || this.state.progress === 1) {
                this.say("Quest: " + q.title + " " + this.state.progress + "/" + q.target);
            }
            this.save();
        }
    }

    complete() {
        const q = this.current();
        if (!q) return;
        try {
            if (this.rayancraft.addXP) this.rayancraft.addXP(q.xp);
            else {
                const p = this.rayancraft.player;
                if (p) p.experience = (p.experience || 0) + q.xp;
            }
        } catch (e) { }
        this.say("Quest complete: " + q.title + "! +" + q.xp + " XP — §7" + q.lore);
        this.state.index++;
        this.state.progress = 0;
        this.save();
        const next = this.current();
        if (next) {
            this.say("New quest: " + next.title + " — " + next.desc);
        } else {
            this.say("§6All quests complete! You are legend. Daily challenges await.");
            try { this.rayancraft.achievements.unlock("quest_master"); } catch (e) { }
            try { if (this.rayancraft.legacy) this.rayancraft.legacy.recordFeat("Quest Master"); } catch (e) { }
        }
    }

    tick() {
        const q = this.current();
        if (!q) return;
        if (!this.announced) {
            this.announced = true;
            this.say("Quest: " + q.title + " — " + q.desc + " (" + this.state.progress + "/" + q.target + ")");
            return;
        }
        // Biome quests poll the exploration tracker
        if (q.kind === "biomes") {
            try {
                const n = this.rayancraft.exploration ? this.rayancraft.exploration.visited.size : 0;
                if (n > this.state.progress) {
                    this.state.progress = Math.min(n, q.target);
                    if (this.state.progress >= q.target) this.complete();
                    else {
                        this.say("Quest: " + q.title + " " + this.state.progress + "/" + q.target);
                        this.save();
                    }
                }
            } catch (e) { }
        }
    }
}
