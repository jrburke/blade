/*
  Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
  Available via the new BSD license.
  see: http://github.com/jrburke/blade for details
*/
run(
  "array",
  ["run"],
  function(run) {

	var _getParts = function(arr, obj, cb){
		return [ 
			(typeof arr == "string") ? arr.split("") : arr, 
			obj || run.global,
			// FIXME: cache the anonymous functions we create here?
			(typeof cb == "string") ? new Function("item", "index", "array", cb) : cb
		];
	};

	var everyOrSome = function(/*Boolean*/every, /*Array|String*/arr, /*Function|String*/callback, /*Object?*/thisObject){
		var _p = _getParts(arr, thisObject, callback); arr = _p[0];
		for(var i=0,l=arr.length; i<l; ++i){
			var result = !!_p[2].call(_p[1], arr[i], i, arr);
			if(every ^ result){
				return result; // Boolean
			}
		}
		return every; // Boolean
	};

	var array = function (obj, offset, startWith) {
		var t = aps.call(obj, offset||0);
		return startWith ? startWith.concat(t) : t;
	};

	

		array.indexOf = function(	/*Array*/		array, 
							/*Object*/		value,
							/*Integer?*/	fromIndex,
							/*Boolean?*/	findLast){
			// summary:
			//		locates the first index of the provided value in the
			//		passed array. If the value is not found, -1 is returned.
			// description:
			//		This method corresponds to the JavaScript 1.6 Array.indexOf method, with one difference: when
			//		run over sparse arrays, the Dojo function invokes the callback for every index whereas JavaScript 
			//		1.6's indexOf skips the holes in the sparse array.
			//		For details on this method, see:
			//			https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/indexOf

			var step = 1, end = array.length || 0, i = 0;
			if(findLast){
				i = end - 1;
				step = end = -1;
			}
			if(fromIndex != undefined){ i = fromIndex; }
			if((findLast && i > end) || i < end){
				for(; i != end; i += step){
					if(array[i] == value){ return i; }
				}
			}
			return -1;	// Number
		};

		array.lastIndexOf = function(/*Array*/ary, /*Object*/value, /*Integer?*/fromIndex){
			// summary:
			//		locates the last index of the provided value in the passed
			//		array. If the value is not found, -1 is returned.
			// description:
			//		This method corresponds to the JavaScript 1.6 Array.lastIndexOf method, with one difference: when
			//		run over sparse arrays, the Dojo function invokes the callback for every index whereas JavaScript 
			//		1.6's lastIndexOf skips the holes in the sparse array.
			//		For details on this method, see:
			// 			https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/lastIndexOf
			return array.indexOf(ary, value, fromIndex, true); // Number
		};

		array.forEach = function(/*Array|String*/arr, /*Function|String*/callback, /*Object?*/thisObject){
			//	summary:
			//		for every item in arr, callback is invoked. Return values are ignored.
			//		If you want to break out of the loop, consider using dojo.every() or dojo.some().
			//		forEach does not allow breaking out of the loop over the items in arr.
			//	arr:
			//		the array to iterate over. If a string, operates on individual characters.
			//	callback:
			//		a function is invoked with three arguments: item, index, and array
			//	thisObject:
			//		may be used to scope the call to callback
			//	description:
			//		This function corresponds to the JavaScript 1.6 Array.forEach() method, with one difference: when 
			//		run over sparse arrays, this implemenation passes the "holes" in the sparse array to
			//		the callback function with a value of undefined. JavaScript 1.6's forEach skips the holes in the sparse array.
			//		For more details, see:
			//			https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/forEach
			//	example:
			//	|	// log out all members of the array:
			//	|	dojo.forEach(
			//	|		[ "thinger", "blah", "howdy", 10 ],
			//	|		function(item){
			//	|			console.log(item);
			//	|		}
			//	|	);
			//	example:
			//	|	// log out the members and their indexes
			//	|	dojo.forEach(
			//	|		[ "thinger", "blah", "howdy", 10 ],
			//	|		function(item, idx, arr){
			//	|			console.log(item, "at index:", idx);
			//	|		}
			//	|	);
			//	example:
			//	|	// use a scoped object member as the callback
			//	|	
			//	|	var obj = {
			//	|		prefix: "logged via obj.callback:", 
			//	|		callback: function(item){
			//	|			console.log(this.prefix, item);
			//	|		}
			//	|	};
			//	|	
			//	|	// specifying the scope function executes the callback in that scope
			//	|	dojo.forEach(
			//	|		[ "thinger", "blah", "howdy", 10 ],
			//	|		obj.callback,
			//	|		obj
			//	|	);
			//	|	
			//	|	// alternately, we can accomplish the same thing with dojo.hitch()
			//	|	dojo.forEach(
			//	|		[ "thinger", "blah", "howdy", 10 ],
			//	|		dojo.hitch(obj, "callback")
			//	|	);

			// match the behavior of the built-in forEach WRT empty arrs
			if(!arr || !arr.length){ return; }

			// FIXME: there are several ways of handilng thisObject. Is
			// dojo.global always the default context?
			var _p = _getParts(arr, thisObject, callback); arr = _p[0];
			for(var i=0,l=arr.length; i<l; ++i){ 
				_p[2].call(_p[1], arr[i], i, arr);
			}
		};

		array.every = function(/*Array|String*/arr, /*Function|String*/callback, /*Object?*/thisObject){
			// summary:
			//		Determines whether or not every item in arr satisfies the
			//		condition implemented by callback.
			// arr:
			//		the array to iterate on. If a string, operates on individual characters.
			// callback:
			//		a function is invoked with three arguments: item, index,
			//		and array and returns true if the condition is met.
			// thisObject:
			//		may be used to scope the call to callback
			// description:
			//		This function corresponds to the JavaScript 1.6 Array.every() method, with one difference: when 
			//		run over sparse arrays, this implemenation passes the "holes" in the sparse array to
			//		the callback function with a value of undefined. JavaScript 1.6's every skips the holes in the sparse array.
			//		For more details, see:
			//			https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/every
			// example:
			//	|	// returns false
			//	|	dojo.every([1, 2, 3, 4], function(item){ return item>1; });
			// example:
			//	|	// returns true 
			//	|	dojo.every([1, 2, 3, 4], function(item){ return item>0; });
			return everyOrSome(true, arr, callback, thisObject); // Boolean
		},

		array.some = function(/*Array|String*/arr, /*Function|String*/callback, /*Object?*/thisObject){
			// summary:
			//		Determines whether or not any item in arr satisfies the
			//		condition implemented by callback.
			// arr:
			//		the array to iterate over. If a string, operates on individual characters.
			// callback:
			//		a function is invoked with three arguments: item, index,
			//		and array and returns true if the condition is met.
			// thisObject:
			//		may be used to scope the call to callback
			// description:
			//		This function corresponds to the JavaScript 1.6 Array.some() method, with one difference: when 
			//		run over sparse arrays, this implemenation passes the "holes" in the sparse array to
			//		the callback function with a value of undefined. JavaScript 1.6's some skips the holes in the sparse array.
			//		For more details, see:
			//			https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/some
			// example:
			//	|	// is true
			//	|	dojo.some([1, 2, 3, 4], function(item){ return item>1; });
			// example:
			//	|	// is false
			//	|	dojo.some([1, 2, 3, 4], function(item){ return item<1; });
			return everyOrSome(false, arr, callback, thisObject); // Boolean
		},

		array.map = function(/*Array|String*/arr, /*Function|String*/callback, /*Function?*/thisObject){
			// summary:
			//		applies callback to each element of arr and returns
			//		an Array with the results
			// arr:
			//		the array to iterate on. If a string, operates on
			//		individual characters.
			// callback:
			//		a function is invoked with three arguments, (item, index,
			//		array),  and returns a value
			// thisObject:
			//		may be used to scope the call to callback
			// description:
			//		This function corresponds to the JavaScript 1.6 Array.map() method, with one difference: when 
			//		run over sparse arrays, this implemenation passes the "holes" in the sparse array to
			//		the callback function with a value of undefined. JavaScript 1.6's map skips the holes in the sparse array.
			//		For more details, see:
			//			https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
			// example:
			//	|	// returns [2, 3, 4, 5]
			//	|	dojo.map([1, 2, 3, 4], function(item){ return item+1 });

			var _p = _getParts(arr, thisObject, callback); arr = _p[0];
			var outArr = (arguments[3] ? (new arguments[3]()) : []);
			for(var i=0,l=arr.length; i<l; ++i){
				outArr.push(_p[2].call(_p[1], arr[i], i, arr));
			}
			return outArr; // Array
		};

		array.filter = function(/*Array*/arr, /*Function|String*/callback, /*Object?*/thisObject){
			// summary:
			//		Returns a new Array with those items from arr that match the
			//		condition implemented by callback.
			// arr:
			//		the array to iterate over.
			// callback:
			//		a function that is invoked with three arguments (item,
			//		index, array). The return of this function is expected to
			//		be a boolean which determines whether the passed-in item
			//		will be included in the returned array.
			// thisObject:
			//		may be used to scope the call to callback
			// description:
			//		This function corresponds to the JavaScript 1.6 Array.filter() method, with one difference: when 
			//		run over sparse arrays, this implemenation passes the "holes" in the sparse array to
			//		the callback function with a value of undefined. JavaScript 1.6's filter skips the holes in the sparse array. 
			//		For more details, see:
			//			https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
			// example:
			//	|	// returns [2, 3, 4]
			//	|	dojo.filter([1, 2, 3, 4], function(item){ return item>1; });

			var _p = _getParts(arr, thisObject, callback); arr = _p[0];
			var outArr = [];
			for(var i=0,l=arr.length; i<l; ++i){
				if(_p[2].call(_p[1], arr[i], i, arr)){
					outArr.push(arr[i]);
				}
			}
			return outArr; // Array
		};

		//Register optional methods on blade if it happens to be loaded.
		run.modify(
		  "blade",
		  "blade-array",
		  ["blade"],
		  function (_) {
			// let's reuse what we already defined for compactness: it is a one-time deal
			array.forEach(["indexOf", "lastIndexOf", "forEach", "every", "some", "map", "filter"], function (name) {
				_.sharpen(name, array[name], true);
			});
		  }
		);

	
	return array;    
  }
);
