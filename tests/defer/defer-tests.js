require({
        baseUrl: "./",
        paths: {
            "blade": "../../blade",
            "require": "../../require"
        }
    },
    ["require", "blade/defer"],
    function(require, defer) {

        doh.register(
            "defer",
            [
                function deferSimple(t) {
                    //Test the use of deferreds/immutable callbacks/promises
                    var count = 0,
                        expected,
                        deferred = defer(),
                        promise = deferred.listener,
                        listener = {
                            onOk: function (value) {
                                t.is(expected, value);
                                count += 1;
                                //attempt to modify value
                                return "foo";
                            }
                        };
                    
                    promise.ok(listener, "onOk");

                    expected = "finished baking";
                    deferred.send("ok", expected);

                    t.is(1, count);
                    count = 0;

                    //listen after result is found.
                    promise.ok(function (value) {
                        count += 2;
                        t.is(expected, value);
                    })
                    t.is(2, count);
                    count = 0;

                    //TODO: test cancel
                    
                    //TODO: test adding other events
                }
            ]
        );
        doh.run();
    }
);
