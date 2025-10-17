// ============================================
// MISSION MODE UI CONTROLLER
// ============================================

class MissionMode {
    constructor() {
        this.currentMode = 'lesson'; // 'lesson' or 'mission'
        this.currentMission = null;
        this.resources = {
            wood: 0,
            food: 0,
            stone: 0,
            fish: 0,
            coconut: 0,
            driftwood: 0
        };
        this.unlockedZones = ['beach'];
        this.missionProgress = {};
        this.codePanelExpanded = true;
        this.timerInterval = null;
        this.moveCount = 0;
    }

    // Initialize mission mode UI elements
    init() {
        this.createMissionContainer();
        this.createResourceCounter();
        this.createActionMenu();
        this.createMissionCompleteModal();
        this.loadSavedProgress();
    }

    // Create main mission container
    createMissionContainer() {
        const container = document.createElement('div');
        container.className = 'mission-container';
        container.innerHTML = `
            <div class="mission-header">
                <div>
                    <h2 class="mission-title">Mission Title</h2>
                    <p class="mission-objective">Mission objective will appear here</p>
                </div>
                <div class="mission-controls">
                    <button class="btn secondary-btn" onclick="missionMode.toggleCodePanel()">
                        <span class="btn-icon">📝</span> CODE
                    </button>
                    <button class="btn secondary-btn" onclick="missionMode.exitMission()">
                        <span class="btn-icon">🔙</span> EXIT
                    </button>
                </div>
            </div>
            <div class="mission-map-container">
                <div class="mission-game-viewport" id="mission-game-viewport">
                    <!-- Game canvas will be moved here in mission mode -->
                </div>
                <div class="mission-hud" id="mission-hud">
                    <h4>Requirements</h4>
                    <ul class="mission-requirements" id="mission-requirements">
                    </ul>
                </div>
                <div class="mission-timer" id="mission-timer">
                    <span id="timer-text">Time: 30</span>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        // Create code panel
        const codePanel = document.createElement('div');
        codePanel.className = 'code-panel-wrapper expanded';
        codePanel.id = 'mission-code-panel';
        codePanel.innerHTML = `
            <button class="code-panel-toggle" onclick="missionMode.toggleCodePanel()">
                <span id="code-toggle-icon">▼</span> Code Editor
            </button>
            <div class="mission-code-editor" id="mission-code-editor">
                <!-- Code editor will be moved here in mission mode -->
            </div>
        `;
        container.appendChild(codePanel);
    }

    // Create resource counter UI
    createResourceCounter() {
        const counter = document.createElement('div');
        counter.className = 'resource-counter';
        counter.id = 'resource-counter';
        counter.innerHTML = `
            <h3>Resources</h3>
            <div class="resource-item">
                <span class="resource-icon">🪵</span>
                <span class="resource-name">Wood</span>
                <span class="resource-amount" id="resource-wood">0</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">🍎</span>
                <span class="resource-name">Food</span>
                <span class="resource-amount" id="resource-food">0</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">🪨</span>
                <span class="resource-name">Stone</span>
                <span class="resource-amount" id="resource-stone">0</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">🐟</span>
                <span class="resource-name">Fish</span>
                <span class="resource-amount" id="resource-fish">0</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">🥥</span>
                <span class="resource-name">Coconuts</span>
                <span class="resource-amount" id="resource-coconut">0</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">🪵</span>
                <span class="resource-name">Driftwood</span>
                <span class="resource-amount" id="resource-driftwood">0</span>
            </div>
        `;
        document.body.appendChild(counter);
    }

    // Create action menu for building/crafting
    createActionMenu() {
        const menu = document.createElement('div');
        menu.className = 'action-menu';
        menu.id = 'action-menu';
        menu.innerHTML = `
            <button class="action-button" onclick="missionMode.buildItem('shelter')">
                🏠 Build Shelter
                <span class="cost">Wood: 10</span>
            </button>
            <button class="action-button" onclick="missionMode.buildItem('raft')">
                ⛵ Build Raft
                <span class="cost">Driftwood: 10</span>
            </button>
            <button class="action-button" onclick="missionMode.buildItem('bridge')">
                🌉 Build Bridge
                <span class="cost">Wood: 5</span>
            </button>
            <button class="action-button" onclick="missionMode.buildItem('farm')">
                🌾 Plant Farm
                <span class="cost">Seeds: 3</span>
            </button>
        `;
        document.body.appendChild(menu);
    }

    // Create mission complete modal
    createMissionCompleteModal() {
        const modal = document.createElement('div');
        modal.className = 'mission-complete-modal';
        modal.id = 'mission-complete-modal';
        modal.innerHTML = `
            <h2>🎉 Mission Complete!</h2>
            <p id="mission-complete-text">Congratulations! You've completed the mission!</p>
            <div class="mission-rewards">
                <h3>Rewards Unlocked:</h3>
                <div id="mission-rewards-list">
                    <!-- Rewards will be listed here -->
                </div>
            </div>
            <div class="mission-buttons">
                <button class="mission-btn" onclick="missionMode.continuePlaying()">
                    Continue Exploring
                </button>
                <button class="mission-btn secondary" onclick="missionMode.returnToLessons()">
                    Next Lesson
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Switch to mission mode
    enterMissionMode(missionData) {
        this.currentMode = 'mission';
        this.currentMission = missionData;
        this.moveCount = 0;

        // Hide lesson UI
        document.querySelector('.container').style.display = 'none';
        
        // Show mission UI
        document.body.classList.add('mission-mode');
        document.querySelector('.mission-container').classList.add('active');
        document.querySelector('#resource-counter').classList.add('active');

        // Update mission header
        document.querySelector('.mission-title').textContent = missionData.title;
        document.querySelector('.mission-objective').textContent = missionData.objective;

        // Update requirements list
        this.updateRequirementsList(missionData.requirements);

        // Move game canvas to mission viewport
        const canvas = document.getElementById('game-canvas');
        const missionViewport = document.getElementById('mission-game-viewport');
        if (canvas && missionViewport) {
            missionViewport.appendChild(canvas);
        }

        // Move code editor to mission panel
        const editorContainer = document.querySelector('.code-editor-container');
        const missionCodeEditor = document.getElementById('mission-code-editor');
        if (editorContainer && missionCodeEditor) {
            missionCodeEditor.appendChild(editorContainer);
        }

        // Load mission map
        this.loadMissionMap(missionData.map);

        // Start timer if needed
        if (missionData.map.timedEvent) {
            this.startTimer(missionData.map.timedEvent.turns_until);
        }

        // Update resource display
        this.updateResourceDisplay();
    }

    // Exit mission mode
    exitMission() {
        this.currentMode = 'lesson';
        
        // Save progress
        this.saveProgress();

        // Show lesson UI
        document.querySelector('.container').style.display = '';
        
        // Hide mission UI
        document.body.classList.remove('mission-mode');
        document.querySelector('.mission-container').classList.remove('active');
        document.querySelector('#resource-counter').classList.remove('active');

        // Move canvas back
        const canvas = document.getElementById('game-canvas');
        const gameViewport = document.getElementById('game-viewport');
        if (canvas && gameViewport) {
            gameViewport.appendChild(canvas);
        }

        // Move code editor back
        const editorContainer = document.querySelector('.code-editor-container');
        const originalParent = document.querySelector('.embedded-editor-container');
        if (editorContainer && originalParent) {
            originalParent.appendChild(editorContainer);
        }

        // Stop timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // Toggle code panel collapse/expand
    toggleCodePanel() {
        const panel = document.getElementById('mission-code-panel');
        const icon = document.getElementById('code-toggle-icon');
        
        if (this.codePanelExpanded) {
            panel.classList.remove('expanded');
            panel.classList.add('collapsed');
            icon.textContent = '▲';
            this.codePanelExpanded = false;
        } else {
            panel.classList.remove('collapsed');
            panel.classList.add('expanded');
            icon.textContent = '▼';
            this.codePanelExpanded = true;
        }
    }

    // Update requirements list UI
    updateRequirementsList(requirements) {
        const list = document.getElementById('mission-requirements');
        list.innerHTML = '';
        
        requirements.forEach((req, index) => {
            const li = document.createElement('li');
            li.textContent = req;
            li.id = `requirement-${index}`;
            list.appendChild(li);
        });
    }

    // Mark requirement as completed
    completeRequirement(index) {
        const req = document.getElementById(`requirement-${index}`);
        if (req) {
            req.classList.add('completed');
        }
    }

    // Load mission map
    loadMissionMap(mapData) {
        // Update game state with mission map
        gameState.mapData = mapData.layout;
        gameState.mapHeight = mapData.layout.length;
        gameState.mapWidth = mapData.layout[0] ? mapData.layout[0].length : 0;
        gameState.startPos = {...mapData.startPos};
        gameState.playerPos = {...mapData.startPos};
        gameState.playerDirection = 'right';

        // Load background graphic if specified
        if (mapData.graphic) {
            loadBackgroundGraphic(mapData.graphic);
        } else {
            gameState.backgroundImage = null;
        }

        // Resize canvas if needed
        const canvas = document.getElementById('game-canvas');
        const canvasWidth = gameState.mapWidth * TILE_SIZE;
        const canvasHeight = gameState.mapHeight * TILE_SIZE;
        if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
        }

        // Render the game
        render();
        updateViewport();
    }

    // Resource management
    addResource(type, amount) {
        if (this.resources[type] !== undefined) {
            this.resources[type] += amount;
            this.updateResourceDisplay();
            this.checkMissionCompletion();
        }
    }

    removeResource(type, amount) {
        if (this.resources[type] !== undefined && this.resources[type] >= amount) {
            this.resources[type] -= amount;
            this.updateResourceDisplay();
            return true;
        }
        return false;
    }

    updateResourceDisplay() {
        Object.keys(this.resources).forEach(type => {
            const element = document.getElementById(`resource-${type}`);
            if (element) {
                element.textContent = this.resources[type];
            }
        });
    }

    // Building system
    buildItem(item) {
        const costs = {
            shelter: { wood: 10 },
            raft: { driftwood: 10 },
            bridge: { wood: 5 },
            farm: { seeds: 3 }
        };

        const cost = costs[item];
        if (!cost) return;

        // Check if player has resources
        let canBuild = true;
        for (let [resource, amount] of Object.entries(cost)) {
            if (this.resources[resource] < amount) {
                canBuild = false;
                break;
            }
        }

        if (canBuild) {
            // Deduct resources
            for (let [resource, amount] of Object.entries(cost)) {
                this.removeResource(resource, amount);
            }
            
            // Add built item to game
            console.log(`Built ${item}!`);
            this.showNotification(`✓ Built ${item}!`, 'success');
            
            // Check mission completion
            this.checkMissionCompletion();
        } else {
            this.showNotification('✗ Not enough resources!', 'error');
        }
    }

    // Timer system for timed events
    startTimer(duration) {
        let timeRemaining = duration;
        const timerElement = document.getElementById('mission-timer');
        const timerText = document.getElementById('timer-text');
        
        timerElement.classList.add('active');
        
        this.timerInterval = setInterval(() => {
            timeRemaining--;
            timerText.textContent = `Time: ${timeRemaining}`;
            
            if (timeRemaining <= 10) {
                timerElement.classList.add('urgent');
            }
            
            if (timeRemaining <= 0) {
                clearInterval(this.timerInterval);
                this.onTimerExpired();
            }
        }, 1000);
    }

    onTimerExpired() {
        // Handle timer expiration (e.g., volcano erupts)
        console.log('Timer expired!');
        this.showNotification('⚠️ Time\'s up!', 'warning');
    }

    // Mission completion
    checkMissionCompletion() {
        if (!this.currentMission) return;

        // Check various completion conditions
        const condition = this.currentMission.map.successCondition;
        
        if (condition === 'collect_all_and_return') {
            // Check if all resources collected and player returned to start
            // Implementation depends on specific mission logic
        } else if (condition === 'collect_threshold') {
            // Check if threshold reached
            // Implementation depends on specific mission logic
        }
        
        // For now, example completion
        if (this.resources.coconut >= 5 && this.currentMission.title.includes('Coconuts')) {
            this.onMissionComplete();
        }
    }

    onMissionComplete() {
        const modal = document.getElementById('mission-complete-modal');
        const rewardsList = document.getElementById('mission-rewards-list');
        
        // Show rewards
        rewardsList.innerHTML = '';
        if (this.currentMission.unlocks) {
            this.currentMission.unlocks.forEach(unlock => {
                const div = document.createElement('div');
                div.className = 'reward-item';
                div.textContent = `✓ ${unlock}`;
                rewardsList.appendChild(div);
            });
        }
        
        modal.classList.add('show');
        
        // Save completion
        this.missionProgress[this.currentMission.title] = true;
        this.saveProgress();
    }

    continuePlaying() {
        document.getElementById('mission-complete-modal').classList.remove('show');
    }

    returnToLessons() {
        document.getElementById('mission-complete-modal').classList.remove('show');
        this.exitMission();
    }

    // Notifications
    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#ff9800'};
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            z-index: 300;
            animation: slideDown 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Save/Load progress
    saveProgress() {
        const saveData = {
            resources: this.resources,
            unlockedZones: this.unlockedZones,
            missionProgress: this.missionProgress
        };
        localStorage.setItem('masterGameProgress', JSON.stringify(saveData));
    }

    loadSavedProgress() {
        const saved = localStorage.getItem('masterGameProgress');
        if (saved) {
            const data = JSON.parse(saved);
            this.resources = data.resources || this.resources;
            this.unlockedZones = data.unlockedZones || this.unlockedZones;
            this.missionProgress = data.missionProgress || this.missionProgress;
        }
    }
}

// Initialize mission mode when document loads
let missionMode;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        missionMode = new MissionMode();
        missionMode.init();
    });
} else {
    missionMode = new MissionMode();
    missionMode.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MissionMode;
}