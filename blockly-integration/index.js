// ============================================
//   BLOCKLY INTEGRATION - MAIN ENTRY POINT
// ============================================

// This is the main entry point for Blockly integration
// It provides a minimal interface to the main application
// and handles lazy loading of all Blockly resources

window.BlocklyIntegration = (function() {
    let isInitialized = false;
    let isLoading = false;
    let loadPromise = null;
    
    // Configuration
    const config = {
        cdnBase: 'https://unpkg.com/blockly@11.0.0',
        modulesPath: '/blockly-integration'
    };
    
    // Load all Blockly resources dynamically
    async function loadBlocklyResources() {
        if (isInitialized) return Promise.resolve();
        if (loadPromise) return loadPromise;
        
        isLoading = true;
        
        loadPromise = new Promise(async (resolve, reject) => {
            try {
                // Load CSS first
                await loadCSS(`${config.modulesPath}/ui/styles.css`);
                await loadCSS(`${config.modulesPath}/ui/settings-dialog.css`);
                await loadCSS(`${config.modulesPath}/ui/sliding-drawer.css`);
                
                // Load Blockly core from CDN
                await loadScript(`${config.cdnBase}/blockly.min.js`);
                
                // We don't need the Python generator - we use our custom generator!
                
                // Load our custom modules
                await loadScript(`${config.modulesPath}/utils/solution-scanner.js`);
                await loadScript(`${config.modulesPath}/core/config.js`);
                await loadScript(`${config.modulesPath}/core/custom-flyout.js`);
                await loadScript(`${config.modulesPath}/blocks/movement-blocks.js`);
                await loadScript(`${config.modulesPath}/blocks/control-blocks.js`);
                await loadScript(`${config.modulesPath}/blocks/generator.js`);
                await loadScript(`${config.modulesPath}/core/workspace.js`);
                await loadScript(`${config.modulesPath}/ui/control-panel.js`);
                await loadScript(`${config.modulesPath}/ui/settings-dialog.js`);
                // mode-switcher.js is now loaded immediately in HTML, not lazy-loaded
                
                isInitialized = true;
                isLoading = false;
                // Blockly resources loaded successfully
                resolve();
            } catch (error) {
                isLoading = false;
                // Failed to load Blockly resources
                reject(error);
            }
        });
        
        return loadPromise;
    }
    
    // Helper to load CSS dynamically
    function loadCSS(href) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }
    
    // Helper to load scripts dynamically
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }
    
    // Initialize Blockly (called when user switches to block mode)
    async function initialize(containerElement) {
        if (!isInitialized) {
            await loadBlocklyResources();
        }
        
        // Initialize workspace if loaded, passing the container element
        if (window.BlocklyWorkspace) {
            window.BlocklyWorkspace.initialize(containerElement);
        }
    }
    
    // Check if Blockly is ready
    function isReady() {
        return isInitialized;
    }
    
    // Get code from Blockly workspace
    function getCode() {
        if (!isInitialized || !window.BlocklyWorkspace) {
            return '';
        }
        return window.BlocklyWorkspace.getCode();
    }
    
    // Convert text to blocks
    function convertFromText(pythonCode) {
        if (!isInitialized || !window.BlocklyWorkspace) {
            // Blockly not initialized
            return;
        }
        window.BlocklyWorkspace.loadFromText(pythonCode);
    }
    
    // Clean up
    function dispose() {
        if (window.BlocklyWorkspace) {
            window.BlocklyWorkspace.dispose();
        }
    }
    
    // Public API
    return {
        initialize,
        isReady,
        getCode,
        convertFromText,
        dispose,
        isLoading: () => isLoading
    };
})();