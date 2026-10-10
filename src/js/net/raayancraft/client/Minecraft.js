import Timer from "../util/Timer.js";
import GameSettings from "./GameSettings.js";
import GameWindow from "./GameWindow.js";
import WorldRenderer from "./render/WorldRenderer.js";
import ScreenRenderer from "./render/gui/ScreenRenderer.js";
import ItemRenderer from "./render/gui/ItemRenderer.js";
import IngameOverlay from "./gui/overlay/IngameOverlay.js";
import SoundManager from "./sound/SoundManager.js";
import Block from "./world/block/Block.js";
import BoundingBox from "../util/BoundingBox.js";
import { BlockRegistry } from "./world/block/BlockRegistry.js";
import FontRenderer from "./render/gui/FontRenderer.js";
import GrassColorizer from "./render/GrassColorizer.js";
import GuiMainMenu from "./gui/screens/GuiMainMenu.js";
import GuiLoadingScreen from "./gui/screens/GuiLoadingScreen.js";
import * as THREE from "../../../../../libraries/three.module.js";
import ParticleRenderer from "./render/particle/ParticleRenderer.js";
import GuiChat from "./gui/screens/GuiChat.js";
import CommandHandler from "./command/CommandHandler.js";
import GuiContainerCreative from "./gui/screens/container/GuiContainerCreative.js";
import GuiContainerSurvival from "./gui/screens/container/GuiContainerSurvival.js";
import Achievements from "./gui/Achievements.js";
import GameProfile from "../util/GameProfile.js";
import UUID from "../util/UUID.js";
import FocusStateType from "../util/FocusStateType.js";
import Session from "../util/Session.js";
import PlayerControllerMultiplayer from "./network/controller/PlayerControllerMultiplayer.js";
import TerrainPatcher from "./render/TerrainPatcher.js";
import DailyChallenge from "./progression/DailyChallenge.js";
import Exploration from "./progression/Exploration.js";
import Skills from "./progression/Skills.js";
import Quests from "./progression/Quests.js";
import Stats from "./progression/Stats.js";
import Tutorial from "./progression/Tutorial.js";
import Titles from "./progression/Titles.js";
import Modifiers from "./progression/Modifiers.js";
import Trial from "./progression/Trial.js";
import Treasure from "./progression/Treasure.js";
import AdaptiveMilestones from "./progression/AdaptiveMilestones.js";
import Mentor from "./progression/Mentor.js";
import Legacy from "./progression/Legacy.js";

export default class rayancraft {

    static VERSION = "2.0.0"
    static URL_GITHUB = "https://github.com/raayancraft/raayancraft";
    static PROTOCOL_VERSION = 47; //758;

    // TODO Add to settings
    static PROXY = {
        "url": "ws://localhost:8080/"
    };

    /**
     * Create rayancraft instance and render it on a canvas
     */
    constructor(canvasWrapperId, resources) {
        this.resources = resources;

        this.currentScreen = null;
        this.loadingScreen = null;
        this.world = null;
        this.player = null;
        this.playerController = null;
        this.fps = 0;
        this.maxFps = 0;

        // Tick timer
        this.timer = new Timer(20);

        this.settings = new GameSettings();
        this.settings.load();

        // Load session from settings
        if (this.settings.session === null) {
            let username = "Player" + Math.floor(Math.random() * 100);
            let profile = new GameProfile(UUID.randomUUID(), username);
            this.setSession(new Session(profile, ""));
        } else {
            this.setSession(Session.fromJson(this.settings.session));
        }

        // Create window and world renderer
        this.window = new GameWindow(this, canvasWrapperId);

        // Create renderers
        this.worldRenderer = new WorldRenderer(this, this.window);
        this.screenRenderer = new ScreenRenderer(this, this.window);
        this.itemRenderer = new ItemRenderer(this, this.window);

        // Create current screen and overlay
        this.ingameOverlay = new IngameOverlay(this, this.window);

        // Command handler
        this.commandHandler = new CommandHandler(this);

        // Achievements + toasts
        this.achievements = new Achievements(this);

        // Progression systems (daily challenge + exploration)
        this.dailyChallenge = new DailyChallenge(this);
        this.exploration = new Exploration(this);
        this.skills = new Skills(this);
        this.quests = new Quests(this);
        this.stats = new Stats(this);
        this.titles = new Titles(this);
        this.modifiers = new Modifiers(this);
        this.trial = new Trial(this);
        this.treasure = new Treasure(this);
        this.tutorial = new Tutorial(this);
        this.milestones = new AdaptiveMilestones(this);
        this.mentor = new Mentor(this);
        this.legacy = new Legacy(this);

        // Chest storage: key "x,y,z" -> array of 27 block ids
        this.chestData = {};

        this.frames = 0;
        this.lastTime = Date.now();

        // Create all blocks
        BlockRegistry.create();

        this.itemRenderer.initialize();

        // Create font renderer
        this.fontRenderer = new FontRenderer(this);

        // Grass colorizer
        this.grassColorizer = new GrassColorizer(this);

        this.particleRenderer = new ParticleRenderer(this);

        // Update window size
        this.window.updateWindowSize();

        // Create sound manager
        this.soundManager = new SoundManager();

        this.displayScreen(new GuiMainMenu());

        // Initialize
        this.init();
    }

    init() {
        // Start render loop
        this.running = true;
        this.requestNextFrame();
    }

    loadWorld(world) {
        if (world === null) {
            this.worldRenderer.reset();
            this.itemRenderer.reset();

            // Disconnect from server
            if (this.playerController instanceof PlayerControllerMultiplayer) {
                let networkHandler = this.playerController.getNetworkHandler();
                if (networkHandler.getNetworkManager().isConnected()) {
                    networkHandler.getNetworkManager().close();
                }

                // Reset header and footer
                this.ingameOverlay.playerListOverlay.setHeader(null);
                this.ingameOverlay.playerListOverlay.setFooter(null);
            }
            this.playerController = null;

            if (this.world !== null) {
                this.world.getChunkProvider().getChunks().clear();
                this.world.clearEntities();
                this.world = null;
                this.player = null;
                this.loadingScreen = null;
            }
            this.displayScreen(new GuiMainMenu());
        } else {
            // Display loading screen
            this.loadingScreen = new GuiLoadingScreen();
            this.loadingScreen.setTitle("Building terrain...");
            this.displayScreen(this.loadingScreen);

            // Clear previous world
            if (this.world !== null) {
                this.world.getChunkProvider().getChunks().clear();
                this.world.clearEntities();
                this.worldRenderer.reset();
                this.itemRenderer.reset();
            }

            // Create world
            this.world = world;
            this.worldRenderer.scene.add(this.world.group);
            if (world.hardcore) {
                try { this.addMessageToChat("Hardcore mode: death is permanent!"); } catch (e) { }
            }

            // Create player
            this.player = this.playerController.createPlayer(this.world);
            this.player.username = this.session.getProfile().getUsername();
            if (this.pendingGameMode !== undefined) {
                this.player.gameMode = this.pendingGameMode;
                this.pendingGameMode = undefined;
            }
            // Give starter kit in survival (pure): planks + torches + crafting table
            if (this.player.gameMode === 0) {
                this.player.inventory.addItem(5);
                this.player.inventory.addItem(50);
                this.player.inventory.addItem(58);
            }
            // Origin starter kits (character origin choices alter starting gear)
            if (this.pendingOrigin) {
                try { this.applyOriginKit(this.pendingOrigin); } catch (e) { }
                this.pendingOrigin = undefined;
            }
            this.world.addEntity(this.player);

            // Load spawn chunks and respawn player
            this.world.loadSpawnChunks();
            this.player.respawn();
        }
    }

    hasInGameFocus() {
        return this.window.isLocked() && this.currentScreen === null;
    }

    isInGame() {
        return this.world !== null && this.worldRenderer !== null && this.player !== null;
    }

    addMessageToChat(message) {
        this.ingameOverlay.chatOverlay.addMessage(message);
    }

    // Origin starter kits: wood/torches/dirt/sand/sapling for settlers,
    // stone + coal for miners, food + wool for hunters, glow + books for arcanists.
    applyOriginKit(origin) {
        const kits = {
            settler: [5, 50, 50, 50, 3, 12, 6],
            miner: [50, 50, 50, 4, 4, 16, 5],
            hunter: [103, 86, 50, 5, 35, 12],
            arcanist: [89, 47, 25, 50, 5, 3],
        };
        const kit = kits[origin];
        if (!kit || !this.player) return;
        for (const id of kit) {
            try { this.player.inventory.addItem(id); } catch (e) { }
        }
        const names = { settler: "Settler", miner: "Miner", hunter: "Hunter", arcanist: "Arcanist" };
        try { this.addMessageToChat("Origin: " + (names[origin] || origin) + " — your journey begins with purpose."); } catch (e) { }
    }

    // Central XP grant: honors the doublexp modifier, preserves the
    // (level+1)*10 level-up curve, announces level-ups.
    addXP(amount) {        try {
            const p = this.player;
            if (!p || !(amount > 0)) return;
            let n = amount;
            if (this.modifiers && this.modifiers.has("doublexp")) n *= 2;
            p.experience = (p.experience || 0) + n;
            while (p.experience >= (p.experienceLevel + 1) * 10) {
                p.experienceLevel++;
                this.addMessageToChat("§aLevel up! Level " + p.experienceLevel);
            }
        } catch (e) { }
    }

    requestNextFrame() {
        requestAnimationFrame(() => {
            if (this.running) {
                this.requestNextFrame();
                this.onLoop();
            }
        });
    }

    onLoop() {
        // Update the timer
        if (this.isPaused() && this.isInGame()) {
            let prevPartialTicks = this.timer.partialTicks;
            this.timer.advanceTime();
            this.timer.partialTicks = prevPartialTicks;
        } else {
            this.timer.advanceTime();
        }

        // Call the tick to reach updates 20 per seconds
        for (let i = 0; i < this.timer.ticks; i++) {
            this.onTick();
        }

        // Render the game
        this.onRender(this.timer.partialTicks);

        // Increase rendered frame
        this.frames++;

        // Loop if a second passed
        while (Date.now() >= this.lastTime + 1000) {
            this.fps = this.frames;
            this.maxFps = Math.max(this.maxFps, this.fps);
            this.lastTime += 1000;
            this.frames = 0;
        }
    }

    onRender(partialTicks) {
        if (this.isInGame()) {
            // Player rotation
            if (this.hasInGameFocus()) {
                let deltaX = this.window.pullMouseMotionX();
                let deltaY = this.window.pullMouseMotionY();
                this.player.turn(deltaX, deltaY);
            }

            // Update lights
            while (this.world.updateLights()) {
                // Empty
            }

            // Render the game
            if (this.isInGame() && !this.isPaused()) {
                this.worldRenderer.render(partialTicks);
            }
        }

        // Render items in GUI
        this.itemRenderer.render(partialTicks);

        // Render current screen
        this.screenRenderer.render(partialTicks);
    }

    displayScreen(screen) {
        if (screen === this.currentScreen) {
            return;
        }

        if (typeof screen === "undefined") {
            console.error("Tried to display an undefined screen");
            return;
        }

        // Fallback screen
        if (screen === null && !this.isInGame()) {
            screen = new GuiMainMenu();
        }

        // Close previous screen
        if (this.currentScreen !== null) {
            this.currentScreen.onClose();
        }

        // Switch screen
        this.currentScreen = screen;

        // Update window size
        this.window.updateWindowSize();

        // Initialize new screen
        if (screen === null) {
            this.window.updateFocusState(FocusStateType.REQUEST_LOCK);
        } else {
            this.window.updateFocusState(FocusStateType.REQUEST_EXIT);
            screen.setup(this, this.window.width, this.window.height);
        }

        // Update items
        this.itemRenderer.rebuildAllItems();
    }

    onTick() {
        if (this.isInGame() && !this.isPaused()) {
            // Tick overlay
            this.ingameOverlay.onTick();

            // Tick world
            this.world.onTick();

            // Tick renderer
            this.worldRenderer.onTick();

            // Tick particle renderer
            this.particleRenderer.onTick();

            // Tick progression systems (internally throttled, failure-isolated)
            try { this.dailyChallenge.tick(); } catch (e) { }
            try { this.exploration.tick(); } catch (e) { }
            try { this.stats.tick(); } catch (e) { }
            try { this.quests.tick(); } catch (e) { }
            try { this.milestones.tick(); } catch (e) { }
            try { this.mentor.tick(); } catch (e) { }
            try { this.legacy.tick(); } catch (e) { }
            try { this.trial.tick(); } catch (e) { }
            try { this.treasure.tick(); } catch (e) { }
            try { this.tutorial.tick(); } catch (e) { }
        }

        // Tick the screen
        if (this.currentScreen !== null) {
            this.currentScreen.updateScreen();
        }

        // Update loading progress
        if (this.loadingScreen !== null && this.isInGame()) {
            let cameraChunkX = Math.floor(this.player.x) >> 4;
            let cameraChunkZ = Math.floor(this.player.z) >> 4;

            let renderDistance = this.settings.viewDistance;
            let requiredChunks = this.isSingleplayer() ? Math.pow(renderDistance * 2 - 1, 2) : 1;
            let loadedChunks = this.world.getChunkProvider().getChunks().size;

            // Load chunks and count
            setTimeout(() => {
                for (let x = -renderDistance + 1; x < renderDistance; x++) {
                    for (let z = -renderDistance + 1; z < renderDistance; z++) {
                        this.world.getChunkAt(cameraChunkX + x, cameraChunkZ + z);
                    }
                }
            }, 0);

            // Update progress
            let progress = 1 / requiredChunks * Math.max(0, loadedChunks - this.world.lightUpdateQueue.length / 1000);
            this.loadingScreen.setProgress(progress);

            // Finish loading
            if (progress >= 0.99) {
                this.loadingScreen = null;
                this.displayScreen(null);
            }
        }
    }

    onKeyPressed(button) {
        // Select slot
        for (let i = 1; i <= 9; i++) {
            if (button === 'Digit' + i) {
                this.player.inventory.selectedSlotIndex = i - 1;
            }
        }

        // Toggle perspective
        if (button === this.settings.keyTogglePerspective) {
            this.settings.thirdPersonView = (this.settings.thirdPersonView + 1) % 3;
            this.settings.save();
        }

        // Open chat
        if (button === this.settings.keyOpenChat) {
            this.displayScreen(new GuiChat(this));
            this.ingameOverlay.chatOverlay.setDirty();
        }

        // Toggle debug overlay
        if (button === "F3") {
            this.settings.debugOverlay = !this.settings.debugOverlay;
            this.settings.save();
        }

        // Open inventory
        if (button === this.settings.keyOpenInventory) {
            if (this.player && this.player.gameMode === 0) {
                this.displayScreen(new GuiContainerSurvival(this.player));
            } else {
                this.displayScreen(new GuiContainerCreative(this.player));
            }
        }
    }

    explodeAt(bx, by, bz, radius) {
        // Shared explosion: crater + entity damage + particles
        try {
            for (let ox = -radius; ox <= radius; ox++) for (let oy = -radius; oy <= radius; oy++) for (let oz = -radius; oz <= radius; oz++) {
                if (ox * ox + oy * oy + oz * oz > radius * radius) continue;
                const b = this.world.getBlockAt(bx + ox, by + oy, bz + oz);
                if (b !== 0 && b !== 7 && b !== 49) this.world.setBlockAt(bx + ox, by + oy, bz + oz, 0);
            }
            for (const e of this.world.entities) {
                if (e.isDead) continue;
                const d = Math.hypot(e.x - bx, e.y - by, e.z - bz);
                if (d < radius + 2 && e.isAlive && e.isAlive() && !(e.gameMode === 1)) e.damage(Math.max(2, Math.ceil((radius + 2 - d) * 3)), "generic");
            }
            for (let i = 0; i < 16; i++) this.particleRenderer.spawnBlockBreakParticle(this.world, bx, by + 1, bz);
            this.worldRenderer.flushRebuild = true;
        } catch (e) { }
    }

    onMouseClicked(button) {
        if (this.window.isLocked()) {
            // Building skill: +1 block reach every 5 levels (max +2)
            let reach = 5 + (this.skills ? Math.min(2, Math.floor(this.skills.level("building") / 5)) : 0);
            let hitResult = this.player.rayTrace(reach, this.timer.partialTicks);

            // Destroy block
            if (button === 0) {
                // Pure combat: hit mobs first
                try {
                    const look = this.player.getLook(1.0);
                    let best = null, bestD = 4.0;
                    for (const e of this.world.entities) {
                        if (e === this.player || e.isDead) continue;
                        const dx = (e.x - this.player.x), dy = ((e.y + e.height / 2) - (this.player.y + 1.5)), dz = (e.z - this.player.z);
                        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        if (d > 4) continue;
                        const dot = (dx * look.x + dy * look.y + dz * look.z) / (d || 1);
                        if (dot > 0.85 && d < bestD) { best = e; bestD = d; }
                    }
                    if (best) {
                        // Crit: falling attack deals 1.5x + burst particles (pure juice)
                        const crit = !this.player.onGround && this.player.motionY < -0.05;
                        const ench = this.player.enchants || {};
                        const eff = this.player.effects || {};
                        let dmg = 4 + (ench.sharpness || 0) * 1.5 + (eff.strength > 0 ? 2 : 0) + (this.skills ? Math.floor(this.skills.level("combat") / 4) : 0);
                        if (crit) dmg *= 1.5;
                        best.damage(Math.round(dmg), "generic");
                        this.player.swingArm();
                        if (crit) {
                            for (let i = 0; i < 8; i++) this.particleRenderer.spawnBlockBreakParticle(this.world, Math.floor(best.x), Math.floor(best.y + 1), Math.floor(best.z));
                            this.addMessageToChat("§eCRIT!");
                        }
                        if (best.isDead) {
                            this.addMessageToChat("§7Slain " + best.constructor.name);
                            if (best.isMyth && this.achievements) this.achievements.unlock("myth");
                            // Progression hooks: combat skill, stats, quests, boss reward
                            try {
                                if (this.skills) this.skills.xp("combat", 8);
                                if (this.stats) this.stats.event("kills");
                                if (this.quests) this.quests.event("kill");
                                if (this.milestones) this.milestones.event("kill");
                                if (this.mentor) this.mentor.event("kill");
                                if (this.trial) this.trial.event("kill");
                                if (best.isGuardian) {
                                    this.addXP(25);
                                    this.addMessageToChat("§bGuardian felled! +25 XP");
                                    if (this.achievements) this.achievements.unlock("guardian");
                                }
                                if (best.isBoss) {
                                    this.addXP(50);
                                    this.addMessageToChat("§6BOSS SLAIN! +50 XP");
                                    if (this.achievements) this.achievements.unlock("boss");
                                    if (this.legacy) this.legacy.recordFeat("Boss Slayer");
                                }
                            } catch (e) { }
                        }
                        this.worldRenderer.flushRebuild = true;
                        return;
                    }
                } catch (e) { }
                if (hitResult != null) {
                    // Get previous block
                    let typeId = this.world.getBlockAt(hitResult.x, hitResult.y, hitResult.z);
                    let block = Block.getById(typeId);

                    if (typeId !== 0 && block) {
                        const survival = this.player && this.player.gameMode === 0;
                        // Bedrock + obsidian rules (pure)
                        if (survival && (typeId === 7 || typeId === 49)) {
                            this.addMessageToChat("§7That block is unbreakable in Survival!");
                        } else {
                            let soundName = block.getSound().getBreakSound();

                            // Play sound
                            this.soundManager.playSound(
                                soundName,
                                hitResult.x + 0.5,
                                hitResult.y + 0.5,
                                hitResult.z + 0.5,
                                1.0,
                                1.0
                            );

                            // Spawn particle
                            this.particleRenderer.spawnBlockBreakParticle(this.world, hitResult.x, hitResult.y, hitResult.z);

                            // Survival: small XP + hunger cost; Creative: free
                            if (survival) {
                                // Ores drop XP (pure) + legacy museum bonus (passive world bonus)
                                if ([14, 15, 16, 56, 73, 21, 129, 155, 201].includes(typeId)) {
                                    let bonus = 0;
                                    try { bonus = this.legacy ? this.legacy.museumBonusXp() : 0; } catch (e) { }
                                    this.addXP(3 + bonus);
                                    if (typeId === 56 && this.achievements) this.achievements.unlock("diamond");
                                    if (typeId === 201 && this.achievements) this.achievements.unlock("copper");
                                }
                                // Food from blocks: melons/pumpkins feed you, leaves may drop apples
                                if (typeId === 103) { this.player.hunger = Math.min(20, this.player.hunger + 4); this.addMessageToChat("§aYum! +4 hunger"); }
                                if (typeId === 86) { this.player.hunger = Math.min(20, this.player.hunger + 2); }
                                // Gathering skill improves apple drops from leaves
                                let appleChance = 0.1 + (this.skills ? Math.min(0.2, this.skills.level("gathering") * 0.015) : 0);
                                if (typeId === 18 && Math.random() < appleChance) { this.player.hunger = Math.min(20, this.player.hunger + 2); this.addMessageToChat("§aAn apple fell from the leaves! +2 hunger"); }
                                this.player.hunger = Math.max(0, this.player.hunger - 0.1);
                            }

                            // TNT goes BOOM when mined in Survival (encyclopedia redstone fun)
                            if (survival && typeId === 46) {
                                this.world.setBlockAt(hitResult.x, hitResult.y, hitResult.z, 0);
                                this.explodeAt(hitResult.x, hitResult.y, hitResult.z, 3);
                                this.addMessageToChat("§cBOOM!");
                                this.player.swingArm();
                                this.worldRenderer.flushRebuild = true;
                                return;
                            }
                            // Add block to inventory
                            this.player.inventory.addItem(typeId);
                            // Fortune: bonus drops on ores (efficiency boosts XP)
                            try {
                                const ench2 = this.player.enchants || {};
                                if ([14, 15, 16, 56, 73, 21, 129, 201].includes(typeId) && ench2.fortune > 0) {
                                    for (let f = 0; f < ench2.fortune; f++) this.player.inventory.addItem(typeId);
                                    this.addMessageToChat("§bFortune procs! Bonus drops");
                                }
                                if ([14, 15, 16, 56, 73, 21, 129, 155, 201].includes(typeId) && ench2.efficiency > 0) {
                                    this.addXP(2 * ench2.efficiency);
                                }
                            } catch (e) { }

                            // Destroy block
                            this.world.setBlockAt(hitResult.x, hitResult.y, hitResult.z, 0);
                            // Progression hooks: skills, stats, quests
                            try {
                                const ORES = [14, 15, 16, 56, 73, 21, 129, 155, 201, 231, 232, 233, 234, 235, 236, 237, 238];
                                if (this.skills) {
                                    if (ORES.includes(typeId)) {
                                        this.skills.xp("mining", 4);
                                        // Skilled hands: bonus ore drops (max 25%)
                                        if (Math.random() < Math.min(0.25, this.skills.level("mining") * 0.02)) {
                                            this.player.inventory.addItem(typeId);
                                        }
                                    } else if (typeId === 1 || typeId === 4 || typeId === 203) {
                                        this.skills.xp("mining", 1);
                                    }
                                    const LOGS = [17, 205, 210, 213, 216, 219, 222, 225];
                                    const GREENS = [18, 206, 211, 214, 217, 220, 223, 226, 37, 38, 6, 103, 86];
                                    if (LOGS.includes(typeId) || GREENS.includes(typeId)) {
                                        this.skills.xp("gathering", 2);
                                    }
                                }
                                if (this.stats) this.stats.event("broken");
                                if (this.quests) this.quests.event("break", typeId);
                                if (this.milestones) this.milestones.event("break", typeId);
                                if (this.mentor) this.mentor.event("break", typeId);
                                if (this.trial) this.trial.event("break", typeId);
                            } catch (e) { }
                        }
                    }
                }

                this.player.swingArm();
            }

            // Pick block
            if (button === 1) {
                if (hitResult != null) {
                    let typeId = this.world.getBlockAt(hitResult.x, hitResult.y, hitResult.z);
                    if (typeId !== 0) {
                        // Switch to slot if item is already in hotbar
                        for (const item of this.player.inventory.items) {
                            const index = this.player.inventory.items.indexOf(item);
                            if (item === typeId && index <= 8) {
                                this.player.inventory.selectedSlotIndex = index;
                                return;
                            }
                        }

                        // Set item in hotbar
                        this.player.inventory.setItemInSelectedSlot(typeId);
                    }
                }
            }

            // Place block / use block
            if (button === 2) {
                if (hitResult != null) {
                    // Right-clicking a chest opens it instead of placing (pure storage)
                    try {
                        const targetId = this.world.getBlockAt(hitResult.x, hitResult.y, hitResult.z);
                        if (targetId === 54) {
                            import("./gui/screens/container/GuiContainerChest.js").then(m => {
                                this.displayScreen(new m.default(this.player, hitResult.x, hitResult.y, hitResult.z));
                            }).catch(() => { });
                            if (this.achievements) this.achievements.unlock("chest");
                            return;
                        }
                        // Note block: right-click plays a pitched note (encyclopedia redstone music)
                        if (targetId === 25) {
                            const pitch = 0.6 + ((hitResult.x + hitResult.y + hitResult.z) % 12) * 0.08;
                            const nb = Block.getById(targetId);
                            this.soundManager.playSound(nb.getSound().getStepSound(), hitResult.x + 0.5, hitResult.y + 0.5, hitResult.z + 0.5, 1.0, pitch);
                            this.particleRenderer.spawnBlockBreakParticle(this.world, hitResult.x, hitResult.y + 1, hitResult.z);
                            this.player.swingArm();
                            return;
                        }
                    } catch (e) { }
                    let x = hitResult.x + hitResult.face.x;
                    let y = hitResult.y + hitResult.face.y;
                    let z = hitResult.z + hitResult.face.z;

                    let placedBoundingBox = new BoundingBox(x, y, z, x + 1, y + 1, z + 1);

                    // Don't place blocks if the player is standing there
                    if (!placedBoundingBox.intersects(this.player.boundingBox)) {
                        let typeId = this.player.inventory.getItemInSelectedSlot();

                        // Get previous block
                        let prevTypeId = this.world.getBlockAt(x, y, z);
                        const canReplace = (prevTypeId === 0 || (Block.getById(prevTypeId) && !Block.getById(prevTypeId).isSolid()));

                        if (typeId !== 0 && canReplace) {
                            // Place block
                            this.world.setBlockAt(x, y, z, typeId);
                            // Progression hooks: building skill, stats, quests
                            try {
                                if (this.skills) this.skills.xp("building", 1);
                                if (this.stats) this.stats.event("placed");
                                if (this.quests) this.quests.event("place", typeId);
                                if (this.milestones) this.milestones.event("place", typeId);
                                if (this.mentor) this.mentor.event("place", typeId);
                            } catch (e) { }

                            // Swing player arm
                            this.player.swingArm();

                            // Survival consumes block (pure)
                            if (this.player.gameMode === 0) {
                                this.player.inventory.setItemInSelectedSlot(0);
                            }

                            // Handle block abilities
                            let block = Block.getById(typeId);
                            block.onBlockPlaced(this.world, x, y, z, hitResult.face);

                            // Play sound
                            let sound = block.getSound();
                            let soundName = sound.getStepSound();
                            this.soundManager.playSound(
                                soundName,
                                hitResult.x + 0.5,
                                hitResult.y + 0.5,
                                hitResult.z + 0.5,
                                1.0,
                                sound.getPitch() * 0.8
                            );
                        }
                    }
                }
            }

            // Rebuild multiple chunk sections
            this.worldRenderer.flushRebuild = true;
        }
    }

    onMouseScroll(delta) {
        if (this.isInGame()) {
            this.player.inventory.shiftSelectedSlot(delta);
        }
    }

    isPaused() {
        return !this.hasInGameFocus() && this.loadingScreen === null && this.isSingleplayer();
    }

    setSession(session, save = false) {
        this.session = session;

        // Save session
        if (save) {
            this.settings.session = session.toJson();
            this.settings.save();
        }
    }

    updateAccessToken(token) {
        this.session.setAccessToken(token);
        this.setSession(this.session, true);
    }

    getSession() {
        return this.session;
    }

    isSingleplayer() {
        return this.isInGame() && !(this.playerController instanceof PlayerControllerMultiplayer);
    }

    stop() {
        if (this.currentScreen !== null) {
            this.currentScreen.onClose();
        }
        this.running = false;
        this.worldRenderer.reset();
        this.itemRenderer.reset();
        this.screenRenderer.reset();
        this.window.close();
    }

    getThreeTexture(id) {
        if (!(id in this.resources)) {
            console.error("Texture not found: " + id);
            return;
        }

        let image = this.resources[id];
        let canvas = document.createElement('canvas');
        let context = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        context.imageSmoothingEnabled = false;
        context.drawImage(image, 0, 0, image.width, image.height);
        if (id === "terrain/terrain.png") {
            TerrainPatcher.patch(canvas, context);
        }
        return new THREE.CanvasTexture(canvas);
    }
}