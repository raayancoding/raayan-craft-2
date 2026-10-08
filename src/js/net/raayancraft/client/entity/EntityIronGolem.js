import EntityMob from "./EntityMob.js";

// Iron Golem: gentle protector. Crushes whatever hunts villagers and you.
export default class EntityIronGolem extends EntityMob {
    static name = "EntityIronGolem";
    static mobTint = 0xc8c8c8;
    static mobScale = 1.4;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.width = 1.1; this.height = 2.6;
        this.health = 100; this.maxHealth = 100;
        this.moveSpeed = 0.07;
        this.attackCooldown = 0;
    }
    onLivingUpdate() {
        // Guard: smash nearest hostile to any villager, bot, dog or player
        let foe = null, foeD = 10;
        try {
            const friends = [];
            for (const e of this.world.entities) {
                if (/Villager|Bot|Dog|Player/.test(e.constructor.name) && !e.isDead) friends.push(e);
            }
            for (const e of this.world.entities) {
                if (e === this || e.isDead || e.isPet || e.isBot) continue;
                if (!/Zombie|303|Golem|Alex|Siren|Herobrine|Creeper|Skeleton|Enderman|Null|Watcher|Shadow|White/.test(e.constructor.name)) continue;
                for (const f of friends) {
                    const d = Math.hypot(e.x - f.x, e.z - f.z);
                    if (d < 8 && d < foeD) { foe = e; foeD = d; }
                }
            }
        } catch (e) { }
        if (foe) {
            const dx = foe.x - this.x, dz = foe.z - this.z;
            this.targetYaw = Math.atan2(dz, dx) * 180 / Math.PI + 90;
            this.moveForward = 1; this.wanderTimer = 10;
            if (foeD < 2.4 && this.attackCooldown <= 0) {
                this.attackCooldown = 18;
                foe.damage(12, "generic");
                this.swingArm();
            }
        }
        if (this.attackCooldown > 0) this.attackCooldown--;
        super.onLivingUpdate();
    }
}
