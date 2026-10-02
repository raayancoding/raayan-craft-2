import PlayerController from "./PlayerController.js";
import PlayerEntityMultiplayer from "../../entity/PlayerEntityMultiplayer.js";
import ClientChatPacket from "../packet/play/client/ClientChatPacket.js";

export default class PlayerControllerMultiplayer extends PlayerController {

    constructor(rayancraft, networkHandler, entityId) {
        super(rayancraft);

        this.entityId = entityId;
        this.networkHandler = networkHandler;
    }

    createPlayer(world) {
        return new PlayerEntityMultiplayer(this.rayancraft, world, this.networkHandler, this.entityId);
    }

    sendChatMessage(message) {
        this.networkHandler.sendPacket(new ClientChatPacket(message));
    }

    getNetworkHandler() {
        return this.networkHandler;
    }
}