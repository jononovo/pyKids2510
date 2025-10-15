// ============================================
//   MODE SWITCHER UI
// ============================================

window.BlocklyModeSwitcher = {
    currentMode: 'text',
    textContainer: null,
    blockContainer: null,

    // Initialize the mode switcher
    init: function() {
        // This will be called from main.js when editor is loaded
        
        // Initialize control panel (if script loaded)
        if (window.BlocklyControlPanel) {
            window.BlocklyControlPanel.insert();
        }
    },

    // Add mode toggle buttons to the editor controls
    addToggleButtons: function(controlsContainer) {
        // Check if buttons already exist
        if (document.getElementById('text-mode-btn')) return;

        // Create mode toggle container
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'mode-toggle';
        
        // Text mode button
        const textBtn = document.createElement('button');
        textBtn.id = 'text-mode-btn';
        textBtn.className = 'mode-btn active';
        textBtn.innerHTML = '<span class="btn-icon">👩🏻‍💻</span> <span class="btn-text">Python</span>';
        textBtn.onclick = () => this.switchToTextMode();
        
        // Block mode button
        const blockBtn = document.createElement('button');
        blockBtn.id = 'block-mode-btn';
        blockBtn.className = 'mode-btn';
        blockBtn.innerHTML = '<span class="btn-icon">🧩</span> <span class="btn-text">Blocks</span>';
        blockBtn.onclick = () => this.switchToBlockMode();
        
        toggleContainer.appendChild(textBtn);
        toggleContainer.appendChild(blockBtn);
        
        // Add to controls
        controlsContainer.appendChild(toggleContainer);
    },

    // Switch to text mode
    switchToTextMode: function() {
        if (this.currentMode === 'text') return;
        
        // No syncing - each editor maintains its own state
        
        this.currentMode = 'text';
        
        // Update UI
        const textBtn = document.getElementById('text-mode-btn');
        const blockBtn = document.getElementById('block-mode-btn');
        const textContainer = document.querySelector('.code-editor-container');
        const blockContainer = document.getElementById('blockly-container');
        
        if (textBtn) textBtn.classList.add('active');
        if (blockBtn) blockBtn.classList.remove('active');
        
        // Show text editor, hide Blockly
        if (textContainer) {
            textContainer.style.display = 'flex';
        }
        if (blockContainer) {
            blockContainer.style.display = 'none';
        }
        
        // Switch control panels
        if (window.BlocklyControlPanel) {
            window.BlocklyControlPanel.hide();
        }
        
        // Hide settings button in text mode (Option 2: Settings only in Blockly mode)
        const settingsBtn = document.getElementById('blockly-settings-btn');
        if (settingsBtn) {
            settingsBtn.style.display = 'none';
        }
    },

    // Switch to block mode
    switchToBlockMode: async function() {
        if (this.currentMode === 'blocks') return;
        
        const blockBtn = document.getElementById('block-mode-btn');
        
        // Show loading state
        if (blockBtn) {
            blockBtn.classList.add('loading');
            blockBtn.innerHTML = '<span class="btn-icon">⏳</span> <span class="btn-text">Loading...</span>';
        }
        
        try {
            // Update UI and prepare container FIRST
            const textBtn = document.getElementById('text-mode-btn');
            const textContainer = document.querySelector('.code-editor-container');
            let blockContainer = document.getElementById('blockly-container');
            
            // Create block container if it doesn't exist
            if (!blockContainer) {
                blockContainer = this.createBlockContainer();
                // Force a DOM refresh to ensure container is ready
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            // Show Blockly container BEFORE initializing
            if (textContainer) {
                textContainer.style.display = 'none';
            }
            if (blockContainer) {
                blockContainer.style.display = 'block';
            }
            
            // Wait for next frame to ensure DOM updates
            await new Promise(resolve => requestAnimationFrame(resolve));
            
            // Find the workspace element inside the container
            const workspaceElement = blockContainer.querySelector('#blockly-workspace');
            if (!workspaceElement) {
                throw new Error('Blockly workspace element not found in container');
            }
            
            // Track if this is a fresh initialization
            let isFirstInit = false;
            
            // Now initialize Blockly with the actual workspace element
            if (!window.BlocklyIntegration.isReady()) {
                await window.BlocklyIntegration.initialize(workspaceElement);
                isFirstInit = true;
            } else {
                // If already loaded, just initialize the workspace if needed
                if (window.BlocklyWorkspace && !window.BlocklyWorkspace.workspace) {
                    window.BlocklyWorkspace.initialize(workspaceElement);
                    isFirstInit = true;
                }
            }
            
            this.currentMode = 'blocks';
            
            if (textBtn) textBtn.classList.remove('active');
            if (blockBtn) {
                blockBtn.classList.add('active');
                blockBtn.classList.remove('loading');
                blockBtn.innerHTML = '<span class="btn-icon">🧩</span> <span class="btn-text">Blocks</span>';
            }
            
            // Switch control panels
            if (window.BlocklyControlPanel) {
                window.BlocklyControlPanel.show();
            }
            
            // Initialize settings if available (Option 2: Settings only in Blockly mode)
            if (window.BlocklySettings) {
                if (!window.BlocklySettings.initialized) {
                    window.BlocklySettings.init();
                    window.BlocklySettings.initialized = true;
                } else {
                    // Just add the button since settings are already initialized
                    window.BlocklySettings.addSettingsButton();
                }
                // Make sure button is visible in Blockly mode
                const settingsBtn = document.getElementById('blockly-settings-btn');
                if (settingsBtn) {
                    settingsBtn.style.display = 'inline-block';
                }
            }
            
            // Only load starter code on first initialization - preserve workspace state otherwise
            if (isFirstInit) {
                const codeToLoad = window.currentLessonStarterCode || '';
                
                // Convert starter code to blocks
                if (window.BlocklyIntegration && codeToLoad) {
                    // Wait a bit for workspace to be ready
                    setTimeout(() => {
                        window.BlocklyIntegration.convertFromText(codeToLoad);
                    }, 100);
                }
            }
            
            // Resize workspace
            if (window.BlocklyWorkspace) {
                setTimeout(() => window.BlocklyWorkspace.resize(), 100);
            }
            
        } catch (error) {
            // Failed to switch to block mode
            
            // Reset button state
            if (blockBtn) {
                blockBtn.classList.remove('loading');
                blockBtn.innerHTML = '<span class="btn-icon">🧩</span> <span class="btn-text">Blocks</span>';
            }
            
            // Show error message
            alert('Failed to load Blockly. Please try again.');
            
            // Stay in text mode
            this.switchToTextMode();
        }
    },

    // Create the Blockly container (only called once)
    createBlockContainer: function() {
        // Check if container already exists globally
        let blockContainer = document.getElementById('blockly-container');
        if (blockContainer) {
            return blockContainer;
        }
        
        // Find the parent that contains both editors
        const editorContainer = document.querySelector('.embedded-editor-container');
        if (!editorContainer) return null;

        // Create new container that will REPLACE the text editor when shown
        blockContainer = document.createElement('div');
        blockContainer.id = 'blockly-container';
        blockContainer.className = 'blockly-container';
        blockContainer.style.display = 'none';  // Hidden by default
        blockContainer.style.width = '100%';
        blockContainer.style.height = '400px';
        blockContainer.innerHTML = `
            <div id="blockly-workspace" style="width: 100%; height: 100%;"></div>
            <div class="blockly-loading">Loading Blockly...</div>
        `;
        
        // Insert as sibling to code-editor-container (not inside it!)
        const codeEditorContainer = editorContainer.querySelector('.code-editor-container');
        if (codeEditorContainer && codeEditorContainer.parentNode) {
            codeEditorContainer.parentNode.appendChild(blockContainer);
        } else {
            editorContainer.appendChild(blockContainer);
        }
        
        return blockContainer;
    },

    // Get code based on current mode
    getCode: function() {
        if (this.currentMode === 'text') {
            return window.jar ? window.jar.toString() : '';
        } else if (this.currentMode === 'blocks') {
            return window.BlocklyIntegration ? window.BlocklyIntegration.getCode() : '';
        }
        return '';
    },

    // Check current mode
    isBlockMode: function() {
        return this.currentMode === 'blocks';
    }
};