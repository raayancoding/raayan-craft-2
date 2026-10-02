import HelpCommand from "./command/HelpCommand.js";
import TimeCommand from "./command/TimeCommand.js";
import TeleportCommand from "./command/TeleportCommand.js";
import GamemodeCommand from "./command/GamemodeCommand.js";
import GiveCommand from "./command/GiveCommand.js";
import WeatherCommand from "./command/WeatherCommand.js";
import KillCommand from "./command/KillCommand.js";
import SeedCommand from "./command/SeedCommand.js";
import SummonCommand from "./command/SummonCommand.js";

export default class CommandHandler {

    constructor(rayancraft) {
        this.rayancraft = rayancraft;

        this.commands = [];
        this.commands.push(new HelpCommand());
        this.commands.push(new TimeCommand());
        this.commands.push(new TeleportCommand());
        this.commands.push(new GamemodeCommand());
        this.commands.push(new GiveCommand());
        this.commands.push(new WeatherCommand());
        this.commands.push(new KillCommand());
        this.commands.push(new SeedCommand());
        this.commands.push(new SummonCommand());
    }

    handleMessage(message) {
        let args = message.split(" ");
        let command = args[0].toLowerCase();
        this.handleCommand(command, args.slice(1));
    }

    handleCommand(command, args) {
        for (let i = 0; i < this.commands.length; i++) {
            let commandExecutor = this.commands[i];
            if (commandExecutor.command === command) {
                if (!this.commands[i].execute(this.rayancraft, args)) {
                    this.rayancraft.addMessageToChat("/" + commandExecutor.command + " " + commandExecutor.usage);
                }
                return;
            }
        }
        this.rayancraft.addMessageToChat("Unknown command! Type \"/help\" for help.");
    }
}