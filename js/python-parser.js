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
    } else if (cmd.includes('push')) {
        await push();
    } else if (cmd.includes('speak')) {
        const match = cmd.match(/speak\((.*)\)/);
        const message = match && match[1] ? match[1].trim() : '';
        await speak(message);
    } else if (cmd.includes('collect')) {
        const match = cmd.match(/collect\(['"](.*)['"]\)/);
        const resource = match && match[1] ? match[1] : null;
        await collect(resource);
    } else if (cmd.includes('water')) {
        await water();
    } else if (cmd.includes('open')) {
        await open();
    } else if (cmd.includes('close')) {
        await close();
    } else if (cmd.includes('place')) {
        const match = cmd.match(/place\((.*)\)/);
        const item = match && match[1] ? match[1].trim() : null;
        await place(item);
    } else if (cmd.includes('build')) {
        const match = cmd.match(/build\(['"](.*)['"]\)/);
        const objectName = match && match[1] ? match[1] : null;
        await build(objectName);
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

async function push() {
    const { x, y } = gameState.playerPos;
    const px = Math.floor(x);
    const py = Math.floor(y);
    
    let targetX = px;
    let targetY = py;
    
    switch (gameState.playerDirection) {
        case 'up': targetY--; break;
        case 'down': targetY++; break;
        case 'left': targetX--; break;
        case 'right': targetX++; break;
    }
    
    const object = findObjectAt(targetX, targetY, 'pushable');
    if (object) {
        let newX = targetX;
        let newY = targetY;
        
        switch (gameState.playerDirection) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }
        
        if (canMoveTo(newX, newY)) {
            object.x = newX;
            object.y = newY;
            await render();
            console.log('Pushed object to', newX, newY);
        }
    }
    
    await new Promise(resolve => setTimeout(resolve, SPEED_SETTINGS[currentSpeed].duration / 2));
}

async function speak(message) {
    if (!message) return;
    
    message = message.replace(/^["']|["']$/g, '');
    
    if (!gameState.messageLog) gameState.messageLog = [];
    gameState.messageLog.push(message);
    
    const messagePanel = document.getElementById('message-panel');
    if (messagePanel) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message-item';
        msgDiv.textContent = message;
        messagePanel.appendChild(msgDiv);
        messagePanel.scrollTop = messagePanel.scrollHeight;
    }
    
    console.log('Player says:', message);
    
    await new Promise(resolve => setTimeout(resolve, SPEED_SETTINGS[currentSpeed].duration));
}

async function collect(resource) {
    const { x, y } = gameState.playerPos;
    const px = Math.floor(x);
    const py = Math.floor(y);
    
    const collectibleIndex = gameState.collectibles.findIndex(c => c.x === px && c.y === py && !c.collected);
    
    if (collectibleIndex >= 0) {
        gameState.collectibles[collectibleIndex].collected = true;
        
        if (!gameState.inventory) gameState.inventory = {};
        const resourceType = resource || 'item';
        gameState.inventory[resourceType] = (gameState.inventory[resourceType] || 0) + 1;
        
        updateInventoryDisplay();
        await render();
        console.log('Collected:', resourceType);
    }
    
    await new Promise(resolve => setTimeout(resolve, SPEED_SETTINGS[currentSpeed].duration / 2));
}

async function water() {
    const { x, y } = gameState.playerPos;
    const px = Math.floor(x);
    const py = Math.floor(y);
    
    const crop = findObjectAt(px, py, 'crop');
    if (crop && !crop.watered) {
        crop.watered = true;
        await render();
        console.log('Watered crop at', px, py);
    }
    
    await new Promise(resolve => setTimeout(resolve, SPEED_SETTINGS[currentSpeed].duration / 2));
}

async function open() {
    const { x, y } = gameState.playerPos;
    const px = Math.floor(x);
    const py = Math.floor(y);
    
    let targetX = px;
    let targetY = py;
    
    switch (gameState.playerDirection) {
        case 'up': targetY--; break;
        case 'down': targetY++; break;
        case 'left': targetX--; break;
        case 'right': targetX++; break;
    }
    
    const door = findObjectAt(targetX, targetY, 'door');
    if (door) {
        door.open = true;
        await render();
        console.log('Opened door at', targetX, targetY);
    }
    
    await new Promise(resolve => setTimeout(resolve, SPEED_SETTINGS[currentSpeed].duration / 2));
}

async function close() {
    const { x, y } = gameState.playerPos;
    const px = Math.floor(x);
    const py = Math.floor(y);
    
    let targetX = px;
    let targetY = py;
    
    switch (gameState.playerDirection) {
        case 'up': targetY--; break;
        case 'down': targetY++; break;
        case 'left': targetX--; break;
        case 'right': targetX++; break;
    }
    
    const door = findObjectAt(targetX, targetY, 'door');
    if (door) {
        door.open = false;
        await render();
        console.log('Closed door at', targetX, targetY);
    }
    
    await new Promise(resolve => setTimeout(resolve, SPEED_SETTINGS[currentSpeed].duration / 2));
}

async function place(item) {
    if (!item) return;
    
    const { x, y } = gameState.playerPos;
    const px = Math.floor(x);
    const py = Math.floor(y);
    
    let targetX = px;
    let targetY = py;
    
    switch (gameState.playerDirection) {
        case 'up': targetY--; break;
        case 'down': targetY++; break;
        case 'left': targetX--; break;
        case 'right': targetX++; break;
    }
    
    const chest = findObjectAt(targetX, targetY, 'chest');
    if (chest) {
        if (!chest.contents) chest.contents = [];
        chest.contents.push(item);
        await render();
        console.log('Placed', item, 'in chest at', targetX, targetY);
    }
    
    await new Promise(resolve => setTimeout(resolve, SPEED_SETTINGS[currentSpeed].duration / 2));
}

async function build(objectName) {
    if (!objectName) return;
    
    const { x, y } = gameState.playerPos;
    const px = Math.floor(x);
    const py = Math.floor(y);
    
    let targetX = px;
    let targetY = py;
    
    switch (gameState.playerDirection) {
        case 'up': targetY--; break;
        case 'down': targetY++; break;
        case 'left': targetX--; break;
        case 'right': targetX++; break;
    }
    
    if (!gameState.objects) gameState.objects = [];
    
    gameState.objects.push({
        type: objectName,
        x: targetX,
        y: targetY,
        built: true
    });
    
    if (objectName === 'bridge') {
        if (gameState.mapData[targetY]) {
            gameState.mapData[targetY][targetX] = TILES.PATH;
        }
    }
    
    await render();
    console.log('Built', objectName, 'at', targetX, targetY);
    
    await new Promise(resolve => setTimeout(resolve, SPEED_SETTINGS[currentSpeed].duration));
}

function findObjectAt(x, y, type) {
    if (!gameState.objects) return null;
    return gameState.objects.find(obj => obj.x === x && obj.y === y && obj.type === type);
}

function updateInventoryDisplay() {
    const inventoryPanel = document.getElementById('inventory-panel');
    if (inventoryPanel && gameState.inventory) {
        inventoryPanel.innerHTML = '<strong>Inventory:</strong><br>';
        for (const [item, count] of Object.entries(gameState.inventory)) {
            const itemDiv = document.createElement('div');
            itemDiv.textContent = `${item}: ${count}`;
            inventoryPanel.appendChild(itemDiv);
        }
    }
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
    
    // Reset collectibles to uncollected state
    if (gameState.collectibles) {
        gameState.collectibles.forEach(c => c.collected = false);
    }
    
    // Clear message log
    gameState.messageLog = [];
    const messagePanel = document.getElementById('message-panel');
    if (messagePanel) {
        messagePanel.innerHTML = '';
    }
    
    render();
    updateViewport();
}