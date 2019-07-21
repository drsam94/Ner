/// <reference path="../node_modules/excalibur/dist/excalibur.d.ts" />
/// <reference path="./Skills.ts" />
/// <reference path="./Battle.ts" />
class Stage {
    public team : Monster[];
    public name : string;
    public done : boolean = false;

    constructor(name : string, team : Monster[]) {
        this.team = team;
        this.name = name;
    }
}

class StageMenu extends Menu {
    constructor(engine : ex.Engine, stages : Stage[]) {
        const entries : MenuEntry[] = [];
        for (const stage of stages) {
            entries.push(
                new MenuEntry(
                    stage.name,
                    () => {
                        BattleScene.opponentTeam = stage.team;
                        stage.done = true;
                        engine.goToScene("battle");
                    },
                    () => !stage.done
                )
            );
        }
        super(entries, true);
    }
}

class StageScene extends ex.Scene {

    public onInitialize(engine : ex.Engine) {
        const stages : Stage[] = [
            new Stage("Stage1", [new Monster(AllSpecies.Charmander, 5,
                [AllSkills.Scratch, AllSkills.Leer])]),
            new Stage("Stage2", [new Monster(AllSpecies.Charmeleon, 8,
                [AllSkills.Scratch, AllSkills.Leer, AllSkills.Ember])]),
            new Stage("Stage3", [new Monster(AllSpecies.Ivysaur, 5,
                [AllSkills.Tackle, AllSkills.Growl, AllSkills["Vine Whip"]]),
                                new Monster(AllSpecies.Wartortle, 5,
                [AllSkills.Tackle, AllSkills["Tail Whip"]])])
        ];
        const menu = new StageMenu(engine, stages);
        menu.body.pos.x = 0;
        menu.body.pos.y = 0;
        menu.height = ScreenHeight;
        menu.width = ScreenWidth;
        this.add(menu);
    }

    // @override
    public onActivate() {
    }
}
