///<reference path='../../../../../typedef/preloadjs.d.ts' />
///<reference path='PlatformerGame.ts' />

class ContentManager
{
    queue:createjs.LoadQueue;
    onDownloadComplete: () => void;
    win:Image;
    downloadProgress:createjs.Text;

    constructor(onDownloadComplete: () => void)
    {
        this.onDownloadComplete = onDownloadComplete;
        this.downloadProgress = new createjs.Text("-- %", "bold 14px Arial", "#FFFF");
        this.downloadProgress.x = 350;
        this.downloadProgress.y = 240;
        platformerGame.stage.addChild(this.downloadProgress );
        this.preloadAsset();

    }

    preloadAsset()
    {
        this.queue = new createjs.LoadQueue(false);
        this.queue.installPlugin(createjs.Sound);
        var manifest =
        [
           {src: "img/player.png", id: "hero"},
           {src: "img/life.png", id: "life"},
           {src: "img/exit.png", id: "exit"},
           {src: "img/you_win.png", id: "win"},
           {src: "img/you_died.png", id: "died"},
           {src: "img/monsterA.png", id: "monster"},
           {src: "img/tile/blockA0.png", id: "block"},
           {src: "img/item/gun.png", id: "gun"},
           {src: "img/background/layer0_0.png", id: "layer00"},
           {src: "img/background/layer0_1.png", id: "layer01"},
           {src: "img/background/layer0_2.png", id: "layer02"},
           {src: "img/background/layer1_0.png", id: "layer10"},
           {src: "img/background/layer1_1.png", id: "layer11"},
           {src: "img/background/layer1_2.png", id: "layer12"},
           {src: "img/background/layer2_0.png", id: "layer20"},
           {src: "img/background/layer2_1.png", id: "layer21"},
           {src: "img/background/layer2_2.png", id: "layer22"},
           {src: "sound/music.mp3", id: "music"},
           {src: "sound/jump.mp3", id: "jump"},
           {src: "sound/gunReady.mp3", id: "gunReady"},
            {src: "sound/fire.mp3", id: "fire"},
            {src: "sound/hitMonster.mp3", id: "hitMonster"},
            {src: "sound/exit.mp3", id: "exitPlayer"},
            {src: "sound/killed.mp3", id: "killed"},
            {src: "img/resources_en.json", id: "enTest"}


        ]
        this.queue.addEventListener("progress", this.inProgress.bind(this));
        this.queue.addEventListener("complete", this.onDownloadComplete);
        this.queue.addEventListener("error", this.handleError);
        this.queue.loadManifest(manifest);
    }

    handleError(event)
    {
        console.log("Error Loading Image : " + event.target.src);
    }

    inProgress()
    {
        this.downloadProgress.text = "Loading....."+ Math.round(this.queue.progress*100) + "%";
        platformerGame.stage.update();
    }
}
