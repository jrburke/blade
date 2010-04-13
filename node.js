/*
  Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
  Available via the new BSD license.
  see: http://github.com/jrburke/blade for details
*/


/*****
 *LEGACY FILE, just keeping it for informative api reasons. Also, define
 * "insert" instead of "place"?
 */


run(
  "node",
  Function,
  ["run"],
  function(run) {
    /**
     * node will get or create a node.
     *
     * @param {String|DOMNode} id if the value is a is a String:
     *   * if it stars with a #, then document.getElementsById will be used
     *   * if it starts with a < then it is assumed to be markup, and it will
     *   * be converted into DOM elements.
     *   * Otherwise, it is assumed to be the tag name of the DOM element to
     *   * create.
     *   * If an object, then just the object is returned.
     */
    
    var attr = null;

    function node(id, props) {
      //The getElementById portion of the program.
      //Note that the goofy work for IE is not supported. The guidance will
      //be to use different ID names in IE.
      var node = id;
      if (typeof id == "string") {
        var ch = id.charAt(0);
        if (ch == "<") {
          node = dom(id);
        } else if (ch == "#") {
           node = run.doc.getElementById(id.substring(1, id.length));
        } else {
          node = run.doc.createElement(id);
        }
      }

      //Set any props via attr, but do not have a strict
      //dependency on attr. Ignore it if it is not loaded.
      if (props) {
        if (!attr) {
          attr = run.def["attr"];
        }
        if (attr) {
          attr(node, props);
        }
      }

      return node;
    }

    /*=====
    _toDom = function(frag, doc){
        //  summary:
        //    instantiates an HTML fragment returning the corresponding DOM.
        //  frag: String
        //    the HTML fragment
        //  doc: DocumentNode?
        //    optional document to use when creating DOM nodes, defaults to
        //    .doc if not specified.
        //  returns: DocumentFragment
        //
        //  example:
        //  Create a table row:
        //  |  var tr = _toDom("<tr><td>First!</td></tr>");
    }
    =====*/
  
    // support stuff for _toDom
    var tagWrap = {
        option: ["select"],
        tbody: ["table"],
        thead: ["table"],
        tfoot: ["table"],
        tr: ["table", "tbody"],
        td: ["table", "tbody", "tr"],
        th: ["table", "thead", "tr"],
        legend: ["fieldset"],
        caption: ["table"],
        colgroup: ["table"],
        col: ["table", "colgroup"],
        li: ["ul"]
      },
      reTag = /<\s*([\w\:]+)/,
      masterNode = {}, masterNum = 0,
      masterName = "__" + run.myContextName + "ToDomId";
  
    // generate start/end tag strings to use
    // for the injection for each special tag wrap case.
    for(var prop in tagWrap){
      var tw = tagWrap[prop];
      tw.pre  = prop == "option" ? '<select multiple="multiple">' : "<" + tw.join("><") + ">";
      tw.post = "</" + tw.reverse().join("></") + ">";
      // the last line is destructive: it reverses the array,
      // but we don't care at this point
    }

    var dom = node.dom = function(frag, doc){
      //  summary:
      //     converts HTML string into DOM nodes.
  
      doc = doc || run.doc;
      var masterId = doc[masterName];
      if(!masterId){
        doc[masterName] = masterId = ++masterNum + "";
        masterNode[masterId] = doc.createElement("div");
      }
  
      // make sure the frag is a string.
      frag += "";
  
      // find the starting tag, and get node wrapper
      var match = frag.match(reTag),
        tag = match ? match[1].toLowerCase() : "",
        master = masterNode[masterId],
        wrap, i, fc, df;
      if(match && tagWrap[tag]){
        wrap = tagWrap[tag];
        master.innerHTML = wrap.pre + frag + wrap.post;
        for(i = wrap.length; i; --i){
          master = master.firstChild;
        }
      }else{
        master.innerHTML = frag;
      }
  
      // one node shortcut => return the node itself
      if(master.childNodes.length == 1){
        return master.removeChild(master.firstChild); // DOMNode
      }
  
      // return multiple nodes as a document fragment
      df = doc.createDocumentFragment();
      while((fc = master.firstChild)){
        df.appendChild(fc);
      }
      return df; // DOMNode
    }

    /*=====
    dojo.empty = function(node){
        //  summary:
        //    safely removes all children of the node.
        //  node: DOMNode|String
        //    a reference to a DOM node or an id.
        //  example:
        //  Destroy node's children byId:
        //  |  dojo.empty("someId");
        //
        //  example:
        //  Destroy all nodes' children in a list by reference:
        //  |  dojo.query(".someNode").forEach(dojo.empty);
    }
    =====*/
  
    node.empty = function(n){
      node(n).innerHTML = "";
    };


	node.place = function (n, refNode, position){
		//	summary:
		//		Attempt to insert node into the DOM, choosing from various positioning options.
		//		Returns the first argument resolved to a DOM node.
		//
		//	node: String|DomNode
		//		id or node reference, or HTML fragment starting with "<" to place relative to refNode
		//
		//	refNode: String|DomNode
		//		id or node reference to use as basis for placement
		//
		//	position: String|Number?
		//		string noting the position of node relative to refNode or a
		//		number indicating the location in the childNodes collection of refNode.
		//		Accepted string values are:
		//	|	* before
		//	|	* after
		//	|	* replace
		//	|	* only
		//	|	* first
		//	|	* last
		//		"first" and "last" indicate positions as children of refNode, "replace" replaces refNode,
		//		"only" replaces all children.  position defaults to "last" if not specified
		//
		//	returns: DomNode
		//		Returned values is the first argument resolved to a DOM node.
		//
		//		.place() is also a method of `dojo.NodeList`, allowing `dojo.query` node lookups.
		//
		// example:
		//		Place a node by string id as the last child of another node by string id:
		//	|	dojo.place("someNode", "anotherNode");
		//
		// example:
		//		Place a node by string id before another node by string id
		//	|	dojo.place("someNode", "anotherNode", "before");
		//
		// example:
		//		Create a Node, and place it in the body element (last child):
		//	|	dojo.place("<div></div>", dojo.body());
		//
		// example:
		//		Put a new LI as the first child of a list by id:
		//	|	dojo.place("<li></li>", "someUl", "first");

		refNode = node(refNode);
		if(typeof n == "string"){ // inline'd type check
			n = n.charAt(0) == "<" ? node.dom(n, refNode.ownerDocument) : node(n);
		}
		if(typeof position == "number"){ // inline'd type check
			var cn = refNode.childNodes;
			if(!cn.length || cn.length <= position){
				refNode.appendChild(n);
			}else{
				_insertBefore(n, cn[position < 0 ? 0 : position]);
			}
		}else{
			switch(position){
				case "before":
					_insertBefore(n, refNode);
					break;
				case "after":
					_insertAfter(n, refNode);
					break;
				case "replace":
					refNode.parentNode.replaceChild(n, refNode);
					break;
				case "only":
					d.empty(refNode);
					refNode.appendChild(n);
					break;
				case "first":
					if(refNode.firstChild){
						_insertBefore(n, refNode.firstChild);
						break;
					}
					// else fallthrough...
				default: // aka: last
					refNode.appendChild(n);
			}
		}
		return n; // DomNode
	}

    node.destroy = function(n) {
      n.parentNode.removeChild(n);
    }

    //Add node to the _() chaining.
    run.modify(
      "blade",
      "blade-node",
      ["blade"],
      function(_) {
	_.sharpen("node", node, true);
	_.sharpen("empty", node.empty, true);
	_.sharpen("destroy", node.empty, true);
	_.sharpen("place", node.place, true);
      }
    );

    return node;
  }
);
