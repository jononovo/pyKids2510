// ============================================
// MAIN - Initialization & UI Controls  
// ============================================

// Global variables
let courseData = null;
let currentLevel = 0;
let jar = null;
let masterGameData = null;

const TILE_SIZE = 32; // Standard tile size (image will stretch to fit)
const MOVE_DURATION = 400;

// Speed settings
const SPEED_SETTINGS = {
    normal: { duration: 400, label: 'Normal', icon: '🐢' },
    fast: { duration: 200, label: 'Fast', icon: '🐇' },
    turbo: { duration: 100, label: 'Turbo', icon: '⚡' }
};

let currentSpeed = 'normal';

// Note: TILES and tileColors are now defined in game-engine.js

let gameState = {
    playerPos: {x: 0, y: 0},
    startPos: {x: 0, y: 0},
    goalPos: {x: 0, y: 0},
    playerDirection: 'right',
    isRunning: false,
    moveQueue: [],
    mapData: [],
    mapWidth: 0,
    mapHeight: 0,
    levelCompleted: [],
    idleAnimation: 0,  // For floating animation
    idlePhase: 0,      // 0 = pause, 1 = animate
    idlePauseTime: 0,   // Counter for pause duration
    idlePauseDuration: 120, // Frames to pause (2 seconds at 60fps)
    // Sprite system
    spriteImage: null,
    spriteFrameWidth: 0,
    spriteFrameHeight: 0,
    currentSpriteFrame: 0,
    spriteAnimationCounter: 0,
    // Background graphic for the level
    backgroundImage: null,
    // Mouse hover tile
    hoveredTile: {x: -1, y: -1}
};

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Create audio context for sound effects
let audioContext = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Simple step sound generator
function playStepSound() {
    if (!audioContext) initAudio();
    
    // Create a simple shuffling sound
    const duration = 0.08;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Use noise-like frequency for shuffling effect
    oscillator.frequency.value = 100 + Math.random() * 50;
    oscillator.type = 'square';
    
    // Quick envelope for shuffling sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.02, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// ============================================
// FILE LOADING
// ============================================

// Load background graphic for the level
function loadBackgroundGraphic(graphicUrl) {
    const img = new Image();
    img.onload = function() {
        gameState.backgroundImage = img;
        render();  // Re-render with the background
    };
    img.onerror = function() {
        console.warn('Failed to load background graphic:', graphicUrl);
        gameState.backgroundImage = null;
    };
    img.src = graphicUrl;
}

function loadMarkdownFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const markdown = e.target.result;
        courseData = parseCourseLevels(markdown);
        
        if (courseData && courseData.levels.length > 0) {
            // Show header info
            document.getElementById('header-info').style.display = 'block';
            
            // Enable navigation buttons
            updateNavigationButtons();
            
            // Load first level
            loadLevel(0);
            
            // Load master game data for this chapter
            loadMasterGameData();
        } else {
            alert('Could not parse the markdown file. Please check the format.');
        }
    };
    reader.readAsText(file);
}

function loadSpriteFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Store the sprite image
            gameState.spriteImage = img;
            // Calculate frame dimensions (6 columns, 2 rows)
            gameState.spriteFrameWidth = Math.floor(img.width / 6);
            gameState.spriteFrameHeight = Math.floor(img.height / 2);
            gameState.currentSpriteFrame = 0;
            
            // Re-render to show the new sprite
            render();
            
            console.log(`Sprite loaded: ${img.width}x${img.height}, Frame size: ${gameState.spriteFrameWidth}x${gameState.spriteFrameHeight}`);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ============================================
// LEVEL MANAGEMENT
// ============================================

// Load a level
function loadLevel(levelIndex) {
    if (!courseData || levelIndex < 0 || levelIndex >= courseData.levels.length) return;
    
    currentLevel = levelIndex;
    const level = courseData.levels[levelIndex];
    
    // Store the current level's starter code globally for Blockly to access
    window.currentLessonStarterCode = level.starterCode;
    
    // Update header UI - show category name (e.g., "INTRODUCTION TO PYTHON") instead of course name
    document.getElementById('chapter-title').textContent = courseData.categoryName || courseData.chapterName;
    document.getElementById('level-info').textContent = `CHAPTER ${courseData.chapterNumber} • LEVEL ${levelIndex + 1}`;
    document.getElementById('victory-level-text').textContent = `LEVEL ${levelIndex + 1}`;
    
    // Update navigation buttons
    updateNavigationButtons();
    
    // Update progress indicators
    updateProgressIndicators();
    
    // Check if we need to create the editor infrastructure for the first time
    const contentContainer = document.getElementById('content');
    const hasEditorInfrastructure = document.querySelector('.embedded-editor-container');
    
    if (!hasEditorInfrastructure) {
        // First time - create the full structure
        let htmlContent = '';
        
        // Convert markdown to HTML (no need for chapter title since it's in the header)
        htmlContent += `<div id="lesson-content">${markdownToHTML(level.markdown)}</div>`;
        
        // Add the embedded editor controls and code editor
        htmlContent += `
            <div class="embedded-editor-container full-width">
                <div class="controls">
                    <div class="controls-top">
                        <button class="btn run-btn" id="run-btn">
                            <span class="btn-icon">▶</span> <span class="btn-text">RUN CODE</span>
                        </button>
                        <span class="infinity-symbol">∞</span>
                    </div>
                    <div class="controls-bottom">
                        <button class="btn secondary-btn" id="reset-btn">
                            <span class="btn-icon">↺</span> <span class="btn-text">RESET</span>
                        </button>
                        <button class="btn secondary-btn">
                            <span class="btn-icon">?</span> <span class="btn-text">HELP</span>
                        </button>
                        <button class="tutor-toggle" id="tutor-toggle">
                            <span class="toggle-text">ON</span>
                            <span class="toggle-icon">🐶</span>
                        </button>
                        <div class="coin-display">
                            <span>💰</span>
                            <span id="coin-count">5/5</span>
                        </div>
                    </div>
                </div>
                <div class="code-editor-container">
                    <div class="editor-wrapper">
                        <div class="line-numbers" id="line-numbers">1</div>
                        <div class="editor" id="editor">${level.starterCode}</div>
                    </div>
                </div>
            </div>
        `;
        
        contentContainer.innerHTML = htmlContent;
    } else {
        // Infrastructure exists - just update the lesson content
        const lessonContentElement = document.getElementById('lesson-content');
        if (lessonContentElement) {
            lessonContentElement.innerHTML = markdownToHTML(level.markdown);
        }
        
        // Update category title if it exists
        const categoryTitle = contentContainer.querySelector('h1');
        if (courseData.categoryName && categoryTitle) {
            categoryTitle.textContent = courseData.categoryName;
        }
    }
    
    // Update editors and controls
    setTimeout(() => {
        const isFirstLoad = !hasEditorInfrastructure;
        
        if (isFirstLoad) {
            // First time - initialize everything
            initializeEditorInfrastructure();
            updateEditorContent(level.starterCode);
            
            // Load CSS for Blockly if needed
            if (window.BlocklyModeSwitcher) {
                if (!document.querySelector('link[href*="blockly-integration/ui/styles.css"]')) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'blockly-integration/ui/styles.css';
                    document.head.appendChild(link);
                }
                
                if (!document.querySelector('link[href*="blockly-integration/ui/settings-dialog.css"]')) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'blockly-integration/ui/settings-dialog.css';
                    document.head.appendChild(link);
                }
                
                // Add toggle buttons
                const controlsTop = document.querySelector('.controls-top');
                if (controlsTop) {
                    window.BlocklyModeSwitcher.addToggleButtons(controlsTop);
                }
                
                // Initialize settings
                if (window.BlocklySettings && !window.BlocklySettings.initialized) {
                    window.BlocklySettings.init();
                    window.BlocklySettings.initialized = true;
                }
            }
            
            // Attach event listeners
            document.getElementById('run-btn').addEventListener('click', runCode);
            document.getElementById('reset-btn').addEventListener('click', resetGame);
            
            // Initialize tutor toggle button
            const tutorToggle = document.getElementById('tutor-toggle');
            if (tutorToggle && window.toggleTutor) {
                tutorToggle.addEventListener('click', window.toggleTutor);
                const toggleText = tutorToggle.querySelector('.toggle-text');
                // Ensure the dog emoji icon is present
                const toggleIcon = tutorToggle.querySelector('.toggle-icon');
                if (!toggleIcon) {
                    const icon = document.createElement('span');
                    icon.className = 'toggle-icon';
                    icon.textContent = '🐶';
                    tutorToggle.appendChild(icon);  // Add after the text
                }
                if (window.tutorEnabled) {
                    tutorToggle.classList.remove('off');
                    if (toggleText) toggleText.textContent = 'ON';
                } else {
                    tutorToggle.classList.add('off');
                    if (toggleText) toggleText.textContent = 'OFF';
                }
            }
        } else {
            // Infrastructure exists - just update content
            updateEditorContent(level.starterCode);
            
            // Handle Blockly mode persistence
            if (window.BlocklyModeSwitcher) {
                const wasInBlockMode = window.BlocklyModeSwitcher.isBlockMode();
                
                if (wasInBlockMode) {
                    // Clear blocks but keep workspace
                    if (window.BlocklyWorkspace && window.BlocklyWorkspace.workspace) {
                        window.BlocklyWorkspace.workspace.clear();
                        // Load new starter code into existing workspace
                        if (window.BlocklyIntegration && level.starterCode) {
                            setTimeout(() => {
                                window.BlocklyIntegration.convertFromText(level.starterCode);
                            }, 100);
                        }
                    }
                }
            }
        }
        
        // Check for auto-start in blocks mode (only on first load)
        if (isFirstLoad && window.BlocklySettings && window.BlocklySettings.getSetting('startInBlocksMode')) {
            setTimeout(() => {
                console.log('Auto-switching to Blockly mode (Start in Blocks Mode is ON)');
                window.BlocklyModeSwitcher.switchToBlockMode();
            }, 300);
        }
    }, 0);
    
    // Load map
    gameState.mapData = level.map.layout;
    gameState.mapHeight = level.map.layout.length;
    gameState.mapWidth = level.map.layout[0] ? level.map.layout[0].length : 0;
    gameState.startPos = {...level.map.startPos};
    gameState.goalPos = {...level.map.goalPos};
    gameState.playerPos = {...level.map.startPos};
    gameState.playerDirection = 'right';
    
    // Load background graphic if specified
    if (level.map.graphic) {
        loadBackgroundGraphic(level.map.graphic);
    } else {
        gameState.backgroundImage = null;
    }
    
    // Resize canvas if needed
    const canvasWidth = gameState.mapWidth * TILE_SIZE;
    const canvasHeight = gameState.mapHeight * TILE_SIZE;
    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    }
    
    // Render the game
    render();
    
    // Initialize viewport position
    updateViewport();
}

// Initialize editor infrastructure (called once)
function initializeEditorInfrastructure() {
    const editorElement = document.getElementById('editor');
    if (!editorElement) return false;
    
    // Check if already initialized
    if (window.jar) return true;
    
    // Check if CodeJar is loaded
    if (!window.CodeJar) {
        console.error('CodeJar library not loaded');
        return false;
    }
    
    const highlight = editor => {
        const code = editor.textContent;
        editor.innerHTML = PythonHighlighter.highlight(code);
    };
    
    // Force CodeJar to use regular contenteditable mode to support HTML highlighting
    editorElement.setAttribute('contenteditable', 'true');
    
    jar = CodeJar(editorElement, highlight, {
        tab: '    ',
        indentOn: /:$/,
        addClosing: false,
        spellcheck: false
    });
    
    jar.onUpdate(() => {
        updateLineNumbers();
    });
    
    return true;
}

// Update editor content (called on level change)
function updateEditorContent(starterCode) {
    if (!window.jar) {
        // Editor not initialized, try to initialize it first
        const editorElement = document.getElementById('editor');
        if (!editorElement) return;
        
        if (!initializeEditorInfrastructure()) return;
    }
    
    // Just update the code, don't rebuild
    jar.updateCode(starterCode);
    updateLineNumbers();
}

// Update line numbers
function updateLineNumbers() {
    const editor = document.getElementById('editor');
    const lineNumbers = document.getElementById('line-numbers');
    if (!editor || !lineNumbers) return;
    
    const lines = editor.textContent.split('\n');
    const numbers = [];
    for (let i = 1; i <= lines.length; i++) {
        numbers.push(i);
    }
    lineNumbers.textContent = numbers.join('\n');
}

// ============================================
// UI FUNCTIONS
// ============================================

// Update navigation buttons
function updateNavigationButtons() {
    if (!courseData) return;
    
    const backBtn = document.getElementById('back-btn');
    const nextBtn = document.getElementById('next-btn');
    
    backBtn.disabled = currentLevel <= 0;
    nextBtn.disabled = currentLevel >= courseData.levels.length - 1;
}

// Update progress indicators
function updateProgressIndicators() {
    if (!courseData) return;
    
    const container = document.getElementById('level-progress');
    const victoryContainer = document.getElementById('victory-progress');
    
    container.innerHTML = '';
    victoryContainer.innerHTML = '';
    
    for (let i = 0; i < courseData.levels.length; i++) {
        const box = document.createElement('div');
        box.className = 'level-box';
        if (gameState.levelCompleted[i]) {
            box.classList.add('completed');
        }
        container.appendChild(box);
        
        const victoryBox = box.cloneNode(true);
        victoryBox.className = 'star-box';
        if (gameState.levelCompleted[i] || i === currentLevel) {
            victoryBox.classList.add('earned');
        }
        victoryContainer.appendChild(victoryBox);
    }
}

// Navigation functions
function nextLevel() {
    if (courseData && currentLevel < courseData.levels.length - 1) {
        loadLevel(currentLevel + 1);
    }
}

function previousLevel() {
    if (courseData && currentLevel > 0) {
        loadLevel(currentLevel - 1);
    }
}

function continueToNext() {
    document.getElementById('victory-modal').classList.remove('show');
    gameState.levelCompleted[currentLevel] = true;
    nextLevel();
}

function replayLevel() {
    document.getElementById('victory-modal').classList.remove('show');
    resetGame();
}

// Modal and UI functions
function showMapInfo() {
    document.getElementById('map-info-modal').classList.add('show');
}

function closeMapInfo() {
    document.getElementById('map-info-modal').classList.remove('show');
}

function toggleSpeedDropdown() {
    const menu = document.getElementById('speed-menu');
    menu.classList.toggle('show');
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
        if (!e.target.closest('.speed-dropdown')) {
            menu.classList.remove('show');
            document.removeEventListener('click', closeDropdown);
        }
    });
}

function setSpeed(speed) {
    currentSpeed = speed;
    const setting = SPEED_SETTINGS[speed];
    
    // Update button display
    const btn = document.getElementById('speed-btn');
    const icon = document.getElementById('speed-icon');
    btn.innerHTML = `<span id="speed-icon">${setting.icon}</span> <span class="btn-text">${setting.label.toUpperCase()}</span> <span class="dropdown-arrow">⇅</span>`;
    
    // Close dropdown
    document.getElementById('speed-menu').classList.remove('show');
}

// ============================================
// SPRITE DROPDOWN
// ============================================

function toggleSpriteDropdown() {
    const menu = document.getElementById('sprite-menu');
    menu.classList.toggle('show');
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
        if (!e.target.closest('.sprite-dropdown')) {
            menu.classList.remove('show');
            document.removeEventListener('click', closeDropdown);
        }
    });
}

function loadSpriteFromPath(spritePath, spriteName) {
    // Load sprite from server path
    const img = new Image();
    img.onload = function() {
        gameState.spriteImage = img;
        gameState.spriteFrameWidth = img.width / 6;
        gameState.spriteFrameHeight = img.height / 2;
        
        // Reset animation
        gameState.currentSpriteFrame = 0;
        gameState.spriteAnimationCounter = 0;
        
        // Update button display
        const nameSpan = document.getElementById('sprite-name');
        if (nameSpan) {
            nameSpan.textContent = spriteName.toUpperCase();
        }
        
        // Close dropdown
        document.getElementById('sprite-menu').classList.remove('show');
        
        // Redraw the game
        render();
    };
    img.src = spritePath;
}

function loadAvailableSprites() {
    // Fetch list of sprites from server
    fetch('/sprites.json')
        .then(response => response.json())
        .then(sprites => {
            const menu = document.getElementById('sprite-menu');
            if (!menu) return;
            
            // Clear existing items
            menu.innerHTML = '';
            
            // Add sprite options
            sprites.forEach(sprite => {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.innerHTML = `<span class="sprite-icon">🐔</span> ${sprite.name}`;
                item.onclick = () => loadSpriteFromPath(sprite.path, sprite.name);
                menu.appendChild(item);
            });
            
            // Load the first sprite (Chicken) as default if sprites exist
            if (sprites.length > 0 && !gameState.spriteImage) {
                const defaultSprite = sprites[0];
                loadSpriteFromPath(defaultSprite.path, defaultSprite.name);
            }
            
            // Add separator
            if (sprites.length > 0) {
                const separator = document.createElement('div');
                separator.style.borderTop = '1px solid #444';
                separator.style.margin = '5px 0';
                menu.appendChild(separator);
            }
            
            // Add upload option
            const uploadItem = document.createElement('div');
            uploadItem.className = 'dropdown-item';
            uploadItem.innerHTML = `<span class="sprite-icon">📁</span> Upload Custom...`;
            uploadItem.onclick = () => {
                document.getElementById('sprite-input').click();
                document.getElementById('sprite-menu').classList.remove('show');
            };
            menu.appendChild(uploadItem);
        })
        .catch(error => {
            console.warn('Could not load sprites list:', error);
            // Fallback: just show upload option
            const menu = document.getElementById('sprite-menu');
            if (menu) {
                menu.innerHTML = `
                    <div class="dropdown-item" onclick="document.getElementById('sprite-input').click(); document.getElementById('sprite-menu').classList.remove('show');">
                        <span class="sprite-icon">📁</span> Upload Custom...
                    </div>
                `;
            }
        });
}

// ============================================
// INITIALIZATION
// ============================================

// Load OpenAI API key from server
fetch('/api/config')
    .then(response => response.json())
    .then(config => {
        if (config.apiKey) {
            window.OPENAI_API_KEY = config.apiKey;
            console.log('AI tutor capabilities enabled');
        }
    })
    .catch(error => {
        console.log('AI tutor running without OpenAI integration');
    });

// Load available sprites on startup
loadAvailableSprites();

// Auto-load the default chapter on startup
fetch('assets/python-course-chapter1.md')
    .then(response => response.text())
    .then(markdown => {
        courseData = parseCourseLevels(markdown);
        if (courseData && courseData.levels.length > 0) {
            document.getElementById('header-info').style.display = 'block';
            updateNavigationButtons();
            loadLevel(0);
        }
    })
    .catch(error => {
        console.log('Default chapter not found, waiting for user to load one');
    });

// Preload SVG tiles before starting
if (typeof preloadSVGTiles === 'function') {
    preloadSVGTiles().then(() => {
        console.log('SVG tiles loaded, starting game');
        render();
    }).catch(error => {
        console.warn('Failed to preload some SVGs, using fallback rendering:', error);
        render();
    });
} else {
    render();
}

// Start animation loop
requestAnimationFrame(animationLoop);

// Add mouse hover tracking for tile highlight
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate which tile the mouse is over
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    
    // Only update if we're hovering over a different tile
    if (gameState.hoveredTile.x !== tileX || gameState.hoveredTile.y !== tileY) {
        // Check if tile is within bounds
        if (tileX >= 0 && tileX < gameState.mapWidth && 
            tileY >= 0 && tileY < gameState.mapHeight) {
            gameState.hoveredTile.x = tileX;
            gameState.hoveredTile.y = tileY;
        } else {
            gameState.hoveredTile.x = -1;
            gameState.hoveredTile.y = -1;
        }
        // Re-render to show the hover effect
        render();
    }
});

// Clear hover when mouse leaves canvas
canvas.addEventListener('mouseleave', () => {
    gameState.hoveredTile.x = -1;
    gameState.hoveredTile.y = -1;
    render();
});

// Update viewport when window/panels resize
window.addEventListener('resize', () => {
    if (typeof updateViewport === 'function') {
        updateViewport();
    }
});

// Also update viewport when panels are resized using CSS resize
// Use ResizeObserver for better performance with panel resizing
const viewport = document.getElementById('game-viewport');
if (viewport && typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(() => {
        if (typeof updateViewport === 'function') {
            updateViewport();
        }
    });
    resizeObserver.observe(viewport);
}

// ============================================
// MASTER GAME MODE INTEGRATION
// ============================================

// Load master game data when chapter is loaded
function loadMasterGameData() {
    // Try to load the corresponding master game file
    // Use chapter number from courseData, default to 1 if not found
    if (courseData) {
        const chapterNum = courseData.chapterNumber || 1;
        const masterGamePath = `assets/master-game-chapter${chapterNum}.md`;
        
        fetch(masterGamePath)
            .then(response => response.text())
            .then(markdown => {
                masterGameData = parseMasterGameData(markdown);
                console.log('Master game data loaded:', masterGameData);
                
                // Show mission mode button after first lesson is completed
                checkMissionButtonVisibility();
            })
            .catch(error => {
                console.log('No master game file found for this chapter:', error);
                masterGameData = null;
            });
    }
}

// Toggle between lesson and mission mode
function toggleMissionMode() {
    if (!missionMode) {
        console.error('Mission mode not initialized');
        return;
    }
    
    if (missionMode.currentMode === 'lesson') {
        // Enter mission mode with current level's mission
        const missionIndex = currentLevel;
        if (masterGameData && masterGameData.missions[missionIndex]) {
            missionMode.enterMissionMode(masterGameData.missions[missionIndex]);
        } else {
            console.log('No mission available for this level');
        }
    } else {
        // Return to lesson mode
        missionMode.exitMission();
    }
}

// Check if mission button should be visible
function checkMissionButtonVisibility() {
    const missionBtn = document.getElementById('mission-mode-btn');
    if (!missionBtn) return;
    
    // TESTING MODE: Always show button if master game data is loaded
    // In production, would check if level is completed first
    if (masterGameData && masterGameData.missions[currentLevel]) {
        missionBtn.style.display = 'inline-block';
    } else {
        missionBtn.style.display = 'none';
    }
}

// Hook into level completion to unlock missions
const originalOnLevelComplete = window.onLevelComplete;
window.onLevelComplete = function() {
    // Call original function if it exists
    if (typeof originalOnLevelComplete === 'function') {
        originalOnLevelComplete();
    }
    
    // Check if mission should be unlocked
    checkMissionButtonVisibility();
    
    // Show notification about mission being available
    if (masterGameData && masterGameData.missions[currentLevel]) {
        setTimeout(() => {
            if (missionMode) {
                missionMode.showNotification('🎯 Mission unlocked! Click MISSION MODE to play!', 'success');
            }
        }, 2000);
    }
}

// Hook into load level to update mission button
const originalLoadLevel = window.loadLevel;
window.loadLevel = function(levelIndex) {
    // Call original function
    if (typeof originalLoadLevel === 'function') {
        originalLoadLevel(levelIndex);
    }
    
    // Update mission button visibility
    checkMissionButtonVisibility();
}

// Master game data is now loaded directly in loadMarkdownFile function

// ============================================
// CHAPTER DROPDOWN FUNCTIONALITY
// ============================================

let currentLoadedFile = null;
let chapterDropdownOpen = false;

// Toggle the chapter dropdown menu
function toggleChapterDropdown() {
    const menu = document.getElementById('chapter-dropdown-menu');
    const button = document.getElementById('chapter-dropdown-btn');
    
    if (!menu || !button) return;
    
    chapterDropdownOpen = !chapterDropdownOpen;
    
    if (chapterDropdownOpen) {
        menu.classList.add('show');
        button.classList.add('active');
        loadMarkdownFilesList();
    } else {
        menu.classList.remove('show');
        button.classList.remove('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.chapter-dropdown-container');
    if (container && !container.contains(event.target)) {
        const menu = document.getElementById('chapter-dropdown-menu');
        const button = document.getElementById('chapter-dropdown-btn');
        if (menu && button) {
            menu.classList.remove('show');
            button.classList.remove('active');
            chapterDropdownOpen = false;
        }
    }
});

// Load list of markdown files from assets folder
async function loadMarkdownFilesList() {
    const menu = document.getElementById('chapter-dropdown-menu');
    if (!menu) return;
    
    try {
        // Fetch list of markdown files from the server - same pattern as sprites.json
        const response = await fetch('/markdown-files.json');
        let files = [];
        
        if (response.ok) {
            files = await response.json();
        } else {
            // Fallback: manually list known files
            files = [
                'python-course-chapter1.md',
                'master-game-chapter1.md'
            ];
        }
        
        // Clear existing items
        menu.innerHTML = '';
        
        // Add each file as a dropdown item
        files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'chapter-dropdown-item';
            if (currentLoadedFile === file) {
                item.classList.add('current');
            }
            
            // Add file icon and name
            item.innerHTML = `<span class="file-icon">📄</span>${file}`;
            
            // Add click handler
            item.addEventListener('click', function() {
                loadMarkdownFromDropdown(file);
                toggleChapterDropdown(); // Close dropdown after selection
            });
            
            menu.appendChild(item);
        });
        
        // If no files found, show a message
        if (files.length === 0) {
            const item = document.createElement('div');
            item.className = 'chapter-dropdown-item';
            item.style.color = '#666';
            item.style.pointerEvents = 'none';
            item.innerHTML = 'No markdown files found in assets folder';
            menu.appendChild(item);
        }
    } catch (error) {
        console.error('Error loading markdown files list:', error);
        
        // Show error message
        menu.innerHTML = '<div class="chapter-dropdown-item" style="color: #666; pointer-events: none;">Error loading files</div>';
    }
}

// Load a markdown file from the dropdown selection
async function loadMarkdownFromDropdown(filename) {
    try {
        const response = await fetch(`/assets/${filename}`);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}`);
        }
        
        const content = await response.text();
        
        // Create a proper Blob/File object that FileReader can work with
        const blob = new Blob([content], { type: 'text/markdown' });
        const file = new File([blob], filename, { type: 'text/markdown' });
        
        // Create event structure that loadMarkdownFile expects
        const fakeEvent = {
            target: {
                files: [file]
            }
        };
        
        // Store the current file name
        currentLoadedFile = filename;
        
        // Load the file using the existing function
        await loadMarkdownFile(fakeEvent);
        
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        alert(`Failed to load ${filename}: ${error.message}`);
    }
}

// Make functions globally available
window.toggleChapterDropdown = toggleChapterDropdown;
window.loadMarkdownFromDropdown = loadMarkdownFromDropdown;