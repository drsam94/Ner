/// <reference path="./Monster.ts" />
/// <reference path="./SpeciesDefinitions.ts" />
/// <reference path="./Skills.ts" />
/// <reference path="./SkillDefinitions.ts" />

let currentCollection : Monster[] = [];
let currentTeam : Monster[] = [];

class MonsterMenu extends Menu {
    private src : Monster[];
    private dst : Monster[];

    constructor(src : Monster[], dst : Monster[]) {
        super([], true);
        this.src = src;
        this.dst = dst;
        this.populate();
    }

    private populate() {
        const entries : MenuEntry[] = [];
        for (let i = 0; i < this.src.length; ++i) {
            const j = i;
            const mon = this.src[j];
            entries.push(new MenuEntry(mon.species.name,
                () => {
                    this.dst.push(mon);
                    this.src.splice(j, j + 1);
                    this.populate();
                },
                () => this.dst === currentTeam ? currentTeam.length < 6 : currentTeam.length > 1
            ));
        }
        this.resetEntries(entries);
    }
}

class CollectionMenu extends Menu {
    constructor(engine : ex.Engine, parent? : boolean) {
        const entries = [
            new MenuEntry("Withdraw", () => {
                this.openSub(new MonsterMenu(currentCollection, currentTeam));
            }, () => currentTeam.length < 6),
            new MenuEntry("Deposit", () => {
                this.openSub(new MonsterMenu(currentTeam, currentCollection));
            }, () => currentTeam.length > 1)
        ];
        super(entries, true);
        if (parent === undefined) {
            this.onExit = () => {
                engine.goToScene("mainMenu");
            };
        }
    }
}

class CollectionScene extends ex.Scene {

    public onInitialize(engine : ex.Engine) {
        const menu = new CollectionMenu(engine);
        menu.body.pos.x = 0;
        menu.body.pos.y = ScreenHeight * (4 / 5);
        menu.height = ScreenHeight * (1 / 5);
        menu.width = ScreenWidth;
        this.add(menu);
    }
}

// make starting collection

function initCollection() {
    currentTeam.push(
        new Monster(AllSpecies.Bulbasaur, 5,
            [AllSkills.Tackle, AllSkills.Growl, AllSkills["Vine Whip"]]));

    currentCollection.push(
        new Monster(AllSpecies.Squirtle, 5,
            [AllSkills.Tackle, AllSkills["Tail Whip"]]));

    currentCollection.push(
        new Monster(AllSpecies.Charmander, 5,
            [AllSkills.Scratch, AllSkills.Leer]));
}
