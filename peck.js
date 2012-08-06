var PECK = {};

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
		this.chickens.forEach ( function (c) { c.chasing = { "x": g.x, "y": g.y-c.height }; });
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
					return true;
				}
				return false;
			});
			
			// if one matches, just take the first one
			if (eating_chickens[0])
			{
				// eat
				eating_chickens[0].chasing = false;
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
			this.chickens.forEach (function (c) { c.chasing = false; });
		}
		
		var that = this;
		// loop through chickens. if they can see a grain, chase
		this.chickens.forEach (function (c) {
			that.grains.forEach (function (g) {
				if (c.can_see (g) || c.standing_near (g))
				{
					c.chasing = { "x": g.x, "y": g.y-c.height };
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
				that.ctx.fillStyle = "black";
				that.ctx.font = "9px sans-serif";
				that.ctx.textBaseline = "top";
				that.ctx.fillText(c.name, c.x, c.y+22);
			}
		});		
	},
	
	draw: function () {
		var i;
		
		this.ctx.fillStyle = "rgb(249,238,137)";
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
	
	x_column_1: 15,
	x_column_2: 100,
	x_column_3: 200,
	
	draw: function (ctx, chickens) {
		ctx.fillStyle = "rgb(0,0,0)";
	    ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = "rgb(255,255,255)";
	    ctx.fillRect(this.x+2, this.y+2, this.width-4, this.height-4);
		
		ctx.fillStyle = "black";
		ctx.font = "bold 9px sans-serif";
	    ctx.textBaseline = "top";
		ctx.fillText("Name", this.x+this.x_column_1, this.y+5)
		ctx.fillText("Action", this.x+this.x_column_2, this.y+5)
		ctx.fillText("Status", this.x+this.x_column_3, this.y+5)

		var that = this;
	    ctx.font = "9px sans-serif";
		chickens.forEach (function (c, i) {
			ctx.fillText(c.name,
				         (that.x+that.x_column_1),
				         (that.y+that.y_indent + i*that.line_height));
			ctx.fillText(c.behaviour.move,
				         (that.x+that.x_column_2),
				         (that.y+that.y_indent + i*that.line_height));
		});
	}
}

// *** Grain ***
// Grain is a placable and eatable object, dropped in a user-generated grain drop
PECK.grain = {
	x: 0,
	y: 0,
	
	draw: function (ctx) {
		ctx.fillStyle = "brown"
		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(this.x+1, this.y);
		ctx.lineTo(this.x+1, this.y+1);
		ctx.lineTo(this.x, this.y+1);
		ctx.fill();
	}
}

PECK.generate_grain = function (x, y) {
	var g = Object.beget(PECK.grain);
	g.x = x || PECK.grain.x;
	g.y = y || PECK.grain.y;
	return g;
};

PECK.dropGrain = function (position) {
	// position has x and y, which is the centre of the 10x10 grain drop
	var startX = position.x - 5;
	var startY = position.y - 5;
	
	// drop 10 bits of grain
	for (var i = 0; i < 10; i += 1)
	{
		PECK.yard.add_grain (PECK.generate_grain(startX+PECK.rand(10), startY+PECK.rand(10)));
	}
	PECK.yard.draw();
}


// *** Chicken-related items ***
// Chicken behaviours: markov_chain for normal activities, chase behaviour for grain

PECK.markov_chain = {
	moves: ["standing", "bok", "peck", "walk", "scratch"],
	transitions: {
		"standing": [10, 20, 10, 40, 20],
		"bok":      [50, 50,  0,  0,  0],
		"peck":     [20,  0, 50,  0, 30],
		"walk":     [30,  0,  0, 70,  0],
		"scratch":  [20,  0, 20,  0, 60]
	},
	move: "standing",
	
	next_move: function () {
		//console.log ("In next_move, current value " + this.move);
		var p = PECK.rand(100);
		var nexts = this.transitions[this.move];
		var i;
		var q = 0; // q is the interim probability between 0 and p
		for (i = 0; i < nexts.length; i++)
		{
			if (p < (nexts[i] + q))
			{
				this.move = this.moves[i];
				break;
			}
			q += nexts[i];
		}
	}
};

// Chicken helper functions
PECK.make_heading = function () {
	return PECK.rand(360);
}

// Chicken object
PECK.chicken = {
	x: 0,
	y: 0,
	height: 20,
	heading: 270,
	name: "Chicken E. Bok",
	frame: 0,
	chasing: false,
	time_to_update: 0,
	
	direction: function () {
		return (this.heading < 180 ? "east" : "west");
	},
	
	rad_heading: function () {
		return this.heading * Math.PI / 180;
	},
	
	update_chase_heading: function () {
		// at x,y going to chasing.x,chasing.y
		var h = PECK.rand(90);
		
		// generate a new heading into the quadrant of the chase
		if (this.chasing)
		{
			if (this.chasing.x > this.x && this.chasing.y < this.y)
				this.heading = h;
			else if (this.chasing.x > this.x && this.chasing.y > this.y)
				this.heading = 90+h;
			else if (this.chasing.x < this.x && this.chasing.y > this.y)
				this.heading = 180+h;
			else
				this.heading = 270+h;
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

	    var xpos = (this.direction() === "west" ? this.x-24 : this.x+6);
	    ctx.fillText("bok!", xpos, this.y);
	},
	
	draw_pecking: function (ctx) {
		var m = (this.direction() === "west" ? 1 : -1);
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
		var m = (this.direction() === "west" ? 1 : -1);
		
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
		var m = (this.direction() === "west" ? 1 : -1);
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
		
		//console.log (this.name + " is currently at (" + this.x + "," + this.y + ") heading " + this.heading);
		// chickens move 10 pix
		this.x += 10 * Math.sin(this.rad_heading());
		this.y -= 10 * Math.cos(this.rad_heading());
		//console.log (this.name + " is now at (" + this.x + "," + this.y + ")");
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
		//console.log ("Drawing move " + this.behaviour.move);
		
		this.select_frame(ctx, this.behaviour.move, this.frame);
	},
	
	update: function () {
		// decrement hysteresis counter before deciding to update
		this.time_to_update -= 1;
		
		if (this.time_to_update <= 0)
		{
			//console.log("Updating " + this.name);
			if (this.chasing)
			{
				// head to the chased position
	            this.update_chase_heading();
			
				this.behaviour.move = "walk";
				this.frame ? this.frame = 0 : this.frame = 1;
				this.update_position();
			}
			else // normal behaviour
			{
				//console.log("heading for " + this.name + " was " + this.heading);
				if (!PECK.rand(5)) // 1 in 5 times, change direction
					this.heading = PECK.make_heading();
				//console.log("heading for " + this.name + " is now " + this.heading);
		
				this.behaviour.next_move ();
				this.frame ? this.frame = 0 : this.frame = 1;
				if (this.behaviour.move === "walk")
				    this.update_position();
			}
			
			// reset update counter
			this.time_to_update = 50 + PECK.rand(50);
		}
	}
	
};

PECK.chicken_creator = function (attributes) {
	var chick = Object.beget(PECK.chicken);
	chick.heading = attributes.heading || PECK.chicken.heading;
	chick.behaviour = Object.beget(PECK.markov_chain);
	chick.name = attributes.name || PECK.chicken.name;
	chick.x = PECK.rand (PECK.yard.width) || PECK.chicken.x;
	chick.y = PECK.rand (PECK.yard.height) || PECK.chicken.y;
	return chick;
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

PECK.peckOnClick = function (e) {
    var position = PECK.getCursorPosition(e);

    if (position === undefined) {
        return;
    }

    //console.log ("Dropping grain at (" + position.x + "," + position.y + ")");
    PECK.dropGrain(position);
};



// *** Game loop ***

// game_loop prints and updates the full yard of chickens
PECK.game_loop = function (ctx) {
    	
	PECK.yard.chickens.forEach (function (c) { c.update (); });
	PECK.yard.check_for_grain_collision();
	PECK.yard.can_chickens_see_grains();
	PECK.yard.draw();
	
	var t = setTimeout(PECK.game_loop, 10, ctx);
};


// *** Starting point ***

PECK.setup = function () {	

	var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

	PECK.yard.set_ctx (ctx);

    canvas.addEventListener("click", PECK.peckOnClick, false);
	canvas.addEventListener("mousemove", function (e) {
		PECK.yard.set_mouse(PECK.getCursorPosition(e));
	}, false);
	
	["Henrietta", "Henelope", "Henderson", "Hencules", "Hendrick"].forEach (function (n) {
		PECK.yard.add_chicken (PECK.chicken_creator ({ name: n, heading: PECK.make_heading() }));
	});

	PECK.game_loop (ctx);
};	

