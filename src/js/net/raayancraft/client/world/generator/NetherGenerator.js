import Generator from "./Generator.js";
import Chunk from "../Chunk.js";
import Primer from "./Primer.js";
import { BlockRegistry } from "../block/BlockRegistry.js";

// Nether dimension: netherrack + lava lakes + quartz/debris/glowstone + bedrock shell.
export default class NetherGenerator extends Generator {

    constructor(world, seed) {
        super(world, seed);
        this.seaLevel = 38; // lava lake level
    }

    newChunk(world, chunkX, chunkZ) {
        this.random.setSeed(chunkX * 0x4f9939f508 + chunkZ * 0x1ef1565bd5);
        const chunk = new Chunk(world, chunkX, chunkZ);
        const primer = new Primer(chunk);
        this.generateInChunk(chunkX, chunkZ, primer);
        chunk.generateSkylightMap();
        chunk.generateBlockLightMap();
        return chunk;
    }

    generateInChunk(chunkX, chunkZ, primer) {
        const R = BlockRegistry;
        const NR = R.NETHERRACK.getId(), BED = R.BEDROCK.getId();
        const LAVA = R.LAVA.getId(), STONE = R.STONE.getId();
        // Rolling nether terrain via sine noise (cheap, deterministic)
        for (let x = 0; x < 16; x++) for (let z = 0; z < 16; z++) {
            const wx = chunkX * 16 + x, wz = chunkZ * 16 + z;
            const h = 62 + Math.floor(Math.sin(wx * 0.05) * Math.cos(wz * 0.05) * 10 + Math.sin(wx * 0.013 + 2) * 8);
            for (let y = 0; y < 128; y++) {
                if (y === 0 || y === 127) { primer.set(x, y, z, BED); continue; }
                if (y > 118) { primer.set(x, y, z, NR); continue; }
                if (y <= h) {
                    if (y <= this.seaLevel && h < 44) {
                        // Lava lake basin
                        primer.set(x, y, z, y > h - 4 ? LAVA : NR);
                    } else {
                        primer.set(x, y, z, NR);
                    }
                } else if (y <= this.seaLevel && h < 44) {
                    primer.set(x, y, z, LAVA);
                }
            }
        }
        // Ores + glowstone clusters
        const veins = [
            { id: R.QUARTZ_ORE.getId(), count: 10, minY: 20, maxY: 110, size: 5, into: NR },
            { id: R.ANCIENT_DEBRIS.getId(), count: 3, minY: 4, maxY: 22, size: 3, into: NR },
            { id: R.GLOWSTONE.getId(), count: 3, minY: 100, maxY: 118, size: 4, into: NR },
            { id: R.SAND ? R.SAND.getId() : 0, count: 2, minY: 50, maxY: 80, size: 4, into: NR }, // soul-sand-ish patches
        ];
        for (const v of veins) {
            if (!v.id) continue;
            for (let i = 0; i < v.count; i++) {
                const vx = this.random.nextInt(16);
                const vy = v.minY + this.random.nextInt(Math.max(1, v.maxY - v.minY));
                const vz = this.random.nextInt(16);
                for (let s = 0; s < v.size; s++) {
                    const ox = vx + this.random.nextInt(3) - 1;
                    const oy = vy + this.random.nextInt(3) - 1;
                    const oz = vz + this.random.nextInt(3) - 1;
                    if (ox < 0 || ox > 15 || oz < 0 || oz > 15 || oy < 1 || oy > 126) continue;
                    if (primer.get(ox, oy, oz) === v.into) primer.set(ox, oy, oz, v.id);
                }
            }
        }
        // Hide unused
        void STONE;
    }

    populateChunk(chunkX, chunkZ) { /* the nether is already hostile enough */ }
}
