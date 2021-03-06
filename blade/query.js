/**
 * @license blade/query Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 * Available via the MIT, GPL or new BSD license.
 * see: http://github.com/jrburke/blade for details
 */
/*jslint plusplus: false */
/*global require: false, document: false */

'use strict';

require.def('blade/query', ['blade'], function (blade) {

    var counter = 0, Ctor = Array, maker;
    function query(qry, root) {
        if (!qry) {
            return new Ctor();
        }

        if (qry.constructor === Ctor) {
            return qry;
        }

        if (typeof qry !== 'string') { // inline'd type check
            return new Ctor(qry);
        }

        if (typeof root === 'string') { // inline'd type check
            root = document.getElementById(root);
            if (!root) {
                return new Ctor();
            }
        }

        root = root || document;
        var rootIsDoc = (root.nodeType === 9),
            doc = rootIsDoc ? root : (root.ownerDocument || document);

        // rewrite the query to be ID rooted
        if (!rootIsDoc || ('>~+'.indexOf(qry.charAt(0)) >= 0)) {
            root.id = root.id || ('qUnique' + (counter++));
            qry = '#' + root.id + ' ' + qry;
        }

        // rewrite the query to not choke on something like '.yada.yada >'
        // by adding a final descendant component

        if ('>~+'.indexOf(qry.slice(-1)) >= 0) {
            qry += ' *';
        }

        return Ctor.prototype.slice.call(doc.querySelectorAll(qry));
    }

    //Create the maker function for the query blade.
    maker = blade.forge(query);
    maker.extend('size', function () {
        return this.o.length;
    }, false);

    return maker;
});
