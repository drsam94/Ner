/// <reference path="../node_modules/excalibur/dist/excalibur.d.ts" />
/// <reference path="./StartScreen.ts" />
/// <reference path="./Battle.ts" />
/// <reference path="./Constants.ts" />
/// <reference path="./Resources.ts" />

function init(game : ex.Engine) : void {
    const startScene = new StartScreen(game);
    game.add("startScene", startScene);
    const battleScene = new BattleScene(game);
    game.add("battle", battleScene);
}

function main() : void {
    const game = new ex.Engine({
        width: ScreenWidth,
        height: ScreenHeight,
        displayMode: ex.DisplayMode.Fixed
    });

    init(game);

    // Start the engine to begin the game.
    game.backgroundColor = new ex.Color(0, 0, 0);
    game.start(Resources.getLoader()).then(() => game.goToScene("startScene"));
}

document.body.onload = main;
