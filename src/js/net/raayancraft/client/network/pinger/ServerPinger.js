import NetworkManager from "../NetworkManager.js";
import NetworkStatusHandler from "./NetworkStatusHandler.js";
import rayancraft from "../../Minecraft.js";
import HandshakePacket from "../packet/handshake/client/HandshakePacket.js";
import ProtocolState from "../ProtocolState.js";
import StatusQueryPacket from "../packet/status/client/StatusQueryPacket.js";

export default class ServerPinger {

    constructor(rayancraft) {
        this.rayancraft = rayancraft;
    }

    ping(address, port, callback) {
        // Connect to server
        this.connection = new NetworkManager(this.rayancraft);
        this.connection.setNetworkHandler(new NetworkStatusHandler(this.rayancraft, callback));
        this.connection.connect(address, port, rayancraft.PROXY);

        // Request status
        this.connection.sendPacket(new HandshakePacket(rayancraft.PROTOCOL_VERSION, ProtocolState.STATUS));
        this.connection.sendPacket(new StatusQueryPacket());
    }


}