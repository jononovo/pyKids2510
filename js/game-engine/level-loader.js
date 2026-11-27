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
            LevelHelpers.setLevel(levelData);

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

        clearCaches() {
            lastMapRows = null;
            lastMissionMap = null;
            lastChapterNumber = null;
        }
    };

    window.LevelLoader = LevelLoader;
    console.log('[LevelLoader] Module loaded');
})();
