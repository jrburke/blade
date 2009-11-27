/*
  Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
  Available via the new BSD license.
  see: http://github.com/jrburke/blade for details
*/
/*jslint nomen: false, plusplus: false, newcap: false */
/*global run: true */
"use strict";

run("blade",
    ["run"],
    //Ask for run as a dependency so we get the right context as defined
    //by runjs for the scope in which this blade will live.
    function (run) {
	var x, aps = Array.prototype.slice, blade;
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
	blade = function (subject, parent) {
	    //If this is an instance that already has a subject, return it.
	    if (this._subject) {
		return this._subject;
	    }
	
	    if (this === run.global) {
		return new blade(subject);
	    }
	
	    this._subject = subject;
	    if (parent) {
		this._parent = parent;
	    }
	    return this;
	};
      
	blade.prototype = {
	    blade: function () {
		return this._subject;
	    },
	    end: function () {
		return this._parent || this;
	    }
	};
	//Alias in blade symbol in case that is preferred by caller.
	blade.prototype._ = blade.prototype.blade;
      
	blade.toArray = function (obj, offset, startWith) {
	    var t = aps.call(obj, offset||0);
	    return startWith ? startWith.concat(t) : t;
	};
      
	blade.sharpen = function (name, func, allowChaining) {
	  //The function will receive the this._subject as the first
	  //argument to the call.
	      var f;
	      // let's branch on assignment to gain some speed
	      if (allowChaining === true) {
		// allways chain
		f = function() {
		    var ret = func.apply(this, blade.toArray(arguments, 0, [this._subject]));
		    return ret && ret !== this ? blade(ret, this) : this;
		}
	      }else if (allowChaining) {
		// chain on function
		f = function() {
		  var ret = func.apply(this, blade.toArray(arguments, 0, [this._subject]));
		  return allowChaining(ret) ? (ret && ret !== this ? blade(ret, this) : this) : ret;
		}
	      }else{
		// don't chain
		f = function() {
		  return func.apply(this, blade.toArray(arguments, 0, [this._subject]));
		}
	      }
	  blade.prototype[name] = f;
	}

	return blade;
    }
);
