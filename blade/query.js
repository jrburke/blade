/**
 * @license query.js Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
 * Available via the MIT, GPL or new BSD license.
 * see: http://github.com/jrburke/blade for details
 */
/*jslint plusplus: false */
/*global require: false, document: false */

"use strict";

require.def("blade/query", ["blade"], function (blade) {

    var counter = 0, Ctor = Array;
    // QSA-only for webkit mobile. Welcome to the future.
    function query(qry, root) {
        if (!qry) {
            return new Ctor();
        }

        if (qry.constructor === Ctor) {
            return qry;
        }

        if (typeof qry !== "string") { // inline'd type check
            return new Ctor(qry); // dojo.NodeList
        }

        if (typeof root === "string") { // inline'd type check
            root = document.getElementById(root);
            if (!root) {
                return new Ctor();
            }
        }

        root = root || document;
        var rootIsDoc = (root.nodeType === 9),
            doc = rootIsDoc ? root : (root.ownerDocument || document);

        // rewrite the query to be ID rooted
        if (!rootIsDoc || (">~+".indexOf(qry.charAt(0)) >= 0)) {
            root.id = root.id || ("qUnique" + (counter++));
            qry = "#" + root.id + " " + qry;
        }

        // rewrite the query to not choke on something like ".yada.yada >"
        // by adding a final descendant component

        if (">~+".indexOf(qry.slice(-1)) >= 0) {
            qry += " *";
        }

        return Ctor.prototype.slice.call(doc.querySelectorAll(qry));
    }

    //Add the query function for blade chaining.
    require.modify(
        "blade",
        "blade-query",
        ["blade"],
        function (b) {
            b.sharpen("query", query, false);
        }
    );

    return query;
});
