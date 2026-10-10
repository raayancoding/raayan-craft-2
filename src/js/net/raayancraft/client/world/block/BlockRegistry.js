import BlockLog from "./type/BlockLog.js";
import BlockStone from "./type/BlockStone.js";
import BlockGrass from "./type/BlockGrass.js";
import BlockDirt from "./type/BlockDirt.js";
import BlockLeave from "./type/BlockLeave.js";
import BlockWater from "./type/BlockWater.js";
import BlockSand from "./type/BlockSand.js";
import BlockTorch from "./type/BlockTorch.js";
import Sound from "./sound/Sound.js";
import Block from "./Block.js";
import BlockWood from "./type/BlockWood.js";
import BlockBedrock from "./type/BlockBedrock.js";
import BlockGlass from "./type/BlockGlass.js";
import SoundGlass from "./sound/SoundGlass.js";
import BlockGravel from "./type/BlockGravel.js";
import BlockCobblestone from "./type/BlockCobblestone.js";
import BlockOre from "./type/BlockOre.js";
import BlockSimple from "./type/BlockSimple.js";
import BlockFlower from "./type/BlockFlower.js";
import BlockLava from "./type/BlockLava.js";
import BlockCherryLeaves from "./type/BlockCherryLeaves.js";
import BlockLeavesVariant from "./type/BlockLeavesVariant.js";

export class BlockRegistry {

    static create() {
        // Sounds
        Block.sounds.stone = new Sound("stone", 1.0);
        Block.sounds.wood = new Sound("wood", 1.0);
        Block.sounds.gravel = new Sound("gravel", 1.0);
        Block.sounds.grass = new Sound("grass", 1.0);
        Block.sounds.cloth = new Sound("cloth", 1.0);
        Block.sounds.sand = new Sound("sand", 1.0);
        Block.sounds.glass = new SoundGlass("stone", 1.0);

        // Blocks
        BlockRegistry.STONE = new BlockStone(1, 0);
        BlockRegistry.GRASS = new BlockGrass(2, 1);
        BlockRegistry.DIRT = new BlockDirt(3, 2);
        BlockRegistry.COBBLE_STONE = new BlockCobblestone(4, 14);
        BlockRegistry.WOOD = new BlockWood(5, 10);
        BlockRegistry.BEDROCK = new BlockBedrock(7, 11);
        BlockRegistry.GRAVEL = new BlockGravel(13, 13);
        BlockRegistry.LOG = new BlockLog(17, 4);
        BlockRegistry.LEAVE = new BlockLeave(18, 6);
        BlockRegistry.GLASS = new BlockGlass(20, 12);
        BlockRegistry.WATER = new BlockWater(9, 7);
        BlockRegistry.SAND = new BlockSand(12, 8)
        BlockRegistry.TORCH = new BlockTorch(50, 9)

        // ---- Pure rayancraft expansion (vanilla IDs) ----
        // Ores (procedural textures slots 15-20)
        BlockRegistry.COAL_ORE = new BlockOre(16, 15);
        BlockRegistry.IRON_ORE = new BlockOre(15, 16);
        BlockRegistry.GOLD_ORE = new BlockOre(14, 17);
        BlockRegistry.DIAMOND_ORE = new BlockOre(56, 18);
        BlockRegistry.REDSTONE_ORE = new BlockOre(73, 19);
        BlockRegistry.LAPIS_ORE = new BlockOre(21, 20);
        // Building
        BlockRegistry.SANDSTONE = new BlockSimple(24, 21, { sound: Block.sounds.stone });
        BlockRegistry.BRICK = new BlockSimple(45, 22, { sound: Block.sounds.stone });
        BlockRegistry.OBSIDIAN = new BlockSimple(49, 23, { sound: Block.sounds.stone });
        BlockRegistry.WOOL = new BlockSimple(35, 24, { sound: Block.sounds.cloth });
        BlockRegistry.SNOW_BLOCK = new BlockSimple(80, 25, { sound: Block.sounds.cloth });
        BlockRegistry.ICE = new BlockSimple(79, 26, { sound: Block.sounds.glass, translucent: true });
        BlockRegistry.CACTUS = new BlockSimple(81, 27, { sound: Block.sounds.cloth });
        BlockRegistry.PUMPKIN = new BlockSimple(86, 28, { top: 29, bottom: 29, side: 28, sound: Block.sounds.wood });
        BlockRegistry.CRAFTING_TABLE = new BlockSimple(58, 31, { top: 30, bottom: 10, side: 31, sound: Block.sounds.wood });
        BlockRegistry.FURNACE = new BlockSimple(61, 33, { top: 33, bottom: 33, side: 32, sound: Block.sounds.stone });
        BlockRegistry.CHEST = new BlockSimple(54, 34, { sound: Block.sounds.wood });
        BlockRegistry.BOOKSHELF = new BlockSimple(47, 39, { top: 10, bottom: 10, side: 39, sound: Block.sounds.wood });
        BlockRegistry.TNT = new BlockSimple(46, 40, { top: 9, bottom: 10, side: 40, sound: Block.sounds.grass });
        BlockRegistry.MELON = new BlockSimple(103, 41, { sound: Block.sounds.grass });
        BlockRegistry.SMOOTH_STONE = new BlockSimple(43, 42, { sound: Block.sounds.stone });
        BlockRegistry.MOSSY_COBBLE = new BlockSimple(48, 43, { sound: Block.sounds.stone });
        // Bedrock-exclusive feel: netherrack + glowstone
        BlockRegistry.NETHERRACK = new BlockSimple(87, 44, { sound: Block.sounds.stone });
        BlockRegistry.GLOWSTONE = new BlockSimple(89, 45, { sound: Block.sounds.glass, light: 15 });
        BlockRegistry.LAVA = new BlockLava(11, 38);
        // Flora
        BlockRegistry.RED_FLOWER = new BlockFlower(38, 35);
        BlockRegistry.YELLOW_FLOWER = new BlockFlower(37, 36);
        BlockRegistry.SAPLING = new BlockFlower(6, 37);
        // Latest-version set (modern IDs): copper, deepslate, amethyst, cherry
        BlockRegistry.COPPER_ORE = new BlockOre(201, 46);
        BlockRegistry.COPPER_BLOCK = new BlockSimple(202, 47, { sound: Block.sounds.stone });
        BlockRegistry.DEEPSLATE = new BlockSimple(203, 48, { sound: Block.sounds.stone });
        BlockRegistry.AMETHYST = new BlockSimple(204, 49, { sound: Block.sounds.glass, light: 8 });
        BlockRegistry.CHERRY_LOG = new BlockLog(205, 50);
        BlockRegistry.CHERRY_LEAVES = new BlockCherryLeaves(206, 51);
        // Wood families: birch/spruce/jungle/acacia/dark oak/mangrove
        const woodSound = { sound: Block.sounds.wood };
        BlockRegistry.BIRCH_LOG = new BlockLog(210, 52);
        BlockRegistry.BIRCH_LEAVES = new BlockLeavesVariant(211, 54, 0x9ac75a);
        BlockRegistry.BIRCH_PLANKS = new BlockSimple(212, 55, woodSound);
        BlockRegistry.SPRUCE_LOG = new BlockLog(213, 56);
        BlockRegistry.SPRUCE_LEAVES = new BlockLeavesVariant(214, 58, 0x2f6b2f);
        BlockRegistry.SPRUCE_PLANKS = new BlockSimple(215, 59, woodSound);
        BlockRegistry.JUNGLE_LOG = new BlockLog(216, 60);
        BlockRegistry.JUNGLE_LEAVES = new BlockLeavesVariant(217, 62, 0x3fa83f);
        BlockRegistry.JUNGLE_PLANKS = new BlockSimple(218, 63, woodSound);
        BlockRegistry.ACACIA_LOG = new BlockLog(219, 64);
        BlockRegistry.ACACIA_LEAVES = new BlockLeavesVariant(220, 66, 0x9ab83a);
        BlockRegistry.ACACIA_PLANKS = new BlockSimple(221, 67, woodSound);
        BlockRegistry.DARKOAK_LOG = new BlockLog(222, 68);
        BlockRegistry.DARKOAK_LEAVES = new BlockLeavesVariant(223, 70, 0x2a5a1f);
        BlockRegistry.DARKOAK_PLANKS = new BlockSimple(224, 71, woodSound);
        BlockRegistry.MANGROVE_LOG = new BlockLog(225, 72);
        BlockRegistry.MANGROVE_LEAVES = new BlockLeavesVariant(226, 74, 0x6a8a2f);
        BlockRegistry.MANGROVE_PLANKS = new BlockSimple(227, 75, woodSound);
        // Encyclopedia ores + note block
        BlockRegistry.EMERALD_ORE = new BlockOre(129, 76);
        BlockRegistry.QUARTZ_ORE = new BlockOre(155, 77);
        BlockRegistry.ANCIENT_DEBRIS = new BlockOre(230, 78);
        BlockRegistry.NOTE_BLOCK = new BlockSimple(25, 79, { sound: Block.sounds.wood });
        // ---- Expansion batch 2: more ores (slots 80-87) ----
        BlockRegistry.TIN_ORE = new BlockOre(231, 80);
        BlockRegistry.SILVER_ORE = new BlockOre(232, 81);
        BlockRegistry.LEAD_ORE = new BlockOre(233, 82);
        BlockRegistry.RUBY_ORE = new BlockOre(234, 83, 4);
        BlockRegistry.SAPPHIRE_ORE = new BlockOre(235, 84, 4);
        BlockRegistry.URANIUM_ORE = new BlockOre(236, 85, 4);
        BlockRegistry.MITHRIL_ORE = new BlockOre(237, 86, 5);
        BlockRegistry.TOPAZ_ORE = new BlockOre(238, 87);
        // ---- Expansion batch 2: stone + decor (slots 88-103) ----
        const stoneSound = { sound: Block.sounds.stone };
        BlockRegistry.MARBLE = new BlockSimple(239, 88, stoneSound);
        BlockRegistry.GRANITE = new BlockSimple(240, 89, stoneSound);
        BlockRegistry.LIMESTONE = new BlockSimple(241, 90, stoneSound);
        BlockRegistry.BASALT = new BlockSimple(242, 91, stoneSound);
        BlockRegistry.SLATE = new BlockSimple(243, 92, stoneSound);
        BlockRegistry.DIORITE = new BlockSimple(244, 93, stoneSound);
        BlockRegistry.ANDESITE = new BlockSimple(245, 94, stoneSound);
        BlockRegistry.RED_SANDSTONE = new BlockSimple(246, 95, { sound: Block.sounds.sand });
        BlockRegistry.NETHER_BRICKS = new BlockSimple(247, 96, stoneSound);
        BlockRegistry.END_STONE = new BlockSimple(248, 97, stoneSound);
        BlockRegistry.LANTERN = new BlockSimple(249, 98, { sound: Block.sounds.glass, light: 14 });
        BlockRegistry.SEA_LANTERN = new BlockSimple(250, 99, { sound: Block.sounds.glass, light: 15 });
        BlockRegistry.MOSSY_STONE_BRICKS = new BlockSimple(251, 100, stoneSound);
        BlockRegistry.CRACKED_COBBLE = new BlockSimple(252, 101, stoneSound);
        BlockRegistry.CAMPFIRE = new BlockSimple(253, 102, { sound: Block.sounds.wood, light: 12 });
        BlockRegistry.COAL_BLOCK = new BlockSimple(254, 103, stoneSound);
        // Solid sounds fix
        BlockRegistry.SANDSTONE.sound = Block.sounds.sand;
    }
}