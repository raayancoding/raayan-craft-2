import EntityRenderer from "../EntityRenderer.js";
import ModelPlayer from "../../model/model/ModelPlayer.js";
import ModelPig from "../../model/model/ModelPig.js";
import * as THREE from "../../../../../../../../libraries/three.module.js";

// One renderer for all humanoid myth mobs + bots.
// Per-entity look comes from static fields: mobTint, mobScale, mobModel ("player"|"pig").
export default class MythRenderer extends EntityRenderer {
    constructor(worldRenderer) {
        super(new ModelPlayer());
        this.worldRenderer = worldRenderer;
        try {
            this.texture = worldRenderer.rayancraft.getThreeTexture('char.png');
            this.texture.magFilter = THREE.NearestFilter;
            this.texture.minFilter = THREE.NearestFilter;
        } catch (e) { }
    }
    rebuild(entity) {
        const usePig = entity.constructor.mobModel === "pig";
        if ((usePig && !(this.model instanceof ModelPig)) || (!usePig && !(this.model instanceof ModelPlayer))) {
            this.model = usePig ? new ModelPig() : new ModelPlayer();
        }
        if (this.texture) this.tessellator.bindTexture(this.texture);
        super.rebuild(entity);
        try {
            const tint = entity.constructor.mobTint || 0xffffff;
            const glow = entity.constructor.mobGlow || false;
            this.group.traverse(o => {
                if (o.material) {
                    o.material = o.material.clone();
                    o.material.color = new THREE.Color(tint);
                    if (glow) o.material.emissive = new THREE.Color(tint);
                }
            });
        } catch (e) { }
    }
    render(entity, partialTicks) {
        super.render(entity, partialTicks);
        // Apply per-myth body scale (EntityRenderer uses fixed scale)
        try {
            const s = entity.constructor.mobScale || 1;
            if (s !== 1) this.group.scale.multiplyScalar(s);
        } catch (e) { }
    }
    fillMeta(entity, meta) {
        super.fillMeta(entity, meta);
        meta.mob = entity.constructor.name;
        meta.hp = Math.ceil(entity.health);
    }
}
