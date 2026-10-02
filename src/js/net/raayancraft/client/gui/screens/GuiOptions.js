import GuiScreen from "../GuiScreen.js";
import GuiButton from "../widgets/GuiButton.js";
import GuiSwitchButton from "../widgets/GuiSwitchButton.js";
import GuiSliderButton from "../widgets/GuiSliderButton.js";
import GuiControls from "./GuiControls.js";

export default class GuiOptions extends GuiScreen {

    constructor(previousScreen) {
        super();

        this.previousScreen = previousScreen;
    }

    init() {
        super.init();

        let settings = this.rayancraft.settings;

        let y = this.height / 2 - 90;
        this.graphicsButton = new GuiButton("Graphics: " + settings.graphicsQuality.toUpperCase(), this.width / 2 - 100, y, 200, 20, () => {
            const order = ["low", "high", "ultra"];
            settings.graphicsQuality = order[(order.indexOf(settings.graphicsQuality) + 1) % order.length];
            this.graphicsButton.string = "Graphics: " + settings.graphicsQuality.toUpperCase();
            this.rayancraft.worldRenderer.applyGraphicsPreset();
            settings.save();
        });
        this.buttonList.push(this.graphicsButton);
        this.buttonList.push(new GuiSwitchButton("Shadows", settings.shadowsEnabled, this.width / 2 - 100, y + 24, 200, 20, value => {
            settings.shadowsEnabled = value;
            this.rayancraft.worldRenderer.applyGraphicsPreset();
        }));
        this.buttonList.push(new GuiSwitchButton("Particles", settings.particlesEnabled, this.width / 2 - 100, y + 24 * 2, 200, 20, value => {
            settings.particlesEnabled = value;
        }));
        this.buttonList.push(new GuiSwitchButton("Ambient Occlusion", settings.ambientOcclusion, this.width / 2 - 100, y + 24 * 3, 200, 20, value => {
            settings.ambientOcclusion = value;
            this.rayancraft.worldRenderer.rebuildAll();
        }));
        this.buttonList.push(new GuiSwitchButton("View Bobbing", settings.viewBobbing, this.width / 2 - 100, y + 24 * 4, 200, 20, value => {
            settings.viewBobbing = value;
        }));
        this.buttonList.push(new GuiSliderButton("FOV", settings.fov, 50, 100, this.width / 2 - 100, y + 24 * 5, 200, 20, value => {
            settings.fov = value;
        }));
        this.buttonList.push(new GuiSliderButton("Render Distance", settings.viewDistance, 2, 16, this.width / 2 - 100, y + 24 * 6, 200, 20, value => {
            settings.viewDistance = value;
        }));
        this.buttonList.push(new GuiButton("Controls...", this.width / 2 - 100, y + 24 * 7, 200, 20, () => {
            this.rayancraft.displayScreen(new GuiControls(this));
        }));

        this.buttonList.push(new GuiButton("Done", this.width / 2 - 100, y + 24 * 7 + 30, 200, 20, () => {
            this.rayancraft.displayScreen(this.previousScreen);
        }));
    }

    drawScreen(stack, mouseX, mouseY, partialTicks) {
        // Background
        this.drawDefaultBackground(stack);

        // Title
        this.drawCenteredString(stack, "Settings", this.width / 2, 50);

        super.drawScreen(stack, mouseX, mouseY, partialTicks);
    }

    onClose() {
        // Save settings
        this.rayancraft.settings.save();
    }

}