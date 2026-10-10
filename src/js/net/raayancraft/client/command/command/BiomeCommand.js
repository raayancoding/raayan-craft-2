import Command from "../Command.js";
import Exploration from "../../progression/Exploration.js";

export default class BiomeCommand extends Command {

    constructor() {
        super("biome", "", "Show your current biome and discovery progress");
    }

    execute(rayancraft, args) {
        if (!rayancraft.player || !rayancraft.world) return false;
        try {
            const cp = rayancraft.world.getChunkProvider ? rayancraft.world.getChunkProvider() : null;
            const g = cp && cp.generator;
            if (!g || typeof g.getBiomeAt !== "function") {
                rayancraft.addMessageToChat("Biome data unavailable here.");
                return true;
            }
            const id = g.getBiomeAt(Math.floor(rayancraft.player.x), Math.floor(rayancraft.player.z));
            const name = Exploration.NAMES[id] || id;
            let progress = "";
            try {
                const n = rayancraft.exploration ? rayancraft.exploration.visited.size : 0;
                progress = " (" + n + "/" + Exploration.TOTAL + " discovered)";
            } catch (e) { }
            rayancraft.addMessageToChat("Biome: " + name + progress);
        } catch (e) {
            rayancraft.addMessageToChat("Could not read biome.");
        }
        return true;
    }

}
