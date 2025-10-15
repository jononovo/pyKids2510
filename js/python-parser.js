// ============================================
// PYTHON COMMAND PARSER & EXECUTOR
// ============================================

async function executeCommand(cmd) {
    if (cmd.includes('move_forward')) {
        const match = cmd.match(/move_forward\((\d*)\)/);
        const steps = match && match[1] ? parseInt(match[1]) : 1;
        
        for (let i = 0; i < steps; i++) {
            await moveForward();
        }
    } else if (cmd.includes('turn_left')) {
        await turnLeft();
    } else if (cmd.includes('turn_right')) {
        await turnRight();
    }
}

async function moveForward() {
    const { x, y } = gameState.playerPos;
    let newX = Math.floor(x);
    let newY = Math.floor(y);
    
    switch (gameState.playerDirection) {
        case 'up': newY--; break;
        case 'down': newY++; break;
        case 'left': newX--; break;
        case 'right': newX++; break;
    }
    
    if (canMoveTo(newX, newY)) {
        await animateMove(x, y, newX, newY, gameState.playerDirection);
        checkWinCondition();
    }
}

async function turnLeft() {
    const directions = ['up', 'left', 'down', 'right'];
    const currentIndex = directions.indexOf(gameState.playerDirection);
    gameState.playerDirection = directions[(currentIndex + 1) % 4];
    
    // Small turn animation
    await new Promise(resolve => {
        const duration = SPEED_SETTINGS[currentSpeed].duration / 2;
        setTimeout(() => {
            render();
            resolve();
        }, duration);
    });
}

async function turnRight() {
    const directions = ['up', 'right', 'down', 'left'];
    const currentIndex = directions.indexOf(gameState.playerDirection);
    gameState.playerDirection = directions[(currentIndex + 1) % 4];
    
    // Small turn animation
    await new Promise(resolve => {
        const duration = SPEED_SETTINGS[currentSpeed].duration / 2;
        setTimeout(() => {
            render();
            resolve();
        }, duration);
    });
}

// Run the Python code
async function runCode() {
    if (gameState.isRunning) return;
    
    gameState.isRunning = true;
    document.getElementById('run-btn').disabled = true;
    
    // Get code from either text editor or Blockly depending on current mode
    let code;
    if (window.BlocklyModeSwitcher && window.BlocklyModeSwitcher.isBlockMode()) {
        code = window.BlocklyModeSwitcher.getCode();
    } else {
        code = jar.toString();
    }
    
    const lines = code.split('\n');
    
    // Reset player position
    gameState.playerPos = {...gameState.startPos};
    gameState.playerDirection = 'right';
    render();
    updateViewport();
    
    // Track execution for tutor
    let executionError = null;
    let executedCommands = 0;
    
    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#') || line.startsWith('import')) continue;
        
        if (line.includes('player.')) {
            const cmd = line.replace('player.', '');
            try {
                await executeCommand(cmd);
                executedCommands++;
            } catch (error) {
                executionError = { line, error: error.message };
                break;
            }
        }
    }
    
    // Check if code succeeded in reaching goal
    const reachedGoal = checkVictory();
    
    // If tutor is enabled and code didn't succeed, show help
    if (window.tutorEnabled && !reachedGoal) {
        // Analyze code and provide help
        analyzeCodeAndProvideHelp(code, executionError, executedCommands);
    }
    
    gameState.isRunning = false;
    document.getElementById('run-btn').disabled = false;
}

// Reset the game state
function resetGame() {
    gameState.playerPos = {...gameState.startPos};
    gameState.playerDirection = 'right';
    gameState.isRunning = false;
    document.getElementById('run-btn').disabled = false;
    render();
    updateViewport();
}