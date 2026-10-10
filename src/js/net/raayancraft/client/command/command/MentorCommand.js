import Command from "../Command.js";

export default class MentorCommand extends Command {

    constructor() {
        super("mentor", "", "Hear your mentor's current lesson");
    }

    execute(rayancraft, args) {
        try {
            if (!rayancraft.mentor) {
                rayancraft.addMessageToChat("No mentor yet.");
                return true;
            }
            const c = rayancraft.mentor.current();
            if (!c) {
                rayancraft.addMessageToChat(rayancraft.mentor.wisdom());
                return true;
            }
            const st = rayancraft.mentor.state;
            rayancraft.addMessageToChat("Mentor lesson: " + c.title + " — " + c.text + " (" + Math.min(st.progress, c.target) + "/" + c.target + ")");
        } catch (e) {
            rayancraft.addMessageToChat("Could not reach mentor.");
        }
        return true;
    }

}
