import Command from "../Command.js";

// Villager trading, simplified: 1 emerald ore -> 1 diamond, at a nearby villager.
export default class TradeCommand extends Command {
    constructor() { super("trade", "", "Trade 1 emerald ore for 1 diamond (stand near a villager)"); }
    execute(rayancraft, args) {
        const p = rayancraft.player;
        if (!p || !rayancraft.world) return false;
        let near = false;
        try {
            for (const e of rayancraft.world.entities) {
                if (e.constructor.name === "EntityVillager" && !e.isDead &&
                    Math.hypot(e.x - p.x, e.z - p.z) < 6) { near = true; break; }
            }
        } catch (e) { }
        if (!near) {
            rayancraft.addMessageToChat("§cNo villager nearby! Find one (plains, day) or /summon villager... wait, villagers don't teleport. Go explore!");
            return true;
        }
        // Find emerald ore (129) in inventory
        const inv = p.inventory;
        let slot = -1;
        for (let i = 0; i < 40; i++) {
            if (inv.getItemInSlot(i) === 129) { slot = i; break; }
        }
        if (slot < 0) {
            rayancraft.addMessageToChat("§cVillager wants 1 emerald ore (mine it in Mountains).");
            return true;
        }
        inv.setItem(slot, 0);
        inv.addItem(56);
        inv.setItemInSelectedSlot(56);
        rayancraft.addMessageToChat("§aTrade complete! <Villager> Hrmm, pleasure!");
        return true;
    }
}
