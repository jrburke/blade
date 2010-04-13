/*jslint */
/*global require: false */
"use strict";

require.def("Base", function () {

    var counter = 1,
        Base = function () {
            this.init();
            this.isAnimal = true;
        };

    Base.prototype = {
        init: function () {
            this.baseCounter = counter;
            counter += 1;
        },

        walk: function () {
            return "walking";
        }
    };

    return Base;
});
