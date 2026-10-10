import Command from "../Command.js";
import Modifiers from "../../progression/Modifiers.js";

export default class ModifierCommand extends Command {

    constructor() {
        super("modifier", "[name]", "List or toggle world modifiers");
    }

    execute(rayancraft, args) {
        try {
            if (!rayancraft.modifiers) {
                rayancraft.addMessageToChat("Modifiers unavailable.");
                return true;
            }
            if (args.length === 0) {
                rayancraft.addMessageToChat("--- World modifiers ---");
                for (const name of Object.keys(Modifiers.DEFS)) {
                    const on = rayancraft.modifiers.has(name) ? "ON" : "off";
                    rayancraft.addMessageToChat(name + " [" + on + "] — " + Modifiers.DEFS[name]);
                }
                return true;
            }
            if (!rayancraft.modifiers.toggle(args[0])) {
                rayancraft.addMessageToChat("Unknown modifier. Options: " + Object.keys(Modifiers.DEFS).join(", "));
            }
        } catch (e) {
            rayancraft.addMessageToChat("Modifiers unavailable.");
        }
        return true;
    }

}
