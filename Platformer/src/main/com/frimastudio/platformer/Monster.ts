///<reference path='../../../../../typedef/easeljs.d.ts' />
///<reference path='Camera.ts' />

class Monster extends createjs.BitmapAnimation
{
    direction:number;
    vX:number;
    vY:number;
    xEndLeft:number;
    xEndRight:number;
    camera:Camera;
    realX:number;
    width:number;
    height:number;
    isDead:bool;

    constructor(imgMonster:Image, x:number, y:number, camera:Camera)
    {
        var localSpriteSheet = new createjs.SpriteSheet
        ({
            images: [imgMonster], //image to use
            frames: {width: 64, height: 64, regX: 32, regY: 32},
            animations: {
                walk: [0, 9, "walk", 4],
                idle: [10, 20, "idle", 4]
            }
        });
        createjs.SpriteSheetUtils.addFlippedFrames(localSpriteSheet, true, false, false);
        super(localSpriteSheet);
        this.camera = camera;
        // start playing the first sequence:
        this.gotoAndPlay("walk_h"); 	//animate
        this.x = x * 40 + 16;
        this.realX = x * 40 + 16;
        this.y = y * 32;
        this.direction = 1;
        // velocity
        this.vX = 1;
        this.vY = 0;
        this.width = 25;
        this.height = 51;
        //TODO change to be more dynamic
        this.xEndLeft = 1000;
        this.xEndRight = 1160;
        // starting directly at the first frame of the walk_h sequence
        this.currentFrame = 21;
        this.isDead = false;
    }

    tick()
    {
        // Moving the sprite based on the direction & the speed
        if(this.realX <= 1000)
        {
            this.gotoAndPlay("walk_h");
            this.direction = 1;

        }
        else if (this.realX >= 1160)
        {
            this.gotoAndPlay("walk");
            this.direction = -1;
        }
        this.realX += this.vX * this.direction;
        this.x = this.realX - this.camera.x;
    }
}
