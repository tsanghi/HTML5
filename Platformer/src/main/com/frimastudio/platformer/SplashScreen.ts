class SplashScreen
{
    constructor()
    {
        var canvas = document.getElementById("platformerCanvas");
        var context = canvas.getContext("2d");
        var logo = new Image();
        logo.onload = function()
        {
            context.drawImage(logo,350,250);
        }
        logo.src = "img/logo.png";
        context.font = "40pt Calibri";
        context.fillStyle = "white";
        context.fillText("HTML 5 - Tutorial Platformer", 100, 200);
    }

}