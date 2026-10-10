import Command from "../Command.js";

export default class RespecCommand extends Command {

    static COST_XP = 20;
    static COOLDOWN_MS = 60 * 60 * 1000;

    constructor() {
        super("respec", "[track|all]", "Reset a skill track (costs 20 XP, 1h cooldown)");
    }

    execute(rayancraft, args) {
        try {
            if (!rayancraft.skills || !rayancraft.player) {
                rayancraft.addMessageToChat("Skills unavailable.");
                return true;
            }
            const now = Date.now();
            let last = 0;
            try {
                last = parseInt(localStorage.getItem("rc_respec") || "0", 10) || 0;
            } catch (e) { }
            if (now - last < RespecCommand.COOLDOWN_MS) {
                rayancraft.addMessageToChat("Respec is meditating. Try again in " + Math.ceil((RespecCommand.COOLDOWN_MS - (now - last)) / 60000) + " min.");
                return true;
            }
            const track = (args[0] || "all").toLowerCase();
            const tracks = track === "all" ? ["mining", "combat", "gathering", "building"] : [track];
            for (const t of tracks) {
                if (!rayancraft.skills.data[t] || rayancraft.skills.data[t].level <= 0) {
                    rayancraft.addMessageToChat("Nothing to respec: " + t + " (unknown track or level 0).");
                    return true;
                }
            }
            if ((rayancraft.player.experience || 0) < RespecCommand.COST_XP) {
                rayancraft.addMessageToChat("Respec costs " + RespecCommand.COST_XP + " XP. You have " + Math.floor(rayancraft.player.experience || 0) + ".");
                return true;
            }
            rayancraft.player.experience -= RespecCommand.COST_XP;
            for (const t of tracks) rayancraft.skills.data[t] = { xp: 0, level: 0 };
            rayancraft.skills.save();
            try { localStorage.setItem("rc_respec", String(now)); } catch (e) { }
            rayancraft.addMessageToChat("Respec complete: " + tracks.join(", ") + " forgotten. -" + RespecCommand.COST_XP + " XP.");
        } catch (e) {
            rayancraft.addMessageToChat("Respec failed.");
        }
        return true;
    }

}
