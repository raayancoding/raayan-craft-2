import Gui from "../Gui.js";
import Block from "../../world/block/Block.js";
import ChatOverlay from "./ChatOverlay.js";
import rayancraft from "../../Minecraft.js";
import EnumBlockFace from "../../../util/EnumBlockFace.js";
import MathHelper from "../../../util/MathHelper.js";
import FontRenderer from "../../render/gui/FontRenderer.js";
import EnumSkyBlock from "../../../util/EnumSkyBlock.js";
import PlayerListOverlay from "./PlayerListOverlay.js";
import Keyboard from "../../../util/Keyboard.js";

export default class IngameOverlay extends Gui {

    constructor(rayancraft, window) {
        super();
        this.rayancraft = rayancraft;
        this.window = window;

        this.chatOverlay = new ChatOverlay(rayancraft);
        this.playerListOverlay = new PlayerListOverlay(rayancraft, this);

        this.textureCrosshair = rayancraft.resources["gui/icons.png"];
        this.textureHotbar = rayancraft.resources["gui/gui.png"];

        this.ticksRendered = 0;
    }

    render(stack, mouseX, mouseY, partialTicks) {
        // Render crosshair
        if (this.rayancraft.hasInGameFocus()) {
            this.renderCrosshair(stack, this.window.width / 2, this.window.height / 2)
        }

        // Render hotbar
        this.renderHotbar(stack, this.window.width / 2 - 91, this.window.height - 22);

        // Pure survival HUD (hearts / hunger / air / xp / weather)
        if (this.rayancraft.isInGame() && this.rayancraft.player) {
            this.renderSurvivalHud(stack, this.window.width / 2 - 91, this.window.height - 22);
            this.renderWeatherOverlay(stack);
            this.renderDamageOverlays(stack);
            this.renderToast(stack);
            this.renderMinimap(stack);
            this.renderItemTooltip(stack, this.window.width / 2 - 91, this.window.height - 22);
        }

        // Bedrock-style touch hints
        if (this.rayancraft.window.mobileDevice) {
            this.drawString(stack, "Tap: break  Hold: place  Joystick: move", 4, this.window.height - 34, 0xFFFFFFFF);
        }

        // Render chat canvas
        stack.drawImage(this.window.canvasChat, 0, 0);

        // Render debug canvas on stack
        if (this.rayancraft.settings.debugOverlay) {
            stack.drawImage(this.window.canvasDebug, 0, 0);
        }

        // Render player list
        if (Keyboard.isKeyDown(this.rayancraft.settings.keyPlayerList) && !this.rayancraft.isSingleplayer()) {
            this.playerListOverlay.renderPlayerList(stack, this.window.width);
        }
    }

    onTick() {
        this.chatOverlay.onTick();

        // Render debug overlay on tick
        if (this.rayancraft.settings.debugOverlay) {
            let stack = this.window.canvasDebug.getContext('2d');

            // Render debug overlay each tick if the player is moving
            if (this.ticksRendered % 10 === 0) {
                // Clear debug canvas
                stack.clearRect(0, 0, this.window.width, this.window.height);

                // Render debug information
                this.renderLeftDebugOverlay(stack);
                this.renderRightDebugOverlay(stack);
            } else if (this.rayancraft.player.isMoving()) {
                // Render debug information
                this.renderLeftDebugOverlay(stack, [5, 6, 7, 8]);
            }

            this.ticksRendered++;
        }

        // Render chat on tick if dirty
        if (this.chatOverlay.isDirty()) {
            let stack = this.window.canvasChat.getContext('2d');
            stack.clearRect(0, 0, this.window.width, this.window.height);
            this.chatOverlay.render(stack, 0, 0, 0);
        }
    }

    renderCrosshair(stack, x, y) {
        let size = 15;
        this.drawSprite(stack, this.textureCrosshair, 0, 0, 15, 15, x - size / 2, y - size / 2, size, size, 0.6);
    }

    renderSurvivalHud(stack, hx, hy) {
        const p = this.rayancraft.player;
        if (!p) return;
        // Hearts (above hotbar left)
        const hp = Math.ceil((p.health || 20) / 2);
        for (let i = 0; i < 10; i++) {
            const x = hx + i * 8, y = hy - 10;
            const full = i < hp;
            const hurtFlash = p.hurtTime > 0 && (Date.now() % 300 < 150);
            this.drawRect(stack, x, y, x + 7, y + 7, full ? (hurtFlash ? "#ff8888" : "#e02828") : "#3a0d0d");
            this.drawRect(stack, x + 1, y + 1, x + 6, y + 3, full ? "#ff7777" : "#220808");
        }
        // Hunger (above hotbar right)
        const hg = Math.ceil((p.hunger !== undefined ? p.hunger : 20) / 2);
        for (let i = 0; i < 10; i++) {
            const x = hx + 182 - 8 - i * 8, y = hy - 10;
            const full = (9 - i) < hg;
            this.drawRect(stack, x, y, x + 7, y + 7, full ? "#8a5a22" : "#2a1c0d");
            this.drawRect(stack, x + 1, y + 4, x + 6, y + 6, full ? "#c98a3a" : "#1a1208");
        }
        // Air bubbles when head in water
        try {
            if (p.isHeadInWater && p.isHeadInWater()) {
                const airN = Math.ceil((p.air || 0) / 30);
                for (let i = 0; i < 10; i++) {
                    const x = hx + i * 8, y = hy - 20;
                    this.drawRect(stack, x, y, x + 7, y + 7, i < airN ? "#7ac8e8" : "#12303f");
                }
            }
        } catch (e) { }
        // XP level + hotbar number (pure)
        if (p.experienceLevel > 0) {
            this.drawCenteredString(stack, "" + p.experienceLevel, hx + 91, hy - 22, 0xFF7afc7a);
        }
        // Gamemode + biome line (Bedrock-style coords)
        const gm = p.gameMode === 0 ? "Survival" : "Creative";
        const bx = Math.floor(p.x), by = Math.floor(p.y), bz = Math.floor(p.z);
        let biome = "";
        try {
            biome = this.rayancraft.world.getBiomeName(bx, bz);
            if (biome === "Cherry Grove" && this.rayancraft.achievements) this.rayancraft.achievements.unlock("cherry");
            if (this.rayancraft.world.bloodMoon) biome = "☠ Blood Moon";
        } catch (e) { }
        this.drawString(stack, gm + "  XYZ " + bx + " / " + by + " / " + bz + (biome ? "  " + biome : ""), 4, 4, 0xFFE0E0E0);
        if (this.rayancraft.world.weather && this.rayancraft.world.weather !== "clear") {
            this.drawString(stack, (this.rayancraft.world.weather === "rain" ? "Rain" : "Thunder"), this.window.width - 70, 4, 0xFF7ac8ff);
        }
    }

    renderDamageOverlays(stack) {
        const p = this.rayancraft.player, w = this.window;
        if (!p) return;
        // Hurt vignette: red flash on damage
        if (p.hurtTime > 0) {
            this.drawRect(stack, 0, 0, w.width, w.height, "#c01010", Math.min(0.35, p.hurtTime * 0.035));
        }
        // Low health pulse
        if (p.health > 0 && p.health <= 6) {
            const pulse = 0.12 + 0.1 * Math.abs(Math.sin(Date.now() / 400));
            this.drawRect(stack, 0, 0, w.width, w.height, "#a00000", pulse);
        }
        // Lightning flash
        try {
            if (this.rayancraft.world.lightningFlash > 0) {
                this.drawRect(stack, 0, 0, w.width, w.height, "#ffffff", 0.5);
            }
        } catch (e) { }
        // Underwater tint
        try {
            if (p.isHeadInWater && p.isHeadInWater()) {
                this.drawRect(stack, 0, 0, w.width, w.height, "#144a8a", 0.28);
            }
        } catch (e) { }
    }

    renderToast(stack) {
        try {
            const a = this.rayancraft.achievements;
            if (!a) return;
            const t = a.currentToast();
            if (!t) return;
            const w = 220, x = this.window.width / 2 - w / 2, y = 28;
            this.drawRect(stack, x, y, x + w, y + 36, "#212121");
            this.drawRect(stack, x, y, x + w, y + 2, "#ffdd55");
            this.drawString(stack, "Achievement: " + t.title, x + 8, y + 6, 0xFFFFFF55);
            this.drawString(stack, t.desc, x + 8, y + 20, 0xFFFFFFFF);
        } catch (e) { }
    }

    renderItemTooltip(stack, hx, hy) {
        // Selected hotbar item name above the bar (pure)
        try {
            const p = this.rayancraft.player;
            const sel = p.inventory.getItemInSelectedSlot();
            if (sel !== this.lastSelected) { this.lastSelected = sel; this.tooltipUntil = Date.now() + 1800; }
            if (sel && Date.now() < (this.tooltipUntil || 0)) {
                const names = { 1: "Stone", 2: "Grass", 3: "Dirt", 4: "Cobblestone", 5: "Oak Planks", 7: "Bedrock", 9: "Water", 11: "Lava", 12: "Sand", 13: "Gravel", 14: "Gold Ore", 15: "Iron Ore", 16: "Coal Ore", 17: "Oak Log", 18: "Leaves", 20: "Glass", 21: "Lapis Ore", 24: "Sandstone", 25: "Note Block", 35: "Wool", 37: "Dandelion", 38: "Poppy", 45: "Bricks", 46: "TNT", 47: "Bookshelf", 48: "Mossy Cobble", 49: "Obsidian", 50: "Torch", 54: "Chest", 56: "Diamond Ore", 58: "Crafting Table", 61: "Furnace", 73: "Redstone Ore", 79: "Ice", 80: "Snow", 81: "Cactus", 86: "Pumpkin", 87: "Netherrack", 89: "Glowstone", 103: "Melon", 129: "Emerald Ore", 155: "Nether Quartz", 201: "Copper Ore", 202: "Copper Block", 203: "Deepslate", 204: "Amethyst", 205: "Cherry Log", 206: "Cherry Leaves", 210: "Birch Log", 211: "Birch Leaves", 212: "Birch Planks", 213: "Spruce Log", 214: "Spruce Leaves", 215: "Spruce Planks", 216: "Jungle Log", 217: "Jungle Leaves", 218: "Jungle Planks", 219: "Acacia Log", 220: "Acacia Leaves", 221: "Acacia Planks", 222: "Dark Oak Log", 223: "Dark Oak Leaves", 224: "Dark Oak Planks", 225: "Mangrove Log", 226: "Mangrove Leaves", 227: "Mangrove Planks", 230: "Ancient Debris" };
                this.drawCenteredString(stack, names[sel] || ("Block " + sel), hx + 91, hy - 34, 0xFFFFFFFF);
            }
        } catch (e) { }
    }

    renderMinimap(stack) {
        // Top-right minimap: 24x24 sampled columns (pure navigation)
        try {
            const p = this.rayancraft.player, world = this.rayancraft.world;
            if (!p || !world) return;
            const N = 24, cell = 4, size = N * cell;
            const x0 = this.window.width - size - 6, y0 = 30;
            this.drawRect(stack, x0 - 2, y0 - 2, x0 + size + 2, y0 + size + 2, "#111111", 0.7);
            const pcx = Math.floor(p.x), pcz = Math.floor(p.z);
            for (let ix = 0; ix < N; ix++) for (let iz = 0; iz < N; iz++) {
                const wx = pcx - N + ix * 2, wz = pcz - N + iz * 2;
                let color = "#0a0a0a";
                try {
                    const h = world.getHeightAt(wx, wz);
                    const top = world.getBlockAt(wx, h, wz);
                    if (top === 9) color = "#3a6ed8";
                    else if (top === 11) color = "#e05a1a";
                    else if (top === 12 || top === 24) color = "#d8c060";
                    else if (top === 2) {
                        const b = world.getBiomeName(wx, wz);
                        color = b === "Cherry Grove" ? "#f2a7c3" : b === "Desert" ? "#d8c060" : "#4a9a3a";
                    }
                    else if (top === 18) color = "#2a6a2a";
                    else if (top === 206) color = "#f2a7c3";
                    else if (top === 80) color = "#eef4ff";
                    else if (top === 0) color = "#0a0a0a";
                    else color = "#7a7a7a";
                } catch (e) { }
                this.drawRect(stack, x0 + ix * cell, y0 + iz * cell, x0 + ix * cell + cell, y0 + iz * cell + cell, color);
            }
            // Player arrow (center)
            const cx = x0 + size / 2, cy = y0 + size / 2;
            this.drawRect(stack, cx - 2, cy - 2, cx + 2, cy + 2, "#ffffff");
        } catch (e) { }
    }

    renderWeatherOverlay(stack) {
        const w = this.rayancraft.world.weather;
        if (!w || w === "clear") return;
        const alpha = w === "thunder" ? 0.22 : 0.13;
        this.drawRect(stack, 0, 0, this.window.width, this.window.height, w === "thunder" ? "#3a4a6e" : "#4a6e8a", alpha);
        // simple rain streaks
        stack.save();
        stack.strokeStyle = "rgba(180,220,255,0.5)";
        stack.lineWidth = 1;
        const t = Date.now() / 30;
        for (let i = 0; i < 60; i++) {
            const x = (i * 67 + t * (20 + i % 5)) % this.window.width;
            const y = (i * 37 + t * 40) % this.window.height;
            stack.beginPath();
            stack.moveTo(x, y);
            stack.lineTo(x - 2, y + 8);
            stack.stroke();
        }
        stack.restore();
    }

    renderHotbar(stack, x, y) {
        // Render background
        this.drawSprite(stack, this.textureHotbar, 0, 0, 200, 22, x, y, 200, 22)
        this.drawSprite(
            stack,
            this.textureHotbar,
            0, 22,
            24, 24,
            x + this.rayancraft.player.inventory.selectedSlotIndex * 20 - 1, y - 1,
            24, 24
        )

        // To make the items darker
        let brightness = this.rayancraft.isPaused() ? 0.5 : 1; // TODO find a better solution

        this.rayancraft.itemRenderer.prepareRender("hotbar");

        // Render items
        for (let i = 0; i < 9; i++) {
            let typeId = this.rayancraft.player.inventory.getItemInSlot(i);
            if (typeId !== 0) {
                let block = Block.getById(typeId);
                this.rayancraft.itemRenderer.renderItemInGui("hotbar", i, block, Math.floor(x + i * 20 + 11), y + 11, brightness);
            }
        }
    }

    renderLeftDebugOverlay(stack, filters = []) {
        let world = this.rayancraft.world;
        let player = this.rayancraft.player;
        let worldRenderer = this.rayancraft.worldRenderer;

        let x = player.x;
        let y = player.y;
        let z = player.z;

        let yaw = MathHelper.wrapAngleTo180(player.rotationYaw);
        let pitch = player.rotationPitch;

        let facingIndex = (((yaw + 180) * 4.0 / 360.0) + 0.5) & 3;
        let facing = EnumBlockFace.values()[facingIndex + 2];

        let fixedX = x.toFixed(2);
        let fixedY = y.toFixed(2);
        let fixedZ = z.toFixed(2);

        let blockX = Math.floor(x);
        let blockY = Math.floor(y);
        let blockZ = Math.floor(z);

        let chunkX = blockX >> 4;
        let chunkY = blockY >> 4;
        let chunkZ = blockZ >> 4;

        let inChunkX = blockX & 0xF;
        let inChunkY = blockY & 0xF;
        let inChunkZ = blockZ & 0xF;

        let visibleChunks = 0;
        let loadedChunks = 0;
        for (let [index, chunk] of world.getChunkProvider().getChunks()) {
            for (let y in chunk.sections) {
                let chunkSection = chunk.sections[y];
                if (chunkSection.group.visible) {
                    visibleChunks++;
                }
                loadedChunks++;
            }
        }
        let visibleEntities = 0;
        for (let index in world.entities) {
            let entity = world.entities[index];
            if (entity.renderer.group.visible) {
                visibleEntities++;
            }
        }

        let fps = Math.floor(this.rayancraft.fps);
        let viewDistance = this.rayancraft.settings.viewDistance;
        let lightUpdates = world.lightUpdateQueue.length;
        let chunkUpdates = worldRenderer.chunkSectionUpdateQueue.length;
        let entities = world.entities.length;
        let particles = this.rayancraft.particleRenderer.particles.length;
        let skyLight = world.getSavedLightValue(EnumSkyBlock.SKY, blockX, blockY, blockZ);
        let blockLight = world.getSavedLightValue(EnumSkyBlock.BLOCK, blockX, blockY, blockZ);
        let lightLevel = world.getTotalLightAt(blockX, blockY, blockZ);
        let biome = "T: " + world.getTemperature(blockX, blockY, blockZ) + " H: " + world.getHumidity(blockX, blockY, blockZ);

        let soundsLoaded = 0;
        let soundsPlaying = 0;
        let soundPool = this.rayancraft.soundManager.soundPool;
        for (let [id, sounds] of Object.entries(soundPool)) {
            for (let sound of sounds) {
                soundsLoaded++;

                if (sound.isPlaying) {
                    soundsPlaying++;
                }
            }
        }

        let towards = "Towards " + (facing.isPositive() ? "positive" : "negative") + " " + (facing.isXAxis() ? "X" : "Z");

        let lines = [
            "js-rayancraft " + rayancraft.VERSION,
            fps + " fps (" + chunkUpdates + " chunk updates) T: " + this.rayancraft.maxFps,
            "C: " + visibleChunks + "/" + loadedChunks + " D: " + viewDistance + ", L: " + lightUpdates,
            "E: " + visibleEntities + "/" + entities + ", P: " + particles,
            "",
            "XYZ: " + fixedX + " / " + fixedY + " / " + fixedZ,
            "Block: " + blockX + " " + blockY + " " + blockZ,
            "Chunk: " + chunkX + " " + chunkY + " " + chunkZ + " in " + inChunkX + " " + inChunkY + " " + inChunkZ,
            "Facing: " + facing.getName() + " (" + towards + ") (" + yaw.toFixed(1) + " / " + pitch.toFixed(1) + ")",
            "Light: " + lightLevel + " (" + skyLight + " sky, " + blockLight + " block)",
            // "Biome: " + biome,
            "",
            "Sounds: " + soundsPlaying + "/" + soundsLoaded,
            "Time: " + world.time % 24000 + " (Day " + Math.floor(world.time / 24000) + ")",
            "Cursor: " + this.rayancraft.window.focusState.getName()
        ]

        // Hit result
        let hit = worldRenderer.lastHitResult;
        if (hit !== null && hit.type !== 0) {
            lines.push("Looking at: " + hit.x + " " + hit.y + " " + hit.z);
        }

        // Draw lines
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].length === 0 || filters.length !== 0 && !filters.includes(i)) {
                continue;
            }

            // Clear the line
            if (filters.length !== 0) {
                stack.clearRect(
                    1,
                    1 + FontRenderer.FONT_HEIGHT * i,
                    this.getStringWidth(stack, lines[i]) + 1,
                    FontRenderer.FONT_HEIGHT
                );
            }

            // Draw background
            this.drawRect(stack,
                1,
                1 + FontRenderer.FONT_HEIGHT * i,
                1 + this.getStringWidth(stack, lines[i]) + 1,
                1 + FontRenderer.FONT_HEIGHT * i + FontRenderer.FONT_HEIGHT,
                '#50505090'
            );

            // Draw line
            this.drawString(stack, lines[i], 2, 2 + FontRenderer.FONT_HEIGHT * i, 0xffe0e0e0, false);
        }

    }

    renderRightDebugOverlay(stack) {
        let memoryLimit = this.rayancraft.window.getMemoryLimit();
        let memoryUsed = this.rayancraft.window.getMemoryUsed();
        let memoryAllocated = this.rayancraft.window.getMemoryAllocated();

        let usedPercentage = Math.floor(memoryUsed / memoryLimit * 100);
        let allocatedPercentage = Math.floor(memoryAllocated / memoryLimit * 100);

        let width = this.window.canvas.width;
        let height = this.window.canvas.height;

        let lines = [
            "Mem: " + usedPercentage + "% " + this.humanFileSize(memoryUsed, memoryLimit),
            "Allocated: " + allocatedPercentage + "% " + this.humanFileSize(null, memoryAllocated),
            "",
            "Display: " + width + "x" + height,
            this.window.getGPUName()
        ];

        // Draw lines
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].length === 0) {
                continue;
            }

            // Draw background
            this.drawRect(stack,
                this.window.width - this.getStringWidth(stack, lines[i]) - 3,
                1 + FontRenderer.FONT_HEIGHT * i,
                this.window.width - 1,
                1 + FontRenderer.FONT_HEIGHT * i + FontRenderer.FONT_HEIGHT,
                '#50505090'
            );

            // Draw line
            this.drawRightString(stack, lines[i], this.window.width - 2, 2 + FontRenderer.FONT_HEIGHT * i, 0xffe0e0e0, false);
        }
    }

    humanFileSize(bytesUsed, bytesMax) {
        if (Math.abs(bytesMax) < 1000) {
            return (bytesUsed === null ? "" : bytesUsed + "/") + bytesMax + "B";
        }
        const units = ['kB', 'MB'];
        let u = -1;
        const r = 10;
        const thresh = 1000;

        do {
            if (bytesUsed !== null) {
                bytesUsed /= thresh;
            }
            bytesMax /= thresh;
            ++u;
        } while (Math.round(Math.abs(bytesMax) * r) / r >= thresh && u < units.length - 1);
        return (bytesUsed === null ? "" : bytesUsed.toFixed(0) + "/") + bytesMax.toFixed(0) + units[u];
    }
}