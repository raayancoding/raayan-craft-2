// Buried treasure hunts: /treasure reveals a clue to a nearby cache; stand
// on the spot to dig it up (distance check each tick). Target persists
// across sessions; 5-minute cooldown between hunts to prevent farming.
export default class Treasure {

    static COOLDOWN_MS = 5 * 60 * 1000;
    static REWARD_XP = 40;

    constructor(rayancraft) {
        this.rayancraft = rayancraft;
        this.state = this.load();
    }

    load() {
        try {
            const raw = localStorage.getItem("rc_treasure");
            if (raw) {
                const s = JSON.parse(raw);
                if (s && typeof s.x === "number" && typeof s.z === "number") {
                    return { x: s.x, z: s.z, found: !!s.found, last: s.last || 0 };
                }
            }
        } catch (e) { }
        return { x: 0, z: 0, found: true, last: 0 };
    }

    save() {
        try {
            localStorage.setItem("rc_treasure", JSON.stringify(this.state));
        } catch (e) { }
    }

    say(msg) {
        try { this.rayancraft.addMessageToChat(msg); } catch (e) { }
    }

    clue() {
        const mc = this.rayancraft;
        const p = mc.player;
        if (!p || !mc.world) return;
        if (!this.state.found) {
            const dx = Math.round(this.state.x - p.x), dz = Math.round(this.state.z - p.z);
            const dist = Math.round(Math.sqrt(dx * dx + dz * dz));
            const ew = dx > 0 ? "east" : "west";
            const ns = dz > 0 ? "south" : "north";
            this.say("Treasure lies ~" + dist + "m " + ns + "-" + ew + ". Stand on the spot to dig it up!");
            return;
        }
        const wait = Treasure.COOLDOWN_MS - (Date.now() - this.state.last);
        if (wait > 0) {
            this.say("No new maps yet. Try again in " + Math.ceil(wait / 60000) + " min.");
            return;
        }
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 90;
        this.state = {
            x: Math.round(p.x + Math.cos(angle) * dist),
            z: Math.round(p.z + Math.sin(angle) * dist),
            found: false,
            last: Date.now(),
        };
        this.save();
        this.clue();
    }

    tick() {
        if (this.state.found) return;
        const mc = this.rayancraft;
        const p = mc.player;
        if (!p || p.isDead || !mc.isInGame() || !mc.world) return;
        const dx = p.x - this.state.x, dz = p.z - this.state.z;
        if (dx * dx + dz * dz > 16) return;
        let y = 70;
        try { y = mc.world.getHeightAt(this.state.x, this.state.z); } catch (e) { }
        if (Math.abs(p.y - y) > 6) return;
        // Found it!
        this.state.found = true;
        this.state.last = Date.now();
        this.save();
        try {
            p.inventory.addItem(56);
            p.inventory.addItem(56);
            p.inventory.addItem(14);
            p.inventory.addItem(129);
            if (mc.addXP) mc.addXP(Treasure.REWARD_XP);
        } catch (e) { }
        this.say("TREASURE FOUND! Diamonds, gold and emerald, +" + Treasure.REWARD_XP + " XP!");
        try { mc.achievements.unlock("treasure"); } catch (e) { }
    }
}
