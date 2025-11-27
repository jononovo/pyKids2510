// ============================================
// RESET MANAGER
// Centralized reset logic for the game
// Handles both full reset (Reset button) and soft reset (Run Code)
// ============================================

(function() {
    'use strict';

    const ResetManager = {
        fullReset(gameState) {
            console.log('[ResetManager] Performing full reset');
            
            this.resetPlayerState(gameState);
            this.resetVehicles(gameState);
            this.resetElements(gameState);
            this.resetCollectibles(gameState);
            this.resetInventory(gameState);
            this.resetMissionState(gameState);
            this.resetEditor();
            this.resetUI(gameState);
            
            if (typeof render === 'function') render();
            if (typeof updateViewport === 'function') updateViewport();
            
            console.log('[ResetManager] Full reset complete');
        },

        softReset(gameState) {
            console.log('[ResetManager] Performing soft reset (Run Code)');
            
            this.resetPlayerPosition(gameState);
            this.resetVehicles(gameState);
            
            if (typeof render === 'function') render();
            if (typeof updateViewport === 'function') updateViewport();
            
            console.log('[ResetManager] Soft reset complete');
        },

        resetPlayerPosition(gameState) {
            if (!gameState) return;
            
            gameState.playerPos = { 
                x: gameState.startPos.x, 
                y: gameState.startPos.y 
            };
            gameState.playerDirection = 'right';
            gameState.characterType = 'player';
        },

        resetPlayerState(gameState) {
            if (!gameState) return;
            
            this.resetPlayerPosition(gameState);
            gameState.isRunning = false;
            
            const runBtn = document.getElementById('run-btn');
            if (runBtn) runBtn.disabled = false;
        },

        resetVehicles(gameState) {
            if (window.VehicleInteractionManager) {
                VehicleInteractionManager.reset(gameState);
            }
        },

        resetElements(gameState) {
            if (window.ElementInteractionManager && window.ElementInteractionManager.resetStates) {
                ElementInteractionManager.resetStates();
            }
        },

        resetCollectibles(gameState) {
            if (!gameState || !gameState.collectibles) return;
            
            for (let i = 0; i < gameState.collectibles.length; i++) {
                gameState.collectibles[i].collected = false;
            }
        },

        resetInventory(gameState) {
            if (!gameState) return;
            
            if (window.levelEntrySnapshot && window.levelEntrySnapshot.missionState) {
                if (window.MissionState) {
                    MissionState.loadState(window.levelEntrySnapshot.missionState);
                    gameState.inventory = MissionState.getInventory();
                    console.log('[ResetManager] Restored MissionState from snapshot');
                    
                    if (gameState.collectibles) {
                        for (let j = 0; j < gameState.collectibles.length; j++) {
                            const c = gameState.collectibles[j];
                            c.collected = MissionState.isCollected(c.x, c.y);
                        }
                    }
                }
            } else {
                gameState.inventory = {};
            }
        },

        resetMissionState(gameState) {
            if (!window.levelEntrySnapshot || !window.levelEntrySnapshot.missionState) {
                return;
            }
            
            if (window.MissionState) {
                MissionState.loadState(window.levelEntrySnapshot.missionState);
            }
        },

        resetEditor() {
            if (window.EditorManager) {
                const success = EditorManager.resetToSnapshot();
                if (!success) {
                    console.warn('[ResetManager] Editor reset failed - no snapshot available');
                }
                
                if (window.BlocklyModeSwitcher && window.BlocklyModeSwitcher.isBlockMode()) {
                    if (window.BlocklyIntegration && window.levelEntrySnapshot && window.levelEntrySnapshot.starterCode) {
                        window.BlocklyIntegration.convertFromText(window.levelEntrySnapshot.starterCode);
                    }
                }
            }
        },

        resetUI(gameState) {
            gameState.messageLog = [];
            
            const messagePanel = document.getElementById('message-panel');
            if (messagePanel) {
                messagePanel.innerHTML = '';
            }
            
            const inventoryPanel = document.getElementById('inventory-panel');
            if (inventoryPanel && gameState) {
                inventoryPanel.innerHTML = '<strong>Inventory:</strong>';
                for (const item in gameState.inventory) {
                    if (gameState.inventory[item] > 0) {
                        const itemSpan = document.createElement('span');
                        itemSpan.className = 'inventory-item';
                        itemSpan.textContent = ' ' + item + ': ' + gameState.inventory[item];
                        inventoryPanel.appendChild(itemSpan);
                    }
                }
            }
        },

        resetCamera() {
            if (window.camera) {
                window.camera.zoom = 1.0;
                window.camera.panX = 0;
                window.camera.panY = 0;
                window.camera.isManualPan = false;
                window.camera.isDragging = false;
            }
        }
    };

    window.ResetManager = ResetManager;
    console.log('[ResetManager] Module loaded');
})();
