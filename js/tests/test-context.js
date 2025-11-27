const TestContext = (function() {
    
    function snapshot() {
        const context = {
            player: {
                x: Math.floor(gameState.playerPos.x),
                y: Math.floor(gameState.playerPos.y),
                direction: gameState.playerDirection || 'right'
            },
            goal: {
                x: gameState.goalPos.x,
                y: gameState.goalPos.y
            },
            inventory: {},
            collectibles: [],
            code: '',
            missionState: null,
            elementStates: {},
            levelType: gameState.levelType || 'exercise'
        };
        
        if (gameState.inventory) {
            context.inventory = { ...gameState.inventory };
        }
        
        if (gameState.collectibles) {
            context.collectibles = gameState.collectibles.map(c => ({
                x: c.x,
                y: c.y,
                type: c.type || 'gem',
                collected: !!c.collected
            }));
        }
        
        if (window.EditorManager && EditorManager.isInitialized()) {
            context.code = EditorManager.getCode() || '';
        }
        
        if (window.MissionState && MissionState.isInitialized()) {
            context.missionState = MissionState.getState();
            if (context.missionState && context.missionState.inventory) {
                context.inventory = { ...context.missionState.inventory, ...context.inventory };
            }
        }
        
        if (window.ElementInteractionManager) {
            context.elementStates = ElementInteractionManager.getElementStates ? 
                ElementInteractionManager.getElementStates() : {};
        }
        
        return context;
    }
    
    return {
        snapshot: snapshot
    };
})();

window.TestContext = TestContext;
