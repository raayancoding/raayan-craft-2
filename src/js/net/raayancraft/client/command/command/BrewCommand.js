import Command from "../Command.js";

const POTIONS = {
    heal: { cost: 5, desc: "Instant +6 HP" },
    strength: { cost: 10, ticks: 3600, desc: "+2 melee damage" },
    swiftness: { cost: 10, ticks: 3600, desc: "Run faster" },
    regeneration: { cost: 12, ticks: 2400, desc: "Heal over time" },
    fireshield: { cost: 12, ticks: 3600, desc: "Lava immunity" }
};

export default class BrewCommand extends Command {
    constructor() { super("brew", "<heal|strength|swiftness|regeneration|fireshield>", "Brew a potion with XP"); }
    execute(rayancraft, args) {
        const p = rayancraft.player;
        if (!p || args.length < 1) return false;
        const name = args[0].toLowerCase();
        if (!(name in POTIONS)) {
            rayancraft.addMessageToChat("Potions: heal, strength, swiftness, regeneration, fireshield");
            return true;
        }
        const rec = POTIONS[name];
        if ((p.experience || 0) < rec.cost) {
            rayancraft.addMessageToChat("§cNeed " + rec.cost + " XP (you have " + Math.floor(p.experience || 0) + ").");
            return true;
        }
        p.experience -= rec.cost;
        if (name === "heal") p.heal(6);
        else p.effects[name] = Math.max(p.effects[name] || 0, rec.ticks);
        rayancraft.addMessageToChat("§dBrewed " + name + " (" + rec.desc + ")");
        return true;
    }
}
