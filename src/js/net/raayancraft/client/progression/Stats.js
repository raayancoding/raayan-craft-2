// Lifetime statistics: cheap counters at central hooks + distance tracking.
// Viewed with /stats. Persisted in localStorage.
export default class Stats {

    constructor(rayancraft) {
        this.rayancraft = rayancraft;
        this.s = this.load();
        this.lastX = null;
        this.lastZ = null;
    }

    load() {
        const fresh = { broken: 0, placed: 0, kills: 0, deaths: 0, walked: 0 };
        try {
            const raw = localStorage.getItem("rc_stats");
            if (raw) {
                const s = JSON.parse(raw);
                if (s && typeof s === "object") return Object.assign(fresh, s);
            }
        } catch (e) { }
        return fresh;
    }

    save() {
        try {
            localStorage.setItem("rc_stats", JSON.stringify(this.s));
        } catch (e) { }
    }

    event(type) {
        if (!(type in this.s)) return;
        this.s[type]++;
        this.save();
    }

    tick() {
        const mc = this.rayancraft;
        const p = mc.player;
        if (!p || p.isDead || !mc.isInGame()) return;
        if (this.lastX !== null) {
            const dx = p.x - this.lastX, dz = p.z - this.lastZ;
            const d = Math.sqrt(dx * dx + dz * dz);
            if (d > 0 && d < 50) {
                this.s.walked += d;
            }
        }
        this.lastX = p.x;
        this.lastZ = p.z;
    }
}
