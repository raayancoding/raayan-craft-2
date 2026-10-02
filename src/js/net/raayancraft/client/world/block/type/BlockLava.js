import Block from "../Block.js";
import BlockRenderType from "../../../../util/BlockRenderType.js";

export default class BlockLava extends Block {

    constructor(id, textureSlotId) {
        super(id, textureSlotId);
    }

    getRenderType() {
        return BlockRenderType.BLOCK;
    }

    isSolid() {
        return false;
    }

    isTranslucent() {
        return true;
    }

    getOpacity() {
        return 1.0;
    }

    isLiquid() {
        return true;
    }

    canInteract() {
        return false;
    }

    getLightValue() {
        return 15;
    }
}
