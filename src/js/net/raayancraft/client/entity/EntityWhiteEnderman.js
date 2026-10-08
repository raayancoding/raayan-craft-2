import EntityEnderman from "./EntityEnderman.js";

// White Enderman: pale glowing variant. Teleports constantly, calls an ally once.
export default class EntityWhiteEnderman extends EntityEnderman {
    static name = "EntityWhiteEnderman";
    static mobTint = 0xf0f0ff;
    static mobGlow = true;
    static mobScale = 1.1;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.health = 50; this.maxHealth = 50;
        this.damageAmount = 6;
        this.summonedAlly = false;
    }
    onLivingUpdate() {
        // Pearl of Light bearer: summon one ally the first time it hunts
        if (this.aggro && !this.summonedAlly) {
            this.summonedAlly = true;
            try {
                import("./EntityZombie.js").then(m => {
                    const id = Date.now() % 100000 + Math.floor(Math.random() * 1000);
                    const z = new m.default(this.rayancraft, this.world, id);
                    z.setPosition(this.x + 2, this.y + 1, this.z + 2);
                    this.world.addEntity(z);
                    this.rayancraft.addMessageToChat("§fThe White Enderman calls an ally!");
                }).catch(() => { });
            } catch (e) { }
        }
        super.onLivingUpdate();
    }
}
