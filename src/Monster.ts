/// <reference path="./Skills.ts" />

class Stats {
    public hp : number;
    public atk : number;
    public def : number;
    public spd : number;
    public spAtk : number;
    public spDef : number;

    constructor(hp : number, atk : number, def : number, spd : number, spAtk : number, spDef : number) {
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
}

class Species {
    public readonly name : string;
    public readonly idx : number;
    public readonly type : Type;
    constructor(name : string, idx : number, type : Type) {
        this.name = name;
        this.idx = idx;
        this.type = type;
    }
}

class Monster {
    public stats : Stats;
    public mods : Stats = Stats.empty();
    public currHP : number;
    public species : Species;
    public skills : SkillItem[];
    public sprite? : ex.Sprite;
    constructor(species : Species, stats : Stats, skills : SkillItem[]) {
        this.stats = stats.copy();
        this.currHP = this.stats.hp;
        this.species = species;
        this.skills = skills;
    }
}
