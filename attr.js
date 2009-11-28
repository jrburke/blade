/*
  Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
  Available via the new BSD license.
  see: http://github.com/jrburke/blade for details
*/
run(
  "attr",
  Function,
  ["run", "node", "lang", "style"],
  function(run, n, lang, style) {

  
    // attr() should conform to http://www.w3.org/TR/DOM-Level-2-Core/
  
    var _propNames = {
        // properties renamed to avoid clashes with reserved words
        "class":   "className",
        "for":     "htmlFor",
        // properties written as camelCase
        tabindex:  "tabIndex",
        readonly:  "readOnly",
        colspan:   "colSpan",
        frameborder: "frameBorder",
        rowspan:   "rowSpan",
        valuetype: "valueType"
      },
      _attrNames = {
        // original attribute names
        classname: "class",
        htmlfor:   "for",
        // for IE
        tabindex:  "tabIndex",
        readonly:  "readOnly"
      },
      _forcePropNames = {
        innerHTML: 1,
        className: 1,
        value:     1
      };

    var _fixAttrName = function(/*String*/ name){
      return _attrNames[name.toLowerCase()] || name;
    };
  
    var _hasAttr = function(node, name){
      var attr = node.getAttributeNode && node.getAttributeNode(name);
      return attr && attr.specified; // Boolean
    };
    
    var _evtHdlrMap = {}, _ctr = 0,
      _attrId = run.myContextName + "attrid",
      // the next dictionary lists elements with read-only innerHTML on IE
      _roInnerHtml = {col: 1, colgroup: 1,
        // frameset: 1, head: 1, html: 1, style: 1,
        table: 1, tbody: 1, tfoot: 1, thead: 1, tr: 1, title: 1};
  
    function attr(/*DomNode|String*/node, /*String|Object*/name, /*String?*/value){
      //  summary:
      //    Gets or sets an attribute on an HTML element.
      //  description:
      //    Handles normalized getting and setting of attributes on DOM
      //    Nodes. If 2 arguments are passed, and a the second argumnt is a
      //    string, acts as a getter.
      //
      //    If a third argument is passed, or if the second argument is a
      //    map of attributes, acts as a setter.
      //
      //    When passing functions as values, note that they will not be
      //    directly assigned to slots on the node, but rather the default
      //    behavior will be removed and the new behavior will be added
      //    using `event.connect()`, meaning that event handler properties
      //    will be normalized and that some caveats with regards to
      //    non-standard behaviors for onsubmit apply. Namely that you
      //    should cancel form submission using `event.stop()` on the
      //    passed event object instead of returning a boolean value from
      //    the handler itself.
      //  node:
      //    id or reference to the element to get or set the attribute on
      //  name:
      //    the name of the attribute to get or set.
      //  value:
      //    The value to set for the attribute
      //  returns:
      //    when used as a getter, the value of the requested attribute
      //    or null if that attribute does not have a specified or
      //    default value;
      //
      //    when used as a setter, the DOM node
      //
      //  example:
      //  |  // get the current value of the "foo" attribute on a node
      //  |  attr(node("#nodeId"), "foo");
      //  |  // or we can just pass the id:
      //  |  attr("#nodeId", "foo");
      //
      //  example:
      //  |  // use attr() to set the tab index
      //  |  attr("#nodeId", "tabIndex", 3);
      //  |
      //
      //  example:
      //  Set multiple values at once, including event handlers:
      //  |  attr("#formId", {
      //  |    "foo": "bar",
      //  |    "tabIndex": -1,
      //  |    "method": "POST",
      //  |    "onsubmit": function(e){
      //  |      // stop submitting the form. Note that the IE behavior
      //  |      // of returning true or false will have no effect here
      //  |      // since our handler is connect()ed to the built-in
      //  |      // onsubmit behavior and so we need to use
      //  |      // event.stop() to ensure that the submission
      //  |      // doesn't proceed.
      //  |      event.stop(e);
      //  |
      //  |      // submit the form with Ajax
      //  |      xhr.post({ form: "#formId" });
      //  |    }
      //  |  });
      //
      //  example:
      //  Style is s special case: Only set with an object hash of styles
      //  |  attr("#someNode",{
      //  |    id:"bar",
      //  |    style:{
      //  |      width:"200px", height:"100px", color:"#000"
      //  |    }
      //  |  });
      //
      //  example:
      //  Again, only set style as an object hash of styles:
      //  |  var obj = { color:"#fff", backgroundColor:"#000" };
      //  |  attr("#someNode", "style", obj);
      //  |
      //  |  // though shorter to use `style()` in this case:
      //  |  style("#someNode", obj);
  
      node = n(node);
      var args = arguments.length, prop;
      if(args == 2 && typeof name != "string"){ // inline'd type check
        // the object form of setter: the 2nd argument is a dictionary
        for(var x in name){
          attr(node, x, name[x]);
        }
        return node; // DomNode
      }
      var lc = name.toLowerCase(),
        propName = _propNames[lc] || name,
        forceProp = _forcePropNames[propName],
        attrName = _attrNames[lc] || name;
      if(args == 3){
        // setter
        do{
          if(propName == "style" && typeof value != "string"){ // inline'd type check
            // special case: setting a style
            style(node, value);
            break;
          }
          if(propName == "innerHTML"){
            // special case: assigning HTML
            //>>excludeStart("webkitMobile", kwArgs.webkitMobile);
            if(_.isIe && node.tagName.toLowerCase() in _roInnerHtml){
              n.empty(node);
              node.appendChild(n.dom(value, node.ownerDocument));
            }else{
            //>>excludeEnd("webkitMobile");
              node[propName] = value;
            //>>excludeStart("webkitMobile", kwArgs.webkitMobile);
            }
            //>>excludeEnd("webkitMobile");
            break;
          }
          if(lang.isFunction(value)){
            // special case: assigning an event handler
            // clobber if we can
            var attrId = attr(node, _attrId);
            if(!attrId){
              attrId = _ctr++;
              attr(node, _attrId, attrId);
            }
            if(!_evtHdlrMap[attrId]){
              _evtHdlrMap[attrId] = {};
            }
            var h = _evtHdlrMap[attrId][propName];
            if(h){
              event.disconnect(h);
            }else{
              try{
                delete node[propName];
              }catch(e){}
            }
            // ensure that event objects are normalized, etc.
            _evtHdlrMap[attrId][propName] = event.connect(node, propName, value);
            break;
          }
          if(forceProp || typeof value == "boolean"){
            // special case: forcing assignment to the property
            // special case: setting boolean to a property instead of attribute
            node[propName] = value;
            break;
          }
          // node's attribute
          node.setAttribute(attrName, value);
        }while(false);
        return node; // DomNode
      }
      // getter
      // should we access this attribute via a property or
      // via getAttribute()?
      value = node[propName];
      if(forceProp && typeof value != "undefined"){
        // node's property
        return value;  // Anything
      }
      if(propName != "href" && (typeof value == "boolean" || lang.isFunction(value))){
        // node's property
        return value;  // Anything
      }
      // node's attribute
      // we need _hasAttr() here to guard against IE returning a default value
      return _hasAttr(node, attrName) ? node.getAttribute(attrName) : null; // Anything
    }

    // There is a difference in the presence of certain properties and their default values
    // between browsers. For example, on IE "disabled" is present on all elements,
    // but it is value is "false"; "tabIndex" of <div> returns 0 by default on IE, yet other browsers
    // can return -1.
  
    attr.has = function(/*DomNode|String*/node, /*String*/name){
      //  summary:
      //    Returns true if the requested attribute is specified on the
      //    given element, and false otherwise.
      //  node:
      //    id or reference to the element to check
      //  name:
      //    the name of the attribute
      //  returns:
      //    true if the requested attribute is specified on the
      //    given element, and false otherwise
      var lc = name.toLowerCase();
      return _forcePropNames[_propNames[lc] || name] || _hasAttr(n(node), _attrNames[lc] || name);  // Boolean
    }

    attr.remove = function(/*DomNode|String*/ node, /*String*/ name){
      //  summary:
      //    Removes an attribute from an HTML element.
      //  node:
      //    id or reference to the element to remove the attribute from
      //  name:
      //    the name of the attribute to remove
      n(node).removeAttribute(_fixAttrName(name));
    }

    attr.prop = function(/*DomNode|String*/ node, /*String*/ name){
      //  summary:
      //    Returns an effective value of a property or an attribute.
      //  node:
      //    id or reference to the element to remove the attribute from
      //  name:
      //    the name of the attribute
      node = n(node);
      var lc = name.toLowerCase(),
        propName = _propNames[lc] || name;
      if((propName in node) && propName != "href"){
        // node's property
        return node[propName];  // Anything
      }
      // node's attribute
      var attrName = _attrNames[lc] || name;
      return _hasAttr(node, attrName) ? node.getAttribute(attrName) : null; // Anything
    }

    //Add node to the _() chaining.
    run.modify(
        "blade",
        "blade-attr",
        ["blade"],
        function(_) {
            _.sharpen("attr", attr, function(ret) {
              return ret === undefined || ret.nodeType;
            });
        }
    );

    return attr;
  }
);