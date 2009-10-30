Blade
=====

Blade is an experiment in a new JavaScript toolkit. It steals a lot from the Dojo Toolkit, but uses these guiding principles:

* Smallest possible namespace
* Use a standalone module loader, runjs
* object.verb(…) or verb(object,…)
* Modules should define a function
* Mobile is more important than Internet Explorer
* HTML5 support is standard
* Use advanced features where possible
* JQuery API matching
* Focus on the code, not the tooling
* Provide BSD licensed, CLA-safe code

The initial code in the repo does **not** fully reflect the principles above yet, it is just hacked together at the moment, more as an experiment on how best to express these choices. Also note that these choices may change over time as the experiment progresses.

Smallest possible namespace
---------------------------
Terseness in code is desirable, so blade uses the smallest namespace possible: _, the underscore. But for fanciful reasons, it will be called a blade, because blade sounds cooler than underscore or underbar.

runjs as the module loader
--------------------------
runjs use a terse syntax to define modules, allows multiple versions of a module in a page, works with how browsers work (no sync XHR calls or server process to map modules) and allows for modifying other modules (an extension mechanism). It also forces you to keep things in a defined scope. This helps for performance reasons and helps you know the explicit dependencies for a module.

Here is an example of the syntax, a simplified version of the _.node module:

    run(
        "_.node",
        Function,
        [_.attr],
        function (attr) {
            //return the function that defines _.node
            return function(id) {
               return document.byId(id);
            }
        }
    });

object.verb or verb(object)
---------------------------
object.verb is normally more readable, but global namespace pollution, including modifying native prototypes, is not scalable. So blade uses the blade function, _() to allow you to call the library functions as object.verb():

    _("<h2>${name}</h2>").template({
        name: "First Point"
    });

Basically, _() wraps its argument in a function that defines all the methods available from blade, and normally the methods are chainable. You can get the original object back by calling _() again:

    run(
        ["_", "_.node", "_.attr", "_.style"],
        function (_, node, attr, style) {
            _("div") //Wraps the string "div" in the blade methods
              .node()  //Converts the string to a node. The internal object is a node now instead of the "div" string.
              .attr("id", "main") //expects a DOM node, so converts "div" to be a new div node, then sets the id to "of" for the div node.
              .style("display", "none") //set the display style to none to hide it.
              .place(_.body()) //append the node to the document body.
              ._() //gives back the raw DOM node.
        }
    );

Blade will use a kind of type inference to know how to convert the bladed object to the right type. Normally this means converting a bladed string into a DOM node or a doing a DOM selection. For instance:

    _("body div").trim(); //treats the bladed object as a string
    _("body div").attr("title", "new") //calls DOM selector engine, then calls attr() for each node in the node list.
    _("<h2>${name}</h2>").template({
        name: "First Point"
    }) //bladed object treated like string.
    .attr("title", "First Point"); //then converted to a DOM node and its title attribute is set.

If you prefer not to use the chainable syntax, then the plain, verb(object) syntax is also available. However, this syntax may not do the full type conversion that _() does:

    run(
        ["_", "_.node", "_.attr", "_.style"],
        function (_, node, attr, style) {
            var n = node("div");
            attr(n, "id", "main");
            style(n, "display", "none");
            place(n, _.body());
       }
    );


Modules should define a function
--------------------------------
In keeping with trying to make things terse, modules should define a function as their top level entry point, instead of it being a plain object with a set of functions. For instance, instead of doing _.node.create(), it is just _.node()

Mobile is more important than Internet Explorer
-----------------------------------------------
Most of the browsers are converging on a base level of functionality through similar APIs, except for Internet Explorer. IE does not support things like addEventListener and still has problems with circular reference leaks. The code to accommodate IE, particularly IE 6 and 7, bloats a library.

At the same time, mobile is becoming more important, and for mobile, it is primarily WebKit-based. The default structure of blade will favor mobile and standardized browsers, but provide a way, through runjs's modifiers, to load in extra modules that deal with IE's quirkiness.

This does not mean that browser detection will be used to configure the IE quirkiness. An IE detect will be used to see if those modifiers should be loaded, but each of those IE modifier modules will use capability detection to know for sure if it should take priority over the default module. Because the usual reason to do capability detection is to fix an issue in IE.

There will be a standard blade js file that is built with IE support bundled, but you will have to make a conscious choice to reference it. There is extra code bulk to support IE, and you should be aware of its costs.

HTML5 support is standard
-------------------------
OK, this one is just buzzword support. Right now I think it means just using data- prefixes for DOM attributes that are custom to the library.

Use advanced features where possible
------------------------------------
Similar HTML5 support -- use things that might not be in the HTML5 spec but still in wide enough use for mobile, like CSS animations.

JQuery API matching
-------------------
JQuery is the defacto API standard for DOM manipulation. Blade should match JQuery's API as much as possible, where it makes sense. The goal is not 100% compatibility, but ease of developer use, to know how to get up and going with blade faster.

Focus on innovating the code, not the tooling
---------------------------------------------
Blade is concerned about making an nice, small API that is easily relatable to the most number of developers. Others should feel comfortable helping and extending the codebase. This means choosing coding practices that are recognizable to the most amount of developers, specifically:
- Using JSLint for all the code, including following the recommended style of 4 spaces for indents.
- Using JSDoc for code documentation.

Provide BSD licensed, CLA-safe code
-----------------------------------
I still want BSD licensed, CLA-backed code, so I would still like all contributors to sign the Dojo CLA before contributing.

