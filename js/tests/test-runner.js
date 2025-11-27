const TestRunner = (function() {
    
    function evaluate() {
        if (!window.courseData || window.currentLevel === undefined) {
            console.warn('[TestRunner] No course data or level available');
            return;
        }
        
        const level = courseData.levels[currentLevel];
        if (!level) {
            console.warn('[TestRunner] Level not found:', currentLevel);
            return;
        }
        
        const tests = level.tests;
        
        if (!tests || !tests.items || tests.items.length === 0) {
            _defaultGoalCheck();
            return;
        }
        
        const context = TestContext.snapshot();
        const results = _runTests(tests, context);
        
        console.log('[TestRunner] Test results:', results);
        
        if (results.passed) {
            _triggerWin();
        }
        
        return results;
    }
    
    function _runTests(tests, context) {
        const results = {
            passed: false,
            pass_all: tests.pass_all !== false,
            items: []
        };
        
        for (const test of tests.items) {
            const testType = test.type;
            
            if (!TestTypes[testType]) {
                console.warn('[TestRunner] Unknown test type:', testType);
                results.items.push({
                    type: testType,
                    passed: false,
                    message: `Unknown test type: ${testType}`
                });
                continue;
            }
            
            const result = TestTypes[testType](test, context);
            results.items.push(result);
        }
        
        if (results.pass_all) {
            results.passed = results.items.length > 0 && results.items.every(r => r.passed);
        } else {
            results.passed = results.items.some(r => r.passed);
        }
        
        return results;
    }
    
    function _defaultGoalCheck() {
        const px = Math.floor(gameState.playerPos.x);
        const py = Math.floor(gameState.playerPos.y);
        const gx = gameState.goalPos.x;
        const gy = gameState.goalPos.y;
        
        if (px === gx && py === gy) {
            _triggerWin();
        }
    }
    
    function _triggerWin() {
        gameState.levelCompleted[currentLevel] = true;
        
        if (window.UserProgressManager) {
            UserProgressManager.markCompletion();
        }
        
        updateProgressIndicators();
        document.getElementById('victory-modal').classList.add('show');
    }
    
    function getTestDefinitions() {
        if (!window.courseData || window.currentLevel === undefined) {
            return null;
        }
        
        const level = courseData.levels[currentLevel];
        return level ? level.tests : null;
    }
    
    function runManualCheck() {
        return evaluate();
    }
    
    return {
        evaluate: evaluate,
        getTestDefinitions: getTestDefinitions,
        runManualCheck: runManualCheck
    };
})();

window.TestRunner = TestRunner;
