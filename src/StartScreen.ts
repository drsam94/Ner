/// <reference path="../node_modules/excalibur/dist/excalibur.d.ts" />
/// <reference path="./Menu.ts" />
/// <reference path="./Constants.ts" />
/// <reference path="./Collection.ts" />

class StartScreen extends ex.Scene {
    public onInitialize(engine : ex.Engine) : void {
        const menu = new Menu(
            [
                new MenuEntry("battle", () => {
                    engine.goToScene("stageSelect");
                }),
                new MenuEntry("collection", () => {
                    engine.goToScene("collection");
                })
            ]
        );
        menu.body.pos.x = ScreenWidth / 3;
        menu.body.pos.y = ScreenHeight / 3;
        menu.width = ScreenWidth / 3;
        menu.height = ScreenHeight / 3;
        this.add(menu);
    }
}
