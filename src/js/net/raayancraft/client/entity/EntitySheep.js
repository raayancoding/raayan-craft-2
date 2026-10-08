import EntityAnimal from "./EntityAnimal.js";

export default class EntitySheep extends EntityAnimal {
    static name = "EntitySheep";
    static mobTint = 0xe8e8e8;
    static mobScale = 0.95;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.width = 0.9; this.height = 1.2;
        this.health = 8; this.maxHealth = 8;
        this.moveSpeed = 0.055;
    }
}
