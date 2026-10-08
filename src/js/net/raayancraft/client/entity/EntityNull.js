import EntityZombie from "./EntityZombie.js";

// Null: void corruption. Eats blocks, glitches around, drops Fragment of Nothingness (XP).
export default class EntityNull extends EntityZombie {
    static name = "EntityNull";
    static mobTint = 0x0a0a0a;
    static mobGlow = true;
    static mobScale = 1.05;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.health = 45; this.maxHealth = 45;
        this.moveSpeed = 0.1;
        this.damageAmount = 6;
        this.burnInDaylight = false;
        this.deleteTimer = 100;
    }
    onLivingUpdate() {
        // Void corruption: delete nearby blocks (never bedrock)
        if (this.deleteTimer-- <= 0) {
            this.deleteTimer = 120 + Math.floor(Math.random() * 80);
            try {
                const cx = Math.floor(this.x), cy = Math.floor(this.y), cz = Math.floor(this.z);
                for (let i = 0; i < 4; i++) {
                    const ox = Math.floor(Math.random() * 7 - 3), oy = Math.floor(Math.random() * 5 - 2), oz = Math.floor(Math.random() * 7 - 3);
                    const b = this.world.getBlockAt(cx + ox, cy + oy, cz + oz);
                    if (b !== 0 && b !== 7) {
                        this.world.setBlockAt(cx + ox, cy + oy, cz + oz, 0);
                        try { this.rayancraft.particleRenderer.spawnBlockBreakParticle(this.world, cx + ox, cy + oy, cz + oz); } catch (e) { }
                    }
                }
                // Glitch-blink
                const nx = Math.floor(this.x + Math.random() * 12 - 6);
                const nz = Math.floor(this.z + Math.random() * 12 - 6);
                const ny = this.world.getHeightAt(nx, nz);
                if (ny > 0) this.setPosition(nx + 0.5, ny + 1, nz + 0.5);
            } catch (e) { }
        }
        super.onLivingUpdate();
    }
}
