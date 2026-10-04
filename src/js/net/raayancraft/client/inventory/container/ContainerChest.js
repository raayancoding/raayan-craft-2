import Container from "../Container.js";
import Slot from "../Slot.js";
import InventoryBasic from "../inventory/InventoryBasic.js";

export default class ContainerChest extends Container {

    constructor(rayancraft, player, cx, cy, cz) {
        super();
        this.key = cx + "," + cy + "," + cz;
        // Load or create 27-slot chest storage
        if (!rayancraft.chestData[this.key]) {
            rayancraft.chestData[this.key] = new Array(27).fill(0);
        }
        this.store = rayancraft.chestData[this.key];
        this.chestInv = new InventoryBasic();
        for (let i = 0; i < 27; i++) this.chestInv.setItem(i, this.store[i] || 0);

        // Chest rows
        for (let y = 0; y < 3; y++) for (let x = 0; x < 9; x++) {
            this.addSlot(new Slot(this.chestInv, y * 9 + x, 9 + x * 18, 18 + y * 18));
        }
        // Player hotbar + main
        for (let x = 0; x < 9; x++) this.addSlot(new Slot(player.inventory, x, 9 + x * 18, 112));
        for (let y = 0; y < 3; y++) for (let x = 0; x < 9; x++) {
            const idx = 9 + y * 9 + x;
            if (player.inventory.getItemInSlot(idx) === undefined) player.inventory.setItem(idx, 0);
            this.addSlot(new Slot(player.inventory, idx, 9 + x * 18, 58 + y * 18));
        }
    }

    onSlotClick(slot, player) {
        super.onSlotClick(slot, player);
        // Persist chest rows back to storage
        for (let i = 0; i < 27; i++) this.store[i] = this.chestInv.getItemInSlot(i) || 0;
        this.dirty = true;
    }
}
