import Command from "../Command.js";

export default class TutorialCommand extends Command {

    constructor() {
        super("tutorial", "[replay|skip]", "Replay or skip the tutorial");
    }

    execute(rayancraft, args) {
        try {
            if (!rayancraft.tutorial) {
                rayancraft.addMessageToChat("No tutorial available.");
                return true;
            }
            const sub = (args[0] || "").toLowerCase();
            if (sub === "skip") {
                rayancraft.tutorial.state.done = true;
                rayancraft.tutorial.save();
                rayancraft.addMessageToChat("Tutorial skipped.");
            } else {
                rayancraft.tutorial.state = { stage: 0, done: false, returning: false };
                rayancraft.tutorial.save();
                rayancraft.addMessageToChat("Tutorial restarted! Walk around to begin.");
            }
        } catch (e) {
            rayancraft.addMessageToChat("Tutorial unavailable.");
        }
        return true;
    }

}
