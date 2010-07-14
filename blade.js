/*
  blade.js Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
  Available via the new BSD license.
  see: http://github.com/jrburke/blade for details
*/
/*jslint nomen: false, plusplus: false, newcap: false */
/*global require: true */
"use strict";

require.def("blade", function () {
    /**
     * Adds a new method to the prototype of a function that allows chained
     * calls.
     *
     * @param {Function} Ctor the constructor function whose prototype will
     * get the new method.
     *
     * @param {String} name of the function to attach the the prototype.
     *
     * @param {Function} the function to be used for the given name. The function
     * will receive the object stored by the chainable constructor as the first
     * argument to the function.
     *
     * @param allowChaining {Boolean||Function} if a boolean value, then the return
     * value of the function call will be stored as the new object wrapped by
     * a new instance of the chainable object. If a function, the function will
     * receive the return value of the function as the first arg, and any input
     * arguments to the original function as subsequent arguments. The allowingChaining function
     * can return true if chaining of the value is allowed, or false if it is not
     * and the return value of the function should just be returned.
     *
     * @returns {Function} the constructor function passed in as the first argument,
     * to allow chaining of the extend calls.
     */
    function extend(Ctor, name, func, allowChaining) {
        //The function will receive the this.o (the subject object) as the first
        //argument to the call.
        var f;
        //Some repetition here for speed.
        if (allowChaining) {
            // chain on function
            f = function () {
                var ret = func.apply(this, [this.o].concat(arguments));
                if (allowChaining === true || allowChaining([ret].concat(arguments))) {
                    //Want to avoid extra Ctor calls if the fundamental object
                    //has not changed, so only create a new one if ret !== undefined
                    if (ret !== undefined && ret !== this.o) {
                        ret = Ctor(ret);
                        ret._parent = this;
                        return ret;
                    } else {
                        return this;
                    }
                }else {
                    return ret;
                }
            };
        } else {
            // don't chain
            f = function () {
                return func.apply(this, [this.o].concat(arguments));
            };
        }
        Ctor.prototype[name] = f;

        return Ctor;
    }

    /**
     * Forges a new chainable function entry point. Enables the ability to create
     * chainable DSLs
     * @param {String} [extendName] optional string that defines the name of
     * the function that allows adding method extensions to this function. By
     * default the name is "extend". Blade calls it "sharpen".
     *
     * @returns {Function} a constructor function that can be used in method chains. Follows
     * the blade model where new instances 
     */
    function forge(extendName) {
        /**
         * The main entry point into a chainable DSL. It wraps the object passed
         * as the subject argument in a proxy object that has methods
         * attached to it.
         * 
         * @param {Object} subject the object to wrap in chainable methods.
         */
        var Ctor = function (subject, parent) {
            //If this is an instance that already has a subject, return it.
            if (this.constructor !== Ctor) {
                return new Ctor(subject);
            }

            this.o = subject;

            return this;
        };

        Ctor.prototype = {
            /**
             * Method to end the current call chain go back to the parent call chain.
             */
            end: function () {
                return this._parent || this;
            }
        };

        //Attach the 
        Ctor[extendName || "extend"] = function () {
            return extend.apply(null, [Ctor].concat(arguments));
        };

        return Ctor;
    }

    //Create the actual blade constructor.
    var blade = forge("sharpen");
    blade.forge = forge;

    return blade;
});
