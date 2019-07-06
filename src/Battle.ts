/// <reference path="../node_modules/excalibur/dist/excalibur.d.ts" />
/// <reference path="./Menu.ts" />
/// <reference path="./Monster.ts" />
/// <reference path="./Constants.ts" />
/// <reference path="./Skills.ts" />
/// <reference path="./SkillDefinitions.ts" />
/// <reference path="./SpeciesDefinitions.ts" />
/// <reference path="./Dialog.ts" />
/// <reference path="./CombatMath.ts" />
/// <reference path="./Rect.ts" />

class BattleHalf {
    public team : Monster[];
    public active : Monster;

    constructor(team : Monster[]) {
        this.team = team;
        this.active = team[0];
    }

    public liveCount() : number {
        let ret = 0;
        for (const mon of this.team) {
            if (mon.currHP > 0) {
                ++ret;
            }
        }
        return ret;
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

        const rect = new Rect(ScreenWidth * (2 / 3),
                              ScreenHeight * (1 / 2),
                              ScreenWidth * (1 / 6),
                              ScreenHeight * (1 / 24));
        this.drawHPBar(ctx, this.sides[0].active, rect);
        this.drawBalls(ctx, this.sides[0].team, rect);
        rect.x = ScreenWidth / 6;
        rect.y = ScreenHeight / 8;
        this.drawHPBar(ctx, this.sides[1].active, rect);
        this.drawBalls(ctx, this.sides[1].team, rect);
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

    private drawHPBar(ctx : CanvasRenderingContext2D, mon : Monster, barPos : Rect) : void {
        ctx.fillStyle = "white";
        const barX = barPos.x;
        const barY = barPos.y;
        const barWidth = barPos.w;
        const barHeight = barPos.h;
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

    private drawBalls(ctx : CanvasRenderingContext2D, team : Monster[], rect : Rect) : void {
        let ballX = rect.x;
        const ballRadius = (rect.w / 6 - 3) / 2;
        for (let i = 0; i < 6; ++i) {
            ctx.beginPath();

            ctx.arc(ballX + ballRadius, rect.y - ballRadius, ballRadius,
                0, 2 * Math.PI);
            ctx.strokeStyle = "white";
            ctx.stroke();
            if (i >= team.length) {
                // No pokemon, just stroke;
            } else if (team[i].currHP === 0) {
                // fainted
                ctx.fillStyle = "red";
                ctx.fill();
            } else {
                ctx.fillStyle = "green";
                ctx.fill();
            }

            ballX += rect.w / 6;

        }
    }

    public enemyTurn(menu : Menu) {
        const enemy = this.sides[1].active;
        const moveIdx = Math.floor(Math.random() * enemy.skills.length);
        this.doAttack(enemy.skills[moveIdx], enemy, menu);
    }

    public doAttack(skill : SkillItem, user : Monster, menu : Menu) : void {
        let agg = this.sides[0].active;
        let def = this.sides[1].active;
        if (user === def) {
            def = agg;
            agg = user;
        }
        this.dialog.addText(agg.species.name + " used " + skill.skill.name + "!", () => {
            // Compute damage
            const result = CombatMath.apply(skill.skill, agg, def, this);
            skill.currPP -= 1;
            if (result === AttackResult.Miss) {
                this.dialog.addText(agg.species.name + "missed!");
            }

            if (def === this.sides[1].active) {
                if (def.currHP > 0) {
                    this.enemyTurn(menu);
                } else {
                    this.dialog.addText("You Win", () => {
                        this.engine.goToScene("ending");
                    });
                }
            } else if (def.currHP <= 0) {
                if (this.sides[0].liveCount() === 0) {
                    this.dialog.addText("You Lose", () => {
                        this.engine.goToScene("ending");
                    });
                } else {
                    this.dialog.addText(def.species.name + " fainted", () => {
                        this.dialog.clearReenable();
                        const smenu = new SwapMenu(this);
                        menu.openSub(smenu);
                    });
                }
            }
        });
    }
}

class FightMenu extends Menu {
    constructor(ctx : BattleContext, monster : Monster) {
        const entries : MenuEntry[] = [];
        for (const skillItem of monster.skills) {
            const entry = new MenuEntry(FightMenu.drawLabel(skillItem),
                () => ctx.doAttack(skillItem, monster, this),
                () => skillItem.currPP > 0);
            entries.push(entry);
        }
        super(entries);
        ctx.dialog.subscribe(this);
    }

    private static drawLabel(skillItem : SkillItem) : DrawFun {
        return (ctx : CanvasRenderingContext2D, rect : Rect, ent : MenuEntry) => {

            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            const textColor = ent.enabled() ? "black" : "gray";
            ctx.fillStyle = textColor;
            ctx.font = rect.h + "px Monaco";
            const nameWidth = ctx.measureText(skillItem.skill.name).width;
            ctx.fillText(skillItem.skill.name, rect.x, rect.y, rect.w);

            rect.x += nameWidth + 10;
            rect.w -= nameWidth + 10;

            const type = skillItem.skill.type;
            const typeWidth = ctx.measureText(Type[type]).width;
            ctx.fillStyle = typeToColor(type);
            ctx.fillRect(rect.x, rect.y, typeWidth, rect.h);
            ctx.fillStyle = textColor;
            ctx.fillText(Type[type], rect.x, rect.y, rect.w);

            rect.x += typeWidth;
            rect.w -= typeWidth;

            ctx.textAlign = "right";

            const ppText = skillItem.currPP + " / " + skillItem.skill.pp;
            ctx.fillText(ppText, rect.x + rect.w, rect.y, rect.w);
        };
    }
}

class SwapMenu extends Menu {
    constructor(ctx : BattleContext, menu? : BattleMenu) {
        super([]);
        const half : BattleHalf = ctx.sides[0];
        for (const mon of half.team) {
            this.entries.push(new MenuEntry(
                mon.species.name,
                () => {
                    ctx.dialog.addText("Player sent out " + mon.species.name,
                    () => {
                        half.active = mon;
                        this.close();
                        if (menu) {
                            ctx.enemyTurn(menu);
                        }
                    });
                },
                () => mon !== half.active && mon.currHP > 0
            ));
        }
        ctx.dialog.subscribe(this);
        // If this was opened from the battle menu, we can close and go
        // back there
        this.canBeClosed = menu !== undefined;
    }
}

class BattleMenu extends Menu {
    constructor(ctx : BattleContext) {
        const entries = [
            new MenuEntry("Fight", () => {
                this.openSub(new FightMenu(ctx, ctx.sides[0].active));
            }),
            new MenuEntry("Item", () => {}, () => false),
            new MenuEntry("Team", () => {
                this.openSub(new SwapMenu(ctx, this));
            }, () => ctx.sides[0].liveCount() > 1 ),
            new MenuEntry("Run", () => { alert("run"); }, () => true)
        ];
        super(entries);
        ctx.dialog.subscribe(this);
        this.canBeClosed = false;
    }
}

class BattleScene extends ex.Scene {
    private ctx? : BattleContext;
    // @override
    public onInitialize(engine : ex.Engine) {
        // Make a manual starting state

        const stats = new Stats(20, 10, 10, 10, 10, 10);

        const oppSkills = [AllSkills.Scratch, AllSkills.Leer];
        const oppMonster = new Monster(AllSpecies.Charmander, 5, stats, oppSkills);

        const ctx = new BattleContext(engine, new BattleHalf(currentTeam), new BattleHalf([oppMonster]));
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
        this.ctx = ctx;
    }

    // @override
    public onActivate() {
        if (!this.ctx) {
            return;
        }
        const stats = new Stats(25, 11, 11, 11, 11, 11);

        const oppSkills = [AllSkills.Scratch, AllSkills.Leer];
        const oppMonster = new Monster(AllSpecies.Charmander, 8, stats, oppSkills);
        this.ctx.sides = [
            new BattleHalf(currentTeam),
            new BattleHalf([oppMonster])
        ];
    }

    // @override
    public onDeactivate() {}
}
