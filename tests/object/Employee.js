/*jslint */
/*global require: false */
"use strict";

require.def("Employee", ["blade/object", "Base", "citizen"], function (object, Base, citizen) {

    var Employee = object(Base, [citizen], function (parent) {
        return {
            init: function (id) {
                parent(this, "init", arguments);
                this.id = id;
            },

            getId: function () {
                return this.id;
            },

            getCitizenship: function () {
                return parent(this, "getCitizenship", arguments) + " employee";
            },

            walk: function () {
                return parent(this, "walk", arguments) + " employee";
            }
        };
    });

    return Employee;
});
