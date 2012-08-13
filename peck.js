var PECK = {};

// *** Yard ***
// The yard is the object that holds all the chickens, grain, etc
PECK.yard = {
	width: 620,
	height: 300,
	mouse_state: undefined,
	chickens: [],
	grains: [],
	
	set_mouse: function (ms) {
		this.mouse_state = ms;
	},
	
	add_chicken: function (c) {
		this.chickens.push (c);
	},
	
	add_grain: function (g) {
		this.grains.push (g);
		
		// Provoke the chickens
		this.chickens.forEach (function (c) { c.start_chase({ "x": g.x, "y": g.y-c.height }); });
	},
	
	is_grain_around: function (c) {
		// can chicken c eat grain
		var that = this;
		this.grains.some (function (g) {			
			// can chicken see grain
			if (c.can_see (g) || c.standing_near (g))
			{
				c.start_chase ({ "x": g.x, "y": g.y-c.height });
			};
			
			// can chicken eat grain
			if (PECK.approx_equals (c.x, g.x, 5) &&
			    PECK.approx_equals (c.y+c.height, g.y, 5))
			{
				//console.log ("Chicken " + c.name + " is eating grain " + that.grains.indexOf(g));
				c.stop_chase (true);
				that.grains.splice (that.grains.indexOf (g), 1); // delete grain
				// eating is highest priority: don't look for more grain
				return true;
			};
			return false;
		});
		
		// if there is no more grain, stop the chase
		if (this.grains.length === 0)
		{
			c.stop_chase (false);
		}
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
				PECK.GFX.write_chicken_name (c.name, c.x, c.y+22);
			}
		});		
	}
}

// *** Infobar ***
// The infobar prints all the chicken info
PECK.infobar = {	
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
	}
}


// *** Chicken-related items ***
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
		satiation: 100,
		
		behaviour: {
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
		},
	
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
		
		stop_chase: function (caught) {
			this.chasing = false;
			if (caught)
			{
				this.satiation = Math.min (100, this.satiation+10);
				this.behaviour.move = "peck";
			}
			else if (this.behaviour.move === "chase")
			{
				this.behaviour.move = "standing";
			};
			// else, it wasn't chasing, so keep moving as before
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
	
		update_position: function () {		
			if (this.behaviour.move === "walk" ||
			    this.behaviour.move === "chase")
			{
				// chickens move 10 pix
				this.x += 10 * Math.sin(this.rad_heading());
				this.y -= 10 * Math.cos(this.rad_heading());
			}
		},
	
		update: function () {
			// decrement hysteresis counter before deciding to update
			this.time_to_update -= 1;
		
			if (this.time_to_update <= 0)
			{
				//console.log ("Chicken is updating");
				this.behaviour.next_move ();
				PECK.yard.is_grain_around (this);
				this.update_heading ();
				this.update_position ();
				this.frame ? this.frame = 0 : this.frame = 1;
				
				this.satiation = Math.max (0, this.satiation-1);
			
				// reset update counter
				this.time_to_update = 50 + PECK.rand(50);
			}
		}
	
	};
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
		});
	}
	PECK.yard.draw();
};


// *** Game loop ***
// game_loop prints and updates the full yard of chickens
PECK.game_loop = function (counter) {
    	
	// handle yard updates
	PECK.yard.chickens.forEach (function (c) { c.update (); });
	PECK.yard.draw();
	
	// handle time updates
	counter += 1;
	if (counter > 300)
	{
		PECK.infobar.increment_time();
		counter = 0;
	}
	
	var t = setTimeout(PECK.game_loop, 10, counter);
};


// *** Starting point ***
PECK.setup = function () {	

	var canvas = document.getElementById("canvas");
	PECK.yard.width = canvas.width;
	PECK.yard.height = canvas.height;
	PECK.GFX.set_ctx (canvas.getContext("2d"));

    canvas.addEventListener("click", PECK.dropGrainOnClick, false);
	canvas.addEventListener("mousemove", function (e) {
		PECK.yard.set_mouse(PECK.getCursorPosition(e));
	}, false);
	
	["Henrietta", "Henelope", "Henderson", "Hencules", "Hendrick"].forEach (function (n) {
		PECK.yard.add_chicken (PECK.chicken_creator (n));
	});
	
/*	["Henrietta"].forEach (function (n) {
		PECK.yard.add_chicken (PECK.chicken_creator (n));
	});
*/
	PECK.game_loop (0);
};	

