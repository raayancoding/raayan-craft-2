import Command from "../Command.js";

export default class TeleportCommand extends Command {

    constructor() {
        super("tp", "<x> <y> <z>", "Teleport to a position")
    }

    execute(rayancraft, args) {
        if (args.length !== 3) {
            return false;
        }

        let x = parseInt(args[0]);
        let y = parseInt(args[1]);
        let z = parseInt(args[2]);

        if (isNaN(x) || isNaN(y) || isNaN(z)) {
            return false;
        }

        rayancraft.player.setPosition(x, y, z);
        rayancraft.addMessageToChat("Teleported to " + x + " " + y + " " + z);

        return true;
    }

}