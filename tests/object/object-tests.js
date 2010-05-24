require({
        baseUrl: "./",
        paths: {
            "blade": "../../blade",
            "require": "../../require"
        }
    },
    ["require", "Base", "Employee", "Manager"],
    function(require, Base, Employee, Manager) {

        var base = new Base(),
            employee = new Employee("drone1"),
            manager = new Manager("master1");

        doh.register(
            "object",
            [
                function object(t){
                    //Test Base
                    t.is(true, base instanceof Base);
                    t.is(1, base.baseCounter);
                    t.is("walking", base.walk());

                    //Test Employee
                    
                    //TODO: instanceof test on Employee?
                    t.is(true, employee instanceof Base);
                    t.is(true, employee instanceof Employee);
                    t.is(2, employee.baseCounter);
                    t.is("drone1", employee.getId());
                    t.is("Genosha employee", employee.getCitizenship());
                    t.is("walking employee", employee.walk());

                    //Test Manager
                    t.is(true, manager instanceof Base);
                    t.is(true, manager instanceof Manager);
                    t.is(true, manager instanceof Employee);
                    t.is(3, manager.baseCounter);
                    t.is("master1", manager.getId());
                    t.is("Genosha employee manager", manager.getCitizenship());
                    t.is("manager is walking", manager.walk());
                    t.is("talking", manager.talk());
                }
            ]
        );
        doh.run();
    }
);
