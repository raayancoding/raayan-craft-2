import EntityMob from "./EntityMob.js";

// Loyal dog: follows you, teleports when lost, and bites whatever hunts you.
export default class EntityDog extends EntityMob {
    static name = "EntityDog";
    static mobTint = 0x9a6a3a;
    static mobModel = "pig";
    static mobScale = 0.8;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.width = 0.7; this.height = 0.8;
        this.health = 20; this.maxHealth = 20;
        this.moveSpeed = 0.12;
        this.attackCooldown = 0;
        this.isPet = true;
    }
    onLivingUpdate() {
        const p = this.rayancraft.player;
        if (p && p.isAlive() && !p.isDead) {
            // Guard: attack nearest hostile near the player
            let foe = null, foeD = 7;
            try {
                for (const e of this.world.entities) {
                    if (e === p || e === this || e.isDead || e.isPet || e.isBot) continue;
                    if (!/Zombie|303|Golem|Alex|Siren|Herobrine/.test(e.constructor.name)) continue;
                    const d = Math.hypot(e.x - p.x, e.z - p.z);
                    if (d < foeD) { foe = e; foeD = d; }
                }
            } catch (e) { }
            if (foe) {
                const dx = foe.x - this.x, dz = foe.z - this.z;
                this.targetYaw = Math.atan2(dz, dx) * 180 / Math.PI + 90;
                this.moveForward = 1; this.wanderTimer = 10;
                if (foeD < 1.6 && this.attackCooldown <= 0) {
                    this.attackCooldown = 15;
                    foe.damage(3, "generic");
                    this.swingArm();
                }
            } else {
                // Follow owner like the bots
                const dx = p.x - this.x, dz = p.z - this.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist > 4) {
                    this.targetYaw = Math.atan2(dz, dx) * 180 / Math.PI + 90;
                    this.moveForward = 1; this.wanderTimer = 10;
                    if (dist > 24) {
                        try {
                            const ny = this.world.getHeightAt(Math.floor(p.x), Math.floor(p.z));
                            this.setPosition(p.x - 1, ny + 1, p.z - 1);
                            this.motionX = this.motionY = this.motionZ = 0;
                        } catch (e) { }
                    }
                } else this.moveForward = 0;
            }
        }
        if (this.attackCooldown > 0) this.attackCooldown--;
        super.onLivingUpdate();
    }
}
