import Command from "../Command.js";

export default class TitleCommand extends Command {

    constructor() {
        super("title", "[name]", "Show or wear an unlocked title");
    }

    execute(rayancraft, args) {
        try {
            if (!rayancraft.titles) {
                rayancraft.addMessageToChat("Titles unavailable.");
                return true;
            }
            if (args.length === 0) {
                const list = rayancraft.titles.unlocked().map((d) => d.id + (d.id === rayancraft.titles.active ? "*" : "")).join(", ");
                rayancraft.addMessageToChat("Unlocked titles: " + (list || "novice"));
                rayancraft.addMessageToChat("Use /title <name> to wear one.");
                return true;
            }
            rayancraft.titles.set(args[0]);
        } catch (e) {
            rayancraft.addMessageToChat("Titles unavailable.");
        }
        return true;
    }

}
