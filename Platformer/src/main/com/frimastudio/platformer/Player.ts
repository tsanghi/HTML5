///<reference path='../../../../../typedef/easeljs.d.ts' />
///<reference path='Camera.ts' />
///<reference path='PlatformerHelper.ts' />

/**
 * ...
 * @author vthi
 */
class Player extends createjs.BitmapAnimation
{
    // Constants for controling horizontal movement
    MOVE_ACCELERATION:number = 13000.0;
    MAX_MOVE_SPEED:number = 1750.0;
    GROUND_DRAG_FACTOR:number = 0.48;
    AIR_DRAG_FACTOR:number = 0.58;
    // Constants for controlling vertical movement
    MAX_JUMP_TIME:number = 0.35;
    JUMP_LAUNCH_VELOCITY:number = -5000.0;
    GRAVITY_ACCELERAION:number = 1800.0;
    MAX_FALL_SPEED:number = 550.0;
    JUMP_CONTROL_POWER:number = 0.14;
    GUN_RANGE:number = 200;

    isAlive: bool;
    isInIdleMode: bool;
    isJumping:bool;
    isOnGround:bool;
    isShooting:bool;
    wasJumping:bool;
    hasGun:bool;
    hasReachedExit:bool;

    realX: number;
    realY:number;
    bounds:number;
    hit:number;
    // 1 = right & -1 = left
    direction:number;
    vX:number;
    vY:number;
    level:Level;
    camera:Camera;
    elapsed:number;
    jumpTime:number;
    previousBottom:number;
    bullet:createjs.Shape = null;

    frameWidth:number;
    frameHeight:number;

    // Calculate bounds within texture size.
    width:number;
    left:number;
    height:number;
    top:number;
    localBounds:createjs.Rectangle;


    constructor(imgPlayer:Image, level:Level, x:number, y:number, camera:Camera)
    {
        var localSpriteSheet = new createjs.SpriteSheet
        ({
            images: [imgPlayer], //image to use
            frames: { width:64, height:64, regX:32, regY: 64 },
            animations:
            {
                walk: [0, 9, "walk", 4],
                die: [10, 21, false, 4],
                jump: [22, 32, false],
                celebrate: [33, 43, false, 4],
                idle: [44, 44]
            }
        });
        createjs.SpriteSheetUtils.addFlippedFrames(localSpriteSheet, true, false, false);
        super(localSpriteSheet);
        this.gotoAndPlay("idle");
        this.isInIdleMode = true;
        this.isAlive = true;

        // starting directly at the first frame of the walk_h sequence
        this.currentFrame = 66;

        //Size of the Bounds for the collision's tests
        this.bounds = 28;
        this.hit = this.bounds;
        this.x = x * 40;
        this.realX = x * 40;
        this.y = (y + 1) * 32;
        this.realY = (y + 1) * 32;
        this.direction = 0;
        // velocity
        this.vX = 4;
        this.vY = 0;
        this.level = level;
        this.camera = camera;
        //Simulate elapsed time
        this.elapsed = 0.017;
        this.isOnGround = true;

        this.frameWidth = this.spriteSheet.getFrame(0).rect.width;
        this.frameHeight = this.spriteSheet.getFrame(0).rect.height;

        // Calculate bounds within texture size.
        this.width = parseInt(this.frameWidth * 0.4);
        this.left = parseInt((this.frameWidth - this.width) / 2);
        this.height = parseInt(this.frameWidth * 0.8);
        this.top = parseInt(this.frameHeight - this.height);
        this.localBounds = new createjs.Rectangle(this.left, this.top, this.width, this.height);
        this.hasGun = false;
        this.hasReachedExit = false;
        this.previousBottom = 0.0;
    }

    applyPhysics()
    {
        if(this.isAlive)
        {
            var previousPosition = new createjs.Point(this.x, this.y);

            // Base velocity is a combination of horizontal movement control and
            // acceleration downward due to gravity.
            this.vY = PlatformerHelper.mathClamp(this.vY + this.GRAVITY_ACCELERAION * this.elapsed, -this.MAX_FALL_SPEED, this.MAX_FALL_SPEED);
            this.vY = this.doJump(this.vY);


            this.realY += this.vY * this.elapsed;
            this.realY = Math.round(this.realY);
            this.y = this.realY - this.camera.y;

            this.handleCollisions();

            if (this.y === previousPosition.y)
            {
                this.vY = 0;
            }
        }

    }

    doJump(vY:number)
    {
        // If the player wants to jump
        if (this.isJumping)
        {
            // Begin or continue a jump
            if ((!this.wasJumping && this.isOnGround) || this.jumpTime > 0.0)
            {
                //SOUND
                if (this.jumpTime == 0.0)
                {
                    createjs.Sound.play("jump");
                }

                this.jumpTime += this.elapsed;
                // Playing the proper animation based on
                // the current direction of our hero
                if (this.direction == 1)
                {
                    this.gotoAndPlay("jump_h");
                }
                else
                {
                    this.gotoAndPlay("jump");
                }
            }

            // If we are in the ascent of the jump
            if (0.0 < this.jumpTime && this.jumpTime <= this.MAX_JUMP_TIME) {
                // Fully override the vertical velocity with a power curve that gives players more control over the top of the jump
                vY = this.JUMP_LAUNCH_VELOCITY * (1.0 - Math.pow(this.jumpTime / this.MAX_JUMP_TIME, this.JUMP_CONTROL_POWER));
            }
            else {
                // Reached the apex of the jump
                this.jumpTime = 0.0;
            }
        }
        else
        {
            // Continues not jumping or cancels a jump in progress
            this.jumpTime = 0.0;
        }
        this.wasJumping = this.isJumping;

        return vY;
    }

    tick()
    {
        this.applyPhysics();
        if (this.isAlive && !this.isInIdleMode)
        {
            // Hit testing the screen width, otherwise our sprite would disappear
            // The player is blocked at each side but we keep the walk_right or walk_animation running
            if ((this.realX + this.direction > 0) && (this.realX + this.direction < 1200))
            {
                // Moving the sprite based on the direction & the speed
                this.realX += this.vX * this.direction;
            }

            this.camera.tick(this.realX);

            //move the player based on the camera view
            this.x = this.realX - this.camera.x;

            if(!this.hasGun)
            {
                this.hasGun = this.hitTestGun();
                if(this.hasGun)
                {
                    createjs.Sound.play("gunReady");
                }
            }

        }

        if(this.isAlive && !this.level.monster.isDead)
        {
            var hasHitMonster = this.hitTestMonster();
            if(hasHitMonster)
            {
                this.isAlive = false;
                createjs.Sound.play("killed");
                this.gotoAndPlay("die");
            }
        }

        this.isJumping = false;
        this.fire();
        this.level.tick();

    }

    hitTestMonster()
    {
        //player bounds
        var playerBounds = this.boundingRectangle();
        // Checking if the targeted rectangle intersects with this rectangle
        if ((this.level.monster.x) < this.x + this.width && this.x < (this.level.monster.x + 15) + this.level.monster.width && this.level.monster.y < this.y + this.height)
        {
            return this.y < this.level.monster.y + this.level.monster.height;
        }
        else
        {
            return false;
        }
    }

    hitTestGun()
    {
        //player bounds
        var playerBounds = this.boundingRectangle();
        // Checking if the targeted rectangle intersects with this rectangle
        if ((this.level.gun.x + 15) < this.x + this.width && this.x < (this.level.gun.x + 15) + this.level.gun.width && this.level.gun.y < this.y + this.height)
        {
            return this.y < this.level.gun.y + this.level.gun.height;
        }
        else
        {
            return false;
        }
    }

    fire()
    {
        if(this.hasGun && this.isShooting && this.bullet == null)
        {
            this.bullet = new createjs.Shape();
            this.level.stage.addChild(this.bullet);
            this.bullet.graphics.beginFill("#FFFFFF").drawCircle(0, this.y-32,2);
            this.bullet.originX = this.x;
            this.bullet.originY = this.y;
            this.bullet.x = this.x;
            this.bullet.moveBy = 0;
            this.bullet.direction = this.direction;
            this.isShooting = false;
            createjs.Sound.play("fire");
        }
        else if(this.bullet !== null)
        {
            if(this.bullet.moveBy < this.GUN_RANGE)
            {
                this.bullet.x += 5*this.bullet.direction;
                this.bullet.moveBy += 5;
                if(!this.level.monster.isDead)
                {
                    var hasHitMonster = this.bulletHitMonster();
                    if(hasHitMonster)
                    {
                        this.level.monster.isDead = true;
                        this.level.stage.removeChild(this.level.monster);
                        this.level.stage.removeChild(this.bullet);
                        this.bullet = null;
                        createjs.Sound.play("hitMonster");
                    }
                }
            }
            else
            {
                this.level.stage.removeChild(this.bullet);
                this.bullet = null;
            }
        }
    }

    bulletHitMonster()
    {
        if (this.level.monster.x <= this.bullet.x && this.bullet.x < this.level.monster.x + this.level.monster.width && this.level.monster.y <= this.bullet.originY)
        {
            return this.bullet.originY < this.level.monster.y + this.level.monster.height;
        }
        else
        {
            return false;
        }
    }

    handleCollisions()
    {
        var bounds = this.boundingRectangle();
        var leftTile = Math.floor(bounds.x / 40);
        var rightTile = Math.ceil(((bounds.x + bounds.width)/ 40));
        var topTile = Math.floor(bounds.y / 32);
        var bottomTile = Math.ceil(((bounds.y + bounds.height)/ 32));

        // Reset flag to search for ground collision.
        this.isOnGround = false;

        // For each potentially colliding tile,
        for (var y = topTile; y <= bottomTile; y++)
        {
            for (var x = leftTile; x <= rightTile; x++)
            {
                // If this tile is collidable,
                var collision = this.level.getCollision(x, y);
                if (collision)
                {
                    //console.log("have collision")
                    // Determine collision depth (with direction) and magnitude.
                    var tileBounds = this.level.getBounds(x, y);
                    var depth = this.getIntersectionDepth(bounds, tileBounds);
                    var absDepthX = Math.abs(depth.x);
                    var absDepthY = Math.abs(depth.y);

                    // Resolve the collision along the shallow axis.
                    if (absDepthY < absDepthX)
                    {
                        // If we crossed the top of a tile, we are on the ground.
                        if (this.previousBottom <= tileBounds.y)
                        {
                            this.isOnGround = true;
                        }

                        // Ignore platforms, unless we are on the ground.
                        if (collision || this.isOnGround)
                        {
                            // Resolve the collision along the Y axis.
                            this.realY = this.realY + depth.y;
                            this.y = this.realY - this.camera.y;
                            // Perform further collisions with the new bounds.
                            bounds = this.boundingRectangle();
                        }
                    }
                    else // Ignore platforms.
                    {
                        // Resolve the collision along the X axis.
                        this.realX = this.realX + depth.x;
                        this.x = this.realX - this.camera.x;

                        // Perform further collisions with the new bounds.
                        bounds = this.boundingRectangle();
                    }
                }
            }
        }

        // Save the new bounds bottom.
        this.previousBottom = bounds.y + bounds.height;
    }

    boundingRectangle()
    {
        var left = parseInt(Math.round(this.realX - 32) + this.localBounds.x);
        var top = parseInt(Math.round(this.realY - 64) + this.localBounds.y);

        return new createjs.Rectangle(left, top, this.localBounds.width, this.localBounds.height);
    }

    getIntersectionDepth(rectA, rectB)
    {
        // Calculate half sizes.
        var halfWidthA = rectA.width / 2.0;
        var halfHeightA = rectA.height / 2.0;
        var halfWidthB = rectB.width / 2.0;
        var halfHeightB = rectB.height / 2.0;

        // Calculate centers.
        var centerA = new createjs.Point(rectA.x + halfWidthA, rectA.y + halfHeightA);
        var centerB = new createjs.Point(rectB.x + halfWidthB, rectB.y + halfHeightB);

        // Calculate current and minimum-non-intersecting distances between centers.
        var distanceX = centerA.x - centerB.x;
        var distanceY = centerA.y - centerB.y;
        var minDistanceX = halfWidthA + halfWidthB;
        var minDistanceY = halfHeightA + halfHeightB;

        // If we are not intersecting at all, return (0, 0).
        if (Math.abs(distanceX) >= minDistanceX || Math.abs(distanceY) > minDistanceY)
            return new createjs.Point(0,0);

        // Calculate and return intersection depths.
        var depthX = distanceX > 0 ? minDistanceX - distanceX : -minDistanceX - distanceX;
        var depthY = distanceY > 0 ? minDistanceY - distanceY : -minDistanceY - distanceY;
        return new createjs.Point(depthX, depthY);
    }

    onReachedExit()
    {
        this.hasReachedExit = true;
        createjs.Sound.play("exitPlayer");
        if (this.direction === 1) {
            this.gotoAndPlay("celebrate_h");
        }
        else {
            this.gotoAndPlay("celebrate");
        }
    }
}
