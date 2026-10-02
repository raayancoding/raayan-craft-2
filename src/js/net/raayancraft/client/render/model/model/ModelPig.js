import ModelBase from "../ModelBase.js";
import ModelRenderer from "../renderer/ModelRenderer.js";

export default class ModelPig extends ModelBase {
    constructor() {
        super();
        const w = 64, h = 32;
        this.body = new ModelRenderer("body", w, h).setTextureOffset(28, 8).addBox(-5, -10, -7, 10, 16, 8);
        this.head = new ModelRenderer("head", w, h).setTextureOffset(0, 0).addBox(-4, -4, -6, 8, 8, 8);
        this.head.setRotationPoint(0, 12, -6);
        this.leg1 = new ModelRenderer("leg1", w, h).setTextureOffset(0, 16).setRotationPoint(-3, 12, 4).addBox(-2, 0, -2, 4, 6, 4);
        this.leg2 = new ModelRenderer("leg2", w, h).setTextureOffset(0, 16).setRotationPoint(3, 12, 4).addBox(-2, 0, -2, 4, 6, 4);
        this.leg3 = new ModelRenderer("leg3", w, h).setTextureOffset(0, 16).setRotationPoint(-3, 12, -4).addBox(-2, 0, -2, 4, 6, 4);
        this.leg4 = new ModelRenderer("leg4", w, h).setTextureOffset(0, 16).setRotationPoint(3, 12, -4).addBox(-2, 0, -2, 4, 6, 4);
    }
    rebuild(t, g) {
        super.rebuild(t, g);
        this.body.rebuild(t, g); this.head.rebuild(t, g);
        this.leg1.rebuild(t, g); this.leg2.rebuild(t, g); this.leg3.rebuild(t, g); this.leg4.rebuild(t, g);
    }
    render(stack, limbSwing, limbStrength, timeAlive, yaw, pitch) {
        const s = Math.sin(limbSwing * 0.6) * limbStrength;
        this.leg1.rotateAngleX = s; this.leg4.rotateAngleX = s;
        this.leg2.rotateAngleX = -s; this.leg3.rotateAngleX = -s;
        this.head.rotateAngleY = yaw * 0.01;
        this.head.render(); this.body.render();
        this.leg1.render(); this.leg2.render(); this.leg3.render(); this.leg4.render();
        super.render(stack, limbSwing, limbStrength, timeAlive, yaw, pitch);
    }
}
