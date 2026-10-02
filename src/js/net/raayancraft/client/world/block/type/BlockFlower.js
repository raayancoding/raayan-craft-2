import Block from "../Block.js";
import BoundingBox from "../../../../util/BoundingBox.js";
import BlockRenderType from "../../../../util/BlockRenderType.js";

export default class BlockFlower extends Block {

    constructor(id, textureSlotId) {
        super(id, textureSlotId);
        this.sound = Block.sounds.grass;
        this.boundingBox = new BoundingBox(0.3, 0.0, 0.3, 0.7, 0.6, 0.7);
    }

    getRenderType() {
        return BlockRenderType.TORCH;
    }

    isSolid() {
        return false;
    }

    isTranslucent() {
        return true;
    }

    getOpacity() {
        return 0;
    }

    canInteract() {
        return true;
    }
}
