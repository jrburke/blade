require({
        baseUrl: "./",
        paths: {
            "blade": "../../blade",
            "require": "../../require"
        }
    },
    ["require", "blade/dispatch", "blade/object"],
    function(require, dispatch, object) {

        doh.register(
            "dispatch",
            [
                function pubsub(t) {
                    //Test the "global" pub/subscribe mechanism
                    var count = 0;

                    //simple event.
                    dispatch.on("foo", function (evt) {
                        count += 1;
                        t.is("bar", evt.args[0]);
                    })
                    dispatch.send("foo", "bar");
                    t.is(1, count);
                    count = 0;
                },

                function dispatchDefault(t) {
                    //Test eventing with default actions, stopping propagations
                    //stopImmediatePropagation and unregistering
                    var unregs = [], count = 0;
                    unregs.push(dispatch.on("halfway", function (evt) {
                        count += 1;
                    }));
                    unregs.push(dispatch.on("halfway", function (evt) {
                        count += 1;
                        evt.stopImmediatePropagation();
                    }));
                    unregs.push(dispatch.on("halfway", function (evt) {
                        count += 1;
                    }));
                    dispatch.send("halfway");
                    t.is(2, count);
                    count = 0;
                    unregs.forEach(function (unreg) {
                        unreg();
                    });
                    dispatch.send("halfway");
                    t.is(0, count);

                    //default actions
                    var shoutEvent = {
                        name: "shout",
                        defaultAction: function () {
                            count += 1;
                        }
                    }
                    dispatch.on("shout", function (evt) {
                        count += 1;
                    })
                    dispatch.send(shoutEvent);
                    t.is(2, count);
                    count = 0;
                    dispatch.on("shout", function (evt) {
                        evt.preventDefault();
                    });
                    dispatch.send(shoutEvent);
                    t.is(1, count);
                    count = 0;
                },

                function catchall(t) {
                    //Test the use of catch alls
                    var proxy = object.create(dispatch), expected, count = 0;
                    proxy._dispatchCatchAll = function (prop) {
                        count += 1;
                        t.is(expected, prop);
                        if (prop === "color") {
                            return "green";
                        }
                        return prop;
                    };
                
                    expected = "size";
                    t.is("size", proxy.send("size"));
                    expected = "color";
                    t.is("green", proxy.send("color"));
                    t.is(2, count);
                    count = 0;
                },

                function getset(t) {
                    //Test the getters and setters
                    
                    //Test calling a function, both get and set

                    //Test getting current value while registering for future
                    //changes.
                    
                },

                function aop(t) {
                    //simulate some aop things.
                    //before
                    
                    //after
                    
                    //around
                    
                }
            ]
        );
        doh.run();
    }
);
