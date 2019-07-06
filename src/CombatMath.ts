/// <reference path="./Monster.ts" />
/// <reference path="./Skills.ts" />
/// <reference path="./Battle.ts" />

enum AttackResult {
    Hit,
    Miss
}

class CombatMath {
    public static apply(skill : Skill, agg : Monster, defender : Monster, ctx : BattleContext) : AttackResult {

        const accRoll = Math.random() * 100;
        if (accRoll > skill.acc) {
            return AttackResult.Miss;
        }
        if (skill.pow === 0) {

        }  else {
            const modifier = (Math.random() * 0.15) + 0.85;
            const atk = CombatMath.getEff(agg, "atk");
            const def = CombatMath.getEff(defender, "def");
            const lvlComp = 2 + (2 * agg.level / 5);
            const damage = modifier * (
                (lvlComp * skill.pow * atk / def) / 50 + 2
            );
            defender.currHP -= Math.round(damage);
            defender.currHP = Math.max(0, defender.currHP);
        }

        skill.effect(agg, defender, ctx);
        return AttackResult.Hit;
    }

    public static getEff(mon : Monster, prop : string) : number {
        const mod = (mon.mods as any)[prop];
        const base = (mon.stats as any)[prop];

        if (mod > 0) {
            return ((3 + mod) / 3) * base;
        } else {
            return (3 / (3 - mod)) * base;
        }
    }
}
