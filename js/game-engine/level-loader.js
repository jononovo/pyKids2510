// ============================================
// LEVEL LOADER - Game State Initialization
// Handles map setup, collectibles, vehicles, elements, and mission state
// ============================================

(function() {
    'use strict';

    let lastMapCache = null;
    let lastMissionMapCache = null;
    let lastChapterNumber = null;

    const LevelLoader = {
        async initialize(levelData, levelIndex, chapterData) {
            const TILE_SIZE = window.TILE_SIZE || 32;
            const gameState = window.gameState;
            
            if (!gameState) {
                console.error('[LevelLoader] gameState not available');
                return false;
            }

            this._resetCamera();
            
            this._handleChapterChange(chapterData.chapterNumber);
            
            const mapLayout = this._resolveMapLayout(levelData, chapterData);
            
            this._initializeGameState(gameState, levelData, mapLayout);
            
            const collectibles = this._processCollectibles(levelData, gameState.levelType);
            gameState.collectibles = collectibles;
            
            await this._initializeManagers(levelData, gameState.levelType);
            
            this._initializeInventory(gameState, gameState.levelType);
            
            this._captureResetSnapshot(levelIndex, gameState.levelType);
            
            this._resizeCanvas(gameState.mapWidth, gameState.mapHeight, TILE_SIZE);
            
            if (levelData.map.graphic) {
                this._loadBackgroundGraphic(levelData.map.graphic);
            } else {
                gameState.backgroundImage = null;
            }
            
            console.log('[LevelLoader] Level initialized:', {
                mapSize: `${gameState.mapWidth}x${gameState.mapHeight}`,
                collectibles: collectibles.length,
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

        _handleChapterChange(chapterNumber) {
            if (lastChapterNumber !== chapterNumber) {
                lastMapCache = null;
                lastMissionMapCache = null;
                lastChapterNumber = chapterNumber;
                
                if (window.MissionState) {
                    const currentMissionChapter = MissionState.getCurrentChapter();
                    if (currentMissionChapter !== chapterNumber) {
                        MissionState.init(chapterNumber);
                    }
                }
            }
        },

        _resolveMapLayout(levelData, chapterData) {
            let mapLayout = levelData.map.layout;
            
            if (!levelData.hasOwnMap || mapLayout.length === 0) {
                const isMission = levelData.type === 'mission' || levelData.type === 'quest';
                
                if (isMission && lastMissionMapCache) {
                    mapLayout = lastMissionMapCache;
                    console.log('[LevelLoader] Mission using last mission map');
                } else if (lastMapCache) {
                    mapLayout = lastMapCache;
                    console.log('[LevelLoader] Using last available map');
                }
            } else {
                lastMapCache = levelData.map.layout;
                
                const isMission = levelData.type === 'mission' || levelData.type === 'quest';
                if (isMission) {
                    lastMissionMapCache = levelData.map.layout;
                }
            }
            
            return mapLayout;
        },

        _initializeGameState(gameState, levelData, mapLayout) {
            gameState.mapData = mapLayout;
            gameState.mapHeight = mapLayout.length;
            gameState.mapWidth = mapLayout[0] ? mapLayout[0].length : 0;
            gameState.startPos = {...levelData.map.startPos};
            gameState.goalPos = {...levelData.map.goalPos};
            gameState.playerPos = {...levelData.map.startPos};
            gameState.playerDirection = 'right';
            gameState.characterType = 'player';
            gameState.levelType = levelData.type || 'exercise';
            
            gameState.objects = [];
            gameState.messageLog = [];
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

        async _initializeManagers(levelData, levelType) {
            const isMission = levelType === 'mission' || levelType === 'quest';
            
            if (window.VehicleInteractionManager) {
                VehicleInteractionManager.loadLevelVehicles(levelData);
            }
            
            if (window.ElementInteractionManager) {
                ElementInteractionManager.loadLevelElements(levelData);
                
                if (window.MissionState) {
                    MissionState.setIsMissionLevel(isMission);
                }
            }
            
            if (window.MegaElementManager) {
                await MegaElementManager.loadLevelMegaElements(levelData);
            }
            
            if (window.SceneryManager) {
                await SceneryManager.loadLevelScenery(levelData);
            }
        },

        _initializeInventory(gameState, levelType) {
            const isMission = levelType === 'mission' || levelType === 'quest';
            
            if (isMission && window.MissionState && MissionState.isInitialized()) {
                gameState.inventory = MissionState.getInventory();
                gameState.backpack = MissionState.getBackpack();
                console.log('[LevelLoader] Mission level - loaded inventory from MissionState:', gameState.inventory);
                console.log('[LevelLoader] Mission level - loaded backpack from MissionState:', gameState.backpack);
            } else {
                gameState.inventory = {};
                gameState.backpack = [];
            }
        },

        _captureResetSnapshot(levelIndex, levelType) {
            const isMission = levelType === 'mission' || levelType === 'quest';
            
            const isNewLevelEntry = window.levelEntrySnapshot.levelIndex !== levelIndex;
            window._isNewLevelEntry = isNewLevelEntry;
            
            if (isNewLevelEntry) {
                if (isMission && window.MissionState && MissionState.isInitialized()) {
                    if (levelIndex === 0) {
                        window.levelEntrySnapshot.missionState = {
                            chapter: MissionState.getCurrentChapter(),
                            inventory: {},
                            backpack: [],
                            collectedItems: [],
                            structures: [],
                            elementStates: {}
                        };
                        console.log('[LevelLoader] Level 1 - captured fresh empty snapshot for reset');
                    } else {
                        window.levelEntrySnapshot.missionState = MissionState.getState();
                        console.log('[LevelLoader] Level', levelIndex + 1, '- captured MissionState snapshot for reset:', window.levelEntrySnapshot.missionState);
                    }
                } else {
                    window.levelEntrySnapshot.missionState = null;
                }
                window.levelEntrySnapshot.levelIndex = levelIndex;
                
                // Capture built elements state for reset
                const gameState = window.gameState;
                if (gameState && gameState.builtElements) {
                    window.levelEntrySnapshot.builtElements = JSON.parse(JSON.stringify(gameState.builtElements));
                } else {
                    window.levelEntrySnapshot.builtElements = [];
                }
            }
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
            
            const messagePanel = document.getElementById('message-panel');
            if (messagePanel) {
                let messagesContainer = messagePanel.querySelector('.console-messages');
                if (messagesContainer) {
                    messagesContainer.innerHTML = '';
                } else {
                    // Rebuild the console structure if missing
                    messagePanel.innerHTML = `
                        <div class="console-header">
                            <span class="console-title">Console Log</span>
                            <button class="console-toggle" onclick="toggleConsoleLog()" title="Expand/Collapse">−</button>
                        </div>
                        <div class="console-messages"></div>
                    `;
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
            lastMapCache = null;
            lastMissionMapCache = null;
            lastChapterNumber = null;
        }
    };

    window.LevelLoader = LevelLoader;
    console.log('[LevelLoader] Module loaded');
})();
