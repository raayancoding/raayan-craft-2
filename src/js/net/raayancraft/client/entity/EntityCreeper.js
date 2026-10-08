import EntityMob from "./EntityMob.js";

// Creeper: silent green hugger. Hiss... BOOM.
export default class EntityCreeper extends EntityMob {
    static name = "EntityCreeper";
    static mobTint = 0x4ac74a;
    static mobScale = 1.0;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.width = 0.6; this.height = 1.7;
        this.health = 20; this.maxHealth = 20;
        this.moveSpeed = 0.075;
        this.fuse = -1;
    }
    onLivingUpdate() {
        const p = this.rayancraft.player;
        if (p && p.isAlive() && !p.isDead) {
            const dx = p.x - this.x, dz = p.z - this.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < 14) {
                this.targetYaw = Math.atan2(dz, dx) * 180 / Math.PI + 90;
                this.moveForward = dist > 2.2 ? 1 : 0;
                this.wanderTimer = 10;
                if (dist < 3 && Math.abs(p.y - this.y) < 3 && this.fuse < 0) {
                    this.fuse = 30;
                    try { this.rayancraft.addMessageToChat("§aTsssss..."); } catch (e) { }
                }
            }
        }
        if (this.fuse >= 0) {
            this.moveForward = 0;
            if (this.fuse-- <= 0) this.explode();
        }
        super.onLivingUpdate();
    }
    explode() {
        try {
            const cx = Math.floor(this.x), cy = Math.floor(this.y), cz = Math.floor(this.z);
            for (let ox = -3; ox <= 3; ox++) for (let oy = -3; oy <= 3; oy++) for (let oz = -3; oz <= 3; oz++) {
                if (ox * ox + oy * oy + oz * oz > 9) continue;
                const b = this.world.getBlockAt(cx + ox, cy + oy, cz + oz);
                if (b !== 0 && b !== 7 && b !== 49) this.world.setBlockAt(cx + ox, cy + oy, cz + oz, 0);
            }
            for (const e of this.world.entities) {
                if (e === this || e.isDead) continue;
                const d = Math.hypot(e.x - this.x, (e.y - this.y), e.z - this.z);
                if (d < 5 && e.isAlive && e.isAlive() && !(e.gameMode === 1)) e.damage(Math.ceil(12 - d * 2), "generic");
            }
            for (let i = 0; i < 16; i++) {
                try { this.rayancraft.particleRenderer.spawnBlockBreakParticle(this.world, cx, cy + 1, cz); } catch (e) { }
            }
        } catch (e) { }
        this.health = 0;
        this.onDeath("generic");
    }
}
