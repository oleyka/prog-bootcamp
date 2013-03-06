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

	this.element.addEventListener("mousedown", 
								  function() { clearInterval(self.timerId); }, 
								  true);
    this.element.addEventListener("mouseup", 
				    		      function() { 
				    		      	self.timerId = setInterval(function() { self.balanceElement(); }, 16); 
				    		      }, 
				    		      true);

	this.timerId = setInterval(function() { self.balanceElement(); }, 16);
};

