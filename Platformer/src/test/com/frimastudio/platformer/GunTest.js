var GunTest = TestCase("GunTest");

GunTest.prototype.setUp = function()
{
    platformerGame = new PlatformerGame();
    /*:DOC += <div id="start"></div>*/
    /*:DOC += <div id="hudinfo"></div>*/
    /*:DOC += <canvas id="platformerCanvas"></canvas>*/
    platformerGame.init();
    cameraMock = new Camera(1, 0, 800, 400);
    contentManagerMock = new ContentManager();
    gun = new Gun(contentManagerMock, 1, 1, cameraMock);
};

GunTest.prototype.test_TickMove = function()
{
    gun.tick();
    assertEquals(39,gun.x);
};
