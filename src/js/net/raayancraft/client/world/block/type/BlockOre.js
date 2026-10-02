import Block from "../Block.js";

export default class BlockOre extends Block {

    constructor(id, textureSlotId, hardness = 3) {
        super(id, textureSlotId);
        this.sound = Block.sounds.stone;
        this.hardness = hardness;
    }
}
