/// <reference path="./Battle.ts" />
/// <reference path="./Type.ts" />

type Effect = (_1 : Monster, _2 : Monster, _3 : BattleContext) => void;
class Skill {
    public readonly name : string;
    public readonly type : Type;
    public readonly pow : number;
    public readonly acc : number;
    public readonly pp : number;
    public readonly effect : Effect;

    constructor(name : string, type : Type, pow : number, acc : number, pp : number, effect : Effect) {
        this.name = name;
        this.type = type;
        this.pow = pow;
        this.acc = acc;
        this.effect = effect;
        this.pp = pp;
    }
}

class SkillItem {
    public skill : Skill;
    public currPP : number;

    constructor(skill : Skill) {
        this.skill = skill;
        this.currPP = skill.pp;
    }
}
