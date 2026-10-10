import GuiScreen from "../GuiScreen.js";
import GuiButton from "../widgets/GuiButton.js";
import World from "../../world/World.js";
import GuiTextField from "../widgets/GuiTextField.js";
import Random from "../../../util/Random.js";
import Long from "../../../../../../../libraries/long.js";
import ChunkProviderGenerate from "../../world/provider/ChunkProviderGenerate.js";
import PlayerController from "../../network/controller/PlayerController.js";

export default class GuiCreateWorld extends GuiScreen {

    constructor(previousScreen) {
        super();

        this.previousScreen = previousScreen;
        this.gameMode = 0; // 0 survival (pure default), 1 creative
        this.hardcore = false; // permadeath: death deletes the world
        this.origin = 0; // starter kit: settler / miner / hunter / arcanist
    }

    static ORIGINS = [
        { id: "settler", name: "Settler" },
        { id: "miner", name: "Miner" },
        { id: "hunter", name: "Hunter" },
        { id: "arcanist", name: "Arcanist" },
    ];

    init() {
        super.init();

        let y = this.height / 2 - 50;

        this.fieldSeed = new GuiTextField(this.width / 2 - 100, y + 30, 200, 20)
        this.fieldSeed.maxLength = 30;
        this.buttonList.push(this.fieldSeed);

        this.gameModeButton = new GuiButton("Gamemode: Survival", this.width / 2 - 100, y + 60, 200, 20, () => {
            this.gameMode = this.gameMode === 0 ? 1 : 0;
            this.gameModeButton.string = "Gamemode: " + (this.gameMode === 0 ? "Survival" : "Creative");
        });
        this.buttonList.push(this.gameModeButton);

        this.hardcoreButton = new GuiButton("Hardcore: OFF", this.width / 2 - 100, y + 85, 200, 20, () => {
            this.hardcore = !this.hardcore;
            this.hardcoreButton.string = "Hardcore: " + (this.hardcore ? "ON (permadeath)" : "OFF");
        });
        this.buttonList.push(this.hardcoreButton);

        this.originButton = new GuiButton("Origin: Settler", this.width / 2 - 100, y + 110, 200, 20, () => {
            this.origin = (this.origin + 1) % GuiCreateWorld.ORIGINS.length;
            this.originButton.string = "Origin: " + GuiCreateWorld.ORIGINS[this.origin].name;
        });
        this.buttonList.push(this.originButton);

        this.buttonList.push(new GuiButton("Create New World", this.width / 2 - 155, y + 140, 150, 20, () => {
            let seed = this.fieldSeed.getText();
            if (seed.length === 0) {
                seed = new Random().nextLong();
            } else if (isNaN(seed)) {
                let h = 0;
                for (let i = 0; i < seed.length; i++) {
                    h = 31 * h + seed.charCodeAt(i);
                }
                seed = Long.fromNumber(h);
            }

            // Load world
            let world = new World(this.rayancraft);
            world.hardcore = this.hardcore;
            world.setChunkProvider(new ChunkProviderGenerate(world, seed));
            world.getChunkProvider().findSpawn();

            this.rayancraft.playerController = new PlayerController(this.rayancraft);
            this.rayancraft.pendingGameMode = this.gameMode;
            this.rayancraft.pendingOrigin = GuiCreateWorld.ORIGINS[this.origin].id;
            this.rayancraft.loadWorld(world);
        }));
        this.buttonList.push(new GuiButton("Cancel", this.width / 2 + 5, y + 140, 150, 20, () => {
            this.rayancraft.displayScreen(this.previousScreen);
        }));
    }

    drawScreen(stack, mouseX, mouseY, partialTicks) {
        // Background
        this.drawDefaultBackground(stack);

        // Title
        this.drawCenteredString(stack, "Create New World", this.width / 2, 50);

        let y = this.height / 2 - 50;

        // Seed
        this.drawString(stack, "Seed for the World Generator", this.width / 2 - 100, y + 17, -6250336);
        this.drawString(stack, "Leave blank for a random seed", this.width / 2 - 100, y + 55, -6250336);

        super.drawScreen(stack, mouseX, mouseY, partialTicks);
    }

    onClose() {

    }

}