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
		var p = rand(100);
		if (this.move === "standing")
		{
			if (p < 10)
				this.move = "standing";
			else if (p < 20)
				this.move = "peck";
			else if (p < 60)
				this.move = "walk";
			else if (p < 80)
			    this.move = "scratch";
			else
			    this.move = "bok";
		}
		else if (this.move === "bok")
		{
			if (p < 50)
			    this.move = "bok";
			else 
			    this.move = "standing";
		}
		else if (this.move === "peck")
		{
			if (p < 50)
				this.move = "peck";
			else if (p < 70)
				this.move = "standing";
			else
			    this.move = "scratch";
		}
		else if (this.move === "walk")
		{
			if (p < 70)
				this.move = "walk";
			else
			    this.move = "standing";
		}
		else if (this.move === "scratch")
		{
			if (p < 60)
				this.move = "scratch";
			else if (p < 80)
				this.move = "standing";
			else
			    this.move = "peck";
		}
	}
};


var chicken = {
	x: 0,
	y: 0,
	direction: "west",
	name: "Chicken E. Bok",
	frame: 0,
	
	draw_facing: function (ctx) {
		var bodyX = this.x;
		var bodyY = this.y;
		// multiplier is pos or neg depending on direction of facing
		// affects x offsets only
		var m = (this.direction === "west" ? 1 : -1);
		
		// beak
		ctx.fillStyle = "orange";
		ctx.beginPath();
		ctx.moveTo(bodyX, bodyY);
		ctx.lineTo(bodyX + (-4*m), bodyY+4);
		ctx.lineTo(bodyX, bodyY+8);
		ctx.fill();
		
		// body		
		ctx.fillStyle = "brown"
		ctx.beginPath();
		ctx.moveTo(bodyX, bodyY);
		ctx.lineTo(bodyX, bodyY+16);
		ctx.lineTo(bodyX + (8*m), bodyY+16);
		ctx.fill();
		
		// feet
		ctx.fillStyle = "orange";
		ctx.beginPath();
		ctx.moveTo(bodyX + (4*m), bodyY+16);
		ctx.lineTo(bodyX + (2*m), bodyY+20);
		ctx.lineTo(bodyX + (6*m), bodyY+20);
		ctx.fill();
	},
	
	
	draw_bokking: function (ctx) {
		this.draw_facing (ctx);
		ctx.fillStyle = "black";
	    ctx.font = "9px sans-serif";
	    ctx.textBaseline = "top";

	    var xpos = (this.direction === "west" ? this.x-24 : this.x+6);
	    ctx.fillText("bok!", xpos, this.y);
	},
	
	draw_pecking: function (ctx) {
		var m = (this.direction === "west" ? 1 : -1);
		var bodyX = this.x - (12*m);
		var bodyY = this.y+11;
		
		// body
		ctx.fillStyle = "brown"
		ctx.beginPath();
		ctx.moveTo(bodyX, bodyY);
		ctx.lineTo(bodyX + (12*m), bodyY+5);
		ctx.lineTo(bodyX + (18*m), bodyY);
		ctx.fill();
		
		// beak
		ctx.fillStyle = "orange";
		ctx.beginPath();
		ctx.moveTo(bodyX, bodyY);
		ctx.lineTo(bodyX + (3*m), bodyY+8);
		ctx.lineTo(bodyX + (6*m), bodyY+3);
		ctx.fill();
		
		// feet
		ctx.fillStyle = "orange";
		ctx.beginPath();
		ctx.moveTo(bodyX + (15*m), this.y+16);
		ctx.lineTo(bodyX + (13*m), this.y+20);
		ctx.lineTo(bodyX + (17*m), this.y+20);
		ctx.fill();
	},
	
	draw_walking: function (ctx) {
		var bodyX = this.x;
		var bodyY = this.y;
		var m = (this.direction === "west" ? 1 : -1);
		
		// beak
		ctx.fillStyle = "orange";
		ctx.beginPath();
		ctx.moveTo(bodyX, bodyY);
		ctx.lineTo(bodyX + (-4*m), bodyY+4);
		ctx.lineTo(bodyX, bodyY+8);
		ctx.fill();
		
		// body		
		ctx.fillStyle = "brown"
		ctx.beginPath();
		ctx.moveTo(bodyX, bodyY);
		ctx.lineTo(bodyX, bodyY+16);
		ctx.lineTo(bodyX + (8*m), bodyY+16);
		ctx.fill();
		
		// feet
		ctx.fillStyle = "orange";
		ctx.beginPath();
		ctx.moveTo(bodyX + (2*m), bodyY+16);
		ctx.lineTo(bodyX + (1*m), bodyY+20);
		ctx.lineTo(bodyX + (3*m), bodyY+20);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(bodyX + (5*m), bodyY+16);
		ctx.lineTo(bodyX + (4*m), bodyY+20);
		ctx.lineTo(bodyX + (6*m), bodyY+20);
		ctx.fill();
	},
		
	
	draw_scratching: function (ctx, frame) {
		var m = (this.direction === "west" ? 1 : -1);
		var bodyX = this.x - (8*m);
		var bodyY = this.y+8;
		
		// body
		ctx.fillStyle = "brown"
		ctx.beginPath();
		ctx.moveTo(bodyX, bodyY);
		ctx.lineTo(bodyX + (10*m), bodyY+8);
		ctx.lineTo(bodyX + (18*m), bodyY+5);
		ctx.fill();
		
		// beak
		ctx.fillStyle = "orange";
		ctx.beginPath();
		ctx.moveTo(bodyX, bodyY);
		ctx.lineTo(bodyX + (3*m), bodyY+8);
		ctx.lineTo(bodyX + (6*m), bodyY+3);
		ctx.fill();
		
		// feet
		ctx.fillStyle = "orange";
		ctx.beginPath();
		if (frame === 0)
		{
			ctx.moveTo(bodyX + (13*m), this.y+16);
			ctx.lineTo(bodyX + (11*m), this.y+20);
			ctx.lineTo(bodyX + (15*m), this.y+20);
			ctx.fill();
		}
		else
		{
			ctx.moveTo(bodyX + (13*m), this.y+16);
			ctx.lineTo(bodyX + (11*m), this.y+20);
			ctx.lineTo(bodyX + (13*m), this.y+20);
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(bodyX + (13*m), this.y+16);
			ctx.lineTo(bodyX + (17*m), this.y+18);
			ctx.lineTo(bodyX + (18*m), this.y+16);
			ctx.fill();
		}
	},
	
	update_position: function () {
	    // update x coordinate
	    this.x += (this.direction === "west" ? -10 : 10);
	},
	
	
	select_frame: function (ctx, move, frame) {
		console.log ("Selecting frame for " + move + ", " +frame);
		if (frame === 0)
		{
			if (move === "standing")
			    this.draw_facing(ctx);
			else if (move === "peck")
			    this.draw_pecking(ctx);
			else if (move === "bok")
			    this.draw_bokking(ctx);
			else if (move === "walk")
			    this.draw_walking(ctx);
            else if (move === "scratch")
                this.draw_scratching(ctx, frame);
		}
		else
		{
			if (move === "scratch")
                this.draw_scratching(ctx, frame);
			else
			    this.draw_facing(ctx);
			// standing, peck, walk, bok all have the same off frame
		}
	},
	
	draw: function (ctx) {
		console.log ("Drawing move " + this.behaviour.move);
		
		this.select_frame(ctx, this.behaviour.move, this.frame);		
		
		ctx.fillStyle = "black";
	    ctx.font = "9px sans-serif";
	    ctx.textBaseline = "top";
	    ctx.fillText(this.name, this.x, this.y+22);
	},
	
	update: function () {
		if (rand(10))
			this.direction = this.direction === "west" ? "east" : "west";
		
		this.behaviour.next_move ();
		this.frame ? this.frame = 0 : this.frame = 1;
		if (this.behaviour.move === "walk")
		    this.update_position();
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

var count = 0;

var game_loop = function (ctx, coop) {
			
	ctx.fillStyle = "rgb(249,238,137)";
    ctx.fillRect(0, 0, YARD_WIDTH, YARD_HEIGHT);
    
	for (i = 0; i < coop.length; i += 1)
	{
		coop[i].draw (ctx);
		coop[i].update();
	}
	
	count += 1;
	//if (count < 3)
	    var t = setTimeout(game_loop, 1000, ctx, coop);
};

var test_loop = function (ctx, coop) {
			
	ctx.fillStyle = "rgb(249,238,137)";
    ctx.fillRect(0, 0, YARD_WIDTH, YARD_HEIGHT);
    
	coop[0].x = 300;
	coop[0].y = 150;
	coop[0].direction = "east";
	coop[0].behaviour.move = "scratch";
	coop[0].draw(ctx);
	var t = setTimeout(test2, 1000, ctx, coop);
	
};

var test2 = function (ctx, coop) {
	ctx.fillStyle = "rgb(249,238,137)";
    ctx.fillRect(0, 0, YARD_WIDTH, YARD_HEIGHT);
    
	coop[0].x = 300;
	coop[0].y = 150;
	coop[0].direction = "east";
	coop[0].behaviour.move = "scratch";
	coop[0].frame = 1;
	coop[0].draw(ctx);
};


var setup = function () {
	var coop = [chicken_creator( { name: "Henrietta", direction: make_direction() } ),
	            chicken_creator( { name: "Henelope", direction: make_direction() } ),
	            chicken_creator( { name: "Henderson", direction: make_direction() } ),
	            chicken_creator( { name: "Hentick", direction: make_direction() } ) ];

	var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    game_loop (ctx, coop);
    //test_loop (ctx, coop);
};	

