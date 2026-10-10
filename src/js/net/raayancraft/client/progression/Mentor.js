// Mentor NPCs: evolving teachers of advanced mechanics.
// Lessons unlock by skill level, dialogue changes as the player improves,
// and each lesson grants a small practice quest (break/place/kill) for XP.
// Works with existing villagers: stand near one and use /mentor.
// Persisted in localStorage. Chat-only.
export default class Mentor {

    static LESSONS = [
        { id: "m_stone", track: "mining", level: 0, title: "Grip the Pick", text: "Mentor: break stone with rhythm — ores hide below Y=30. Quest: mine 8 stone.", kind: "break", ids: [1, 4], target: 8, xp: 10 },
        { id: "m_fortune", track: "mining", level: 2, title: "Fortune's Favor", text: "Mentor: higher Mining grants bonus ore drops. Try /enchant fortune. Quest: mine 4 iron.", kind: "break", ids: [15, 201], target: 4, xp: 20 },
        { id: "m_crit", track: "combat", level: 0, title: "Strike True", text: "Mentor: fall while striking for CRIT (1.5x). Quest: defeat 3 creatures.", kind: "kill", target: 3, xp: 15 },
        { id: "m_enchant", track: "combat", level: 2, title: "Edged Wisdom", text: "Mentor: /enchant sharpness + strength brews stack. Quest: defeat 5 creatures.", kind: "kill", target: 5, xp: 25 },
        { id: "m_raise", track: "building", level: 0, title: "First Walls", text: "Mentor: torches (place 8) keep spawns away. Quest: place 10 blocks.", kind: "place", target: 10, xp: 10 },
        { id: "m_reach", track: "building", level: 3, title: "Long Arms", text: "Mentor: Building levels extend reach (+1 per 5 lv). Quest: place 15 blocks.", kind: "place", target: 15, xp: 25 },
        { id: "m_forage", track: "gathering", level: 0, title: "Green Thumb", text: "Mentor: leaves may drop apples; Gathering raises the chance. Quest: break 8 leaves/logs.", kind: "break", ids: [18, 17, 205, 206], target: 8, xp: 10 },
        { id: "m_biomes", track: "gathering", level: 2, title: "Wayfarer's Eye", text: "Mentor: check /quests explorer line; cherry groves hide pink wood. Quest: discover 2 biomes.", kind: "biomes", target: 2, xp: 25 },
    ];

    constructor(rayancraft) {
        this.rayancraft = rayancraft;
        this.state = this.load();
        this.lastHint = 0;
    }

    load() {
        const fresh = { done: [], active: null, progress: 0 };
        try {
            const raw = localStorage.getItem("rc_mentor");
            if (raw) {
                const s = JSON.parse(raw);
                if (s && typeof s === "object") return Object.assign(fresh, s);
            }
        } catch (e) { }
        return fresh;
    }

    save() {
        try { localStorage.setItem("rc_mentor", JSON.stringify(this.state)); } catch (e) { }
    }

    say(msg) {
        try { this.rayancraft.addMessageToChat(msg); } catch (e) { }
    }

    skillLevel(track) {
        try { return this.rayancraft.skills ? this.rayancraft.skills.level(track) : 0; } catch (e) { return 0; }
    }

    nextLesson() {
        for (const l of Mentor.LESSONS) {
            if (this.state.done.includes(l.id)) continue;
            if (this.skillLevel(l.track) >= l.level) return l;
        }
        return null;
    }

    current() {
        if (!this.state.active) {
            const n = this.nextLesson();
            if (n) { this.state.active = n.id; this.state.progress = 0; this.save(); }
            return n;
        }
        return Mentor.LESSONS.find((l) => l.id === this.state.active) || this.nextLesson();
    }

    event(kind, data) {
        const c = this.current();
        if (!c || c.kind !== kind) return;
        if (c.ids && !c.ids.includes(data)) return;
        // biomes handled in tick
        if (kind === "biomes") return;
        this.state.progress++;
        if (this.state.progress >= c.target) this.complete(c);
        else {
            if (this.state.progress === 1 || this.state.progress % 3 === 0) {
                this.say("Mentor quest: " + c.title + " " + this.state.progress + "/" + c.target);
            }
            this.save();
        }
    }

    complete(lesson) {
        const c = lesson || this.current();
        if (!c) return;
        try { this.rayancraft.player.experience += c.xp; } catch (e) { }
        this.say("Mentor: well done — " + c.title + "! +" + c.xp + " XP");
        try { this.rayancraft.achievements.unlock("mentor"); } catch (e) { }
        this.state.done.push(c.id);
        this.state.active = null;
        this.state.progress = 0;
        this.save();
        const n = this.nextLesson();
        if (n) {
            this.state.active = n.id;
            this.save();
            this.say("Mentor's next lesson: " + n.title + " — " + n.text);
        } else {
            this.say("Mentor: you have learned all I can teach. The mastery trials await (/milestones).");
        }
    }

    // Evolving dialogue: same mentor, deeper advice as levels rise.
    wisdom() {
        const mining = this.skillLevel("mining"), combat = this.skillLevel("combat");
        const building = this.skillLevel("building"), gathering = this.skillLevel("gathering");
        if (mining + combat + building + gathering >= 15) return "Mentor: Polymath! Your combos (/milestones) now earn bonus XP. Teach others.";
        if (combat >= 4) return "Mentor: your blade sings. Time your falls, brew strength, and hunt the Blood Moon boss.";
        if (mining >= 4) return "Mentor: deep stone remembers you. Diamonds near lava lakes; fortune doubles fate.";
        if (building >= 4) return "Mentor: your halls could house a museum (/legacy museum). Build to be remembered.";
        if (gathering >= 3) return "Mentor: the groves whisper. Farm leaves, chase cherry blossoms, map every biome.";
        return "Mentor: every master was once a beginner. Ask me with /mentor.";
    }

    nearestVillagerDist() {
        try {
            const mc = this.rayancraft;
            const p = mc.player;
            if (!p || !mc.world || !mc.world.entities) return Infinity;
            let best = Infinity;
            for (const e of mc.world.entities) {
                if (e && e.constructor && e.constructor.name === "EntityVillager" && !e.isDead) {
                    const d = Math.hypot(e.x - p.x, e.z - p.z);
                    if (d < best) best = d;
                }
            }
            return best;
        } catch (e) { return Infinity; }
    }

    tick() {
        const mc = this.rayancraft;
        if (!mc.player || mc.player.isDead || !mc.isInGame()) return;
        // Biome mentor quests poll exploration
        try {
            const c = this.current();
            if (c && c.kind === "biomes") {
                const n = mc.exploration ? mc.exploration.visited.size : 0;
                // mentor biome quests are short: track session-relative progress simply
                if (!this._biomeBase) this._biomeBase = n;
                const p = Math.min(c.target, n - this._biomeBase + (this.state.progress || 0));
                if (p > this.state.progress) {
                    this.state.progress = p;
                    if (p >= c.target) this.complete(c);
                    else { this.say("Mentor quest: " + c.title + " " + p + "/" + c.target); this.save(); }
                }
            } else {
                this._biomeBase = null;
            }
        } catch (e) { }
        // Ambient mentor chatter near villagers (throttled 45s)
        try {
            const now = Date.now();
            if (now - this.lastHint > 45000 && this.nearestVillagerDist() < 8) {
                this.lastHint = now;
                this.say("<Mentor> " + this.wisdom());
            }
        } catch (e) { }
    }
}
