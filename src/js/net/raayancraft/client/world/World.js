import ChunkSection from "./ChunkSection.js";
import MathHelper from "../../util/MathHelper.js";
import BoundingBox from "../../util/BoundingBox.js";
import EnumSkyBlock from "../../util/EnumSkyBlock.js";
import Block from "./block/Block.js";
import EnumBlockFace from "../../util/EnumBlockFace.js";
import Vector3 from "../../util/Vector3.js";
import Vector4 from "../../util/Vector4.js";
import MetadataChunkBlock from "../../util/MetadataChunkBlock.js";
import * as THREE from "../../../../../../libraries/three.module.js";

export default class World {

    static TOTAL_HEIGHT = ChunkSection.SIZE * 8 - 1; // ChunkSection.SIZE * 16 - 1;

    constructor(rayancraft) {
        this.rayancraft = rayancraft;

        this.entities = [];

        this.group = new THREE.Object3D();
        this.group.matrixAutoUpdate = false;

        this.lightUpdateQueue = [];
        this.chunkProvider = null;

        this.time = 6000;
        this.spawn = new Vector3(0, 0, 0);
        this.weather = "clear";
        this.weatherTime = 0;
        this.difficulty = 1;
        this.bloodMoon = false;
        this.lightningFlash = 0;

        // Update lights async
        let scope = this;
        setInterval(function () {
            let i = scope.rayancraft.loadingScreen === null ? 1000 : 100000;
            while (scope.lightUpdateQueue.length >= 10 && i > 0) {
                i--;
                scope.lightUpdateQueue.shift().updateBlockLightning(scope);
            }
        }, 0);
    }

    setChunkProvider(chunkProvider) {
        this.chunkProvider = chunkProvider;
    }

    onTick() {
        // Tick entities
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const e = this.entities[i];
            e.onUpdate();
            // Remove dead mobs (not player)
            if (e.isDead && e.constructor.name !== "PlayerEntity" && e.deathTime !== undefined) {
                e.deathTime = (e.deathTime || 0) + 1;
                if (e.deathTime > 20) {
                    this.removeEntityById(e.id);
                    // XP to player if nearby
                    try {
                        if (this.rayancraft.player && Math.abs(e.x - this.rayancraft.player.x) < 8) {
                            this.rayancraft.player.experience += 3;
                        }
                    } catch (err) { }
                }
            }
        }

        // Update skylight subtracted (To make the night dark)
        let lightLevel = this.calculateSkylightSubtracted(1.0);
        if (lightLevel !== this.skylightSubtracted) {
            this.skylightSubtracted = lightLevel;

            // Rebuild all chunks
            this.rayancraft.worldRenderer.rebuildAll();
        }

        // Update world time (pure day cycle 24000)
        this.time++;

        // Weather cycle (Bedrock-like random)
        if (this.weatherTime > 0) this.weatherTime--;
        else {
            if (this.weather === "clear" && Math.random() < 0.0008) {
                this.weather = Math.random() < 0.25 ? "thunder" : "rain";
                this.weatherTime = 6000 + Math.floor(Math.random() * 6000);
            } else if (this.weather !== "clear" && Math.random() < 0.002) {
                this.weather = "clear";
                this.weatherTime = 6000 + Math.floor(Math.random() * 8000);
            }
        }

        // Blood Moon event: rare red night, zombie hordes (pure event)
        try {
            const tod = this.time % 24000;
            if (!this.bloodMoon && tod >= 12500 && tod < 12600 && Math.random() < 0.06) {
                this.bloodMoon = true;
                this.rayancraft.addMessageToChat("§c☠ BLOOD MOON RISES ☠ — survive the night!");
                // Blood Moon boss (world event): an empowered myth rises near the player
                try {
                    if (this.rayancraft.isSingleplayer && this.rayancraft.isSingleplayer() && this.rayancraft.player) {
                        const p = this.rayancraft.player;
                        const files = ["Entity303", "EntityGiantAlex", "EntityBloodGolem"];
                        const file = files[Math.floor(Math.random() * files.length)];
                        import("../entity/" + file + ".js").then(m => {
                            try {
                                const e = new m.default(this.rayancraft, this, Date.now() % 100000);
                                e.maxHealth = 150;
                                e.health = 150;
                                e.isMyth = true;
                                e.isBoss = true;
                                const bx = Math.floor(p.x + 8), bz = Math.floor(p.z + 8);
                                e.setPosition(bx + 0.5, this.getHeightAt(bx, bz) + 1, bz + 0.5);
                                this.addEntity(e);
                                this.rayancraft.addMessageToChat("§4A Blood Moon Boss (" + file + ") has risen nearby!");
                            } catch (err) { }
                        }).catch(() => { });
                    }
                } catch (e) { }
            }
            if (this.bloodMoon && tod < 12000) {
                this.bloodMoon = false;
                if (this.rayancraft.player && this.rayancraft.player.isAlive()) {
                    if (this.rayancraft.achievements) this.rayancraft.achievements.unlock("bloodmoon");
                    this.rayancraft.addMessageToChat("§eYou survived the Blood Moon!");
                }
            }
            // Lightning strikes during thunder (pure juice)
            if (this.weather === "thunder" && this.rayancraft.player && Math.random() < 0.008) {
                const p = this.rayancraft.player;
                const lx = Math.floor(p.x + Math.random() * 24 - 12);
                const lz = Math.floor(p.z + Math.random() * 24 - 12);
                const ly = this.getHeightAt(lx, lz);
                this.lightningFlash = 6;
                for (const e of this.entities) {
                    const d = Math.hypot(e.x - lx, e.z - lz);
                    if (d < 3.5 && e.isAlive && e.isAlive() && !(e.gameMode === 1)) e.damage(5, "generic");
                }
                try {
                    for (let i = 0; i < 10; i++) this.rayancraft.particleRenderer.spawnBlockBreakParticle(this, lx, ly + 1, lz);
                } catch (e) { }
            }
            if (this.lightningFlash > 0) this.lightningFlash--;
        } catch (e) { }

        // Pure mob spawning (singleplayer only)
        try {
            if (this.rayancraft.isSingleplayer && this.rayancraft.isSingleplayer() && this.rayancraft.player && Math.random() < 0.02) {
                const t = this.time % 24000;
                const night = t > 12500 && t < 23500;
                const horde = this.bloodMoon ? 3 : 1; // blood moon triples the horde
                let pigs = 0, zombies = 0;
                let myths = 0;
                for (const e of this.entities) {
                    if (e.constructor.name === "EntityPig") pigs++;
                    if (e.constructor.name === "EntityZombie") zombies++;
                    if (e.isMyth) myths++;
                }
                const px = Math.floor(this.rayancraft.player.x), pz = Math.floor(this.rayancraft.player.z);
                const sx = px + Math.floor(Math.random() * 40 - 20), sz = pz + Math.floor(Math.random() * 40 - 20);
                const sy = this.getHeightAt(sx, sz);
                // Census (encyclopedia cast)
                let cows = 0, sheep = 0, chickens = 0, skeletons = 0, creepers = 0, endermen = 0, villagers = 0, golems = 0;
                for (const e of this.entities) {
                    const n = e.constructor.name;
                    if (n === "EntityCow") cows++;
                    else if (n === "EntitySheep") sheep++;
                    else if (n === "EntityChicken") chickens++;
                    else if (n === "EntitySkeleton") skeletons++;
                    else if (n === "EntityCreeper") creepers++;
                    else if (n === "EntityEnderman") endermen++;
                    else if (n === "EntityVillager") villagers++;
                    else if (n === "EntityIronGolem") golems++;
                }
                const spawnSimple = (file, cap, count, cur) => {
                    if (cur >= cap) return;
                    import("../entity/" + file + ".js").then(m => {
                        const id = Date.now() % 100000 + Math.floor(Math.random() * 1000);
                        const e = new m.default(this.rayancraft, this, id);
                        e.setPosition(sx + 0.5, sy + 1, sz + 0.5);
                        if (this.getBlockAt(sx, sy, sz) !== 0) this.addEntity(e);
                    }).catch(() => { });
                };
                if (sy > 0) {
                    if (!night && pigs < 6 && Math.random() < 0.4) {
                        import("../entity/EntityPig.js").then(m => {
                            const id = Date.now() % 100000 + Math.floor(Math.random() * 1000);
                            const pig = new m.default(this.rayancraft, this, id);
                            pig.setPosition(sx + 0.5, sy + 1, sz + 0.5);
                            if (this.getBlockAt(sx, sy, sz) !== 0) this.addEntity(pig);
                        }).catch(() => { });
                    } else if (night && zombies < 6 * horde) {
                        import("../entity/EntityZombie.js").then(m => {
                            const id = Date.now() % 100000 + Math.floor(Math.random() * 1000);
                            const z = new m.default(this.rayancraft, this, id);
                            z.setPosition(sx + 0.5, sy + 1, sz + 0.5);
                            this.addEntity(z);
                        }).catch(() => { });
                    }
                    // Encyclopedia passives by day, horrors by night
                    if (!night && Math.random() < 0.25) {
                        const r = Math.random();
                        if (r < 0.3) spawnSimple("EntityCow", 4, 0, cows);
                        else if (r < 0.55) spawnSimple("EntitySheep", 4, 0, sheep);
                        else if (r < 0.75) spawnSimple("EntityChicken", 4, 0, chickens);
                        else if (r < 0.9) spawnSimple("EntityVillager", 3, 0, villagers);
                        else spawnSimple("EntityIronGolem", 1, 0, golems);
                    }
                    if (night && Math.random() < 0.3) {
                        const r = Math.random();
                        if (r < 0.4) spawnSimple("EntitySkeleton", 4 * horde, 0, skeletons);
                        else if (r < 0.7) spawnSimple("EntityCreeper", 3 * horde, 0, creepers);
                        else if (r < 0.85) spawnSimple("EntityEnderman", 2, 0, endermen);
                    }
                    // Mythical creatures wave 1: VERY rare, mostly night, max 1 at a time
                    if (myths < 1 && Math.random() < 0.03) {
                        const roll = Math.random();
                        let file = null, warn = "";
                        if (night && roll < 0.25) { file = "EntityHerobrine"; warn = "§fHEROBRINE has joined the game"; }
                        else if (night && roll < 0.45) { file = "Entity303"; warn = "§4ENTITY 303 has awakened..."; }
                        else if (night && roll < 0.62) { file = "EntityGiantAlex"; warn = "§6You feel watched. GIANT ALEX stalks you."; }
                        else if (night && roll < 0.79) { file = "EntitySiren"; warn = "§8A siren wails in the dark..."; }
                        else if (roll < 0.9) { file = "EntityBloodGolem"; warn = "§cA BLOOD GOLEM rises!"; }
                        if (file) {
                            import("../entity/" + file + ".js").then(m => {
                                const id = Date.now() % 100000 + Math.floor(Math.random() * 1000);
                                const myth = new m.default(this.rayancraft, this, id);
                                myth.isMyth = true;
                                myth.setPosition(sx + 0.5, sy + 1, sz + 0.5);
                                this.addEntity(myth);
                                this.rayancraft.addMessageToChat(warn);
                            }).catch(() => { });
                        }
                    }
                    // Mythical creatures wave 2 (encyclopedia bestiary): Null, White Enderman, Watcher, Shadow Steve
                    if (myths < 2 && Math.random() < 0.02) {
                        const roll = Math.random();
                        let file = null, warn = "";
                        if (night && roll < 0.3) { file = "EntityNull"; warn = "§8NULL corrupts the world..."; }
                        else if (night && roll < 0.55) { file = "EntityWhiteEnderman"; warn = "§fA pale glow approaches..."; }
                        else if (night && roll < 0.78) { file = "EntityWatcher"; warn = "§9THE WATCHER observes you."; }
                        else if (roll < 0.92) { file = "EntityShadowSteve"; warn = "§8Your shadow moves on its own..."; }
                        if (file) {
                            import("../entity/" + file + ".js").then(m => {
                                const id = Date.now() % 100000 + Math.floor(Math.random() * 1000);
                                const myth = new m.default(this.rayancraft, this, id);
                                myth.isMyth = true;
                                myth.setPosition(sx + 0.5, sy + 1, sz + 0.5);
                                this.addEntity(myth);
                                this.rayancraft.addMessageToChat(warn);
                            }).catch(() => { });
                        }
                    }
                }
            }
            // AI companions: empty multiplayer lobbies get bots so you never play alone
            if (this.rayancraft.player && !(this.rayancraft.isSingleplayer && this.rayancraft.isSingleplayer())) {
                let humans = 0, bots = 0;
                for (const e of this.entities) {
                    if (e.constructor.name === "EntityBot") bots++;
                    else if (e.constructor.name === "PlayerEntityMultiplayer" || e === this.rayancraft.player) humans++;
                }
                if (humans <= 1 && bots < 2 && Math.random() < 0.01) {
                    import("../entity/EntityBot.js").then(m => {
                        const id = Date.now() % 100000 + Math.floor(Math.random() * 1000);
                        const bot = new m.default(this.rayancraft, this, id);
                        const p = this.rayancraft.player;
                        bot.setPosition(p.x + 2, p.y + 1, p.z + 2);
                        this.addEntity(bot);
                        this.rayancraft.addMessageToChat("§e" + bot.username + " joined the game");
                    }).catch(() => { });
                }
            }
        } catch (e) { }
    }

    getChunkAt(x, z) {
        return this.chunkProvider.getChunkAt(x, z);
    }

    getChunkAtBlock(x, y, z) {
        return this.getChunkAt(x >> 4, z >> 4).getSection(y >> 4);
    }

    getCollisionBoxes(region) {
        let boundingBoxList = [];

        let minX = MathHelper.floor(region.minX);
        let maxX = MathHelper.floor(region.maxX + 1.0);
        let minY = MathHelper.floor(region.minY);
        let maxY = MathHelper.floor(region.maxY + 1.0);
        let minZ = MathHelper.floor(region.minZ);
        let maxZ = MathHelper.floor(region.maxZ + 1.0);

        for (let x = minX; x < maxX; x++) {
            for (let y = minY; y < maxY; y++) {
                for (let z = minZ; z < maxZ; z++) {
                    if (this.isSolidBlockAt(x, y, z)) {
                        boundingBoxList.push(new BoundingBox(x, y, z, x + 1, y + 1, z + 1));
                    }
                }
            }
        }
        return boundingBoxList;
    }

    updateLights() {
        let scope = this;

        if (this.lightUpdateQueue.length < 10) {
            // Update lights in queue
            let i = 10;
            while (scope.lightUpdateQueue.length > 0) {
                if (i <= 0) {
                    return true;
                }

                let meta = scope.lightUpdateQueue.shift();
                meta.updateBlockLightning(scope);
                i--;
            }
        }
        return false;
    }

    updateLight(sourceType, x1, y1, z1, x2, y2, z2, notifyNeighbor = true) {
        let centerX = (x2 + x1) / 2;
        let centerZ = (z2 + z1) / 2;

        if (!this.blockExists(centerX, 64, centerZ)) {
            return;
        }

        let size = this.lightUpdateQueue.length;

        if (notifyNeighbor) {
            let max = 4;
            if (max > size) {
                max = size;
            }
            for (let i = 0; i < max; i++) {
                let meta = this.lightUpdateQueue[(this.lightUpdateQueue.length - i - 1)];
                if (meta.type === sourceType && meta.isOutsideOf(x1, y1, z1, x2, y2, z2)) {
                    return;
                }
            }
        }

        let centerChunk = this.getChunkAt(centerX >> 4, centerZ >> 4);
        if (!centerChunk.loaded) {
            return;
        }

        // Skip if section has no blocks
        let section1 = this.getChunkSectionAt(x1 >> 4, y1 >> 4, z1 >> 4);
        let section2 = this.getChunkSectionAt(x2 >> 4, y2 >> 4, z2 >> 4);
        if (section1 === section2 && section1.isEmpty()) {
            return;
        }

        // Add light update region to queue
        if (this.lightUpdateQueue.length < 9999) {
            this.lightUpdateQueue.push(new MetadataChunkBlock(sourceType, x1, y1, z1, x2, y2, z2));
        }

        // Max light updates in queue
        if (this.lightUpdateQueue.length > 10000) {
            this.lightUpdateQueue = [];
        }
    }

    blockExists(x, y, z) {
        if (y < 0 || y >= World.TOTAL_HEIGHT) {
            return false;
        } else {
            return this.chunkExists(x >> 4, z >> 4);
        }
    }

    chunkExists(chunkX, chunkZ) {
        return this.chunkProvider !== null && this.chunkProvider.chunkExists(chunkX, chunkZ);
    }

    neighborLightPropagationChanged(sourceType, x, y, z, level) {
        if (!this.blockExists(x, y, z)) {
            return;
        }
        if (sourceType === EnumSkyBlock.SKY) {
            if (this.isAboveGround(x, y, z)) {
                level = 15;
            }
        } else if (sourceType === EnumSkyBlock.BLOCK) {
            let typeId = this.getBlockAt(x, y, z);
            let block = Block.getById(typeId);
            let blockLight = typeId === 0 ? 0 : block.getLightValue();

            if (blockLight > level) {
                level = blockLight;
            }
        }
        if (this.getSavedLightValue(sourceType, x, y, z) !== level) {
            this.updateLight(sourceType, x, y, z, x, y, z);
        }
    }

    /**
     * Get the first non-solid block
     */
    getHeightAt(x, z) {
        if (!this.chunkExists(x >> 4, z >> 4)) {
            return 0;
        }
        return this.getChunkAt(x >> 4, z >> 4).getHeightAt(x & 15, z & 15);
    }

    /**
     * Get the highest solid block
     */
    getHighestBlockAt(x, z) {
        if (!this.chunkExists(x >> 4, z >> 4)) {
            return 0;
        }
        return this.getChunkAt(x >> 4, z >> 4).getHighestBlockAt(x & 15, z & 15);
    }

    /**
     * Is the highest solid block or above
     */
    isHighestBlock(x, y, z) {
        let chunk = this.getChunkAt(x >> 4, z >> 4)
        return chunk.isHighestBlock(x & 15, y, z & 15);
    }

    /**
     * Is above the highest solid block
     */
    isAboveGround(x, y, z) {
        let chunk = this.getChunkAt(x >> 4, z >> 4)
        return chunk.isAboveGround(x & 15, y, z & 15);
    }

    getTotalLightAt(x, y, z) {
        if (!this.blockExists(x, y, z)) {
            return 15;
        }

        let section = this.getChunkSectionAt(x >> 4, y >> 4, z >> 4)
        return section.getTotalLightAt(x & 15, y & 15, z & 15);
    }

    getSavedLightValue(sourceType, x, y, z) {
        if (!this.blockExists(x, y, z)) {
            return 15;
        }

        let section = this.getChunkSectionAt(x >> 4, y >> 4, z >> 4)
        return section.getLightAt(sourceType, x & 15, y & 15, z & 15);
    }

    setLightAt(sourceType, x, y, z, lightLevel) {
        if (!this.chunkExists(x >> 4, z >> 4)) {
            return;
        }

        let section = this.getChunkSectionAt(x >> 4, y >> 4, z >> 4)
        section.setLightAt(sourceType, x & 15, y & 15, z & 15, lightLevel);

        // Rebuild chunk
        this.onBlockChanged(x, y, z);
    }

    isSolidBlockAt(x, y, z) {
        let typeId = this.getBlockAt(x, y, z);
        if (typeId === 0) {
            return false;
        }

        let block = Block.getById(typeId);
        return block !== null && block.isSolid();
    }

    isTranslucentBlockAt(x, y, z) {
        let typeId = this.getBlockAt(x, y, z);
        return typeId === 0 || Block.getById(typeId).isTranslucent();
    }

    setBlockAt(x, y, z, type) {
        let chunk = this.getChunkAt(x >> 4, z >> 4);
        chunk.setBlockAt(x & 15, y, z & 15, type);

        // Rebuild chunk
        this.onBlockChanged(x, y, z);
    }

    setBlockDataAt(x, y, z, data) {
        this.getChunkAt(x >> 4, z >> 4).setBlockDataAt(x & 15, y, z & 15, data);
    }

    getBlockAt(x, y, z) {
        let chunkSection = this.getChunkAtBlock(x, y, z);
        return chunkSection == null ? 0 : chunkSection.getBlockAt(x & 15, y & 15, z & 15);
    }

    getBlockDataAt(x, y, z) {
        let chunkSection = this.getChunkAtBlock(x, y, z);
        return chunkSection == null ? 0 : chunkSection.getBlockDataAt(x & 15, y & 15, z & 15);
    }

    getBlockAtFace(x, y, z, face) {
        return this.getBlockAt(x + face.x, y + face.y, z + face.z);
    }

    getChunkSectionAt(chunkX, layerY, chunkZ) {
        return this.getChunkAt(chunkX, chunkZ).getSection(layerY);
    }

    onBlockChanged(x, y, z) {
        this.setModified(x - 1, y - 1, z - 1, x + 1, y + 1, z + 1);
    }

    setModified(minX, minY, minZ, maxX, maxY, maxZ) {
        // To chunk coordinates
        minX = minX >> 4;
        maxX = maxX >> 4;
        minY = minY >> 4;
        maxY = maxY >> 4;
        minZ = minZ >> 4;
        maxZ = maxZ >> 4;

        // Minimum and maximum y
        minY = Math.max(0, minY);
        maxY = Math.min(15, maxY);

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                for (let z = minZ; z <= maxZ; z++) {
                    if (this.chunkExists(x, z)) {
                        this.getChunkSectionAt(x, y, z).isModified = true;
                    }
                }
            }
        }
    }

    rayTraceBlocks(from, to) {
        let toX = MathHelper.floor(to.x);
        let toY = MathHelper.floor(to.y);
        let toZ = MathHelper.floor(to.z);

        let x = MathHelper.floor(from.x);
        let y = MathHelper.floor(from.y);
        let z = MathHelper.floor(from.z);

        let blockId = this.getBlockAt(x, y, z);
        let block = Block.getById(blockId);

        if (block != null && block.canInteract()) {
            let hit = block.collisionRayTrace(this, x, y, z, from, to);
            if (hit != null) {
                return hit;
            }
        }

        let lastHit = null;

        let counter = 200;
        while (counter-- >= 0) {
            if (x === toX && y === toY && z === toZ) {
                return lastHit;
            }

            let hitX = true;
            let hitY = true;
            let hitZ = true;

            let nearestX1 = 999.0;
            let nearestY1 = 999.0;
            let nearestZ1 = 999.0;

            if (toX > x) {
                nearestX1 = x + 1.0;
            } else if (toX < x) {
                nearestX1 = x;
            } else {
                hitX = false;
            }

            if (toY > y) {
                nearestY1 = y + 1.0;
            } else if (toY < y) {
                nearestY1 = y;
            } else {
                hitY = false;
            }

            if (toZ > z) {
                nearestZ1 = z + 1.0;
            } else if (toZ < z) {
                nearestZ1 = z;
            } else {
                hitZ = false;
            }

            let nearestX = 999.0;
            let nearestY = 999.0;
            let nearestZ = 999.0;

            let diffX = to.x - from.x;
            let diffY = to.y - from.y;
            let diffZ = to.z - from.z;

            if (hitX) {
                nearestX = (nearestX1 - from.x) / diffX;
            }
            if (hitY) {
                nearestY = (nearestY1 - from.y) / diffY;
            }
            if (hitZ) {
                nearestZ = (nearestZ1 - from.z) / diffZ;
            }

            if (nearestX === -0.0) {
                nearestX = -1.0E-4;
            }
            if (nearestY === -0.0) {
                nearestY = -1.0E-4;
            }
            if (nearestZ === -0.0) {
                nearestZ = -1.0E-4;
            }

            let face;
            if (nearestX < nearestY && nearestX < nearestZ) {
                face = toX > x ? EnumBlockFace.WEST : EnumBlockFace.EAST;
                from = new Vector3(nearestX1, from.y + diffY * nearestX, from.z + diffZ * nearestX);
            } else if (nearestY < nearestZ) {
                face = toY > y ? EnumBlockFace.BOTTOM : EnumBlockFace.TOP;
                from = new Vector3(from.x + diffX * nearestY, nearestY1, from.z + diffZ * nearestY);
            } else {
                face = toZ > z ? EnumBlockFace.NORTH : EnumBlockFace.SOUTH;
                from = new Vector3(from.x + diffX * nearestZ, from.y + diffY * nearestZ, nearestZ1);
            }

            x = MathHelper.floor(from.x) - (face === EnumBlockFace.EAST ? 1 : 0);
            y = MathHelper.floor(from.y) - (face === EnumBlockFace.TOP ? 1 : 0);
            z = MathHelper.floor(from.z) - (face === EnumBlockFace.SOUTH ? 1 : 0);

            let blockId = this.getBlockAt(x, y, z);
            let block = Block.getById(blockId);

            if (block != null && block.canInteract()) {
                let hit = block.collisionRayTrace(this, x, y, z, from, to);
                if (hit != null) {
                    return hit;
                }
            }
        }

        return lastHit;
    }

    getCelestialAngle(partialTicks) {
        return MathHelper.calculateCelestialAngle(this.time, partialTicks);
    }

    getTemperature(x, y, z) {
        if (typeof y !== "number") { z = y; }
        // Pure biome temperature: continent + detail
        const continent = Math.sin(x * 0.004) * Math.cos((z || 0) * 0.004);
        const detail = Math.sin(x * 0.02 + 1.7) * Math.cos((z || 0) * 0.02 - 0.6);
        return 0.75 + continent * 0.55 + detail * 0.25;
    }

    getHumidity(x, y, z) {
        if (typeof y !== "number") { z = y; }
        const c = Math.sin(x * 0.003 - 0.8) * Math.cos((z || 0) * 0.005 + 0.4);
        const d = Math.sin(x * 0.017 + 0.3) * Math.cos((z || 0) * 0.019);
        return 0.55 + c * 0.35 + d * 0.2;
    }

    getBiomeName(x, z) {
        const t = this.getTemperature(x, z);
        const h = this.getHumidity(x, z);
        if (t < 0.3) return "Snowy Tundra";
        if (t > 1.3 && h < 0.3) return "Desert";
        if (t > 0.95 && h > 0.85) return "Jungle";
        if (t > 0.8 && h > 0.7) return "Swamp";
        if (h > 0.82 && t > 0.45 && t < 0.85) return "Cherry Grove";
        if (t > 0.85 && h >= 0.25 && h < 0.5) return "Mountains";
        if (h > 0.6) return "Forest";
        if (h < 0.25 && t > 0.7) return "Desert";
        return "Plains";
    }

    getSkyColor(x, z, partialTicks) {
        let angle = this.getCelestialAngle(partialTicks);
        let brightness = Math.cos(angle * 3.141593 * 2.0) * 2.0 + 0.5;

        if (brightness < 0.0) {
            brightness = 0.0;
        }
        if (brightness > 1.0) {
            brightness = 1.0;
        }

        let temperature = this.getTemperature(x, z);
        let rgb = this.getSkyColorByTemp(temperature);

        let red = (rgb >> 16 & 0xff) / 255;
        let green = (rgb >> 8 & 0xff) / 255;
        let blue = (rgb & 0xff) / 255;

        red *= brightness;
        green *= brightness;
        blue *= brightness;

        // Blood Moon: red sky (pure dread)
        if (this.bloodMoon) {
            red = Math.min(1, red * 0.4 + 0.55);
            green *= 0.35;
            blue *= 0.35;
        }

        return new Vector3(red, green, blue);
    }

    getFogColor(partialTicks) {
        let angle = this.getCelestialAngle(partialTicks);
        let rotation = Math.cos(angle * Math.PI * 2.0) * 2.0 + 0.5;
        rotation = MathHelper.clamp(rotation, 0.0, 1.0);

        let x = 0.7529412;
        let y = 0.84705883;
        let z = 1.0;

        x = x * (rotation * 0.94 + 0.06);
        y = y * (rotation * 0.94 + 0.06);
        z = z * (rotation * 0.91 + 0.09);

        return new Vector3(x, y, z);
    }

    getSunriseSunsetColor(partialTicks) {
        let angle = this.getCelestialAngle(partialTicks);
        let rotation = Math.cos(angle * Math.PI * 2.0);

        let min = 0;
        let max = 0.4;

        // Check if rotation is inside of sunrise or sunset
        if (rotation >= -max && rotation <= max) {
            let factor = ((rotation - min) / max) * 0.5 + 0.5;
            let strength = Math.pow(1.0 - (1.0 - Math.sin(factor * Math.PI)) * 0.99, 2);

            // Calculate colors for sunrise and sunset
            return new Vector4(
                factor * 0.3 + 0.7,
                factor * factor * 0.7 + 0.2,
                0.2,
                strength
            );
        } else {
            return null;
        }
    }

    getStarBrightness(partialTicks) {
        let angle = this.getCelestialAngle(partialTicks);
        let rotation = 1.0 - (Math.cos(angle * Math.PI * 2.0) * 2.0 + 0.75);
        rotation = MathHelper.clamp(rotation, 0.0, 1.0);
        return rotation * rotation * 0.5;
    }

    getLightBrightnessForEntity(entity) {
        let level = this.getTotalLightAt(Math.floor(entity.x), Math.floor(entity.y), Math.floor(entity.z));
        return Math.max(level / 15, 0.1);
    }

    getLightBrightness(x, y, z) {
        let level = this.getTotalLightAt(x, y, z);
        return Math.max(level / 15, 0.1);
    }

    getSkyColorByTemp(temperature) {
        temperature /= 3;
        if (temperature < -1) {
            temperature = -1;
        }
        if (temperature > 1.0) {
            temperature = 1.0;
        }
        return MathHelper.hsbToRgb(0.6222222 - temperature * 0.05, 0.5 + temperature * 0.1, 1.0);
    }

    calculateSkylightSubtracted(partialTicks) {
        let angle = this.getCelestialAngle(partialTicks);
        let level = 1.0 - (Math.cos(angle * 3.141593 * 2.0) * 2.0 + 0.5);
        if (level < 0.0) {
            level = 0.0;
        }
        if (level > 1.0) {
            level = 1.0;
        }
        return Math.floor(level * 11);
    }

    addEntity(entity) {
        this.entities.push(entity);
        entity.initRenderer();
        this.group.add(entity.renderer.group);
    }

    removeEntityById(id) {
        let entity = this.getEntityById(id);
        if (entity !== null) {
            this.entities.splice(this.entities.indexOf(entity), 1);
            this.group.remove(entity.renderer.group);
        }
    }

    getEntityById(id) {
        for (let entity of this.entities) {
            if (entity.id === id) {
                return entity;
            }
        }
        return null;
    }

    getSpawn() {
        return this.spawn;
    }

    setSpawn(x, z) {
        let y = this.getHeightAt(x, z);
        this.spawn = new Vector3(x, y + 8, z);
    }

    loadSpawnChunks() {
        let viewDistance = this.rayancraft.settings.viewDistance;
        for (let x = -viewDistance; x <= viewDistance; x++) {
            for (let z = -viewDistance; z <= viewDistance; z++) {
                this.getChunkAt(x + this.spawn.x >> 4, z + this.spawn.z >> 4);
            }
        }
        this.spawn.y = this.getHeightAt(this.spawn.x, this.spawn.z) + 8;
    }

    getChunkProvider() {
        return this.chunkProvider;
    }

    clearEntities() {
        for (let entity of this.entities) {
            this.removeEntityById(entity.id);
        }
    }

}