import GuiScreen from "../GuiScreen.js";
import GuiButton from "../widgets/GuiButton.js";

export default class GuiGameOver extends GuiScreen {

    constructor(cause = "generic") {
        super();
        this.cause = cause;
    }

    init() {
        super.init();
        try { if (this.rayancraft.stats) this.rayancraft.stats.event("deaths"); } catch (e) { }
        this.hardcore = !!(this.rayancraft.world && this.rayancraft.world.hardcore);
        if (this.hardcore) {
            this.buttonList.push(new GuiButton("Delete World", this.width / 2 - 100, this.height / 2, 200, 20, () => {
                this.rayancraft.loadWorld(null);
            }));
        } else {
            this.buttonList.push(new GuiButton("Respawn", this.width / 2 - 100, this.height / 2, 200, 20, () => {
                this.rayancraft.player.respawn();
                this.rayancraft.displayScreen(null);
            }));
        }
        this.buttonList.push(new GuiButton("Back to Title", this.width / 2 - 100, this.height / 2 + 24, 200, 20, () => {
            this.rayancraft.loadWorld(null);
        }));
    }

    drawScreen(stack, mouseX, mouseY, partialTicks) {
        this.drawDefaultBackground(stack);
        const messages = {
            fall: "You hit the ground too hard!",
            drown: "You drowned!",
            lava: "You tried to swim in lava!",
            starve: "You starved to death!",
            generic: "You died!"
        };
        this.drawCenteredString(stack, this.hardcore ? "Hardcore! World lost!" : "You died!", this.width / 2, this.height / 2 - 40, 0xFF5555);
        this.drawCenteredString(stack, messages[this.cause] || messages.generic, this.width / 2, this.height / 2 - 20, 0xFFFFFF);
        this.drawCenteredString(stack, "Score: " + (this.rayancraft.player.experience || 0), this.width / 2, this.height / 2 - 8, 0xFFFF55);
        super.drawScreen(stack, mouseX, mouseY, partialTicks);
    }

    keyTyped() { }
}
