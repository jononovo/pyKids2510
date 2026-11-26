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
            levelType: gameState.levelType || 'exercise'
        };

        if (gameState.inventory) {
            context.inventory = { ...gameState.inventory };
        }

        context.collectibles = ElementInteractionManager.elements
            .filter(element => element.section === 'collectibles')
            .map(element => ({
                x: element.x,
                y: element.y,
                type: element.type,
                collected: !!ElementInteractionManager.isElementRemoved(element.id)
            }));

        if (window.EditorManager && EditorManager.isInitialized()) {
            context.code = EditorManager.getCode() || '';
        }
        
        if (window.MissionState && MissionState.isInitialized()) {
            context.missionState = MissionState.getState();
            if (context.missionState && context.missionState.inventory) {
                context.inventory = { ...context.missionState.inventory, ...context.inventory };
            }
        }

        return context;
    }
    
    return {
        snapshot: snapshot
    };
})();

window.TestContext = TestContext;
