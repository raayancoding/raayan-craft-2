import Command from "../Command.js";

export default class WeatherCommand extends Command {

    constructor() {
        super("weather", "<clear|rain|thunder>", "Change weather")
    }

    execute(rayancraft, args) {
        if (args.length !== 1 || !rayancraft.world) return false;
        const v = args[0].toLowerCase();
        if (!["clear", "rain", "thunder"].includes(v)) return false;
        rayancraft.world.weather = v;
        rayancraft.world.weatherTime = 12000;
        rayancraft.addMessageToChat("Weather set to " + v);
        return true;
    }
}
