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
}

Wobbler.prototype.rotateElement = function(startAngle, endAngle) {
	
	if (startAngle < endAngle) { this.angle += (endAngle-startAngle)*Math.sin(Math.PI*(endAngle-this.angle)/90); }
	if (startAngle > endAngle) { this.angle -= (endAngle-startAngle)*Math.sin(Math.PI*(endAngle-this.angle)/90); }

	if ((startAngle < endAngle && endAngle <= this.angle) ||
		(startAngle > endAngle && endAngle >= this.angle)) {
		clearInterval(this.timerId);
		this.step = Math.round(20 * Math.asin(this.angle/this.maxAngle));
		this.start();
	}
	this.display();
}

Wobbler.prototype.adjust = function() {
	var startAngle = this.angle;
	var endAngle = this.angle;
	
	if (startAngle > this.maxAngle) { 
		var endAngle = this.maxAngle; 
	} else if (startAngle < -this.maxAngle) {
		var endAngle = -this.maxAngle; 
	}
	
	var self = this;
	if (startAngle == endAngle) {
		this.step = Math.round(20 * Math.asin(this.angle/this.maxAngle));
		this.start();
	} else {
		this.timerId = setInterval(function() { self.rotateElement(startAngle, endAngle); }, 16); 
	}
}

Wobbler.prototype.start = function() {
	var self = this;
	this.timerId = setInterval(function() { self.balanceElement(); }, 16); 
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
	this.mouseShiftAngle = this.angle - calcAngle(this.center.X, this.center.Y, event.pageX, event.pageY);

	this.mouseDown = true;
	clearInterval(this.timerId);
	
	var self = this;
	$(document).on("mousemove.Wobbler" + this.id + "Spin", function() { self.follow(); });
}

Wobbler.prototype.follow = function() {
	this.mouseAngle = calcAngle(this.center.X, this.center.Y, event.pageX, event.pageY );
	this.angle = this.mouseAngle + this.mouseShiftAngle;
	this.display();
}

function Wobbler(element, id, maxAngle) {
	this.element = element;
	this.center = {
		X: $(this.element).offset().left + $(this.element).outerWidth() / 2,
		Y: $(this.element).offset().top + $(this.element).outerHeight() / 2 };
	
	this.step = 0;
	this.angle = 0;
	this.maxAngle = maxAngle;
	this.mouseDown = false;
	this.id = id;
	
	this.start();

	var self = this;
	$(this.element).on("mousedown.Wobbler" + this.id, function() { self.pause(); });
	$(document).on("mouseup.Wobbler" + this.id, function() { self.resume(); });
};

