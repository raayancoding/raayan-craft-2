import Command from "../Command.js";

export default class SeedCommand extends Command {
    constructor() { super("seed", "", "Show world seed"); }
    execute(rayancraft) {
        try {
            rayancraft.addMessageToChat("Seed: " + rayancraft.world.getChunkProvider().generator.getSeed().toString());
        } catch (e) { rayancraft.addMessageToChat("Seed: unknown"); }
        return true;
    }
}
