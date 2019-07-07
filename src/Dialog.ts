/// <reference path="../node_modules/excalibur/dist/excalibur.d.ts" />
interface Activatable {
    isActive : boolean;
}

interface DialogEvent {
    text : string;
    cb : () => void;
}
class Dialog extends ex.Actor {
    private displayText : DialogEvent[] = [];
    private subscribers : Activatable[] = [];
    private toReenable : Activatable[] = [];
    private textReadyToAdvance = false;
    public subscribe(obj : Activatable) : void {
        this.subscribers.push(obj);
        if (this.displayText.length > 0) {
            obj.isActive = false;
        }
    }

    public addText(txt : string, fun? : () => void) : void {
        const f = fun === undefined ? () => {} : fun;
        this.displayText.push({ text : txt, cb : f });
        if (this.displayText.length === 1) {
            for (const obj of this.subscribers) {
                if (obj.isActive) {
                    this.toReenable.push(obj);
                }
                obj.isActive = false;
            }
            this.textReadyToAdvance = false;
        }

    }

    public update(engine : ex.Engine, delta : any) : void {
        if (this.displayText.length === 0) {
            return;
        }
        if (!this.textReadyToAdvance) {
            // TODO: draw/scroll text
            this.textReadyToAdvance = true;
            return;
        }
        if (engine.input.keyboard.wasPressed(ex.Input.Keys.Space) ||
            engine.input.keyboard.wasPressed(ex.Input.Keys.Enter)) {
            this.advanceText();
        }
    }

    // @override
    public draw(ctx : CanvasRenderingContext2D, delta : any) {
        if (this.displayText.length === 0) {
            return;
        }
        ctx.fillStyle = "white";
        ctx.fillRect(this.body.pos.x, this.body.pos.y, this.width, this.height);
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = this.height / 2 + "px Monaco";
        ctx.fillText(this.displayText[0].text, this.body.pos.x, this.body.pos.y, this.width);
    }

    private advanceText() : void {
        if (this.displayText.length === 0) {
            return;
        }
        const front = this.displayText.shift();
        if (!front) {
            throw Error("can't happen");
        }
        front.cb();
        if (this.displayText.length === 0) {
            for (const obj of this.toReenable) {
                obj.isActive = true;
            }
            this.toReenable = [];
        }
        this.textReadyToAdvance = false;
    }

    public clearReenable() : void {
        this.toReenable.length = 0;
    }
}
