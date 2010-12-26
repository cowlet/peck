var YARD_WIDTH = 500;
var YARD_HEIGHT = 300;

var rand = function (max) {
    return Math.floor(Math.random() * (max + 1));
}

if (typeof Object.beget !== 'function') {
     Object.beget = function (o) {
         var F = function () {};
         F.prototype = o;
         return new F();
     };
}



var markov_chain = {
	move: "standing",
	
	next_move: function () {
		//console.log ("In next_move, current value " + this.move);
		if (this.move === "standing")
		{
			// 20% peck
			// 40% walk
			// 20% scratch
			// 20% bok
			this.move = "bok";
		}
		else if (this.move === "bok")
		{
			this.move = "standing";
		}
	},
	set_move: function (current_move) {
		move = current_move;
	}
};


var chicken = {
	x: 0,
	y: 0,
	direction: "west",
	name: "Chicken E. Bok",
	
	
	draw_west_facing: function (ctx) {
		var bodyX = this.x;
		var bodyY = this.y;		
		
		// beak
		ctx.fillStyle = "orange";
		ctx.beginPath();
		ctx.moveTo(bodyX, bodyY);
		ctx.lineTo(bodyX-4, bodyY+4);
		ctx.lineTo(bodyX, bodyY+8);
		ctx.fill();
		
		// body		
		ctx.fillStyle = "brown"
		ctx.beginPath();
		ctx.moveTo(bodyX, bodyY);
		ctx.lineTo(bodyX, bodyY+16);
		ctx.lineTo(bodyX+8, bodyY+16);
		ctx.fill();
		
		// feet
		ctx.fillStyle = "orange";
		ctx.beginPath();
		ctx.moveTo(bodyX+4, bodyY+16);
		ctx.lineTo(bodyX+2, bodyY+20);
		ctx.lineTo(bodyX+6, bodyY+20);
		ctx.fill();
	},
	
	draw_east_facing: function (ctx) {
		var bodyX = this.x;
		var bodyY = this.y;		
		
		// beak
		ctx.fillStyle = "orange";
		ctx.beginPath();
		ctx.moveTo(bodyX, bodyY);
		ctx.lineTo(bodyX+4, bodyY+4);
		ctx.lineTo(bodyX, bodyY+8);
		ctx.fill();
		
		// body		
		ctx.fillStyle = "brown"
		ctx.beginPath();
		ctx.moveTo(bodyX, bodyY);
		ctx.lineTo(bodyX, bodyY+16);
		ctx.lineTo(bodyX-8, bodyY+16);
		ctx.fill();
		
		// feet
		ctx.fillStyle = "orange";
		ctx.beginPath();
		ctx.moveTo(bodyX-4, bodyY+16);
		ctx.lineTo(bodyX-2, bodyY+20);
		ctx.lineTo(bodyX-6, bodyY+20);
		ctx.fill();
	},
	
	draw: function (ctx) {
		
		if (this.behaviour.move === "standing" ||
		    this.behaviour.move === "bok")
		{
		
			if (this.direction === "west")
			{
				this.draw_west_facing(ctx);
			}
			else
			{
				this.draw_east_facing(ctx);
			}
	    
		    ctx.fillStyle = "black";
		    ctx.font = "9px sans-serif";
		    ctx.textBaseline = "top";
		    ctx.fillText(this.name, this.x, this.y+22);
		}
		if (this.behaviour.move === "bok")
	    {
			ctx.fillStyle = "black";
		    ctx.font = "9px sans-serif";
		    ctx.textBaseline = "top";
		    ctx.fillText("bok!", this.x+6, this.y);
		}
	}
	
};

var chicken_creator = function (attributes) {
	var chick = Object.beget(chicken);
	chick.direction = attributes.direction || chicken.direction;
	chick.behaviour = Object.beget(markov_chain);
	chick.name = attributes.name || chicken.name;
	chick.x = rand(YARD_WIDTH) || chicken.x;
	chick.y = rand(YARD_HEIGHT) || chicken.y;
	return chick;
};


var make_direction = function () {
	return (rand(1) ? "west" : "east");
}

var game_loop = function (ctx, coop) {
			
	ctx.fillStyle = "rgb(249,238,137)";
    ctx.fillRect(0, 0, YARD_WIDTH, YARD_HEIGHT);
    
	for (i = 0; i < coop.length; i += 1)
	{
		coop[i].draw (ctx);
		coop[i].behaviour.next_move();
	}
	
	//var t = setTimeout(function () { game_loop(ctx, coop); }, 1000);
	var t = setTimeout(game_loop, 1000, ctx, coop);
};


var setup = function () {
	var coop = [chicken_creator( { name: "Henrietta", direction: make_direction() } ),
	            chicken_creator( { name: "Henelope", direction: make_direction() } ),
	            chicken_creator( { name: "Henderson", direction: make_direction() } ),
	            chicken_creator( { name: "Hentick", direction: make_direction() } ) ];

	var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    game_loop (ctx, coop);
};	

