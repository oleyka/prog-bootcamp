Wobbler.prototype.rotateAngle = function(angle) {
    var rotateCSSProperty = "rotate(" + angle + "deg)";
    setBrowserIndependentProperty(this.element, "transform", rotateCSSProperty);
}

Wobbler.prototype.balanceElement = function() {
	var angle = Math.sin(this.myCount/20) * this.maxAngle;
	this.myCount++;
	this.rotateAngle(angle);
};

Wobbler.prototype.start = function() {
	var self = this;
	this.timerId = setInterval(function() { self.balanceElement(); }, 16); 
}

Wobbler.prototype.resume = function() {
	if (this.mouseDown) { 
		this.mouseDown = false;
		this.start();
	}
}

Wobbler.prototype.pause = function() {
	this.mouseDown = true;
	clearInterval(this.timerId);
}

function Wobbler(element) {
	this.element = element;
	this.myCount = 0;
	this.maxAngle = 5;
	this.mouseDown = false;
	
	this.start();

	var self = this;
	$(this.element).mousedown(function() { self.pause(); });
	$(document).mouseup(function() { self.resume(); });
};

