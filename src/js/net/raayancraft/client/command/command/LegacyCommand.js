import Command from "../Command.js";

export default class LegacyCommand extends Command {

    constructor() {
        super("legacy", "<museum|vault|prestige|capsule|hall> ...", "Museums, anniversary vaults, prestige, capsules");
    }

    execute(rayancraft, args) {
        try {
            const L = rayancraft.legacy;
            if (!L) {
                rayancraft.addMessageToChat("No legacy yet.");
                return true;
            }
            const sub = (args[0] || "hall").toLowerCase();
            if (sub === "museum") {
                const op = (args[1] || "list").toLowerCase();
                if (op === "add") {
                    L.addExhibit(args.slice(2).join(" "));
                } else {
                    L.listExhibits();
                }
                return true;
            }
            if (sub === "vault") {
                const op = (args[1] || "").toLowerCase();
                const v = L.vaultStatus();
                if (op === "claim") L.claimVault();
                else rayancraft.addMessageToChat("Anniversary vault '" + v.year + (v.open ? "' OPEN — /legacy vault claim" : "' sealed (opens Dec 20-Jan 5 + anniversary)"));
                return true;
            }
            if (sub === "prestige") {
                const { tier, hours } = L.prestigeTier();
                const badge = tier >= 0 ? L.constructor.PRESTIGE_TIERS[tier].badge : "Unranked";
                const next = L.constructor.PRESTIGE_TIERS[tier + 1];
                rayancraft.addMessageToChat("Prestige: " + badge + " (" + Math.floor(hours * 10) / 10 + "h, cosmetic-only)" + (next ? " — next: " + next.badge + " at " + next.hours + "h" : " — MAX"));
                return true;
            }
            if (sub === "capsule") {
                const op = (args[1] || "list").toLowerCase();
                if (op === "leave") L.leaveCapsule(args.slice(2).join(" "));
                else {
                    const due = L.openDueCapsules();
                    if (due === 0) rayancraft.addMessageToChat("Capsules: " + L.state.capsules.length + " sealed. /legacy capsule leave <message>.");
                }
                return true;
            }
            L.showHall();
            return true;
        } catch (e) {
            rayancraft.addMessageToChat("Could not read legacy.");
        }
        return true;
    }

}
