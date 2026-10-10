import Command from "../Command.js";

export default class SethomeCommand extends Command {

    constructor() {
        super("sethome", "", "Save your home position");
    }

    execute(rayancraft, args) {
        if (!rayancraft.player) return false;
        try {
            localStorage.setItem("rc_home", JSON.stringify({
                x: rayancraft.player.x, y: rayancraft.player.y, z: rayancraft.player.z,
            }));
        } catch (e) {
            rayancraft.addMessageToChat("Could not save home (storage unavailable).");
            return true;
        }
        rayancraft.addMessageToChat("Home set! Use /home to return.");
        return true;
    }

}
