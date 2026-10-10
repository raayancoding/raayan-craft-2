// Toggleable world modifiers (single-player rules). Persisted, listed and
// flipped via /modifier. Read at the hooks they affect (addXP, fall damage).
export default class Modifiers {

    static DEFS = {
        doublexp: "Double all XP gains",
        nofall: "No fall damage",
    };

    constructor(rayancraft) {
        this.rayancraft = rayancraft;
        this.set = new Set();
        try {
            const raw = localStorage.getItem("rc_modifiers");
            if (raw) {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr)) {
                    for (const m of arr) if (m in Modifiers.DEFS) this.set.add(m);
                }
            }
        } catch (e) { }
    }

    save() {
        try {
            localStorage.setItem("rc_modifiers", JSON.stringify([...this.set]));
        } catch (e) { }
    }

    has(name) {
        return this.set.has(name);
    }

    toggle(name) {
        name = (name || "").toLowerCase();
        if (!(name in Modifiers.DEFS)) return false;
        if (this.set.has(name)) {
            this.set.delete(name);
            try { this.rayancraft.addMessageToChat("Modifier OFF: " + name); } catch (e) { }
        } else {
            this.set.add(name);
            try { this.rayancraft.addMessageToChat("Modifier ON: " + name + " — " + Modifiers.DEFS[name]); } catch (e) { }
        }
        this.save();
        return true;
    }
}
