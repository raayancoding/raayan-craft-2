import Command from "../Command.js";

export default class TrialCommand extends Command {

    constructor() {
        super("trial", "", "Start or check a timed mastery trial");
    }

    execute(rayancraft, args) {
        try {
            if (!rayancraft.trial || !rayancraft.player) {
                rayancraft.addMessageToChat("Trials unavailable.");
                return true;
            }
            rayancraft.trial.start();
        } catch (e) {
            rayancraft.addMessageToChat("Trials unavailable.");
        }
        return true;
    }

}
