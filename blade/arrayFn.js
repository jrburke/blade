/**
 * @license blade/arrayFn Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 * Available via the MIT, GPL or new BSD license.
 * see: http://github.com/jrburke/blade for details
 */
/*jslint nomen: false, plusplus: false */
/*global require: false */

'use strict';

/**
 * arrayFn is a set of adapter functions that allow calling a simpler function
 * for each item in an array in different ways. These methods assume that
 * JavaScript Array extras are available on the target arrays that will receive
 * these functions. The "this" references in this file will be an instance
 * of a blade, where the this.o property is the target array.
 */

require.def('blade/arrayFn', function () {

    var ap = Array.prototype, aps = ap.slice;

    function loopBody(f, a, o) {
        a = [0].concat(aps.call(a, 0));
        o = o || null;
        return function (node) {
            a[0] = node;
            return f.apply(o, a);
        };
    }

    // adapters
    return {
        asForEach: function (f, o) {
            //    summary:
            //        adapts a single node function to be used in the forEach-type
            //        actions. The initial object is returned from the specialized
            //        function.
            //    f: Function
            //        a function to adapt
            //    o: Object?
            //        an optional context for f
            return function () {
                this.o.forEach(loopBody(f, arguments, o));
            };
        },

        asMap: function (f, o) {
            //    summary:
            //        adapts a single node function to be used in the map-type
            //        actions. The return is a new array of values, as via `dojo.map`
            //    f: Function
            //        a function to adapt
            //    o: Object?
            //        an optional context for f
            return function () {
                return this.o.map(loopBody(f, arguments, o));
            };
        },

        asFilter: function (f, o) {
            //    summary:
            //        adapts a single node function to be used in the filter-type actions
            //    f: Function
            //        a function to adapt
            //    o: Object?
            //        an optional context for f
            return function () {
                return this.o.filter(loopBody(f, arguments, o));
            };
        },

        asConditionalForEach: function (f, g, o) {
            //    summary:
            //        adapts a single node function to be used in the map-type
            //        actions, behaves like forEach() or map() depending on arguments
            //    f: Function
            //        a function to adapt
            //    g: Function
            //        a condition function, if true runs as map(), otherwise runs as forEach()
            //    o: Object?
            //        an optional context for f and g
            return function () {
                var a = arguments, body = loopBody(f, a, o);
                if (g.call(o || null, a)) {
                    return this.o.map(body);
                }
                this.o.forEach(body);
                //Next line to appease spidermonkey strict checking
                return undefined;
            };
        }
    };
});