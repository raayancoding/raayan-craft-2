import EntityZombie from "./EntityZombie.js";

// Watcher: cloaked observer. Stares, corrupts grass into dirt, summons shadows.
export default class EntityWatcher extends EntityZombie {
    static name = "EntityWatcher";
    static mobTint = 0x2a2a4a;
    static mobGlow = true;
    static mobScale = 1.2;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.health = 55; this.maxHealth = 55;
        this.moveSpeed = 0.06;
        this.damageAmount = 4;
        this.burnInDaylight = false;
        this.corruptTimer = 80;
        this.summonedShadow = false;
    }
    onLivingUpdate() {
        // Terrain corruption: grass -> dirt around it
        if (this.corruptTimer-- <= 0) {
            this.corruptTimer = 100;
            try {
                const cx = Math.floor(this.x), cy = Math.floor(this.y), cz = Math.floor(this.z);
                for (let i = 0; i < 6; i++) {
                    const ox = Math.floor(Math.random() * 9 - 4), oz = Math.floor(Math.random() * 9 - 4);
                    for (let oy = -2; oy <= 2; oy++) {
                        if (this.world.getBlockAt(cx + ox, cy + oy, cz + oz) === 2) {
                            this.world.setBlockAt(cx + ox, cy + oy, cz + oz, 3);
                            break;
                        }
                    }
                }
            } catch (e) { }
        }
        // Summon one shadow (zombie) at half health
        if (!this.summonedShadow && this.health < this.maxHealth / 2) {
            this.summonedShadow = true;
            try {
                import("./EntityZombie.js").then(m => {
                    const id = Date.now() % 100000 + Math.floor(Math.random() * 1000);
                    const z = new m.default(this.rayancraft, this.world, id);
                    z.setPosition(this.x - 2, this.y + 1, this.z - 2);
                    this.world.addEntity(z);
                    this.rayancraft.addMessageToChat("§9The Watcher summons a shadow...");
                }).catch(() => { });
            } catch (e) { }
        }
        super.onLivingUpdate();
    }
}
