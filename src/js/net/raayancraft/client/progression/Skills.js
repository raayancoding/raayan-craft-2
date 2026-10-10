// Skill tracks: Mining / Combat / Gathering / Building.
// XP is earned at central hooks (break, kill, place); levels grant small
// permanent bonuses applied at those same hooks. Persisted in localStorage.
export default class Skills {

    static TRACKS = {
        mining: { name: "Mining", perk: "Bonus ore drops" },
        combat: { name: "Combat", perk: "+1 damage every 4 levels" },
        gathering: { name: "Gathering", perk: "Better apple drops" },
        building: { name: "Building", perk: "+1 reach every 5 levels" },
    };

    // XP needed to go from `level` to `level + 1`
    static xpFor(level) {
        return (level + 1) * 25;
    }

    // Block IDs that count as ores (shared with trials)
    static ORES = [14, 15, 16, 56, 73, 21, 129, 155, 201, 231, 232, 233, 234, 235, 236, 237, 238];

    constructor(rayancraft) {
        this.rayancraft = rayancraft;
        this.data = this.load();
    }

    load() {
        try {
            const raw = localStorage.getItem("rc_skills");
            if (raw) {
                const s = JSON.parse(raw);
                if (s && typeof s === "object") return s;
            }
        } catch (e) { }
        return {};
    }

    save() {
        try {
            localStorage.setItem("rc_skills", JSON.stringify(this.data));
        } catch (e) { }
    }

    level(track) {
        const d = this.data[track];
        return d ? (d.level || 0) : 0;
    }

    xpOf(track) {
        const d = this.data[track];
        return d ? (d.xp || 0) : 0;
    }

    xp(track, amount) {
        if (!Skills.TRACKS[track] || !(amount > 0)) return;
        let d = this.data[track];
        if (!d) d = this.data[track] = { xp: 0, level: 0 };
        d.xp += amount;
        let leveled = false;
        while (d.xp >= Skills.xpFor(d.level)) {
            d.xp -= Skills.xpFor(d.level);
            d.level++;
            leveled = true;
        }
        this.save();
        if (leveled) {
            try {
                this.rayancraft.addMessageToChat("§a" + Skills.TRACKS[track].name + " level " + d.level + "! (" + Skills.TRACKS[track].perk + ")");
            } catch (e) { }
        }
    }
}
