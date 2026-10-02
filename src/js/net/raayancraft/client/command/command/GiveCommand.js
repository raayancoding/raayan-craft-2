import Command from "../Command.js";
import Block from "../../world/block/Block.js";

export default class GiveCommand extends Command {

    constructor() {
        super("give", "<blockId|name> [count]", "Give yourself blocks")
    }

    execute(rayancraft, args) {
        if (args.length < 1 || !rayancraft.player) return false;
        let id = parseInt(args[0]);
        if (isNaN(id)) {
            // name lookup
            const name = args[0].toLowerCase();
            const map = { stone: 1, grass: 2, dirt: 3, cobble: 4, planks: 5, wood: 5, bedrock: 7, water: 9, lava: 11, sand: 12, gravel: 13, gold_ore: 14, iron_ore: 15, coal_ore: 16, log: 17, leaves: 18, glass: 20, lapis: 21, sandstone: 24, wool: 35, flower: 38, torch: 50, diamond: 56, crafting: 58, furnace: 61, redstone: 73, snow: 80, cactus: 81, pumpkin: 86, glowstone: 89, obsidian: 49, brick: 45, chest: 54, melon: 103, copper_ore: 201, copper: 202, deepslate: 203, amethyst: 204, cherry_log: 205, cherry_leaves: 206, cherry: 206 };
            if (!(name in map)) return false;
            id = map[name];
        }
        if (!Block.getById(id)) {
            rayancraft.addMessageToChat("Unknown block id " + id);
            return true;
        }
        rayancraft.player.inventory.addItem(id);
        rayancraft.player.inventory.setItemInSelectedSlot(id);
        rayancraft.addMessageToChat("Given block " + id);
        return true;
    }
}
