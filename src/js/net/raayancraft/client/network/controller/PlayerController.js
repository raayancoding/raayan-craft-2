import PlayerEntity from "../../entity/PlayerEntity.js";

export default class PlayerController {

    constructor(rayancraft) {
        this.rayancraft = rayancraft;
    }

    createPlayer(world) {
        return new PlayerEntity(this.rayancraft, world, 0);
    }

    sendChatMessage(message) {
        // Handle message
        if (message.startsWith("/")) {
            this.rayancraft.commandHandler.handleMessage(message.substring(1));
        } else {
            this.rayancraft.addMessageToChat("<" + this.rayancraft.player.username + "> " + message);
        }
    }
}