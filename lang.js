/*
  Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
  Available via the new BSD license.
  see: http://github.com/jrburke/blade for details
*/
/*jslint nomen: false, plusplus: false, forin: true */
/*global run: true */
"use strict";

/*****
 *LEGACY FILE, just keeping it for informative api reasons.
 */

run("lang",
    ["run"],
    function (run) {
        var opts = Object.prototype.toString, aps = Array.prototype.slice, lang,
            empty = {},
            toArray = function (obj, offset, startWith) {
                var t = aps.call(obj, offset || 0);
                return startWith ? startWith.concat(t) : t;
            };

        return (lang = {
            isString: function (/*anything*/ it) {
                //  summary:
                //    Return true if it is a String
                return opts.call(it) === "[object String]"; // Boolean
            },
            
            isArray: function (/*anything*/ it) {
                //  summary:
                //    Return true if it is an Array
                return opts.call(it) === "[object Array]"; // Boolean
            },
    
            isFunction: function (/*anything*/ it) {
                // summary:
                //        Return true if it is a Function
                return opts.call(it) === "[object Function]";
            },
    
            isObject: function (/*anything*/ it) {
                // summary:
                //    Returns true if it is a JavaScript object (or an Array, a Function
                //    or null)
                return it !== undefined &&
                (it === null || typeof it === "object" || lang.isArray(it) || lang.isFunction(it)); // Boolean
            },
    
            isArrayLike: function (/*anything*/ it) {
                //  summary:
                //    similar to lang.isArray() but more permissive
                //  description:
                //    Doesn't strongly test for "arrayness".  Instead, settles for "isn't
                //    a string or number and has a length property". Arguments objects
                //    and DOM collections will return true when passed to
                //    lang.isArrayLike(), but will return false when passed to
                //    lang.isArray().
                //  returns:
                //    If it walks like a duck and quacks like a duck, return `true`
                return it && // Boolean
                // keep out built-in constructors (Number, String, ...) which have length
                // properties
                !lang.isString(it) && !lang.isFunction(it) &&
                !(it.tagName && it.tagName.toLowerCase() === 'form') &&
                (lang.isArray(it) || isFinite(it.length));
            },
    
            /**
             * Adds all properties and methods of source to target. This addition
             * is "prototype extension safe", so that instances of objects
             * will not pass along prototype defaults.
             *
             * @param {Object} target the target object receiving the mixed in props
             * @param {Object} source the source object providing the props.
             */
            mixin: function (target, source) {
                var name, s, i;
                for (name in source) {
                    // the "empty" condition avoid copying properties in "source"
                    // inherited from Object.prototype.  For example, if target has a custom
                    // toString() method, don't overwrite it with the toString() method
                    // that source inherited from Object.prototype
                    s = source[name];
                    if (!(name in target) || (target[name] !== s && (!(name in empty) || empty[name] !== s))) {
                        target[name] = s;
                    }
                }
                return target; // Object
            },
    
            extend: function (/*Object*/ constructor, /*Object...*/ props) {
                // summary:
                //    Adds all properties and methods of props to constructor's
                //    prototype, making them available to all instances created with
                //    constructor.
                for (var i = 1, l = arguments.length; i < l; i++) {
                    lang.mixin(constructor.prototype, arguments[i]);
                }
                return constructor; // Object
            },
    
            delegate: (function () {
                // boodman/crockford delegation w/ cornford optimization
                function TMP() {}
                return function (obj, props) {
                    TMP.prototype = obj;
                    var tmp = new TMP();
                    TMP.prototype = null;
                    if (props) {
                        lang.mixin(tmp, props);
                    }
                    return tmp; // Object
                };
            }()),
    
            _bindArgs: function (scope, method /*,...*/) {
                var pre = toArray(arguments, 2),
                    named = lang.isString(method);
                return function () {
                    // arrayify arguments
                    var args = toArray(arguments),
                        // locate our method
                        f = named ? (scope || run.global)[method] : method;
                    // invoke with collected args
                    return f ? f.apply(scope || this, pre.concat(args)) : undefined; // mixed
                }; // Function
            },
        
            bind: function (/*Object*/scope, /*Function|String*/method /*,...*/) {
                //  summary:
                //    Returns a function that will only ever execute in the a given scope.
                //    This allows for easy use of object member functions
                //    in callbacks and other places in which the "this" keyword may
                //    otherwise not reference the expected scope.
                //    Any number of default positional arguments may be passed as parameters 
                //    beyond "method".
                //    Each of these values will be used to "placehold" (similar to curry)
                //    for the bound function.
                //  scope:
                //    The scope to use when method executes. If method is a string,
                //    scope is also the object containing method.
                //  method:
                //    A function to be bound to scope, or the name of the method in
                //    scope to be bound.
                //  example:
                //  |  bind(foo, "bar")();
                //    runs foo.bar() in the scope of foo
                //  example:
                //  |  bind(foo, myFunction);
                //    returns a function that runs myFunction in the scope of foo
                //  example:
                //    Expansion on the default positional arguments passed along from
                //    bind. Passed args are mixed first, additional args after.
                //  |  var foo = { bar: function(a, b, c){ console.log(a, b, c); } };
                //  |  var fn = bind(foo, "bar", 1, 2);
                //  |  fn(3); // logs "1, 2, 3"
                //  example:
                //  |  var foo = { bar: 2 };
                //  |  bind(foo, function(){ this.bar = 10; })();
                //    execute an anonymous function in scope of foo
                
                if (arguments.length > 2) {
                    return lang._bindArgs.apply(lang, arguments); // Function
                }
                if (!method) {
                    method = scope;
                    scope = null;
                }
                if (lang.isString(method)) {
                    scope = scope || run.global;
                    if (!scope[method]) {
                        throw (['lang.bind: scope["', method, '"] is null (scope="', scope, '")'].join(''));
                    }
                    return function () {
                        return scope[method].apply(scope, arguments || []);
                    }; // Function
                }
                return !scope ? method : function () {
                    return method.apply(scope, arguments || []);
                }; // Function
            },
    
            partial: function (/*Function|String*/method /*, ...*/) {
                //  summary:
                //    similar to bind() except that the scope object is left to be
                //    whatever the execution context eventually becomes.
                //  description:
                //    Calling lang.partial is the functional equivalent of calling:
                //    |  lang.bind(null, funcName, ...);
                var arr = [ null ];
                return lang.bind.apply(lang, arr.concat(toArray(arguments))); // Function
            }
        });
    }
);
