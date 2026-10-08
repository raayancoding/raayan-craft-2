import EntityAnimal from "./EntityAnimal.js";

export default class EntityCow extends EntityAnimal {
    static name = "EntityCow";
    static mobTint = 0x6a4a32;
    static mobScale = 1.0;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.width = 0.9; this.height = 1.3;
        this.health = 10; this.maxHealth = 10;
        this.moveSpeed = 0.06;
    }
}
