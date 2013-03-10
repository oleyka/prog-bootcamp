function angleRad2Deg(angle) { return angle * 180 / Math.PI; }
function angleDeg2Rad(angle) { return angle * Math.PI / 180; }
function calcAngle(fromX, fromY, toX, toY) { // in radian
	return Math.atan2(toY - fromY, toX - fromX);
}
function normAngle(angle) {
	angle -= Math.round((angle - Math.PI)/(2 * Math.PI)) * 2 * Math.PI;
	if (angle > Math.PI) { angle -= Math.PI*2; }
	return angle;
}

Wobbler.prototype.frameInterval = function() {
	document.getElementById("frame-rate" + this.id).innerHTML = this.id + ": " + this.frame.countSec;
	this.frame.count += this.frame.countSec; 
	this.frame.countSec = 0; 
}

Wobbler.prototype.display = function(angleDeg) {
	if (typeof(angleDeg) != "undefined") {
		this.angle = angleDeg2Rad(angleDeg)
	}
	var rotateCSSProperty = "rotate(" + angleRad2Deg(-this.angle) + "deg)";
    setBrowserIndependentProperty(this.element, "transform", rotateCSSProperty);
	this.displayShadow();
	this.frame.countSec++;
}

Wobbler.prototype.displayShadow = function () {
	this.element.style["box-shadow"] = Math.round(-Math.sin(this.angle)*10) + "px " + 
									   Math.round(Math.cos(this.angle)*10) + "px 15px #866";
}

Wobbler.prototype.balanceElement = function() {
	if (this.lAngle == - this.rAngle) {
		this.angle = this.maxAngle * Math.sin(this.path) / 2;
	} else {
		this.angle = this.maxAngle * Math.sin(this.path) / 2 + (this.rAngle + this.lAngle) / 2;
	}
	this.path += this.inc;
	this.display();
}

Wobbler.prototype.balance = function(lAngleDeg, rAngleDeg, path) { // 
	this.movementType = "balance";
	if (typeof(path) == "undefined") { 
		this.path = 0;	// 0 = middle of interval, -Math.PI/2 = left, Math.PI/2 = right
	} else { this.path = path; }					
	this.inc = 0.05;	// increment to this.path

	if (typeof(rAngleDeg) == "undefined") { 
		this.params.rAngle = angleDeg2Rad(lAngleDeg);
		this.params.lAngle = -this.params.rAngle;
	} else {
		this.params.lAngle = angleDeg2Rad(lAngleDeg);
		this.params.rAngle = angleDeg2Rad(rAngleDeg);
		if ( this.params.lAngle == this.params.rAngle ) { this.params.rAngle += Math.PI*2; }
	}
	this.params.maxAngle = this.params.rAngle-this.params.lAngle;

	this.maxAngle = this.params.maxAngle;
	this.lAngle = this.params.lAngle;
	this.rAngle = this.params.rAngle;
	
	var frameInterval = Math.max(16, 500/angleRad2Deg(this.maxAngle));
	this.inc = Math.PI*frameInterval/500;

	var self = this;
	this.timerId = setInterval(function() { self.balanceElement(); }, frameInterval); 
}

Wobbler.prototype.rotateElement = function() {
	switch(this.accelerate) {
	case 0:
		this.angle = this.path;
		break;
	case -1:
		this.angle = this.maxAngle * Math.sin(this.path) + this.lAngle;
		break;
	case 1:
		this.angle = -this.maxAngle * Math.cos(this.path) + this.rAngle;
		break;
	default:
		this.angle = this.maxAngle * ( 1 - Math.cos(this.path) ) / 2 + this.lAngle;
	}
	this.display();
	
	this.path += this.inc;
	if ( (this.accelerate != 0 && this.pathEnd - this.path >= 0 ) ||
		 (this.accelerate == 0 && (Math.max(this.lAngle, this.rAngle, this.path) != this.path && 
								   Math.min(this.lAngle, this.rAngle, this.path) != this.path) ) ) {
		var self = this;
		this.timeoutId = setTimeout(function() { self.rotateElement(); }, 16); 
	} else {
		this.angle = this.rAngle;
		this.display();
		if (this.movementType == "balance") { 
			// returning to the left angle is not always the best option
			this.balance(angleRad2Deg(this.params.lAngle), angleRad2Deg(this.params.rAngle), -Math.PI/2);
		}
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
	case 0:				// linear
		this.path = this.lAngle;
		this.pathEnd = this.rAngle;
		this.inc = this.maxAngle / 90;
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
	this.rotateElement();
}
		
Wobbler.prototype.resume = function() {
	if (this.mouseDown) { 
		$(document).off("mousemove.Wobbler" + this.id);
		$(document).off("mouseup.Wobbler" + this.id);
		this.mouseDown = false;
	}
	if (this.movementType == "balance") {
		this.rotate(angleRad2Deg(this.angle), angleRad2Deg(this.params.lAngle), 2);
	}
}

Wobbler.prototype.follow = function() {
	this.mouseDown = true;
	clearInterval(this.timerId);
	clearTimeout(this.timeoutId);
	
	this.angle = normAngle(this.angle);
	this.mouseShiftAngle = calcAngle(this.center.X, this.center.Y, event.pageX, event.pageY) + this.angle;
	this.element.style.cursor = "pointer";
	
	var self = this;
	$(document).on("mousemove.Wobbler" + this.id, function() { self.followMouse(); });
	$(document).on("mouseup.Wobbler" + this.id, function() { self.resume(); });
}

Wobbler.prototype.followMouse = function() {
	this.mouseAngle = calcAngle(this.center.X, this.center.Y, event.pageX, event.pageY);		
	this.angle = - this.mouseAngle + this.mouseShiftAngle;
	this.display();
}

function Wobbler(element, id, frame) {
	this.element = element;
	this.center = {
		X: $(element).outerWidth() / 2 + $(element).offset().left,
		Y: $(element).outerHeight() / 2 + $(element).offset().top };
	
	this.id = id;
	this.angle = 0;
	this.movementType = "";
	this.params = { 'lAngle': null, 'rAngle': null, 'maxAngle': null };
	this.frame = { 'count': 0, 'countSec': 0 };

	this.mouseDown = false;

	var self = this;

	if (frame == true) {
		document.getElementsByClassName("frame-rate")[0].innerHTML += "<div id=\"frame-rate" + this.id + "\">" + this.id + ": </div>\n";
		this.frameIntervalId = setInterval(function() { self.frameInterval(); }, 1000); 
	}

	$(this.element).on("mousedown.Wobbler" + this.id, function() { self.follow(); });
}

