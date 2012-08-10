var PECK = {};

PECK.colourways = {
	day: {
		ground: "rgb(249,238,137)",
	    body: "brown",
	    beaksnfeet: "orange",
	    grain: "brown",
	    text: "black"
	},
	night: {
		ground: "rgb(50,50,100)",
		body: "rgb(20,20,20)",
		beaksnfeet: "rgb(165,150,150)",
		grain: "black",
		text: "white"
	},
	between: {
		ground: "rgb(242,159,153)",
		body: "brown",
		beaksnfeet: "rgb(220,120,90)",
		grain: "brown",
		text: "white"
	},
};

PECK.colouring = function (area) {
	return PECK.colourways[PECK.infobar.day_or_night()][area];
};


PECK.rand = function (max) {
    return Math.floor(Math.random() * (max + 1));
};

if (typeof Object.beget !== 'function') {
     Object.beget = function (o) {
         var F = function () {};
         F.prototype = o;
         return new F();
     };
};

PECK.approx_equals = function (a, b, diff) {
	if (Math.abs(a-b) < diff)
		return true;
	return false;
};

// *** Yard ***
// The yard is the object that holds all the chickens, grain, etc and can draw the screen
// Singleton object
PECK.yard = {
	width: 500,
	height: 300,
	ctx: undefined,
	mouse_state: undefined,
	chickens: [],
	objects: [],
	grains: [],
	
	set_ctx: function (ctx) {
		this.ctx = ctx;
	},
	
	set_mouse: function (ms) {
		this.mouse_state = ms;
	},
	
	add_chicken: function (c) {
		this.chickens.push (c);
	},
	
	add_object: function (o) {
		this.objects.push (o);
	},
	
	add_grain: function (g) {
		this.grains.push (g);
		
		// Provoke the chickens
		this.chickens.forEach (function (c) { c.start_chase({ "x": g.x, "y": g.y-c.height }); });
	},
	
	check_for_grain_collision: function () {

		var eaten_grains = [];
		var available_chickens = this.chickens.slice(0); // copy all chickens
		var that = this;
		
		// match up each grain to one or zero chickens from the pool of non-eating chickens
		this.grains.forEach (function (g) {
			var eating_chickens = available_chickens.filter (function (c) {
				if (PECK.approx_equals (c.x, g.x, 5) &&
				    PECK.approx_equals (c.y+c.height, g.y, 5))
				{
					console.log ("returning true for hit");
					return true;
				}
				return false;
			});
			
			// if one matches, just take the first one
			if (eating_chickens[0])
			{
				// eat
				eating_chickens[0].stop_chase();
				eating_chickens[0].behaviour.move = "peck";
				// delete chicken from available
				available_chickens.splice (available_chickens.indexOf(eating_chickens[0]), 1);
				// shcedule grain for removal
				eaten_grains.push (g);
			}
		});
		
		eaten_grains.forEach (function (g) { that.grains.splice (that.grains.indexOf (g), 1); });
	},
	
	can_chickens_see_grains: function () {
		var i, j;
		
		// if there are no grains, stop all chases
		if (this.grains.length === 0)
		{
			this.chickens.forEach (function (c) { c.stop_chase(); });
		}
		
		var that = this;
		// loop through chickens. if they can see a grain, chase
		this.chickens.forEach (function (c) {
			that.grains.forEach (function (g) {
				if (c.can_see (g) || c.standing_near (g))
				{
					c.start_chase ({ "x": g.x, "y": g.y-c.height });
				}
			});
		});
				
	},
	
	check_for_mouse_on_chickens: function () {
		if (this.mouse_state === undefined)
		{
			return;
		}

		var that = this;
		//console.log(this.mouse_state);
		//console.log(this.chickens[0]);
		this.chickens.forEach (function (c) { 
			if (PECK.approx_equals (c.x, that.mouse_state.x, 25) &&
			    PECK.approx_equals (c.y+c.height, that.mouse_state.y, 25))
			{
				// draw name
				that.ctx.fillStyle = PECK.colouring("text");
				that.ctx.font = "9px sans-serif";
				that.ctx.textBaseline = "top";
				that.ctx.fillText(c.name, c.x, c.y+22);
			}
		});		
	},
	
	draw: function () {
		var i;
		
		//this.ctx.fillStyle = "rgb(249,238,137)";
		this.ctx.fillStyle = PECK.colouring ("ground");
	    this.ctx.fillRect(0, 0, this.width, this.height);
	
		var that = this;
		this.chickens.forEach (function (c) { c.draw (that.ctx); });
		this.objects.forEach (function (o) { o.draw (that.ctx); });
		this.grains.forEach (function (g) { g.draw (that.ctx); });
		
		PECK.infobar.draw (this.ctx, this.chickens);
		
		this.check_for_mouse_on_chickens ();
	}
}

// *** Infobar ***
// The infobar prints all the chicken info
// Singleton object
PECK.infobar = {
	x: 0,
	y: PECK.yard.height,
	width: PECK.yard.width,
	height: 100,
	line_height: 15,
	y_indent: 20,	
	x_columns: [15, 100, 200, 360],
	
	day: 0,
	hour: 6,
	
	increment_time: function () {
		this.hour += 1;
		if (this.hour > 23)
		{
			this.hour = 0;
			this.day += 1;
		}
	},
	
	day_or_night: function () {
		if (this.hour > 7 && this.hour < 19)
		{
			return "day";
		}
		else if (this.hour === 7 || this.hour === 19)
		{
			return "between";
		}
		else
		{
			return "night";
		}
	},
			 
	
	draw: function (ctx, chickens) {
		ctx.fillStyle = "black";
	    ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = "white";
	    ctx.fillRect(this.x+2, this.y+2, this.width-4, this.height-4);
		
		ctx.fillStyle = "black";
		ctx.font = "bold 9px sans-serif";
	    ctx.textBaseline = "top";
		ctx.fillText("Name", this.x+this.x_columns[0], this.y+5)
		ctx.fillText("Action", this.x+this.x_columns[1], this.y+5)
		ctx.fillText("Status", this.x+this.x_columns[2], this.y+5)

		var that = this;
	    ctx.font = "9px sans-serif";
		chickens.forEach (function (c, i) {
			ctx.fillText(c.name,
				         (that.x+that.x_columns[0]),
				         (that.y+that.y_indent + i*that.line_height));
			ctx.fillText(c.behaviour.move,
				         (that.x+that.x_columns[1]),
				         (that.y+that.y_indent + i*that.line_height));
		});
		
		ctx.fillStyle = "black";
		ctx.fillRect(this.x+this.x_columns[3]-5, this.y, 2, this.height);
		ctx.font = "bold 9px sans-serif";
	    ctx.textBaseline = "top";
	    ctx.fillText ("Farm", this.x+this.x_columns[3]+this.x_columns[0], this.y+5);
		
		ctx.font = "9px sans-serif";
	    ctx.fillText ("Day: " + this.day,
	                  this.x+this.x_columns[3]+this.x_columns[0],
	                  this.y+this.y_indent);
	    ctx.fillText ("Time: " + this.hour + ":00",
	                  this.x+this.x_columns[3]+this.x_columns[0],
	                  this.y+this.y_indent + this.line_height);
	    
	}
}


// *** Chicken-related items ***
// Chicken behaviours: markov_chain for normal activities, chase behaviour for grain

PECK.markov_chain = {
	moves: ["standing", "bok", "peck", "walk", "scratch", "chase"],
	transitions: {
		"standing": [10, 20, 10, 40, 20,   0],
		"bok":      [50, 50,  0,  0,  0,   0],
		"peck":     [20,  0, 50,  0, 30,   0],
		"walk":     [30,  0,  0, 70,  0,   0],
		"scratch":  [20,  0, 20,  0, 60,   0],
		"chase":    [ 0,  0,  0,  0,  0, 100]
	},
	move: "standing",
	
	next_move: function () {
		var p = PECK.rand(100);
		var that = this;
		// For the correct row of transitions, sum elements one by
		// one until we find the partial_sum greater or equal to p		
		this.transitions[this.move].some (function (value, i) {
			this.partial_sum += value;
			if (p <= this.partial_sum)
			{
				//console.log ("Move for p = " + p + " should be to " + that.moves[i]);
				that.move = that.moves[i];
				return true;
			}
			return false;
		}, {partial_sum: 0});
	}
};


PECK.chicken_creator = function (n) {
	return {
		name: n,
		x: PECK.rand (PECK.yard.width),
		y: PECK.rand (PECK.yard.height),
		height: 20,
		heading: PECK.rand (360),
		frame: 0,
		chasing: false,
		time_to_update: 0,
		
		behaviour: Object.beget(PECK.markov_chain),
	
		direction: function () {
			return (this.heading < 180 ? "east" : "west");
		},
	
		rad_heading: function () {
			return this.heading * Math.PI / 180;
		},
		
		start_chase: function (pos) {
			this.chasing = pos;
			this.behaviour.move = "chase";
		},
		
		stop_chase: function () {
			this.chasing = false;
			if (this.behaviour.move === "chase")
			{
				this.behaviour.move = "standing";
			};
		},
	
		update_heading: function () {					
			if (this.chasing)
			{
				// at x,y going to chasing.x,chasing.y
				var h = PECK.rand(90);
				// generate a new heading into the quadrant of the chase
				if (this.chasing.x > this.x && this.chasing.y < this.y)
					this.heading = h;
				else if (this.chasing.x > this.x && this.chasing.y > this.y)
					this.heading = 90+h;
				else if (this.chasing.x < this.x && this.chasing.y > this.y)
					this.heading = 180+h;
				else
					this.heading = 270+h;
			}
			else
			{
				// If we're not chasing, 1 in 5 times change direction
				if (!PECK.rand(5)) 
					this.heading = PECK.rand (360);
			}
		},
	
		can_see: function (grain) {
			if (this.direction() === "west" && (grain.x < this.x) ||
			    this.direction() === "east" && (grain.x > this.x))
			{
				if (PECK.approx_equals (this.x, grain.x, 25) &&
				    PECK.approx_equals (this.y+this.height, grain.y, 25))
				{
					//console.log (this.name + " can see grain");
					return true;
				}
			}
			return false;
		},
	
		standing_near: function (grain) {
			if (PECK.approx_equals (this.x, grain.x, 5) &&
			    PECK.approx_equals (this.y+this.height, grain.y, 5))
			{
				//console.log (this.name + " is near grain");
				return true;
			}
			return false;
		},
	
		draw_facing: function (ctx) {
			var bodyX = this.x;
			var bodyY = this.y;
			// multiplier is pos or neg depending on direction of facing
			// affects x offsets only
			var m = (this.direction() === "west" ? 1 : -1);
		
			// beak
			ctx.fillStyle = PECK.colouring("beaksnfeet");
			ctx.beginPath();
			ctx.moveTo(bodyX, bodyY);
			ctx.lineTo(bodyX + (-4*m), bodyY+4);
			ctx.lineTo(bodyX, bodyY+8);
			ctx.fill();
		
			// body		
			ctx.fillStyle = PECK.colouring("body");
			ctx.beginPath();
			ctx.moveTo(bodyX, bodyY);
			ctx.lineTo(bodyX, bodyY+16);
			ctx.lineTo(bodyX + (8*m), bodyY+16);
			ctx.fill();
		
			// feet
			ctx.fillStyle = PECK.colouring("beaksnfeet");
			ctx.beginPath();
			ctx.moveTo(bodyX + (4*m), bodyY+16);
			ctx.lineTo(bodyX + (2*m), bodyY+20);
			ctx.lineTo(bodyX + (6*m), bodyY+20);
			ctx.fill();
		},
	
	
		draw_bokking: function (ctx) {
			this.draw_facing (ctx);
			ctx.fillStyle = PECK.colouring("text");
		    ctx.font = "9px sans-serif";
		    ctx.textBaseline = "top";

		    var xpos = (this.direction() === "west" ? this.x-24 : this.x+6);
		    ctx.fillText("bok!", xpos, this.y);
		},
	
		draw_pecking: function (ctx) {
			var m = (this.direction() === "west" ? 1 : -1);
			var bodyX = this.x - (12*m);
			var bodyY = this.y+11;
		
			// body
			ctx.fillStyle = PECK.colouring("body");
			ctx.beginPath();
			ctx.moveTo(bodyX, bodyY);
			ctx.lineTo(bodyX + (12*m), bodyY+5);
			ctx.lineTo(bodyX + (18*m), bodyY);
			ctx.fill();
		
			// beak
			ctx.fillStyle = PECK.colouring("beaksnfeet");
			ctx.beginPath();
			ctx.moveTo(bodyX, bodyY);
			ctx.lineTo(bodyX + (3*m), bodyY+8);
			ctx.lineTo(bodyX + (6*m), bodyY+3);
			ctx.fill();
		
			// feet
			ctx.fillStyle = PECK.colouring("beaksnfeet");
			ctx.beginPath();
			ctx.moveTo(bodyX + (15*m), this.y+16);
			ctx.lineTo(bodyX + (13*m), this.y+20);
			ctx.lineTo(bodyX + (17*m), this.y+20);
			ctx.fill();
		},
	
		draw_walking: function (ctx) {
			var bodyX = this.x;
			var bodyY = this.y;
			var m = (this.direction() === "west" ? 1 : -1);
		
			// beak
			ctx.fillStyle = PECK.colouring("beaksnfeet");
			ctx.beginPath();
			ctx.moveTo(bodyX, bodyY);
			ctx.lineTo(bodyX + (-4*m), bodyY+4);
			ctx.lineTo(bodyX, bodyY+8);
			ctx.fill();
		
			// body		
			ctx.fillStyle = PECK.colouring("body");
			ctx.beginPath();
			ctx.moveTo(bodyX, bodyY);
			ctx.lineTo(bodyX, bodyY+16);
			ctx.lineTo(bodyX + (8*m), bodyY+16);
			ctx.fill();
		
			// feet
			ctx.fillStyle = PECK.colouring("beaksnfeet");;
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
			var m = (this.direction() === "west" ? 1 : -1);
			var bodyX = this.x - (8*m);
			var bodyY = this.y+8;
		
			// body
			ctx.fillStyle = PECK.colouring("body");
			ctx.beginPath();
			ctx.moveTo(bodyX, bodyY);
			ctx.lineTo(bodyX + (10*m), bodyY+8);
			ctx.lineTo(bodyX + (18*m), bodyY+5);
			ctx.fill();
		
			// beak
			ctx.fillStyle = PECK.colouring("beaksnfeet");
			ctx.beginPath();
			ctx.moveTo(bodyX, bodyY);
			ctx.lineTo(bodyX + (3*m), bodyY+8);
			ctx.lineTo(bodyX + (6*m), bodyY+3);
			ctx.fill();
		
			// feet
			ctx.fillStyle = PECK.colouring("beaksnfeet");
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
			if (this.behaviour.move === "walk" ||
			    this.behaviour.move === "chase")
			{
				// chickens move 10 pix
				this.x += 10 * Math.sin(this.rad_heading());
				this.y -= 10 * Math.cos(this.rad_heading());
			}
		},
	
	
		select_frame: function (ctx, move, frame) {
			//console.log ("Selecting frame for " + move + ", " +frame);
			if (frame === 0)
			{
				if (move === "standing")
				    this.draw_facing(ctx);
				else if (move === "peck")
				    this.draw_pecking(ctx);
				else if (move === "bok")
				    this.draw_bokking(ctx);
				else if (move === "walk" || move === "chase")
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
			//console.log ("Drawing move " + this.behaviour.move);
		
			this.select_frame(ctx, this.behaviour.move, this.frame);
		},
	
		update: function () {
			// decrement hysteresis counter before deciding to update
			this.time_to_update -= 1;
		
			if (this.time_to_update <= 0)
			{
				this.behaviour.next_move ();
				this.update_heading ();
				this.update_position ();
				this.frame ? this.frame = 0 : this.frame = 1;
			
				// reset update counter
				this.time_to_update = 50 + PECK.rand(50);
			}
		}
	
	};
};




// User interaction
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

PECK.dropGrainOnClick = function (e) {
    var position = PECK.getCursorPosition(e);
    if (position === undefined) {
        return;
    }

	// Drop n grains in an nxn square centered on position's x and y
	var n = 10;
	for (var i = 0; i < n; i += 1)
	{
		PECK.yard.add_grain ( {
			x: position.x - n/2 + PECK.rand (n), // centered on click
			y: position.y - n/2 + PECK.rand (n), // centered on click

			draw: function (ctx) {
				ctx.fillStyle = PECK.colouring ("grain");
				ctx.beginPath();
				ctx.moveTo(this.x, this.y);
				ctx.lineTo(this.x+1, this.y);
				ctx.lineTo(this.x+1, this.y+1);
				ctx.lineTo(this.x, this.y+1);
				ctx.fill();
			}
		});
	}
	PECK.yard.draw();
};



// *** Game loop ***

// game_loop prints and updates the full yard of chickens
PECK.game_loop = function (ctx, counter) {
    	
	// handle yard updates
	PECK.yard.chickens.forEach (function (c) { c.update (); });
	PECK.yard.check_for_grain_collision();
	PECK.yard.can_chickens_see_grains();
	PECK.yard.draw();
	
	// handle time updates
	counter += 1;
	if (counter > 300)
	{
		PECK.infobar.increment_time();
		counter = 0;
	}
	
	var t = setTimeout(PECK.game_loop, 10, ctx, counter);
};


// *** Starting point ***

PECK.setup = function () {	

	var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

	PECK.yard.set_ctx (ctx);

    canvas.addEventListener("click", PECK.dropGrainOnClick, false);
	canvas.addEventListener("mousemove", function (e) {
		PECK.yard.set_mouse(PECK.getCursorPosition(e));
	}, false);
	
//	["Henrietta", "Henelope", "Henderson", "Hencules", "Hendrick"].forEach (function (n) {
//		PECK.yard.add_chicken (PECK.chicken_creator (n));
//	});
	
	["Henrietta"].forEach (function (n) {
		PECK.yard.add_chicken (PECK.chicken_creator (n));
	});

	PECK.game_loop (ctx, 0);
};	

