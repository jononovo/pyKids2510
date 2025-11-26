// ============================================
// SKULPT PLAYER MODULE
// This file follows Skulpt's $builtinmodule pattern
// ============================================

var $builtinmodule = function(name) {
    var mod = {};

    function incrementCounter() {
        if (typeof window.incrementSkulptCommandCounter === 'function') {
            window.incrementSkulptCommandCounter();
        }
    }

    mod.move_forward = new Sk.builtin.func(function(steps) {
        var numSteps = 1;
        if (steps !== undefined) {
            numSteps = Sk.ffi.remapToJs(steps);
            if (typeof numSteps !== 'number') {
                numSteps = parseInt(numSteps) || 1;
            }
        }
        
        return Sk.misceval.promiseToSuspension(
            (async function() {
                for (var i = 0; i < numSteps; i++) {
                    await moveForward();
                    incrementCounter();
                }
                return Sk.builtin.none.none$;
            })()
        );
    });

    mod.turn_left = new Sk.builtin.func(function() {
        return Sk.misceval.promiseToSuspension(
            (async function() {
                await turnLeft();
                incrementCounter();
                return Sk.builtin.none.none$;
            })()
        );
    });

    mod.turn_right = new Sk.builtin.func(function() {
        return Sk.misceval.promiseToSuspension(
            (async function() {
                await turnRight();
                incrementCounter();
                return Sk.builtin.none.none$;
            })()
        );
    });

    mod.push = new Sk.builtin.func(function() {
        return Sk.misceval.promiseToSuspension(
            (async function() {
                await push();
                incrementCounter();
                return Sk.builtin.none.none$;
            })()
        );
    });

    mod.speak = new Sk.builtin.func(function(message) {
        var msg = '';
        if (message !== undefined) {
            msg = Sk.ffi.remapToJs(message);
        }
        return Sk.misceval.promiseToSuspension(
            (async function() {
                await speak(msg);
                incrementCounter();
                return Sk.builtin.none.none$;
            })()
        );
    });

    mod.collect = new Sk.builtin.func(function(resource) {
        var res = null;
        if (resource !== undefined) {
            res = Sk.ffi.remapToJs(resource);
        }
        return Sk.misceval.promiseToSuspension(
            (async function() {
                await collect(res);
                incrementCounter();
                return Sk.builtin.none.none$;
            })()
        );
    });

    mod.water = new Sk.builtin.func(function() {
        return Sk.misceval.promiseToSuspension(
            (async function() {
                await water();
                incrementCounter();
                return Sk.builtin.none.none$;
            })()
        );
    });

    mod.open = new Sk.builtin.func(function() {
        return Sk.misceval.promiseToSuspension(
            (async function() {
                await open();
                incrementCounter();
                return Sk.builtin.none.none$;
            })()
        );
    });

    mod.close = new Sk.builtin.func(function() {
        return Sk.misceval.promiseToSuspension(
            (async function() {
                await close();
                incrementCounter();
                return Sk.builtin.none.none$;
            })()
        );
    });

    mod.place = new Sk.builtin.func(function(item) {
        var it = null;
        if (item !== undefined) {
            it = Sk.ffi.remapToJs(item);
        }
        return Sk.misceval.promiseToSuspension(
            (async function() {
                await place(it);
                incrementCounter();
                return Sk.builtin.none.none$;
            })()
        );
    });

    mod.build = new Sk.builtin.func(function(objectName) {
        var objName = null;
        if (objectName !== undefined) {
            objName = Sk.ffi.remapToJs(objectName);
        }
        return Sk.misceval.promiseToSuspension(
            (async function() {
                await build(objName);
                incrementCounter();
                return Sk.builtin.none.none$;
            })()
        );
    });

    return mod;
};
