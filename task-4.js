function assignUniqueId(oId) {
	if( oId == "" ) return "";

	var counter = 0;
	
	while( document.getElementById(oId + counter) ) {
		counter++;
	}

	return oId + counter;
};

function clone0(id) { // using cloneNode()
	var domElement = document.getElementById(id);

	if( !domElement ) {	return NULL; }

	var clonedElement = domElement.cloneNode(true);
	if( domElement.id ) { 
		clonedElement.id = assignUniqueId(domElement.id); 
	}
	clonedElement.style.opacity = "0.5";
	domElement.parentNode.appendChild(clonedElement);

	return clonedElement.id;
}

function clone1(pro_id) { // durty quick hack throught the use of innerHTML & outerHTML
	var pro_el = document.getElementById(pro_id);

	if( !pro_el ) {	return false; }

	pro_el.parentNode.innerHTML += pro_el.outerHTML;
	document.getElementById(pro_id).parentNode.lastChild.style.opacity = "0.5";

	return true;
}

function clone2(pro_el, new_el_parent) {
	if( !pro_el ) {	return NULL; }
	if( !new_el_parent ) { new_el_parent = pro_el.parentNode; }
	
	if( pro_el.tagName ) {
		var new_el = document.createElement(pro_el.tagName);
		
		for( var i = 0; i < pro_el.attributes.length; i++ ) {
			new_el.setAttribute(pro_el.attributes[i].name, pro_el.attributes[i].value);
		}
		if( pro_el.id ) {	new_el.id = assignUniqueId(pro_el.id); }
		new_el_parent.appendChild(new_el);
		
		if( pro_el.childNodes ) {
			var children = pro_el.childNodes.length;
			for( var i = 0; i < children; i++) {
				clone2(pro_el.childNodes[i], new_el);
			}
		}
	} else {
		var new_el = document.createTextNode(pro_el.data);
		new_el_parent.appendChild(new_el);
	}

	return new_el;
}

// var dupId0 = clone0("elementToClone");
// clone1("elementToClone");

var dup_el = clone2(document.getElementById("elementToClone"));

var nodeList = dup_el.parentNode.childNodes; 

/* for( var i = 0; i<nodeList.length; i++) {
	console.log(i + " = " + nodeList[i]);
}

for( var i in nodeList[5]) {
	console.log(i + " = " + nodeList[5][i]);
} */
