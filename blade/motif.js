/**
 * @license blade/motif Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
 * Available via the MIT, GPL or new BSD license.
 * see: http://github.com/jrburke/blade for details
 */
/*jslint  nomen: false, plusplus: false */
/*global require: false */

"use strict";

require.def("blade/motif", ["blade/object"], function (object) {

    //Add comment command
    //Fix unit test: something is wrong with it, says it passes, but
    //with attachData change, the string is actually different now.
    //TODO: for attachData, only generate a new ID when the data value changes,
    //and similarly, only attach the data one time per data value.
    //TODO: ALLOW && AND || in the getobject values?

    var motif, commands,
        ostring = Object.prototype.toString,
        startToken = '{',
        endToken = '}',
        rawHtmlToken = '^',
        argSeparator = ' ',
        //First character in an action cannot be something that
        //could be the start of a regular JS property name,
        //or an array indice indicator, [, or the HTML raw output
        //indicator, ^.
        propertyRegExp = /[_\[\^\w]/,
        startTagRegExp = /<\s*\w+/,
        templateCache = {},
        defaultFuncs = {},
        attachData = true,
        dataIdCounter = 0,
        dataRegistry = {};

    function isArray(it) {
        return ostring.call(it) === "[object Array]";
    }

    function getProp(parts, context) {
        var obj = context, i, p;
        for (i = 0; obj && (p = parts[i]); i++) {
            obj = (p in obj ? obj[p] : undefined);
        }
        return obj; // mixed
    }

    function strToInt(value) {
        return value ? parseInt(value, 10) : 0;
    }

    function getObject(name, data, options) {
        var brackRegExp = /\[([\w0-9\.'":]+)\]/,
            part = name,
            parent = data,
            match, pre, prop, obj, startIndex, endIndex, indices, result,
            parenStart, parenEnd, func;

        //First check for function call. Function must be globally visible.
        if ((parenStart = name.indexOf('(')) !== -1) {
            parenEnd = name.lastIndexOf(')');
            func = options.funcs[name.substring(0, parenStart)];
            return func(getObject(name.substring(parenStart + 1, parenEnd), data, options));
        }

        //Now handle regular object references, which could have [] notation.
        while ((match = brackRegExp.exec(part))) {
            prop = match[1].replace(/['"]/g, "");
            pre = part.substring(0, match.index);

            part = part.substring(match.index + match[0].length, part.length);
            if (part.indexOf('.') === 0) {
                part = part.substring(1, part.length);
            }

            obj = getProp(pre.split('.'), parent);
            if (prop.indexOf(":") !== -1) {
                //An array slice action
                indices = prop.split(':');
                startIndex = strToInt(indices[0]);
                endIndex = strToInt(indices[1]);

                if (!endIndex) {
                    obj = obj.slice(startIndex);
                } else {
                    obj = obj.slice(startIndex, endIndex);
                }
            } else {
                obj = obj[prop];
            }
            parent = obj;
        }

        if (!part) {
            result = parent;
        } else {
            result = getProp(part.split("."), parent);
        }

        return result;
    }

    commands = {
        '_default_': {
            doc: 'Property reference',
            action: function (args, data, options, children, render) {
                var value = args[0] ? getObject(args[0], data, options) : data,
                    i, text = '';
                if (value === null || value === undefined || (isArray(value) && !value.length)) {
                    return '';
                } else if (children) {
                    if (isArray(value)) {
                        for (i = 0; i < value.length; i++) {
                            text += render(children, value[i], options);
                        }
                    } else {
                        text = render(children, value, options);
                    }
                } else {
                    text = value;
                }
                return text;
            }
        },
        '!': {
            doc: 'Not',
            action: function (args, data, options, children, render) {
                var value = getObject(args[0], data, options);
                if (children && !value) {
                    return render(children, data, options);
                }
                return '';
            }
        },
        '@': {
            doc: 'Template reference',
            action: function (args, data, options, children, render) {
                var compiled = options.templates[args[0]];
                data = getObject(args[0], data, options);
                if (!compiled) {
                    throw new Error('blade/motif: no template with name: ' + args[0]);
                }
                return render(compiled, data, options);
            }
        },
        '.': {
            doc: 'Variable declaration',
            action: function (args, data, options, children, render) {
                data[args[0]] = getObject(args[1], data, options);
                //TODO: allow definining a variable then doing a block with
                //that variable.
                return '';
            }
        }
    };

    motif = function (text, data, options) {
        if (typeof text === 'string') {
            text = motif.compile(text, options);
        }
        return motif.render(text, data, options);
    };

    motif.htmlEscape = function (text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    };

    function compile(text, options) {
        var compiled = [],
            start = 0,
            useRawHtml = false,
            segment, index, match, tag, command, args, lastArg, lastChar, children;

        while ((index = text.indexOf(options.startToken, start)) !== -1) {
            //Output any string that is before the template tag start
            if (index !== start) {
                compiled.push(text.substring(start, index));
            }

            //Find the end of the token
            segment = text.substring(index);
            match = options.endRegExp.exec(segment);
            if (!match) {
                //Just a loose start thing could be a regular punctuation.
                compiled.push(segment);
                return compiled;
            } else {
                //Command Match!

                //Increment start past the match.
                start = index + match[0].length;

                //Pull out the command
                tag = text.substring(index + options.startToken.length, index + match[0].length - options.endToken.length).trim();
                command = tag.charAt(0);

                if (command && !options.propertyRegExp.test(command)) {
                    //Have a template command
                    tag = tag.substring(1).trim();
                } else {
                    command = '_default_';
                    //Command could contain just the raw HTML indicator.
                    useRawHtml = (command === options.rawHtmlToken);
                }

                //Allow for raw HTML output, but it is not the default.
                if ((useRawHtml = tag.indexOf(options.rawHtmlToken) === 0)) {
                    tag = tag.substring(options.rawHtmlToken.length, tag.length);
                }

                args = tag.split(options.argSeparator);
                lastArg = args[args.length - 1];
                lastChar = lastArg.charAt(lastArg.length - 1);
                children = null;

                //If last arg ends with a [ it means a block element.
                if (lastChar === '[') {
                    //Adjust the last arg to not have the block character.
                    args[args.length - 1] = lastArg.substring(0, lastArg.length - 1);

                    //Process the block
                    children = compile(text.substring(start), options);

                    //Skip the part of the string that is part of the child compile.
                    start += children.templateEnd;
                } else if (command === ']') {
                    //End of a block. End this recursion, let the parent know
                    //the place where parsing stopped.
                    compiled.templateEnd = start;
                    return compiled;
                }

                //If this defines a template, save it off
                if (command === '+') {
                    options.templates[args[0]] = children;
                } else {
                    compiled.push({
                        action: options.commands[command].action,
                        useRawHtml: useRawHtml,
                        args: args,
                        children: children
                    });
                }
            }
        }

        if (start !== text.length - 1) {
            compiled.push(text.substring(start, text.length));
        }

        return compiled;
    }

    motif.compile = function (text, options) {
        //Mix in defaults
        options = options || {};
        object.mixin(options, {
            startToken: startToken,
            endToken: endToken,
            rawHtmlToken: rawHtmlToken,
            propertyRegExp: propertyRegExp,
            commands: commands,
            argSeparator: argSeparator,
            templates: templateCache
        });

        options.endRegExp = new RegExp('[^\\r\\n]*?' + endToken);

        return compile(text, options);
    };

    function render(compiled, data, options) {
        var text = '', i, dataId;
        if (typeof compiled === 'string') {
            text = compiled;
        } else if (isArray(compiled)) {
            for (i = 0; i < compiled.length; i++) {
                text += render(compiled[i], data, options);
            }
        } else {
            //A template command to run.
            text = compiled.action(compiled.args, data, options, compiled.children, render);
            if (!text) {
                text = '';
            } else if (!compiled.useRawHtml && !compiled.children) {
                //Only html escape commands that are not block actions.
                text = motif.htmlEscape(text.toString());
            }
        }

        if (options.attachData) {
            if (startTagRegExp.test(text)) {
                dataId = 'id' + (dataIdCounter++);
                text = text.replace(startTagRegExp, '$& data-blade-motif="' + dataId + '" ');
                dataRegistry[dataId] = data;
            }
        }

        return text;
    }

    /**
     * Render a compiled template.
     *
     * @param {Array} compiled a compiled template
     * @param {Object} data the data to use in the template
     * @param {Object} options options for rendering. They include:
     * @param {Object} templates a cache of compiled templates that might be
     * referenced by the primary template
     * @param {Object} options.funcs a set of functions that might be used
     * by the template(s). Each property on this object is a name of a function
     * that may show up in the templates, and the value should be the function
     * definition.
     * @returns {String} the rendered template.
     */
    motif.render = function (compiled, data, options) {
        //Normalize options, filling in defaults.
        options = options || {};
        object.mixin(options, {
            templates: templateCache,
            funcs: defaultFuncs,
            attachData: attachData
        });

        return render(compiled, data, options);
    };

    /**
     * Gets the data bound to a particular rendered template.
     * @param {String} dataId the data ID. It can be fetched from the
     * data-bladeMotif attribute on a rendered template.
     * @returns {Object} the bound data. Can return undefined if there is
     * no data stored with that ID.
     */
    motif.data = function (dataId) {
        return dataRegistry[dataId];
    };

    /**
     * Removes some data that was bound to a rendered template.
     * @param {String} dataId the data ID. It can be fetched from the
     * data-bladeMotif attribute on a rendered template.
     */
    motif.removeData = function (dataId) {
        delete dataRegistry[dataId];
    };

    /**
     * Gets an object given a string representation. For example,
     * motif.getObject('foo.bar', baz) will return the baz.foo.bar value.
     * 
     * @param {String} name the string value to fetch. The following formats
     * are allowed: 'foo.bar', 'foo["bar"]', 'foo[0]', 'foo[2:6]'. The last one
     * will return an array subset. Functions are also supported: 'doSomething(foo.bar)'
     * but the doSomething function needs to be defined in the options.funcs
     * property, as options.funcs.doSomething = function (){}
     *
     * @param {Object} data the object to use as the basis for the object lookup.
     *
     * @param {Object} options. Options to the lookup. The only supported option
     * at this time is options.func, and object defining functions can could be
     * called.
     *
     * @returns {Object} it could return null if the name is not found off the data
     */
    motif.getObject = getObject;

    /**
     * Gets a compiled template from a template cache.
     * @param {String} id the template ID
     * @param {Object} [options] optional options object with a 'templates'
     * property that contains some cached templates. If provided, a matching
     * cache value for the ID will be used from options.templates, otherwise,
     * the ID will be used to look up in the global blade/motif template cache.
     * @returns {Object} a compiled template. It could return undefined if
     * not match is found.
     */
    motif.fromTemplateCache = function (id, options) {
        var cached = templateCache[id];
        if (options && options.templates && options.templates[id]) {
            cached = options.templates[id]
        }
        return cached;
    }

    return motif;
});

