import GuiContainer from "../GuiContainer.js";
import ContainerSurvival from "../../../inventory/container/ContainerSurvival.js";

export default class GuiContainerSurvival extends GuiContainer {

    constructor(player) {
        super(new ContainerSurvival(player));
        this.inventoryWidth = 195;
        this.inventoryHeight = 150;
    }

    init() {
        this.textureInventory = this.getTexture("gui/container/creative.png");
        super.init();
        if (this.container.updateCrafting) this.container.updateCrafting();
    }

    drawTitle(stack) {
        this.drawString(stack, "Survival Inventory  (2x2 Crafting)", this.x + 8, this.y + 6, 0xff404040, false);
    }

    drawInventoryBackground(stack) {
        this.drawRect(stack, this.x, this.y, this.x + this.inventoryWidth, this.y + this.inventoryHeight, "#c6c6c6");
        this.drawRect(stack, this.x + 97, this.y + 17, this.x + 97 + 36, this.y + 17 + 36, "#8b8b8b");
        this.drawRect(stack, this.x + 150, this.y + 25, this.x + 150 + 20, this.y + 25 + 20, "#8b8b8b");
        // arrow
        this.drawString(stack, ">", this.x + 140, this.y + 30, 0xff404040, false);
    }

    drawScreen(stack, mouseX, mouseY, partialTicks) {
        if (!this.container) {
            this.drawDefaultBackground(stack);
            this.drawCenteredString(stack, "Loading survival inventory...", this.width / 2, this.height / 2);
            super.drawScreen(stack, mouseX, mouseY, partialTicks);
            return;
        }
        super.drawScreen(stack, mouseX, mouseY, partialTicks);
    }

    keyTyped(key, character) {
        if (key === this.rayancraft.settings.keyOpenInventory) {
            this.rayancraft.displayScreen(null);
            return true;
        }
        return super.keyTyped(key, character);
    }
}
