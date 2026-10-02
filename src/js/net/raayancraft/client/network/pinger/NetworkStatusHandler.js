import PacketHandler from "../handler/PacketHandler.js";
import GuiDisconnected from "../../gui/screens/GuiDisconnected.js";

export default class NetworkStatusHandler extends PacketHandler {

    constructor(rayancraft, callback) {
        super();

        this.rayancraft = rayancraft;
        this.callback = callback;
    }

    handleStatusResponse(packet) {
        this.callback(packet.object);
    }

    onDisconnect() {
        this.rayancraft.displayScreen(new GuiDisconnected("NetworkManager lost"));
    }

}