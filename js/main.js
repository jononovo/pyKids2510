// ============================================
// MAIN - Initialization & UI Controls  
// ============================================

// Global variables (exposed on window for test system access)
var courseData = null;
var currentLevel = 0;

// Map inheritance cache
let lastMapCache = null;         // Most recent map from any level
let lastMissionMapCache = null;  // Most recent map from a Mission/Quest level
let lastChapterNumber = null;    // Track chapter changes to reset caches

// Level entry snapshot for reset functionality (exposed globally for game-commands.js)
window.levelEntrySnapshot = {
    starterCode: '',             // Code loaded when entering the level (saved code or starter code)
    missionState: null,          // MissionState when entering the level
    levelIndex: -1               // Track which level the snapshot is for
};

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
    hoveredTile: {x: -1, y: -1},
    // Collectibles tracking (for collect() function)
    collectibles: [],
    // Interactive objects (doors, chests, crops, pushable objects)
    objects: [],
    // Player inventory
    inventory: {},
    // Message log (for speak() function)
    messageLog: []
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
    
    // Set current level in UserProgressManager
    if (window.UserProgressManager) {
        const levelSlug = level.slug || null;
        UserProgressManager.setCurrentLevel(courseData.chapterNumber, levelIndex, levelSlug);
        UserProgressManager.resetLevelSession();
    }
    
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
            EditorManager.init();
            
            // Check for saved code, otherwise use starter code
            const savedCode = window.UserProgressManager ? UserProgressManager.getSavedCode() : null;
            const codeToLoad = savedCode || level.starterCode;
            EditorManager.updateCode(codeToLoad);
            
            // Save code snapshot for reset functionality (only on new level entry)
            // Always use original starter code from MD file for all levels
            if (window._isNewLevelEntry) {
                window.levelEntrySnapshot.starterCode = level.starterCode;
                console.log('[loadLevel] Saved starterCode snapshot for level', currentLevel + 1, ':', window.levelEntrySnapshot.starterCode.substring(0, 50) + '...');
            }
            
            // Update currentLessonStarterCode for Blockly compatibility
            window.currentLessonStarterCode = codeToLoad;
            
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
            // Check for saved code, otherwise use starter code
            const savedCode = window.UserProgressManager ? UserProgressManager.getSavedCode() : null;
            const codeToLoad = savedCode || level.starterCode;
            EditorManager.updateCode(codeToLoad);
            
            // Save code snapshot for reset functionality (only on new level entry)
            // Always use original starter code from MD file for all levels
            if (window._isNewLevelEntry) {
                window.levelEntrySnapshot.starterCode = level.starterCode;
                console.log('[loadLevel] Saved starterCode snapshot for level', currentLevel + 1, ':', window.levelEntrySnapshot.starterCode.substring(0, 50) + '...');
            }
            
            // Update currentLessonStarterCode for Blockly compatibility
            window.currentLessonStarterCode = codeToLoad;
            
            // Handle Blockly mode persistence
            if (window.BlocklyModeSwitcher) {
                const wasInBlockMode = window.BlocklyModeSwitcher.isBlockMode();
                
                if (wasInBlockMode) {
                    // Clear blocks but keep workspace
                    if (window.BlocklyWorkspace && window.BlocklyWorkspace.workspace) {
                        window.BlocklyWorkspace.workspace.clear();
                        // Load saved/starter code into existing workspace
                        if (window.BlocklyIntegration && codeToLoad) {
                            setTimeout(() => {
                                window.BlocklyIntegration.convertFromText(codeToLoad);
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
    
    // Reset map caches if chapter changed
    if (lastChapterNumber !== courseData.chapterNumber) {
        lastMapCache = null;
        lastMissionMapCache = null;
        lastChapterNumber = courseData.chapterNumber;
        
        // Initialize MissionState for new chapter (only if not already initialized for this chapter)
        if (window.MissionState) {
            const currentMissionChapter = MissionState.getCurrentChapter();
            if (currentMissionChapter !== courseData.chapterNumber) {
                MissionState.init(courseData.chapterNumber);
            }
        }
    }
    
    // Determine map layout to use (inheritance logic)
    let mapLayout = level.map.layout;
    
    if (!level.hasOwnMap || mapLayout.length === 0) {
        // No map defined, use inheritance
        const isMission = level.type === 'mission' || level.type === 'quest';
        
        if (isMission && lastMissionMapCache) {
            // Mission prefers last mission map
            mapLayout = lastMissionMapCache;
            console.log('[Map Inheritance] Mission using last mission map');
        } else if (lastMapCache) {
            // Fall back to most recent map
            mapLayout = lastMapCache;
            console.log('[Map Inheritance] Using last available map');
        }
    } else {
        // Level has its own map, update caches
        lastMapCache = level.map.layout;
        
        const isMission = level.type === 'mission' || level.type === 'quest';
        if (isMission) {
            lastMissionMapCache = level.map.layout;
        }
    }
    
    // Load map
    gameState.mapData = mapLayout;
    gameState.mapHeight = mapLayout.length;
    gameState.mapWidth = mapLayout[0] ? mapLayout[0].length : 0;
    gameState.startPos = {...level.map.startPos};
    gameState.goalPos = {...level.map.goalPos};
    gameState.playerPos = {...level.map.startPos};
    gameState.playerDirection = 'right';
    gameState.levelType = level.type || 'exercise';
    
    // Get collectibles from level
    let collectibles = (level.map.collectibles || []).map(c => ({
        x: c.x !== undefined ? c.x : c[0],
        y: c.y !== undefined ? c.y : c[1],
        type: c.type || 'gem',
        collected: false
    }));
    
    // For missions, filter out already-collected items
    const isMission = level.type === 'mission' || level.type === 'quest';
    if (isMission && window.MissionState && MissionState.isInitialized()) {
        collectibles = collectibles.map(c => {
            if (MissionState.isCollected(c.x, c.y)) {
                return { ...c, collected: true };
            }
            return c;
        });
    }
    
    // Initialize collectibles
    gameState.collectibles = collectibles;
    
    // Initialize ElementInteractionManager with level data
    if (window.ElementInteractionManager) {
        ElementInteractionManager.loadLevelElements(level);
        
        // Set mission level flag for persistence
        if (window.MissionState) {
            MissionState.setIsMissionLevel(isMission);
        }
    }
    
    // Initialize MegaElementManager with level data (multi-tile elements)
    if (window.MegaElementManager) {
        MegaElementManager.loadLevelMegaElements(level);
    }
    
    // Reset objects and inventory for new level
    gameState.objects = [];
    gameState.messageLog = [];
    
    // For mission levels, load inventory from MissionState; otherwise start fresh
    if (isMission && window.MissionState && MissionState.isInitialized()) {
        gameState.inventory = MissionState.getInventory();
        console.log('[loadLevel] Mission level - loaded inventory from MissionState:', gameState.inventory);
    } else {
        gameState.inventory = {};
    }
    
    // Check if this is a new level entry (not a reset/reload of same level)
    const isNewLevelEntry = window.levelEntrySnapshot.levelIndex !== levelIndex;
    window._isNewLevelEntry = isNewLevelEntry; // Expose for setTimeout callback
    
    // Save MissionState snapshot for reset functionality (only on new level entry)
    if (isNewLevelEntry) {
        if (isMission && window.MissionState && MissionState.isInitialized()) {
            // For level 1 (index 0), always capture a fresh/empty snapshot
            // This ensures reset returns to a clean state from the MD file
            // For subsequent levels, capture current MissionState (items from previous levels persist)
            if (levelIndex === 0) {
                window.levelEntrySnapshot.missionState = {
                    chapter: MissionState.getCurrentChapter(),
                    inventory: {},
                    collectedItems: [],
                    structures: []
                };
                console.log('[loadLevel] Level 1 - captured fresh empty snapshot for reset');
            } else {
                window.levelEntrySnapshot.missionState = MissionState.getState();
                console.log('[loadLevel] Level', levelIndex + 1, '- captured MissionState snapshot for reset:', window.levelEntrySnapshot.missionState);
            }
        } else {
            window.levelEntrySnapshot.missionState = null;
        }
        window.levelEntrySnapshot.levelIndex = levelIndex;
    }
    
    // Update UI panels
    const inventoryPanel = document.getElementById('inventory-panel');
    if (inventoryPanel) {
        inventoryPanel.innerHTML = '<strong>Inventory:</strong>';
        // Display existing inventory items
        for (const [type, count] of Object.entries(gameState.inventory)) {
            if (count > 0) {
                const itemSpan = document.createElement('span');
                itemSpan.className = 'inventory-item';
                itemSpan.textContent = ` ${type}: ${count}`;
                inventoryPanel.appendChild(itemSpan);
            }
        }
    }
    const messagePanel = document.getElementById('message-panel');
    if (messagePanel) {
        messagePanel.innerHTML = '';
    }
    
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
fetch('assets/chapter1-master-map.md')
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

// Preload SVG tiles and initialize element system before starting
if (typeof preloadSVGTiles === 'function') {
    preloadSVGTiles().then(async () => {
        // Initialize ElementInteractionManager
        if (window.ElementInteractionManager) {
            await ElementInteractionManager.init();
        }
        
        // Initialize MegaElementManager (multi-tile elements)
        if (window.MegaElementManager) {
            await MegaElementManager.init();
        }
        
        console.log('SVG tiles loaded, starting game');
        render();
        if (window.UserProgressManager) {
            window.UserProgressManager.sendReady();
        }
    }).catch(error => {
        console.warn('Failed to preload some SVGs, using fallback rendering:', error);
        render();
        if (window.UserProgressManager) {
            window.UserProgressManager.sendReady();
        }
    });
} else {
    render();
    if (window.UserProgressManager) {
        window.UserProgressManager.sendReady();
    }
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
// CHAPTER DROPDOWN FUNCTIONALITY
// ============================================

let currentLoadedFile = null;
let chapterDropdownOpen = false;

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

async function loadMarkdownFilesList() {
    const menu = document.getElementById('chapter-dropdown-menu');
    if (!menu) return;
    
    try {
        const response = await fetch('/markdown-files.json');
        let files = [];
        
        if (response.ok) {
            files = await response.json();
        } else {
            files = [
                'python-course-chapter1.md',
                'chapter1-master-map.md'
            ];
        }
        
        menu.innerHTML = '';
        
        files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'chapter-dropdown-item';
            if (currentLoadedFile === file) {
                item.classList.add('current');
            }
            
            item.innerHTML = `<span class="file-icon">📄</span>${file}`;
            
            item.addEventListener('click', function() {
                loadMarkdownFromDropdown(file);
                // Close dropdown directly without re-fetching
                const menu = document.getElementById('chapter-dropdown-menu');
                const button = document.getElementById('chapter-dropdown-btn');
                if (menu && button) {
                    menu.classList.remove('show');
                    button.classList.remove('active');
                    chapterDropdownOpen = false;
                }
            });
            
            menu.appendChild(item);
        });
        
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
        menu.innerHTML = '<div class="chapter-dropdown-item" style="color: #666; pointer-events: none;">Error loading files</div>';
    }
}

async function loadMarkdownFromDropdown(filename) {
    try {
        const response = await fetch(`/assets/${filename}`);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}`);
        }
        
        const content = await response.text();
        
        const blob = new Blob([content], { type: 'text/markdown' });
        const file = new File([blob], filename, { type: 'text/markdown' });
        
        const fakeEvent = {
            target: {
                files: [file]
            }
        };
        
        currentLoadedFile = filename;
        
        loadMarkdownFile(fakeEvent);
        
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        alert(`Failed to load ${filename}: ${error.message}`);
    }
}

window.toggleChapterDropdown = toggleChapterDropdown;
window.loadMarkdownFromDropdown = loadMarkdownFromDropdown;