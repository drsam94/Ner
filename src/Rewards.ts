/// <reference path="./Collection.ts" />
/// <reference path="../node_modules/excalibur/dist/excalibur.d.ts" />

class RewardMenu extends Menu {
    private rewardMons : Monster[];
    constructor(engine : ex.Engine) {
        super([
            new MenuEntry("Collection",
                () => this.openSub(new CollectionMenu(engine, true))),
            new MenuEntry("CollectReward",
                () => this.openSub(new MonsterMenu(this.rewardMons, currentTeam)))
        ]);
        this.onExit = () => {
            engine.goToScene("stageSelect");
        };
        this.rewardMons = [];
    }

    public setRewardMon(mon : Monster) {
        this.rewardMons.length = 0;
        this.rewardMons.push(mon);
    }
}

class RewardScene extends ex.Scene {
    private engine? : ex.Engine;
    public onInitialize(engine : ex.Engine) {
        this.engine = engine;
    }

    public onActivate() {
        if (this.engine === undefined) {
            return;
        }
        const menu = new RewardMenu(this.engine);
        menu.body.pos.x = 0;
        menu.body.pos.y = ScreenHeight * (4 / 5);
        menu.height = ScreenHeight * (1 / 5);
        menu.width = ScreenWidth;
        this.add(menu);
        menu.setRewardMon(new Monster(AllSpecies.Blastoise, 6,
            new Stats(25, 11, 11, 11, 11, 11),
            [AllSkills.Tackle, AllSkills.Growl, AllSkills["Water Gun"]]));
    }
}
