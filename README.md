Blade
=====

Blade is a JavaScript toolkit experiment. Blade is focused on providing small reusable modules that are focused on making web applications in the browser easier. One of its primary features is allowing more functional modules that can be mixed in to a Blade object to allow chained object.verb() calls. So you can choose if you want raw functional speed without shared state or more convenient chained object.verb() syntax. The core Blade object will allow you to create your own approximation of a Domain Specific Language (DSL) that allows you to create your own "blade" that you can use to add your own domain-specific chainable methods to it.

It steals a lot from the Dojo Toolkit, but uses these guiding principles:

* Terse code
* Use a standalone module loader, RequireJS
* object.verb(…) or verb(object,…)
* Mobile is more important than Internet Explorer
* HTML5 support is standard
* Use advanced features where possible
* JQuery API matching
* Focus on the code, not the tooling
* Provide BSD licensed, CLA-backed code

The initial code in the repo does **not** fully reflect the principles above yet, it is just hacked together at the moment, more as an experiment on how best to express these choices. Also note that these choices may change over time as the experiment progresses.

Terse code
---------------------------
Terseness in code is desirable. Library modules should aim to be small and modular. Method names should be short, but still expressive. Expressiveness should win over terseness if there is a conflict.

In keeping with trying to make things terse, modules are encouraged to define a function as their top level entry point, instead of it being a plain object with a set of functions. For instance, instead of doing blade.node.create(), it is just blade.node()

Use a standalone module loader, RequireJS
--------------------------
[RequireJS](http://requirejs.org) use a terse syntax to define modules, allows multiple versions of a module in a page, works with how browsers work (no sync XHR calls or server process to map modules) and allows for modifying other modules (an extension mechanism). It also forces you to keep things in a defined scope. This helps for performance reasons and terse programming, and helps you know the explicit dependencies for a module.

object.verb or verb(object)
---------------------------
object.verb is normally more readable, but global namespace pollution, including modifying native prototypes, is not scalable. So blade uses the blade function, blade() to allow you to call the library functions as object.verb():

    blade("<h2>${name}</h2>").template({
        name: "First Point"
    });

blade() wraps its argument in an object that defines all the methods available from blade, and normally the methods are chainable. You can get the original object back by using the "o" property:

    require(
        ["blade", "blade/node", "blade/attr", "blade/style"],
        function (b, node, attr, style) {
            b("div") //Wraps the string "div" in the blade methods
              .node()  //Converts the string to a node. The internal object is a node now instead of the "div" string.
              .attr("id", "main") //expects a DOM node, so converts "div" to be a new div node, then sets the id to "of" for the div node.
              .style("display", "none") //set the display style to none to hide it.
              .place(_.body()) //append the node to the document body.
              .o //gives back the raw DOM node.
        }
    );

Blade will use a kind of type inference to know how to convert the bladed object to the right type. Normally this means converting a bladed string into a DOM node or a doing a DOM selection. For instance:

    blade("body div").trim(); //treats the bladed object as a string
    blade("body div").attr("title", "new") //calls DOM selector engine, then calls attr() for each node in the node list.
    blade("<h2>${name}</h2>").template({
        name: "First Point"
    }) //bladed object treated like string.
    .attr("title", "First Point"); //then converted to a DOM node and its title attribute is set.

If you prefer not to use the chainable syntax, then the plain, verb(object) syntax is also available. However, this syntax may not do the full type conversion that blade() does:

    require(
        ["blade/node", "blade/attr", "blade/style"],
        function (node, attr, style) {
            var n = node("div");
            attr(n, "id", "main");
            style(n, "display", "none");
            place(n, document.body);
       }
    );


Mobile is more important than Internet Explorer
-----------------------------------------------
Most of the browsers are converging on a base level of functionality through similar APIs, except for Internet Explorer, at least below IE 9. IE does not support things like addEventListener and still has problems with circular reference leaks. The code to accommodate IE, particularly IE 6 and 7, bloats a library.

At the same time, mobile is becoming more important, and for mobile, it is primarily WebKit-based. The default structure of blade will favor mobile and standardized browsers, but provide a way, through RequireJS modifiers, to load in extra modules that deal with IE's quirkiness.

This does not mean that browser detection will be used to configure the IE quirkiness. An IE detect will be used to see if those modifiers should be loaded, but each of those IE modifier modules will use capability detection to know for sure if it should take priority over the default module. Because the usual reason to do capability detection is to fix an issue in IE.

There will be a standard blade js file that is built with IE support bundled, but you will have to make a conscious choice to reference it. There is extra code bulk to support IE, and you should be aware of its costs.

HTML5 support is standard
-------------------------
OK, this one is just buzzword support. Right now I think it means just using data- prefixes for DOM attributes that are custom to the library.

Use advanced features where possible
------------------------------------
Similar HTML5 support -- use things that might not be in the HTML5 spec but still in wide enough use for mobile, like CSS animations.

In addition, the following JavaScript/ECMAScript functionality is assumed to be already supported natively in the browser:

* JSON
* Array extras

An ECMAScript 5 compatibility shim may be provided to bootstrap some of those functions for browsers that may not support them.

JQuery API matching
-------------------
JQuery is the defacto API standard for DOM manipulation. Blade should match JQuery's API as much as possible, where it makes sense. The goal is not 100% compatibility, but ease of developer use, to know how to get up and going with blade faster.

Focus on innovating the code, not the tooling
---------------------------------------------
Blade is concerned about making an nice, small API that is easily relatable to the most number of developers. Others should feel comfortable helping and extending the codebase. This means choosing coding practices that are recognizable to the most amount of developers, specifically:

* Using JSLint for all the code, including following the recommended style of 4 spaces for indents.
* Using JSDoc for code documentation.

Provide BSD licensed, CLA-backed code
-----------------------------------
I still want BSD licensed, CLA-backed code, so I would still like all contributors to sign the Dojo CLA before contributing. Additional bi- or tri-licensing might happen, but CLA-backed BSD is a minimum.
