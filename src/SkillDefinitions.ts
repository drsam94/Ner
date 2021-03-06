/// <reference path="./Skills.ts" />
/// <reference path="./Type.ts" />

const noEffect : Effect = (_1, _2, _3) => {};
interface SkillSpec {
    name : string;
    type : Type;
    pow : number;
    acc : number;
    pp : number;
    effect : Effect;
}

const AllSkills : Record<string, Skill> = {};
function defineSkill(spec : SkillSpec) {
    AllSkills[spec.name] = new Skill(spec.name, spec.type, spec.pow, spec.acc, spec.pp, spec.effect);
}

function lowerOpponentStat(statName : string) : Effect {
    return (_1, opponent : Monster, ctx : BattleContext) => {
        // TODO: write a type-safe method for this lookup
        (opponent.mods as any)[statName] -= 1;
        ctx.dialog.addText(opponent.species.name + " had its " + statName + " lowered!");
    };
}

function initSkillDefinitions() {
    defineSkill({
        name : "Tackle",
        type : Type.Normal,
        pow  : 35,
        acc  : 95,
        pp   : 35,
        effect : noEffect
    });

    defineSkill({
        name : "Scratch",
        type : Type.Normal,
        pow  : 40,
        acc  : 100,
        pp   : 35,
        effect : noEffect
    });

    defineSkill({
        name : "Growl",
        type : Type.Normal,
        pow  : 0,
        acc  : 100,
        pp   : 40,
        effect : lowerOpponentStat("atk")
    });

    defineSkill({
        name : "Leer",
        type : Type.Normal,
        pow  : 0,
        acc  : 100,
        pp   : 30,
        effect : lowerOpponentStat("def")
    });

    defineSkill({
        name : "Tail Whip",
        type : Type.Normal,
        pow  : 0,
        acc  : 100,
        pp   : 30,
        effect : lowerOpponentStat("def")
    });

    defineSkill({
        name : "Vine Whip",
        type : Type.Grass,
        pow  : 35,
        acc  : 100,
        pp   : 10,
        effect : noEffect
    });

    defineSkill({
        name : "Ember",
        type : Type.Fire,
        pow  : 40,
        acc  : 100,
        pp   : 25,
        effect : noEffect // Burn
    });

    defineSkill({
        name : "Water Gun",
        type : Type.Water,
        pow  : 40,
        acc  : 100,
        pp   : 25,
        effect : noEffect
    });
}
