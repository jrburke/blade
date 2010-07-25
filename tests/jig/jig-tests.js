'use strict';
/*global require: false, doh: false */
function removeEol(text) {
    return text.replace(/[\r\n]/g, '').replace(/( )+/g, ' ');
}

/**
 * This funciton removes data-blade-jig attributes, condenses multiple
 * whitespaces down to one space, and removes any line returns/newlines
 * that could cause differencs when tests are run on different platforms.
 */
function compareNormalizedText(t, d, testFile, result) {
    require(['text!' + testFile], function (testText) {
        doh.is(removeEol(testText), removeEol(
                                      //Remove data-blade-jig attributes
                                      result.replace(/data-blade-jig="id[\d]+"/g, '')
                                      //Make sure the closing bracket for a tag
                                      //does not have leading webspace, usually
                                      //due to removing the data-blade-jig attribute
                                      .replace(/([\w"])( )+>/g, '$1>')
        ));
        d.callback(true);
    });
}

require({
        baseUrl: "./",
        paths: {
            "blade": "../../blade",
            "require": "../../require"
        }
    },
    ["require", "blade/jig", "blade/object"],
    function (require, jig, object) {

        doh.register(
            "jig",
            [
                {
                    name: 'simple',
                    timeout: 2000,
                    runTest: function (t) {
                        var d = new doh.Deferred();
                        require(['text!template1.html'], function (text) {
                            var rendered = jig(text, {
                                    some: {
                                        thing: {
                                            name: 'Some <> Thing',
                                            color: 'blue',
                                            sizes: [
                                                'small',
                                                'medium',
                                                'large'
                                            ]
                                        }
                                    },
                                    link: '<a href="#link">Link</a>'
                                }, {
                                funcs: {
                                    'rev': function (val) {
                                        return val.split('').reverse().join('');
                                    }
                                }
                            });
                            compareNormalizedText(t, d, 'template1-rendered.html', rendered);
                        });
                        return d;
                    }
                },

                {
                    name: 'func',
                    timeout: 2000,
                    runTest: function func(t) {
                        var d = new doh.Deferred();
                        require(['text!func.html'], function (text) {
                            compareNormalizedText(t, d, 'func-rendered.html', jig(text, {
                            }, {
                                funcs: {
                                    getData: function (name) {
                                        return {
                                            name: name || 'data',
                                            options: [
                                                "one",
                                                "two",
                                                "three"
                                            ]
                                        }
                                    }
                                }
                            }));
                        });
                        return d;
                    }
                }

//warn if array slice is not done on an array?

//Test checking an array index then trying to use that, suggest is() instead

//Test calling a function, then accessing property, array member, array splice, subscript property name

//Test the data binding better?

//Test ability to scan DOM for matching class=template nodes: (only in HTML page)?

//Test all the built in functions

//Allow script caching?

//Test not, template ref, variable declaration, if/else

//Test default value, _ and just {}

//multiline comments work?

//Test adding functions to default set via .addFn

//Test script tag templates, set class and type, see if IE works with just type.
//Test script with multiple templates in it, via the {+ syntax}
            ]
        );
        doh.run();
    }
);
