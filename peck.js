var YARD_WIDTH = 500;
var YARD_HEIGHT = 300;

var chicken = {
	x: 0,
	y: 0,
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
	},
	
	draw_west_facing: function (ctx) {
		var beakX = this.x;
		var beakY = this.y;		
		var headX = beakX+8;
		var headY = beakY-4;
		var bodyX = headX+8;
		var bodyY = headY+8;
		var feetX = bodyX+4;
		var feetY = bodyY+8;
		
		// beak
		ctx.fillStyle = "orange";
		ctx.beginPath();
		ctx.moveTo(beakX, beakY);
		ctx.lineTo(beakX+8, beakY-4);
		ctx.lineTo(beakX+8, beakY+4);
		ctx.fill();
		
		// head		
		ctx.fillStyle = "brown"
		ctx.beginPath();
		ctx.moveTo(headX, headY);
		ctx.bezierCurveTo(headX+4, headY-4,
			              headX+7, headY+1,
			              headX+8, headY+8);
		ctx.lineTo(headX, headY+12);
		ctx.fill();
		
		// body
		ctx.beginPath();
		ctx.moveTo(bodyX, bodyY);
		ctx.bezierCurveTo(bodyX+8, bodyY-2,
			              bodyX+12, bodyY+6,
			              bodyX+20, bodyY+8);
		ctx.bezierCurveTo(bodyX+4, bodyY+10,
			              bodyX-4, bodyY+12,
			              headX, headY+12); // where the head ends
		ctx.fill();
		
		// feet
		ctx.fillStyle = "orange";
		ctx.beginPath();
		ctx.moveTo(feetX, feetY);
		ctx.lineTo(feetX, feetY+8);
		ctx.lineTo(feetX-5, feetY+10);
		ctx.lineTo(feetX-2, feetY+8);
		ctx.lineTo(feetX-2, feetY);
		ctx.fill();
	},
	
	draw: function (ctx) {
		
		ctx.fillStyle = "orange";
		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		
		if (this.direction === "west")
		{
			this.draw_west_facing(ctx);
		}
		else
		{
			ctx.lineTo(this.x-10, this.y-5);
			ctx.lineTo(this.x-10, this.y+5);
		}
		ctx.fill();
	    
	}
	
};

var chicken_creator = function (attributes) {
	var c = function () {};
	c.prototype = chicken;
	var chick = new c();
	chick.direction = attributes.direction || chicken.direction;
	chick.name = attributes.name || chicken.name;
	chick.x = rand(YARD_WIDTH) || chicken.x;
	chick.y = rand(YARD_HEIGHT) || chicken.y;
	return chick;
};

var rand = function (max) {
    return Math.floor(Math.random() * (max + 1));
}

var make_direction = function () {
	return (rand(1) ? "west" : "east");
}

var game_loop = function (ctx, coop) {
		
	for (i = 0; i < coop.length; i += 1)
	{
		coop[i].draw (ctx);
	}
};


var setup = function () {
	var coop = [chicken_creator( { name: "Henrietta", direction: make_direction() } ),
	            chicken_creator( { name: "Henelope", direction: make_direction() } ),
	            chicken_creator( { name: "Hentick", direction: make_direction() } ) ];

	var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgb(249,238,137)";
    ctx.fillRect(0, 0, YARD_WIDTH, YARD_HEIGHT);

    game_loop (ctx, coop);
};	

