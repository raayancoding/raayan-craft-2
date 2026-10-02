import Command from "../Command.js";

export default class GamemodeCommand extends Command {

    constructor() {
        super("gamemode", "<0|1|survival|creative>", "Change gamemode")
    }

    execute(rayancraft, args) {
        if (args.length !== 1 || !rayancraft.player) return false;
        const v = args[0].toLowerCase();
        if (v === "0" || v === "survival" || v === "s") {
            rayancraft.player.gameMode = 0;
            rayancraft.player.flying = false;
            rayancraft.addMessageToChat("Gamemode set to Survival");
        } else if (v === "1" || v === "creative" || v === "c") {
            rayancraft.player.gameMode = 1;
            rayancraft.addMessageToChat("Gamemode set to Creative");
        } else return false;
        return true;
    }
}
