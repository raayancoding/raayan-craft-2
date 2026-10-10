import GuiButton from "../widgets/GuiButton.js";
import GuiScreen from "../GuiScreen.js";

const progression7001 = [
    "Dynamic prestige tracks with evolving cosmetic rewards",
    "Mentorship quests granting permanent mentor titles",
    "Seasonal relic hunts unlocking lore fragments",
    "Skill fusion trees producing hybrid ability paths",
    "Community monuments evolving visually with milestones",
    "Legacy vaults storing player-authored lore",
    "Timed mastery gauntlets with escalating modifiers",
    "Cross-server expeditions unlocking rare relics",
    "NPC tutors offering advanced lessons for fees",
    "Blueprint libraries expanding with player contributions",
    "Hidden origin quests altering starting stats",
    "Prestige-only crafting benches for vanity items",
    "Seasonal leaderboards awarding permanent legacy titles",
    "Guild tech trees unlocking shared perks",
    "Community-funded research unlocking server-wide buffs",
    "Skill mastery journals tracking practice and progress",
    "Anniversary vaults opening with server age",
    "Alternate game modes unlocked by achievements",
    "NPC migrations reshaping local economies",
    "Mentorship boards matching new players to veterans",
    "Progression-linked housing upgrades with vendor perks",
    "Hidden mastery paths revealed by secret actions",
    "Seasonal prestige cosmetics tied to milestones",
    "Community research grants funding new features",
    "Legacy artifacts altering local mechanics subtly",
    "Skill synergy bonuses for coordinated teams",
    "Cross-world travel unlocked after major arcs",
    "Prestige-only dye recipes hidden in lore",
    "Automation tiers unlocking factory-level production",
    "Exploration perks revealing hidden caches",
    "World bosses evolving mechanics with each defeat",
    "Hidden classes unlocked by community puzzles",
    "Housing districts with unique vendor access",
    "Apprenticeship chains producing master craftsmen",
    "Music tracks unlocking per progression milestone",
    "Legacy halls preserving server lore and achievements",
    "Seasonal meta-quests shifting objectives",
    "Blueprint vaults requiring community keys to open",
    "Prestige events resetting leaderboards with rewards",
    "Skill mastery paths unlocking signature moves",
    "Community monuments granting passive buffs",
    "NPC mentors evolving dialogue across seasons",
    "Social perks for community leaders and mentors",
    "Seasonal artifact hunts with community clues",
    "Blueprint sharing networks for collaborative builds",
    "World-state archives accessible in legacy halls",
    "Ranked arenas with seasonal resets and titles",
    "Music and ambient layers unlocking with milestones",
    "Player-run museums for rare artifacts",
    "Time-capsule events unlocking on anniversaries",
    "Skill-based crafting unlocks requiring practice hours",
    "Progression-linked fast-travel discounts for veterans",
    "Hidden mastery paths revealed by exploration",
    "Player-run festivals granting temporary buffs",
    "Blueprint vaults requiring guild contributions",
    "Prestige-only crafting benches for rare dyes",
    "Seasonal prestige cosmetics tied to lore",
    "Community-funded monuments evolving visually",
    "Legacy vaults storing player-authored journals",
    "Timed mastery gauntlets with unique modifiers",
    "Cross-server expeditions unlocking rare blueprints",
    "NPC tutors offering advanced crafting lessons",
    "Blueprint libraries expanding with guild input",
    "Hidden origin quests altering starting gear",
    "Prestige-only crafting benches for vanity gear",
    "Seasonal leaderboards awarding permanent dyes",
    "Guild tech trees unlocking shared buffs",
    "Community-funded research unlocking new mechanics",
    "Skill mastery journals tracking practice",
    "Anniversary vaults opening with lore drops",
    "Alternate game modes unlocked by lore",
    "NPC migrations reshaping questlines",
    "Mentorship boards rewarding both parties",
    "Progression-linked housing upgrades with perks",
    "Hidden mastery paths revealed by puzzles",
    "Seasonal prestige cosmetics tied to events",
    "Community research grants funding buffs",
    "Legacy artifacts altering mechanics subtly",
    "Skill synergy bonuses for guilds",
    "Cross-world travel unlocked by milestones",
    "Prestige-only dye recipes hidden in lore",
    "Automation tiers unlocking production",
    "Exploration perks revealing caches",
    "World bosses evolving mechanics",
    "Hidden classes unlocked by puzzles",
    "Housing districts with vendor access",
    "Apprenticeship chains producing masters",
    "Music tracks unlocking per milestone",
    "Legacy halls preserving lore",
    "Seasonal meta-quests shifting objectives",
    "Blueprint vaults requiring keys",
    "Prestige events resetting leaderboards",
    "Skill mastery paths unlocking moves",
    "Community monuments granting buffs",
    "NPC mentors evolving dialogue",
    "Social perks for leaders",
    "Seasonal artifact hunts with clues",
    "Blueprint sharing networks for builds",
    "World-state archives in legacy halls",
    "Ranked arenas with seasonal resets"
];

const progression8001 = [
    "Prestige tracks with evolving relic rewards",
    "Mentor quests unlocking permanent guild perks",
    "Seasonal relic hunts tied to lore arcs",
    "Hybrid skill paths combining combat and crafting",
    "Community monuments granting server-wide buffs",
    "Legacy vaults storing guild achievements",
    "Timed gauntlets with escalating modifiers",
    "Cross-server expeditions unlocking rare relics",
    "NPC tutors offering advanced combat lessons",
    "Blueprint libraries expanding with community input",
    "Hidden origin quests altering starting stats",
    "Prestige-only crafting benches for rare gear",
    "Seasonal leaderboards awarding permanent legacy titles",
    "Guild tech trees unlocking shared perks",
    "Community-funded research unlocking buffs",
    "Skill mastery journals tracking practice",
    "Anniversary vaults opening with lore drops",
    "Alternate game modes unlocked by achievements",
    "NPC migrations reshaping questlines",
    "Mentorship boards rewarding both parties",
    "Progression-linked housing upgrades with perks",
    "Hidden mastery paths revealed by puzzles",
    "Seasonal prestige cosmetics tied to events",
    "Community research grants funding buffs",
    "Legacy artifacts altering mechanics subtly",
    "Skill synergy bonuses for guilds",
    "Cross-world travel unlocked by milestones",
    "Prestige-only dye recipes hidden in lore",
    "Automation tiers unlocking production",
    "Exploration perks revealing caches",
    "World bosses evolving mechanics",
    "Hidden classes unlocked by puzzles",
    "Housing districts with vendor access",
    "Apprenticeship chains producing masters",
    "Music tracks unlocking per milestone",
    "Legacy halls preserving lore",
    "Seasonal meta-quests shifting objectives",
    "Blueprint vaults requiring keys",
    "Prestige events resetting leaderboards",
    "Skill mastery paths unlocking moves",
    "Community monuments granting buffs",
    "NPC mentors evolving dialogue",
    "Social perks for leaders",
    "Seasonal artifact hunts with clues",
    "Blueprint sharing networks for builds",
    "World-state archives in legacy halls",
    "Ranked arenas with seasonal resets",
    "Music and ambient layers unlocking",
    "Player-run museums for rare artifacts",
    "Time-capsule events unlocking on anniversaries"
];

const sections = [
    {
        name: "Gameplay & Progression",
        ranges: "7001–7100 and 8001–8100",
        entries: [
            ...progression7001.map((title, index) => ({ id: 7001 + index, title })),
            ...progression8001.map((title, index) => ({ id: 8001 + index, title })),
            { id: "8051–8100", title: "50 more progression concepts: mastery, prestige cosmetics, guild monuments, seasonal quests, automation, hidden classes, and lore vaults." }
        ]
    },
    {
        name: "Worldbuilding & Biomes",
        ranges: "7101–7200 and 8101–8200",
        entries: [{ title: "100 biome-specific concepts: relics, flora and fauna, weather anomalies, migration events, crafting stations, and lore nodes." }]
    },
    {
        name: "Core Mechanics & Systems",
        ranges: "7201–7300 and 8201–8300",
        entries: [{ title: "100 systems concepts: physics, AI routines, scripting APIs, telemetry dashboards, procedural generation, and resource pipelines." }]
    },
    {
        name: "Crafting, Economy & Trade",
        ranges: "7301–7400 and 8301–8400",
        entries: [{ title: "100 concepts: dynamic markets, blueprint royalties, contracts, logistics, guild economies, salvage, and commodity exchanges." }]
    },
    {
        name: "Combat, Enemies & Encounters",
        ranges: "7401–7500 and 8401–8500",
        entries: [{ title: "100 concepts: tactical AI, evolving bosses, arenas, perks, faction wars, companion roles, and morale systems." }]
    },
    {
        name: "Multiplayer, Social & Governance",
        ranges: "7501–7600 and 8501–8600",
        entries: [{ title: "100 concepts: guild governance, diplomacy, matchmaking, policing, hubs, elections, alliances, treaties, and social boards." }]
    },
    {
        name: "UI, UX & Accessibility",
        ranges: "7601–7700 and 8601–8700",
        entries: [{ title: "100 concepts: HUD customization, accessibility presets, tutorials, adaptive tooltips, voice input, and simplified modes." }]
    },
    {
        name: "Audio & Visuals",
        ranges: "7701–7800 and 8701–8800",
        entries: [{ title: "100 concepts: adaptive music, particle effects, shaders, cinematics, photo mode, volumetric lighting, and accessibility filters." }]
    },
    {
        name: "Events & Live Ops",
        ranges: "7801–7900 and 8801–8900",
        entries: [{ title: "100 concepts: festivals, milestones, PvP ladders, charity events, seasonal passes, lore drops, and replay packs." }]
    },
    {
        name: "Tools, Mods & Tech Ops",
        ranges: "7901–8000 and 8901–9000",
        entries: [{ title: "100 concepts: mod APIs, asset pipelines, bug reporting, automation, creator dashboards, sandboxing, and compatibility tools." }]
    }
];

export default class GuiRoadmap extends GuiScreen {
    constructor(previousScreen) {
        super();
        this.previousScreen = previousScreen;
        this.sectionIndex = 0;
        this.page = 0;
    }

    init() {
        super.init();
        this.pageSize = Math.max(1, Math.min(9, Math.floor((this.height - 190) / 36)));

        const navY = 70;
        this.buttonList.push(new GuiButton("< Category", this.width / 2 - 190, navY, 90, 20, () => {
            this.changeSection(-1);
        }));
        this.buttonList.push(new GuiButton("Category >", this.width / 2 + 100, navY, 90, 20, () => {
            this.changeSection(1);
        }));
        this.buttonList.push(new GuiButton("Previous page", this.width / 2 - 190, this.height - 40, 110, 20, () => {
            this.changePage(-1);
        }));
        this.buttonList.push(new GuiButton("Next page", this.width / 2 - 70, this.height - 40, 110, 20, () => {
            this.changePage(1);
        }));
        this.buttonList.push(new GuiButton("Done", this.width / 2 + 80, this.height - 40, 110, 20, () => {
            this.rayancraft.displayScreen(this.previousScreen);
        }));
    }

    changeSection(direction) {
        this.sectionIndex = (this.sectionIndex + direction + sections.length) % sections.length;
        this.page = 0;
    }

    changePage(direction) {
        const pageCount = Math.max(1, Math.ceil(sections[this.sectionIndex].entries.length / this.pageSize));
        this.page = (this.page + direction + pageCount) % pageCount;
    }

    drawScreen(stack, mouseX, mouseY, partialTicks) {
        this.drawDefaultBackground(stack);
        this.drawCenteredString(stack, "FEATURE ROADMAP", this.width / 2, 28, 0xFF55FF55);

        const section = sections[this.sectionIndex];
        this.drawCenteredString(stack, section.name, this.width / 2, 52, 0xFFFFFFFF);
        this.drawCenteredString(stack, section.ranges, this.width / 2, 96, 0xFFAAAAAA);

        const pageCount = Math.max(1, Math.ceil(section.entries.length / this.pageSize));
        const start = this.page * this.pageSize;
        const visibleEntries = section.entries.slice(start, start + this.pageSize);
        const left = Math.max(16, this.width / 2 - 250);
        const right = Math.min(this.width - 16, this.width / 2 + 250);
        const rowHeight = Math.min(34, (this.height - 185) / this.pageSize);

        visibleEntries.forEach((entry, index) => {
            const y = 116 + index * rowHeight;
            this.drawRect(stack, left, y, right, y + rowHeight - 2, index % 2 === 0 ? "#202020" : "#292929", 0.88);
            const label = entry.id === undefined ? "• " + entry.title : entry.id + " · " + entry.title;
            const maxWidth = right - left - 20;
            let visibleLabel = label;
            while (visibleLabel.length > 3 && this.getStringWidth(stack, visibleLabel) > maxWidth) {
                visibleLabel = visibleLabel.slice(0, -2) + "…";
            }
            this.drawString(stack, visibleLabel, left + 10, y + Math.max(4, (rowHeight - 8) / 2), 0xFFFFFFFF);
        });

        this.drawCenteredString(stack, "Page " + (this.page + 1) + " / " + pageCount, this.width / 2, this.height - 34, 0xFFCCCCCC);
        super.drawScreen(stack, mouseX, mouseY, partialTicks);
    }
}
