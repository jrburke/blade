/**
 * @license blade/node Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 * Available via the MIT, GPL or new BSD license.
 * see: http://github.com/jrburke/blade for details
 */
/*jslint    nomen: false, plusplus: false */
/*global require: false ,document: false */

'use strict';

require.def('blade/node',
        ['require'],
function (require) {
    var dom, tw, prop,
        // support stuff for dom()
        tagWrap = {
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
        masterName = "__" + require.context.contextName + "ToDomId";

    // generate start/end tag strings to use
    // for the injection for each special tag wrap case.
    for (prop in tagWrap) {
        if (tagWrap.hasOwnProperty(prop)) {
            tw = tagWrap[prop];
            tw.pre    = prop === "option" ? '<select multiple="multiple">' : "<" + tw.join("><") + ">";
            tw.post = "</" + tw.reverse().join("></") + ">";
            // the last line is destructive: it reverses the array,
            // but we don't care at this point
        }
    }

    /**
     * node will get or create a node.
     *
     * @param {String|DOMNode} id if the value is a String:
     *     * if it stars with a #, then document.getElementsById will be used
     *     * if it starts with a < then it is assumed to be markup, and it will
     *     * be converted into DOM elements.
     *     * Otherwise, it is assumed to be the tag name of the DOM element to
     *     * create.
     *     * If an object, then just the object is returned.
     * @param {Object} [props] an object arg of properties to set on the
     * node.
     * @param {DOMElement} [refNode] a reference node to use for the node.
     * Used to get the document and also used in relation to the position argument.
     * @param {String} [position]. The name of one of the positional insertion
     * methods on node: 'append', 'prepend', 'before', 'after'. There is no
     * default value for this argument. refNode can be passed in just to indicate
     * the correct document to use.
     *
     * @returns {DOMElement||DOMFragment} If the id argument is a string of HTML
     * that does not just have one top level element that will be created, this
     * function will return a DOM Fragment, otherwise a DOM Element.
     */
    function node(id, props, refNode, position) {
        //The getElementById portion of the program.
        //Note that the goofy work for IE is not supported. The guidance will
        //be to use different ID names in IE.
        var n = id, doc = refNode && refNode.ownerDocument || document,
            ch, prop, styles, styleProp;
        if (typeof id === "string") {
            ch = id.charAt(0);
            if (ch === "<") {
                n = dom(id);
            } else if (ch === "#") {
                n = doc.getElementById(id.substring(1, id.length));
            } else {
                n = doc.createElement(id);
            }
        }

        //TODO: may need to make this smarter for setting properties on the node.
        //This may need to be a separate module and this module looks to see if
        //a node.prop method is defined (used by other module) and if so, uses it.
        if (props) {
            for (prop in props) {
                if (props.hasOwnProperty(prop)) {
                    if (prop === 'style' && typeof props[prop] === 'object') {
                        //TODO: need to normalize things like border-radius?
                        styles = props[prop];
                        for (styleProp in styles) {
                            if (styles.hasOwnProperty(styleProp)) {
                                n.style[styleProp] = styles[styleProp];
                            }
                        }
                    } else {
                        n[prop] = props[prop];
                    }
                }
            }
        }

        //position must be passed in. The existence of a refNode argument
        //is not enough -- refNode may have just been passed to indicate
        //the correct document to use for creating a new node.
        if (position) {
            if (typeof position === 'number') {
                node.insert(n, refNode, position);
            } else {
                node[position](n, refNode);
            }
        }

        return n;
    }

    /**
     * Converts HTML string into a DOM node or, if multiple top level entities,
     * into a DOM Fragment.
     *
     * @param {String} frag the HTML string fragment
     * @param {HTMLDocument} doc the HTML document to use for the operation.
     * Defaults to document.
     *
     * @returns {DOMElement||DOMFragment}
     */
    dom = node.dom = function (frag, doc) {
        doc = doc || document;
        var masterId = doc[masterName],
            match, tag, master, wrap, i, fc, df;
        if (!masterId) {
            doc[masterName] = masterId = ++masterNum + "";
            masterNode[masterId] = doc.createElement("div");
        }

        // make sure the frag is a string.
        frag += "";

        // find the starting tag, and get node wrapper
        match = frag.match(reTag);
        tag = match ? match[1].toLowerCase() : "";
        master = masterNode[masterId];
        if (match && tagWrap[tag]) {
            wrap = tagWrap[tag];
            master.innerHTML = wrap.pre + frag + wrap.post;
            for (i = wrap.length; i; --i) {
                master = master.firstChild;
            }
        } else {
            master.innerHTML = frag;
        }

        // one node shortcut => return the node itself
        if (master.childNodes.length === 1) {
            return master.removeChild(master.firstChild); // DOMNode
        }

        // return multiple nodes as a document fragment
        df = doc.createDocumentFragment();
        while ((fc = master.firstChild)) {
            df.appendChild(fc);
        }
        return df; // DOMNode
    };

    /**
     * Clears out all the children of a node
     *
     * @param {DOMElement} n the node whose children should be removed.
     * 
     */
    node.empty = function (n) {
        //TODO: remove any data elements? Or rather,
        //other modules can modify this function to do something else?
        //Hmm, does not help with the thing that gets registered with query()
        //though: that registration passes this specific function. The overriding
        //party would need to modify that other definition.
        n.innerHTML = '';
    };

    function _insertBefore(node, refNode) {
        var parent = refNode.parentNode;
        if (parent) {
            parent.insertBefore(node, refNode);
        }
    }

    function _insertAfter(node, refNode) {
        var parent = refNode.parentNode;
        if (parent) {
            if (parent.lastChild === refNode) {
                parent.appendChild(node);
            } else {
                parent.insertBefore(node, refNode.nextSibling);
            }
        }
    }

    /**
     * Inserts node at a numeric position in relation to a reference node.
     * @param {DOMNode} n the node to place
     * @param {DOMNode} refNode the reference node to use for the insertion
     * @param {Number} index the indexed position to place the node.
     */
    node.insert = function (n, refNode, index) {
        refNode = node(refNode);
        n = node(n);
        var cn = refNode.childNodes;
        if (!cn.length || cn.length <= index) {
            refNode.appendChild(n);
        } else {
            _insertBefore(n, cn[index < 0 ? 0 : index]);
        }
    };

    node.after = function (n, refNode) {
        _insertAfter(node(n), node(refNode));
    };

    node.insertAfter = function (n, refNode) {
        _insertAfter(node(refNode), node(n));
    };

    node.append = function (n, refNode) {
        n(refNode).appendChild(n);
    };

    node.appendTo = function (n, refNode) {
        node(n).appendChild(node(refNode));
    };

    node.before = function (n, refNode) {
        _insertBefore(node(n), node(refNode));
    };

    node.insertBefore = function (n, refNode) {
        _insertBefore(node(refNode), node(n));
    };

    node.html = function (n, refNode) {
        refNode = node(refNode);
        node.empty(refNode);
        refNode.appendChild(node(n));
    };

    node.prepend = function (n, refNode) {
        refNode = node(refNode);
        n = node(n);
        if (refNode.firstChild) {
            _insertBefore(n, refNode.firstChild);
        } else {
            refNode.appendChild(n);
        }
    };

    node.prependTo = function (n, refNode) {
        return node.prepend(refNode, n);
    };

    node.replaceWith = function (n, refNode) {
        refNode = node(refNode);
        refNode.parentNode.replaceChild(node(n), refNode);
    };

    /**
     * Removes a node and its children from the DOM
     * @param {DOMElement} n the node to remove.
     */
    node.remove = function (n) {
        n.parentNode.removeChild(n);
    };

    //Add Node methods to the query blade if it gets loaded.
    require.modify("blade/query", "blade/query-node",
            ["blade/query", "blade/arrayFn"],
    function (query,         arrayFn) {
        query.extend('empty', arrayFn.asForEach(node.empty), true);


//for after, insertAfter, etc... allow passing a function to them function(index){} where
//"this" in that function will be the DOM Node
//html( function(index, oldhtml) )

    });

    return node;
});
