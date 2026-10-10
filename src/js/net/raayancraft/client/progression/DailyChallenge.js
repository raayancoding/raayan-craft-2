// Daily challenge rotator: one date-seeded challenge per day, tracked live,
// persisted in localStorage, rewarded with XP. Zero UI dependencies (chat only).
export default class DailyChallenge {

    static DEFS = [
        { id: "marathon", title: "Marathon", desc: "Walk 800m today", target: 800 },
        { id: "mountaineer", title: "Mountaineer", desc: "Climb above Y=95 today", target: 1 },
        { id: "spelunker", title: "Spelunker", desc: "Delve below Y=18 today", target: 1 },
        { id: "globetrotter", title: "Globetrotter", desc: "Visit 3 different biomes today", target: 3 },
        { id: "survivor", title: "Survivor", desc: "Stay alive 5 minutes today", target: 6000 },
        { id: "wanderer", title: "Wanderer", desc: "Get 400m from spawn today", target: 400 },
    ];

    static REWARD_XP = 30;

    constructor(rayancraft) {
        this.rayancraft = rayancraft;
        this.announced = false;
        this.lastX = null;
        this.lastZ = null;
        this.dayBiomes = new Set();
        this.state = this.load();
    }

    todayKey() {
        try {
            return new Date().toISOString().slice(0, 10);
        } catch (e) {
            return "day";
        }
    }

    pickDef(dateKey) {
        let h = 0;
        for (let i = 0; i < dateKey.length; i++) h = (31 * h + dateKey.charCodeAt(i)) | 0;
        return DailyChallenge.DEFS[Math.abs(h) % DailyChallenge.DEFS.length];
    }

    load() {
        const key = this.todayKey();
        try {
            const raw = localStorage.getItem("rc_daily");
            if (raw) {
                const s = JSON.parse(raw);
                if (s && s.date === key && s.defId) {
                    const def = DailyChallenge.DEFS.find((d) => d.id === s.defId) || this.pickDef(key);
                    return { date: key, defId: def.id, progress: s.progress || 0, done: !!s.done };
                }
            }
        } catch (e) { }
        const def = this.pickDef(key);
        return { date: key, defId: def.id, progress: 0, done: false };
    }

    save() {
        try {
            localStorage.setItem("rc_daily", JSON.stringify(this.state));
        } catch (e) { }
    }

    get def() {
        return DailyChallenge.DEFS.find((d) => d.id === this.state.defId) || DailyChallenge.DEFS[0];
    }

    biomeAt(x, z) {
        try {
            const w = this.rayancraft.world;
            const cp = w && w.getChunkProvider ? w.getChunkProvider() : null;
            const g = cp && cp.generator;
            if (g && typeof g.getBiomeAt === "function") return g.getBiomeAt(x, z);
        } catch (e) { }
        return null;
    }

    say(msg) {
        try { this.rayancraft.addMessageToChat(msg); } catch (e) { }
    }

    tick() {
        const mc = this.rayancraft;
        const p = mc.player;
        if (!p || p.isDead || !mc.isInGame()) return;

        // Day rollover
        if (this.state.date !== this.todayKey()) {
            this.state = this.load();
            this.dayBiomes = new Set();
            this.announced = false;
            this.lastX = null;
        }

        if (!this.announced) {
            this.announced = true;
            if (!this.state.done) {
                const d = this.def;
                this.say("Daily challenge: " + d.title + " — " + d.desc + " (" + Math.floor(this.state.progress) + "/" + d.target + ")");
            }
        }
        if (this.state.done) return;

        const d = this.def;
        let hit = false;
        if (d.id === "marathon") {
            if (this.lastX !== null) {
                const dx = p.x - this.lastX, dz = p.z - this.lastZ;
                this.state.progress += Math.sqrt(dx * dx + dz * dz);
                hit = true;
            }
            this.lastX = p.x;
            this.lastZ = p.z;
        } else if (d.id === "mountaineer") {
            if (p.y >= 95) { this.state.progress = 1; hit = true; }
        } else if (d.id === "spelunker") {
            if (p.y <= 18) { this.state.progress = 1; hit = true; }
        } else if (d.id === "globetrotter") {
            const b = this.biomeAt(Math.floor(p.x), Math.floor(p.z));
            if (b && !this.dayBiomes.has(b)) {
                this.dayBiomes.add(b);
                this.state.progress = this.dayBiomes.size;
                if (this.state.progress === Math.floor(d.target / 2)) this.say("Challenge update: " + d.title + " " + this.state.progress + "/" + d.target);
                hit = true;
            }
        } else if (d.id === "survivor") {
            this.state.progress += 1;
            hit = this.state.progress % 1200 === 0;
            if (hit) this.say("Challenge update: " + d.title + " " + Math.floor(this.state.progress / 1200) + "/5 min");
        } else if (d.id === "wanderer") {
            try {
                const s = mc.world.spawn;
                const dx = p.x - s.x, dz = p.z - s.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist > this.state.progress) {
                    this.state.progress = dist;
                    hit = true;
                }
            } catch (e) { }
        }

        if (this.state.progress >= d.target) {
            this.state.progress = d.target;
            this.state.done = true;
            this.save();
            try { if (mc.addXP) mc.addXP(DailyChallenge.REWARD_XP); } catch (e) { }
            this.say("Challenge complete: " + d.title + "! +" + DailyChallenge.REWARD_XP + " XP");
            try { mc.achievements.unlock("challenger"); } catch (e) { }
            return;
        }
        if (hit) this.save();
    }
}
