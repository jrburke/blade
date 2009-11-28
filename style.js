/*
  Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
  Available via the new BSD license.
  see: http://github.com/jrburke/blade for details
*/
run(
  "style",
  Function,
  ["run", "node"],
  function(run, node) {


	/*=====
	dojo._setOpacity = function(node, opacity){
			//	summary:
			//		set the opacity of the passed node portably. Returns the
			//		new opacity of the node.
			//	node: DOMNode
			//		a reference to a DOM node. Does NOT support taking an
			//		ID string for performance reasons.
			//	opacity: Number
			//		A Number between 0 and 1. 0 specifies transparent.
			//	returns: Number between 0 and 1
			return; // Number
	}
	=====*/


	function style(	/*DomNode|String*/ id,
							/*String?|Object?*/ stl,
							/*String?*/ value){
		//	summary:
		//		Accesses styles on a node. If 2 arguments are
		//		passed, acts as a getter. If 3 arguments are passed, acts
		//		as a setter.
		//	description:
		//		Getting the style value uses the computed style for the node, so the value
		//		will be a calculated value, not just the immediate node.style value.
		//		Also when getting values, use specific style names,
		//		like "borderBottomWidth" instead of "border" since compound values like
		//		"border" are not necessarily reflected as expected.
		//		If you want to get node dimensions, use `dojo.marginBox()`, 
		//		`dojo.contentBox()` or `dojo.position()`.
		//	node:
		//		id or reference to node to get/set style for
		//	stl:
		//		the style property to set in DOM-accessor format
		//		("borderWidth", not "border-width") or an object with key/value
		//		pairs suitable for setting each property.
		//	value:
		//		If passed, sets value on the node for style, handling
		//		cross-browser concerns.  When setting a pixel value,
		//		be sure to include "px" in the value. For instance, top: "200px".
		//		Otherwise, in some cases, some browsers will not apply the style.
		//	example:
		//		Passing only an ID or node returns the computed style object of
		//		the node:
		//	|	dojo.style("thinger");
		//	example:
		//		Passing a node and a style property returns the current
		//		normalized, computed value for that property:
		//	|	dojo.style("thinger", "opacity"); // 1 by default
		//
		//	example:
		//		Passing a node, a style property, and a value changes the
		//		current display of the node and returns the new computed value
		//	|	dojo.style("thinger", "opacity", 0.5); // == 0.5
		//
		//	example:
		//		Passing a node, an object-style style property sets each of the values in turn and returns the computed style object of the node:
		//	|	dojo.style("thinger", {
		//	|		"opacity": 0.5,
		//	|		"border": "3px solid black",
		//	|		"height": "300px"
		//	|	});
		//
		// 	example:
		//		When the CSS style property is hyphenated, the JavaScript property is camelCased.
		//		font-size becomes fontSize, and so on.
		//	|	dojo.style("thinger",{
		//	|		fontSize:"14pt",
		//	|		letterSpacing:"1.2em"
		//	|	});
		//
		//	example:
		//		dojo.NodeList implements .style() using the same syntax, omitting the "node" parameter, calling
		//		dojo.style() on every element of the list. See: `dojo.query()` and `dojo.NodeList()`
		//	|	dojo.query(".someClassName").style("visibility","hidden");
		//	|	// or
		//	|	dojo.query("#baz > div").style({
		//	|		opacity:0.75,
		//	|		fontSize:"13pt"
		//	|	});

		var n = node(id), args = arguments.length, op = (stl == "opacity");
		stl = style._floatAliases[stl] || stl;
		if(args == 3){
			return op ? style._setOpacity(n, value) : n.style[stl] = value; /*Number*/
		}
		if(args == 2 && op){
			return style._getOpacity(n);
		}
		var s = style.gcs(n);
		if(args == 2 && typeof stl != "string"){ // inline'd type check
			for(var x in stl){
				style(n, x, stl[x]);
			}
			return s;
		}
		return (args == 1) ? s : style._toStyleValue(n, stl, s[stl] || n.style[stl]); /* CSS2Properties||String||Number */
        }


/*=====
	dojo.getComputedStyle = function(node){
		//	summary:
		//		Returns a "computed style" object.
		//
		//	description:
		//		Gets a "computed style" object which can be used to gather
		//		information about the current state of the rendered node.
		//
		//		Note that this may behave differently on different browsers.
		//		Values may have different formats and value encodings across
		//		browsers.
		//
		//		Note also that this method is expensive.  Wherever possible,
		//		reuse the returned object.
		//
		//		Use the dojo.style() method for more consistent (pixelized)
		//		return values.
		//
		//	node: DOMNode
		//		A reference to a DOM node. Does NOT support taking an
		//		ID string for speed reasons.
		//	example:
		//	|	dojo.getComputedStyle(dojo.byId('foo')).borderWidth;
		//
		//	example:
		//	Reusing the returned object, avoiding multiple lookups:
		//	|	var cs = dojo.getComputedStyle(dojo.byId("someNode"));
		//	|	var w = cs.width, h = cs.height;
		return; // CSS2Properties
	}
=====*/

	style.gcs = function(node){
			return node.nodeType == 1 ?
				node.ownerDocument.defaultView.getComputedStyle(node, null) : {};
		};

        style._px = function(element, value){
                // style values can be floats, client code may want
                // to round for integer pixels.
                return parseFloat(value) || 0;
        };

	style._floatAliases = { "cssFloat": "cssFloat", "styleFloat": "cssFloat", "float": "cssFloat" };

	//>>excludeEnd("webkitMobile");
	style._getOpacity = function(node){
			return style.gcs(node).opacity;
		};

	style._setOpacity = function(node, opacity){
			return node.style.opacity = opacity;
		};


	var _pixelNamesCache = {
		left: true, top: true
	};
	var _pixelRegExp = /margin|padding|width|height|max|min|offset/;  // |border
	style._toStyleValue = function(node, type, value){
		type = type.toLowerCase(); // FIXME: should we really be doing string case conversion here? Should we cache it? Need to profile!
		if(!(type in _pixelNamesCache)){
			_pixelNamesCache[type] = _pixelRegExp.test(type);
		}
		return _pixelNamesCache[type] ? style._px(node, value) : value;
	};

    //Add node to the _() chaining.
    run.modify(
	"blade",
	"style",
	["blade"],
	function(_) {
	    _.sharpen("style", style, true);
	}
    );

    return style;
  }
);