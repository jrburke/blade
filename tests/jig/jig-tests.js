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
        t.is(removeEol(testText), removeEol(
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
        baseUrl: './',
        paths: {
            'blade': '../../blade',
            'require': '../../require'
        }
    },
    ['require', 'blade/jig', 'blade/object'],
    function (require, jig, object) {

        doh.register(
            'jig',
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
                                    fn: {
                                        'rev': function (val) {
                                            return val.split('').reverse().join('');
                                        }
                                    }
                                }
                            );
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
                            //add a function to the default set of functions
                            jig.addFn({
                                getColor: function () {
                                    return 'blue';
                                }
                            });

                            //Render a template
                            compareNormalizedText(t, d, 'func-rendered.html', jig(text, {
                            }, {
                                fn: {
                                    getData: function (name) {
                                        return {
                                            name: name || 'data',
                                            options: [
                                                'one',
                                                'two',
                                                'three'
                                            ]
                                        };
                                    }
                                }
                            }));
                        });
                        return d;
                    }
                },

                {
                    name: 'builtin',
                    timeout: 2000,
                    runTest: function builtin(t) {
                        var d = new doh.Deferred();
                        require(['text!builtin.html'], function (text) {
                            //Render a template
                            compareNormalizedText(t, d, 'builtin-rendered.html', jig(text, {
                                args: {
                                    fortyone: 41,
                                    fortytwo: 42,
                                    fortythree: 43,
                                    something: 'something',
                                    nothing: null
                                }
                            }));
                        });
                        return d;
                    }
                },

                {
                    name: 'flow',
                    timeout: 2000,
                    runTest: function builtin(t) {
                        var d = new doh.Deferred();
                        require(['text!flow.html'], function (text) {
                            //Render a template
                            compareNormalizedText(t, d, 'flow-rendered.html', jig(text, {
                                args: [
                                    'foo',
                                    ['bar', 'baz'],
                                    {
                                        name: 'fuz'
                                    }
                                ]
                            }, {
                                fn: {
                                    isString: function (val) {
                                        return typeof val === 'string';
                                    },
                                    isArray: function (val) {
                                        return Object.prototype.toString.call(val) === '[object Array]';
                                    }
                                }
                            }));
                        });
                        return d;
                    }
                }

//Test the data binding better, only in HTML page)

//Test script tag templates, set class and type, see if IE works with just type.
            ]
        );
        doh.run();
    }
);
