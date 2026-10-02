import EntityLiving from "./EntityLiving.js";
import MathHelper from "../../util/MathHelper.js";

export default class EntityMob extends EntityLiving {

    constructor(rayancraft, world, id) {
        super(rayancraft, world, id);
        this.wanderTimer = 0;
        this.targetYaw = 0;
        this.moveSpeed = 0.05;
    }

    onLivingUpdate() {
        // Simple wander AI
        if (this.wanderTimer <= 0) {
            this.wanderTimer = 40 + Math.floor(Math.random() * 80);
            this.targetYaw = Math.random() * 360;
            this.moveForward = Math.random() < 0.7 ? 1 : 0;
        } else {
            this.wanderTimer--;
        }
        let diff = MathHelper.wrapAngleTo180(this.targetYaw - this.rotationYaw);
        this.rotationYaw += MathHelper.clamp(diff, -5, 5);
        if (Math.random() < 0.01 && this.onGround) this.jumping = true;
        else if (Math.random() < 0.05) this.jumping = false;
        super.onLivingUpdate();
        this.jumping = false;
    }

    getAIMoveSpeed() { return this.moveSpeed; }
    travel(f, v, s) {
        // mobs use basic travel (reuse EntityLiving via PlayerEntity-like? implement simple)
        // Apply gravity + move
        this.moveRelative(f, v, s, this.getAIMoveSpeed() * 0.5);
        this.collision = this.moveCollide(-this.motionX, this.motionY, -this.motionZ);
        this.motionY -= 0.08;
        this.motionX *= 0.91;
        this.motionY *= 0.98;
        this.motionZ *= 0.91;
    }
    moveRelative(forward, up, strafe, friction) {
        let distance = strafe * strafe + up * up + forward * forward;
        if (distance >= 0.0001) {
            distance = Math.sqrt(distance);
            if (distance < 1.0) distance = 1.0;
            distance = friction / distance;
            strafe *= distance; up *= distance; forward *= distance;
            const yawRadians = MathHelper.toRadians(this.rotationYaw + 180);
            const sin = Math.sin(yawRadians), cos = Math.cos(yawRadians);
            this.motionX += strafe * cos - forward * sin;
            this.motionY += up;
            this.motionZ += forward * cos + strafe * sin;
        }
    }
    jump() { this.motionY = 0.42; }
    isInWater() { return false; }
}
