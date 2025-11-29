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
            this.resetSignalListeners();
            this.resetElements(gameState);
            this.resetCollectibles(gameState);
            this.resetBuiltElements(gameState);
            this.resetFarmPlots(gameState);
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
            this.resetSignalListeners();
            this.resetFarmPlots(gameState);
            
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
        
        resetSignalListeners() {
            if (window.SignalManager) {
                SignalManager.reset();
            }
            if (window.ElementInteractionManager) {
                ElementInteractionManager.reregisterSignalListeners();
            }
            if (window.VehicleInteractionManager) {
                VehicleInteractionManager.reregisterSignalListeners();
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

        resetBuiltElements(gameState) {
            if (!gameState) return;
            
            // Restore built elements from level snapshot if available
            if (window.levelEntrySnapshot && window.levelEntrySnapshot.builtElements) {
                gameState.builtElements = JSON.parse(JSON.stringify(window.levelEntrySnapshot.builtElements));
                console.log('[ResetManager] Restored builtElements from snapshot');
            } else {
                gameState.builtElements = [];
            }
        },

        resetFarmPlots(gameState) {
            if (!gameState || !gameState.farmPlots) return;
            
            for (var i = 0; i < gameState.farmPlots.length; i++) {
                var plot = gameState.farmPlots[i];
                plot.cancelled = true;
                if (plot.timerId) {
                    clearTimeout(plot.timerId);
                    plot.timerId = null;
                }
            }
            gameState.farmPlots = [];
            console.log('[ResetManager] Cleared farm plots and timers');
        },

        resetInventory(gameState) {
            if (!gameState) return;
            
            if (window.levelEntrySnapshot && window.levelEntrySnapshot.missionState) {
                if (window.MissionState) {
                    MissionState.loadState(window.levelEntrySnapshot.missionState);
                    gameState.inventory = MissionState.getInventory();
                    gameState.backpack = MissionState.getBackpack();
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
                gameState.backpack = [];
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
            // Editor reset is now handled directly in resetGame() for simplicity
            // This method is kept for API compatibility but does nothing
            console.log('[ResetManager] resetEditor() called (no-op, handled by resetGame)');
        },

        resetUI(gameState) {
            gameState.messageLog = [];
            
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
            
            const inventoryPanel = document.getElementById('inventory-panel');
            if (inventoryPanel && gameState) {
                inventoryPanel.innerHTML = '<strong>📦 Inventory:</strong>';
                for (const item in gameState.inventory) {
                    if (gameState.inventory[item] > 0) {
                        const itemSpan = document.createElement('span');
                        itemSpan.className = 'inventory-item';
                        itemSpan.textContent = ' ' + item + ': ' + gameState.inventory[item];
                        inventoryPanel.appendChild(itemSpan);
                    }
                }
            }
            
            if (window.LevelLoader && LevelLoader.updateBackpackUI) {
                LevelLoader.updateBackpackUI();
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
