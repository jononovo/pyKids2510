(function() {
    'use strict';

    let lastMapRows = null;
    let lastMissionMap = null;
    let lastChapterNumber = null;

    function isMissionType(levelType) {
        return levelType === 'mission' || levelType === 'quest';
    }

    const LevelLoader = {
        async initialize(levelData, chapterData) {
            const TILE_SIZE = window.TILE_SIZE || 32;
            const gameState = window.gameState;
            const isMission = isMissionType(levelData.type);

            this._resetCamera();
            this._rememberMissionMap(gameState);
            this._handleChapterChange(chapterData.chapterNumber);
            this._startMissionState(isMission, chapterData.chapterNumber);
            this._useLevelMap(gameState, levelData, isMission);
            this._initializeGameState(gameState, levelData);

            gameState.collectibles = this._processCollectibles(levelData, gameState.levelType);

            VehicleInteractionManager.loadLevelVehicles(levelData);
            ElementInteractionManager.loadLevelElements(levelData);
            await MegaElementManager.loadLevelMegaElements(levelData);
            await SceneryManager.loadLevelScenery(levelData);

            this._resizeCanvas(gameState.mapWidth, gameState.mapHeight, TILE_SIZE);

            if (levelData.map.graphic) {
                this._loadBackgroundGraphic(levelData.map.graphic);
            } else {
                gameState.backgroundImage = null;
            }

            clearConsoleLog();
            ResetManager.captureLevelStart(gameState);
            ResetManager.restoreLevelStart(gameState);

            console.log('[LevelLoader] Level initialized:', {
                mapSize: `${gameState.mapWidth}x${gameState.mapHeight}`,
                type: gameState.levelType
            });

            return true;
        },

        _resetCamera() {
            if (window.camera) {
                window.camera.zoom = 1.0;
                window.camera.panX = 0;
                window.camera.panY = 0;
                window.camera.isManualPan = false;
                window.camera.isDragging = false;
            }
        },

        _rememberMissionMap(gameState) {
            if (isMissionType(gameState.levelType)) {
                lastMissionMap = { tiles: gameState.mapData, builtElements: gameState.builtElements };
            }
        },

        _handleChapterChange(chapterNumber) {
            if (lastChapterNumber !== chapterNumber) {
                lastMapRows = null;
                lastMissionMap = null;
                lastChapterNumber = chapterNumber;
            }
        },

        _startMissionState(isMission, chapterNumber) {
            MissionState.setIsMissionLevel(isMission);
            if (isMission) {
                MissionState.init(chapterNumber);
            } else {
                MissionState.reset();
            }
        },

        _useLevelMap(gameState, levelData, isMission) {
            if (isMission && !levelData.hasOwnMap && lastMissionMap) {
                gameState.mapData = lastMissionMap.tiles;
                gameState.builtElements = lastMissionMap.builtElements;
                return;
            }

            if (levelData.hasOwnMap) {
                lastMapRows = levelData.map.layout;
            }
            gameState.mapData = lastMapRows || [];
            gameState.builtElements = [];
        },

        _initializeGameState(gameState, levelData) {
            gameState.mapHeight = gameState.mapData.length;
            gameState.mapWidth = gameState.mapData[0] ? gameState.mapData[0].length : 0;
            gameState.startPos = {...levelData.map.startPos};
            gameState.goalPos = {...levelData.map.goalPos};
            gameState.levelType = levelData.type || 'exercise';
            gameState.objects = [];
        },

        _processCollectibles(levelData, levelType) {
            let collectibles = (levelData.map.collectibles || []).map(c => ({
                x: c.x !== undefined ? c.x : c[0],
                y: c.y !== undefined ? c.y : c[1],
                type: c.type || 'gem',
                collected: false
            }));

            const isMission = levelType === 'mission' || levelType === 'quest';
            if (isMission && window.MissionState && MissionState.isInitialized()) {
                collectibles = collectibles.map(c => {
                    if (MissionState.isCollected(c.x, c.y)) {
                        return { ...c, collected: true };
                    }
                    return c;
                });
            }

            return collectibles;
        },

        _resizeCanvas(mapWidth, mapHeight, TILE_SIZE) {
            const canvas = document.getElementById('game-canvas');
            if (!canvas) return;

            const canvasWidth = mapWidth * TILE_SIZE;
            const canvasHeight = mapHeight * TILE_SIZE;

            if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
            }
        },

        _loadBackgroundGraphic(graphicUrl) {
            const gameState = window.gameState;
            if (!gameState) return;

            const img = new Image();
            img.onload = function() {
                gameState.backgroundImage = img;
                if (window.render) {
                    window.render();
                }
            };
            img.onerror = function() {
                console.error('[LevelLoader] Failed to load background graphic:', graphicUrl);
                gameState.backgroundImage = null;
            };
            img.src = graphicUrl;
        },

        updateInventoryUI() {
            const gameState = window.gameState;
            if (!gameState) return;

            const inventoryPanel = document.getElementById('inventory-panel');
            if (inventoryPanel) {
                inventoryPanel.innerHTML = '<strong>📦 Inventory:</strong>';
                for (const [type, count] of Object.entries(gameState.inventory)) {
                    if (count > 0) {
                        const itemSpan = document.createElement('span');
                        itemSpan.className = 'inventory-item';
                        itemSpan.textContent = ` ${type}: ${count}`;
                        inventoryPanel.appendChild(itemSpan);
                    }
                }
            }

            this.updateBackpackUI();
        },

        updateBackpackUI() {
            const gameState = window.gameState;
            if (!gameState) return;

            const backpackPanel = document.getElementById('backpack-panel');
            if (!backpackPanel) return;

            const backpack = gameState.backpack || [];
            const capacity = window.MissionState ? MissionState.getBackpackCapacity() : 4;

            if (backpack.length === 0) {
                backpackPanel.style.display = 'none';
            } else {
                backpackPanel.style.display = 'block';
                backpackPanel.innerHTML = `<strong>🎒 Backpack</strong> (${backpack.length}/${capacity}):`;
                const listSpan = document.createElement('span');
                listSpan.className = 'backpack-list';
                listSpan.textContent = JSON.stringify(backpack);
                backpackPanel.appendChild(listSpan);
            }
        },

        clearCaches() {
            lastMapRows = null;
            lastMissionMap = null;
            lastChapterNumber = null;
        }
    };

    window.LevelLoader = LevelLoader;
    console.log('[LevelLoader] Module loaded');
})();
