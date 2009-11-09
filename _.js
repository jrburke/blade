/*
  Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
  Available via the new BSD license.
  see: http://github.com/jrburke/blade for details
*/
(function() {
  //Determine if we are in the browser, and set up knowledge of IE. Just
  //want to know about IE, but in general avoid user agent detection.
  var isBrowser = typeof document != "undefined" && typeof navigator != "undefined";
  if (isBrowser) {
    isIe = (document.all &&
             navigator.userAgent.indexOf("Opera") == -1
             && parseFloat(navigator.appVersion.split("MSIE ")[1])) || undefined;
  }

  run("_",
      ["run"],
      //Ask for run as a dependency so we get the right context as defined
      //by runjs for the scope in which this blade will live.
      function(run) {
  
        /**
         * The main entry point into blade. It wraps the object passed
         * as the subject argument in a proxy object that has methods
         * attached to it.
         * 
         * @param {Object} subject the object to wrap in blade methods.
         *
         * @param {Object} parent the parent blade to use for end().
         * Normally you do not need to pass this directly, but it is used
         * by internal code.
         */
        _ = function (subject, parent) {
          //If this is an instance that already has a subject, return it.
          if (this._subject) {
            return this._subject;
          }
  
          if (this === _.global) {
            return new _(subject);
          }
  
          this._subject = subject;
          if (parent) {
            this._parent = parent;
          }
          return this;
        }
  
        _.global = this;
  
        _.prototype = {
          _: function() {
            return this._subject;
          },
          end: function() {
            if (this._parent) {
              return this._parent;
            }
            return this;
          }
        };
  
        //Determine if we are in the browser, and set up knowledge of IE. Just
        //want to know about IE, but in general avoid user agent detection.
        _.isBrowser = isBrowser;
        if (isBrowser) {
          _.doc = document;
          _.isIe = isIe;
        }

        _.sharpen = function(name, func, allowChaining) {
          //The function will receive the this._subject as the first
          //argument to the call.
          _.prototype[name] = function() {
            args = _.toArray(arguments);
            args.unshift(this._subject);
            var ret = func.apply(this, args);
            if (allowChaining) {
              var draw = allowChaining === true || allowChaining(ret);
              return draw ? (ret && ret != this ? _(ret, this) : this) : ret;
            } else {
              return ret;
            }
          }
        }
  
        // Crockford (ish) functions
        _.isString = function(/*anything*/ it){
          //  summary:
          //    Return true if it is a String
          return (typeof it == "string" || it instanceof String); // Boolean
        }
  
        _.isArray = function(/*anything*/ it){
          //  summary:
          //    Return true if it is an Array
          return opts.call(it) === "[object Array]"; // Boolean
        }
  
	var opts = Object.prototype.toString;
	_.isFunction = function(/*anything*/ it){
		// summary:
		//		Return true if it is a Function
		return opts.call(it) === "[object Function]";
	};

        _.isObject = function(/*anything*/ it){
          // summary:
          //    Returns true if it is a JavaScript object (or an Array, a Function
          //    or null)
          return it !== undefined &&
                  (it === null || typeof it == "object" || _.isArray(it) || _.isFunction(it)); // Boolean
        }
  
        _.isArrayLike = function(/*anything*/ it){
          //  summary:
          //    similar to _.isArray() but more permissive
          //  description:
          //    Doesn't strongly test for "arrayness".  Instead, settles for "isn't
          //    a string or number and has a length property". Arguments objects
          //    and DOM collections will return true when passed to
          //    _.isArrayLike(), but will return false when passed to
          //    _.isArray().
          //  returns:
          //    If it walks like a duck and quacks like a duck, return `true`
          return it && it !== undefined && // Boolean
                  // keep out built-in constructors (Number, String, ...) which have length
                  // properties
                  !_.isString(it) && !_.isFunction(it) &&
                  !(it.tagName && it.tagName.toLowerCase() == 'form') &&
                  (_.isArray(it) || isFinite(it.length));
        }
  
        //Define mixin variables, to get around IE not mixing in some props.
        var extraNames, extraLen, empty = {};
        for(var i in {toString: 1}){ extraNames = []; break; }
        extraNames = extraNames || ["hasOwnProperty", "valueOf", "isPrototypeOf",
          "propertyIsEnumerable", "toLocaleString", "toString", "constructor"];
        extraLen = extraNames.length;
  
        /**
         * Adds all properties and methods of source to target. This addition
         * is "prototype extension safe", so that instances of objects
         * will not pass along prototype defaults.
         *
         * @param {Object} target the target object receiving the mixed in props
         * @param {Object} source the source object providing the props.
         */
        _.mixin = function(target, source) {
          var name, s, i;
          for (name in source) {
            // the "tobj" condition avoid copying properties in "source"
            // inherited from Object.prototype.  For example, if target has a custom
            // toString() method, don't overwrite it with the toString() method
            // that source inherited from Object.prototype
            s = source[name];
            if (!(name in target) || (target[name] !== s && (!(name in empty) || empty[name] !== s))) {
              target[name] = s;
            }
          }
          // IE doesn't recognize some custom functions in for..in
          if (extraLen && source) {
            for (i = 0; i < extraLen; ++i) {
              name = extraNames[i];
              s = source[name];
              if (!(name in target) || (target[name] !== s && (!(name in empty) || empty[name] !== s))) {
                target[name] = s;
              }
            }
          }
          return target; // Object
        }
  
    _.extend = function(/*Object*/ constructor, /*Object...*/ props){
      // summary:
      //    Adds all properties and methods of props to constructor's
      //    prototype, making them available to all instances created with
      //    constructor.
      for(var i=1, l=arguments.length; i<l; i++){
        _.mixin(constructor.prototype, arguments[i]);
      }
      return constructor; // Object
    }
  
        _.delegate = (function(){
          // boodman/crockford delegation w/ cornford optimization
          function TMP(){}
          return function(obj, props){
            TMP.prototype = obj;
            var tmp = new TMP();
            TMP.prototype = null;
            if(props){
              _.mixin(tmp, props);
            }
            return tmp; // Object
          }
        })();
  
        _._hitchArgs = function(scope, method /*,...*/){
          var pre = _.toArray(arguments, 2);
          var named = _.isString(method);
          return function(){
            // arrayify arguments
            var args = _.toArray(arguments);
            // locate our method
            var f = named ? (scope||_.global)[method] : method;
            // invoke with collected args
            return f && f.apply(scope || this, pre.concat(args)); // mixed
          } // Function
        }
      
        _.hitch = function(/*Object*/scope, /*Function|String*/method /*,...*/){
          //  summary:
          //    Returns a function that will only ever execute in the a given scope.
          //    This allows for easy use of object member functions
          //    in callbacks and other places in which the "this" keyword may
          //    otherwise not reference the expected scope.
          //    Any number of default positional arguments may be passed as parameters 
          //    beyond "method".
          //    Each of these values will be used to "placehold" (similar to curry)
          //    for the hitched function.
          //  scope:
          //    The scope to use when method executes. If method is a string,
          //    scope is also the object containing method.
          //  method:
          //    A function to be hitched to scope, or the name of the method in
          //    scope to be hitched.
          //  example:
          //  |  _.hitch(foo, "bar")();
          //    runs foo.bar() in the scope of foo
          //  example:
          //  |  _.hitch(foo, myFunction);
          //    returns a function that runs myFunction in the scope of foo
          //  example:
          //    Expansion on the default positional arguments passed along from
          //    hitch. Passed args are mixed first, additional args after.
          //  |  var foo = { bar: function(a, b, c){ console.log(a, b, c); } };
          //  |  var fn = _.hitch(foo, "bar", 1, 2);
          //  |  fn(3); // logs "1, 2, 3"
          //  example:
          //  |  var foo = { bar: 2 };
          //  |  _.hitch(foo, function(){ this.bar = 10; })();
          //    execute an anonymous function in scope of foo
          
          if(arguments.length > 2){
            return _._hitchArgs.apply(d, arguments); // Function
          }
          if(!method){
            method = scope;
            scope = null;
          }
          if(_.isString(method)){
            scope = scope || _.global;
            if(!scope[method]){ throw(['_.hitch: scope["', method, '"] is null (scope="', scope, '")'].join('')); }
            return function(){ return scope[method].apply(scope, arguments || []); }; // Function
          }
          return !scope ? method : function(){ return method.apply(scope, arguments || []); }; // Function
        }
  
        /*=====
        _.toArray = function(obj, offset, startWith){
                //  summary:
                //    Converts an array-like object (i.e. arguments, DOMCollection) to an
                //    array. Returns a new Array with the elements of obj.
                //  obj: Object
                //    the object to "arrayify". We expect the object to have, at a
                //    minimum, a length property which corresponds to integer-indexed
                //    properties.
                //  offset: Number?
                //    the location in obj to start iterating from. Defaults to 0.
                //    Optional.
                //  startWith: Array?
                //    An array to pack with the properties of obj. If provided,
                //    properties in obj are appended at the end of startWith and
                //    startWith is the returned array.
        }
        =====*/
  
        var efficient = function(obj, offset, startWith){
                return (startWith||[]).concat(Array.prototype.slice.call(obj, offset||0));
        };
  
        //>>excludeStart("webkitMobile", kwArgs.webkitMobile);
        var slow = function(obj, offset, startWith){
                var arr = startWith||[];
                for(var x = offset || 0; x < obj.length; x++){
                        arr.push(obj[x]);
                }
                return arr;
        };
        //>>excludeEnd("webkitMobile");
  
        _.toArray =
                //>>excludeStart("webkitMobile", kwArgs.webkitMobile);
                _.isIe ?  function(obj){
                        return ((obj.item) ? slow : efficient).apply(this, arguments);
                } :
                //>>excludeEnd("webkitMobile");
                efficient;
  
        _.partial = function(/*Function|String*/method /*, ...*/){
                //  summary:
                //    similar to hitch() except that the scope object is left to be
                //    whatever the execution context eventually becomes.
                //  description:
                //    Calling _.partial is the functional equivalent of calling:
                //    |  _.hitch(null, funcName, ...);
                var arr = [ null ];
                return _.hitch.apply(d, arr.concat(_.toArray(arguments))); // Function
        }
  
        
        return _;
      }
  );
  
  
  //Define the base installation
  run([
    "_.array",
    "_.node",
    "_.attr",
    "_.style",
    "_.NodeList",
    "_.$"
  ]);

  //IE, when are you going to change?
  if (isIe) {
    run.modify({
      "_.node": "_.ie.node"
    });
  }
}());
