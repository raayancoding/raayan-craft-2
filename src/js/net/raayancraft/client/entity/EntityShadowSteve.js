import EntityZombie from "./EntityZombie.js";

// Shadow Steve: evil Steve variant. Fast, spawns an illusion, withers leaves.
export default class EntityShadowSteve extends EntityZombie {
    static name = "EntityShadowSteve";
    static mobTint = 0x222222;
    static mobScale = 1.0;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.health = 35; this.maxHealth = 35;
        this.moveSpeed = 0.115;
        this.damageAmount = 5;
        this.burnInDaylight = false;
        this.illusionSpawned = false;
        this.witherTimer = 90;
    }
    onLivingUpdate() {
        if (!this.illusionSpawned) {
            this.illusionSpawned = true;
            try {
                import("./EntityZombie.js").then(m => {
                    const id = Date.now() % 100000 + Math.floor(Math.random() * 1000);
                    const z = new m.default(this.rayancraft, this.world, id);
                    z.setPosition(this.x + 2, this.y + 1, this.z);
                    this.world.addEntity(z);
                    this.rayancraft.addMessageToChat("§8Shadow Steve splits into illusions!");
                }).catch(() => { });
            } catch (e) { }
        }
        // Corrupt leaves around it (pure blight)
        if (this.witherTimer-- <= 0) {
            this.witherTimer = 110;
            try {
                const cx = Math.floor(this.x), cy = Math.floor(this.y), cz = Math.floor(this.z);
                for (let i = 0; i < 4; i++) {
                    const ox = Math.floor(Math.random() * 7 - 3), oy = Math.floor(Math.random() * 5), oz = Math.floor(Math.random() * 7 - 3);
                    const b = this.world.getBlockAt(cx + ox, cy + oy, cz + oz);
                    if (b === 18 || b === 206) this.world.setBlockAt(cx + ox, cy + oy, cz + oz, 0);
                }
            } catch (e) { }
        }
        super.onLivingUpdate();
    }
}
