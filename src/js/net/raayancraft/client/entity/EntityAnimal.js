import EntityMob from "./EntityMob.js";

// Peaceful animals: wander, graze, and flee when hurt.
export default class EntityAnimal extends EntityMob {
    static mobModel = "pig";
    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.fleeTimer = 0;
    }
    damage(amount, cause) {
        const wasAlive = this.isAlive();
        const r = super.damage(amount, cause);
        if (wasAlive && this.isAlive()) {
            // Panic! Run away from everything
            this.fleeTimer = 60;
            this.targetYaw = Math.random() * 360;
            this.moveForward = 1;
            this.jumping = true;
        }
        return r;
    }
    onLivingUpdate() {
        if (this.fleeTimer > 0) {
            this.fleeTimer--;
            this.moveForward = 1;
            if (Math.random() < 0.1) this.targetYaw = Math.random() * 360;
        }
        super.onLivingUpdate();
    }
}
