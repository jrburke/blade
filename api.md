#Blade API

This is a sketch for the Blade API. Types will be specified before the argument in type: syntax and optional arguments are followed by a question mark after the type.

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

##API components

* [blade](api/blade.md)
