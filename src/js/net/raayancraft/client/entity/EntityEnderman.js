import EntityZombie from "./EntityZombie.js";
import EntityMob from "./EntityMob.js";

// Enderman: tall neutral teleporting watcher. Don't stare at it.
export default class EntityEnderman extends EntityZombie {
    static name = "EntityEnderman";
    static mobTint = 0x1a1a22;
    static mobGlow = true;
    static mobScale = 1.15;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.width = 0.6; this.height = 2.6;
        this.health = 40; this.maxHealth = 40;
        this.moveSpeed = 0.1;
        this.damageAmount = 5;
        this.attackReach = 2.4;
        this.burnInDaylight = false;
        this.aggro = false;
        this.teleportTimer = 200;
    }
    onLivingUpdate() {
        const p = this.rayancraft.player;
        // Provoke by staring (crosshair within ~3 degrees, <24 blocks)
        if (!this.aggro && p && p.isAlive() && !p.isDead) {
            try {
                const look = p.getLook(1.0);
                const dx = (this.x - p.x), dy = ((this.y + 1.5) - (p.y + 1.5)), dz = (this.z - p.z);
                const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (d < 24) {
                    const dot = (dx * look.x + dy * look.y + dz * look.z) / (d || 1);
                    if (dot > 0.9985) {
                        this.aggro = true;
                        try { this.rayancraft.addMessageToChat("§5The Enderman stares back..."); } catch (e) { }
                    }
                }
            } catch (e) { }
        }
        // Random teleport (pure enderman)
        if (this.teleportTimer-- <= 0) {
            this.teleportTimer = 200 + Math.floor(Math.random() * 200);
            try {
                const nx = Math.floor(this.x + Math.random() * 24 - 12);
                const nz = Math.floor(this.z + Math.random() * 24 - 12);
                const ny = this.world.getHeightAt(nx, nz);
                if (ny > 0 && this.world.getBlockAt(nx, ny, nz) === 0) this.setPosition(nx + 0.5, ny + 1, nz + 0.5);
            } catch (e) { }
        }
        if (!this.aggro) {
            // Peaceful wander only (skip the zombie hunt)
            EntityMob.prototype.onLivingUpdate.call(this);
            return;
        }
        super.onLivingUpdate();
    }
    damage(amount, cause) {
        // Hitting it = instant aggro + blink away
        this.aggro = true;
        const r = super.damage(amount, cause);
        try {
            if (this.isAlive()) {
                const nx = Math.floor(this.x + Math.random() * 16 - 8);
                const nz = Math.floor(this.z + Math.random() * 16 - 8);
                const ny = this.world.getHeightAt(nx, nz);
                if (ny > 0) this.setPosition(nx + 0.5, ny + 1, nz + 0.5);
            }
        } catch (e) { }
        return r;
    }
}
