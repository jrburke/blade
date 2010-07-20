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
function compareNormalizedText(t, result, testFile) {
    require(['text!' + testFile], function (testText) {
        t.is(removeEol(testText), removeEol(
                                      //Remove data-blade-jig attributes
                                      result.replace(/data-blade-jig="id[\d]+"/g, '')
                                      //Make sure the closing bracket for a tag
                                      //does not have leading webspace, usually
                                      //due to removing the data-blade-jig attribute
                                      .replace(/([\w"])( )+>/g, '$1>')
        ));
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
                function simple(t) {
                    require(['text!template1.html'], function (text) {
                        var rendered = jig(text, {
                                some: {
                                    thing: {
                                        name: 'Some <> Thing',
                                        color: 'blue',
                                        timestamp: 1274553921508,
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
                                'date': function (timestamp) {
                                    return (new Date(timestamp)).toString();
                                }
                            }
                        });
                        compareNormalizedText(t, rendered, 'template1-rendered.html');
                    });
                },

//Test checking an array index then trying to use that, suggest is() instead

//Test calling a function, then accessing property, array member, array splice, subscript property name

//Test the data binding better?

//Add ability to scan DOM for matching class=template nodes?

//Test all the built in functions

//Allow script caching?

//Test not, template ref, variable declaration, if/else

//Test default value, _ and just {}

//multiline comments work?

//Test adding functions to default set via .addFn

            ]
        );
        doh.run();
    }
);
