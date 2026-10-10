import Skills from "./Skills.js";

// Time-limited mastery trials: /trial starts a seeded sprint (mine / slay /
// walk against the clock). Progress via break/kill hooks + walked delta.
// Reward on success, 10-minute cooldown. In-memory run, persisted cooldown.
export default class Trial {

    static COOLDOWN_MS = 10 * 60 * 1000;

    static DEFS = [
        { id: "ore_rush", title: "Ore Rush", desc: "Mine 8 ores", kind: "break_ore", target: 8, time: 180 },
        { id: "hunt", title: "The Hunt", desc: "Slay 4 creatures", kind: "kill", target: 4, time: 180 },
        { id: "sprint", title: "Sprint", desc: "Walk 300m", kind: "walk", target: 300, time: 120 },
    ];

    static REWARD_XP = 40;

    constructor(rayancraft) {
        this.rayancraft = rayancraft;
        this.active = null;
        this.lastX = null;
        this.lastZ = null;
        this.lastDone = 0;
        try {
            const raw = localStorage.getItem("rc_trial");
            if (raw) {
                const s = JSON.parse(raw);
                if (s && typeof s.lastDone === "number") this.lastDone = s.lastDone;
            }
        } catch (e) { }
    }

    save() {
        try {
            localStorage.setItem("rc_trial", JSON.stringify({ lastDone: this.lastDone }));
        } catch (e) { }
    }

    say(msg) {
        try { this.rayancraft.addMessageToChat(msg); } catch (e) { }
    }

    start() {
        if (this.active) {
            const left = Math.ceil((this.active.deadline - Date.now()) / 1000);
            this.say("Trial in progress: " + this.active.def.title + " " + this.active.progress + "/" + this.active.def.target + " (" + left + "s left)");
            return;
        }
        const wait = Trial.COOLDOWN_MS - (Date.now() - this.lastDone);
        if (wait > 0) {
            this.say("Next trial in " + Math.ceil(wait / 60000) + " min.");
            return;
        }
        const defs = Trial.DEFS;
        const def = defs[Math.floor(Math.random() * defs.length)];
        let walkStart = 0;
        try { walkStart = this.rayancraft.stats ? this.rayancraft.stats.s.walked : 0; } catch (e) { }
        this.active = { def, progress: 0, deadline: Date.now() + def.time * 1000, walkStart };
        this.say("Trial started: " + def.title + " — " + def.desc + " in " + def.time + "s! +" + Trial.REWARD_XP + " XP");
    }

    event(kind, data) {
        if (!this.active) return;
        const a = this.active;
        if (kind === "break" && a.def.kind === "break_ore") {
            if (Skills.ORES.includes(data)) a.progress++;
        } else if (kind === "kill" && a.def.kind === "kill") {
            a.progress++;
        } else {
            return;
        }
        if (a.progress >= a.def.target) this.succeed();
    }

    succeed() {
        const a = this.active;
        if (!a) return;
        this.active = null;
        this.lastDone = Date.now();
        this.save();
        try {
            if (this.rayancraft.addXP) this.rayancraft.addXP(Trial.REWARD_XP);
        } catch (e) { }
        this.say("Trial complete: " + a.def.title + "! +" + Trial.REWARD_XP + " XP");
        try { this.rayancraft.achievements.unlock("trialist"); } catch (e) { }
    }

    fail() {
        const a = this.active;
        if (!a) return;
        this.active = null;
        this.lastDone = Date.now();
        this.save();
        this.say("Trial failed: " + a.def.title + ". Better luck next time!");
    }

    tick() {
        if (!this.active) return;
        const mc = this.rayancraft;
        const p = mc.player;
        if (!p || p.isDead || !mc.isInGame()) return;
        if (Date.now() > this.active.deadline) {
            this.fail();
            return;
        }
        if (this.active.def.kind === "walk") {
            try {
                const w = mc.stats ? mc.stats.s.walked : 0;
                this.active.progress = Math.floor(w - this.active.walkStart);
                if (this.active.progress >= this.active.def.target) this.succeed();
            } catch (e) { }
        }
    }
}
