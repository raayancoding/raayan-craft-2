import Command from "../Command.js";

export default class StatsCommand extends Command {

    constructor() {
        super("stats", "", "Show your lifetime statistics");
    }

    execute(rayancraft, args) {
        try {
            const s = rayancraft.stats ? rayancraft.stats.s : null;
            if (!s) {
                rayancraft.addMessageToChat("No statistics yet.");
                return true;
            }
            rayancraft.addMessageToChat("--- Your statistics ---");
            rayancraft.addMessageToChat("Blocks broken: " + s.broken + " | placed: " + s.placed);
            rayancraft.addMessageToChat("Mobs slain: " + s.kills + " | deaths: " + s.deaths);
            rayancraft.addMessageToChat("Distance walked: " + Math.floor(s.walked) + "m");
        } catch (e) {
            rayancraft.addMessageToChat("Could not read statistics.");
        }
        return true;
    }

}
