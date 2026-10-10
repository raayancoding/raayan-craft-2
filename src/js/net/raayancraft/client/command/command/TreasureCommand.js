import Command from "../Command.js";

export default class TreasureCommand extends Command {

    constructor() {
        super("treasure", "", "Get a clue to buried treasure");
    }

    execute(rayancraft, args) {
        try {
            if (!rayancraft.treasure || !rayancraft.player || !rayancraft.world) {
                rayancraft.addMessageToChat("Treasure unavailable.");
                return true;
            }
            rayancraft.treasure.clue();
        } catch (e) {
            rayancraft.addMessageToChat("No maps today.");
        }
        return true;
    }

}
