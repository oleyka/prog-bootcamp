function angleRad2Deg(angle) { return angle * 180 / Math.PI; }
function angleDeg2Rad(angle) { return angle * Math.PI / 180; }
function calcAngle(fromX, fromY, toX, toY) { // in radian
	return Math.atan2(toY - fromY, toX - fromX);
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
	var angle = this.balance_params.maxAngle * Math.sin(this.balance_params.path) / 2 + this.balance_params.axisAngle;
	this.balance_params.angle = angle;
	this.balance_params.path += this.balance_params.step;
	if (this.balance_params.path > 31416) this.balance_params.path == 0;
	return angle;
}

Wobbler.prototype.balanceElement = function() {
	this.angle = this.balancePosition();
	this.display();
}

Wobbler.prototype.balance = function(lAngleDeg, rAngleDeg, path) { // 
	var lAngle, rAngle, maxAngle;
	
	if (typeof(path) == "undefined") { 
		this.balance_params.path = 0;	// 0 = middle of interval, -Math.PI/2 = left, Math.PI/2 = right
	} else { 
		this.balance_params.path = path; 
	}
	
	this.balance_params.step = 0.1;

	if (typeof(rAngleDeg) == "undefined") { 
		rAngle = angleDeg2Rad(lAngleDeg);
		lAngle = -rAngle;
	} else {
		lAngle = angleDeg2Rad(lAngleDeg);
		rAngle = angleDeg2Rad(rAngleDeg);
		if ( lAngle == rAngle ) { rAngle += Math.PI*2; }
	}
	this.balance_params.maxAngle = rAngle - lAngle;
	this.balance_params.lAngle = lAngle;
	this.balance_params.rAngle = rAngle;
	this.balance_params.axisAngle = (rAngle + lAngle) / 2;

/*	console.log("Balance start angle: " + 
					angleRad2Deg(this.balance_params.maxAngle * Math.sin(this.balance_params.path) / 2 + this.balance_params.axisAngle) + 
				" at path: " + normAngle(this.balance_params.path) + 
				" axis: " + angleRad2Deg(this.balance_params.axisAngle)); */
	
	var self = this;
	this.timerId = setInterval(function() { self.balanceElement(); }, 16); 
}

Wobbler.prototype.spinPosition = function() {
	var angle = this.spin_params.angle + 
				(Math.PI * this.spin_params.spin)/( 20 * Math.sqrt(Math.abs(this.spin_params.spin))) * Math.sin(this.spin_params.path);
	this.spin_params.angle = angle;
	this.spin_params.path += this.spin_params.step;

	return angle;
}

Wobbler.prototype.spinElement = function() {
	this.angle = this.balancePosition() + this.spinPosition();
	this.display();
	
	if ( this.spin_params.path > Math.PI ) {
		clearInterval(this.timerId); // stop spinning, back to plain balancing
		
/*		console.log("Spin: " + angleRad2Deg(spi) + " Balance: " + angleRad2Deg(bal) + "\nat path: " + normAngle(this.balance_params.path) +
					" axis: " + angleRad2Deg(this.balance_params.axisAngle));
		console.log("End angle: " + angleRad2Deg(this.angle) ); */

		var axisShift = normAngle(this.spin_params.angle);
		
		this.balance_params.lAngle += axisShift;
		this.balance_params.rAngle += axisShift;
		
/*		console.log("New balancing interval: " + angleRad2Deg(this.balance_params.lAngle) + 
										" to " + angleRad2Deg(this.balance_params.rAngle)); */
		
		var self = this;
		self.balance(angleRad2Deg(self.balance_params.lAngle), 
					 angleRad2Deg(self.balance_params.rAngle),
					 self.balance_params.path);
	}
}

Wobbler.prototype.release = function() {
	if (this.mouse_params.down) { 
		$(document).off("mousemove.Wobbler" + this.id);
		$(document).off("mouseup.Wobbler" + this.id);
		this.mouse_params.down = false;
	}
		
	if ( event.timeStamp * this.mouse_params.timePrev > 0 ) {
		var time = event.timeStamp - this.mouse_params.timePrev;
	} else { 
		var time = 1000; 
	}

	// we use the last 2 mouse moves to calculate the spin
	this.mouse_params.angle = calcAngle(this.center.X, this.center.Y, event.pageX, event.pageY);
	var spin = normAngle(this.mouse_params.anglePrev - this.mouse_params.angle) * (100 / time); // out of head coefficient
	
	this.spin_params.startAngle = normAngle(this.angle);
	this.spin_params.angle = this.spin_params.startAngle;
	this.spin_params.path = Math.PI/2;
	this.spin_params.spin = spin;
	this.spin_params.step = Math.PI / (120 * Math.sqrt(Math.abs(spin)));	// out of head coefficient
	
	this.balance_params.path = 0;
	this.balance_params.axisAngle = 0;
	this.balance_params.lAngle = - this.balance_params.maxAngle / 2;
	this.balance_params.rAngle = this.balance_params.maxAngle / 2;
	
/*	console.log("Mouse shift " + angleRad2Deg(normAngle(this.mouse_params.anglePrev - this.mouse_params.angle)) + 
				" over " + time + "ms results in " + angleRad2Deg(spin * 2 * Math.PI) + " rotation or " + spin + " circles\n");
	console.log(" which will take " + (this.spin_params.path/this.spin_params.step) + " steps.")
	console.log("Start angle: " + angleRad2Deg(this.spin_params.startAngle)); */
	
	var self = this;
	this.timerId = setInterval(function() { self.spinElement(); }, 16); 
}

Wobbler.prototype.follow = function() {
	this.mouse_params.down = true;
	clearInterval(this.timerId);
	
	this.angle = normAngle(this.angle);
	this.mouse_params.shiftAngle = calcAngle(this.center.X, this.center.Y, event.pageX, event.pageY) + this.angle;
	this.element.style.cursor = "pointer";
	
	var self = this;
	$(document).on("mousemove.Wobbler" + this.id, function() { self.followMouse(); });
	$(document).on("mouseup.Wobbler" + this.id, function() { self.release(); });
}
Wobbler.prototype.followMouse = function() {
	this.mouse_params.timePrev = this.mouse_params.time;
	this.mouse_params.time = event.timeStamp;
	
	this.mouse_params.anglePrev = this.mouse_params.angle;
	this.mouse_params.angle = calcAngle(this.center.X, this.center.Y, event.pageX, event.pageY);
	this.angle = - (this.mouse_params.angle - this.mouse_params.shiftAngle);
	this.display();
}

function Wobbler(element, id, frame) {
	this.element = element;
	this.center = {
		X: $(element).outerWidth() / 2 + $(element).offset().left,
		Y: $(element).outerHeight() / 2 + $(element).offset().top };
	
	this.id = id;
	this.angle = 0;
	
	this.balance_params = { 'lAngle': 0, 'rAngle': 0, 'maxAngle': 0, 'axisAngle': 0, 'path': 0, 'angle': this.angle };
	this.spin_params = { 'startAngle': this.angle, 'step': 0, 'spin': 0, 'angle': this.angle };
	this.mouse_params = { 'angle': 0, 'anglePrev': 0, 'time': 0, 'timePrev': 0, 'shiftAngle': 0, 'down': false };

	var self = this;
	$(this.element).on("mousedown.Wobbler" + this.id, function() { self.follow(); });

	if (frame) {
		this.frame = { 'count': 0, 'countSec': 0 };
		document.getElementsByClassName("frame-rate")[0].innerHTML += "<div id=\"frame-rate" + this.id + "\">" + this.id + ": </div>\n";
		this.frameIntervalId = setInterval(function() { self.frameInterval(); }, 1000); 
	}
}


