import ChunkProvider from "./ChunkProvider.js";
import NetherGenerator from "../generator/NetherGenerator.js";

export default class ChunkProviderNether extends ChunkProvider {

    constructor(world, seed) {
        super(world);
        this.generator = new NetherGenerator(world, seed);
    }

    generateChunk(x, z) {
        return this.generator.newChunk(this.world, x, z);
    }

    populateChunk(chunk) { /* nether needs no population */ }

    findSpawn() {
        this.world.spawn = { x: 8, y: 70, z: 8 };
    }
}
