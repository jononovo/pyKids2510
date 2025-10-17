// Enhanced Game Engine with Actions System Integration
// This file extends the main game-engine.js with the new action capabilities

// Initialize the Game Actions Engine
function initializeGameActionsEngine() {
    // Check if already initialized
    if (window.gameActionsEngine) {
        console.log('Game Actions Engine already initialized');
        return;
    }
    
    // Initialize after scripts are already loaded (they're in HTML)
    if (typeof ActionRegistry !== 'undefined' && 
        typeof WorldState !== 'undefined' && 
        typeof ActionExecutor !== 'undefined') {
        
        window.gameActionsEngine = {
            registry: new ActionRegistry(),
            worldState: new WorldState(),
            particleSystem: new ParticleSystem()
        };
        
        window.gameActionsEngine.executor = new ActionExecutor(
            window.gameActionsEngine.registry,
            window.gameActionsEngine.worldState
        );
        
        console.log('Game Actions Engine initialized');
    } else {
        // Try again in a moment if classes aren't loaded yet
        setTimeout(initializeGameActionsEngine, 100);
    }
}

// Enhanced render function that includes interactive objects
async function renderEnhanced() {
    // Call original render (not recursively!)
    if (typeof render !== 'undefined') {
        await render();
    }
    
    // If actions engine is initialized, render additional elements
    if (window.gameActionsEngine) {
        const ctx = canvas.getContext('2d');
        
        // Render interactive objects
        renderInteractiveObjects(ctx);
        
        // Render particles
        window.gameActionsEngine.particleSystem.update();
        window.gameActionsEngine.particleSystem.render(ctx);
        
        // Render inventory UI
        renderInventoryUI(ctx);
    }
}

// Render interactive objects on the map
function renderInteractiveObjects(ctx) {
    if (!window.gameActionsEngine || !window.gameActionsEngine.worldState) return;
    
    const objects = window.gameActionsEngine.worldState.objects;
    
    for (const [id, obj] of objects) {
        const x = obj.x * TILE_SIZE + obj.visualOffset.x;
        const y = obj.y * TILE_SIZE + obj.visualOffset.y;
        
        ctx.save();
        ctx.globalAlpha = obj.opacity || 1;
        
        switch (obj.type) {
            case 'box':
            case 'crate':
                drawBox(ctx, x, y);
                break;
            
            case 'door':
                if (!obj.isOpen) {
                    drawDoor(ctx, x, y, obj.isLocked);
                }
                break;
            
            case 'key':
                drawKey(ctx, x + TILE_SIZE/2, y + TILE_SIZE/2, obj.color || 'gold');
                break;
            
            case 'gem':
                drawGem(ctx, x + TILE_SIZE/2, y + TILE_SIZE/2, obj.color || 'blue');
                break;
            
            case 'switch':
                drawSwitch(ctx, x, y, obj.activated);
                break;
            
            case 'bridge':
                drawBridge(ctx, x, y);
                break;
            
            default:
                // Generic object representation
                ctx.fillStyle = '#666';
                ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        }
        
        ctx.restore();
    }
}

// Drawing functions for interactive objects
function drawBox(ctx, x, y) {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    
    // Wood grain
    ctx.strokeStyle = '#5A3A1A';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 6);
    ctx.lineTo(x + TILE_SIZE - 6, y + 6);
    ctx.moveTo(x + 6, y + TILE_SIZE/2);
    ctx.lineTo(x + TILE_SIZE - 6, y + TILE_SIZE/2);
    ctx.moveTo(x + 6, y + TILE_SIZE - 6);
    ctx.lineTo(x + TILE_SIZE - 6, y + TILE_SIZE - 6);
    ctx.stroke();
}

function drawDoor(ctx, x, y, isLocked) {
    ctx.fillStyle = isLocked ? '#8B0000' : '#654321';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
    
    // Door handle
    ctx.fillStyle = isLocked ? '#FFD700' : '#C0C0C0';
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE - 8, y + TILE_SIZE/2, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Lock indicator
    if (isLocked) {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + TILE_SIZE/2 - 4, y + TILE_SIZE/2 - 3, 8, 6);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2 - 5, 3, Math.PI, 0, false);
        ctx.stroke();
    }
}

function drawKey(ctx, cx, cy, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = darkenColor(color);
    ctx.lineWidth = 1;
    
    // Key handle
    ctx.beginPath();
    ctx.arc(cx - 4, cy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Key shaft
    ctx.fillRect(cx - 1, cy - 1, 8, 2);
    
    // Key teeth
    ctx.fillRect(cx + 5, cy - 3, 2, 2);
    ctx.fillRect(cx + 5, cy + 1, 2, 2);
}

function drawGem(ctx, cx, cy, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = darkenColor(color);
    ctx.lineWidth = 1;
    
    // Diamond shape
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx + 5, cy);
    ctx.lineTo(cx, cy + 6);
    ctx.lineTo(cx - 5, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx + 2, cy - 2);
    ctx.lineTo(cx - 2, cy - 2);
    ctx.closePath();
    ctx.fill();
}

function drawSwitch(ctx, x, y, activated) {
    ctx.fillStyle = activated ? '#00FF00' : '#FF0000';
    ctx.fillRect(x + 8, y + 8, TILE_SIZE - 16, TILE_SIZE - 16);
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 8, y + 8, TILE_SIZE - 16, TILE_SIZE - 16);
    
    // Lever
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (activated) {
        ctx.moveTo(x + TILE_SIZE/2, y + TILE_SIZE/2);
        ctx.lineTo(x + TILE_SIZE/2 + 6, y + TILE_SIZE/2 - 6);
    } else {
        ctx.moveTo(x + TILE_SIZE/2, y + TILE_SIZE/2);
        ctx.lineTo(x + TILE_SIZE/2 - 6, y + TILE_SIZE/2 - 6);
    }
    ctx.stroke();
}

function drawBridge(ctx, x, y) {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    
    // Planks
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y + i * 8);
        ctx.lineTo(x + TILE_SIZE, y + i * 8);
        ctx.stroke();
    }
}

// Render inventory UI
function renderInventoryUI(ctx) {
    const inventory = window.gameActionsEngine.worldState.inventory;
    
    if (inventory.size === 0) return;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 40);
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Inventory:', 20, 30);
    
    let x = 90;
    for (const [item, count] of inventory) {
        ctx.fillText(`${item}: ${count}`, x, 30);
        x += 60;
    }
}

// Helper function to darken a color
function darkenColor(color) {
    const colors = {
        'gold': '#B8860B',
        'blue': '#000080',
        'red': '#8B0000',
        'green': '#006400'
    };
    return colors[color] || '#333';
}

// Enhanced collision detection for interactive objects
function canMoveToEnhanced(x, y) {
    // First check standard collision
    if (!canMoveTo(x, y)) {
        return false;
    }
    
    // Check for interactive object collision
    if (window.gameActionsEngine) {
        const object = window.gameActionsEngine.worldState.getObjectAt(x, y);
        if (object) {
            // Some objects block movement
            if (object.type === 'box' || object.type === 'crate') {
                return false;
            }
            if (object.type === 'door' && !object.isOpen) {
                return false;
            }
        }
    }
    
    return true;
}

// Sound effects for actions
function playCollectSound() {
    if (typeof audioContext === 'undefined') return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Ascending tones for collection
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playActionSound(type) {
    if (typeof audioContext === 'undefined') return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
        case 'push':
            oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
            break;
        case 'open':
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2);
            break;
        case 'build':
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
            break;
        default:
            oscillator.frequency.setValueAtTime(250, audioContext.currentTime);
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGameActionsEngine);
} else {
    initializeGameActionsEngine();
}

// Export functions for use in other modules
window.renderEnhanced = renderEnhanced;
window.canMoveToEnhanced = canMoveToEnhanced;
window.playCollectSound = playCollectSound;
window.playActionSound = playActionSound;