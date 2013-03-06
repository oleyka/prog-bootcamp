Wobbler.prototype.rotateAngle = function(angle) {
    var rotateCSSProperty = "rotate(" + angle + "deg)";
    setBrowserIndependentProperty(this.element, "transform", rotateCSSProperty);
}

Wobbler.prototype.balanceElement = function() {
	var angle = Math.sin(this.myCount/20) * this.maxAngle;
	this.myCount++;
	this.rotateAngle(angle);
};

function Wobbler(element) {
	this.element = element;
	this.myCount = 0;
	this.maxAngle = 5;

	var self = this;
	setInterval(function() { self.balanceElement(); }, 16);
};

