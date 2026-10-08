import PlayerRenderer from "./entity/PlayerRenderer.js";
import PigRenderer from "./entity/PigRenderer.js";
import ZombieRenderer from "./entity/ZombieRenderer.js";
import MythRenderer from "./entity/MythRenderer.js";
import PlayerEntity from "../../entity/PlayerEntity.js";
import PlayerEntityMultiplayer from "../../entity/PlayerEntityMultiplayer.js";
import EntityPig from "../../entity/EntityPig.js";
import EntityZombie from "../../entity/EntityZombie.js";
import EntityHerobrine from "../../entity/EntityHerobrine.js";
import Entity303 from "../../entity/Entity303.js";
import EntityBloodGolem from "../../entity/EntityBloodGolem.js";
import EntityGiantAlex from "../../entity/EntityGiantAlex.js";
import EntitySiren from "../../entity/EntitySiren.js";
import EntityBot from "../../entity/EntityBot.js";
import EntityDog from "../../entity/EntityDog.js";
import EntityAnimal from "../../entity/EntityAnimal.js";
import EntityCow from "../../entity/EntityCow.js";
import EntitySheep from "../../entity/EntitySheep.js";
import EntityChicken from "../../entity/EntityChicken.js";
import EntitySkeleton from "../../entity/EntitySkeleton.js";
import EntityCreeper from "../../entity/EntityCreeper.js";
import EntityEnderman from "../../entity/EntityEnderman.js";
import EntityVillager from "../../entity/EntityVillager.js";
import EntityIronGolem from "../../entity/EntityIronGolem.js";
import EntityNull from "../../entity/EntityNull.js";
import EntityWhiteEnderman from "../../entity/EntityWhiteEnderman.js";
import EntityWatcher from "../../entity/EntityWatcher.js";
import EntityShadowSteve from "../../entity/EntityShadowSteve.js";

export default class EntityRenderManager {

    constructor(worldRenderer) {
        this.worldRenderer = worldRenderer;

        this.renderers = [];
        this.push(PlayerEntity, PlayerRenderer);
        this.push(PlayerEntityMultiplayer, PlayerRenderer);
        this.push(EntityPig, PigRenderer);
        this.push(EntityZombie, ZombieRenderer);
        this.push(EntityHerobrine, MythRenderer);
        this.push(Entity303, MythRenderer);
        this.push(EntityBloodGolem, MythRenderer);
        this.push(EntityGiantAlex, MythRenderer);
        this.push(EntitySiren, MythRenderer);
        this.push(EntityBot, MythRenderer);
        this.push(EntityDog, MythRenderer);
        this.push(EntityAnimal, MythRenderer);
        this.push(EntityCow, MythRenderer);
        this.push(EntitySheep, MythRenderer);
        this.push(EntityChicken, MythRenderer);
        this.push(EntitySkeleton, MythRenderer);
        this.push(EntityCreeper, MythRenderer);
        this.push(EntityEnderman, MythRenderer);
        this.push(EntityVillager, MythRenderer);
        this.push(EntityIronGolem, MythRenderer);
        this.push(EntityNull, MythRenderer);
        this.push(EntityWhiteEnderman, MythRenderer);
        this.push(EntityWatcher, MythRenderer);
        this.push(EntityShadowSteve, MythRenderer);
    }

    push(entityType, entityRenderer) {
        this.renderers[entityType.name] = entityRenderer;
    }

    createEntityRendererByEntity(entity) {
        if (!(entity.constructor.name in this.renderers)) {
            return null;
        }
        return new this.renderers[entity.constructor.name]["prototype"]["constructor"](this.worldRenderer);
    }
}