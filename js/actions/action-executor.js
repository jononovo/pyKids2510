// Action Executor - Executes and validates actions with feedback

class ActionExecutor {
    constructor(registry, worldState) {
        this.registry = registry;
        this.worldState = worldState;
        this.actionQueue = [];
        this.isExecuting = false;
        this.actionHistory = [];
    }
    
    // Queue an action for execution
    queueAction(actionName, params = {}) {
        this.actionQueue.push({ name: actionName, params });
    }
    
    // Execute all queued actions
    async executeQueue() {
        if (this.isExecuting) return;
        
        this.isExecuting = true;
        
        while (this.actionQueue.length > 0) {
            const { name, params } = this.actionQueue.shift();
            await this.execute(name, params);
        }
        
        this.isExecuting = false;
    }
    
    // Execute a single action
    async execute(actionName, params = {}) {
        const action = this.registry.get(actionName);
        
        if (!action) {
            console.error(`Unknown action: ${actionName}`);
            await this.showError(`Unknown action: ${actionName}`);
            return false;
        }
        
        // Record action attempt
        const actionRecord = {
            name: actionName,
            params,
            timestamp: Date.now(),
            success: false
        };
        
        try {
            // Validate preconditions
            if (!action.validate(this.worldState, params)) {
                console.log(`Action ${actionName} failed validation`);
                await this.showValidationFeedback(actionName, params);
                actionRecord.reason = 'validation_failed';
                this.actionHistory.push(actionRecord);
                return false;
            }
            
            // Execute the action
            const result = await action.execute(this.worldState, params);
            
            // Record success
            actionRecord.success = true;
            actionRecord.result = result;
            this.actionHistory.push(actionRecord);
            
            // Trigger post-action events
            this.worldState.checkTriggers();
            
            // Check win conditions
            this.checkWinConditions();
            
            return result;
            
        } catch (error) {
            console.error(`Error executing action ${actionName}:`, error);
            actionRecord.error = error.message;
            this.actionHistory.push(actionRecord);
            await this.showError(`Action failed: ${error.message}`);
            return false;
        }
    }
    
    // Provide feedback for failed validations
    async showValidationFeedback(actionName, params) {
        const feedbackMessages = {
            'push': "There's nothing to push here, or the path is blocked!",
            'open': "There's no door here, or it's already open!",
            'close': "There's no door here, or it's already closed!",
            'collect': "There's nothing to collect here!",
            'build': "You can't build that here, or you lack resources!",
            'move_forward': "The path ahead is blocked!"
        };
        
        const message = feedbackMessages[actionName] || `Cannot perform ${actionName} here!`;
        await this.showMessage(message);
    }
    
    // Show error message
    async showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'game-error';
        errorDiv.textContent = `❌ ${message}`;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            z-index: 1000;
            animation: shake 0.5s;
        `;
        
        // Add shake animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(-50%) translateY(0); }
                25% { transform: translateX(-52%) translateY(0); }
                75% { transform: translateX(-48%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
            style.remove();
        }, 3000);
    }
    
    // Show informational message
    async showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'game-info';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            z-index: 1000;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 2000);
    }
    
    // Check if any win conditions are met
    checkWinConditions() {
        // Check if player reached goal
        if (checkWinCondition && typeof checkWinCondition === 'function') {
            checkWinCondition();
        }
        
        // Check custom win conditions
        const allCollectibles = this.worldState.getAllCollectibles();
        if (allCollectibles.length === 0 && gameState.collectibles) {
            // All collectibles collected
            const allCollected = gameState.collectibles.every(pos => {
                return !this.worldState.getObjectAt(pos.x, pos.y);
            });
            
            if (allCollected) {
                console.log('All collectibles collected!');
            }
        }
    }
    
    // Undo last action
    async undoLastAction() {
        if (this.actionHistory.length === 0) {
            await this.showMessage("Nothing to undo!");
            return;
        }
        
        const lastAction = this.actionHistory.pop();
        
        // Implement undo logic based on action type
        switch (lastAction.name) {
            case 'move_forward':
                // Move player back
                // This would require storing previous position
                break;
            case 'push':
                // Move object back to original position
                break;
            case 'collect':
                // Restore collected item
                break;
            // Add more undo logic as needed
        }
        
        await this.showMessage(`Undid: ${lastAction.name}`);
    }
    
    // Get action history for debugging
    getHistory() {
        return this.actionHistory;
    }
    
    // Clear action history
    clearHistory() {
        this.actionHistory = [];
    }
    
    // Reset executor state
    reset() {
        this.actionQueue = [];
        this.isExecuting = false;
        this.clearHistory();
    }
}

// Particle System for visual effects
class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    emit(type, x, y) {
        const particleConfig = {
            'construction': {
                count: 5,
                color: '#FFD700',
                size: 3,
                speed: 2,
                lifetime: 30
            },
            'collect': {
                count: 8,
                color: '#00FF00',
                size: 2,
                speed: 3,
                lifetime: 20
            },
            'impact': {
                count: 4,
                color: '#FF0000',
                size: 4,
                speed: 1.5,
                lifetime: 15
            }
        };
        
        const config = particleConfig[type] || particleConfig['construction'];
        
        for (let i = 0; i < config.count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * config.speed,
                vy: (Math.random() - 0.5) * config.speed,
                size: config.size,
                color: config.color,
                lifetime: config.lifetime,
                maxLifetime: config.lifetime
            });
        }
    }
    
    update() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.lifetime--;
            
            return particle.lifetime > 0;
        });
    }
    
    render(ctx) {
        this.particles.forEach(particle => {
            const opacity = particle.lifetime / particle.maxLifetime;
            ctx.globalAlpha = opacity;
            ctx.fillStyle = particle.color;
            ctx.fillRect(
                particle.x - particle.size/2,
                particle.y - particle.size/2,
                particle.size,
                particle.size
            );
        });
        ctx.globalAlpha = 1;
    }
    
    clear() {
        this.particles = [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ActionExecutor, ParticleSystem };
}