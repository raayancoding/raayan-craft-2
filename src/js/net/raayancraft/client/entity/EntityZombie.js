import EntityMob from "./EntityMob.js";

export default class EntityZombie extends EntityMob {
    static name = "EntityZombie";
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.width = 0.6; this.height = 1.8;
        this.health = 20; this.maxHealth = 20;
        this.moveSpeed = 0.08;
        this.attackCooldown = 0;
        this.damageAmount = 3;
        this.attackReach = 1.8;
        this.burnInDaylight = true;
    }
    onLivingUpdate() {
        // Hunt player
        const p = this.rayancraft.player;
        if (p && p.isAlive() && !p.isDead) {
            const dx = p.x - this.x, dz = p.z - this.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < 16) {
                this.targetYaw = Math.atan2(dz, dx) * 180 / Math.PI + 90;
                this.moveForward = 1;
                this.wanderTimer = 20;
                // Attack
                if (dist < (this.attackReach || 1.8) && Math.abs(p.y - this.y) < 2.5) {
                    if (this.attackCooldown <= 0) {
                        this.attackCooldown = 20;
                        p.damage(this.damageAmount || 3, "generic");
                        this.swingArm();
                    }
                }
            }
        }
        if (this.attackCooldown > 0) this.attackCooldown--;
        // Burn in daylight (pure)
        try {
            if (this.burnInDaylight === false) return super.onLivingUpdate();
            const t = this.world.time % 24000;
            const day = t < 12000;
            if (day) {
                const bx = Math.floor(this.x), by = Math.floor(this.y), bz = Math.floor(this.z);
                if (this.world.getTotalLightAt && this.world.getTotalLightAt(bx, by + 1, bz) > 12) {
                    if (Math.random() < 0.05) this.damage(1, "generic");
                }
            }
        } catch (e) { }
        super.onLivingUpdate();
    }
}
