/// <reference path="./Skills.ts" />

class Stats {
    public hp : number;
    public atk : number;
    public def : number;
    public spd : number;
    public spAtk : number;
    public spDef : number;

    constructor(hp : number, atk : number, def : number, spAtk : number, spDef : number, spd : number) {
        this.hp = hp;
        this.atk = atk;
        this.def = def;
        this.spd = spd;
        this.spAtk = spAtk;
        this.spDef = spDef;
    }

    public copy() : Stats {
        return new Stats(this.hp, this.atk, this.def, this.spd, this.spAtk, this.spDef);
    }

    public static empty() : Stats {
        return new Stats(0, 0, 0, 0, 0, 0);
    }

    public record() : Record<string, number> {
        return ((this as any) as Record<string, number>);
    }

    public computeStats(lvl : number, ivs : Stats, evs : Stats) : Stats {
        const ret : Stats = Stats.empty();
        const myStats = this.record();
        for (const key in myStats) {
            if (!myStats.hasOwnProperty(key)) {
                continue;
            }
            let calc = (myStats[key] + ivs.record()[key]) * 2;
            calc += Math.floor(Math.sqrt(evs.record()[key]) / 4);
            calc = Math.floor(calc * lvl / 100);
            if (key === "hp") {
                calc += lvl + 10;
            } else {
                calc += 5;
            }
            ret.record()[key] = calc;
        }
        return ret;
    }
}

class Species {
    public readonly name : string;
    public readonly idx : number;
    public readonly types : Type[];
    public readonly baseStats : Stats;
    constructor(name : string, idx : number, types : Type[], stats : Stats) {
        this.name = name;
        this.idx = idx;
        this.types = types;
        this.baseStats = stats;
    }
}

class Monster {
    public stats : Stats;
    public level : number;
    public mods : Stats = Stats.empty();
    public currHP : number;
    public species : Species;
    public skills : SkillItem[];
    public sprite? : ex.Sprite;
    constructor(species : Species, level : number, skills : Skill[],
                evs? : Stats, ivs? : Stats) {
        evs = evs || Stats.empty();
        ivs = ivs || Stats.empty();
        this.stats = species.baseStats.computeStats(level, ivs, evs);
        this.currHP = this.stats.hp;
        this.species = species;
        this.skills = [];
        this.level = level;
        for (const skill of skills) {
            this.skills.push(new SkillItem(skill));
        }
    }
}
