(function() {
    'use strict';

    let levelStart = null;

    function copyTiles(tiles) {
        return tiles.map(row => row.slice());
    }

    function copyBuiltElements(builtElements) {
        return JSON.parse(JSON.stringify(builtElements));
    }

    const ResetManager = {
        captureLevelStart(gameState) {
            levelStart = {
                missionState: MissionState.getState(),
                builtElements: copyBuiltElements(gameState.builtElements),
                tiles: copyTiles(gameState.mapData)
            };
        },

        restoreLevelStart(gameState) {
            MissionState.loadState(levelStart.missionState);
            gameState.inventory = MissionState.getInventory();
            gameState.backpack = MissionState.getBackpack();

            SignalManager.reset();
            ElementInteractionManager.resetStates(levelStart.missionState.elementStates);
            VehicleInteractionManager.resetStates(gameState);

            this.resetFarmPlots(gameState);
            gameState.builtElements = copyBuiltElements(levelStart.builtElements);
            gameState.mapData = copyTiles(levelStart.tiles);
            this.resetPlayerPosition(gameState);

            LevelLoader.updateInventoryUI();
            render();
            updateViewport();
        },

        resetPlayerPosition(gameState) {
            gameState.playerPos = {
                x: gameState.startPos.x,
                y: gameState.startPos.y
            };
            gameState.playerDirection = 'right';
            gameState.characterType = 'player';
        },

        resetFarmPlots(gameState) {
            if (!gameState.farmPlots) return;

            for (var i = 0; i < gameState.farmPlots.length; i++) {
                var plot = gameState.farmPlots[i];
                plot.cancelled = true;
                if (plot.timerId) {
                    clearTimeout(plot.timerId);
                    plot.timerId = null;
                }
            }
            gameState.farmPlots = [];
        }
    };

    window.ResetManager = ResetManager;
    console.log('[ResetManager] Module loaded');
})();
