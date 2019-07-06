/// <reference path="../node_modules/excalibur/dist/excalibur.d.ts" />

class MenuEntry {
    public readonly label : string;
    public readonly cb : () => void;
    public readonly enabled : () => boolean;

    constructor(lbl : string, fun? : () => void, enabled? : () => boolean) {
        this.label = lbl;
        if (fun) {
            this.cb = fun;
        } else {
            this.cb = () => {};
        }

        if (enabled) {
            this.enabled = enabled;
        } else {
            this.enabled = () => true;
        }
    }
}

class Menu extends ex.UIActor {
    public entries : MenuEntry[];
    private selectionIdx : number = 0;
    private parentMenu? : Menu;
    public isActive : boolean = true;

    constructor(entries : MenuEntry[], parent? : Menu) {
        super();
        this.entries = entries;
        this.parentMenu = parent;
    }

    public openSub(subMenu : Menu) {
        this.isActive = false;
        subMenu.parentMenu = this;
        this.scene.add(subMenu);
        subMenu.body.pos.x = this.body.pos.x;
        subMenu.body.pos.y = this.body.pos.y;
        subMenu.width = this.width;
        subMenu.height = this.height;
    }

    // @override
    public update(engine : ex.Engine, delta : any) : void {
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
    }

    private updateIdx(engine : ex.Engine) : void {
        // Assumes all menus are vertical with idx 0 at the top
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
    }

    // @override
    public draw(ctx : CanvasRenderingContext2D, delta : any) {
        if (!this.isActive) {
            return;
        }
        ctx.fillStyle = "white";
        ctx.fillRect(this.body.pos.x, this.body.pos.y, this.width, this.height);
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.body.pos.x, this.body.pos.y, this.width, this.height);
        const elemHeight = this.height / this.entries.length;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        for (let i = 0; i < this.entries.length; ++i) {
            const entry = this.entries[i];
            ctx.fillStyle = entry.enabled() ? "black" : "gray";
            ctx.font = elemHeight + "px Monaco";
            const yCoord = this.body.pos.y + elemHeight * i;
            ctx.fillText(entry.label, this.body.pos.x, yCoord, this.width);
            if (i === this.selectionIdx) {
                ctx.strokeStyle = "red";
                ctx.strokeRect(this.body.pos.x, yCoord, this.width, elemHeight);
            }
        }
    }
}
