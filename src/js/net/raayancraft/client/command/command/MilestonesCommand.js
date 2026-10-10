import Command from "../Command.js";

export default class MilestonesCommand extends Command {

    constructor() {
        super("milestones", "", "Show your adaptive milestone path");
    }

    execute(rayancraft, args) {
        try {
            if (!rayancraft.milestones) {
                rayancraft.addMessageToChat("No milestones yet.");
                return true;
            }
            const s = rayancraft.milestones.status();
            rayancraft.addMessageToChat("Path of the " + s.arch + ": " + s.def.title + " — " + s.def.desc + " (" + Math.min(s.progress, s.target) + "/" + s.target + ")");
            rayancraft.addMessageToChat("Mastery: " + s.mastery.title + " — " + s.mastery.desc + " (" + s.masteryProgress + "/" + s.mastery.target + ")");
            rayancraft.addMessageToChat("Gate: " + s.gate + "/200" + (s.buff ? " (BUFF ACTIVE)" : "") + " | Combos: " + (s.combos.join(", ") || "none"));
            if (s.mods.length > 0) rayancraft.addMessageToChat("Modifiers: " + s.mods.join(", "));
        } catch (e) {
            rayancraft.addMessageToChat("Could not read milestones.");
        }
        return true;
    }

}
