import EntityZombie from "./EntityZombie.js";

// Herobrine: rare night stalker. Fast, hits hard, never burns.
export default class EntityHerobrine extends EntityZombie {
    static name = "EntityHerobrine";
    static mobTint = 0xe8e8e8;
    static mobScale = 1.05;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.health = 40; this.maxHealth = 40;
        this.moveSpeed = 0.11;
        this.damageAmount = 5;
        this.burnInDaylight = false;
    }
}
