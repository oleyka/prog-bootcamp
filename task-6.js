function rotateAngle(element, angle) {
    var rotateCSSProperty = "rotate(" + angle + "deg)";
    setBrowserIndependentProperty(element, "transform", rotateCSSProperty);

    return true;
}

function balanceElement(element) {

	var maxAngle = 5;

	if (!element.myCount) { 
		element.myAngle = 0; 
		element.myCount = 0;
	} 
	
	var newAngle = Math.sin(element.myCount/20) * maxAngle;
	
	element.myAngle = newAngle;
	element.myCount++;
	
	console.log(newAngle);
	
	rotateAngle(element, newAngle);
}

function Wobbler(element) {
	element.onload = setInterval(function() { balanceElement(element) }, 16);
}