/// <reference path="../node_modules/excalibur/dist/excalibur.d.ts" />
/// <reference path="./Rect.ts" />

type DrawFun = (_1: CanvasRenderingContext2D, _2: Rect, _3: MenuEntry) => void;
class MenuEntry {
    public readonly cb: () => void;
    public readonly enabled: () => boolean;
    public readonly drawFun: DrawFun;

    constructor(lbl: string | DrawFun, fun?: () => void, enabled?: () => boolean) {
        if (typeof lbl === "string") {
            this.drawFun = (ctx: CanvasRenderingContext2D, rect: Rect, _) => {
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                ctx.fillStyle = this.enabled() ? "black" : "gray";
                ctx.font = rect.h + "px Monaco";
                ctx.fillText(lbl, rect.x, rect.y, rect.w);
            };
        } else {
            this.drawFun = lbl;
        }
        if (fun) {
            this.cb = fun;
        } else {
            this.cb = () => { };
        }

        if (enabled) {
            this.enabled = enabled;
        } else {
            this.enabled = () => true;
        }
    }
}

class Menu extends ex.UIActor {
    protected entries: MenuEntry[];
    protected selectionIdx: number = 0;
    public isActive: boolean = true;
    protected onExit?: () => void = () => { };
    private canBeClosed: boolean;

    constructor(entries: MenuEntry[], canBeClosed: boolean) {
        super();
        this.canBeClosed = canBeClosed;
        this.entries = [];
        this.resetEntries(entries);
    }

    protected resetEntries(entries: MenuEntry[]) {
        this.entries = entries;
        if (this.canBeClosed) {
            this.entries.push(new MenuEntry(
                "exit",
                () => this.close(),
                () => this.canBeClosed
            ));
        }
        this.selectionIdx = 0;
    }

    public openSub(subMenu: Menu) {
        this.isActive = false;
        this.scene.add(subMenu);
        subMenu.body.pos.x = this.body.pos.x;
        subMenu.body.pos.y = this.body.pos.y;
        subMenu.width = this.width;
        subMenu.height = this.height;
        subMenu.onExit = () => {
            this.isActive = true;
            this.selectionIdx = 0;
        };

    }

    public close(): void {
        if (this.onExit !== undefined) {
            this.onExit();
        }
    }

    // @override
    public update(engine: ex.Engine, delta: any): void {
        if (!this.isActive) {
            return;
        }
        if (this.entries.length === 0) {
            this.close();
            return;
        }
        this.updateIdx(engine);

        if ((engine.input.keyboard.wasPressed(ex.Input.Keys.Space) ||
            engine.input.keyboard.wasPressed(ex.Input.Keys.Enter)) &&
            this.entries[this.selectionIdx].enabled()) {
            this.entries[this.selectionIdx].cb();
            return;
        }

        if (engine.input.keyboard.wasPressed(ex.Input.Keys.Esc)) {
            if (this.canBeClosed && this.onExit !== undefined) {
                this.onExit();
            }
        }
    }

    private updateIdx(engine: ex.Engine): void {
        const initIndex = this.selectionIdx;
        do {
            // Assumes all menus are vertical with idx 0 at the top
            if (engine.input.keyboard.wasPressed(ex.Input.Keys.Up)) {
                this.selectionIdx -= 1;
            }

            if (engine.input.keyboard.wasPressed(ex.Input.Keys.Down)) {
                this.selectionIdx += 1;
            }

            this.selectionIdx += this.entries.length;
            this.selectionIdx %= this.entries.length;

        } while (this.selectionIdx !== initIndex && !this.entries[this.selectionIdx].enabled());
    }

    // @override
    public draw(ctx: CanvasRenderingContext2D, delta: any) {
        if (!this.isActive) {
            return;
        }
        ctx.fillStyle = "white";
        ctx.fillRect(this.body.pos.x, this.body.pos.y, this.width, this.height);
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.body.pos.x, this.body.pos.y, this.width, this.height);
        const elemHeight = this.height / this.entries.length;
        for (let i = 0; i < this.entries.length; ++i) {
            const entry = this.entries[i];
            const yCoord = this.body.pos.y + elemHeight * i;
            entry.drawFun(ctx, new Rect(this.body.pos.x, yCoord, this.width, elemHeight), entry);
            if (i === this.selectionIdx) {
                ctx.strokeStyle = "red";
                ctx.strokeRect(this.body.pos.x, yCoord, this.width, elemHeight);
            }
        }
    }
}
