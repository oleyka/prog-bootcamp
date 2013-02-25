function genUniqueId(id) {
	if(id == "") return "_clone";
	var counter = 1;
	while(document.getElementById(id + "_clone" + counter)) {
		counter++;
	}
	return id + "_clone" + counter;
}

function dropElementChildrenIds(element) {
	var childCount = element.childNodes ? element.childNodes.length : 0;
	for(var i = 0; i < childCount; i++) {
		if(element.childNodes[i].tagName && element.childNodes[i].hasAttribute('id')) {
			element.childNodes[i].removeAttribute('id');
		}
		dropElementChildrenIds(element.childNodes[i]);
	}
	return element;
}

function clone(domElement) {
	if(domElement.tagName) {
		var clonedElement = document.createElement(domElement.tagName);
		
		for(var i = 0; i < domElement.attributes.length; i++) {
			clonedElement.setAttribute(domElement.attributes[i].name, domElement.attributes[i].value);
		}
		
		var childCount = domElement.childNodes ? domElement.childNodes.length : 0;
		for(var i = 0; i < childCount; i++) {
			clonedElement.appendChild(clone(domElement.childNodes[i]));
		}
		return clonedElement;
	} else {
		return document.createTextNode(domElement.data);
	}
}

function cloneAndRename(domElement, cloneFunction) {
	var clonedElement = cloneFunction(domElement);
	
	if(clonedElement.hasAttribute('id')) {
		clonedElement.setAttribute('id', genUniqueId(clonedElement.attributes['id'].value));
	}
	dropElementChildrenIds(clonedElement);
	
	return clonedElement;
}

