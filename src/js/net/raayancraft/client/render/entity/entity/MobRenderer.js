import EntityRenderer from "../EntityRenderer.js";
import ModelPig from "../../model/model/ModelPig.js";
import ModelPlayer from "../../model/model/ModelPlayer.js";
import * as THREE from "../../../../../../../../libraries/three.module.js";

export default class MobRenderer extends EntityRenderer {
    constructor(worldRenderer, modelType = "pig") {
        super(modelType === "zombie" ? new ModelPlayer() : new ModelPig());
        this.worldRenderer = worldRenderer;
        this.modelType = modelType;
        try {
            this.texture = worldRenderer.rayancraft.getThreeTexture('char.png');
            this.texture.magFilter = THREE.NearestFilter;
            this.texture.minFilter = THREE.NearestFilter;
        } catch (e) { }
    }
    rebuild(entity) {
        if (this.texture) this.tessellator.bindTexture(this.texture);
        super.rebuild(entity);
        // Tint: pig pinkish, zombie greenish via vertex color already applied; adjust group material
        try {
            const tint = this.modelType === "zombie" ? 0x7ac77a : 0xf0a0a0;
            this.group.traverse(o => {
                if (o.material) { o.material = o.material.clone(); o.material.color = new THREE.Color(tint); }
            });
        } catch (e) { }
    }
    fillMeta(entity, meta) {
        super.fillMeta(entity, meta);
        meta.mob = this.modelType;
        meta.hp = Math.ceil(entity.health);
    }
}
