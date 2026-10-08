import BlockLeave from "./BlockLeave.js";

// Variant leaves (birch/spruce/jungle/...) with a fixed family color.
export default class BlockLeavesVariant extends BlockLeave {

    constructor(id, textureSlotId, color) {
        super(id, textureSlotId);
        this.familyColor = color;
    }

    getColor(world, x, y, z, face) {
        return this.familyColor;
    }
}
