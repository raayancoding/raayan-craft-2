import EntityMob from "./EntityMob.js";

// AI companion: joins empty multiplayer worlds (or via /bot) and sticks with you.
export default class EntityBot extends EntityMob {
    static name = "EntityBot";
    static mobTint = 0xffffff;
    static mobScale = 1.0;
    static NAMES = ["Steve_", "Alex_", "NoobSlayer", "Crafty_", "Miner_42", "Herobrine_Fan"];
    constructor(rayancraft, world, id, botName) {
        super(rayancraft, world, id);
        this.width = 0.6; this.height = 1.8;
        this.health = 20; this.maxHealth = 20;
        this.moveSpeed = 0.1;
        this.username = botName || EntityBot.NAMES[Math.floor(Math.random() * EntityBot.NAMES.length)];
        this.chatTimer = 300 + Math.floor(Math.random() * 600);
        this.isBot = true;
    }
    onLivingUpdate() {
        const p = this.rayancraft.player;
        if (p && p.isAlive() && !p.isDead && p !== this) {
            const dx = p.x - this.x, dz = p.z - this.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist > 5) {
                // Follow the player
                this.targetYaw = Math.atan2(dz, dx) * 180 / Math.PI + 90;
                this.moveForward = 1;
                this.wanderTimer = 10;
                if (dist > 24) {
                    // Teleport-catch-up like a loyal Bedrock NPC
                    try {
                        const ny = this.world.getHeightAt(Math.floor(p.x), Math.floor(p.z));
                        this.setPosition(p.x - 2, ny + 1, p.z - 2);
                        this.motionX = this.motionY = this.motionZ = 0;
                    } catch (e) { }
                }
            } else if (dist < 2) {
                this.moveForward = 0;
            }
            if (Math.random() < 0.005) this.swingArm();
        }
        // Friendly chatter
        if (this.chatTimer-- <= 0) {
            this.chatTimer = 900 + Math.floor(Math.random() * 1200);
            try {
                const lines = ["o/", "nice house lol", "follow me, diamonds this way", "watch out behind you", "brb mining", "this seed is stacked"];
                this.rayancraft.addMessageToChat("<" + this.username + "> " + lines[Math.floor(Math.random() * lines.length)]);
            } catch (e) { }
        }
        super.onLivingUpdate();
    }
}
