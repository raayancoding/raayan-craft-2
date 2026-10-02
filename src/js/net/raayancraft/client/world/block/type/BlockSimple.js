import Block from "../Block.js";
import EnumBlockFace from "../../../../util/EnumBlockFace.js";

export default class BlockSimple extends Block {

    constructor(id, textureSlotId, options = {}) {
        super(id, textureSlotId);
        this.topTexture = options.top !== undefined ? options.top : textureSlotId;
        this.bottomTexture = options.bottom !== undefined ? options.bottom : textureSlotId;
        this.sideTexture = options.side !== undefined ? options.side : textureSlotId;
        if (options.sound) this.sound = options.sound;
        this.lightValue = options.light || 0;
        this.solid = options.solid !== undefined ? options.solid : true;
        this.translucent = options.translucent || false;
        this.opacity = this.translucent ? 0 : 1.0;
    }

    getTextureForFace(face) {
        if (face === EnumBlockFace.TOP) return this.topTexture;
        if (face === EnumBlockFace.BOTTOM) return this.bottomTexture;
        return this.sideTexture;
    }

    getLightValue() {
        return this.lightValue;
    }

    isSolid() {
        return this.solid;
    }

    isTranslucent() {
        return this.translucent;
    }

    getOpacity() {
        return this.translucent ? 0 : 1.0;
    }
}
