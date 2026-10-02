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