const TestTypes = (function() {
    
    function position(test, ctx) {
        let targetX, targetY;
        
        if (test.target === 'goal') {
            targetX = ctx.goal.x;
            targetY = ctx.goal.y;
        } else if (Array.isArray(test.target)) {
            targetX = test.target[0];
            targetY = test.target[1];
        } else if (test.x !== undefined && test.y !== undefined) {
            targetX = test.x;
            targetY = test.y;
        } else {
            targetX = ctx.goal.x;
            targetY = ctx.goal.y;
        }
        
        const passed = ctx.player.x === targetX && ctx.player.y === targetY;
        
        return {
            type: 'position',
            passed: passed,
            expected: { x: targetX, y: targetY },
            actual: { x: ctx.player.x, y: ctx.player.y },
            message: passed ? 'Reached target position' : 
                `Expected position (${targetX}, ${targetY}) but player is at (${ctx.player.x}, ${ctx.player.y})`
        };
    }
    
    function inventory(test, ctx) {
        const item = test.item;
        const count = ctx.inventory[item] || 0;
        
        let passed = false;
        let expectedMsg = '';
        
        if (test.min !== undefined) {
            passed = count >= test.min;
            expectedMsg = `at least ${test.min}`;
        } else if (test.max !== undefined) {
            passed = count <= test.max;
            expectedMsg = `at most ${test.max}`;
        } else if (test.exact !== undefined) {
            passed = count === test.exact;
            expectedMsg = `exactly ${test.exact}`;
        } else {
            passed = count >= 1;
            expectedMsg = 'at least 1';
        }
        
        return {
            type: 'inventory',
            passed: passed,
            item: item,
            expected: expectedMsg,
            actual: count,
            message: passed ? `Have ${count} ${item}` : 
                `Expected ${expectedMsg} ${item}, but have ${count}`
        };
    }
    
    function collectibles(test, ctx) {
        const collectedItems = ctx.collectibles.filter(c => c.collected);
        const totalItems = ctx.collectibles.length;
        
        let passed = false;
        let message = '';
        
        if (test.all === true) {
            passed = collectedItems.length === totalItems && totalItems > 0;
            message = passed ? 'All collectibles gathered' : 
                `Collected ${collectedItems.length} of ${totalItems} items`;
        } else if (test.count !== undefined) {
            passed = collectedItems.length >= test.count;
            message = passed ? `Collected ${collectedItems.length} items` :
                `Need ${test.count} items, have ${collectedItems.length}`;
        } else if (test.types && Array.isArray(test.types)) {
            const collectedTypes = new Set(collectedItems.map(c => c.type));
            passed = test.types.every(t => collectedTypes.has(t));
            const missing = test.types.filter(t => !collectedTypes.has(t));
            message = passed ? 'All required item types collected' :
                `Missing item types: ${missing.join(', ')}`;
        } else {
            passed = collectedItems.length > 0;
            message = passed ? 'At least one item collected' : 'No items collected';
        }
        
        return {
            type: 'collectibles',
            passed: passed,
            collected: collectedItems.length,
            total: totalItems,
            message: message
        };
    }
    
    function code_regex(test, ctx) {
        const pattern = test.pattern;
        let regex;
        
        try {
            const flags = test.flags || '';
            regex = new RegExp(pattern, flags);
        } catch (e) {
            return {
                type: 'code_regex',
                passed: false,
                message: `Invalid regex pattern: ${pattern}`,
                error: e.message
            };
        }
        
        const passed = regex.test(ctx.code);
        
        return {
            type: 'code_regex',
            passed: passed,
            pattern: pattern,
            message: passed ? (test.success_message || 'Code matches required pattern') : 
                (test.message || `Code does not match pattern: ${pattern}`)
        };
    }
    
    function direction(test, ctx) {
        const expected = test.facing || test.direction;
        const passed = ctx.player.direction === expected;
        
        return {
            type: 'direction',
            passed: passed,
            expected: expected,
            actual: ctx.player.direction,
            message: passed ? `Facing ${expected}` : 
                `Expected to face ${expected}, but facing ${ctx.player.direction}`
        };
    }
    
    function element_state(test, ctx) {
        const key = `${test.x},${test.y}`;
        const state = ctx.elementStates[key];
        const expectedState = test.state;
        
        const passed = state && state.type === expectedState;
        
        return {
            type: 'element_state',
            passed: passed,
            position: { x: test.x, y: test.y },
            expected: expectedState,
            actual: state ? state.type : 'unchanged',
            message: passed ? `Element at (${test.x}, ${test.y}) is ${expectedState}` :
                `Expected element at (${test.x}, ${test.y}) to be ${expectedState}`
        };
    }
    
    return {
        position: position,
        inventory: inventory,
        collectibles: collectibles,
        code_regex: code_regex,
        direction: direction,
        element_state: element_state
    };
})();

window.TestTypes = TestTypes;
