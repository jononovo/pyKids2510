// ============================================
//   BLOCKLY WORKSPACE MANAGER
// ============================================

window.BlocklyWorkspace = {
    workspace: null,
    container: null,
    toolboxMode: 'simple', // 'simple' or 'full'
    requiredBlocks: [],

    // Initialize the Blockly workspace
    initialize: async function(containerElement) {
        if (this.workspace) {
            // Workspace already initialized
            return;
        }

        // Use provided container or try to find it
        const container = containerElement || document.getElementById('blockly-workspace');
        if (!container) {
            // Blockly workspace container not found
            return;
        }
        
        // Store the container
        this.container = container;
        
        // Ensure container has dimensions
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            // Blockly container has no dimensions, setting defaults
            container.style.width = '100%';
            container.style.height = '400px';
            // Force layout recalculation
            container.offsetHeight;
        }
        
        // Initialize blocks
        if (window.BlocklyMovementBlocks) {
            window.BlocklyMovementBlocks.init();
        }
        if (window.BlocklyControlBlocks) {
            window.BlocklyControlBlocks.init();
        }
        
        // Initialize code generator
        if (window.BlocklyGenerator) {
            window.BlocklyGenerator.init();
        }
        
        // Scan chapter for required blocks (if solution scanner is available)
        if (window.SolutionScanner) {
            this.requiredBlocks = await window.SolutionScanner.scanChapterSolutions();
        }
        
        // Always use simple mode - shows only required blocks for the lesson
        this.toolboxMode = 'simple';

        // Store the simple toolbox XML for later use
        this.fullToolboxXML = BlocklyConfig.getSimpleToolboxXML(this.requiredBlocks);
        
        // Start with an EMPTY toolbox (not null, but empty - so it exists but shows nothing)
        const emptyToolbox = '<xml id="toolbox"></xml>';

        try {
            // Register custom flyout for smaller toolbox blocks
            if (window.CustomVerticalFlyout) {
                Blockly.registry.register(
                    Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX,
                    'CustomVerticalFlyout',
                    window.CustomVerticalFlyout
                );
            }
            
            // Create theme now that Blockly is loaded
            const customTheme = Blockly.Theme.defineTheme('custom', {
                'base': Blockly.Themes.Classic,
                'componentStyles': {
                    'workspaceBackgroundColour': '#0d1117',
                    'toolboxBackgroundColour': '#1a1f2e',
                    'flyoutBackgroundColour': '#161b22',
                    'scrollbarColour': '#3a3a3a',
                    'insertionMarkerColour': '#7fc542',
                    'insertionMarkerOpacity': 0.3
                },
                'fontStyle': {
                    'size': 10,  // Reduced font size to match smaller blocks
                    'weight': '600'
                }
            });

            // Create workspace with EMPTY toolbox (exists but shows nothing)
            const workspaceConfig = {
                ...BlocklyConfig.workspace,
                theme: customTheme,
                toolbox: emptyToolbox,  // Start with empty toolbox
                plugins: window.CustomVerticalFlyout ? {
                    flyoutsVerticalToolbox: 'CustomVerticalFlyout'
                } : undefined
            };

            // Use the container element directly or its ID
            const targetElement = typeof this.container === 'string' ? this.container : this.container.id || this.container;
            this.workspace = Blockly.inject(targetElement, workspaceConfig);


            // Hide loading message
            const loadingEl = document.querySelector('.blockly-loading');
            if (loadingEl) {
                loadingEl.style.display = 'none';
            }
            
            // No need to hide toolbox - it's already empty and shows nothing
            
            // Create the Add Blocks button
            setTimeout(() => {
                this.createAddBlocksButton();
            }, 50);

            // Blockly workspace initialized successfully
        } catch (error) {
            // Failed to initialize Blockly workspace
        }
    },
    
    // Track shared auto-hide timer
    autoHideTimer: null,
    
    // Create the Add Blocks button
    createAddBlocksButton: function() {
        // Check if button already exists
        if (document.getElementById('add-blocks-button')) {
            return;
        }
        
        // Create the button
        const addBlocksButton = document.createElement('button');
        addBlocksButton.id = 'add-blocks-button';
        addBlocksButton.className = 'add-blocks-btn';
        addBlocksButton.innerHTML = `
            <span class="plus-icon">+</span>
            <span class="button-text">Add Blocks</span>
        `;
        addBlocksButton.title = 'Show block toolbox';
        
        // Insert the button into the blockly area
        const blocklyArea = document.getElementById('blockly-workspace');
        if (blocklyArea) {
            blocklyArea.appendChild(addBlocksButton);
        }
        
        // Function to create collapse button
        const createCollapseButton = () => {
            console.log('Creating collapse button...');
            
            // Check if button already exists
            let collapseBtn = document.getElementById('toolbox-collapse-btn');
            
            if (!collapseBtn) {
                console.log('Creating new collapse button');
                // Create the collapse button
                collapseBtn = document.createElement('button');
                collapseBtn.id = 'toolbox-collapse-btn';
                collapseBtn.className = 'toolbox-collapse-btn';
                collapseBtn.innerHTML = '&lt;';
                collapseBtn.title = 'Hide toolbox';
                
                // Append to the blockly workspace container
                const blocklyArea = document.getElementById('blockly-workspace');
                if (blocklyArea) {
                    blocklyArea.appendChild(collapseBtn);
                    console.log('Button appended to blockly workspace');
                }
                
                // Add click handler
                collapseBtn.addEventListener('click', () => {
                    console.log('Collapse button clicked');
                    hideToolbox();
                });
            } else {
                console.log('Button already exists');
            }
            
            // Find the toolbox element - try multiple selectors
            let toolboxDiv = document.querySelector('.blocklyToolboxDiv');
            if (!toolboxDiv) {
                toolboxDiv = document.querySelector('.blocklyFlyout');
            }
            if (!toolboxDiv) {
                // Also check inside the blockly workspace
                const blocklyArea = document.getElementById('blockly-workspace');
                if (blocklyArea) {
                    toolboxDiv = blocklyArea.querySelector('[role="listbox"]')?.parentElement;
                }
            }
            
            let toolboxWidth = 200; // Default based on observed width
            
            if (toolboxDiv) {
                // Get the actual computed width of the toolbox
                const rect = toolboxDiv.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(toolboxDiv);
                const actualWidth = rect.width || toolboxDiv.offsetWidth || parseInt(computedStyle.width) || 200;
                toolboxWidth = actualWidth;
                console.log('Found toolbox element:', toolboxDiv.className);
                console.log('Measured toolbox width:', toolboxWidth);
            } else {
                console.log('Toolbox element not found, using default width:', toolboxWidth);
            }
            
            // Position it at the actual edge of the toolbox within the workspace
            // Positioned at same height as Add Blocks button (top: 20px)
            collapseBtn.style.position = 'absolute';
            collapseBtn.style.left = (toolboxWidth - 6) + 'px'; // Moved 1px left
            collapseBtn.style.top = '20px'; // Same as Add Blocks button
            collapseBtn.style.display = 'block';
            collapseBtn.style.zIndex = '1000'; // High z-index to stay above Blockly elements
            
            console.log('Button positioned at', (toolboxWidth - 6) + 'px from left');
            return collapseBtn;
        };
        
        // Function to show toolbox
        const showToolbox = () => {
            console.log('showToolbox called, workspace:', this.workspace);
            if (this.workspace) {
                // Populate the toolbox with the full toolbox XML
                this.workspace.updateToolbox(this.fullToolboxXML);
                this.workspace.resize();  // Recalculate workspace after showing
                addBlocksButton.classList.add('hidden');
                
                // Add class to show the blue border
                const blocklyArea = document.getElementById('blockly-workspace');
                if (blocklyArea) {
                    blocklyArea.classList.add('toolbox-visible');
                }
                console.log('Toolbox shown with XML');
                
                // Wait a moment for the toolbox to render, then create collapse button
                setTimeout(() => {
                    createCollapseButton();
                }, 200); // Wait 200ms for toolbox to fully render
                
                // Start/restart inactivity timer using shared timer
                clearTimeout(this.autoHideTimer);
                this.autoHideTimer = setTimeout(() => {
                    hideToolbox();
                }, 10000);  // Hide after 10 seconds of inactivity
            }
        };
        
        // Function to hide toolbox
        const hideToolbox = () => {
            if (this.workspace) {
                // Empty the toolbox (back to empty state)
                this.workspace.updateToolbox('<xml id="toolbox"></xml>');
                this.workspace.resize();  // Recalculate workspace metrics
                addBlocksButton.classList.remove('hidden');
                
                // Remove class to hide the blue border
                const blocklyArea = document.getElementById('blockly-workspace');
                if (blocklyArea) {
                    blocklyArea.classList.remove('toolbox-visible');
                }
                
                // Hide collapse button
                const collapseBtn = document.getElementById('toolbox-collapse-btn');
                if (collapseBtn) {
                    collapseBtn.style.display = 'none';
                }
            }
        };
        
        // Reset inactivity timer on any workspace interaction
        const resetInactivityTimer = () => {
            // Check if toolbox has content (not empty)
            if (this.workspace && this.workspace.getToolbox() && 
                this.workspace.getToolbox().getToolboxItems().length > 0) {
                clearTimeout(this.autoHideTimer);
                this.autoHideTimer = setTimeout(() => {
                    hideToolbox();
                }, 10000);
            }
        };
        
        // Add event listeners
        addBlocksButton.addEventListener('click', () => {
            console.log('Add Blocks button clicked!');
            showToolbox();
        });
        
        // Listen for workspace interactions to reset timer
        if (this.workspace) {
            this.workspace.addChangeListener((event) => {
                // Reset timer on any workspace change
                if (event.type !== Blockly.Events.FINISHED_LOADING) {
                    resetInactivityTimer();
                }
            });
            
            // Also reset on mouse movement over toolbox
            const toolboxDiv = document.querySelector('.blocklyToolboxDiv');
            if (toolboxDiv) {
                toolboxDiv.addEventListener('mousemove', resetInactivityTimer);
                toolboxDiv.addEventListener('click', resetInactivityTimer);
            }
        }
    },

    // Get generated Python code
    getCode: function() {
        if (!this.workspace) return '';
        
        // Use our custom generator
        if (window.BlocklyGenerator) {
            return window.BlocklyGenerator.generateCode(this.workspace);
        }
        
        return '';
    },

    // Load blocks from Python text
    loadFromText: function(pythonCode) {
        if (!this.workspace) {
            // Workspace not initialized
            return;
        }

        // Clear existing blocks
        this.workspace.clear();

        // Parse Python code and create blocks
        this.parsePythonToBlocks(pythonCode);
    },

    // Parse Python code and create blocks
    parsePythonToBlocks: function(pythonCode) {
        const lines = pythonCode.split('\n').filter(line => line.trim());
        
        let previousBlock = null;
        let indentStack = [];
        
        // Get viewport center for better initial positioning
        const metrics = this.workspace.getMetrics();
        let x = metrics.viewLeft + (metrics.viewWidth / 2) - 100;  // Center horizontally
        let y = metrics.viewTop + 30;  // Near top of visible area

        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            let block = null;

            // Detect different commands
            try {
                if (trimmed === 'import player') {
                    block = this.workspace.newBlock('import_player');
                } else if (trimmed.includes('player.move_forward()')) {
                    block = this.workspace.newBlock('player_move_forward');
                } else if (trimmed.includes('player.move_forward(')) {
                const match = trimmed.match(/player\.move_forward\((\d+)\)/);
                if (match) {
                    block = this.workspace.newBlock('player_move_steps');
                    const numberBlock = this.workspace.newBlock('math_number');
                    numberBlock.setFieldValue(match[1], 'NUM');
                    numberBlock.initSvg();
                    numberBlock.render();
                    block.getInput('STEPS').connection.connect(numberBlock.outputConnection);
                }
                } else if (trimmed.includes('player.turn_left()')) {
                    block = this.workspace.newBlock('player_turn_left');
                } else if (trimmed.includes('player.turn_right()')) {
                    block = this.workspace.newBlock('player_turn_right');
                } else if (trimmed.startsWith('for ') && trimmed.includes('in range')) {
                    // Handle for loops
                    const match = trimmed.match(/for .+ in range\((\d+)\)/);
                    if (match) {
                        block = this.workspace.newBlock('controls_repeat_ext');
                        const numberBlock = this.workspace.newBlock('math_number');
                        numberBlock.setFieldValue(match[1], 'NUM');
                        numberBlock.initSvg();
                        numberBlock.render();
                        block.getInput('TIMES').connection.connect(numberBlock.outputConnection);
                        indentStack.push(block);
                    }
                }
            } catch (error) {
                // Error creating block for line
            }

            if (block) {
                block.initSvg();
                
                // Handle indentation for nested blocks
                const indent = line.length - line.trimStart().length;
                if (indent > 0 && indentStack.length > 0) {
                    // This is inside a loop/control block
                    const parentBlock = indentStack[indentStack.length - 1];
                    const statementConnection = parentBlock.getInput('DO');
                    if (statementConnection) {
                        if (statementConnection.connection.targetBlock()) {
                            // Find last block in the statement
                            let lastBlock = statementConnection.connection.targetBlock();
                            while (lastBlock.nextConnection && lastBlock.nextConnection.targetBlock()) {
                                lastBlock = lastBlock.nextConnection.targetBlock();
                            }
                            lastBlock.nextConnection.connect(block.previousConnection);
                        } else {
                            statementConnection.connection.connect(block.previousConnection);
                        }
                    }
                } else {
                    // Top-level block
                    if (previousBlock && previousBlock.nextConnection) {
                        previousBlock.nextConnection.connect(block.previousConnection);
                    } else {
                        block.moveBy(x, y);
                        y += 50;
                    }
                    previousBlock = block;
                }

                block.render();
            }
        }
    },

    // Resize workspace to fit container
    resize: function() {
        if (this.workspace) {
            Blockly.svgResize(this.workspace);
        }
    },

    // Dispose of workspace
    dispose: function() {
        if (this.workspace) {
            this.workspace.dispose();
            this.workspace = null;
        }
    }
};