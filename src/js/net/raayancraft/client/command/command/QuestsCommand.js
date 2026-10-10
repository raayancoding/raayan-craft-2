import Command from "../Command.js";

export default class QuestsCommand extends Command {

    constructor() {
        super("quests", "", "Show your active quest");
    }

    execute(rayancraft, args) {
        try {
            if (!rayancraft.quests) {
                rayancraft.addMessageToChat("No quests yet.");
                return true;
            }
            const q = rayancraft.quests.current();
            if (!q) {
                rayancraft.addMessageToChat("All quests complete! You are legend.");
                return true;
            }
            const st = rayancraft.quests.state;
            rayancraft.addMessageToChat("Quest: " + q.title + " — " + q.desc + " (" + Math.min(st.progress, q.target) + "/" + q.target + ")");
        } catch (e) {
            rayancraft.addMessageToChat("Could not read quests.");
        }
        return true;
    }

}
