// Enhanced Python Command Parser with Action System Support

// Extended command executor that supports new actions
async function executeCommandEnhanced(cmd) {
    // Check if Actions Engine is available
    const hasActionsEngine = window.gameActionsEngine && window.gameActionsEngine.executor;
    
    // Original movement commands
    if (cmd.includes('move_forward')) {
        const match = cmd.match(/move_forward\((\d*)\)/);
        const steps = match && match[1] ? parseInt(match[1]) : 1;
        
        if (hasActionsEngine) {
            await window.gameActionsEngine.executor.execute('move_forward', { steps });
        } else {
            for (let i = 0; i < steps; i++) {
                await moveForward();
            }
        }
    } 
    else if (cmd.includes('turn_left')) {
        if (hasActionsEngine) {
            await window.gameActionsEngine.executor.execute('turn_left');
        } else {
            await turnLeft();
        }
    } 
    else if (cmd.includes('turn_right')) {
        if (hasActionsEngine) {
            await window.gameActionsEngine.executor.execute('turn_right');
        } else {
            await turnRight();
        }
    }
    // New action commands
    else if (cmd.includes('push()')) {
        if (hasActionsEngine) {
            await window.gameActionsEngine.executor.execute('push');
        } else {
            console.log('Push action not available - Actions Engine not loaded');
        }
    }
    else if (cmd.includes('open()')) {
        if (hasActionsEngine) {
            await window.gameActionsEngine.executor.execute('open');
        } else {
            console.log('Open action not available');
        }
    }
    else if (cmd.includes('close()')) {
        if (hasActionsEngine) {
            await window.gameActionsEngine.executor.execute('close');
        } else {
            console.log('Close action not available');
        }
    }
    else if (cmd.includes('collect')) {
        const match = cmd.match(/collect\(["']?(\w+)["']?\)/);
        const resource = match ? match[1] : null;
        
        if (hasActionsEngine) {
            await window.gameActionsEngine.executor.execute('collect', { resource });
        } else {
            console.log('Collect action not available');
        }
    }
    else if (cmd.includes('build')) {
        const match = cmd.match(/build\(["']?(\w+)["']?\)/);
        const object = match ? match[1] : null;
        
        if (hasActionsEngine) {
            await window.gameActionsEngine.executor.execute('build', { object });
        } else {
            console.log('Build action not available');
        }
    }
    else if (cmd.includes('speak')) {
        const match = cmd.match(/speak\(["']([^"']+)["']\)/);
        const message = match ? match[1] : "...";
        
        if (hasActionsEngine) {
            await window.gameActionsEngine.executor.execute('speak', { message });
        } else {
            // Fallback to simple alert
            await showSimpleMessage(message);
        }
    }
    else if (cmd.includes('water()')) {
        console.log('Water action - to be implemented');
    }
    else if (cmd.includes('plant')) {
        const match = cmd.match(/plant\(["']?(\w+)["']?\)/);
        const crop = match ? match[1] : null;
        console.log(`Plant ${crop} action - to be implemented`);
    }
    else if (cmd.includes('combine')) {
        const match = cmd.match(/combine\((.+)\)/);
        const items = match ? match[1] : null;
        console.log(`Combine ${items} action - to be implemented`);
    }
    else if (cmd.includes('place')) {
        const match = cmd.match(/place\(["']?(\w+)["']?\)/);
        const item = match ? match[1] : null;
        console.log(`Place ${item} action - to be implemented`);
    }
    else if (cmd.includes('read()')) {
        console.log('Read action - to be implemented');
    }
    else if (cmd.includes('write')) {
        const match = cmd.match(/write\(["']([^"']+)["']\)/);
        const message = match ? match[1] : "";
        console.log(`Write "${message}" action - to be implemented`);
    }
    else if (cmd.includes('question')) {
        const match = cmd.match(/question\(["']([^"']+)["']\)/);
        const question = match ? match[1] : "";
        console.log(`Question "${question}" action - to be implemented`);
    }
}

// Simple message display for when Actions Engine isn't loaded
async function showSimpleMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = text;
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.95);
        border: 2px solid #333;
        border-radius: 10px;
        padding: 20px;
        font-size: 18px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    
    document.body.appendChild(messageDiv);
    
    return new Promise(resolve => {
        setTimeout(() => {
            messageDiv.remove();
            resolve();
        }, 2000);
    });
}

// Enhanced run code function that uses the new executor
async function runCodeEnhanced() {
    if (gameState.isRunning) return;
    
    gameState.isRunning = true;
    document.getElementById('run-btn').disabled = true;
    
    // Reset Actions Engine if available
    if (window.gameActionsEngine) {
        window.gameActionsEngine.worldState.reset();
        window.gameActionsEngine.executor.reset();
        
        // Re-initialize objects for the current level
        initializeLevelObjects();
    }
    
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
    
    // Use enhanced render if available
    if (window.renderEnhanced) {
        await renderEnhanced();
    } else {
        render();
    }
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
                await executeCommandEnhanced(cmd);
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

// Initialize objects for the current level
function initializeLevelObjects() {
    if (!window.gameActionsEngine) return;
    
    const worldState = window.gameActionsEngine.worldState;
    
    // Check if level has defined objects
    if (gameState.levelObjects) {
        gameState.levelObjects.forEach(obj => {
            worldState.addObject(obj);
        });
    }
    
    // Add collectibles as objects
    if (gameState.collectibles) {
        gameState.collectibles.forEach((pos, index) => {
            worldState.addObject({
                id: `collectible_${index}`,
                type: 'gem',
                x: pos.x,
                y: pos.y,
                collectable: true,
                color: 'blue'
            });
        });
    }
}

// Override the original functions if Actions Engine is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for Actions Engine to load
        setTimeout(() => {
            if (window.gameActionsEngine) {
                // Replace original functions with enhanced versions
                window.executeCommand = executeCommandEnhanced;
                window.runCode = runCodeEnhanced;
                
                // Replace collision detection
                if (window.canMoveToEnhanced) {
                    window.canMoveTo = window.canMoveToEnhanced;
                }
                
                // Don't replace render to avoid recursion
                // Just use renderEnhanced when needed
                
                console.log('Python parser enhanced with Actions Engine support');
            }
        }, 200);
    });
} else {
    // Already loaded, enhance immediately
    setTimeout(() => {
        if (window.gameActionsEngine) {
            window.executeCommand = executeCommandEnhanced;
            window.runCode = runCodeEnhanced;
            
            if (window.canMoveToEnhanced) {
                window.canMoveTo = window.canMoveToEnhanced;
            }
            
            // Don't replace render to avoid recursion
            
            console.log('Python parser enhanced with Actions Engine support');
        }
    }, 200);
}