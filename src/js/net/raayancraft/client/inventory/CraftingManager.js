export default class CraftingManager {

    static recipes() {
        // shapeless: inputs sorted -> output {id, count}
        // log -> planks x4, planks -> sticks handled as blocks (torch uses coal+planks), etc.
        return [
            { inputs: [17], outputs: [{ id: 5, count: 4 }], name: "Oak Planks" },
            { inputs: [210], outputs: [{ id: 212, count: 4 }], name: "Birch Planks" },
            { inputs: [213], outputs: [{ id: 215, count: 4 }], name: "Spruce Planks" },
            { inputs: [216], outputs: [{ id: 218, count: 4 }], name: "Jungle Planks" },
            { inputs: [219], outputs: [{ id: 221, count: 4 }], name: "Acacia Planks" },
            { inputs: [222], outputs: [{ id: 224, count: 4 }], name: "Dark Oak Planks" },
            { inputs: [225], outputs: [{ id: 227, count: 4 }], name: "Mangrove Planks" },
            { inputs: [5, 5], outputs: [{ id: 50, count: 4 }], name: "Sticks->Torches (use planks)" },
            { inputs: [16, 5], outputs: [{ id: 50, count: 4 }], name: "Torch" },
            { inputs: [5, 5, 5, 5], outputs: [{ id: 58, count: 1 }], name: "Crafting Table" },
            { inputs: [4, 4, 4, 4, 4, 4, 4, 4], outputs: [{ id: 61, count: 1 }], name: "Furnace" },
            { inputs: [5, 5, 5, 5, 5, 5, 5, 5], outputs: [{ id: 54, count: 1 }], name: "Chest" },
            { inputs: [3, 3, 3, 3], outputs: [{ id: 45, count: 4 }], name: "Bricks (clay-ish)" },
            { inputs: [12, 12, 12, 12], outputs: [{ id: 24, count: 1 }], name: "Sandstone" },
            { inputs: [35, 35, 35], outputs: [{ id: 80, count: 1 }], name: "Snow Block" },
            { inputs: [20, 20, 20, 20], outputs: [{ id: 89, count: 1 }], name: "Glowstone (Bedrock)" },
            { inputs: [201, 201, 201, 201], outputs: [{ id: 202, count: 1 }], name: "Copper Block" },
            { inputs: [205], outputs: [{ id: 5, count: 4 }], name: "Cherry Planks" },
            { inputs: [204, 204], outputs: [{ id: 89, count: 1 }], name: "Amethyst Lamp" },
        ];
    }

    static findMatch(inputIds) {
        const clean = inputIds.filter(i => i !== 0).sort((a, b) => a - b);
        if (clean.length === 0) return null;
        for (const r of CraftingManager.recipes()) {
            const need = [...r.inputs].sort((a, b) => a - b);
            if (need.length !== clean.length) continue;
            let ok = true;
            for (let i = 0; i < need.length; i++) if (need[i] !== clean[i]) { ok = false; break; }
            if (ok) return r;
        }
        return null;
    }
}
