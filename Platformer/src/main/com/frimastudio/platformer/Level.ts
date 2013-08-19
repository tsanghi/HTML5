///<reference path='../../../../../typedef/easeljs.d.ts' />
///<reference path='Player.ts' />
///<reference path='PlatformerHelper.ts' />
///<reference path='Block.ts' />
///<reference path='Monster.ts' />
///<reference path='Gun.ts' />

class Level
{
    stage:createjs.Stage;
    hero:Player = null;
    textWorld:Object = null;
    blocks:Object = null;
    exit:Object = null;
    monster:Monster;
    contentManager:ContentManager;
    camera:Camera;
    levelWidth:number;
    levelHeight:number;
    gun:Gun;
    canvasOverlay:Object;
    canvasOverlayCtx:Object;
    platformerGame:PlatformerGame;
    hardcoreLevel:string;

    constructor(stage:createjs.Stage, contentManager:ContentManager, camera:Camera, platformerGame:PlatformerGame)
    {
        this.stage = stage;
        this.contentManager = contentManager;
        this.textWorld = PlatformerHelper.matrix(15, 30, "|");
        this.blocks = PlatformerHelper.matrix(15, 30, "|");
        this.camera = camera;
        this.levelWidth = 30;
        this.levelHeight = 15;
        this.platformerGame = platformerGame;
        this.hardcoreLevel = ".......................................................................................................................................................................................................................................................g............................###......................................................###...###................................................1.......................A....x##############################";
        this.initCanvasOverlay();
        this.createBackground();
        this.getFileWorld();
    }

    initCanvasOverlay()
    {
        //Create the overlay canvas
        this.canvasOverlay = document.createElement("canvas");
        var container = document.getElementById("container");
        container.appendChild(this.canvasOverlay);
        this.canvasOverlayCtx = this.canvasOverlay.getContext("2d");

        this.canvasOverlay.setAttribute('width', 358);
        this.canvasOverlay.setAttribute('height', 180);
        // We center it
        var statusX = (800 - 358) / 2;
        var statusY = (400 - 180) / 2;
        this.canvasOverlay.style.position = 'absolute';
        this.canvasOverlay.style.top = statusY + "px";
        this.canvasOverlay.style.left = statusX + "px";
    }

    createBackground()
    {
        this.stage.addChild(new createjs.Bitmap(this.contentManager.queue.getResult("layer00")));
        this.stage.addChild(new createjs.Bitmap(this.contentManager.queue.getResult("layer10")));
        this.stage.addChild(new createjs.Bitmap(this.contentManager.queue.getResult("layer20")));
    }

    getFileWorld()
    {
        try
        {
            //TODO Refactor to use jQuery ajax call
            var world = "file:///C:/dev/ManticoreTemplates/Formation/formation-html5/Platformer/levels/0.txt";
            var request = new XMLHttpRequest();
            request.open('GET', world, true);

            // Little closure
            var instance = this;
            request.onreadystatechange = function ()
            {
                instance.onWorldReady(this);
            };
            request.send(null);
        }
        catch (e)
        {
            this.loadTextWorld(this.hardcoreLevel);
        }
    }

    loadTextWorld(worldLine)
    {
        for (var l = 0; l < 15; l++)
        {
            for (var c = 0; c < 30; c++)
            {
                this.textWorld[l][c] = worldLine.charAt((l * 30) + c);
            }
        }

        this.loadWorld();
    }

    onWorldReady(eventResult)
    {
       if(eventResult.readyState == 4)
       {
           var worldLine = eventResult.responseText.replace(/[\n\r\t]/g, '');
           this.loadTextWorld(worldLine);
       }
    }

    loadWorld()
    {
        for (var l = 0; l < 15; l++)
        {
            for (var c = 0; c < 30; c++)
            {
                this.loadWorldElement(this.textWorld[l][c], l, c);
            }
        }
        this.startLevel();
    }

    loadWorldElement(type, l, c)
    {
        switch (type)
        {
            //Block
            case '#':
                this.blocks[l][c] = new Block(this.contentManager, c, l);
                break;
            //Hero
            case '1':
                if(this.hero == null)
                {
                    this.hero = new Player(this.contentManager.queue.getResult("hero"), this, c, l, this.camera);
                }
                break;
            //Monster
            case 'A':
                if(this.monster == null)
                {
                    this.monster = new Monster(this.contentManager.queue.getResult("monster"), c, l, this.camera);
                }
                break;
            //gun
            case 'g':
                this.gun =  new Gun(this.contentManager, c, l, this.camera);
                break;
            //exit
            case 'x':
                this.exit = new createjs.Bitmap(this.contentManager.queue.getResult("exit"));
                this.exit.x = c * 40;
                this.exit.y = l * 32;
                this.exit.realX = c * 40;
                this.exit.realY = l * 32;
                this.exit.width = 40;
                this.exit.height = 32;
                break;
        }
    }

    startLevel()
    {
        //this.hero = new Player(this.contentManager.queue.getResult("hero"), this);
        for (var i = 0; i < 15; i++)
        {
            for (var j = 0; j < 30; j++)
            {
                if(this.blocks[i][j] != "|")
                {
                    this.stage.addChild(this.blocks[i][j]);
                }
            }
        }
        this.stage.addChild(this.hero);
        this.stage.addChild(this.monster);
        this.stage.addChild(this.gun);
        this.stage.addChild(this.exit);
        this.platformerGame.startGameLoop();
    }

    tick()
    {
        //Move blocks
        for (var i = 0; i < 15; i++)
        {
            for (var j = 0; j < 30; j++)
            {
                if(this.blocks[i][j] != "|")
                {
                    this.blocks[i][j].x = this.blocks[i][j].realX - this.camera.x;
                }
            }
        }

        this.exit.x = this.exit.realX - this.camera.x;
        if(this.hero.hasGun)
        {
            this.stage.removeChild(this.gun);
            var gunhud = document.getElementById("gunhud");
            gunhud.style.display = "inline";
        }
        else
        {
            //Move gun with the camera
            this.gun.tick();
        }

        //check if the hero has reached the exit
        if(!this.hero.hasReachedExit)
        {
            var heroHasReachedExit = this.hasReachExit();
            if(heroHasReachedExit)
            {
                this.hero.onReachedExit();
                this.canvasOverlay.style.display = "block";
                this.canvasOverlayCtx.clearRect(0, 0, this.contentManager.queue.getResult("win").width, this.contentManager.queue.getResult("win").height);
                this.canvasOverlayCtx.drawImage(this.contentManager.queue.getResult("win"), 0, 0);
            }
        }

        //check if the hero died
        if(!this.hero.isAlive)
        {
            var lifePoint = document.getElementById("lifePoint");
            lifePoint.innerText = "x 0";
            this.canvasOverlay.style.display = "block";
            this.canvasOverlayCtx.clearRect(0, 0, this.contentManager.queue.getResult("died").width, this.contentManager.queue.getResult("died").height);
            this.canvasOverlayCtx.drawImage(this.contentManager.queue.getResult("died"), 0, 0);
        }

    }

    hasReachExit()
    {
        if (this.exit.x <= this.hero.x && this.hero.x < this.exit.x + this.exit.width && this.exit.y <= (this.hero.y - 32))
            return (this.hero.y - 32) < this.exit.y + this.exit.height;
        else
            return false;
    }

    getCollision(x:number, y:number)
    {
        // Prevent escaping past the level ends.
        if (x < 0 || x >= this.levelWidth)
        {
            return true;
        }
        // Allow jumping past the level top and falling through the bottom.
        if (y < 0 || y >= this.levelHeight)
        {
            return false;
        }
        if(this.blocks[y][x] != "|")
        {
            return true;
        }
        else
        {
            return false;
        }

    }

    getBounds(x:number, y:number)
    {
        return new createjs.Rectangle(x * 40, y * 32, 40, 32);
    }
}
