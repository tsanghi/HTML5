///<reference path='../../../../../typedef/easeljs.d.ts' />
///<reference path='../../../../../typedef/soundjs.d.ts' />
///<reference path='Level.ts' />
///<reference path='ContentManager.ts' />

class PlatformerGame
{
    //User action on the keyboard
    KEYCODE_SPACE:number = 32;
    KEYCODE_LEFT:number = 37;
    KEYCODE_RIGHT:number = 39;
    KEYCODE_W:number = 87;
    KEYCODE_Q:number = 81;

    stage:createjs.Stage;
    level:Level;
    camera:Camera;
    contentManager:ContentManager;

    constructor()
    {
        // Little closure needed here
        var instance = this; // store the current context

        // Our hero can be moved with the arrow keys (left, right)
        // And jump with W and shoot with Space
        document.onkeydown = function (e)
        {
            instance.handleKeyDown(e);
        };

        document.onkeyup = function (e)
        {
            instance.handleKeyUp(e);
        };
    }

    init()
    {
        var startButton = document.getElementById("start");
        startButton.style.display = "none";

        var hudinfo = document.getElementById("hudinfo");
        hudinfo.style.display = "block";

        var canvas = document.getElementById("platformerCanvas");
        var canvasCtx = canvas.getContext("2d");
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        this.stage = new createjs.Stage(canvas);
        this.camera = new Camera(0,0,800,0);
        this.contentManager = new ContentManager(this.loadLevel.bind(this));

    }

    loadLevel()
    {
        this.level = new Level(this.stage, this.contentManager, this.camera, this);
        var ressources = eval(this.contentManager.queue.getResult("enTest"));
    }

    startGameLoop()
    {
        //play the sound
        createjs.Sound.play("music");
        createjs.Ticker.addListener(this);
        createjs.Ticker.useRAF = true;
        createjs.Ticker.setFPS(60);
    }

    handleKeyDown(event)
    {
        //cross browser issues exist
        if (!event)
        {
            var event = window.event;
        }
        switch (event.keyCode) {
            case this.KEYCODE_LEFT:
                // We're launching the walk_left animation
                if (this.level.hero.isInIdleMode && this.level.hero.isAlive)
                {
                    this.level.hero.gotoAndPlay("walk");
                    this.level.hero.direction = -1;
                    this.level.hero.isInIdleMode = false;
                }
                break;
            case this.KEYCODE_RIGHT:
                // We're launching the walk_right animation
                if (this.level.hero.isInIdleMode && this.level.hero.isAlive && !this.level.hero.hasReachedExit)
                {
                    this.level.hero.gotoAndPlay("walk_h");
                    this.level.hero.direction = 1;
                    this.level.hero.isInIdleMode = false;
                }
                break;
            case this.KEYCODE_W:
                if (this.level.hero.isAlive && !this.level.hero.hasReachedExit)
                {
                    this.level.hero.isJumping = true;
                }
                else
                {
                    location.reload();
                }
                break;
            case this.KEYCODE_SPACE:
            case this.KEYCODE_Q:
                this.level.hero.isShooting = true;
                break;
        }
    }

    handleKeyUp(event)
    {
        if (!event)
        {
            var event = window.event;
        }
        switch (event.keyCode)
        {
            case this.KEYCODE_LEFT: ;
            case this.KEYCODE_RIGHT:
                if(this.level.hero.isAlive && !this.level.hero.hasReachedExit)
                {
                    this.level.hero.isInIdleMode = true;
                    this.level.hero.gotoAndPlay("idle");
                }
                break;
            case this.KEYCODE_SPACE:
            case this.KEYCODE_Q:
                if(this.level.hero.isAlive && !this.level.hero.hasReachedExit)
                {
                    this.level.hero.isShooting = false;
                }
                break;
        }
    }

    tick()
    {
        console.log("TICK");
        if(!this.level.hasReachExit())
        {
            this.level.hero.tick();
        }

        if(!this.level.monster.isDead)
        {
            this.level.monster.tick();
        }
        this.stage.update();
    }
}
