import EntityZombie from "./EntityZombie.js";

// Skeleton: fast rattling archer (melee here). Burns in daylight.
export default class EntitySkeleton extends EntityZombie {
    static name = "EntitySkeleton";
    static mobTint = 0xd8d8d8;
    static mobScale = 0.98;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.health = 20; this.maxHealth = 20;
        this.moveSpeed = 0.105;
        this.damageAmount = 3;
        this.attackReach = 2.0;
    }
}
