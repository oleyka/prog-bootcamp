function Wobbler(element, lAngle, rAngle) {
	this.element = element;
	this.myCount = 0;
	this.maxAngle = 5;
	this.lAngle = lAngle;
	this.rAngle = rAngle;

	this.rotateAngle = function(angle) {
	    var rotateCSSProperty = "rotate(" + angle + "deg)";
	    setBrowserIndependentProperty(this.element, "transform", rotateCSSProperty);
	}
	
	this.balanceElement = function() {
		var angle = Math.sin(this.myCount/20) * this.maxAngle;
		this.myCount++;
		this.rotateAngle(angle);
	};
	
	this.unbalanceElement = function() {
		var angle = ((this.rAngle - this.lAngle) * Math.cos(this.myCount/20) - (this.rAngle + this.lAngle)) / 2;
		this.myCount++;
		this.rotateAngle(angle);
	};

	var self = this;
	setInterval(function() { self.unbalanceElement(); }, 16);
};

