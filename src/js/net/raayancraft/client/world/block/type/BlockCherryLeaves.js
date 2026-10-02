import Block from "../Block.js";

// Cherry blossom leaves: signature latest-version pink.
export default class BlockCherryLeaves extends Block {

    constructor(id, textureSlotId) {
        super(id, textureSlotId);
        this.sound = Block.sounds.grass;
    }

    getColor(world, x, y, z, face) {
        return 0xf2a7c3;
    }

    getOpacity() {
        return 0.3;
    }
}
