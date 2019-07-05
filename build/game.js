"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MenuEntry = (function () {
    function MenuEntry(lbl, fun, enabled) {
        this.label = lbl;
        if (fun) {
            this.cb = fun;
        }
        else {
            this.cb = function () { };
        }
        if (enabled) {
            this.enabled = enabled;
        }
        else {
            this.enabled = function () { return true; };
        }
    }
    return MenuEntry;
}());
var Menu = (function (_super) {
    __extends(Menu, _super);
    function Menu(entries, parent) {
        var _this = _super.call(this) || this;
        _this.selectionIdx = 0;
        _this.isActive = true;
        _this.entries = entries;
        _this.parentMenu = parent;
        return _this;
    }
    Menu.prototype.openSub = function (subMenu) {
        this.isActive = false;
        subMenu.parentMenu = this;
        this.scene.add(subMenu);
        subMenu.body.pos.x = this.body.pos.x;
        subMenu.body.pos.y = this.body.pos.y;
        subMenu.width = this.width;
        subMenu.height = this.height;
    };
    Menu.prototype.update = function (engine, delta) {
        if (!this.isActive) {
            return;
        }
        this.updateIdx(engine);
        if (engine.input.keyboard.wasPressed(ex.Input.Keys.Space)) {
            this.entries[this.selectionIdx].cb();
        }
        if (engine.input.keyboard.wasPressed(ex.Input.Keys.Esc)) {
            if (this.parentMenu !== undefined) {
                this.parentMenu.isActive = true;
                this.kill();
            }
        }
    };
    Menu.prototype.updateIdx = function (engine) {
        if (engine.input.keyboard.wasPressed(ex.Input.Keys.Up)) {
            this.selectionIdx -= 1;
        }
        if (engine.input.keyboard.wasPressed(ex.Input.Keys.Down)) {
            this.selectionIdx += 1;
        }
        this.selectionIdx += this.entries.length;
        this.selectionIdx %= this.entries.length;
        if (!this.entries[this.selectionIdx].enabled()) {
            this.updateIdx(engine);
        }
    };
    Menu.prototype.draw = function (ctx, delta) {
        if (!this.isActive) {
            return;
        }
        ctx.fillStyle = "white";
        ctx.fillRect(this.body.pos.x, this.body.pos.y, this.width, this.height);
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.body.pos.x, this.body.pos.y, this.width, this.height);
        var elemHeight = this.height / this.entries.length;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        for (var i = 0; i < this.entries.length; ++i) {
            var entry = this.entries[i];
            ctx.fillStyle = entry.enabled() ? "black" : "gray";
            ctx.font = elemHeight + "px Monaco";
            var yCoord = this.body.pos.y + elemHeight * i;
            ctx.fillText(entry.label, this.body.pos.x, yCoord, this.width);
            if (i === this.selectionIdx) {
                ctx.strokeStyle = "red";
                ctx.strokeRect(this.body.pos.x, yCoord, this.width, elemHeight);
            }
        }
    };
    return Menu;
}(ex.UIActor));
var ScreenWidth = 1200;
var ScreenHeight = 800;
var StartScreen = (function (_super) {
    __extends(StartScreen, _super);
    function StartScreen() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StartScreen.prototype.onInitialize = function (engine) {
        var menu = new Menu([
            new MenuEntry("start", function () {
                engine.goToScene("battle");
            }),
            new MenuEntry("end", function () { alert("done!"); })
        ]);
        menu.body.pos.x = ScreenWidth / 3;
        menu.body.pos.y = ScreenHeight / 3;
        menu.width = ScreenWidth / 3;
        menu.height = ScreenHeight / 3;
        this.add(menu);
    };
    return StartScreen;
}(ex.Scene));
var Type;
(function (Type) {
    Type[Type["Fire"] = 0] = "Fire";
    Type[Type["Water"] = 1] = "Water";
    Type[Type["Grass"] = 2] = "Grass";
})(Type || (Type = {}));
var Skill = (function () {
    function Skill(name, type, pow, acc, pp, effect) {
        this.name = name;
        this.type = type;
        this.pow = pow;
        this.acc = acc;
        this.effect = effect;
        this.pp = pp;
    }
    return Skill;
}());
var SkillItem = (function () {
    function SkillItem(skill) {
        this.skill = skill;
        this.currPP = skill.pp;
    }
    return SkillItem;
}());
var Stats = (function () {
    function Stats(hp, atk, def, spd, spAtk, spDef) {
        this.hp = hp;
        this.atk = atk;
        this.def = def;
        this.spd = spd;
        this.spAtk = spAtk;
        this.spDef = spDef;
    }
    Stats.prototype.copy = function () {
        return new Stats(this.hp, this.atk, this.def, this.spd, this.spAtk, this.spDef);
    };
    Stats.empty = function () {
        return new Stats(0, 0, 0, 0, 0, 0);
    };
    return Stats;
}());
var Species = (function () {
    function Species(name, idx, type) {
        this.name = name;
        this.idx = idx;
        this.type = type;
    }
    return Species;
}());
var Monster = (function () {
    function Monster(species, stats, skills) {
        this.mods = Stats.empty();
        this.stats = stats.copy();
        this.currHP = this.stats.hp;
        this.species = species;
        this.skills = skills;
    }
    return Monster;
}());
var BattleHalf = (function () {
    function BattleHalf(team) {
        this.team = team;
        this.active = team[0];
    }
    return BattleHalf;
}());
var BattleContext = (function (_super) {
    __extends(BattleContext, _super);
    function BattleContext(player, opp) {
        var _this = _super.call(this) || this;
        _this.cachedSprites = {};
        _this.sides = [player, opp];
        return _this;
    }
    BattleContext.prototype.draw = function (ctx, delta) {
        var sprites = [];
        for (var _i = 0, _a = this.sides; _i < _a.length; _i++) {
            var side = _a[_i];
            var idx = side.active.species.idx;
            sprites.push(this.getSprite(idx));
        }
        sprites[0].draw(ctx, ScreenWidth / 3, ScreenHeight * (2 / 3));
        sprites[1].draw(ctx, ScreenWidth * (2 / 3), ScreenHeight * (1 / 3));
    };
    BattleContext.prototype.getSprite = function (idx) {
        var sprite = this.cachedSprites[idx];
        if (sprite === undefined) {
            this.cachedSprites[idx] = Resources.frontSprite(idx);
            return this.cachedSprites[idx];
        }
        return sprite;
    };
    return BattleContext;
}(ex.Actor));
var FightMenu = (function (_super) {
    __extends(FightMenu, _super);
    function FightMenu(monster) {
        var _this = this;
        var entries = [];
        var _loop_1 = function (skillItem) {
            var entry = new MenuEntry(skillItem.skill.name, function () { return alert(skillItem.skill.name); }, function () { return skillItem.currPP > 0; });
            entries.push(entry);
        };
        for (var _i = 0, _a = monster.skills; _i < _a.length; _i++) {
            var skillItem = _a[_i];
            _loop_1(skillItem);
        }
        _this = _super.call(this, entries) || this;
        return _this;
    }
    return FightMenu;
}(Menu));
var BattleMenu = (function (_super) {
    __extends(BattleMenu, _super);
    function BattleMenu(ctx) {
        var _this = this;
        var entries = [
            new MenuEntry("Fight", function () {
                _this.openSub(new FightMenu(ctx.sides[0].active));
            }),
            new MenuEntry("Item", function () { }, function () { return false; }),
            new MenuEntry("Team", function () { }, function () { return false; }),
            new MenuEntry("Run", function () { alert("run"); }, function () { return true; })
        ];
        _this = _super.call(this, entries) || this;
        return _this;
    }
    return BattleMenu;
}(Menu));
var BattleScene = (function (_super) {
    __extends(BattleScene, _super);
    function BattleScene() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BattleScene.prototype.onInitialize = function (engine) {
        var halfs = [];
        for (var i = 0; i < 2; ++i) {
            var spec = new Species("Bulbasaur", 0, Type.Grass);
            var skill = new Skill("Tackle", Type.Grass, 50, 95, 35, function (_1, _2, _3) { });
            var skills = [new SkillItem(skill), new SkillItem(skill), new SkillItem(skill)];
            var stats = new Stats(10, 10, 10, 10, 10, 10);
            var monster = new Monster(spec, stats, skills);
            halfs.push(new BattleHalf([monster]));
        }
        var ctx = new BattleContext(halfs[0], halfs[1]);
        var menu = new BattleMenu(ctx);
        menu.body.pos.x = 0;
        menu.body.pos.y = ScreenHeight * (4 / 5);
        menu.height = ScreenHeight * (1 / 5);
        menu.width = ScreenWidth;
        this.add(menu);
        this.add(ctx);
    };
    BattleScene.prototype.onActive = function () { };
    BattleScene.prototype.onDeactivate = function () { };
    return BattleScene;
}(ex.Scene));
var Resources = (function () {
    function Resources() {
    }
    Resources.getLoader = function () {
        var loader = new ex.Loader();
        loader.addResource(Resources.backSpriteSheet);
        loader.addResource(Resources.frontSpriteSheet);
        loader.logo = "data:image/png;base64,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";
        loader.backgroundColor = "black";
        loader.logoHeight = 250;
        return loader;
    };
    Resources.frontSprite = function (idx) {
        var rowIdx = idx % 12;
        var colIdx = idx / 12;
        var cellSize = 57;
        return new ex.Sprite(Resources.frontSpriteSheet, rowIdx * cellSize, colIdx * cellSize, cellSize, cellSize);
    };
    Resources.backSpriteSheet = new ex.Texture("res/GreenBack.png");
    Resources.frontSpriteSheet = new ex.Texture("res/PokemonGreen.png");
    return Resources;
}());
function init(game) {
    var startScene = new StartScreen(game);
    game.add("startScene", startScene);
    var battleScene = new BattleScene(game);
    game.add("battle", battleScene);
}
function main() {
    var game = new ex.Engine({
        width: ScreenWidth,
        height: ScreenHeight,
        displayMode: ex.DisplayMode.Fixed
    });
    init(game);
    game.backgroundColor = new ex.Color(0, 0, 0);
    game.start(Resources.getLoader()).then(function () { return game.goToScene("startScene"); });
}
document.body.onload = main;
