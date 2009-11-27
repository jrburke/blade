#blade

These methods are core to blade. It defines the primary entry point into allowing blade's subject.verb() coding style.

All methods specified in the API docs will have two variants, the bladed, chainable syntax and the raw syntax. The raw function syntax will be faster than the bladed one, but the subject is passed as the first argument to the raw syntax, and the raw syntax is usually not chainable.

For example, for an imaginary method that sets a color on a node, the bladed syntax will be:
    _(node).color("red")

The raw syntax will be:

    color(node, "red");

Both would only work if you specified color as a module dependency:

    run(["_", "color"], function(_, color) {
      var node = document.getElementById("someId");
      _(node).color("red");
      color(node, "red");
    })

If you wish to get the unbladed subject out of a blade, then just call _() with no arguments:
    var domNodeType = _(node).color("red")._().nodeType;

###blade(Object:subject, Object?:parent)

commonly aliased as _

The blade function, _() is the main entry point into the chainable operations. The subject can be of any type, but only certain chainable methods will work with certain types. Chainable methods that want to use a DOM node or a NodeList of DOM nodes can convert string subjects into the appropriate DOM object automatically. 

##Language Constructs

Helpers for the JavaScript language:

### _.sharpen(String:name, Function:func, Boolean?||Function?:allowChaining)
The function to call to add a new bladed method. Give the name of the new function, the func function definition, and specify if chaining is allowed. If chaining is allowed, then the return value of the function will be bladed and then returned, instead of the raw function's return value. If allowChaining is a function, the raw return value will be given to the allowChaining function, and if true is returned from the allowChaining function, then the return value will be bladed nd the parent of the blade will be set to the previously bladed value in the chain.

    //Set up the color method above:
    _.sharpen(
        "color",
        function(node, value) {
          if (value) {
            node.style.color = value;
            return node;
          } else {
            return node.style.color;
          }
        },
        function(ret) {
          //If return value is a node, then allow chaining.
          return !!ret.nodeType;
        }
    );

    //Now call the bladed function. Since this call to color does
    //not return a value, then the bladed node will be returned, allowing
    //a chained attr() call that operates on the node.
    _(node).color("red").attr("title", "hello");
    
    //In this example, a raw, non-bladed color value is returned.
    var colorValue = _(node).color();

