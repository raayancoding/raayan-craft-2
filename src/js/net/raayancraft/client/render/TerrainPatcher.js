export default class TerrainPatcher {

    static patch(canvas, ctx) {
        const tiles = 16;
        const tile = Math.floor(canvas.width / tiles);
        if (tile <= 0) return;
        const getTileXY = (slot) => ({ x: (slot % 16) * tile, y: Math.floor(slot / 16) * tile });

        const copyTile = (from, to) => {
            const f = getTileXY(from), t = getTileXY(to);
            ctx.drawImage(canvas, f.x, f.y, tile, tile, t.x, t.y, tile, tile);
        };

        const fillTile = (slot, color) => {
            const t = getTileXY(slot);
            ctx.fillStyle = color;
            ctx.fillRect(t.x, t.y, tile, tile);
        };

        const noiseBlobs = (slot, baseSlot, spotColor, count = 5, size = 4) => {
            copyTile(baseSlot, slot);
            const t = getTileXY(slot);
            // deterministic pseudo-random
            let seed = slot * 7919 + 13;
            const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
            ctx.fillStyle = spotColor;
            for (let i = 0; i < count; i++) {
                const bx = t.x + 2 + Math.floor(rand() * (tile - 4 - size));
                const by = t.y + 2 + Math.floor(rand() * (tile - 4 - size));
                ctx.fillRect(bx, by, size, size);
                ctx.fillRect(bx + 1, by - 1, size - 1, 1);
                ctx.fillRect(bx + 1, by + size, size - 1, 1);
            }
        };

        const brickPattern = (slot) => {
            const t = getTileXY(slot);
            ctx.fillStyle = "#9e3b2e";
            ctx.fillRect(t.x, t.y, tile, tile);
            ctx.fillStyle = "#c9c9c9";
            const rowH = Math.max(2, Math.floor(tile / 4));
            for (let r = 0; r < 4; r++) {
                ctx.fillRect(t.x, t.y + r * rowH, tile, 1);
                const off = (r % 2) * Math.floor(tile / 2);
                ctx.fillRect(t.x + off, t.y + r * rowH, 1, rowH);
                ctx.fillRect(t.x + ((off + tile / 2) % tile), t.y + r * rowH, 1, rowH);
            }
        };

        const stripes = (slot, base, stripe) => {
            copyTile(base, slot);
            const t = getTileXY(slot);
            ctx.fillStyle = stripe;
            for (let x = 2; x < tile; x += 4) ctx.fillRect(t.x + x, t.y + 1, 1, tile - 2);
        };

        try {
            // Ores on stone base (slot 0 = stone)
            noiseBlobs(15, 0, "#1a1a1a", 5, 3); // coal
            noiseBlobs(16, 0, "#d8a17a", 4, 3); // iron
            noiseBlobs(17, 0, "#f7d23a", 4, 3); // gold
            noiseBlobs(18, 0, "#5bf2e2", 3, 3); // diamond
            noiseBlobs(19, 0, "#e02828", 4, 2); // redstone
            noiseBlobs(20, 0, "#2a4bff", 3, 3); // lapis
            // Sandstone: sand base (8) + border
            copyTile(8, 21);
            {
                const t = getTileXY(21);
                ctx.fillStyle = "#c9b06a";
                ctx.fillRect(t.x, t.y + tile - 3, tile, 2);
                ctx.fillRect(t.x, t.y + 1, tile, 1);
            }
            brickPattern(22);
            // Obsidian
            fillTile(23, "#14101f");
            noiseBlobs(23, 23, "#3b2a6e", 6, 2);
            // Wool white
            fillTile(24, "#e8e8e8");
            // Snow / ice
            fillTile(25, "#f4fbff");
            fillTile(26, "#a8c8e8");
            // Cactus
            fillTile(27, "#4a8f3c");
            stripes(27, 27, "#2f6b26");
            // Pumpkin side/top
            fillTile(28, "#c87a25");
            stripes(28, 28, "#8a5215");
            fillTile(29, "#d89a35");
            // Crafting table
            copyTile(10, 30); // planks base
            {
                const t = getTileXY(30);
                ctx.fillStyle = "#5a3a1e";
                ctx.fillRect(t.x + 2, t.y + 2, tile - 4, tile - 4);
                ctx.fillStyle = "#7a5228";
                ctx.fillRect(t.x + 3, t.y + 3, tile - 6, tile - 6);
            }
            copyTile(10, 31);
            {
                const t = getTileXY(31);
                ctx.fillStyle = "#3a2410";
                ctx.fillRect(t.x + 1, t.y + 1, 3, 3);
                ctx.fillRect(t.x + tile - 4, t.y + 1, 3, 3);
            }
            // Furnace
            copyTile(0, 32);
            {
                const t = getTileXY(32);
                ctx.fillStyle = "#2a2a2a";
                ctx.fillRect(t.x + 4, t.y + 4, tile - 8, tile - 8);
            }
            copyTile(0, 33);
            // Chest
            fillTile(34, "#a06a2c");
            {
                const t = getTileXY(34);
                ctx.fillStyle = "#6e4416";
                ctx.fillRect(t.x, t.y + tile / 2 - 1, tile, 2);
                ctx.fillStyle = "#d8b25a";
                ctx.fillRect(t.x + tile / 2 - 1, t.y + tile / 2 - 2, 2, 4);
            }
            // Flowers
            copyTile(2, 35); // dirt base then green stem
            {
                const t = getTileXY(35);
                ctx.fillStyle = "#3d8d2f";
                ctx.fillRect(t.x + tile / 2, t.y + 6, 1, tile - 6);
                ctx.fillStyle = "#e02828";
                ctx.fillRect(t.x + tile / 2 - 2, t.y + 2, 5, 4);
            }
            copyTile(2, 36);
            {
                const t = getTileXY(36);
                ctx.fillStyle = "#3d8d2f";
                ctx.fillRect(t.x + tile / 2, t.y + 6, 1, tile - 6);
                ctx.fillStyle = "#f7d23a";
                ctx.fillRect(t.x + tile / 2 - 2, t.y + 2, 5, 4);
            }
            // Sapling
            copyTile(2, 37);
            {
                const t = getTileXY(37);
                ctx.fillStyle = "#3d8d2f";
                ctx.fillRect(t.x + tile / 2, t.y + 4, 1, tile - 4);
                ctx.fillRect(t.x + tile / 2 - 3, t.y + 2, 7, 3);
            }
            // Lava
            fillTile(38, "#d8541e");
            noiseBlobs(38, 38, "#f7d23a", 7, 3);
            // Bookshelf / TNT / melon simple
            copyTile(10, 39);
            stripes(39, 39, "#5a3a1e");
            fillTile(40, "#c83525");
            fillTile(41, "#6fbf3a");
            stripes(41, 41, "#3d7a24");
            // Smooth stone / slab
            copyTile(0, 42);
            // Mossy cobble
            noiseBlobs(43, 14, "#4a8f3c", 5, 2);
            // Netherrack (bedrock-style)
            fillTile(44, "#6e2a2a");
            noiseBlobs(44, 44, "#3a1515", 6, 2);
            // Glowstone (Bedrock-ish light block)
            fillTile(45, "#8a6a2a");
            noiseBlobs(45, 45, "#ffe27a", 6, 2);
            // Latest-version set: copper, deepslate, amethyst, cherry
            noiseBlobs(46, 0, "#d8763a", 5, 3); // copper ore
            fillTile(47, "#c0703a"); // copper block
            noiseBlobs(47, 47, "#8a4a22", 5, 2);
            fillTile(48, "#3a3a42"); // deepslate
            noiseBlobs(48, 48, "#23232b", 6, 2);
            fillTile(49, "#7a5ac8"); // amethyst
            noiseBlobs(49, 49, "#d8c0ff", 5, 2);
            copyTile(4, 50); // cherry log (log base, pink tint via color? plain copy + pink stripes)
            stripes(50, 50, "#8a5a6e");
            fillTile(51, "#f2a7c3"); // cherry leaves
            noiseBlobs(51, 51, "#d87aa5", 6, 2);
        } catch (e) {
            console.warn("Terrain patch failed", e);
        }
    }
}
