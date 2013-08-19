class Camera
{
    x:number;
    y:number;
    width:number;
    height:number;

    constructor(x:number, y:number, width:number, height:number)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    //Move the camera if needed
    tick(positionXHero:number)
    {
        if(positionXHero > 400 && positionXHero <= 800)
        {
            this.x = positionXHero - this.width/2;
        }
    }
}
