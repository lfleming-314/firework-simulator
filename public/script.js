//SET CANVAS DIMENSIONS
// set canvas dimensions, relative to window size
const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
var canvas = document.getElementById("canvas");
canvas.height = vh * 0.45;
canvas.width = vw * 0.95;
if (window.location.href.includes("/canvas")) {
    canvas.height = vh * 0.95;
    canvas.width = vw * 0.98;
}
var ctx = canvas.getContext('2d');

// INITIALIZATION
// initialize circ
const circ = 2 * Math.PI; //circumference of a circle in radians

// define color lists
//firework color will be randomly chosen from whichever list(s) are selected
const reds = ["#be0032", "#ff0000", "#e2062c", "#b22222", "#7f1734", "#92000a", "#ff3800", "#ff004f"];
const oranges = ["#da9100", "#ffa500", "#ff8c00", "#ff7f50", "#ffc87c", "#ff7518", "#fb4f14", "#fbceb1"];
const yellows = ["#ffff00", "#f5c71a", "#fffacd", "#f0e130", "#e3ff00", "#e6e200", "#fcc200", "#e4d00a"];
const greens = ["#00ff00", "#32cd32", "#bfff00", "#6b8e23", "#98fb98", "#008000", "#00fa9a", "#ace1af"];
const blues = ["#7fffd4", "#40e0d0", "#20b2aa", "#00ffff", "#9bddff", "#00b7eb", "#0000ff", "#333399"];
const purples = ["#dcd0ff", "#800080", "#8a2be2", "#9370db", "#4b0082", "#dda0dd", "#c9a0dc", "#bb3385"];
const pinks = ["#ffc0cb", "#ffddf4", "#ff69b4", "#ff1493", "#db7093", "#ff6fff", "#fc5a8d", "#da1d81"];
const browns = ["#ffe4c4", "#f4a460", "#bc8f8f", "#cd853f", "#a0522d", "#8b4513", "#965a3e", "#ba8759"];
//define list of possible trail colors- these are not user-controlled
const trailColors = ["#ffeebf", "#ffa200", "#969696", "#636363", "#f7f7f7", "#1c1c1c"];

//initialize worldlist to store the fireworks
var worldlist = [];

// PROCESS USER INPUT
var properties = {
	reds: true,
	oranges: true,
	yellows: true,
	greens: true,
	blues: true,
	purples: true,
	pinks: true,
	browns: false,
	stardust: true,
	comet: false,
	ring: true,
	bouquet: false,
	spiral: false,
	peony: false,
	dahlia: false,
	crossette: false,
	airResistance: 0,
	windspeed: 0,
	gravity: 0,
	xyFlip: false,
	launchSpeed: 10,
	launchAngle: 0,
	fuse: 10,
	radius: 4,
	length: 4,
	duration: 10,
	explodeSpeed: 5,
	ringParticles: 6,
	bouquetParticles: 3,
	spiralParticles: 5,
	crossetteBursts: 4,
	spiralLoops: 2,
	emitterRings: 2
};

//start animation
window.onload = function() {
	 checkBox("reds", properties.reds);
	checkBox("oranges", properties.oranges);
	checkBox("yellows", properties.yellows);
	checkBox("greens", properties.greens);
	checkBox("blues", properties.blues);
	checkBox("purples", properties.purples);
	checkBox("pinks", properties.pinks);
	checkBox("browns", properties.browns);
	checkBox("stardust", properties.stardust);
	checkBox("comet", properties.comet);
	checkBox("ring", properties.ring);
	checkBox("bouquet", properties.bouquet);
	checkBox("spiral", properties.spiral);
	checkBox("peony", properties.peony);
	checkBox("dahlia", properties.dahlia);
	checkBox("crossette", properties.crossette);
	checkBox("airResistance", properties.airResistance);
	fillNumber("windspeed", properties.windspeed);
	fillNumber("gravity", properties.gravity);
	checkBox("xyFlip", properties.xyFlip);
	fillNumber("launchSpeed", properties.launchSpeed);
	fillNumber("launchAngle", properties.launchAngle);
	fillNumber("fuse", properties.fuse);
	fillNumber("radius", properties.radius);
	fillNumber("length", properties.length);
	fillNumber("duration", properties.duration);
	fillNumber("explodeSpeed", properties.explodeSpeed);
	fillNumber("ringParticles", properties.ringParticles);
	fillNumber("bouquetParticles", properties.bouquetParticles);
	fillNumber("spiralParticles", properties.spiralParticles);
	fillNumber("crossetteBursts", properties.crossetteBursts);
	fillNumber("spiralLoops", properties.spiralLoops);
	fillNumber("emitterRings", properties.emitterRings);
	
    //set animation interval
    window.setInterval(updateWorld, 100); //100ms
}

//functions to populate html form
//checks or unchecks checkbox #id depending on whether status is true or false
//and updates local copy of properties
const checkBox = function(id, status) {
    document.getElementById(id).checked = status;
    properties[id] = status;
}
//fills in input #id with the value of status
//and updates local copy of properties
const fillNumber = function(id, status) {
    document.getElementById(id).value = status;
    properties[id] = status;
}

//helper functions to update from user input
//update checkboxes
const toggle = function(propName) {
    var newSetting = !(properties[propName]);
    properties[propName] = newSetting;
}
//update number entry fields
//returns float
const updateNumber = function(value, propName) {
    var newSetting = validateFloat(value);
    properties[propName] = newSetting;
}
//returns positive float (absolute value)
const updatePosNumber = function(value, propName) {
    var newSetting = Math.abs(validateFloat(value));
    properties[propName] = newSetting;
}
//return positive integer- (absolute value rounded down)
const updatePosInt = function(value, propName) {
    var newSetting = Math.floor(Math.abs(validateFloat(value)));
    properties[propName] = newSetting;
}
//convert input to float, or set to 0 if NaN
const validateFloat = function(num) {
    var parsedNum = parseFloat(num);
    if (isNaN(parsedNum)) {
        parsedNum = 0;
    }
    return parsedNum;
}

//DEFINE FIREWORK CLASSES
//Particle is the base class, disappears when it explodes
//circle with smaller white circle inside
class Particle {
    constructor(x, y, color, vx, vy, fuse, radius) {
        this.x = x; //x position on canvas
        this.y = y; //y position
        this.color = color; //explosion color
        this.vx = vx; //x velocity
        this.vy = vy; //y velocity
        this.fuse = fuse; //counts down to explosion
        this.radius = radius; //defines size
        this.exploded = false; //has it exploded yet?
    }

    //draw the firework onto the canvas
    draw() {
        drawDot(this.x, this.y, translucent(this.color, this.fuse), this.radius); //circle
        drawDot(this.x, this.y, translucent("#FFFFFF", this.fuse-1), this.radius/2); //smaller white circle inside
    }

    //runs when fuse == 0
    explode() {
        this.exploded = true;
    }

    //update values for next time it gets rendered
    iterate() {
        this.draw();
        this.x += this.vx; //horizontal motion
        this.vx = accelerateX(this.vx); //horizontal acceleration
        this.y += this.vy; //vertical motion
        this.vy = accelerateY(this.vy); //vertical acceleration
        this.fuse -= 1;
        if (this.fuse <= 0) {
            this.explode();
        }
    }
}
//Trails add a length property
class Trail extends Particle {
    constructor(x, y, color, vx, vy, fuse, radius, length) {
        super(x, y, color, vx, vy, fuse, radius);
        this.length = length; //length of teardrop
    }
}
//Stardust has a teardrop shape
class Stardust extends Trail {
    draw() {
        drawTeardrop(this.x, this.y, translucent(this.color, this.fuse), this.radius, this.vx, this.vy, this.length);
    }
}
//Comet has a teardrop with a white circle inside
class Comet extends Trail {
    draw() {
        drawTeardrop(this.x, this.y, translucent(this.color, this.fuse), this.radius, this.vx, this.vy, this.length);
        drawDot(this.x, this.y, translucent("#FFFFFF", this.fuse-1), this.radius/2);
    }
}

//Firework uses a small, randomly-colored teardrop shape
//and have added parameters to do more complicated things when they explode
class Firework extends Trail {
    constructor(x, y, color, vx, vy, ffuse, radius, length, explodeSpeed, duration, trailColor, numParticles) {
        super(x, y, color, vx, vy, ffuse, radius, length);
        this.explodeSpeed = explodeSpeed; //base speed of exploded particles
        this.duration = duration; //how long the exploded particles endure
        this.trailColor = trailColor; //color before explosion
        this.numParticles = numParticles; //how many particles are released by the explosion
    }

    draw() {
        drawTeardrop(this.x, this.y, this.trailColor, this.radius/2, this.vx, this.vy, this.length);
    }
}
//Bouquet explodes into a 120-degree arc of Comets
class Bouquet extends Firework {
    draw() { //made to look like a Comet
        drawTeardrop(this.x, this.y, this.color, this.radius, this.vx, this.vy, this.length);
        drawDot(this.x, this.y, "#FFFFFF", this.radius/2);
    }
    explode() {
        this.exploded = true;
        var vAngle = angle(this.vx, this.vy);
        var increment = (circ / 3) / this.numParticles; 
        var startAngle = vAngle + circ/ (2 * this.numParticles);
        for (var p = 0; p < this.numParticles; p++) {
            var pAngle = startAngle + p * increment;
            var pV = calcLaunchSpeeds(this.explodeSpeed, pAngle);
            worldlist.push(new Comet(this.x + pV[0], this.y + pV[1], this.color, pV[0], pV[1], this.duration, this.radius, this.length))
        }
    }
}
//Ring explodes into a circle of Comets
class Ring extends Firework {
    explode() {
        this.exploded = true;
        var increment = circ / this.numParticles; //angle between exploded particles
        for (var p = 0; p < this.numParticles; p++) {
            var pAngle = p * increment;
            var pV = calcLaunchSpeeds(this.explodeSpeed, pAngle);
            worldlist.push(new Comet(this.x, this.y, this.color, pV[0], pV[1], this.duration, this.radius, this.length/2))
        }
    }
}
//Crossette explodes into a circle of Rings
class Crossette extends Firework {
    constructor(x, y, color, vx, vy, ffuse, radius, length, explodeSpeed, duration, trailColor, numParticles, bursts) {
        super(x, y, color, vx, vy, ffuse, radius, length, explodeSpeed, duration, trailColor, numParticles);
        this.bursts = bursts; //number of particles in the explosion rings
    }
    explode() {
        this.exploded = true;
        var vAngle = angle(this.vx, this.vy);
        var increment = 360 / this.numParticles;
        for (var p = 0; p < this.numParticles; p++) {
            var pAngle = vAngle + p * increment;
            var pV = calcLaunchSpeeds(this.explodeSpeed, degToRad(pAngle));
            worldlist.push(new Ring(this.x, this.y, this.color, pV[0], pV[1], this.duration/2, this.radius, this.length, this.explodeSpeed, this.duration/2, this.color, this.bursts));
        }
    }
}

//Emitter adds functionality to do more complicated things before the explosion
class Emitter extends Firework {
    constructor(x, y, color, vx, vy, ffuse, radius, length, explodeSpeed, duration, trailColor, numParticles, special) {
        super(x, y, color, vx, vy, ffuse, radius, length, explodeSpeed, duration, trailColor, numParticles);
        this.special = special; //additional parameter used by emit()
        this.emitting = false; //turns on when fuse reaches 0
        this.counter = 0; //incremented by emit()
    }
    //called each iteration after fuse reaches 0, calls explode() when finished
    emit() {
        this.explode()
    }

    //altered version that calls emit()
    iterate() {
        if(this.emitting) {
            this.emit()
        } else {
            this.draw();
            this.x += this.vx; //horizontal motion
            this.vx = accelerateX(this.vx); //horizontal acceleration
            this.y += this.vy; //vertical motion
            this.vy = accelerateY(this.vy); //vertical acceleration
            this.fuse -= 1;
            if (this.fuse <= 0) {
                this.emitting = true;
                this.emit();
            }
        }
        
    }
}
//Spiral emits a rotating series of Comets
class Spiral extends Emitter {
    //this.special = spiralLoops (number of rotations)
    emit() {
        if(this.counter < this.numParticles) {
            var vAngle = angle(this.vx, this.vy);
            var pAngle = (circ * this.special * this.counter / this.numParticles) + vAngle;
            var pV = calcLaunchSpeeds(this.explodeSpeed, pAngle);
            worldlist.push(new Comet(this.x + this.vx, this.y + this.vy, this.color, pV[0], pV[1], this.duration, this.radius, this.length/2));
            this.counter += 1;
        } else {
            this.explode();
        }
    }
}
//Dahlia emits concentric circle(s) of Stardust
class Dahlia extends Emitter {
    emit() {
        if (this.counter >= this.special) { // this.special = emitterRings
            this.explode();
        } else {
            var increment = circ / this.numParticles;
            var offset = this.counter * circ / (2 * this.numParticles);
            for (var p = 0; p < this.numParticles; p++) {
                var pAngle = p * increment + offset;
                var pV = calcLaunchSpeeds(this.explodeSpeed, pAngle);
                worldlist.push(new Stardust(this.x, this.y, this.color, pV[0], pV[1], this.duration, this.radius/2, this.radius))
            }
        }
        this.counter += 1;
    }
}
//Peony emits alternating concentric circle(s) of Particles
class Peony extends Emitter {
    emit() {
        if (this.counter >= this.special * 2) { // this.special = emitterRings
            this.explode();
        } else if (this.counter % 2 == 0) {
            var increment = circ / this.numParticles;
            var offset = 0.5 * this.counter/2;
            for (var p = 0; p < this.numParticles; p++) {
                var pAngle = (p + offset) * increment;
                var pV = calcLaunchSpeeds(this.explodeSpeed, pAngle);
                worldlist.push(new Particle(this.x, this.y, this.color, pV[0], pV[1], this.duration, this.radius, this.radius/2))
            }
        }
        this.counter += 1;
    }
}

// BUILDING FIREWORKS
// color functions
// choose firework color from color list(s)
const chooseColor = function() {
    // create list to hold colors
    var optionList = [];
    // add colorlists to options if they are selected
    if (properties.reds) {
		console.log("red");
        optionList = optionList.concat(reds);
    }
    if (properties.oranges) {
        optionList = optionList.concat(oranges);
    }
    if (properties.yellows) {
        optionList = optionList.concat(yellows);
    }
    if (properties.greens) {
        optionList = optionList.concat(greens);
    }
    if (properties.blues) {
        optionList = optionList.concat(blues);
    }
    if (properties.purples) {
        optionList = optionList.concat(purples);
    }
    if (properties.pinks) {
        optionList = optionList.concat(pinks);
    }
    if (properties.browns) {
        optionList = optionList.concat(browns);
    }
    // randomly choose color from optionList
    var len = optionList.length;
    if (len == 0) {
        return "ffffff"; //white is the default color
    } else {
        var randomIndex = Math.floor(Math.random() * len);
        return optionList[randomIndex];
    }
}
// randomly select trail color
const chooseTrailColor = function() {
    var len = trailColors.length;
    var randomIndex = Math.floor(Math.random() * len);
    return trailColors[randomIndex];
}
//reduces the opacity of a color if the timer is low enough
const translucent = function(baseColor, timer) {
    if (timer > 1) {
        var transparency = 1; //fully opaque
    } else if (timer == 1) {
        var transparency = 0.5; //50% transparency
    } else {
        var transparency = 0; //fully transparent
    }
    //convert "#xxxxxx" string into rgba() format which can specify opacity
    var redHex = baseColor.slice(1,3);
    var greenHex = baseColor.slice(3,5);
    var blueHex = baseColor.slice(5,);
    var red = parseInt(redHex, 16);
    var green = parseInt(greenHex, 16);
    var blue = parseInt(blueHex, 16);
    return "rgba("+red+","+green+","+blue+","+transparency+")";
}

//angular functions
//calculate x and y launch speeds based on angle (uses radians)
const calcLaunchSpeeds = function(launchSpeed, launchAngle) {
    var v0y = launchSpeed * Math.cos(launchAngle);
    var v0x = launchSpeed * Math.sin(launchAngle);
    if (properties.xyFlip) {
        return [v0y, -1 * v0x];
    } else {
        return [v0x, -1 * v0y];
    }
}
//calculates angle from x and y velocities (returns radians)
const angle = function(x, y) {
    if (Math.abs(x) < 0.001) {
        if (y > 0) {
            return circ/4;
        } else {
            return -circ/4;
        }
    } else if (Math.abs(y) < 0.01) {
        if (x > 0) {
            return 0;
        } else {
            return circ/2;
        }
    } else {
        if (y < 0) {
            return -Math.atan(x/y)-circ/4;
        } else {
            if (x > 0) {
                return -Math.atan(x/y)+circ/4;
            } else {
                return Math.atan(y/x)+circ/2;
            }
        }
    }
}
//converts degrees to radians
const degToRad = function(deg) {
    return deg * Math.PI / 180;
}
//converts radians to degrees
const radToDeg = function(rad) {
    return rad * 180 / Math.PI;
}

//choose shape
//returns that type of object (built with the current set of user-defined parameters)
const createShape = function(x, y, color, v0x, v0y) {
    //make list of (strings representing) active shapes
    var shapeList = [];
    var options = ["stardust", "comet", "ring", "bouquet", "spiral", "peony", "dahlia", "crossette"];
    var numOptions = options.length;
    for (var i = 0; i < numOptions; i++) {
        var shape = options[i];
        if (properties[shape]) {
            shapeList.push(shape);
        }
    }

    if (shapeList.length == 0) { //if none are selected, make a default Particle
        return new Particle(x, y, color, v0x, v0y, properties.fuse, properties.radius);
    } else {
        //get the current parameters
        var sIndex = Math.floor(Math.random() * shapeList.length);
        var fShape = shapeList[sIndex];
        var fuse = properties.fuse;
        var radius = properties.radius;
        var length = properties.length;
        var trailColor = chooseTrailColor();
        var duration = properties.duration;
        var explodeSpeed = properties.explodeSpeed;
        var ringParticles = properties.ringParticles;
        var bouquetParticles = properties.bouquetParticles;
        var spiralParticles = properties.spiralParticles;
        var crossetteBursts = properties.crossetteBursts;
        var spiralLoops = properties.spiralLoops;
        var emitterRings = properties.emitterRings;
        //return the chosen shape
        switch (fShape) {
            case "comet":
                return new Comet(x, y, color, v0x, v0y, fuse, radius, length/2);
            case "stardust":
                return new Stardust(x, y, color, v0x, v0y, fuse, radius, length);
            case "ring":
                return new Ring(x, y, color, v0x, v0y, fuse, radius, length, explodeSpeed, duration, trailColor, ringParticles);
            case "bouquet":
                return new Bouquet(x, y, color, v0x, v0y, fuse, radius, length, explodeSpeed, duration, trailColor, bouquetParticles);
            case "spiral":
                return new Spiral(x, y, color, v0x, v0y, fuse, radius, length, explodeSpeed, duration, trailColor, spiralParticles, spiralLoops);
            case "peony":
                return new Peony(x, y, color, v0x, v0y, fuse, radius, length, explodeSpeed, duration, trailColor, ringParticles, emitterRings);
            case "dahlia":
                return new Dahlia(x, y, color, v0x, v0y, fuse, radius, length, explodeSpeed, duration, trailColor, ringParticles, emitterRings);
            case "crossette":
                return new Crossette(x, y, color, v0x, v0y, fuse, radius, length, explodeSpeed, duration, trailColor, ringParticles, crossetteBursts);
            default:
                return new Particle(x, y, color, v0x, v0y, fuse, radius);
        }
    }
}

//drawing functions
//draw dot on canvas
const drawDot = function(xCenter, yCenter, color, radius) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(xCenter, yCenter, radius, 0, circ);
    ctx.fill();
}
//draw teardrop shape on canvas
const drawTeardrop = function(xCenter, yCenter, color, radius, vx, vy, trailLen) {
    ctx.fillStyle = color;
    ctx.beginPath();
    if (vx == 0 && vy == 0) { //if speed = 0, just draw a circle
        ctx.arc(xCenter, yCenter, radius, 0, circ)
    } else { //if moving, angle of teardrop depends on direction of motion
        var vAngle = angle(vx, vy);
        var tailX = xCenter - Math.cos(vAngle)*radius*trailLen;
        var tailY = yCenter - Math.sin(vAngle)*radius*trailLen;
        ctx.arc(xCenter, yCenter, radius, vAngle - circ/4, vAngle + circ/4);
        ctx.lineTo(tailX, tailY);
    }
    ctx.fill();
}

// LAUNCHER
// listener that launches a firework when the canvas is clicked
const launcher = canvas.addEventListener("click", function(e) {
    //get x and y positions of click
    var boundary = canvas.getBoundingClientRect()
    var xPos = e.clientX - boundary.left;
    var yPos = e.clientY - boundary.top;
    //pick color from active lists
    var color = chooseColor();
    //calculate initial x and y speeds from launchSpeed and launchAngle
    var v0xy = calcLaunchSpeeds(properties.launchSpeed, degToRad(properties.launchAngle));
    //create new object and add to worldlist
    worldlist.push(createShape(xPos, yPos, color, v0xy[0], v0xy[1]));
})

//ANIMATION
//update all the elments in worldlist
//called by window.setInterval()
const updateWorld = function() {
    var toRemove = []; //fireworks to be removed are placed here

    //clear the canvas
    ctx.clearRect(0,0,canvas.width,canvas.height);

    //iterate through worldlist to render each firework
    var worldlength = worldlist.length;
    for (var i = 0; i < worldlength; i++) {
        var f = worldlist[i];

        f.iterate();

        if (outofBounds(f.x, f.y) || f.exploded) {
            toRemove.push(f);
        }
    }
    
    //remove each object in toRemove
    for (var k = 0; k < toRemove.length; k++) {
        removeMe(toRemove[k]);
    }
}

//acceleration functions
//horizontal acceleration
const accelerateX = function(vx) {
    if (properties.xyFlip) {
        return gravitate(vx);
    } else { //normal
        return windchange(vx);
    }
}
//vertical acceleration
const accelerateY = function(vy) {
    if (properties.xyFlip) {
        return windchange(vy);
    } else { //normal
        return gravitate(vy);
    }
}
//calculate acceleration from wind
const windchange = function(v) {
    if (properties.xyFlip) {
        if (properties.airResistance) {
            return accelerateTo(v, -properties.windspeed);
        } else { //no air resistance
            return accelerateUntil(v, -properties.windspeed);
        }
    } else {
        if (properties.airResistance) {
            return accelerateTo(v, properties.windspeed);
        } else { //no air resistance
            return accelerateUntil(v, properties.windspeed);
        }
    }
}
//calculate acceleration due to gravity
const gravitate = function(v) {
    if(properties.xyFlip) {
        if (properties.airResistance) {
            var terminal = sqroot(2 * -properties.gravity); //an approximation of terminal velocity
            return accelerateTo(v, terminal);
        } else { //no air resistance
            return v - properties.gravity;
        }
    } else { //normal, no xyFlip
        if (properties.airResistance) {
            var terminal = sqroot(2 * properties.gravity); //an approximation of terminal velocity
            return accelerateTo(v, terminal);
        } else { //no air resistance
            return v + properties.gravity;
        }
    }
}
//acceleration function with a terminal velocity
const accelerateTo = function(v, target) {
    var diff = target - v;
    var change = sqroot(diff);
    return v + change;
}
//similar to accelerateTo, but won't slow down fireworks faster than the target speed
const accelerateUntil = function(v, target) {
    if ((Math.abs(v) >= Math.abs(target) && (v * target) >= 0)) {
        return v;
    } else {
        return accelerateTo(v, target);
    }
}
//helper function for square roots, returns negative root if num is negative
const sqroot = function(num) {
    if (num < 0) {
        return -1 * Math.sqrt(Math.abs(num));
    } else {
        return Math.sqrt(num);
    }
}

//remove a firework from the worldlist
const removeMe = function(firework) {
    var myIndex = worldlist.indexOf(firework);
    if (myIndex > -1) {
        worldlist.splice(myIndex, 1);
    }
}

//returns true if firework is too far outside the canvas 
//(sometimes fireworks "fall" back in if they are close enough)
const outofBounds = function(x, y) {
    var border = 50; //how many px beyond the canvas it can be before getting removed
    var bounds = canvas.getBoundingClientRect();
    var xMax = bounds.width + border;
    var yMax = bounds.height + border;
    var xMin = 0 - border;
    var yMin = 0 - border;
    var isOutside = false;
    if ((x < xMin) || (x > xMax) || (y < yMin) || (y > yMax)) {
        isOutside = true;
    }
    return isOutside;
}

//expand submenus in index page help section
const expand = function(button, section) {
    var thisButton = document.getElementById(button);
    var thisSection = document.getElementById(section);
    thisSection.classList.remove("hidden");
    thisButton.classList.add("hidden");
}

const collapse = function(button, section) {
    var thatButton = document.getElementById(button);
    var thisSection = document.getElementById(section);
    thatButton.classList.remove("hidden");
    thisSection.classList.add("hidden");
}