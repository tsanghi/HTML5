var PlatformerHelperTest = TestCase("PlatformerHelperTest");

PlatformerHelperTest.prototype.test_MathClampWithGoodValue = function()
{
    var value = PlatformerHelper.mathClamp(50,0,100);
    assertEquals(50, value);
};

PlatformerHelperTest.prototype.test_MathClampWithMinValue = function()
{
    var value = PlatformerHelper.mathClamp(10,20,100);
    assertEquals(20, value);
};

PlatformerHelperTest.prototype.test_MathClampWithMaxValue = function()
{
    var value = PlatformerHelper.mathClamp(101,20,100);
    PlatformerHelper.mathClamp(100, value);
};