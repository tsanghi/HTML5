var CameraTest = TestCase("CameraTest");
var camera;
CameraTest.prototype.setUp = function()
{
    camera = new Camera(0, 0, 800, 400);
};

CameraTest.prototype.test_TickNotMove = function()
{
    camera.tick(200);
    assertEquals(0,camera.x);
};

CameraTest.prototype.test_TickMoveCamera = function()
{
    camera.tick(401);
    assertEquals(1,camera.x);
};