// ============================================
// GAME ENGINE - Rendering & Movement
// ============================================

// Drawing functions
function drawTile(x, y, type) {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    
    ctx.fillStyle = tileColors[type] || '#333';
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
    
    if (type === TILES.TREE) {
        drawTree(px + TILE_SIZE/2, py + TILE_SIZE/2);
    } else if (type === TILES.BUSH) {
        drawBush(px + TILE_SIZE/2, py + TILE_SIZE/2);
    } else if (type === TILES.FLOWER) {
        ctx.fillStyle = '#ff69b4';
        ctx.fillRect(px + 10, py + 10, 4, 4);
        ctx.fillRect(px + 18, py + 18, 4, 4);
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

function drawStar(x, y) {
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x - 2, y - 8, 4, 16);
    ctx.fillRect(x - 8, y - 2, 16, 4);
    ctx.fillRect(x - 6, y - 6, 12, 12);
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

function render() {
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
    
    for (let y = 0; y < gameState.mapHeight; y++) {
        for (let x = 0; x < gameState.mapWidth; x++) {
            if (gameState.mapData[y] && gameState.mapData[y][x] !== undefined) {
                drawTile(x, y, gameState.mapData[y][x]);
            }
        }
    }
    
    drawStar(gameState.goalPos.x * TILE_SIZE + TILE_SIZE/2, 
            gameState.goalPos.y * TILE_SIZE + TILE_SIZE/2);
    
    drawCharacter(gameState.playerPos.x, gameState.playerPos.y, gameState.playerDirection);
    
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
        
        function animate() {
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
            
            // Draw tiles
            for (let y = 0; y < gameState.mapHeight; y++) {
                for (let x = 0; x < gameState.mapWidth; x++) {
                    if (gameState.mapData[y] && gameState.mapData[y][x] !== undefined) {
                        drawTile(x, y, gameState.mapData[y][x]);
                    }
                }
            }
            
            // Draw goal star
            drawStar(gameState.goalPos.x * TILE_SIZE + TILE_SIZE/2, 
                    gameState.goalPos.y * TILE_SIZE + TILE_SIZE/2);
            
            // Draw character with animation
            drawCharacterWithHop(gameState.playerPos.x, gameState.playerPos.y, 
                               gameState.playerDirection, hopHeight);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                render();
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