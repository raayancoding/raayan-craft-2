import EntityZombie from "./EntityZombie.js";

// Giant Alex: towering distorted Alex. Long arms, long reach, relentless.
export default class EntityGiantAlex extends EntityZombie {
    static name = "EntityGiantAlex";
    static mobTint = 0xd88a4a;
    static mobScale = 1.8;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.width = 0.9; this.height = 3.2;
        this.health = 80; this.maxHealth = 80;
        this.moveSpeed = 0.085;
        this.damageAmount = 7;
        this.attackReach = 3.4;
        this.burnInDaylight = false;
    }
}
