// Legacy system: player-run museums, anniversary vaults, prestige tiers,
// time capsules and server legacy halls — all cosmetic / lore, never pay-to-win.
// - Museum: /legacy museum add <plaque> registers held block as an exhibit with
//   an interactive plaque; each 3 exhibits grant +1 ore XP (cap +5, passive
//   world bonus while displayed).
// - Vault: time-locked seasonal vault opens yearly (festive week Dec 20-Jan 5
//   + personal anniversary week). /legacy vault claim mints that year's
//   exclusive cosmetic (title/dye) once.
// - Prestige: cumulative-playtime tiers grant cosmetic badges/titles only.
// - Capsule: /legacy capsule leave <msg> seals a message; due capsules open
//   on anniversaries / vault windows.
// - Hall: recordFeat() preserves feats for /legacy hall (world-state snapshot).
// Persisted in localStorage. Chat-only.
export default class Legacy {

    static PRESTIGE_TIERS = [
        { hours: 1, badge: "Wayfarer", title: "the Wayfarer" },
        { hours: 5, badge: "Veteran", title: "the Veteran" },
        { hours: 20, badge: "Warden", title: "the Warden" },
        { hours: 50, badge: "Legend", title: "the Legend" },
        { hours: 150, badge: "Mythic", title: "the Mythic" },
    ];

    static VAULT_COSMETICS = [
        "Frostfall Dye", "Emberweave Title", "Starforged Dye", "Tidecaller Title",
        "Thornbloom Dye", "Stormcrown Title", "Duskwoven Dye", "Dawnbringer Title",
    ];

    constructor(rayancraft) {
        this.rayancraft = rayancraft;
        this.state = this.load();
        this.announced = false;
        this._tickAcc = 0;
    }

    load() {
        const fresh = { exhibits: [], vaultClaimed: {}, cosmetics: [], playSeconds: 0, prestigeTier: -1, capsules: [], hall: [], firstPlay: 0 };
        try {
            const raw = localStorage.getItem("rc_legacy");
            if (raw) {
                const s = JSON.parse(raw);
                if (s && typeof s === "object") return Object.assign(fresh, s);
            }
        } catch (e) { }
        if (!fresh.firstPlay) {
            fresh.firstPlay = Date.now();
            try { localStorage.setItem("rc_legacy", JSON.stringify(fresh)); } catch (e) { }
        }
        return fresh;
    }

    save() {
        try { localStorage.setItem("rc_legacy", JSON.stringify(this.state)); } catch (e) { }
    }

    say(msg) {
        try { this.rayancraft.addMessageToChat(msg); } catch (e) { }
    }

    heldBlockId() {
        try {
            const p = this.rayancraft.player;
            if (!p || !p.inventory) return 0;
            return p.inventory.getItemInSelectedSlot() || 0;
        } catch (e) { return 0; }
    }

    // ---- Museum ----
    addExhibit(plaque) {
        const id = this.heldBlockId();
        if (!id) { this.say("Hold a block in your hand to enshrine it (/legacy museum add <plaque>)."); return false; }
        const text = (plaque || "").slice(0, 80) || "Untitled relic";
        let by = "Unknown";
        try { by = this.rayancraft.player.username || by; } catch (e) { }
        this.state.exhibits.push({ id, plaque: text, by, time: Date.now() });
        this.save();
        this.say("Museum: enshrined block " + id + " — \"" + text + "\" (" + this.state.exhibits.length + " exhibits). Bonus +"
            + this.museumBonusXp() + " ore XP while displayed.");
        try {
            if (this.state.exhibits.length === 1) this.rayancraft.achievements.unlock("curator");
            if (this.state.exhibits.length >= 5) this.rayancraft.achievements.unlock("curator_5");
        } catch (e) { }
        this.recordFeat("Exhibit: " + text);
        return true;
    }

    listExhibits() {
        if (this.state.exhibits.length === 0) { this.say("Museum is empty. Hold a rare block and /legacy museum add <plaque>."); return; }
        this.say("--- Legacy Museum (" + this.state.exhibits.length + ") ---");
        this.state.exhibits.slice(-6).forEach((e, i) => {
            this.say((i + 1) + ". Block " + e.id + " — \"" + e.plaque + "\" by " + e.by);
        });
        this.say("Passive bonus: +" + this.museumBonusXp() + " ore XP (legacy artifacts).");
    }

    museumBonusXp() {
        return Math.min(5, Math.floor(this.state.exhibits.length / 3) + (this.state.exhibits.length > 0 ? 1 : 0));
    }

    // ---- Vault (time-locked) ----
    seasonYear(d) {
        return (d || new Date()).getFullYear();
    }

    isVaultOpen(date) {
        const d = date || new Date();
        const m = d.getMonth(), day = d.getDate();
        // Festive week: Dec 20 - Jan 5
        if ((m === 11 && day >= 20) || (m === 0 && day <= 5)) return true;
        // Personal anniversary week (first-play +- 3 days)
        try {
            const f = new Date(this.state.firstPlay);
            if (f.getMonth() === m && Math.abs(f.getDate() - day) <= 3) return true;
        } catch (e) { }
        return false;
    }

    vaultStatus() {
        const y = this.seasonYear();
        const open = this.isVaultOpen();
        const claimed = !!this.state.vaultClaimed[y];
        return { year: y, open, claimed };
    }

    claimVault() {
        const { year, open, claimed } = this.vaultStatus();
        if (!open) { this.say("Anniversary vault is sealed. It opens Dec 20-Jan 5 and on your anniversary week."); return false; }
        if (claimed) { this.say("Vault " + year + " already claimed. Cosmetics: " + (this.state.cosmetics.join(", ") || "none") + "."); return false; }
        const cosmetic = Legacy.VAULT_COSMETICS[year % Legacy.VAULT_COSMETICS.length] + " '" + (year % 100) + "'";
        this.state.vaultClaimed[year] = true;
        this.state.cosmetics.push(cosmetic);
        this.save();
        this.say("Vault " + year + " opens! Exclusive cosmetic unlocked: " + cosmetic + " (time-locked, never sold).");
        try { this.rayancraft.achievements.unlock("vault_keeper"); } catch (e) { }
        this.recordFeat("Vaultkeeper '" + year);
        this.openDueCapsules();
        return true;
    }

    // ---- Prestige (cosmetic-only, cumulative playtime) ----
    prestigeTier() {
        const hours = this.state.playSeconds / 3600;
        let tier = -1;
        Legacy.PRESTIGE_TIERS.forEach((t, i) => { if (hours >= t.hours) tier = i; });
        return { tier, hours };
    }

    checkPrestige() {
        const { tier } = this.prestigeTier();
        if (tier > this.state.prestigeTier) {
            this.state.prestigeTier = tier;
            this.save();
            const t = Legacy.PRESTIGE_TIERS[tier];
            this.say("Prestige: " + t.badge + " " + t.title + "! Cosmetic-only badge (cumulative playtime).");
            try {
                this.rayancraft.achievements.unlock("prestige_" + (tier + 1));
                this.rayancraft.achievements.unlock("prestige");
            } catch (e) { }
            this.recordFeat("Prestige: " + t.badge);
        }
    }

    // ---- Time capsules ----
    leaveCapsule(msg) {
        const text = (msg || "").slice(0, 140);
        if (!text) { this.say("Usage: /legacy capsule leave <message>"); return false; }
        const unlockAt = Date.now() + 365 * 24 * 3600 * 1000;
        this.state.capsules.push({ msg: text, sealed: Date.now(), unlockAt, opened: false });
        this.save();
        this.say("Time capsule sealed (" + this.state.capsules.length + "). It unlocks next anniversary / vault window.");
        return true;
    }

    openDueCapsules(force) {
        const now = Date.now();
        let opened = 0;
        for (const c of this.state.capsules) {
            if (!c.opened && (force || c.unlockAt <= now || this.isVaultOpen())) {
                // Vault windows reveal a preview but only truly due ones fully open;
                // for playability, anniversary windows open anything sealed >7 days ago.
                if (!force && c.unlockAt > now && (now - c.sealed) < 7 * 24 * 3600 * 1000) continue;
                c.opened = true;
                opened++;
                this.say("Time capsule opened: \"" + c.msg + "\"");
            }
        }
        if (opened > 0) {
            this.save();
            try { this.rayancraft.achievements.unlock("time_capsule"); } catch (e) { }
        }
        return opened;
    }

    // ---- Legacy hall (world-state snapshots) ----
    recordFeat(feat) {
        try {
            if (!feat) return;
            if (this.state.hall.length > 0 && this.state.hall[this.state.hall.length - 1].feat === feat) return;
            this.state.hall.push({ feat: String(feat).slice(0, 100), time: Date.now() });
            if (this.state.hall.length > 40) this.state.hall = this.state.hall.slice(-40);
            this.save();
        } catch (e) { }
    }

    showHall() {
        if (this.state.hall.length === 0) { this.say("Legacy hall is empty. Feats etch themselves here as you play."); return; }
        this.say("--- Server Legacy Hall (" + this.state.hall.length + ") ---");
        this.state.hall.slice(-8).forEach((h) => this.say("* " + h.feat));
    }

    tick() {
        const mc = this.rayancraft;
        if (!mc.player || mc.player.isDead || !mc.isInGame()) return;
        // ~1s accumulation (tick runs 20/s)
        this._tickAcc++;
        if (this._tickAcc >= 20) {
            this._tickAcc = 0;
            this.state.playSeconds++;
            // save sparingly (every ~60s)
            if (this.state.playSeconds % 60 === 0) this.save();
            try { this.checkPrestige(); } catch (e) { }
        }
        if (!this.announced) {
            this.announced = true;
            const v = this.vaultStatus();
            const { tier } = this.prestigeTier();
            const badge = tier >= 0 ? Legacy.PRESTIGE_TIERS[tier].badge : "Unranked";
            this.say("Legacy: museum " + this.state.exhibits.length + " exhibits, prestige " + badge
                + ", vault '" + v.year + (v.open ? "' OPEN — /legacy vault claim" : "' sealed"));
        }
    }
}
