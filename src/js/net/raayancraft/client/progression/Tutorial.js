// Adaptive onboarding: full staged hints for first-time players, a short
// welcome-back for returning players. Driven by real actions (walk, break,
// place, time). Replay/skip via /tutorial. Persisted in localStorage.
export default class Tutorial {

    constructor(rayancraft) {
        this.rayancraft = rayancraft;
        this.state = this.load();
        this.t0 = Date.now();
    }

    load() {
        try {
            const seen = localStorage.getItem("rc_onboarded") === "1";
            const raw = localStorage.getItem("rc_tutorial");
            if (raw) {
                const s = JSON.parse(raw);
                if (s && typeof s.stage === "number") {
                    return { stage: s.stage, done: !!s.done, returning: seen };
                }
            }
            return { stage: 0, done: false, returning: seen };
        } catch (e) { }
        return { stage: 0, done: false, returning: false };
    }

    save() {
        try {
            localStorage.setItem("rc_tutorial", JSON.stringify({ stage: this.state.stage, done: this.state.done }));
            if (this.state.done) localStorage.setItem("rc_onboarded", "1");
        } catch (e) { }
    }

    say(msg) {
        try { this.rayancraft.addMessageToChat(msg); } catch (e) { }
    }

    finish() {
        this.state.done = true;
        this.save();
    }

    tick() {
        if (this.state.done) return;
        const mc = this.rayancraft;
        const p = mc.player;
        if (!p || p.isDead || !mc.isInGame()) return;

        // Returning players get one short line instead of the full track
        if (this.state.returning && this.state.stage === 0) {
            this.state.stage = 99;
            let quest = "";
            try {
                const q = mc.quests ? mc.quests.current() : null;
                if (q) quest = " Active quest: " + q.title + " — /quests for details.";
            } catch (e) { }
            this.say("Welcome back!" + quest);
            this.finish();
            return;
        }

        let walked = 0, broken = 0, placed = 0;
        try {
            walked = mc.stats ? mc.stats.s.walked : 0;
            broken = mc.stats ? mc.stats.s.broken : 0;
            placed = mc.stats ? mc.stats.s.placed : 0;
        } catch (e) { }

        if (this.state.stage === 0) {
            this.say("Welcome! WASD to move, mouse to look, click to lock the cursor. E opens inventory, T chats (/help for commands).");
            this.state.stage = 1;
            this.save();
        } else if (this.state.stage === 1 && walked > 10) {
            this.say("Good legs! LEFT-click blocks to break them — ores grant XP and levels.");
            this.state.stage = 2;
            this.save();
        } else if (this.state.stage === 2 && broken > 0) {
            this.say("Nice! RIGHT-click to place blocks. Torches keep the dark (and mobs) away.");
            this.state.stage = 3;
            this.save();
        } else if (this.state.stage === 3 && placed > 0) {
            this.say("Builder! Try /quests for the quest chain, /skills for mastery, /sethome + /home to never get lost.");
            this.state.stage = 4;
            this.save();
        } else if (this.state.stage === 4 && Date.now() - this.t0 > 90000) {
            this.say("Survive the night, delve deep for diamonds, and watch for the Blood Moon. Good luck!");
            this.finish();
        }
    }
}
