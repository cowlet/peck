
var chicken = {
	direction: "west",
	name: "Chicken E. Bok",
	
	print: function () {
		if (this.direction === "west")
		{
			document.writeln('<"3 ' + this.name);
		}
		else
		{
			document.writeln(this.name + ' E">');
		}
	}
};

var chicken_creator = function (attributes) {
	var c = function () {};
	c.prototype = chicken;
	var chick = new c();
	chick.direction = attributes.direction || chicken.direction;
	chick.name = attributes.name || chicken.name;
	return chick;
};


//var henrietta = chicken_creator( { direction: "west", name: "Henrietta" } );
//var henelope = chicken_creator( { direction: "east", name: "Henelope" } );

var henrietta = chicken_creator( { name: "Henrietta" } );
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