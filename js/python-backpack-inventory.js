(function() {
    'use strict';

    const BACKPACK_METHODS = ['append', 'remove', 'pop'];
    const INVENTORY_METHODS = ['keys', 'values', 'items', 'get'];

    function backpackList() {
        return new Sk.builtin.list(window.gameCommand_backpack_items().map(item => new Sk.builtin.str(item)));
    }

    function inventoryDict() {
        const counts = window.gameCommand_inventory_counts();
        const keysAndValues = [];
        Object.keys(counts).forEach(item => keysAndValues.push(new Sk.builtin.str(item), new Sk.builtin.int_(counts[item])));
        return new Sk.builtin.dict(keysAndValues);
    }

    function createBackpack(module, runGameCommand) {
        const Backpack = Sk.misceval.buildClass(module, function($gbl, $loc) {
            BACKPACK_METHODS.forEach(methodName => {
                $loc[methodName] = new Sk.builtin.func(function(self, value) {
                    const jsValue = value !== undefined ? Sk.ffi.remapToJs(value) : undefined;
                    return runGameCommand(() => window['gameCommand_backpack_' + methodName](jsValue));
                });
            });
            $loc.__len__ = new Sk.builtin.func(function(self) {
                return new Sk.builtin.int_(window.gameCommand_backpack_items().length);
            });
            $loc.__getitem__ = new Sk.builtin.func(function(self, index) {
                return Sk.abstr.objectGetItem(backpackList(), index);
            });
            $loc.__contains__ = new Sk.builtin.func(function(self, item) {
                return new Sk.builtin.bool(Sk.abstr.sequenceContains(backpackList(), item));
            });
            $loc.__iter__ = new Sk.builtin.func(function(self) {
                return Sk.abstr.iter(backpackList());
            });
            $loc.__repr__ = new Sk.builtin.func(function(self) {
                return Sk.builtin.repr(backpackList());
            });
        }, 'Backpack', []);
        return Sk.misceval.callsimArray(Backpack, []);
    }

    function createInventory(module, runGameCommand) {
        const Inventory = Sk.misceval.buildClass(module, function($gbl, $loc) {
            $loc.__getitem__ = new Sk.builtin.func(function(self, item) {
                return Sk.ffi.remapToPy(window.gameCommand_inventory_get(Sk.ffi.remapToJs(item)));
            });
            $loc.__setitem__ = new Sk.builtin.func(function(self, item, count) {
                const jsItem = Sk.ffi.remapToJs(item);
                const jsCount = Sk.ffi.remapToJs(count);
                return runGameCommand(() => window.gameCommand_inventory_set(jsItem, jsCount));
            });
            $loc.__len__ = new Sk.builtin.func(function(self) {
                return new Sk.builtin.int_(Object.keys(window.gameCommand_inventory_counts()).length);
            });
            $loc.__contains__ = new Sk.builtin.func(function(self, item) {
                return new Sk.builtin.bool(Sk.abstr.sequenceContains(inventoryDict(), item));
            });
            $loc.__iter__ = new Sk.builtin.func(function(self) {
                return Sk.abstr.iter(inventoryDict());
            });
            $loc.__repr__ = new Sk.builtin.func(function(self) {
                return Sk.builtin.repr(inventoryDict());
            });
            INVENTORY_METHODS.forEach(methodName => {
                $loc[methodName] = new Sk.builtin.func(function(self, ...pythonArgs) {
                    return Sk.misceval.callsimArray(Sk.abstr.gattr(inventoryDict(), new Sk.builtin.str(methodName)), pythonArgs);
                });
            });
        }, 'Inventory', []);
        return Sk.misceval.callsimArray(Inventory, []);
    }

    window.PythonBackpackInventory = {
        createBackpack: createBackpack,
        createInventory: createInventory,
        backpackMethods: BACKPACK_METHODS,
        inventoryMethods: INVENTORY_METHODS
    };
})();
