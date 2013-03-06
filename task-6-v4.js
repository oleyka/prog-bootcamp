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
Wobbler.prototype.resume = Wobbler.prototype.start;

Wobbler.prototype.pause = function() {
	clearInterval(this.timerId);
}

function Wobbler(element) {
	this.element = element;
	this.myCount = 0;
	this.maxAngle = 5;
	
	this.start();

	var self = this;
	$(this.element).mousedown(function() { self.pause(); });
	$(this.element).mouseup(function() { self.resume(); });
};

