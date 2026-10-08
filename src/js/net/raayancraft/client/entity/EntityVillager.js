import EntityMob from "./EntityMob.js";

// Villager: humble trader. Hrmm.
export default class EntityVillager extends EntityMob {
    static name = "EntityVillager";
    static mobTint = 0x8a5f4a;
    static mobScale = 0.95;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.width = 0.6; this.height = 1.8;
        this.health = 20; this.maxHealth = 20;
        this.moveSpeed = 0.05;
        this.hrmmTimer = 400 + Math.floor(Math.random() * 600);
    }
    onLivingUpdate() {
        if (this.hrmmTimer-- <= 0) {
            this.hrmmTimer = 800 + Math.floor(Math.random() * 800);
            try {
                const p = this.rayancraft.player;
                if (p && Math.hypot(p.x - this.x, p.z - this.z) < 10) {
                    this.rayancraft.addMessageToChat("<Villager> Hrmm! (trade with /trade)");
                }
            } catch (e) { }
        }
        super.onLivingUpdate();
    }
}
