import Command from "../Command.js";

export default class HomeCommand extends Command {

    constructor() {
        super("home", "", "Teleport to your saved home");
    }

    execute(rayancraft, args) {
        if (!rayancraft.player) return false;
        try {
            const raw = localStorage.getItem("rc_home");
            if (!raw) {
                rayancraft.addMessageToChat("No home set! Use /sethome first.");
                return true;
            }
            const h = JSON.parse(raw);
            if (typeof h.x !== "number" || typeof h.z !== "number") throw new Error("bad home");
            rayancraft.player.setPosition(h.x, (typeof h.y === "number" ? h.y : 70) + 0.5, h.z);
            rayancraft.addMessageToChat("Welcome home!");
        } catch (e) {
            rayancraft.addMessageToChat("Home is corrupted. Use /sethome to set a new one.");
        }
        return true;
    }

}
