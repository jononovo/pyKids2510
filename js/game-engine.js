// ============================================
// GAME ENGINE - Character Rendering, Movement & Collision
// Note: Tile/element rendering is in js/map/ modules
// ============================================

// Get tile ID by name (for dynamic tile lookup)
function getTileIdByName(name) {
    const tileManifest = window.tileManifest;
    if (!tileManifest) return 0;
    for (const [id, tile] of Object.entries(tileManifest.tiles)) {
        if (tile.name === name) return parseInt(id);
    }
    return 0;
}

// Check if inventory meets requirements for tile access
function checkAccessRequirements(requires) {
    const inventory = gameState.inventory || {};
    
    if (Array.isArray(requires)) {
        return requires.every(item => (inventory[item] || 0) >= 1);
    }
    
    if (typeof requires === "object") {
        return Object.entries(requires).every(([item, qty]) => 
            (inventory[item] || 0) >= qty
        );
    }
    
    return true;
}

// Draw fallback pink pixel character when no sprite is loaded
function drawFallbackCharacter(cx, animY) {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!ctx) return;
    
    ctx.fillStyle = '#ff69b4';
    ctx.fillRect(cx - 6, animY - 4, 12, 10);
    ctx.fillRect(cx - 8, animY - 10, 16, 8);
    ctx.fillRect(cx - 10, animY - 12, 4, 4);
    ctx.fillRect(cx + 6, animY - 12, 4, 4);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 4, animY - 8, 3, 3);
    ctx.fillRect(cx + 1, animY - 8, 3, 3);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(cx - 3, animY - 7, 2, 2);
    ctx.fillRect(cx + 1, animY - 7, 2, 2);
}

function drawCharacter(x, y, direction) {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!ctx) return;
    
    const TILE_SIZE = window.TILE_SIZE || 32;
    const charType = gameState.characterType || 'player';
    
    if (charType !== 'player' && window.VehicleInteractionManager && VehicleInteractionManager.isBoarded()) {
        if (window.drawCharacterVehicle) {
            window.drawCharacterVehicle(x, y);
        }
        return;
    }
    
    const cx = x * TILE_SIZE + TILE_SIZE / 2;
    const cy = y * TILE_SIZE + TILE_SIZE / 2;
    
    if (gameState.spriteImage && gameState.spriteFrameWidth > 0) {
        let frameX = 0;
        let frameY = 0;
        
        if (gameState.isRunning) {
            frameY = 1;
            frameX = gameState.currentSpriteFrame % 6;
        } else {
            frameY = 0;
            if (gameState.idlePhase === 1) {
                frameX = Math.floor(gameState.spriteAnimationCounter / 15) % 4;
            } else {
                frameX = 0;
            }
        }
        
        const scale = 1.5;
        const drawWidth = gameState.spriteFrameWidth * scale;
        const drawHeight = gameState.spriteFrameHeight * scale;
        
        ctx.drawImage(
            gameState.spriteImage,
            frameX * gameState.spriteFrameWidth,
            frameY * gameState.spriteFrameHeight,
            gameState.spriteFrameWidth,
            gameState.spriteFrameHeight,
            cx - drawWidth / 2,
            cy - drawHeight / 2,
            drawWidth,
            drawHeight
        );
    } else {
        let yOffset = 0;
        if (!gameState.isRunning) {
            if (gameState.idlePhase === 1) {
                yOffset = Math.sin(gameState.idleAnimation * 0.03) * 1.5;
            }
        }
        drawFallbackCharacter(cx, cy + yOffset);
    }
}

function drawCharacterWithHop(x, y, direction, hopHeight) {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!ctx) return;
    
    const TILE_SIZE = window.TILE_SIZE || 32;
    const charType = gameState.characterType || 'player';
    
    if (charType !== 'player' && window.VehicleInteractionManager && VehicleInteractionManager.isBoarded()) {
        if (window.drawCharacterVehicle) {
            window.drawCharacterVehicle(x, y);
        }
        return;
    }
    
    const cx = x * TILE_SIZE + TILE_SIZE / 2;
    const cy = y * TILE_SIZE + TILE_SIZE / 2;
    
    if (gameState.spriteImage && gameState.spriteFrameWidth > 0) {
        const frameY = 1;
        const frameX = gameState.currentSpriteFrame % 6;
        
        const scale = 1.5;
        const drawWidth = gameState.spriteFrameWidth * scale;
        const drawHeight = gameState.spriteFrameHeight * scale;
        
        const animY = cy - hopHeight;
        
        ctx.drawImage(
            gameState.spriteImage,
            frameX * gameState.spriteFrameWidth,
            frameY * gameState.spriteFrameHeight,
            gameState.spriteFrameWidth,
            gameState.spriteFrameHeight,
            cx - drawWidth / 2,
            animY - drawHeight / 2,
            drawWidth,
            drawHeight
        );
    } else {
        drawFallbackCharacter(cx, cy - hopHeight);
    }
}

async function render() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!ctx) return;
    
    const TILE_SIZE = window.TILE_SIZE || 32;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!courseData || gameState.mapData.length === 0) {
        ctx.fillStyle = '#2a3f2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#7fc542';
        ctx.font = '20px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Load a chapter to begin', canvas.width/2, canvas.height/2);
        return;
    }
    
    if (gameState.backgroundImage) {
        ctx.drawImage(gameState.backgroundImage, 0, 0, canvas.width, canvas.height);
    }
    
    const tilePromises = [];
    for (let y = 0; y < gameState.mapHeight; y++) {
        for (let x = 0; x < gameState.mapWidth; x++) {
            if (gameState.mapData[y] && gameState.mapData[y][x] !== undefined) {
                const tileType = gameState.mapData[y][x];
                
                if (gameState.backgroundImage) {
                    if (tileType !== 7) {
                        continue;
                    }
                }
                
                if (window.drawTile) {
                    tilePromises.push(window.drawTile(x, y, tileType));
                }
            }
        }
    }
    await Promise.all(tilePromises);
    
    if (window.drawFarmPlots) await window.drawFarmPlots();
    if (window.drawMegaObjects) await window.drawMegaObjects();
    if (window.drawElements) await window.drawElements();
    if (window.drawBuiltElements) await window.drawBuiltElements();
    if (window.drawVehicles) await window.drawVehicles();
    if (window.drawMegaElements) await window.drawMegaElements();
    
    if (window.drawStar) {
        await window.drawStar(gameState.goalPos.x * TILE_SIZE + TILE_SIZE/2, 
                              gameState.goalPos.y * TILE_SIZE + TILE_SIZE/2);
    }
    
    drawCharacter(gameState.playerPos.x, gameState.playerPos.y, gameState.playerDirection);
    
    if (gameState.hoveredTile.x >= 0 && gameState.hoveredTile.y >= 0) {
        if (window.drawTileHover) {
            window.drawTileHover(gameState.hoveredTile.x, gameState.hoveredTile.y);
        }
    }
    
    if (window.updateViewport) window.updateViewport();
}

function animateMove(fromX, fromY, toX, toY, direction) {
    return new Promise(resolve => {
        gameState.playerDirection = direction;
        const startTime = Date.now();
        
        const moveDuration = SPEED_SETTINGS[currentSpeed].duration;
        const TILE_SIZE = window.TILE_SIZE || 32;
        
        playStepSound();
        
        if (gameState.spriteImage) {
            gameState.currentSpriteFrame = 0;
        }
        
        async function animate() {
            const canvas = document.getElementById('game-canvas');
            const ctx = canvas ? canvas.getContext('2d') : null;
            if (!ctx) return;
            
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / moveDuration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            if (gameState.spriteImage) {
                gameState.currentSpriteFrame = Math.floor((elapsed / 60)) % 6;
            }
            
            let hopHeight = 0;
            if (!gameState.spriteImage) {
                if (progress < 0.5) {
                    hopHeight = Math.sin(progress * Math.PI) * 3;
                } else {
                    hopHeight = Math.sin(progress * Math.PI) * 3;
                }
            }
            
            gameState.playerPos.x = fromX + (toX - fromX) * easeProgress;
            gameState.playerPos.y = fromY + (toY - fromY) * easeProgress;
            
            if (window.updateViewport) window.updateViewport();
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (gameState.backgroundImage) {
                ctx.drawImage(gameState.backgroundImage, 0, 0, canvas.width, canvas.height);
            }
            
            const tilePromises = [];
            for (let y = 0; y < gameState.mapHeight; y++) {
                for (let x = 0; x < gameState.mapWidth; x++) {
                    if (gameState.mapData[y] && gameState.mapData[y][x] !== undefined) {
                        const tileType = gameState.mapData[y][x];
                        
                        if (gameState.backgroundImage) {
                            if (tileType !== 7) {
                                continue;
                            }
                        }
                        
                        if (window.drawTile) {
                            tilePromises.push(window.drawTile(x, y, tileType));
                        }
                    }
                }
            }
            await Promise.all(tilePromises);
            
            if (window.drawFarmPlots) await window.drawFarmPlots();
            if (window.drawMegaObjects) await window.drawMegaObjects();
            if (window.drawElements) await window.drawElements();
            if (window.drawBuiltElements) await window.drawBuiltElements();
            if (window.drawVehicles) await window.drawVehicles();
            if (window.drawMegaElements) await window.drawMegaElements();
            
            if (window.drawStar) {
                await window.drawStar(gameState.goalPos.x * TILE_SIZE + TILE_SIZE/2, 
                                      gameState.goalPos.y * TILE_SIZE + TILE_SIZE/2);
            }
            
            drawCharacterWithHop(gameState.playerPos.x, gameState.playerPos.y, 
                               gameState.playerDirection, hopHeight);
            
            if (gameState.hoveredTile.x >= 0 && gameState.hoveredTile.y >= 0) {
                if (window.drawTileHover) {
                    window.drawTileHover(gameState.hoveredTile.x, gameState.hoveredTile.y);
                }
            }
            
            if (progress < 1) {
                requestAnimationFrame(() => animate());
            } else {
                await render();
                resolve();
            }
        }
        
        animate();
    });
}

function canMoveTo(x, y) {
    if (x < 0 || x >= gameState.mapWidth || y < 0 || y >= gameState.mapHeight) {
        return false;
    }
    
    if (window.MegaElementManager && MegaElementManager.isTileBlocked(x, y)) {
        return false;
    }
    
    const tile = gameState.mapData[y][x];
    const tileInfo = tileDataById[tile];
    
    if (!tileInfo) return true;
    if (!tileInfo.access) return true;
    if (tileInfo.access === "blocked") return false;
    
    if (Array.isArray(tileInfo.access)) {
        const charType = gameState.characterType || "player";
        return tileInfo.access.includes(charType);
    }
    
    if (typeof tileInfo.access === "object" && tileInfo.access.requires) {
        return checkAccessRequirements(tileInfo.access.requires);
    }
    
    return true;
}

function checkWinCondition() {
    const px = Math.floor(gameState.playerPos.x);
    const py = Math.floor(gameState.playerPos.y);
    const gx = gameState.goalPos.x;
    const gy = gameState.goalPos.y;
    
    if (px === gx && py === gy) {
        gameState.levelCompleted[currentLevel] = true;
        
        if (window.UserProgressManager) {
            UserProgressManager.markCompletion();
        }
        
        updateProgressIndicators();
        document.getElementById('victory-modal').classList.add('show');
    }
}

function checkVictory() {
    const px = Math.floor(gameState.playerPos.x);
    const py = Math.floor(gameState.playerPos.y);
    const gx = gameState.goalPos.x;
    const gy = gameState.goalPos.y;
    
    return px === gx && py === gy;
}

function animationLoop() {
    if (!gameState.isRunning) {
        if (gameState.idlePhase === 0) {
            gameState.idlePauseTime++;
            if (gameState.idlePauseTime >= gameState.idlePauseDuration) {
                gameState.idlePhase = 1;
                gameState.idlePauseTime = 0;
                gameState.idleAnimation = 0;
            }
        } else {
            gameState.idleAnimation++;
            gameState.spriteAnimationCounter++;
            
            if (gameState.idleAnimation >= 120) {
                gameState.idlePhase = 0;
                gameState.idlePauseTime = 0;
                gameState.idleAnimation = 0;
                gameState.spriteAnimationCounter = 0;
            }
        }
        
        if (gameState.idlePhase === 1) {
            render();
        }
    }
    
    requestAnimationFrame(animationLoop);
}

window.render = render;

console.log('[GameEngine] Module loaded');
