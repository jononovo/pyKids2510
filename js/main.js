// ============================================
// MAIN - Initialization & UI Controls  
// ============================================

// Global variables (exposed on window for test system access)
var courseData = null;
var currentLevel = 0;

// Note: Map inheritance caches are now managed by js/game-engine/level-loader.js

const TILE_SIZE = 32; // Standard tile size (image will stretch to fit)
window.TILE_SIZE = TILE_SIZE; // Expose globally for map modules
const MOVE_DURATION = 400;

// Speed settings
const SPEED_SETTINGS = {
    normal: { duration: 400, label: 'Normal', icon: '🐢' },
    fast: { duration: 200, label: 'Fast', icon: '🐇' },
    turbo: { duration: 100, label: 'Turbo', icon: '⚡' }
};

let currentSpeed = 'fast';

// Note: TILES and tileColors are now defined in game-engine.js

let gameState = {
    playerPos: {x: 0, y: 0},
    startPos: {x: 0, y: 0},
    goalPos: {x: 0, y: 0},
    playerDirection: 'right',
    characterType: 'player',
    isRunning: false,
    moveQueue: [],
    mapData: [],
    mapWidth: 0,
    mapHeight: 0,
    levelCompleted: [],
    idleAnimation: 0,
    idlePhase: 0,
    idlePauseTime: 0,
    idlePauseDuration: 120,
    spriteImage: null,
    spriteFrameWidth: 0,
    spriteFrameHeight: 0,
    currentSpriteFrame: 0,
    spriteAnimationCounter: 0,
    backgroundImage: null,
    hoveredTile: {x: -1, y: -1},
    objects: [],
    inventory: {},
    messageLog: []
};
window.gameState = gameState; // Expose globally for map modules

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Note: Camera state is now managed by js/map/camera-controls.js
// Note: Audio and visual feedback effects are now in js/game-engine/feedback-effects.js

// ============================================
// FILE LOADING
// ============================================

// Note: loadBackgroundGraphic is now in js/game-engine/level-loader.js

function startChapter(markdown, hostTests = []) {
    courseData = parseCourseLevels(markdown);
    if (!courseData || courseData.levels.length === 0) return false;
    if (hostTests.length > 0) {
        const testsFromHost = parseHostTests(hostTests);
        courseData.levels.forEach(level => { level.tests = testsFromHost; });
    }
    document.getElementById('header-info').style.display = 'block';
    updateNavigationButtons();
    loadLevel(0);
    return true;
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
async function loadLevel(levelIndex) {
    if (!courseData || levelIndex < 0 || levelIndex >= courseData.levels.length) return;
    
    currentLevel = levelIndex;
    const level = courseData.levels[levelIndex];
    
    // Set current level in UserProgressManager
    UserProgressManager.setCurrentLevel(level);
    
    // Store the current level's starter code globally for Blockly to access
    window.currentLessonStarterCode = level.starterCode;
    
    // Update header UI
    document.getElementById('chapter-title').textContent = courseData.categoryName || courseData.chapterName;
    document.getElementById('level-info').textContent = `CHAPTER ${courseData.chapterNumber} • LEVEL ${levelIndex + 1}`;
    document.getElementById('victory-level-text').textContent = `LEVEL ${levelIndex + 1}`;
    
    updateNavigationButtons();
    updateProgressIndicators();
    
    await LevelLoader.initialize(level, courseData);

    // Handle UI/Editor setup
    const contentContainer = document.getElementById('content');
    const hasEditorInfrastructure = document.querySelector('.embedded-editor-container');
    
    if (!hasEditorInfrastructure) {
        let htmlContent = '';
        htmlContent += `<div id="lesson-content">${markdownToHTML(level.markdown)}</div>`;
        htmlContent += `
            <div class="embedded-editor-container full-width">
                <div class="controls">
                    <div class="controls-top">
                        <div class="run-btn-wrapper">
                            <button class="btn run-btn" id="run-btn">
                                <span class="btn-icon">▶</span> <span class="btn-text">RUN CODE</span>
                            </button>
                            <span class="run-tooltip">Run with keyboard: ⌘/Ctrl + Enter</span>
                        </div>
                        <span class="infinity-symbol">∞</span>
                    </div>
                    <div class="controls-bottom">
                        <button type="button" class="btn secondary-btn" id="reset-btn">
                            <span class="btn-icon">↺</span> <span class="btn-text">RESET</span>
                        </button>
                        <button type="button" class="btn secondary-btn" id="help-btn">
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
        const lessonContentElement = document.getElementById('lesson-content');
        if (lessonContentElement) {
            lessonContentElement.innerHTML = markdownToHTML(level.markdown);
        }
        const categoryTitle = contentContainer.querySelector('h1');
        if (courseData.categoryName && categoryTitle) {
            categoryTitle.textContent = courseData.categoryName;
        }
    }
    
    // Update editors and controls (deferred to allow DOM updates)
    setTimeout(() => {
        const isFirstLoad = !hasEditorInfrastructure;
        
        if (isFirstLoad) {
            EditorManager.init();
            const codeToLoad = UserProgressManager.codeForLevel(level);
            EditorManager.updateCode(codeToLoad);
            window.currentLessonStarterCode = codeToLoad;

            // Load Blockly CSS if needed
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
                const controlsTop = document.querySelector('.controls-top');
                if (controlsTop) {
                    window.BlocklyModeSwitcher.addToggleButtons(controlsTop);
                }
                if (window.BlocklySettings && !window.BlocklySettings.initialized) {
                    window.BlocklySettings.init();
                    window.BlocklySettings.initialized = true;
                }
            }
            
            document.getElementById('run-btn').addEventListener('click', runCode);
            document.getElementById('reset-btn').addEventListener('click', resetGame);
            document.getElementById('help-btn').addEventListener('click', showLevelAdvice);
            
            // Add keyboard shortcut: Cmd+Enter (macOS) / Ctrl+Enter (Windows) to run code
            document.addEventListener('keydown', function(e) {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    runCode();
                }
            });
            
            // Initialize tutor toggle button
            const tutorToggle = document.getElementById('tutor-toggle');
            if (tutorToggle && window.toggleTutor) {
                tutorToggle.addEventListener('click', window.toggleTutor);
                const toggleText = tutorToggle.querySelector('.toggle-text');
                const toggleIcon = tutorToggle.querySelector('.toggle-icon');
                if (!toggleIcon) {
                    const icon = document.createElement('span');
                    icon.className = 'toggle-icon';
                    icon.textContent = '🐶';
                    tutorToggle.appendChild(icon);
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
            const codeToLoad = UserProgressManager.codeForLevel(level);
            EditorManager.updateCode(codeToLoad);
            window.currentLessonStarterCode = codeToLoad;

            if (window.BlocklyModeSwitcher) {
                const wasInBlockMode = window.BlocklyModeSwitcher.isBlockMode();
                if (wasInBlockMode) {
                    if (window.BlocklyWorkspace && window.BlocklyWorkspace.workspace) {
                        window.BlocklyWorkspace.workspace.clear();
                        if (window.BlocklyIntegration && codeToLoad) {
                            setTimeout(() => {
                                window.BlocklyIntegration.convertFromText(codeToLoad);
                            }, 100);
                        }
                    }
                }
            }
        }
        
        if (isFirstLoad && window.BlocklySettings && window.BlocklySettings.getSetting('startInBlocksMode')) {
            setTimeout(() => {
                console.log('Auto-switching to Blockly mode (Start in Blocks Mode is ON)');
                window.BlocklyModeSwitcher.switchToBlockMode();
            }, 300);
        }
    }, 0);
    
    // Render the game
    render();
    
    // Initialize viewport position
    if (window.updateViewport) updateViewport();
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
    
    if (courseData && currentLevel >= courseData.levels.length - 1) {
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'nextSlide', skip: true }, '*');
        }
    } else {
        nextLevel();
    }
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
    fetch('sprites.json')
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

// Load available sprites on startup
loadAvailableSprites();

window.addEventListener('message', (event) => {
    const message = event.data;
    if (event.source !== window.parent || !message || message.type !== 'load-lesson' || typeof message.body !== 'string') return;
    try {
        const slide = JSON.parse(message.body);
        startChapter(slide.content || '', slide.tests || []);
    } catch (error) {
        console.log('Could not read the chapter sent by the host', error);
    }
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
        
        // Initialize SceneryManager (multi-tile walkable scenery)
        if (window.SceneryManager) {
            await SceneryManager.init();
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

// Note: Tile hover tracking is now in js/map/tile-hover.js
