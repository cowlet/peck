PECK.GFX =  {};

PECK.GFX.colourways = {
  day: {
    ground: "rgb(249,238,137)",
    body: "brown",
    beaksnfeet: "orange",
    grain: "brown",
    text: "black",
    egg: "white"
  },
  night: {
    ground: "rgb(50,50,100)",
    body: "rgb(20,20,20)",
    beaksnfeet: "rgb(165,150,150)",
    grain: "black",
    text: "white",
    egg: "rgb(240,240,220)"
  },
  between: {
    ground: "rgb(242,159,153)",
    body: "brown",
    beaksnfeet: "rgb(220,120,90)",
    grain: "brown",
    text: "white",
    egg: "rgb(240, 240, 220)"
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
  sat_html = "";
  hap_html = "";
  
  chickens.forEach (function (c) {
    names_html += ("<li>" + c.name + "</li>");
    actions_html += ("<li>" + (c.behaviour.move || "egg") + "</li>");
    sat_html += ("<li><canvas class=\"bar\" id=\"" + c.name +
                 "-sat\"></canvas></li>");
    hap_html += ("<li><canvas class=\"bar\" id=\"" + c.name +
                 "-hap\"></canvas></li>");
  });
  
  document.getElementById("chicken-names-list").innerHTML = names_html;
  document.getElementById("chicken-actions-list").innerHTML = actions_html;
  document.getElementById("chicken-sat-list").innerHTML = sat_html;
  document.getElementById("chicken-hap-list").innerHTML = hap_html;
  
  chickens.forEach (function (c) {
    PECK.infobar.draw_bar (c.name + "-sat", c.satiation);
    PECK.infobar.draw_bar (c.name + "-hap", c.happiness);
  });
  
  farm_html = "<p>Day: " + this.day + " Time: " + this.hour + ":00</p><p>Money: $" +
              this.money + "</p>";
  document.getElementById("farm-info-text").innerHTML = farm_html;
};

PECK.infobar.draw_bar = function (element_name, value) {
  var canvas = document.getElementById (element_name);
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect (0, 0, canvas.width, canvas.height);
  var xmarg = 5;
  var ymarg = 10;
  
  var graph_length = (canvas.width - 2*xmarg) * value/100;
  if (value > 60)
  {
      ctx.fillStyle = "green";
  }
  else if (value > 25)
  {
    ctx.fillStyle = "yellow";
  }
  else
  {
    ctx.fillStyle = "red";
  }
  ctx.fillRect (xmarg, ymarg, graph_length, canvas.height-2*ymarg);
  ctx.fillStyle = "white";
  ctx.fillRect ((xmarg+graph_length), ymarg,
                (canvas.width - graph_length - 2*xmarg), canvas.height-2*ymarg);
};


/*** Chicken drawing functions ***/
PECK.GFX.select_chicken_frame = function (c) {
  //PECK.GFX.draw_hitbox (c);

  if (c.frame === undefined) // egg
  {
    PECK.GFX.draw_egg (c);
    return;
  }
  
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

/*** Egg drawing ***/
PECK.GFX.draw_egg = function (e) {
  PECK.GFX.ctx.fillStyle = "rgb(100, 100, 60)";
  PECK.GFX.ctx.beginPath();
  PECK.GFX.ctx.arc (e.x, e.y, 10, Math.PI/6, Math.PI*5/6, false);
  PECK.GFX.ctx.closePath();
  PECK.GFX.ctx.fill();

  PECK.GFX.ctx.fillStyle = PECK.GFX.colouring ("egg");
  PECK.GFX.ctx.beginPath();
  PECK.GFX.ctx.arc (e.x, e.y, 9, 0, Math.PI*2, false);
  PECK.GFX.ctx.closePath();
  PECK.GFX.ctx.fill();

  PECK.GFX.ctx.beginPath();
  PECK.GFX.ctx.arc (e.x, e.y-3, 8, 0, Math.PI*2, true);
  PECK.GFX.ctx.closePath();
  PECK.GFX.ctx.fill();

};

/*** Mouse events ***/
PECK.GFX.handleClick = function (e) {
  var position = PECK.getCursorPosition(e);
  if (position === undefined) {
    return;
  }

  if (document.getElementById ("grain").checked)
  {
    PECK.GFX.dropGrainOnClick (position);
  }
  else if (document.getElementById ("sell").checked)
  {
    PECK.GFX.sellItem (position);
  }
};


PECK.GFX.dropGrainOnClick = function (position) {
  // Drop n grains in an nxn square centered on position's x and y
  var n = 10;
  for (var i = 0; i < n; i += 1)
  {
    PECK.yard.add_grain ( {
      x: position.x - n/2 + PECK.rand (n), // centered on click
      y: position.y - n/2 + PECK.rand (n), // centered on click
    });
  }
  // Pay for the grain
  PECK.infobar.money -= 1;
  PECK.yard.draw();
};

PECK.GFX.draw_hitbox = function (chicken) {
  PECK.GFX.ctx.fillStyle = "black";
  if (chicken.behaviour.move === "egg")
  {
    PECK.GFX.ctx.strokeRect (chicken.x-10, chicken.y-12, 20, 24);
  }
  else
  {
    PECK.GFX.ctx.strokeRect (chicken.x-10, chicken.y, 20, 20);
  }
};

PECK.GFX.sellItem  = function (position) {
  // Is the click on something sellable?
  var clicked = PECK.yard.chickens.filter (function (c) {
    if ((c.behaviour.move === "egg") &&
        PECK.approx_equals (c.x, position.x, 10) &&
        PECK.approx_equals (c.y, position.y, 12))
    {
      return true;
    }
    else if (PECK.approx_equals (c.x, position.x, 10) &&
             PECK.approx_equals (c.y+10, position.y, 10))
    {
      return true;
    }
  });

  if (clicked.length > 0)
  {
    PECK.infobar.money += 5;
    PECK.yard.chickens.splice (PECK.yard.chickens.indexOf (clicked[0]), 1);
  }
};



