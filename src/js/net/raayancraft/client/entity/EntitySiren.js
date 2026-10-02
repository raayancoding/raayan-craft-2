import EntityZombie from "./EntityZombie.js";

// The Siren: tall thin wailer of the night. Screech shakes the screen (FOV kick).
export default class EntitySiren extends EntityZombie {
    static name = "EntitySiren";
    static mobTint = 0x4a4a52;
    static mobScale = 1.6;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.width = 0.7; this.height = 2.9;
        this.health = 45; this.maxHealth = 45;
        this.moveSpeed = 0.09;
        this.damageAmount = 5;
        this.attackReach = 2.6;
        this.screechTimer = 120;
    }
    onLivingUpdate() {
        const p = this.rayancraft.player;
        if (p && p.isAlive() && !p.isDead) {
            const dx = p.x - this.x, dz = p.z - this.z;
            if (Math.sqrt(dx * dx + dz * dz) < 12 && this.screechTimer-- <= 0) {
                this.screechTimer = 200 + Math.floor(Math.random() * 120);
                // Screech: brief FOV punch + small damage (pure horror)
                try {
                    if (typeof p.setFOVModifier === "function") p.setFOVModifier(14);
                    p.damage(2, "generic");
                    this.rayancraft.addMessageToChat("§8You hear a distant siren...");
                } catch (e) { }
            }
        }
        super.onLivingUpdate();
    }
}
