import EntityZombie from "./EntityZombie.js";

// Entity 303: nightmare hacker myth. Teleports around the player at night.
export default class Entity303 extends EntityZombie {
    static name = "Entity303";
    static mobTint = 0x3a3a55;
    static mobGlow = true;
    static mobScale = 1.1;
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.health = 50; this.maxHealth = 50;
        this.moveSpeed = 0.12;
        this.damageAmount = 6;
        this.attackReach = 2.2;
        this.burnInDaylight = false;
        this.teleportTimer = 60;
    }
    onLivingUpdate() {
        const p = this.rayancraft.player;
        if (p && p.isAlive() && !p.isDead && this.teleportTimer-- <= 0) {
            this.teleportTimer = 80 + Math.floor(Math.random() * 80);
            // Blink to a spot near the player (pure 303 jumpscare movement)
            const a = Math.random() * Math.PI * 2;
            const r = 4 + Math.random() * 4;
            const nx = Math.floor(p.x + Math.cos(a) * r);
            const nz = Math.floor(p.z + Math.sin(a) * r);
            try {
                const ny = this.world.getHeightAt(nx, nz);
                if (ny > 0 && this.world.getBlockAt(nx, ny, nz) === 0) {
                    this.setPosition(nx + 0.5, ny + 1, nz + 0.5);
                    this.motionX = this.motionY = this.motionZ = 0;
                }
            } catch (e) { }
        }
        super.onLivingUpdate();
    }
}
