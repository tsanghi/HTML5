class PlatformerHelper
{
    static matrix(m, n, initial)
    {
        var a, i , j, mat = [];
        for(i=0; i<m; i++)
        {
            a = [];
            for(j=0; j < n; j++)
            {
                a[j] = initial;
            }
            mat[i] = a;
        }
        return mat;
    }

    static mathClamp(value, min, max)
    {
        value = value > max ? max : value;
        value = value < min ? min : value;
        return value;
    }
}
