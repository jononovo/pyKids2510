// ============================================
//   BLOCKLY CONTROL PANEL
// ============================================

window.BlocklyControlPanel = {
    container: null,
    
    // Create the control panel for Blockly mode
    create: function() {
        // Check if already exists
        if (this.container) {
            return this.container;
        }
        
        // Create container
        this.container = document.createElement('div');
        this.container.id = 'blockly-control-panel';
        this.container.className = 'editor-controls';
        this.container.style.display = 'none'; // Hidden by default
        
        // Create the control buttons HTML
        this.container.innerHTML = `
            <button class="run-btn" id="blockly-run-btn">
                <span class="btn-icon">▶</span> <span class="btn-text">RUN CODE</span>
            </button>
            
            <button class="loop-btn" id="blockly-loop-btn" title="Run in loop">
                <span>∞</span>
            </button>
            
            <div class="mode-toggle-container">
                <button class="mode-btn active" id="blockly-python-btn" title="Switch to Python">
                    <span class="btn-icon">👩🏻‍💻</span><br><span class="btn-text">PYTHON</span>
                </button>
                <button class="mode-btn" id="blockly-blocks-btn" title="Blocks mode" disabled>
                    <span class="btn-icon">⬛</span><br><span class="btn-text">BLOCKS</span>
                </button>
            </div>
            
            <button class="reset-btn" id="blockly-reset-btn">
                <span class="btn-icon">↺</span> <span class="btn-text">RESET</span>
            </button>
            
            <button class="save-btn" id="blockly-save-btn">
                <span class="btn-icon">?</span> <span class="btn-text">HELP</span>
            </button>
        `;
        
        return this.container;
    },
    
    // Insert the control panel into DOM
    insert: function() {
        const editorContainer = document.querySelector('.embedded-editor-container');
        const originalControls = document.querySelector('.editor-controls');
        
        if (!editorContainer || !originalControls) {
            // Could not find editor container or original controls
            return;
        }
        
        // Create if doesn't exist
        if (!this.container) {
            this.create();
        }
        
        // Insert after original controls
        originalControls.parentNode.insertBefore(this.container, originalControls.nextSibling);
        
        // Attach event listeners
        this.attachEventListeners();
    },
    
    // Show the Blockly control panel
    show: function() {
        if (this.container) {
            this.container.style.display = 'flex';
        }
        
        // Hide original controls
        const originalControls = document.querySelector('.editor-controls');
        if (originalControls) {
            originalControls.style.display = 'none';
        }
    },
    
    // Hide the Blockly control panel
    hide: function() {
        if (this.container) {
            this.container.style.display = 'none';
        }
        
        // Show original controls
        const originalControls = document.querySelector('.editor-controls');
        if (originalControls) {
            originalControls.style.display = 'flex';
        }
    },
    
    // Attach event listeners to buttons
    attachEventListeners: function() {
        // Run button - executes Blockly-generated code
        const runBtn = document.getElementById('blockly-run-btn');
        if (runBtn) {
            runBtn.onclick = () => {
                // Blockly Run button clicked
                this.runBlocklyCode();
            };
        }
        
        // Reset button
        const resetBtn = document.getElementById('blockly-reset-btn');
        if (resetBtn) {
            resetBtn.onclick = () => {
                // Blockly Reset button clicked
                if (window.gameEngine) {
                    window.gameEngine.reset();
                }
            };
        }
        
        // Python mode button - switch back to text editor
        const pythonBtn = document.getElementById('blockly-python-btn');
        if (pythonBtn) {
            pythonBtn.onclick = () => {
                // Switching to Python mode
                if (window.ModeSwitcher) {
                    window.ModeSwitcher.switchToTextMode();
                }
            };
        }
        
        // Save button
        const saveBtn = document.getElementById('blockly-save-btn');
        if (saveBtn) {
            saveBtn.onclick = () => {
                // Blockly Save button clicked
                this.saveBlocklyWorkspace();
            };
        }
        
        // Load button
        const loadBtn = document.getElementById('blockly-load-btn');
        if (loadBtn) {
            loadBtn.onclick = () => {
                // Blockly Load button clicked
                this.loadBlocklyWorkspace();
            };
        }
        
        // Tutor toggle
        const tutorToggle = document.getElementById('blockly-tutor-toggle');
        if (tutorToggle) {
            tutorToggle.onclick = () => {
                const currentState = tutorToggle.getAttribute('data-state');
                const newState = currentState === 'on' ? 'off' : 'on';
                tutorToggle.setAttribute('data-state', newState);
                tutorToggle.textContent = newState.toUpperCase();
                
                // Toggle tutor state
                if (window.codingTutor) {
                    window.codingTutor.enabled = (newState === 'on');
                    localStorage.setItem('tutorEnabled', newState === 'on');
                }
            };
        }
        
        // Loop button (not implemented yet)
        const loopBtn = document.getElementById('blockly-loop-btn');
        if (loopBtn) {
            loopBtn.onclick = () => {
                // Loop mode not yet implemented for Blockly
            };
        }
    },
    
    // Run the Blockly-generated code
    runBlocklyCode: function() {
        if (!window.BlocklyIntegration || !window.BlocklyIntegration.isReady()) {
            // Blockly not ready
            return;
        }
        
        // Get code from Blockly
        const code = window.BlocklyIntegration.getCode();
        // Generated code from Blockly
        
        if (!code || code.trim() === '') {
            // No blocks to execute
            return;
        }
        
        // Execute the code using the existing Python parser
        if (window.pythonExecutor) {
            window.pythonExecutor.execute(code);
        } else {
            // Python executor not found
        }
    },
    
    // Save Blockly workspace
    saveBlocklyWorkspace: function() {
        if (!window.BlocklyWorkspace || !window.BlocklyWorkspace.workspace) {
            // Blockly workspace not initialized
            return;
        }
        
        try {
            // Serialize workspace to XML
            const xml = Blockly.Xml.workspaceToDom(window.BlocklyWorkspace.workspace);
            const xmlText = Blockly.Xml.domToText(xml);
            
            // Create download link
            const blob = new Blob([xmlText], { type: 'text/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'blockly-workspace.xml';
            a.click();
            URL.revokeObjectURL(url);
            
            // Blockly workspace saved
        } catch (error) {
            // Failed to save Blockly workspace
        }
    },
    
    // Load Blockly workspace
    loadBlocklyWorkspace: function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xml';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const xmlText = e.target.result;
                    const xml = Blockly.utils.xml.textToDom(xmlText);
                    
                    // Clear workspace and load new content
                    if (window.BlocklyWorkspace && window.BlocklyWorkspace.workspace) {
                        window.BlocklyWorkspace.workspace.clear();
                        Blockly.Xml.domToWorkspace(xml, window.BlocklyWorkspace.workspace);
                        // Blockly workspace loaded
                    }
                } catch (error) {
                    // Failed to load Blockly workspace
                    alert('Failed to load workspace file');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    },
    
    // Update coin count display
    updateCoinCount: function(current, total) {
        const coinDisplay = document.getElementById('blockly-coin-count');
        if (coinDisplay) {
            coinDisplay.textContent = `${current}/${total}`;
        }
    }
};