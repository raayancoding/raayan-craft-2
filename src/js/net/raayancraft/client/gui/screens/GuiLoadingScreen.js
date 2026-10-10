import GuiScreen from "../GuiScreen.js";

export default class GuiLoadingScreen extends GuiScreen {

    // Bedrock-style tips shown while the world loads
    static TIPS = [
        "Tip: Press E to open your inventory",
        "Tip: Hold SPACE twice to toggle flying in Creative",
        "Tip: Diamonds hide deep underground",
        "Tip: Use /gamemode to switch survival and creative",
        "Tip: Beware the Blood Moon...",
        "Tip: Emerald ore only appears in mountain rock",
        "Tip: Crafting tables unlock bigger recipes",
        "Tip: Dogs will follow and protect you",
    ];

    constructor() {
        super();
        this.progress = 0;
    }

    init() {
        super.init();
    }

    drawScreen(stack, mouseX, mouseY, partialTicks) {
        // Bedrock style: solid black background (no dirt texture)
        this.drawRect(stack, 0, 0, this.width, this.height, '#000000');

        const cx = this.width / 2;

        // Game title
        this.drawCenteredString(stack, "RAAYANCRAFT", cx, this.height * 0.32, '#ffffff');

        // Status line with animated dots
        const dots = ".".repeat(1 + Math.floor(Date.now() / 500) % 3);
        const status = (this.title || "Loading") + dots;
        this.drawCenteredString(stack, status, cx, this.height * 0.52, '#ffffff');

        // Progress bar: dark track with light border, white fill (Bedrock look)
        const barWidth = Math.min(320, this.width * 0.7);
        const barHeight = 8;
        const barX = cx - barWidth / 2;
        const barY = this.height * 0.58;
        const p = Math.max(0, Math.min(1, this.progress || 0));

        this.drawRect(stack, barX - 1, barY - 1, barX + barWidth + 1, barY + barHeight + 1, '#8a8a8a');
        this.drawRect(stack, barX, barY, barX + barWidth, barY + barHeight, '#3a3a3a');
        if (p > 0) {
            this.drawRect(stack, barX, barY, barX + barWidth * p, barY + barHeight, '#e8e8e8');
        }

        // Percentage
        this.drawCenteredString(stack, Math.floor(p * 100) + "%", cx, barY + barHeight + 10, '#a0a0a0');

        // Rotating tip near the bottom
        const tip = GuiLoadingScreen.TIPS[Math.floor(Date.now() / 4000) % GuiLoadingScreen.TIPS.length];
        this.drawCenteredString(stack, tip, cx, this.height * 0.82, '#808080');

        super.drawScreen(stack, mouseX, mouseY, partialTicks);
    }

    setTitle(title) {
        this.title = title;
    }

    setProgress(progress) {
        if (progress < this.progress || progress > 1) {
            return;
        }
        this.progress = progress;
    }

    keyTyped(key) {
        // Cancel key inputs
    }
}