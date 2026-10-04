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
    zombie: "EntityZombie",
    pig: "EntityPig",
    bot: "EntityBot",
    dog: "EntityDog",
    wolf: "EntityDog"
};

export default class SummonCommand extends Command {
    constructor() { super("summon", "<herobrine|303|golem|alex|siren|zombie|pig|bot|dog>", "Summon a creature"); }
    execute(rayancraft, args) {
        if (args.length < 1 || !rayancraft.player || !rayancraft.world) return false;
        const file = MYTHS[args[0].toLowerCase()];
        if (!file) {
            rayancraft.addMessageToChat("Unknown mob. Try: herobrine, 303, golem, alex, siren, zombie, pig, bot");
            return true;
        }
        import("../../entity/" + file + ".js").then(m => {
            const p = rayancraft.player;
            const id = Date.now() % 100000 + Math.floor(Math.random() * 1000);
            const e = new m.default(rayancraft, rayancraft.world, id);
            if (file !== "EntityPig" && file !== "EntityBot") e.isMyth = true;
            e.setPosition(p.x + 2, p.y + 1, p.z + 2);
            rayancraft.world.addEntity(e);
            rayancraft.addMessageToChat("§eSummoned " + file);
            if (file === "EntityDog" && rayancraft.achievements) rayancraft.achievements.unlock("dog");
        }).catch(() => { });
        return true;
    }
}
