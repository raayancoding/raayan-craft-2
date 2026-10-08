import Command from "../Command.js";

const ENCHANTS = {
    sharpness: "Melee +damage",
    protection: "Take -damage",
    fortune: "Bonus ore drops",
    efficiency: "Bonus ore XP"
};

export default class EnchantCommand extends Command {
    constructor() { super("enchant", "<sharpness|protection|fortune|efficiency> [level]", "Enchant yourself with XP levels"); }
    execute(rayancraft, args) {
        const p = rayancraft.player;
        if (!p || args.length < 1) return false;
        const name = args[0].toLowerCase();
        if (!(name in ENCHANTS)) {
            rayancraft.addMessageToChat("Enchants: sharpness, protection, fortune, efficiency");
            return true;
        }
        const lvl = Math.max(1, Math.min(5, parseInt(args[1]) || 1));
        const cost = 8 * lvl;
        if ((p.experience || 0) < cost) {
            rayancraft.addMessageToChat("§cNeed " + cost + " XP (you have " + Math.floor(p.experience || 0) + "). Mine ores!");
            return true;
        }
        p.experience -= cost;
        p.enchants[name] = Math.max(p.enchants[name] || 0, lvl);
        rayancraft.addMessageToChat("§dEnchanted: " + name + " " + lvl + " (" + ENCHANTS[name] + ")");
        return true;
    }
}
