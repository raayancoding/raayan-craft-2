import Command from "../Command.js";

const MYTHS = {
    herobrine: "EntityHerobrine",
    "303": "Entity303",
    entity303: "Entity303",
    golem: "EntityBloodGolem",
    bloodgolem: "EntityBloodGolem",
    alex: "EntityGiantAlex",
    giantalex: "EntityGiantAlex",
    siren: "EntitySiren",
    null: "EntityNull",
    whiteenderman: "EntityWhiteEnderman",
    watcher: "EntityWatcher",
    shadowsteve: "EntityShadowSteve",
    shadow: "EntityShadowSteve",
    zombie: "EntityZombie",
    skeleton: "EntitySkeleton",
    creeper: "EntityCreeper",
    enderman: "EntityEnderman",
    pig: "EntityPig",
    cow: "EntityCow",
    sheep: "EntitySheep",
    chicken: "EntityChicken",
    villager: "EntityVillager",
    irongolem: "EntityIronGolem",
    golem2: "EntityIronGolem",
    bot: "EntityBot",
    dog: "EntityDog",
    wolf: "EntityDog"
};

export default class SummonCommand extends Command {
    constructor() { super("summon", "<mob>", "Summon a creature (mobs, myths, pets)"); }
    execute(rayancraft, args) {
        if (args.length < 1 || !rayancraft.player || !rayancraft.world) return false;
        const file = MYTHS[args[0].toLowerCase()];
        if (!file) {
            rayancraft.addMessageToChat("Mobs: cow sheep chicken pig zombie skeleton creeper enderman villager irongolem bot dog | Myths: herobrine 303 golem alex siren null whiteenderman watcher shadowsteve");
            return true;
        }
        import("../../entity/" + file + ".js").then(m => {
            const p = rayancraft.player;
            const id = Date.now() % 100000 + Math.floor(Math.random() * 1000);
            const e = new m.default(rayancraft, rayancraft.world, id);
            if (!["EntityPig", "EntityCow", "EntitySheep", "EntityChicken", "EntityBot", "EntityDog", "EntityVillager", "EntityIronGolem", "EntityZombie", "EntitySkeleton", "EntityCreeper", "EntityEnderman"].includes(file)) e.isMyth = true;
            e.setPosition(p.x + 2, p.y + 1, p.z + 2);
            rayancraft.world.addEntity(e);
            rayancraft.addMessageToChat("§eSummoned " + file);
            if (file === "EntityDog" && rayancraft.achievements) rayancraft.achievements.unlock("dog");
        }).catch(() => { });
        return true;
    }
}
