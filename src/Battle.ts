// tslint:disable-next-line: no-reference
/// <reference path="../node_modules/excalibur/dist/excalibur.d.ts" />
/// <reference path="./Menu.ts" />
/// <reference path="./Monster.ts" />
/// <reference path="./Constants.ts" />

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
    constructor(player : BattleHalf, opp : BattleHalf) {
        super();
        this.sides = [player, opp];
    }

    // @override
    public draw(ctx : CanvasRenderingContext2D, delta : any) {
        const sprites : ex.Sprite[] = [];
        for (const side of this.sides) {
            const idx = side.active.species.idx;
            sprites.push(this.getSprite(idx));
        }

        sprites[0].draw(ctx, ScreenWidth / 3, ScreenHeight * (2 / 3));
        sprites[1].draw(ctx, ScreenWidth * (2 / 3), ScreenHeight * (1 / 3));
    }

    private getSprite(idx : number) : ex.Sprite {
        const sprite = this.cachedSprites[idx];
        if (sprite === undefined) {
            this.cachedSprites[idx] = Resources.frontSprite(idx);
            return this.cachedSprites[idx];
        }
        return sprite;
    }
}

class FightMenu extends Menu {
    constructor(monster : Monster) {
        const entries : MenuEntry[] = [];
        for (const skillItem of monster.skills) {
            const entry = new MenuEntry(skillItem.skill.name,
                () => alert(skillItem.skill.name),
                () => skillItem.currPP > 0);
            entries.push(entry);
        }
        super(entries);
    }
}

class BattleMenu extends Menu {
    constructor(ctx : BattleContext) {
        const entries = [
            new MenuEntry("Fight", () => {
                this.openSub(new FightMenu(ctx.sides[0].active));
            }),
            new MenuEntry("Item", () => {}, () => false),
            new MenuEntry("Team", () => {}, () => false),
            new MenuEntry("Run", () => { alert("run"); }, () => true)
        ];
        super(entries);
    }
}
class BattleScene extends ex.Scene {
    // @override
    public onInitialize(engine : ex.Engine) {
        // Make a nonesense starting state
        const halfs : BattleHalf[] = [];
        for (let i = 0; i < 2; ++i) {
            const spec = new Species("Bulbasaur", 0, Type.Grass);
            const skill = new Skill("Tackle", Type.Grass, 50, 95, 35, (_1, _2, _3) => {});
            const skills = [new SkillItem(skill), new SkillItem(skill), new SkillItem(skill)];
            const stats = new Stats(10, 10, 10, 10, 10, 10);
            const monster = new Monster(spec, stats, skills);
            halfs.push(new BattleHalf([monster]));
        }
        const ctx = new BattleContext(halfs[0], halfs[1]);
        const menu = new BattleMenu(ctx);
        menu.body.pos.x = 0;
        menu.body.pos.y = ScreenHeight * (4 / 5);
        menu.height = ScreenHeight * (1 / 5);
        menu.width = ScreenWidth;
        this.add(menu);
        this.add(ctx);
    }

    // @override
    public onActive() {}

    // @override
    public onDeactivate() {}
}
