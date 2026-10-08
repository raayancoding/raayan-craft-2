import EntityAnimal from "./EntityAnimal.js";

export default class EntityChicken extends EntityAnimal {
    static name = "EntityChicken";
    static mobTint = 0xf0f0f0;
    static mobScale = 0.5;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.width = 0.5; this.height = 0.7;
        this.health = 4; this.maxHealth = 4;
        this.moveSpeed = 0.07;
    }
    // Chickens fall slowly (pure flutter)
    travel(f, v, s) {
        super.travel(f, v, s);
        if (this.motionY < -0.1) this.motionY = -0.1;
    }
}
