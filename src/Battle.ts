/// <reference path="../node_modules/excalibur/dist/excalibur.d.ts" />
/// <reference path="./Menu.ts" />
/// <reference path="./Monster.ts" />
/// <reference path="./Constants.ts" />
/// <reference path="./SkillDefinitions.ts" />
/// <reference path="./SpeciesDefinitions.ts" />
/// <reference path="./Dialog.ts" />
/// <reference path="./CombatMath.ts" />

class BattleHalf {
    public team : Monster[];
    public active : Monster;

    constructor(team : Monster[]) {
        this.team = team;
        this.active = team[0];
    }
}

class BattleContext extends ex.Actor {
    public sides : BattleHalf[];
    private cachedSprites : Record<number, ex.Sprite> = {};
    public dialog = new Dialog();
    private engine : ex.Engine;
    constructor(engine : ex.Engine, player : BattleHalf, opp : BattleHalf) {
        super();
        this.sides = [player, opp];
        this.engine = engine;
    }

    // @override
    public draw(ctx : CanvasRenderingContext2D, delta : any) {
        const sprites : ex.Sprite[] = [];
        for (const side of this.sides) {
            const idx = side.active.species.idx;
            sprites.push(this.getSprite(idx));
        }

        sprites[0].draw(ctx, ScreenWidth / 6, ScreenHeight * (2 / 5));
        sprites[1].draw(ctx, ScreenWidth * (2 / 3), ScreenHeight /  8);

        this.drawHPBar(ctx, this.sides[0].active, new ex.Vector(ScreenWidth * (2 / 3), ScreenHeight * (2 / 5)));
        this.drawHPBar(ctx, this.sides[1].active, new ex.Vector(ScreenWidth / 6, ScreenHeight / 8));
    }

    private getSprite(idx : number) : ex.Sprite {
        let sprite = this.cachedSprites[idx];
        if (sprite === undefined) {
            sprite = Resources.frontSprite(idx);
            this.cachedSprites[idx] = sprite;
            sprite.scale.x *= 3;
            sprite.scale.y *= 3;
        }
        return sprite;
    }

    private drawHPBar(ctx : CanvasRenderingContext2D, mon : Monster, barPos : ex.Vector) {
        ctx.fillStyle = "white";
        const barX = barPos.x;
        const barY = barPos.y;
        const barWidth = ScreenWidth * (1 / 6);
        const barHeight = ScreenHeight * (1 / 24);
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const healthPct = mon.currHP / mon.stats.hp;
        if (healthPct > 0.5) {
            ctx.fillStyle = "green";
        } else if (healthPct > 0.25) {
            ctx.fillStyle = "yellow";
        }  else {
            ctx.fillStyle = "red";
        }

        ctx.fillRect(barX, barY, barWidth * healthPct, barHeight);

        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = barHeight + "px Monaco";
        ctx.fillText(mon.currHP + " / " + mon.stats.hp, barX, barY + barHeight);
    }

    public doAttack(skill : SkillItem, user : Monster) : void {
        let agg = this.sides[0].active;
        let def = this.sides[1].active;
        if (user === def) {
            def = agg;
            agg = user;
        }
        this.dialog.addText(agg.species.name + " used " + skill.skill.name + "!", () => {
            // Compute damage
            CombatMath.apply(skill.skill, agg, def, this);
            skill.currPP -= 1;

            if (def === this.sides[1].active) {
                if (def.currHP > 0) {
                    const moveIdx = Math.floor(Math.random() * def.skills.length);
                    this.doAttack(def.skills[moveIdx], def);
                } else {
                    this.dialog.addText("You Win", () => {
                        this.engine.goToScene("ending");
                    });
                }
            } else if (def.currHP <= 0) {
                this.dialog.addText("You Lose", () => {
                    this.engine.goToScene("ending");
                });
            }
        });
    }
}

class FightMenu extends Menu {
    constructor(ctx : BattleContext, monster : Monster) {
        const entries : MenuEntry[] = [];
        for (const skillItem of monster.skills) {
            const entry = new MenuEntry(skillItem.skill.name,
                () => ctx.doAttack(skillItem, monster),
                () => skillItem.currPP > 0);
            entries.push(entry);
        }
        super(entries);
        ctx.dialog.subscribe(this);
    }
}

class BattleMenu extends Menu {
    constructor(ctx : BattleContext) {
        const entries = [
            new MenuEntry("Fight", () => {
                this.openSub(new FightMenu(ctx, ctx.sides[0].active));
            }),
            new MenuEntry("Item", () => {}, () => false),
            new MenuEntry("Team", () => {}, () => false),
            new MenuEntry("Run", () => { alert("run"); }, () => true)
        ];
        super(entries);
        ctx.dialog.subscribe(this);
    }
}

class BattleScene extends ex.Scene {
    // @override
    public onInitialize(engine : ex.Engine) {
        // Make a manual starting state

        const stats = new Stats(20, 10, 10, 10, 10, 10);
        const playerSkills = [AllSkills.Tackle, AllSkills.Growl];
        const playerMonster = new Monster(AllSpecies.Bulbasaur, 5, stats, playerSkills);

        const oppSkills = [AllSkills.Scratch, AllSkills.Leer];
        const oppMonster = new Monster(AllSpecies.Charmander, 5, stats, oppSkills);

        const ctx = new BattleContext(engine, new BattleHalf([playerMonster]), new BattleHalf([oppMonster]));
        const menu = new BattleMenu(ctx);
        menu.body.pos.x = 0;
        menu.body.pos.y = ScreenHeight * (4 / 5);
        menu.height = ScreenHeight * (1 / 5);
        menu.width = ScreenWidth;
        ctx.dialog.body.pos = menu.body.pos.add(new ex.Vector(0, 0));
        ctx.dialog.height = menu.height;
        ctx.dialog.width = menu.width;
        this.add(ctx.dialog);
        this.add(menu);
        this.add(ctx);
    }

    // @override
    public onActive() {}

    // @override
    public onDeactivate() {}
}
