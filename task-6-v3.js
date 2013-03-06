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

Wobbler.prototype.pause = function() {
	clearInterval(this.timerId);
}

function Wobbler(element) {
	this.element = element;
	this.myCount = 0;
	this.maxAngle = 5;
	
	this.start();

	var self = this;
	this.element.addEventListener("mousedown", function() { self.pause(); }, true);
    this.element.addEventListener("mouseup", function() { self.start(); }, true);
};

