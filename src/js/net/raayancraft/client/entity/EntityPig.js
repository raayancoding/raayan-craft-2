import EntityMob from "./EntityMob.js";

export default class EntityPig extends EntityMob {
    static name = "EntityPig";
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.width = 0.9; this.height = 0.9;
        this.health = 10; this.maxHealth = 10;
        this.moveSpeed = 0.06;
    }
}
