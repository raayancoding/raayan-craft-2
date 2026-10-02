import MobRenderer from "./MobRenderer.js";
export default class ZombieRenderer extends MobRenderer {
    constructor(worldRenderer) { super(worldRenderer, "zombie"); this.worldRenderer = worldRenderer; }
}
