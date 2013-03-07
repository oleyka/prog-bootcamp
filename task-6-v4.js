function calcAngle(fromX, fromY, toX, toY) {
	var vector = { dx: toX - fromX, dy: toY - fromY };
	var angle;
	
	if (vector.dx != 0) {
		angle = Math.round(180 * Math.atan(vector.dy/vector.dx) / Math.PI);
	} else if (vector.dy >= 0) {
		angle = 90;
	} else {
		angle = -90;
	}
	if (vector.dx < 0) { angle += 180; }
	
	return angle;
}

Wobbler.prototype.display = function() {
    var rotateCSSProperty = "rotate(" + this.angle + "deg)";
    setBrowserIndependentProperty(this.element, "transform", rotateCSSProperty);
}

Wobbler.prototype.balanceElement = function() {
	this.angle = Math.sin(this.step/20) * this.maxAngle;
	this.step++;
	this.display();
};

Wobbler.prototype.start = function() {
	var self = this;
	this.timerId = setInterval(function() { self.balanceElement(); }, 16); 
}

Wobbler.prototype.resume = function() {
	if (this.mouseDown) { 
///		var self = this;
		$(document).off("mousemove.WobblerSpin");

		this.mouseDown = false;
		this.start();
	}
}

Wobbler.prototype.pause = function() {
	// fix the angle difference b/w the mouse and the element
	this.mouseShiftAngle = this.angle - calcAngle(this.center.X, this.center.Y, event.pageX, event.pageY);

	this.mouseDown = true;
	clearInterval(this.timerId);
	
	var self = this;
	$(document).on("mousemove.WobblerSpin", function() { self.follow(); });
}

Wobbler.prototype.follow = function() {
	this.mouseAngle = calcAngle(this.center.X, this.center.Y, event.pageX, event.pageY );
	this.angle = this.mouseAngle + this.mouseShiftAngle;
	this.display();
}

function Wobbler(element) {
	this.element = element;
	this.step = 0;
	this.angle = 0;
	this.maxAngle = 5;
	this.mouseDown = false;
	
	this.center = {
		X: $(this.element).offset().left + $(this.element).outerWidth() / 2,
		Y: $(this.element).offset().top + $(this.element).outerHeight() / 2 };
	
	this.start();

	var self = this;
	$(this.element).mousedown(function() { self.pause(); });
	$(document).mouseup(function() { self.resume(); });
};

