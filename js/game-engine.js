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

// SVG tile cache to store loaded images
const svgTileCache = new Map();
const svgLoadPromises = new Map();

// Tile manifest loaded from assets/map/tiles.json
let tileManifest = null;

// Collectible SVGs - loaded dynamically from server
let COLLECTIBLE_SVGS = {};

// Track failed SVG loads to avoid repeated attempts
const svgFailedLoads = new Set();
let svgFailureWarned = false;

// Draw fallback pink pixel character when no sprite is loaded
function drawFallbackCharacter(cx, animY) {
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

// Load tiles manifest from assets folder
async function loadTilesManifest() {
    try {
        const response = await fetch('/assets/map/tiles.json');
        tileManifest = await response.json();
        console.log('Tiles manifest loaded:', Object.keys(tileManifest.tiles).length, 'tiles');
    } catch (error) {
        console.error('Failed to load tiles manifest:', error);
        throw error;
    }
}

// Load collectibles manifest from server
async function loadCollectiblesManifest() {
    try {
        const response = await fetch('/collectibles.json');
        COLLECTIBLE_SVGS = await response.json();
        console.log('Collectibles loaded:', Object.keys(COLLECTIBLE_SVGS));
    } catch (error) {
        console.warn('Could not load collectibles manifest, using defaults');
        COLLECTIBLE_SVGS = {
            gem: 'assets/map/collectibles/collectible-gem.svg',
            coin: 'assets/map/collectibles/collectible-coin.svg'
        };
    }
}

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
    // Load manifests first
    await loadTilesManifest();
    await loadCollectiblesManifest();
    
    const basePath = 'assets/map/';
    const tilesToLoad = [
        ...Object.values(tileManifest.tiles).map(t => basePath + t.path),
        basePath + tileManifest.special.star,
        ...Object.values(COLLECTIBLE_SVGS)
    ];
    
    await Promise.all(tilesToLoad.map(path => loadSVGImage(path)));
    console.log('SVG tiles preloaded');
}

// Helper to get tile SVG path from manifest
function getTilePath(tileType) {
    if (!tileManifest) return null;
    const tile = tileManifest.tiles[tileType];
    return tile ? 'assets/map/' + tile.path : null;
}

// Helper to get tile fallback color from manifest
function getTileFallbackColor(tileType) {
    if (!tileManifest) return '#333';
    const tile = tileManifest.tiles[tileType];
    return tile ? tile.fallbackColor : '#333';
}

// Helper to check if tile is an overlay (should draw on grass)
function isTileOverlay(tileType) {
    if (!tileManifest) return false;
    const tile = tileManifest.tiles[tileType];
    return tile ? tile.overlayOnGrass === true : false;
}

// Drawing functions
async function drawCollectibles() {
    if (!gameState.collectibles) return;
    
    const collectiblePromises = gameState.collectibles
        .filter(c => !c.collected)
        .map(async (collectible) => {
            const px = collectible.x * TILE_SIZE;
            const py = collectible.y * TILE_SIZE;
            
            const svgPath = COLLECTIBLE_SVGS[collectible.type];
            
            if (svgPath) {
                const img = await loadSVGImage(svgPath);
                if (img) {
                    const grassImg = await loadSVGImage(getTilePath(TILES.GRASS));
                    if (grassImg) {
                        ctx.drawImage(grassImg, px, py, TILE_SIZE, TILE_SIZE);
                    }
                    ctx.drawImage(img, px, py, TILE_SIZE, TILE_SIZE);
                } else {
                    console.warn(`Collectible type "${collectible.type}" not found in manifest`);
                }
            }
        });
    
    await Promise.all(collectiblePromises);
}

async function drawTile(x, y, type) {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    
    // Handle overlay tiles (draw on grass first)
    if (isTileOverlay(type)) {
        const grassImg = await loadSVGImage(getTilePath(TILES.GRASS));
        if (grassImg) {
            ctx.drawImage(grassImg, px, py, TILE_SIZE, TILE_SIZE);
        } else {
            ctx.fillStyle = getTileFallbackColor(TILES.GRASS);
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }
        
        const overlayPath = getTilePath(type);
        if (overlayPath) {
            const overlayImg = await loadSVGImage(overlayPath);
            if (overlayImg) {
                ctx.drawImage(overlayImg, px, py, TILE_SIZE, TILE_SIZE);
            } else {
                ctx.fillStyle = getTileFallbackColor(type);
                ctx.fillRect(px + 8, py + 8, TILE_SIZE - 16, TILE_SIZE - 16);
            }
        }
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
        return;
    }
    
    // Normal tile rendering
    const svgPath = getTilePath(type);
    if (svgPath) {
        const img = await loadSVGImage(svgPath);
        if (img) {
            ctx.drawImage(img, px, py, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
            return;
        }
    }
    
    // Fallback to colored rectangle
    ctx.fillStyle = getTileFallbackColor(type);
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
}

async function drawStar(x, y) {
    if (tileManifest && tileManifest.special) {
        const starPath = 'assets/map/' + tileManifest.special.star;
        const img = await loadSVGImage(starPath);
        if (img) {
            ctx.drawImage(img, x - TILE_SIZE/2, y - TILE_SIZE/2, TILE_SIZE, TILE_SIZE);
            return;
        }
    }
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x - 2, y - 8, 4, 16);
    ctx.fillRect(x - 8, y - 2, 16, 4);
    ctx.fillRect(x - 6, y - 6, 12, 12);
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
        // Fallback character with idle animation
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
        drawFallbackCharacter(cx, cy - hopHeight);
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
    
    // Draw collectibles using their types
    await drawCollectibles();
    
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
            
            // Draw collectibles using their types
            await drawCollectibles();
            
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
    
    if (px === gx && py === gy) {
        gameState.levelCompleted[currentLevel] = true;
        
        // Show victory modal
        updateProgressIndicators();
        document.getElementById('victory-modal').classList.add('show');
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