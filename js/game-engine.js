// ============================================
// GAME ENGINE - Rendering & Movement
// ============================================

// Tile type constants
const TILES = {
    GRASS: 0,
    GRASS_DARK: 1,
    PATH: 2,
    TREE: 3,
    BUSH: 4,
    WATER: 5,
    ROCK: 6,
    FLOWER: 7
};

// Tile colors (fallback when SVGs not available)
const tileColors = {
    [TILES.GRASS]: '#7fc97f',
    [TILES.GRASS_DARK]: '#6fb96f',
    [TILES.PATH]: '#d4b896',
    [TILES.TREE]: '#4a7c4e',
    [TILES.BUSH]: '#5a8c5e',
    [TILES.WATER]: '#6fa8dc',
    [TILES.ROCK]: '#888',
    [TILES.FLOWER]: '#7fc97f'
};

// SVG tile cache to store loaded images
const svgTileCache = new Map();
const svgLoadPromises = new Map();

// SVG tile mapping
const SVG_TILES = {
    [TILES.GRASS]: 'assets/map/tiles/grass.svg',
    [TILES.GRASS_DARK]: 'assets/map/tiles/grass-dark.svg',
    [TILES.PATH]: 'assets/map/tiles/path.svg',
    [TILES.WATER]: 'assets/map/tiles/water.svg',
    [TILES.ROCK]: 'assets/map/tiles/rock.svg',
    [TILES.TREE]: 'assets/map/objects/tree.svg',
    [TILES.BUSH]: 'assets/map/objects/bush.svg',
    [TILES.FLOWER]: 'assets/map/objects/flower.svg'
};

// Special item SVGs
const SPECIAL_SVGS = {
    star: 'assets/map/special/star-goal.svg'
};

// Collectible SVGs - organized in their own folder for easy expansion
const COLLECTIBLE_SVGS = {
    gem: 'assets/map/collectibles/collectible-gem.svg',
    coin: 'assets/map/collectibles/collectible-coin.svg',
    key: 'assets/map/collectibles/key.svg',
    heart: 'assets/map/collectibles/heart.svg',
    star_collectible: 'assets/map/collectibles/star.svg',
    apple: 'assets/map/collectibles/apple.svg'
};

// Track failed SVG loads to avoid repeated attempts
const svgFailedLoads = new Set();
let svgFailureWarned = false;

// Load SVG as Image
async function loadSVGImage(path) {
    // Check cache first (includes both successful and failed loads)
    if (svgTileCache.has(path)) {
        return svgTileCache.get(path);
    }
    
    // Check if we already know this SVG failed to load
    if (svgFailedLoads.has(path)) {
        return null;
    }
    
    // Check if already loading
    if (svgLoadPromises.has(path)) {
        return svgLoadPromises.get(path);
    }
    
    const loadPromise = new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            svgTileCache.set(path, img);
            svgLoadPromises.delete(path);
            resolve(img);
        };
        img.onerror = () => {
            // Cache the failure to prevent repeated load attempts
            svgFailedLoads.add(path);
            svgTileCache.set(path, null);  // Cache null result
            svgLoadPromises.delete(path);
            
            // Only warn once about SVG failures
            if (!svgFailureWarned) {
                console.warn(`Some SVG tiles failed to load, using fallback rendering`);
                svgFailureWarned = true;
            }
            
            resolve(null);
        };
        img.src = path;
    });
    
    svgLoadPromises.set(path, loadPromise);
    return loadPromise;
}

// Preload all SVG tiles for better performance
async function preloadSVGTiles() {
    const tilesToLoad = [
        ...Object.values(SVG_TILES),
        ...Object.values(SPECIAL_SVGS),
        ...Object.values(COLLECTIBLE_SVGS)
    ];
    
    await Promise.all(tilesToLoad.map(path => loadSVGImage(path)));
    console.log('SVG tiles preloaded');
}

// Drawing functions
async function drawTile(x, y, type) {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    
    // Special handling for flowers and bushes - draw them as overlays on grass
    if (type === TILES.FLOWER || type === TILES.BUSH) {
        // First draw grass underneath
        const grassImg = await loadSVGImage(SVG_TILES[TILES.GRASS]);
        if (grassImg) {
            ctx.drawImage(grassImg, px, py, TILE_SIZE, TILE_SIZE);
        } else {
            // Fallback grass
            ctx.fillStyle = tileColors[TILES.GRASS];
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }
        
        // Then draw the flower/bush overlay
        const overlayPath = SVG_TILES[type];
        if (overlayPath) {
            const overlayImg = await loadSVGImage(overlayPath);
            if (overlayImg) {
                ctx.drawImage(overlayImg, px, py, TILE_SIZE, TILE_SIZE);
            } else {
                // Fallback drawing for flower/bush
                if (type === TILES.FLOWER) {
                    ctx.fillStyle = '#ff69b4';
                    ctx.fillRect(px + 10, py + 10, 4, 4);
                    ctx.fillRect(px + 18, py + 18, 4, 4);
                } else if (type === TILES.BUSH) {
                    drawBush(px + TILE_SIZE/2, py + TILE_SIZE/2);
                }
            }
        }
        
        // Grid lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
        return;
    }
    
    // Normal tile rendering for everything else
    const svgPath = SVG_TILES[type];
    if (svgPath) {
        const img = await loadSVGImage(svgPath);
        if (img) {
            ctx.drawImage(img, px, py, TILE_SIZE, TILE_SIZE);
            // Grid lines
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
            return;
        }
    }
    
    // Fallback to original colored rectangle rendering
    ctx.fillStyle = tileColors[type] || '#333';
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    
    // Fallback for trees if SVG fails (trees still replace the tile)
    if (type === TILES.TREE && !svgPath) {
        drawTree(px + TILE_SIZE/2, py + TILE_SIZE/2);
    }
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
}

function drawTree(x, y) {
    ctx.fillStyle = '#654321';
    ctx.fillRect(x - 2, y + 6, 4, 6);
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(x - 8, y - 4, 16, 10);
    ctx.fillRect(x - 6, y - 8, 12, 6);
}

function drawBush(x, y) {
    ctx.fillStyle = '#4a7c4e';
    ctx.fillRect(x - 10, y - 2, 20, 8);
}

async function drawStar(x, y) {
    // Try to use SVG star first
    const img = await loadSVGImage(SPECIAL_SVGS.star);
    if (img) {
        // Draw centered on the position
        ctx.drawImage(img, x - TILE_SIZE/2, y - TILE_SIZE/2, TILE_SIZE, TILE_SIZE);
    } else {
        // Fallback to original star drawing
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x - 2, y - 8, 4, 16);
        ctx.fillRect(x - 8, y - 2, 16, 4);
        ctx.fillRect(x - 6, y - 6, 12, 12);
    }
}

function drawTileHover(x, y) {
    // Draw corner brackets on the hovered tile
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    const cornerLength = 4; // Length of each corner bracket line
    const thickness = 2; // Thickness of the lines
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Top-left corner
    ctx.fillRect(px, py, cornerLength, thickness); // Horizontal
    ctx.fillRect(px, py, thickness, cornerLength); // Vertical
    
    // Top-right corner
    ctx.fillRect(px + TILE_SIZE - cornerLength, py, cornerLength, thickness); // Horizontal
    ctx.fillRect(px + TILE_SIZE - thickness, py, thickness, cornerLength); // Vertical
    
    // Bottom-left corner
    ctx.fillRect(px, py + TILE_SIZE - thickness, cornerLength, thickness); // Horizontal
    ctx.fillRect(px, py + TILE_SIZE - cornerLength, thickness, cornerLength); // Vertical
    
    // Bottom-right corner
    ctx.fillRect(px + TILE_SIZE - cornerLength, py + TILE_SIZE - thickness, cornerLength, thickness); // Horizontal
    ctx.fillRect(px + TILE_SIZE - thickness, py + TILE_SIZE - cornerLength, thickness, cornerLength); // Vertical
}

function drawCharacter(x, y, direction) {
    const cx = x * TILE_SIZE + TILE_SIZE / 2;
    const cy = y * TILE_SIZE + TILE_SIZE / 2;
    
    // If we have a sprite loaded, use it
    if (gameState.spriteImage && gameState.spriteFrameWidth > 0) {
        // Draw sprite frame
        let frameX = 0;
        let frameY = 0;
        
        if (gameState.isRunning) {
            // Use walking animation (bottom row)
            frameY = 1;
            // Cycle through all 6 walking frames
            frameX = gameState.currentSpriteFrame % 6;
        } else {
            // Use idle animation (top row)
            frameY = 0;
            if (gameState.idlePhase === 1) {
                // Cycle through the 4 idle frames slowly
                frameX = Math.floor(gameState.spriteAnimationCounter / 15) % 4;
            } else {
                // During pause, show first idle frame
                frameX = 0;
            }
        }
        
        // Scale factor for the sprite (1.5x larger)
        const scale = 1.5;
        const drawWidth = gameState.spriteFrameWidth * scale;
        const drawHeight = gameState.spriteFrameHeight * scale;
        
        // Draw the sprite centered on the tile
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
        // Original character drawing with animation
        let yOffset = 0;
        if (!gameState.isRunning) {
            // Intermittent floating when idle
            if (gameState.idlePhase === 1) {
                // Animate phase - much slower, smoother floating
                yOffset = Math.sin(gameState.idleAnimation * 0.03) * 1.5;
            }
            // During pause phase (idlePhase === 0), yOffset stays at 0
        }
        // Note: yOffset stays 0 during movement (handled in animateMove)
        
        const animY = cy + yOffset;
        
        // Draw character with animation offset
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
}

function drawCharacterWithHop(x, y, direction, hopHeight) {
    const cx = x * TILE_SIZE + TILE_SIZE / 2;
    const cy = y * TILE_SIZE + TILE_SIZE / 2;
    
    // If we have a sprite loaded, use it
    if (gameState.spriteImage && gameState.spriteFrameWidth > 0) {
        // Walking animation - cycle through bottom row
        const frameY = 1; // Bottom row for walking
        const frameX = gameState.currentSpriteFrame % 6;
        
        // Scale factor for the sprite (1.5x larger)
        const scale = 1.5;
        const drawWidth = gameState.spriteFrameWidth * scale;
        const drawHeight = gameState.spriteFrameHeight * scale;
        
        // Apply hop offset
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
        // Original character with hop
        const animY = cy - hopHeight;
        
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
}

async function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw placeholder if no level loaded
    if (!courseData || gameState.mapData.length === 0) {
        ctx.fillStyle = '#2a3f2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#7fc542';
        ctx.font = '20px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Load a chapter to begin', canvas.width/2, canvas.height/2);
        return;
    }
    
    // Draw background graphic if available
    if (gameState.backgroundImage) {
        // Draw the background image stretched to fit the entire canvas
        ctx.drawImage(gameState.backgroundImage, 0, 0, canvas.width, canvas.height);
    }
    
    // Draw tiles (or just collectibles if using background image)
    const tilePromises = [];
    for (let y = 0; y < gameState.mapHeight; y++) {
        for (let x = 0; x < gameState.mapWidth; x++) {
            if (gameState.mapData[y] && gameState.mapData[y][x] !== undefined) {
                const tileType = gameState.mapData[y][x];
                
                // If we have a background image, only render collectibles (value 7)
                // Everything else is invisible collision data
                if (gameState.backgroundImage) {
                    if (tileType !== 7) {
                        continue; // Skip all non-collectible tiles
                    }
                }
                
                tilePromises.push(drawTile(x, y, tileType));
            }
        }
    }
    await Promise.all(tilePromises);
    
    await drawStar(gameState.goalPos.x * TILE_SIZE + TILE_SIZE/2, 
                  gameState.goalPos.y * TILE_SIZE + TILE_SIZE/2);
    
    drawCharacter(gameState.playerPos.x, gameState.playerPos.y, gameState.playerDirection);
    
    // Draw tile hover highlight
    if (gameState.hoveredTile.x >= 0 && gameState.hoveredTile.y >= 0) {
        drawTileHover(gameState.hoveredTile.x, gameState.hoveredTile.y);
    }
    
    // Update viewport to follow player
    updateViewport();
}

// Movement animation
function animateMove(fromX, fromY, toX, toY, direction) {
    return new Promise(resolve => {
        gameState.playerDirection = direction;
        const startTime = Date.now();
        
        // Get current speed duration
        const moveDuration = SPEED_SETTINGS[currentSpeed].duration;
        
        // Play step sound at the start of each move
        playStepSound();
        
        // Reset sprite animation for this move
        if (gameState.spriteImage) {
            gameState.currentSpriteFrame = 0;
        }
        
        async function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / moveDuration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            // Update sprite frame for walking animation
            if (gameState.spriteImage) {
                // Change frame every few milliseconds for smooth animation
                gameState.currentSpriteFrame = Math.floor((elapsed / 60)) % 6;
            }
            
            // Simple hop animation - up in first half, down in second half
            let hopHeight = 0;
            if (!gameState.spriteImage) {
                // Only apply hop to default character
                if (progress < 0.5) {
                    // Rising phase
                    hopHeight = Math.sin(progress * Math.PI) * 3;
                } else {
                    // Falling phase
                    hopHeight = Math.sin(progress * Math.PI) * 3;
                }
            }
            
            gameState.playerPos.x = fromX + (toX - fromX) * easeProgress;
            gameState.playerPos.y = fromY + (toY - fromY) * easeProgress;
            
            // Update viewport to follow player during movement
            updateViewport();
            
            // Clear and redraw everything
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background graphic if available (MUST be before tiles!)
            if (gameState.backgroundImage) {
                ctx.drawImage(gameState.backgroundImage, 0, 0, canvas.width, canvas.height);
            }
            
            // Draw tiles (or just collectibles if using background image)
            const tilePromises = [];
            for (let y = 0; y < gameState.mapHeight; y++) {
                for (let x = 0; x < gameState.mapWidth; x++) {
                    if (gameState.mapData[y] && gameState.mapData[y][x] !== undefined) {
                        const tileType = gameState.mapData[y][x];
                        
                        // If we have a background image, only render collectibles (value 7)
                        // Everything else is invisible collision data
                        if (gameState.backgroundImage) {
                            if (tileType !== 7) {
                                continue; // Skip all non-collectible tiles
                            }
                        }
                        
                        tilePromises.push(drawTile(x, y, tileType));
                    }
                }
            }
            await Promise.all(tilePromises);
            
            // Draw goal star
            await drawStar(gameState.goalPos.x * TILE_SIZE + TILE_SIZE/2, 
                          gameState.goalPos.y * TILE_SIZE + TILE_SIZE/2);
            
            // Draw character with animation
            drawCharacterWithHop(gameState.playerPos.x, gameState.playerPos.y, 
                               gameState.playerDirection, hopHeight);
            
            // Draw tile hover highlight during animation too
            if (gameState.hoveredTile.x >= 0 && gameState.hoveredTile.y >= 0) {
                drawTileHover(gameState.hoveredTile.x, gameState.hoveredTile.y);
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

// Check if player can move to position
function canMoveTo(x, y) {
    if (x < 0 || x >= gameState.mapWidth || y < 0 || y >= gameState.mapHeight) {
        return false;
    }
    
    const tile = gameState.mapData[y][x];
    if (tile === TILES.TREE || tile === TILES.WATER || tile === TILES.ROCK) {
        return false;
    }
    
    return true;
}

// Update viewport - centers each axis independently
function updateViewport() {
    const viewport = document.getElementById('game-viewport');
    if (!viewport) return;
    
    // Get viewport dimensions
    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    
    // Get canvas dimensions
    const canvasWidth = gameState.mapWidth * TILE_SIZE;
    const canvasHeight = gameState.mapHeight * TILE_SIZE;
    
    // Get player position in pixels
    const playerPixelX = gameState.playerPos.x * TILE_SIZE + TILE_SIZE/2;
    const playerPixelY = gameState.playerPos.y * TILE_SIZE + TILE_SIZE/2;
    
    let offsetX, offsetY;
    
    // Handle horizontal centering/scrolling independently
    if (viewportWidth >= canvasWidth) {
        // Map fits horizontally - center it
        offsetX = (viewportWidth - canvasWidth) / 2;
    } else {
        // Map is wider than viewport - follow the player horizontally
        offsetX = viewportWidth/2 - playerPixelX;
        
        // Constrain to map boundaries (no empty space on left/right)
        const minOffsetX = Math.min(0, viewportWidth - canvasWidth);
        offsetX = Math.max(minOffsetX, Math.min(0, offsetX));
    }
    
    // Handle vertical centering/scrolling independently
    if (viewportHeight >= canvasHeight) {
        // Map fits vertically - center it
        offsetY = (viewportHeight - canvasHeight) / 2;
    } else {
        // Map is taller than viewport - follow the player vertically
        offsetY = viewportHeight/2 - playerPixelY;
        
        // Constrain to map boundaries (no empty space on top/bottom)
        const minOffsetY = Math.min(0, viewportHeight - canvasHeight);
        offsetY = Math.max(minOffsetY, Math.min(0, offsetY));
    }
    
    // Apply transform to position canvas
    canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}

// Check win condition
function checkWinCondition() {
    const px = Math.floor(gameState.playerPos.x);
    const py = Math.floor(gameState.playerPos.y);
    const gx = gameState.goalPos.x;
    const gy = gameState.goalPos.y;
    
    // Check for resource collection in mission mode
    if (typeof missionMode !== 'undefined' && missionMode && missionMode.currentMode === 'mission') {
        checkResourceCollection(px, py);
    }
    
    if (px === gx && py === gy) {
        gameState.levelCompleted[currentLevel] = true;
        
        // Show victory modal
        updateProgressIndicators();
        document.getElementById('victory-modal').classList.add('show');
    }
}

// Check if player collected a resource
function checkResourceCollection(x, y) {
    // Check if there's a collectible at this position
    if (gameState.mapData[y] && gameState.mapData[y][x] === 7) {
        // Remove the collectible from the map
        gameState.mapData[y][x] = 0;
        
        // Add to mission mode resources
        if (missionMode && missionMode.currentMission) {
            // Check mission-specific resources
            const mission = missionMode.currentMission;
            if (mission.map && mission.map.resourcesToCollect) {
                // Find what type of resource this is
                for (let resourceDef of mission.map.resourcesToCollect) {
                    for (let pos of resourceDef.positions) {
                        if (pos[0] === x && pos[1] === y) {
                            // Found the resource type
                            missionMode.addResource(resourceDef.type, 1);
                            console.log(`Collected ${resourceDef.type}!`);
                            
                            // Show collection notification
                            if (missionMode.showNotification) {
                                missionMode.showNotification(`+1 ${resourceDef.type}!`, 'success');
                            }
                            
                            // Check mission completion
                            missionMode.checkMissionCompletion();
                            
                            // Re-render to remove the collectible
                            render();
                            return;
                        }
                    }
                }
            }
            
            // Default resource collection if not specified
            missionMode.addResource('food', 1);
            render();
        }
    }
}

// Check if player reached the goal (for tutor)
function checkVictory() {
    const px = Math.floor(gameState.playerPos.x);
    const py = Math.floor(gameState.playerPos.y);
    const gx = gameState.goalPos.x;
    const gy = gameState.goalPos.y;
    
    return px === gx && py === gy;
}

// Animation loop for idle animations
function animationLoop() {
    if (!gameState.isRunning) {
        // Handle idle animation phases
        if (gameState.idlePhase === 0) {
            // Pause phase
            gameState.idlePauseTime++;
            if (gameState.idlePauseTime >= gameState.idlePauseDuration) {
                // Switch to animation phase
                gameState.idlePhase = 1;
                gameState.idlePauseTime = 0;
                gameState.idleAnimation = 0;
            }
        } else {
            // Animation phase
            gameState.idleAnimation++;
            gameState.spriteAnimationCounter++;
            
            // After completing a few animation cycles (roughly 2 seconds of animation)
            if (gameState.idleAnimation >= 120) {
                // Switch back to pause phase
                gameState.idlePhase = 0;
                gameState.idlePauseTime = 0;
                gameState.idleAnimation = 0;
                gameState.spriteAnimationCounter = 0;
            }
        }
        
        // Only re-render during animation phase, not during pause
        if (gameState.idlePhase === 1) {
            render();
        }
    }
    
    requestAnimationFrame(animationLoop);
}