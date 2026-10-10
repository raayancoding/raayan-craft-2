import HelpCommand from "./command/HelpCommand.js";
import TimeCommand from "./command/TimeCommand.js";
import TeleportCommand from "./command/TeleportCommand.js";
import GamemodeCommand from "./command/GamemodeCommand.js";
import GiveCommand from "./command/GiveCommand.js";
import WeatherCommand from "./command/WeatherCommand.js";
import KillCommand from "./command/KillCommand.js";
import SeedCommand from "./command/SeedCommand.js";
import SummonCommand from "./command/SummonCommand.js";
import EnchantCommand from "./command/EnchantCommand.js";
import BrewCommand from "./command/BrewCommand.js";
import TradeCommand from "./command/TradeCommand.js";
import NetherCommand from "./command/NetherCommand.js";
import SethomeCommand from "./command/SethomeCommand.js";
import HomeCommand from "./command/HomeCommand.js";
import SpawnCommand from "./command/SpawnCommand.js";
import WarpCommand from "./command/WarpCommand.js";
import BiomeCommand from "./command/BiomeCommand.js";
import StatsCommand from "./command/StatsCommand.js";
import SkillsCommand from "./command/SkillsCommand.js";
import QuestsCommand from "./command/QuestsCommand.js";
import MilestonesCommand from "./command/MilestonesCommand.js";
import MentorCommand from "./command/MentorCommand.js";
import LegacyCommand from "./command/LegacyCommand.js";
import TutorialCommand from "./command/TutorialCommand.js";
import TitleCommand from "./command/TitleCommand.js";
import ModifierCommand from "./command/ModifierCommand.js";
import RespecCommand from "./command/RespecCommand.js";
import TreasureCommand from "./command/TreasureCommand.js";
import TrialCommand from "./command/TrialCommand.js";

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
        this.commands.push(new EnchantCommand());
        this.commands.push(new BrewCommand());
        this.commands.push(new TradeCommand());
        this.commands.push(new NetherCommand());
        this.commands.push(new SethomeCommand());
        this.commands.push(new HomeCommand());
        this.commands.push(new SpawnCommand());
        this.commands.push(new WarpCommand());
        this.commands.push(new BiomeCommand());
        this.commands.push(new StatsCommand());
        this.commands.push(new SkillsCommand());
        this.commands.push(new QuestsCommand());
        this.commands.push(new MilestonesCommand());
        this.commands.push(new MentorCommand());
        this.commands.push(new LegacyCommand());
        this.commands.push(new TutorialCommand());
        this.commands.push(new TitleCommand());
        this.commands.push(new ModifierCommand());
        this.commands.push(new RespecCommand());
        this.commands.push(new TreasureCommand());
        this.commands.push(new TrialCommand());
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