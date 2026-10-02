import Container from "../Container.js";
import Slot from "../Slot.js";
import InventoryBasic from "../inventory/InventoryBasic.js";
import CraftingManager from "../CraftingManager.js";

export default class ContainerSurvival extends Container {

    constructor(player) {
        super();
        this.player = player;
        this.crafting = new InventoryBasic();
        this.result = new InventoryBasic();
        for (let i = 0; i < 4; i++) this.crafting.setItem(i, 0);
        this.result.setItem(0, 0);

        // 2x2 crafting grid
        this.addSlot(new Slot(this.crafting, 0, 98, 18));
        this.addSlot(new Slot(this.crafting, 1, 116, 18));
        this.addSlot(new Slot(this.crafting, 2, 98, 36));
        this.addSlot(new Slot(this.crafting, 3, 116, 36));
        // result
        this.resultSlot = new Slot(this.result, 0, 152, 27);
        this.addSlot(this.resultSlot);

        // player hotbar (9) + main (27 simulated in same inventory indices 9..35)
        for (let x = 0; x < 9; x++) this.addSlot(new Slot(player.inventory, x, 9 + x * 18, 112));
        for (let y = 0; y < 3; y++) for (let x = 0; x < 9; x++) {
            const idx = 9 + y * 9 + x;
            if (player.inventory.getItemInSlot(idx) === undefined) player.inventory.setItem(idx, 0);
            this.addSlot(new Slot(player.inventory, idx, 9 + x * 18, 58 + y * 18));
        }
    }

    updateCrafting() {
        const inputs = [0, 1, 2, 3].map(i => this.crafting.getItemInSlot(i) || 0);
        const match = CraftingManager.findMatch(inputs);
        if (match) this.result.setItem(0, match.outputs[0].id);
        else this.result.setItem(0, 0);
        this.dirty = true;
    }

    onSlotClick(slot, player) {
        if (slot.inventory === this.result) {
            const out = this.result.getItemInSlot(0);
            if (out) {
                // consume one from each input
                for (let i = 0; i < 4; i++) this.crafting.setItem(i, 0);
                this.result.setItem(0, 0);
                player.inventory.itemInCursor = out;
                this.rayancraftRef = null;
            }
            this.dirty = true;
            return;
        }
        super.onSlotClick(slot, player);
        this.updateCrafting();
    }
}
