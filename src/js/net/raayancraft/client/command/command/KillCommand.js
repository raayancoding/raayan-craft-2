import Command from "../Command.js";

export default class KillCommand extends Command {
    constructor() { super("kill", "", "Kill yourself"); }
    execute(rayancraft) {
        if (!rayancraft.player) return false;
        rayancraft.player.damage(1000, "generic");
        return true;
    }
}
