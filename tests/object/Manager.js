/*jslint */
/*global require: false */
"use strict";

require.def("Manager", ["blade/object", "Employee", "talker"], function (object, Employee, talker) {

    var Manager = object(Employee, [talker], function (parent) {
        return {
            init: function () {
                parent(this, "init", arguments);
            },

            getCitizenship: function () {
                return parent(this, "getCitizenship", arguments) + " manager";
            },

            walk: function () {
                return "manager is walking";
            }
        };
    });

    return Manager;
});
