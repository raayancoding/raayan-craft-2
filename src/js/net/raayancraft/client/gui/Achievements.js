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
