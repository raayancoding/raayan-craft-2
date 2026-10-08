import Command from "../Command.js";
import World from "../../world/World.js";
import ChunkProviderNether from "../../world/provider/ChunkProviderNether.js";
import PlayerController from "../../network/controller/PlayerController.js";

// Dimension travel (encyclopedia: Nether). Preserves inventory/health/gamemode.
export default class NetherCommand extends Command {
    constructor() { super("nether", "", "Travel between Overworld and Nether"); }
    execute(rayancraft, args) {
        if (!rayancraft.player) return false;
        const inNether = rayancraft.world.getChunkProvider().generator &&
            rayancraft.world.getChunkProvider().generator.constructor.name === "NetherGenerator";
        // Snapshot player state
        const snap = {
            items: [...rayancraft.player.inventory.items],
            sel: rayancraft.player.inventory.selectedSlotIndex,
            health: rayancraft.player.health, hunger: rayancraft.player.hunger,
            gameMode: rayancraft.player.gameMode, xp: rayancraft.player.experience,
            lvl: rayancraft.player.experienceLevel,
            enchants: { ...rayancraft.player.enchants }, effects: { ...rayancraft.player.effects }
        };
        if (inNether) {
            // Return to saved overworld
            if (!rayancraft.savedOverworld) {
                rayancraft.addMessageToChat("§cNo overworld saved. Rejoin singleplayer.");
                return true;
            }
            const s = rayancraft.savedOverworld;
            rayancraft.playerController = new PlayerController(rayancraft);
            rayancraft.loadWorld(s.world);
            rayancraft.player.inventory.items = [...snap.items];
            rayancraft.player.inventory.selectedSlotIndex = snap.sel;
            Object.assign(rayancraft.player, { health: snap.health, hunger: snap.hunger, gameMode: snap.gameMode, experience: snap.xp, experienceLevel: snap.lvl });
            rayancraft.player.enchants = snap.enchants; rayancraft.player.effects = snap.effects;
            rayancraft.player.setPosition(s.x, s.y, s.z);
            rayancraft.addMessageToChat("§aBack in the Overworld.");
        } else {
            // Save overworld, enter nether
            rayancraft.savedOverworld = {
                world: rayancraft.world,
                x: rayancraft.player.x, y: rayancraft.player.y, z: rayancraft.player.z
            };
            if (!rayancraft.savedNether) {
                const w = new World(rayancraft);
                w.setChunkProvider(new ChunkProviderNether(w, Date.now()));
                w.getChunkProvider().findSpawn();
                rayancraft.savedNether = w;
            }
            rayancraft.playerController = new PlayerController(rayancraft);
            rayancraft.loadWorld(rayancraft.savedNether);
            rayancraft.player.inventory.items = [...snap.items];
            rayancraft.player.inventory.selectedSlotIndex = snap.sel;
            Object.assign(rayancraft.player, { health: snap.health, hunger: snap.hunger, gameMode: snap.gameMode, experience: snap.xp, experienceLevel: snap.lvl });
            rayancraft.player.enchants = snap.enchants; rayancraft.player.effects = snap.effects;
            rayancraft.player.setPosition(8.5, 72, 8.5);
            rayancraft.addMessageToChat("§cWelcome to the NETHER. Quartz, debris, glowstone await.");
        }
        return true;
    }
}
