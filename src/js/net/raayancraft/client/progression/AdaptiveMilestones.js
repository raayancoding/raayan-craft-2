// Adaptive milestone quests: objectives reshape per player playstyle.
// Infers archetype (miner/builder/slayer/explorer/wanderer) from Stats +
// Skills + Exploration, then serves a tiered milestone with scaled targets.
// Also covers: skill-combo unlocks, rotating mastery challenge (weekly seed),
// community progression gate (local contributions -> shared buff flag),
// dynamic-difficulty modifier unlocks and alternate-mode unlock hooks.
// Persisted in localStorage. Chat-only, zero UI dependencies.
export default class AdaptiveMilestones {

    static ARCHETYPES = ["miner", "builder", "slayer", "explorer", "wanderer"];

    // Base milestone chain per archetype. Targets scale with relevant skill.
    static CHAINS = {
        miner: [
            { id: "miner_1", title: "Prospector", desc: "Mine 12 stone/cobble", kind: "break", ids: [1, 4], base: 12, xp: 12 },
            { id: "miner_2", title: "Veinseeker", desc: "Mine 5 iron/copper ore", kind: "break", ids: [15, 201], base: 5, xp: 25 },
            { id: "miner_3", title: "Deep Delver", desc: "Mine 3 diamond/redstone", kind: "break", ids: [56, 73], base: 3, xp: 50 },
        ],
        builder: [
            { id: "builder_1", title: "Homesteader", desc: "Place 20 blocks", kind: "place", base: 20, xp: 12 },
            { id: "builder_2", title: "Architect", desc: "Place 12 torches/crafting", kind: "place", ids: [50, 58], base: 12, xp: 25 },
            { id: "builder_3", title: "Monumental", desc: "Place 40 blocks", kind: "place", base: 40, xp: 50 },
        ],
        slayer: [
            { id: "slayer_1", title: "Watchman", desc: "Defeat 4 creatures", kind: "kill", base: 4, xp: 15 },
            { id: "slayer_2", title: "Hunter", desc: "Defeat 8 creatures", kind: "kill", base: 8, xp: 30 },
            { id: "slayer_3", title: "Mythbane", desc: "Defeat 12 creatures", kind: "kill", base: 12, xp: 55 },
        ],
        explorer: [
            { id: "explorer_1", title: "Drifter", desc: "Discover 3 biomes", kind: "biomes", base: 3, xp: 20 },
            { id: "explorer_2", title: "Pathfinder", desc: "Discover 6 biomes", kind: "biomes", base: 6, xp: 40 },
            { id: "explorer_3", title: "Worldwalker", desc: "Discover 10 biomes", kind: "biomes", base: 10, xp: 70 },
        ],
        wanderer: [
            { id: "wanderer_1", title: "Roamer", desc: "Walk 500m", kind: "walked", base: 500, xp: 12 },
            { id: "wanderer_2", title: "Trekker", desc: "Walk 1500m", kind: "walked", base: 1500, xp: 30 },
            { id: "wanderer_3", title: "Nomad", desc: "Walk 4000m", kind: "walked", base: 4000, xp: 60 },
        ],
    };

    // Skill-combo unlocks: creative multi-track play rewarded (cosmetic + XP).
    static COMBOS = [
        { id: "combo_tinker", title: "Tinker", need: { mining: 2, building: 2 }, desc: "Reach Mining 2 + Building 2", xp: 20 },
        { id: "combo_ranger", title: "Ranger", need: { combat: 2, gathering: 2 }, desc: "Reach Combat 2 + Gathering 2", xp: 20 },
        { id: "combo_sage", title: "Sage", need: { mining: 4, combat: 3 }, desc: "Reach Mining 4 + Combat 3", xp: 40 },
        { id: "combo_master", title: "Polymath", need: { mining: 5, building: 5, combat: 5 }, desc: "Reach Mining/Building/Combat 5", xp: 80 },
    ];

    static MASTERY = [
        { id: "mastery_sprint", title: "Sprint Week", desc: "Walk 1000m this week", kind: "walked", target: 1000 },
        { id: "mastery_quarry", title: "Quarry Week", desc: "Break 60 blocks this week", kind: "break", target: 60 },
        { id: "mastery_raise", title: "Raise Week", desc: "Place 60 blocks this week", kind: "build", target: 60 },
        { id: "mastery_hunt", title: "Hunt Week", desc: "Defeat 10 creatures this week", kind: "kill", target: 10 },
    ];

    static GATE_TARGET = 200; // community gate: collective contributions

    constructor(rayancraft) {
        this.rayancraft = rayancraft;
        this.state = this.load();
        this.announced = false;
        this.lastGateAnnounce = 0;
    }

    load() {
        const fresh = { tier: 0, progress: 0, combos: [], masteryWeek: "", masteryProgress: 0, masteryDone: [], gate: 0, buff: false, mods: [] };
        try {
            const raw = localStorage.getItem("rc_milestones");
            if (raw) {
                const s = JSON.parse(raw);
                if (s && typeof s === "object") return Object.assign(fresh, s);
            }
        } catch (e) { }
        return fresh;
    }

    save() {
        try { localStorage.setItem("rc_milestones", JSON.stringify(this.state)); } catch (e) { }
    }

    say(msg) {
        try { this.rayancraft.addMessageToChat(msg); } catch (e) { }
    }

    // Score each playstyle from live stats; highest wins. Ties -> current chain.
    inferArchetype() {
        try {
            const st = this.rayancraft.stats ? this.rayancraft.stats.s : {};
            const sk = this.rayancraft.skills;
            const biomes = this.rayancraft.exploration ? this.rayancraft.exploration.visited.size : 0;
            const scores = {
                miner: (st.broken || 0) * 0.5 + (sk ? sk.level("mining") * 8 : 0),
                builder: (st.placed || 0) * 0.6 + (sk ? sk.level("building") * 8 : 0),
                slayer: (st.kills || 0) * 3 + (sk ? sk.level("combat") * 8 : 0),
                explorer: biomes * 6,
                wanderer: Math.floor((st.walked || 0) / 200),
            };
            let best = "miner", bestScore = -1;
            for (const a of AdaptiveMilestones.ARCHETYPES) {
                if (scores[a] > bestScore) { bestScore = scores[a]; best = a; }
            }
            return best;
        } catch (e) { return "miner"; }
    }

    skillFor(archetype) {
        return { miner: "mining", builder: "building", slayer: "combat", explorer: "gathering", wanderer: "gathering" }[archetype] || "mining";
    }

    currentDef() {
        const arch = this.inferArchetype();
        const chain = AdaptiveMilestones.CHAINS[arch];
        const idx = Math.min(this.state.tier, chain.length - 1);
        const base = chain[idx];
        // Scale target mildly with relevant skill so veterans get a real milestone.
        let scale = 1;
        try {
            const lvl = this.rayancraft.skills ? this.rayancraft.skills.level(this.skillFor(arch)) : 0;
            scale = 1 + Math.min(1, lvl * 0.1);
        } catch (e) { }
        return { arch, idx, def: base, target: Math.round(base.base * scale) };
    }

    weekKey() {
        try {
            const d = new Date();
            // ISO week number
            const onejan = new Date(d.getFullYear(), 0, 1);
            const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
            return d.getFullYear() + "-W" + week;
        } catch (e) { return "week"; }
    }

    masteryDef() {
        const wk = this.weekKey();
        let h = 0;
        for (let i = 0; i < wk.length; i++) h = (31 * h + wk.charCodeAt(i)) | 0;
        return AdaptiveMilestones.MASTERY[Math.abs(h) % AdaptiveMilestones.MASTERY.length];
    }

    event(kind, data) {
        const { def, target } = this.currentDef();
        if (def.kind === kind) {
            if (def.ids && !def.ids.includes(data)) { /* not our block */ }
            else {
                this.state.progress++;
                this.state.gate++;
                if (this.state.progress >= target) this.completeMilestone();
                else {
                    if (this.state.progress === 1 || this.state.progress % 5 === 0) {
                        this.say("Milestone: " + def.title + " " + this.state.progress + "/" + target + " [" + this.inferArchetype() + "]");
                    }
                    this.save();
                }
            }
        }
        // Mastery feed
        try {
            const m = this.masteryDef();
            const wk = this.weekKey();
            if (this.state.masteryWeek !== wk) { this.state.masteryWeek = wk; this.state.masteryProgress = 0; }
            if (!this.state.masteryDone.includes(wk + ":" + m.id)) {
                if ((m.kind === "break" && kind === "break") || (m.kind === "build" && kind === "place") || (m.kind === "kill" && kind === "kill")) {
                    this.state.masteryProgress++;
                    if (this.state.masteryProgress >= m.target) {
                        this.state.masteryDone.push(wk + ":" + m.id);
                        try { this.rayancraft.player.experience += 40; } catch (e) { }
                        this.say("Mastery complete: " + m.title + "! +40 XP (seasonal leaderboard +1)");
                        try { this.rayancraft.achievements.unlock("mastery"); } catch (e) { }
                    }
                    this.save();
                }
            }
        } catch (e) { }
        this.checkCombos();
        this.checkGate();
    }

    completeMilestone() {
        const { arch, def, target } = this.currentDef();
        void target;
        try { this.rayancraft.player.experience += def.xp; } catch (e) { }
        this.say("Adaptive milestone: " + def.title + "! +" + def.xp + " XP — path of the " + arch);
        try { this.rayancraft.achievements.unlock("milestone_adapter"); } catch (e) { }
        // Dynamic difficulty modifier unlock every 2 tiers (optional modifiers)
        if ((this.state.tier + 1) % 2 === 0) {
            const mod = "hard_" + arch + "_" + (this.state.tier + 1);
            if (!this.state.mods.includes(mod)) {
                this.state.mods.push(mod);
                this.say("Unlocked optional modifier: " + mod + " (toggle via /milstones info)");
            }
        }
        // Alternate-mode unlock hook after finishing a full chain
        const chainLen = AdaptiveMilestones.CHAINS[arch].length;
        if (this.state.tier + 1 >= chainLen) {
            this.say("Achievement chain complete for " + arch + "! Alternate mode unlocked: " + arch + "_trial");
            try { this.rayancraft.achievements.unlock("chain_" + arch); } catch (e) { }
            this.state.tier = 0; // loop with rescaled targets
        } else {
            this.state.tier++;
        }
        this.state.progress = 0;
        this.save();
        const next = this.currentDef();
        this.say("Next milestone: " + next.def.title + " — " + next.def.desc + " (x" + next.target + ")");
    }

    checkCombos() {
        try {
            const sk = this.rayancraft.skills;
            if (!sk) return;
            for (const c of AdaptiveMilestones.COMBOS) {
                if (this.state.combos.includes(c.id)) continue;
                let ok = true;
                for (const t of Object.keys(c.need)) {
                    if (sk.level(t) < c.need[t]) { ok = false; break; }
                }
                if (ok) {
                    this.state.combos.push(c.id);
                    this.save();
                    try { this.rayancraft.player.experience += c.xp; } catch (e) { }
                    this.say("Skill combo: " + c.title + "! +" + c.xp + " XP (" + c.desc + ")");
                    try { this.rayancraft.achievements.unlock("combo"); } catch (e) { }
                }
            }
        } catch (e) { }
    }

    checkGate() {
        if (this.state.gate >= AdaptiveMilestones.GATE_TARGET && !this.state.buff) {
            this.state.buff = true;
            this.save();
            this.say("Community gate reached! Server-wide buff active: +1 XP per milestone (collective contributions).");
            try { this.rayancraft.achievements.unlock("gate"); } catch (e) { }
        } else if (!this.state.buff && this.state.gate > 0 && this.state.gate % 50 === 0) {
            const now = Date.now();
            if (now - this.lastGateAnnounce > 60000) {
                this.lastGateAnnounce = now;
                this.say("Community gate: " + this.state.gate + "/" + AdaptiveMilestones.GATE_TARGET + " contributions");
            }
        }
    }

    hasBuff() {
        return !!this.state.buff;
    }

    status() {
        const { arch, def, target } = this.currentDef();
        const m = this.masteryDef();
        return { arch, def, progress: this.state.progress, target, mastery: m, masteryProgress: this.state.masteryProgress, gate: this.state.gate, combos: this.state.combos.slice(), mods: this.state.mods.slice(), buff: this.state.buff };
    }

    tick() {
        const mc = this.rayancraft;
        if (!mc.player || mc.player.isDead || !mc.isInGame()) return;
        if (!this.announced) {
            this.announced = true;
            const s = this.status();
            this.say("Adaptive milestones: path of the " + s.arch + " — " + s.def.title + " (" + s.progress + "/" + s.target + "). Mastery: " + s.mastery.title + ".");
            return;
        }
        // Poll polled kinds: biomes + walked
        try {
            const { def, target } = this.currentDef();
            if (def.kind === "biomes") {
                const n = mc.exploration ? mc.exploration.visited.size : 0;
                // progress mirrors discovery count capped at target for current tier offset
                const want = Math.min(n, target);
                if (want > this.state.progress) {
                    this.state.progress = want;
                    if (want >= target) this.completeMilestone();
                    else { this.say("Milestone: " + def.title + " " + want + "/" + target); this.save(); }
                }
            } else if (def.kind === "walked") {
                const walked = mc.stats ? Math.floor(mc.stats.s.walked) : 0;
                // walked milestones track lifetime distance in chunks of target
                const base = this.state.tier * target;
                const p = Math.min(target, Math.max(0, walked - base));
                if (p > this.state.progress) {
                    this.state.progress = p;
                    if (p >= target) this.completeMilestone();
                    else this.save();
                }
            }
            // mastery walked variant
            const m = this.masteryDef();
            if (m.kind === "walked" && !this.state.masteryDone.includes(this.weekKey() + ":" + m.id)) {
                if (this.state.masteryWeek !== this.weekKey()) { this.state.masteryWeek = this.weekKey(); this.state.masteryProgress = 0; }
            }
        } catch (e) { }
        try { this.checkCombos(); } catch (e) { }
    }
}
