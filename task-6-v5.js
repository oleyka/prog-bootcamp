function angleRad2Deg(angle) { return angle * 180 / Math.PI; }
function angleDeg2Rad(angle) { return angle * Math.PI / 180; }
function calcAngle(fromX, fromY, toX, toY) { // in radian, physically correct angle
	return Math.atan2(fromY - toY, toX - fromX);
}

Wobbler.prototype.frameInterval = function() {
	document.getElementById("frame-rate" + this.id).innerHTML = this.id + ": " + this.frame.countSec;
	this.frame.count += this.frame.countSec; 
	this.frame.countSec = 0; 
}

Wobbler.prototype.display = function() {
    var rotateCSSProperty = "rotate(" + angleRad2Deg(this.angle) + "deg)";
    setBrowserIndependentProperty(this.element, "transform", rotateCSSProperty);
	this.frame.countSec++;
}

Wobbler.prototype.balanceElement = function() {
	this.angle = -this.maxAngle * Math.sin(this.path);
	this.path += this.inc;
	this.display();
}

Wobbler.prototype.unbalanceElement = function() {
	this.angle = (this.lAngle - this.rAngle) * Math.sin(this.path) / 2 - (this.rAngle + this.lAngle) / 2;
		// angle is negated to reflect physically correct value
	this.path += this.inc;
	this.display();
};

Wobbler.prototype.balance = function(lAngleDeg, rAngleDeg) { // 
	this.path = 0;		// parameter to sin() for calculating the next angle, 
						// 0 = middle of interval, -Math.PI/2 = left, Math.PI/2 = right
	this.inc = 0.05;	// increment to this.path
	var self = this;

	if (typeof(rAngleDeg) == "undefined") { 
		this.maxAngle = angleDeg2Rad(lAngleDeg);
		this.angle = this.maxAngle;	// used by display(), will be recalculated

		var frameInterval = Math.max(16, 250/lAngleDeg); // 0.5degree redraw
		this.inc = Math.PI*frameInterval/500;
		this.timerId = setInterval(function() { self.balanceElement(); }, frameInterval); 
	} else {
		this.lAngle = angleDeg2Rad(lAngleDeg);
		this.rAngle = angleDeg2Rad(rAngleDeg);
		if ( this.lAngle > this.rAngle ) { [ this.lAngle, this.rAngle ] = [ this.rAngle, this.lAngle ]; }
		if ( this.lAngle == this.rAngle ) { this.rAngle += Math.PI*2; }

		var frameInterval = Math.max(16, 500/angleRad2Deg(this.rAngle-this.lAngle));
		this.inc = Math.PI*frameInterval/500;
		this.timerId = setInterval(function() { self.unbalanceElement(); }, frameInterval); 
	}
}

Wobbler.prototype.rotateElement = function() {
	switch(this.accelerate) {
	case 0:
		this.angle = -this.path;
		break;
	case -1:
		this.angle = -this.maxAngle * Math.sin(this.path) - this.lAngle;
		break;
	case 1:
		this.angle = this.maxAngle * Math.cos(this.path) - this.rAngle;
		break;
	default:
		this.angle = this.maxAngle * ( Math.cos(this.path) - 1 ) / 2 - this.lAngle;
	}
//	console.log("Angle: " + (-this.angle) + "; path: " + this.path + "; next path: " + (this.path+this.inc));
	this.display();
	
	this.path += this.inc;
	if ( (this.accelerate != 0 && this.pathEnd - this.path >= 0 ) ||
		 (this.accelerate == 0 && (Math.max(this.lAngle, this.rAngle, this.path) != this.path && 
								   Math.min(this.lAngle, this.rAngle, this.path) != this.path) ) ) {
		var self = this;
		this.timeoutId = setTimeout(function() { self.rotateElement(); }, 16); 
	} else {
		this.angle = -this.rAngle;
		this.display();
	}
}

Wobbler.prototype.rotate = function(lAngleDeg, rAngleDeg, accelerate) {
	if ( lAngleDeg == rAngleDeg ) { return; }
	
	this.lAngle = angleDeg2Rad(lAngleDeg);
	this.rAngle = angleDeg2Rad(rAngleDeg);
	this.maxAngle = this.rAngle - this.lAngle;
	this.accelerate = accelerate;
	this.inc = 0.05; // base inc for Pi/6
	
	
	switch(accelerate) {
	case 0:				// no acceleration
		this.path = this.lAngle;
		this.pathEnd = this.rAngle;
		this.inc = this.maxAngle / 90; // *(Math.PI/3.82)/60
		break;
	case -1:			// decelerate
		this.path = 0;
		this.pathEnd = Math.PI/2;
		this.inc *= Math.PI/(3*Math.abs(this.maxAngle));
		break;
	case 1:				// accelerate
		this.path = 0; 
		this.pathEnd = Math.PI/2;
		this.inc *= Math.PI/(3*Math.abs(this.maxAngle));
		break;
	default:			// accelerate and decelerate
		this.path = 0;
		this.pathEnd = Math.PI;
		this.inc *= Math.PI/(1.5*Math.abs(this.maxAngle));
	}
	
	console.log(this);
	this.rotateElement();
}
		

Wobbler.prototype.adjust = function() { // to rewrite!
	var startAngle = this.angleDeg;
	var endAngle = this.angleDeg;
	
	if (startAngle > this.maxAngleDeg) { 
		var endAngle = this.maxAngleDeg; 
	} else if (startAngle < -this.maxAngleDeg) {
		var endAngle = -this.maxAngleDeg; 
	}
	
	var self = this;
	if (startAngle == endAngle) {
		this.inc = Math.round(20 * Math.asin(this.angleDeg/this.maxAngleDeg));
		this.start();
	} else {
		this.timerId = setInterval(function() { self.rotateElement(startAngle, endAngle); }, 100); 
	}
}

Wobbler.prototype.start = function() {
	var self = this;
	this.timerId = setInterval(function() { self.balanceElement(); }, 100); 
}

Wobbler.prototype.resume = function() {
	if (this.mouseDown) { 
		$(document).off("mousemove.Wobbler" + this.id + "Spin");
		this.mouseDown = false;
		this.adjust();
	}
}

Wobbler.prototype.pause = function() {
	// fix the angle difference b/w the mouse and the element
	this.mouseShiftAngle = this.angle - angleDeg2Rad(calcAngle(this.center.X, this.center.Y, event.pageX, event.pageY));

	this.mouseDown = true;
	clearInterval(this.timerId);
	
	var self = this;
	$(document).on("mousemove.Wobbler" + this.id + "Spin", function() { self.follow(); });
}

Wobbler.prototype.follow = function() {
	this.mouseAngle = angleDeg2Rad(calcAngle(this.center.X, this.center.Y, event.pageX, event.pageY ));
	this.angle = this.mouseAngle + this.mouseShiftAngle;
	this.display();
}

Wobbler.prototype.stop = function() {
	this.mouseDown = true;
	clearInterval(this.timerId);
	clearTimeout(this.timeoutId);
	this.mouseDown = false;
}

function Wobbler(element, id, frame) {
	this.element = element;
	this.center = {
		X: $(element).outerWidth() / 2 + $(element).offset().left,
		Y: $(element).outerHeight() / 2 + $(element).offset().top };
	
	this.id = id;
	this.frame = { 'count': 0, 'countSec': 0 };

	this.mouseDown = false;

	var self = this;

	if (frame == true) {
		document.getElementsByClassName("frame-rate")[0].innerHTML += "<div id=\"frame-rate" + this.id + "\">" + this.id + ": </div>\n";
		this.frameIntervalId = setInterval(function() { self.frameInterval(); }, 1000); 
	}

	$(this.element).on("mousedown.Wobbler" + this.id, function() { self.pause(); });
	$(document).on("mouseup.Wobbler" + this.id, function() { self.stop(); });
	
	/* $(document).on("mouseup.Wobbler" + this.id, function() { self.resume(); }); */
};

