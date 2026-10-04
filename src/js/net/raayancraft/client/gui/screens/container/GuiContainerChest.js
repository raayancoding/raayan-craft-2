import GuiContainer from "../GuiContainer.js";
import ContainerChest from "../../../inventory/container/ContainerChest.js";

export default class GuiContainerChest extends GuiContainer {

    constructor(player, cx, cy, cz) {
        super(new ContainerChest(player.rayancraft || player.world.rayancraft, player, cx, cy, cz));
        this.inventoryWidth = 195;
        this.inventoryHeight = 150;
    }

    init() {
        this.textureInventory = this.getTexture("gui/container/creative.png");
        super.init();
    }

    drawTitle(stack) {
        this.drawString(stack, "Chest", this.x + 8, this.y + 6, 0xff404040, false);
    }

    drawInventoryBackground(stack) {
        this.drawRect(stack, this.x, this.y, this.x + this.inventoryWidth, this.y + this.inventoryHeight, "#c6c6c6");
    }

    keyTyped(key, character) {
        if (key === this.rayancraft.settings.keyOpenInventory) {
            this.rayancraft.displayScreen(null);
            return true;
        }
        return super.keyTyped(key, character);
    }
}
