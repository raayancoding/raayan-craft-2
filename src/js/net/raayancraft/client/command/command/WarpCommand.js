import Command from "../Command.js";

export default class WarpCommand extends Command {

    constructor() {
        super("warp", "<x> <z>", "Teleport to surface at coordinates");
    }

    execute(rayancraft, args) {
        if (args.length !== 2 || !rayancraft.player || !rayancraft.world) {
            return false;
        }
        const x = parseInt(args[0]);
        const z = parseInt(args[1]);
        if (isNaN(x) || isNaN(z) || Math.abs(x) > 100000 || Math.abs(z) > 100000) {
            return false;
        }
        try {
            let y = 70;
            try {
                y = rayancraft.world.getHeightAt(x, z) + 1;
            } catch (e) { }
            if (!(y > 1)) y = 70;
            rayancraft.player.setPosition(x + 0.5, y, z + 0.5);
            rayancraft.addMessageToChat("Warped to " + x + " " + z);
        } catch (e) {
            rayancraft.addMessageToChat("Warp failed.");
        }
        return true;
    }

}
