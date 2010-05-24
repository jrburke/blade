require({
        baseUrl: "./",
        paths: {
            "blade": "../../blade",
            "require": "../../require"
        }
    },
    ["require", "blade/motif", "blade/object"],
    function(require, motif, object) {

        doh.register(
            "motif",
            [
                function simple(t) {
                    require(['text!template1.html'], function (text) {
                        var rendered = motif(text, {
                            funcs: {
                                'date': function (timestamp) {
                                    return (new Date(timestamp)).toString();
                                }
                            },
                            data: {
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
                            }
                        });
                        t.is('<h1>Some &lt;&gt; Thing</h1> \n\n<p>Sat May 22 2010 11:45:21 GMT-0700 (PST)</p>\nColor: blue\n<ul>\n    \n        <li>small</li>\n    \n        <li>medium</li>\n    \n        <li>large</li>\n    \n</ul>\n<a href="#link">Link</a>', rendered);
                    });
                }
            ]
        );
        doh.run();
    }
);
