PECK.rand = function (max) {
    return Math.floor(Math.random() * (max + 1));
};

PECK.approx_equals = function (a, b, diff) {
	if (Math.abs(a-b) < diff)
		return true;
	return false;
};

PECK.getCursorPosition = function (e) {
    var x, y;

    if (e.pageX || e.pageY)
    {
        x = e.pageX;
        y = e.pageY;
    }
    else
    {
        x = e.clientX + document.body.scrollLeft +
        document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop +
        document.documentElement.scrollTop;
    }

    canvas = document.getElementById('canvas');
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    //x -= xOrigin;
    //y -= yOrigin;

    if (x < 0 || y < 0 || x > PECK.yard.width || y > PECK.yard.height)
    {
        //console.log("Out of bounds (" + x + "," + y + ")");
        return undefined;
    }

    return { "x": x, "y": y };
};

