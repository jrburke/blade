# blade/jig

* [Basics](#basics)

# <a name="basics">Basics</a>

blade/jig is a templating module. It allows creating strings of data that are the result of merging a text string with a data object. Its main attributes:

* Keep syntax to a minimum
* Focus on more declarative templates instead of rich flow control logic.
* Support nested property access in a way that looks natural to JavaScript
* Allow calling functions that can extend the usefulness
* Array iteration is a common, default operation that changes the current data context
* Allow an easy way to attach data used to generate the template to the template sections
* Avoid the use of eval() and with when evaluating the templates. Those JavaScript features can be hazardous and not allowed in some JavaScript environments.

Here is an example template:

    {/This is a comment, it will not appear in the rendered template}
    {/Note that multi-line comments inside a comment tag are not allowed}

    <h1>{some.thing.name}</h1>
    {/Define a variable called thing via the dot command}
    {.thing some.thing}

    {/Call a function that will be available as part of the jig call}
    <p>{date(thing.timestamp)}</p>
    Color: {thing.color}
    <ul>
        {/Blocks are indicated by square brackets inside the braces}
        {thing.sizes [}
            {/Since thing.sizes is an array, this block}
            {/will be repeated for each item in the array.}
            {/The empty braces below will print out the current array item}
            {/You can also just use _ inside the braces to indicate the}
            {/array item -- this is useful for function calls}
            <li>{}</li>
        {]}
    </ul>

    {/Simple flow control is possible}
    {thing.stats [}
        {/Context in this block is now thing.stats, so the height ref}
        {/below is really thing.stats.height}
        <ul>
            <li>Height: {height}</li>
            <li>Width: {width}</li>
        </ul>
    {] thing.defaultMessage [}
        {/This is an else if block. Context in here is now}
        {/thing.defaultMessage, but still have access to top level}
        {/scope for the template}
        Thing thing with color {thing.color} has default message: {}
    {] [}
        {/This is an else block}
        No stats or default message available
    {]}

    {/By default all tags output escaped HTML. Use the caret command}
    {/to avoid the unescaping}
    {^link}


If this object is applied to this template, via the jig() function:

    //Grab a hold of the jig function.
    //If using RequireJS, do:
    //require(['blade/jig'], function (jig) { jig(); });
    //Otherwise, var jig = blade.jig;

    var renderedText = jig(
        //templateString is the string of text for the template
        templateString,

        //Second arg is the data object to use in the template
        {
            some: {
                thing: {
                    name: 'Some <> Thing',
                    color: 'blue',
                    timestamp: 1274553921508,
                    sizes: [
                        'small',
                        'medium',
                        'large'
                    ],
                    stats: {
                        height: '2 m',
                        width: '4 m'
                    }
                }
            },
            link: '<a href="#link">Link</a>'
        },

        //Third arg is an options argument, with one option being a set
        //of functions to allow in the template
        {
            fn: {
                'date': function (timestamp) {
                    return (new Date(timestamp)).toString();
                }
            }
        }
    );

It results in the following generated text (real results may contain more whitespace):

    <h1>Some &lt;&gt; Thing</h1>
    <p>Sat May 22 2010 11:45:21 GMT-0700 (PDT)</p>
    Color: blue
    <ul>
        <li>small</li>
        <li>medium</li>
        <li>large</li>
    </ul>
    <ul>
        <li>Height: 2 m</li>
        <li>Width: 4 m</li>
    </ul>
    
    <a href="#link">Link</a>

