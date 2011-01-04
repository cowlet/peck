
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

// *** Yard ***
// The yard is the object that holds all the chickens, grain, etc and can draw the screen
var yard = {
	width: 500,
	height: 300,
	ctx: undefined,
	chickens: [],
	objects: [],
	grains: [],
	
	set_ctx: function (ctx) {
		this.ctx = ctx;
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
		for (var i = 0; i < this.chickens.length; i += 1)
		{
			// chickens are 20 pix tall, so chase to y-20
			this.chickens[i].chasing = { "x": g.x, "y": g.y-this.chickens[i].height };
		}
	},
	
	approx_equals: function (a, b) {
		if ( Math.abs(a-b) < 5)
			return true;
		return false;
	},
	
	check_for_grain_collision: function () {
		for (var i = 0; i < this.chickens.length; i += 1)
		{
			for (var j = 0; j < this.grains.length; j += 1)
			{
				// height of a walking chicken is 20 pix
				if (this.approx_equals (this.chickens[i].x, this.grains[j].x) &&
				    this.approx_equals (this.chickens[i].y+this.chickens[i].height, this.grains[j].y))
				{
					// chicken eats grain
					console.log ("(" + this.chickens[i].x + "," + this.chickens[i].y+20 +
					               ") approx equals (" + this.grains[j].x + "," +
					               this.grains[j].y + ")");
					// remove grain
					this.grains.splice(j, 1);
					
					// update chicken to new behaviour
					this.chickens[i].chasing = false;
					this.chickens[i].behaviour.move = "peck";
					
					this.draw();
				}
				else
				{
					console.log ("(" + this.chickens[i].x + "," + this.chickens[i].y+20 +
					               ") doesn't approx equal (" + this.grains[j].x + "," +
					               this.grains[j].y + ")");
				}
			}			
		}
	},
	
	draw: function () {
		var i;
		
		this.ctx.fillStyle = "rgb(249,238,137)";
	    this.ctx.fillRect(0, 0, this.width, this.height);
		
		for (i = 0; i < this.chickens.length; i += 1)
		{
			this.chickens[i].draw (this.ctx);
		}
		for (i = 0; i < this.objects.length; i += 1)
		{
			this.objects[i].draw (this.ctx);
		}
		for (i = 0; i < this.grains.length; i += 1)
		{
			this.grains[i].draw (this.ctx);
		}
		
		this.check_for_grain_collision();
	}
}

// *** Grain ***
// Grain is a placable and eatable object, dropped in a user-generated grain drop
var grain = {
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

var generate_grain = function (x, y) {
	var g = Object.beget(grain);
	g.x = x || grain.x;
	g.y = y || grain.y;
	return g;
};

var dropGrain = function (position) {
	// position has x and y, which is the centre of the 10x10 grain drop
	var startX = position.x - 5;
	var startY = position.y - 5;
	
	// drop 10 bits of grain
	for (var i = 0; i < 10; i += 1)
	{
		yard.add_grain (generate_grain(startX+rand(10), startY+rand(10)));
	}
	yard.draw();
}


// *** Chicken-related items ***
// Chicken behaviours: markov_chain for normal activities, chase behaviour for grain
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

// Chicken helper functions
var make_heading = function () {
	return rand(360);
}

// Chicken object
var chicken = {
	x: 0,
	y: 0,
	height: 20,
	heading: 270,
	name: "Chicken E. Bok",
	frame: 0,
	chasing: false,
	
	direction: function () {
		return (this.heading < 180 ? "east" : "west");
	},
	
	rad_heading: function () {
		return this.heading * Math.PI / 180;
	},
	
	update_chase_heading: function () {
		// at x,y going to chasing.x,chasing.y
		var h = rand(90);
		
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
		//console.log ("Drawing move " + this.behaviour.move);
		
		this.select_frame(ctx, this.behaviour.move, this.frame);		
		
		ctx.fillStyle = "black";
	    ctx.font = "9px sans-serif";
	    ctx.textBaseline = "top";
	    ctx.fillText(this.name, this.x, this.y+22);
	},
	
	update: function () {
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
			console.log("heading for " + this.name + " was " + this.heading);
			if (!rand(5)) // 1 in 5 times, change direction
				this.heading = make_heading();
			console.log("heading for " + this.name + " is now " + this.heading);
		
			this.behaviour.next_move ();
			this.frame ? this.frame = 0 : this.frame = 1;
			if (this.behaviour.move === "walk")
			    this.update_position();
		}
	}
	
};

var chicken_creator = function (attributes) {
	var chick = Object.beget(chicken);
	chick.heading = attributes.heading || chicken.heading;
	chick.behaviour = Object.beget(markov_chain);
	chick.name = attributes.name || chicken.name;
	chick.x = rand(yard.width) || chicken.x;
	chick.y = rand(yard.height) || chicken.y;
	return chick;
};


// User interaction
var getCursorPosition = function (e) {
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

    if (x < 0 || y < 0 || x > yard.width || y > yard.height)
    {
        console.log("Out of bounds (" + x + "," + y + ")");
        return undefined;
    }

    return { "x": x, "y": y };
}

var peckOnClick = function (e) {
    var position = getCursorPosition(e);

    if (position === undefined) {
        return;
    }

    console.log ("Dropping grain at (" + position.x + "," + position.y + ")");
    dropGrain(position);
}


// *** Game loops ***

// game_loop prints and updates the full coop
var game_loop = function (ctx) {
    
	for (i = 0; i < coop.length; i += 1)
	{
		coop[i].update();
	}
	
	yard.draw();
	
	var t = setTimeout(game_loop, 1000, ctx, coop);
};

// test_loop loops indefinitely with only one chicken
var test_loop = function (ctx) {
    
	test_coop[0].update();
	
	yard.draw();
	
	var t = setTimeout(test_loop, 1000, ctx, coop);
	
};

// test1 and test2 are for stepping through two frames of a single chicken
var test1 = function (ctx, coop) {
	
	// standing, peck, bok, walk, scratch
			
	ctx.fillStyle = "rgb(249,238,137)";
    ctx.fillRect(0, 0, yard.width, yard.height);
    
	coop[0].x = 300;
	coop[0].y = 150;
	coop[0].heading = 240;
	coop[0].behaviour.move = "walk";
	coop[0].draw(ctx);
	var t = setTimeout(test2, 1000, ctx, coop);
	
};

var test2 = function (ctx, coop) {
	ctx.fillStyle = "rgb(249,238,137)";
    ctx.fillRect(0, 0, yard.width, yard.height);
    
	coop[0].x = 300;
	coop[0].y = 150;
	coop[0].heading = 240;
	coop[0].behaviour.move = "walk";
	coop[0].update_position();
	coop[0].frame = 1;
	coop[0].draw(ctx);
};

var coop = [chicken_creator( { name: "Henrietta", heading: make_heading() } ),
            chicken_creator( { name: "Henelope", heading: make_heading() } ),
            chicken_creator( { name: "Henderson", heading: make_heading() } ),
            chicken_creator( { name: "Hencules", heading: make_heading() } ),
            chicken_creator( { name: "Hendrick", heading: make_heading() } ) ];

var test_coop = [chicken_creator( { name: "Henrietta", heading: make_heading() } )];


// *** Starting point ***

var setup = function () {

	var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

	yard.set_ctx(ctx);

    canvas.addEventListener("click", peckOnClick, false);

	//for (i = 0; i < coop.length; i += 1)
	//{
	//	yard.add_chicken(coop[i]);
	//}
	
	for (i = 0; i < test_coop.length; i += 1)
	{
		yard.add_chicken(test_coop[i]);
	}

    //game_loop (ctx, coop);
    //test1 (ctx, coop); // single step
    test_loop (ctx, coop);
};	

