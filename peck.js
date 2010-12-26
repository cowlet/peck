
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

var rand = function (max) {
    return Math.floor(Math.random() * (max + 1));
}

var make_direction = function () {
	return (rand(1) ? "west" : "east");
}


var coop = [chicken_creator( { name: "Henrietta", direction: make_direction() } ),
            chicken_creator( { name: "Henelope", direction: make_direction() } ),
            chicken_creator( { name: "Hentick", direction: make_direction() } ) ];


for (i = 0; i < coop.length; i += 1)
{
	coop[i].print ();
}





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