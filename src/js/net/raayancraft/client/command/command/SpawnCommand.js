import Command from "../Command.js";

export default class SpawnCommand extends Command {

    constructor() {
        super("spawn", "", "Teleport to the world spawn");
    }

    execute(rayancraft, args) {
        if (!rayancraft.player || !rayancraft.world) return false;
        try {
            const s = rayancraft.world.spawn;
            let y = s.y;
            try {
                y = Math.max(y, rayancraft.world.getHeightAt(Math.floor(s.x), Math.floor(s.z)) + 1);
            } catch (e) { }
            rayancraft.player.setPosition(s.x + 0.5, y, s.z + 0.5);
            rayancraft.addMessageToChat("Teleported to spawn.");
        } catch (e) {
            rayancraft.addMessageToChat("Could not reach spawn.");
        }
        return true;
    }

}
