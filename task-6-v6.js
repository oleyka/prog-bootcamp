function angleRad2Deg(angle) { return angle * 180 / Math.PI; }
function angleDeg2Rad(angle) { return angle * Math.PI / 180; }
function calcAngle(fromX, fromY, toX, toY) { // in radian, corrected for screen
	return Math.atan2(fromY - toY, toX - fromX);
}
function normAngle(angle) { // (-Pi, Pi]
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

	this.element.style["box-shadow"] = Math.round(-Math.sin(this.angle)*10) + "px " + 
	Math.round(Math.cos(this.angle)*10) + "px 15px #866";

	this.frame.countSec++;
}
Wobbler.prototype.balancePosition = function() {
	var angle = this.balance_p.amp * Math.sin(this.balance_s.path) / 2;
	this.balance_s.angle = angle;
	this.balance_s.path += this.balance_p.step;
	if (this.balance_s.path > 31416) { this.balance_s.path = 0; }	
	return angle;
}
Wobbler.prototype.spinPosition = function() {
	var angle = this.spin_s.angle;
	if ( (this.spin_p.spin != 0) && (this.spin_s.path < Math.PI) ) {
		angle += (Math.PI * this.spin_p.spin)/( 20 * Math.sqrt(Math.abs(this.spin_p.spin))) * Math.sin(this.spin_s.path);
		this.spin_s.angle = angle;
		this.spin_s.path += this.spin_p.step;
	}
	return angle;
}

Wobbler.prototype.rotateElement = function() {
	var prevAngle = this.angle;
	this.spinPosition();
	this.balancePosition();
	this.angle = this.spin_s.angle + this.balance_s.angle;
	if (this.angle != prevAngle) this.display();
}

Wobbler.prototype.balance = function(lAngleDeg, rAngleDeg) { // 
	var lAngle, rAngle;
	if (typeof(rAngleDeg) == "undefined") { 
		rAngle = angleDeg2Rad(lAngleDeg);
		lAngle = -rAngle;
	} else {
		lAngle = angleDeg2Rad(lAngleDeg);
		rAngle = angleDeg2Rad(rAngleDeg);
		if ( lAngle == rAngle ) { rAngle += Math.PI*2; }
	}
	if ( lAngle < rAngle ) {
		this.spin_s.path = -Math.PI;
	} else {
		this.spin_s.path = Math.PI;
	}

	this.spin_s.angle = (rAngle + lAngle) / 2;		// important: equals the balance axis!
	
	this.balance_p.lAngle = -this.spin_s.angle / 2;
	this.balance_p.rAngle =  this.spin_s.angle / 2;
	this.balance_p.amp = rAngle - lAngle;

/*	console.log("Balance start angle: " + 
					angleRad2Deg(this.balance_p.amp * Math.sin(this.balance_s.path) / 2 + this.spin_s.angle) + 
				" at path: " + normAngle(this.balance_s.path) + 
				" axis: " + angleRad2Deg(this.spin_s.angle)); */
	
	var self = this;
	this.timerId = setInterval(function() { self.rotateElement(); }, 16); 
}

Wobbler.prototype.release = function(event) {	
	if (this.mouse.down) { 
		$(document).off("mousemove.Wobbler" + this.id);
		$(document).off("mouseup.Wobbler" + this.id);
		this.mouse.down = false;
	}
		
	// we use the last 2 mouse moves to calculate the spin
	if ( event.timeStamp * this.mouse.timePrev > 0 && 
		 event.timeStamp - this.mouse.timePrev > 0 &&
		 event.timeStamp - this.mouse.timePrev < 500 ) {
		var speed = event.timeStamp - this.mouse.timePrev;
	} else { 
		var speed = 500; 
	}
	this.mouse.angle = calcAngle(this.center.X, this.center.Y, event.pageX, event.pageY);
	var spin = normAngle(this.mouse.angle - this.mouse.anglePrev) * (100 / speed); // out of head coefficient

	this.spin_s.angle = normAngle(this.mouse.angle + this.mouse.shiftAngle); // loses the axis value!
	this.spin_s.path = Math.PI/2;
	this.spin_p.spin = spin;
	if (spin) {
		this.spin_p.step = Math.PI / (120 * Math.sqrt(Math.abs(spin)));
	} else {
		this.spin_p.step = 1;
	}
	
//	this.balance_p.lAngle = -this.balance_p.amp / 2;
//	this.balance_p.rAngle = this.balance_p.amp / 2;
	
	console.log("Mouse shift " + angleRad2Deg(normAngle(this.mouse.angle - this.mouse.anglePrev)) + 
				"deg over " + speed + "ms results in " + angleRad2Deg(spin * 2 * Math.PI) + "deg rotation or " + spin + " circles\n");
	console.log(" which will take " + (this.spin_s.path/this.spin_p.step) + " steps sized " + angleRad2Deg(this.spin_p.step) + "deg.")
	console.log("Initial axis angle: " + angleRad2Deg(this.spin_s.angle));
	
	var self = this;
	this.timerId = setInterval(function() { self.rotateElement(); }, 16); 
}

Wobbler.prototype.followMouse = function(event) {
	this.mouse.timePrev = this.mouse.time;
	this.mouse.time = event.timeStamp;
	
	this.mouse.anglePrev = this.mouse.angle;
	this.mouse.angle = calcAngle(this.center.X, this.center.Y, event.pageX, event.pageY);
	this.angle = this.mouse.angle + this.mouse.shiftAngle;
	this.display();
}

Wobbler.prototype.follow = function(event) {
	this.mouse.down = true;
	clearInterval(this.timerId);
	
	this.angle = normAngle(this.angle);
	this.mouse.angle = calcAngle(this.center.X, this.center.Y, event.pageX, event.pageY);
	this.mouse.anglePrev = this.mouse.angle;
	this.mouse.shiftAngle = this.angle - this.mouse.angle;

	this.mouse.time = event.timeStamp;
	this.mouse.timePrev = this.mouse.time;
	
	var self = this;
	$(document).on("mousemove.Wobbler" + this.id, function(ev) { self.followMouse(ev); });
	$(document).on("mouseup.Wobbler" + this.id, function(ev) { self.release(ev); });
}

function Wobbler(element, id, frame) {
	this.element = element;
	this.center = {
		X: $(element).outerWidth() / 2 + $(element).offset().left,
		Y: $(element).outerHeight() / 2 + $(element).offset().top };
	this.id = id;
	this.timerId = null;
	
	this.angle = 0; // not to be used for calculations
	
	this.balance_p = { lAngle: 0, rAngle: 0, amp: 0, step: 0.07 };
	this.balance_s = { path: 0, angle: 0 };  // path = 0 : center, -Math.PI/2 : left, Math.PI/2 : right
	this.spin_p = { spin: 0, step: 0 };
	this.spin_s = { axisAngle: 0, path: 0 };
	this.mouse = { angle: 0, anglePrev: 0, time: 0, timePrev: 0, shiftAngle: 0, down: false };
	
	var self = this;
	$(this.element).on("mousedown.Wobbler" + this.id, function(ev) { self.follow(ev); });

	if (frame) {
		this.frame = { 'count': 0, 'countSec': 0 };
		document.getElementsByClassName("frame-rate")[0].innerHTML += "<div id=\"frame-rate" + this.id + "\">" + this.id + ": </div>\n";
		this.frameIntervalId = setInterval(function() { self.frameInterval(); }, 1000); 
	}
}


