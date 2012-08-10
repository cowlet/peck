PECK.GFX =  {};

PECK.GFX.colourways = {
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

PECK.GFX.colouring = function (area) {
	return PECK.GFX.colourways[PECK.infobar.day_or_night()][area];
};

PECK.GFX.set_ctx = function (ctx) {
	PECK.GFX.ctx = ctx;
};


/*** Yard updates ***/
PECK.yard.draw = function () {
	var i;
	
	PECK.GFX.ctx.fillStyle = PECK.GFX.colouring ("ground");
    PECK.GFX.ctx.fillRect(0, 0, this.width, this.height);

	this.chickens.forEach (function (c) { PECK.GFX.select_chicken_frame (c); });
	this.grains.forEach (function (g) { PECK.GFX.draw_grain (g); });
	
	PECK.infobar.draw (this.chickens);
	
	this.check_for_mouse_on_chickens ();
};


/*** Infobar updates ***/
PECK.infobar.x = 0;
PECK.infobar.y = PECK.yard.height;
PECK.infobar.width = PECK.yard.width;
PECK.infobar.height = 100;
PECK.infobar.line_height = 15;
PECK.infobar.y_indent = 20;
PECK.infobar.x_columns = [15, 100, 200, 360];

PECK.infobar.draw = function (chickens) {
	PECK.GFX.ctx.fillStyle = "black";
    PECK.GFX.ctx.fillRect(this.x, this.y, this.width, this.height);
	PECK.GFX.ctx.fillStyle = "white";
    PECK.GFX.ctx.fillRect(this.x+2, this.y+2, this.width-4, this.height-4);
	
	PECK.GFX.ctx.fillStyle = "black";
	PECK.GFX.ctx.font = "bold 9px sans-serif";
    PECK.GFX.ctx.textBaseline = "top";
	PECK.GFX.ctx.fillText("Name", this.x+this.x_columns[0], this.y+5)
	PECK.GFX.ctx.fillText("Action", this.x+this.x_columns[1], this.y+5)
	PECK.GFX.ctx.fillText("Status", this.x+this.x_columns[2], this.y+5)

	var that = this;
    PECK.GFX.ctx.font = "9px sans-serif";
	chickens.forEach (function (c, i) {
		PECK.GFX.ctx.fillText(c.name,
			         (that.x+that.x_columns[0]),
			         (that.y+that.y_indent + i*that.line_height));
		PECK.GFX.ctx.fillText(c.behaviour.move,
			         (that.x+that.x_columns[1]),
			         (that.y+that.y_indent + i*that.line_height));
	});
	
	PECK.GFX.ctx.fillStyle = "black";
	PECK.GFX.ctx.fillRect(this.x+this.x_columns[3]-5, this.y, 2, this.height);
	PECK.GFX.ctx.font = "bold 9px sans-serif";
    PECK.GFX.ctx.textBaseline = "top";
    PECK.GFX.ctx.fillText ("Farm", this.x+this.x_columns[3]+this.x_columns[0], this.y+5);
	
	PECK.GFX.ctx.font = "9px sans-serif";
    PECK.GFX.ctx.fillText ("Day: " + this.day,
                  this.x+this.x_columns[3]+this.x_columns[0],
                  this.y+this.y_indent);
    PECK.GFX.ctx.fillText ("Time: " + this.hour + ":00",
                  this.x+this.x_columns[3]+this.x_columns[0],
                  this.y+this.y_indent + this.line_height);  
};


/*** Chicken drawing functions ***/
PECK.GFX.select_chicken_frame = function (c) {
	//console.log ("Selecting frame for " + c.behaviour.move + ", " + c.frame);
	if (c.frame === 0)
	{
		if (c.behaviour.move === "standing")
		    PECK.GFX.draw_facing(c);
		else if (c.behaviour.move === "peck")
		    PECK.GFX.draw_pecking(c);
		else if (c.behaviour.move === "bok")
		    PECK.GFX.draw_bokking(c);
		else if (c.behaviour.move === "walk" || c.behaviour.move === "chase")
		    PECK.GFX.draw_walking(c);
        else if (c.behaviour.move === "scratch")
            PECK.GFX.draw_scratching(c);
	}
	else
	{
		if (c.behaviour.move === "scratch")
            PECK.GFX.draw_scratching(c);
		else
		    PECK.GFX.draw_facing(c);
		// standing, peck, walk, bok all have the same off frame
	}
};

PECK.GFX.draw_facing = function (c) {
	var bodyX = c.x;
	var bodyY = c.y;
	// multiplier is pos or neg depending on direction of facing
	// affects x offsets only
	var m = (c.direction() === "west" ? 1 : -1);

	// beak
	PECK.GFX.ctx.fillStyle = PECK.GFX.colouring("beaksnfeet");
	PECK.GFX.ctx.beginPath();
	PECK.GFX.ctx.moveTo(bodyX, bodyY);
	PECK.GFX.ctx.lineTo(bodyX + (-4*m), bodyY+4);
	PECK.GFX.ctx.lineTo(bodyX, bodyY+8);
	PECK.GFX.ctx.fill();

	// body		
	PECK.GFX.ctx.fillStyle = PECK.GFX.colouring("body");
	PECK.GFX.ctx.beginPath();
	PECK.GFX.ctx.moveTo(bodyX, bodyY);
	PECK.GFX.ctx.lineTo(bodyX, bodyY+16);
	PECK.GFX.ctx.lineTo(bodyX + (8*m), bodyY+16);
	PECK.GFX.ctx.fill();

	// feet
	PECK.GFX.ctx.fillStyle = PECK.GFX.colouring("beaksnfeet");
	PECK.GFX.ctx.beginPath();
	PECK.GFX.ctx.moveTo(bodyX + (4*m), bodyY+16);
	PECK.GFX.ctx.lineTo(bodyX + (2*m), bodyY+20);
	PECK.GFX.ctx.lineTo(bodyX + (6*m), bodyY+20);
	PECK.GFX.ctx.fill();
};


PECK.GFX.draw_bokking = function (c) {
	PECK.GFX.draw_facing (c);
	PECK.GFX.ctx.fillStyle = PECK.GFX.colouring("text");
    PECK.GFX.ctx.font = "9px sans-serif";
    PECK.GFX.ctx.textBaseline = "top";

    var xpos = (c.direction() === "west" ? c.x-24 : c.x+6);
    PECK.GFX.ctx.fillText("bok!", xpos, c.y);
};

PECK.GFX.draw_pecking = function (c) {
	var m = (c.direction() === "west" ? 1 : -1);
	var bodyX = c.x - (12*m);
	var bodyY = c.y+11;

	// body
	PECK.GFX.ctx.fillStyle = PECK.GFX.colouring("body");
	PECK.GFX.ctx.beginPath();
	PECK.GFX.ctx.moveTo(bodyX, bodyY);
	PECK.GFX.ctx.lineTo(bodyX + (12*m), bodyY+5);
	PECK.GFX.ctx.lineTo(bodyX + (18*m), bodyY);
	PECK.GFX.ctx.fill();

	// beak
	PECK.GFX.ctx.fillStyle = PECK.GFX.colouring("beaksnfeet");
	PECK.GFX.ctx.beginPath();
	PECK.GFX.ctx.moveTo(bodyX, bodyY);
	PECK.GFX.ctx.lineTo(bodyX + (3*m), bodyY+8);
	PECK.GFX.ctx.lineTo(bodyX + (6*m), bodyY+3);
	PECK.GFX.ctx.fill();

	// feet
	PECK.GFX.ctx.fillStyle = PECK.GFX.colouring("beaksnfeet");
	PECK.GFX.ctx.beginPath();
	PECK.GFX.ctx.moveTo(bodyX + (15*m), c.y+16);
	PECK.GFX.ctx.lineTo(bodyX + (13*m), c.y+20);
	PECK.GFX.ctx.lineTo(bodyX + (17*m), c.y+20);
	PECK.GFX.ctx.fill();
};

PECK.GFX.draw_walking = function (c) {
	var bodyX = c.x;
	var bodyY = c.y;
	var m = (c.direction() === "west" ? 1 : -1);

	// beak
	PECK.GFX.ctx.fillStyle = PECK.GFX.colouring("beaksnfeet");
	PECK.GFX.ctx.beginPath();
	PECK.GFX.ctx.moveTo(bodyX, bodyY);
	PECK.GFX.ctx.lineTo(bodyX + (-4*m), bodyY+4);
	PECK.GFX.ctx.lineTo(bodyX, bodyY+8);
	PECK.GFX.ctx.fill();

	// body		
	PECK.GFX.ctx.fillStyle = PECK.GFX.colouring("body");
	PECK.GFX.ctx.beginPath();
	PECK.GFX.ctx.moveTo(bodyX, bodyY);
	PECK.GFX.ctx.lineTo(bodyX, bodyY+16);
	PECK.GFX.ctx.lineTo(bodyX + (8*m), bodyY+16);
	PECK.GFX.ctx.fill();

	// feet
	PECK.GFX.ctx.fillStyle = PECK.GFX.colouring("beaksnfeet");;
	PECK.GFX.ctx.beginPath();
	PECK.GFX.ctx.moveTo(bodyX + (2*m), bodyY+16);
	PECK.GFX.ctx.lineTo(bodyX + (1*m), bodyY+20);
	PECK.GFX.ctx.lineTo(bodyX + (3*m), bodyY+20);
	PECK.GFX.ctx.fill();
	PECK.GFX.ctx.beginPath();
	PECK.GFX.ctx.moveTo(bodyX + (5*m), bodyY+16);
	PECK.GFX.ctx.lineTo(bodyX + (4*m), bodyY+20);
	PECK.GFX.ctx.lineTo(bodyX + (6*m), bodyY+20);
	PECK.GFX.ctx.fill();
};


PECK.GFX.draw_scratching = function (c) {
	var m = (c.direction() === "west" ? 1 : -1);
	var bodyX = c.x - (8*m);
	var bodyY = c.y+8;

	// body
	PECK.GFX.ctx.fillStyle = PECK.GFX.colouring("body");
	PECK.GFX.ctx.beginPath();
	PECK.GFX.ctx.moveTo(bodyX, bodyY);
	PECK.GFX.ctx.lineTo(bodyX + (10*m), bodyY+8);
	PECK.GFX.ctx.lineTo(bodyX + (18*m), bodyY+5);
	PECK.GFX.ctx.fill();

	// beak
	PECK.GFX.ctx.fillStyle = PECK.GFX.colouring("beaksnfeet");
	PECK.GFX.ctx.beginPath();
	PECK.GFX.ctx.moveTo(bodyX, bodyY);
	PECK.GFX.ctx.lineTo(bodyX + (3*m), bodyY+8);
	PECK.GFX.ctx.lineTo(bodyX + (6*m), bodyY+3);
	PECK.GFX.ctx.fill();

	// feet
	PECK.GFX.ctx.fillStyle = PECK.GFX.colouring("beaksnfeet");
	PECK.GFX.ctx.beginPath();
	if (c.frame === 0)
	{
		PECK.GFX.ctx.moveTo(bodyX + (13*m), c.y+16);
		PECK.GFX.ctx.lineTo(bodyX + (11*m), c.y+20);
		PECK.GFX.ctx.lineTo(bodyX + (15*m), c.y+20);
		PECK.GFX.ctx.fill();
	}
	else
	{
		PECK.GFX.ctx.moveTo(bodyX + (13*m), c.y+16);
		PECK.GFX.ctx.lineTo(bodyX + (11*m), c.y+20);
		PECK.GFX.ctx.lineTo(bodyX + (13*m), c.y+20);
		PECK.GFX.ctx.fill();
		PECK.GFX.ctx.beginPath();
		PECK.GFX.ctx.moveTo(bodyX + (13*m), c.y+16);
		PECK.GFX.ctx.lineTo(bodyX + (17*m), c.y+18);
		PECK.GFX.ctx.lineTo(bodyX + (18*m), c.y+16);
		PECK.GFX.ctx.fill();
	}
};

PECK.GFX.write_chicken_name = function (name, x, y) {
	PECK.GFX.ctx.fillStyle = PECK.GFX.colouring("text");
	PECK.GFX.ctx.font = "9px sans-serif";
	PECK.GFX.ctx.textBaseline = "top";
	PECK.GFX.ctx.fillText(name, x, y);
};

PECK.GFX.draw_grain = function (g) {
	PECK.GFX.ctx.fillStyle = PECK.GFX.colouring ("grain");
	PECK.GFX.ctx.beginPath();
	PECK.GFX.ctx.moveTo(g.x, g.y);
	PECK.GFX.ctx.lineTo(g.x+1, g.y);
	PECK.GFX.ctx.lineTo(g.x+1, g.y+1);
	PECK.GFX.ctx.lineTo(g.x, g.y+1);
	PECK.GFX.ctx.fill();
};
