import Command from "../Command.js";
import Skills from "../../progression/Skills.js";

export default class SkillsCommand extends Command {

    constructor() {
        super("skills", "", "Show your skill levels");
    }

    execute(rayancraft, args) {
        try {
            if (!rayancraft.skills) {
                rayancraft.addMessageToChat("No skills yet.");
                return true;
            }
            rayancraft.addMessageToChat("--- Skills ---");
            for (const track of Object.keys(Skills.TRACKS)) {
                const t = Skills.TRACKS[track];
                const lvl = rayancraft.skills.level(track);
                const xp = Math.floor(rayancraft.skills.xpOf(track));
                rayancraft.addMessageToChat(t.name + " Lv" + lvl + " (" + xp + "/" + Skills.xpFor(lvl) + " XP) — " + t.perk);
            }
        } catch (e) {
            rayancraft.addMessageToChat("Could not read skills.");
        }
        return true;
    }

}
