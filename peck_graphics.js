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

	this.grains.forEach (function (g) { PECK.GFX.draw_grain (g); });
	this.chickens.forEach (function (c) { PECK.GFX.select_chicken_frame (c); });
	
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
	names_html = "";
	actions_html = "";
	status_html = "";
	
	chickens.forEach (function (c) {
		names_html += ("<li>" + c.name + "</li>");
		actions_html += ("<li>" + c.behaviour.move + "</li>");
		status_html += PECK.infobar.draw_status (c);
	});
	
	document.getElementById("chicken-names-list").innerHTML = names_html;
	document.getElementById("chicken-actions-list").innerHTML = actions_html;
	document.getElementById("chicken-status-list").innerHTML = status_html;
	
	farm_html = "<p>Day: " + this.day + "</p><p>Time: " + this.hour + ":00</p>";
	document.getElementById("farm-info-text").innerHTML = farm_html;
};

PECK.infobar.draw_status = function (chicken) {
	return "<li>" + chicken.satiation + "/100</li>";
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
