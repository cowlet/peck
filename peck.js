
var chicken = {
	direction: "",
	
	print: function () {
		if (this.direction === "west")
		{
			document.writeln('<"3');
		}
		else
		{
			document.writeln('E">');
		}
	}
};

var chicken_creator = function (attributes) {
	var c = function () {};
	c.prototype = chicken;
	var chick = new c();
	chick.direction = attributes.direction;
	return chick;
};


var henrietta = chicken_creator( { direction: "west" } );
var henelope = chicken_creator( { direction: "east" } );

henrietta.print();
henelope.print();





Function.prototype.method = function (name, func)
{
	this.prototype[name] = func;
	return this;
};

Number.method('integer', function (  ) {
    return Math[this < 0 ? 'ceiling' : 'floor'](this);
});

String.method('trim', function (  ) {
    return this.replace(/^\s+|\s+$/g, '');
});


if (typeof Object.beget !== 'function') {
     Object.beget = function (o) {
         var F = function () {};
         F.prototype = o;
         return new F();
     };
}