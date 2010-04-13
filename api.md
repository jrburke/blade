#Blade API

This is a sketch for the Blade API. Types will be specified before the argument in type: syntax and optional arguments are followed by a question mark after the type.

All methods specified in the API docs will have two variants, the bladed, chainable syntax and the raw syntax. The raw function syntax will be faster than the bladed one, but the subject is passed as the first argument to the raw syntax, and the raw syntax is usually not chainable.

For example, for an imaginary method that sets a color on a node, the bladed syntax will be:
    blade(node).color("red")

The raw syntax will be:

    color(node, "red");

Both would only work if you specified color as a module dependency:

    require(["blade", "color"], function(b, color) {
      var node = document.getElementById("someId");
      b(node).color("red");
      color(node, "red");
    })

If you wish to get the unbladed subject out of a blade, then use the "o" property:
    var domNodeType = b(node).color("red").o.nodeType;

##API components

* [blade](api/blade.md)
