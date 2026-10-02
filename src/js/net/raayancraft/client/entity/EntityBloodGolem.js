import EntityZombie from "./EntityZombie.js";

// Blood Golem: slow tank forged of blood and iron. Huge HP, crushing hits.
export default class EntityBloodGolem extends EntityZombie {
    static name = "EntityBloodGolem";
    static mobTint = 0xc02020;
    static mobScale = 1.35;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.width = 1.0; this.height = 2.4;
        this.health = 100; this.maxHealth = 100;
        this.moveSpeed = 0.055;
        this.damageAmount = 9;
        this.attackReach = 2.4;
        this.attackCooldown = 0;
    }
    onLivingUpdate() {
        super.onLivingUpdate();
        // Blood trail particles (pure dread)
        try {
            if (Math.random() < 0.3 && this.rayancraft.particleRenderer) {
                this.rayancraft.particleRenderer.spawnBlockBreakParticle(this.world, Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
            }
        } catch (e) { }
    }
}
