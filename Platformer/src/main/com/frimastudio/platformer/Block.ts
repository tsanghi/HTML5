///<reference path='../../../../../typedef/easeljs.d.ts' />

class Block extends createjs.Bitmap
{
    realX:number;
    realY:number;

    constructor(contentManager:ContentManager, x:number, y:number)
    {
        super(contentManager.queue.getResult("block"));
        this.x = x * 40;
        this.y = y * 32;
        this.realX = x * 40;
        this.realY = y * 32;

    }

}
