// ============================================
//   BLOCKLY SETTINGS DIALOG
// ============================================

window.BlocklySettings = {
    // Settings storage
    settings: {
        startInBlocksMode: false   // Start new levels in Blockly visual mode instead of text editor
    },
    
    // Load settings from localStorage
    loadSettings: function() {
        const saved = localStorage.getItem('blocklySettings');
        if (saved) {
            try {
                this.settings = JSON.parse(saved);
            } catch (e) {
                // Failed to load Blockly settings
            }
        }
    },
    
    // Save settings to localStorage
    saveSettings: function() {
        localStorage.setItem('blocklySettings', JSON.stringify(this.settings));
    },
    
    // Get a specific setting
    getSetting: function(key) {
        return this.settings[key];
    },
    
    // Set a specific setting
    setSetting: function(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    },
    
    // Create and show the settings dialog
    showDialog: function() {
        // Check if dialog already exists
        if (document.getElementById('blockly-settings-dialog')) {
            document.getElementById('blockly-settings-dialog').style.display = 'block';
            return;
        }
        
        // Create dialog HTML
        const dialog = document.createElement('div');
        dialog.id = 'blockly-settings-dialog';
        dialog.className = 'blockly-settings-dialog';
        dialog.innerHTML = `
            <div class="settings-overlay"></div>
            <div class="settings-modal">
                <div class="settings-header">
                    <h2>⚙️ Blockly Settings</h2>
                    <button class="settings-close" onclick="BlocklySettings.hideDialog()">✕</button>
                </div>
                <div class="settings-content">
                    <div class="setting-item">
                        <label class="setting-label">
                            <input type="checkbox" id="start-in-blocks-toggle" 
                                ${this.settings.startInBlocksMode ? 'checked' : ''}>
                            <span class="toggle-switch"></span>
                            <div class="setting-text">
                                <div class="setting-title">Start in Blocks Mode</div>
                                <div class="setting-description">
                                    Open new levels in visual blocks mode instead of the text editor
                                </div>
                            </div>
                        </label>
                    </div>
                </div>
                <div class="settings-footer">
                    <button class="settings-btn settings-save" onclick="BlocklySettings.saveAndClose()">
                        Save Settings
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Add event listeners
        const startInBlocksToggle = document.getElementById('start-in-blocks-toggle');
        
        startInBlocksToggle.addEventListener('change', (e) => {
            this.settings.startInBlocksMode = e.target.checked;
        });
        
        // Close on overlay click
        dialog.querySelector('.settings-overlay').addEventListener('click', () => {
            this.hideDialog();
        });
    },
    
    // Hide the settings dialog
    hideDialog: function() {
        const dialog = document.getElementById('blockly-settings-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    },
    
    // Save settings and close dialog
    saveAndClose: function() {
        this.saveSettings();
        this.hideDialog();
    },
    
    // Add settings button to UI
    addSettingsButton: function() {
        // Find the LOAD button
        const controlsBottom = document.querySelector('.controls-bottom');
        if (!controlsBottom) {
            // Settings button not added: .controls-bottom not found
            return;
        }
        
        // Check if settings button already exists
        if (document.getElementById('blockly-settings-btn')) {
            // Settings button already exists
            return;
        }
        
        // Create settings button
        const settingsBtn = document.createElement('button');
        settingsBtn.id = 'blockly-settings-btn';
        settingsBtn.className = 'btn secondary-btn';
        settingsBtn.innerHTML = '⚙️';
        settingsBtn.title = 'Blockly Settings';
        settingsBtn.onclick = () => this.showDialog();
        
        // Add after LOAD button
        controlsBottom.appendChild(settingsBtn);
    },
    
    // Initialize settings system
    init: function() {
        this.loadSettings();
        this.addSettingsButton();
    }
};

// Don't auto-initialize - let main.js handle the timing