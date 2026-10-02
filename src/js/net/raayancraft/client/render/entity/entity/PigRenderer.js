import MobRenderer from "./MobRenderer.js";
export default class PigRenderer extends MobRenderer {
    constructor(worldRenderer) { super(worldRenderer, "pig"); this.worldRenderer = worldRenderer; }
}
