/**
 * Created with JetBrains WebStorm.
 * User: vthi
 * Date: 13-07-02
 * Time: 13:18
 * To change this template use File | Settings | File Templates.
 */
class Gun extends createjs.Bitmap
{
    realX:number;
    realY:number;
    camera:Camera;
    width:number;
    height:number;

    constructor(contentManager:ContentManager, x:number, y:number, camera:Camera)
    {
        super(contentManager.queue.getResult("gun"));
        this.x = x * 40;
        this.y = y * 32 +32;
        this.regY = 32;
        this.realX = x * 40;
        this.realY = y * 32+32;
        this.camera = camera;
        this.width = 32;
        this.height = 37;
    }

    tick()
    {
        this.x = this.realX - this.camera.x;
    }
}
