
var chicken = {
	direction: "west",
	
	heading: function (head) {
		this.direction = head;
	},
	
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

chicken.heading("west")

chicken.print();


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