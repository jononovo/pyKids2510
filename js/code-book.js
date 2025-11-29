// ========================================
//   CODE BOOK FUNCTIONALITY
// ========================================

// State
let codeBookOpen = false;
let activeTab = 'commands';
const loadedTabs = {};

// Tab content sources
const TAB_SOURCES = {
    commands: '/assets/codebook/codebook-markdown.md',
    authoring: '/docs/LESSON_AUTHORING_GUIDE.md',
    tech: '/docs/TECHNICAL_DOCUMENTATION.md'
};

// Open Code Book
function openCodeBook() {
    const panel = document.getElementById('codeBookPanel');
    if (panel) {
        panel.classList.add('show');
        codeBookOpen = true;
        console.log('Code Book opened');
        
        // Load the active tab content if not already loaded
        loadTabContent(activeTab);
    }
}

// Close Code Book
function closeCodeBook() {
    const panel = document.getElementById('codeBookPanel');
    if (panel) {
        panel.classList.remove('show');
        codeBookOpen = false;
        console.log('Code Book closed');
    }
}

// Toggle Code Book
function toggleCodeBook() {
    if (codeBookOpen) {
        closeCodeBook();
    } else {
        openCodeBook();
    }
}

// Switch between tabs
function switchCodeBookTab(tabName) {
    if (activeTab === tabName) return;
    
    // Update active tab state
    activeTab = tabName;
    
    // Update tab button styles
    document.querySelectorAll('.code-book-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update tab content visibility
    document.querySelectorAll('.code-book-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = document.getElementById(tabName + 'Tab');
    if (activeContent) {
        activeContent.classList.add('active');
    }
    
    // Load content for this tab if not already loaded
    loadTabContent(tabName);
}

// Load content for a specific tab
async function loadTabContent(tabName) {
    // Skip if already loaded
    if (loadedTabs[tabName]) {
        console.log(`Tab '${tabName}' already loaded`);
        return;
    }
    
    const containerIds = {
        commands: 'codeBookSections',
        authoring: 'authoringSections',
        tech: 'techSections'
    };
    
    const containerId = containerIds[tabName];
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const source = TAB_SOURCES[tabName];
    if (!source) return;
    
    try {
        // Show loading indicator
        container.innerHTML = '<p style="color: #7fc542;">Loading documentation...</p>';
        
        // Fetch markdown content
        const response = await fetch(source);
        if (!response.ok) {
            throw new Error('Failed to load documentation');
        }
        
        const markdownContent = await response.text();
        
        // Check if marked library is available
        if (typeof marked === 'undefined') {
            console.error('Marked library not available');
            container.innerHTML = '<p style="color: #f88;">Markdown parser not available.</p>';
            return;
        }
        
        // Configure marked for better rendering
        marked.setOptions({
            breaks: true,
            gfm: true,
            tables: true,
            sanitize: false,
            highlight: function(code, lang) {
                if (lang === 'python' || !lang) {
                    return highlightPython(code);
                }
                return code;
            }
        });
        
        // Parse and render markdown
        const htmlContent = marked.parse(markdownContent);
        container.innerHTML = htmlContent;
        
        // Style the rendered content
        styleCodeBookContent(container);
        
        // Mark as loaded
        loadedTabs[tabName] = true;
        console.log(`Tab '${tabName}' loaded successfully`);
        
    } catch (error) {
        console.error('Error loading Code Book tab:', error);
        container.innerHTML = '<p style="color: #f88;">Failed to load documentation. Please try again.</p>';
    }
}

// Simple Python syntax highlighting
function highlightPython(code) {
    const keywords = ['import', 'def', 'class', 'if', 'else', 'elif', 'for', 'while', 
                     'return', 'await', 'async', 'try', 'except', 'with', 'as', 
                     'from', 'in', 'and', 'or', 'not', 'is', 'None', 'True', 'False',
                     'pass', 'break', 'continue', 'lambda', 'yield'];
    
    let highlighted = code;
    
    // Escape HTML
    highlighted = highlighted.replace(/&/g, '&amp;');
    highlighted = highlighted.replace(/</g, '&lt;');
    highlighted = highlighted.replace(/>/g, '&gt;');
    
    // Highlight strings (both single and double quotes)
    highlighted = highlighted.replace(/(["'])([^"'\\]|\\.)*?\1/g, '<span class="string">$&</span>');
    
    // Highlight comments
    highlighted = highlighted.replace(/(#[^\n]*)$/gm, '<span class="comment">$1</span>');
    
    // Highlight numbers
    highlighted = highlighted.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="number">$1</span>');
    
    // Highlight keywords
    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        highlighted = highlighted.replace(regex, `<span class="keyword">${keyword}</span>`);
    });
    
    // Highlight function names
    highlighted = highlighted.replace(/\b(player\.\w+)/g, '<span class="function">$1</span>');
    
    return highlighted;
}

// Apply custom styles to rendered markdown
function styleCodeBookContent(container) {
    // Style all code blocks
    const codeBlocks = container.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        block.classList.add('code-example');
    });
    
    // Style inline code
    const inlineCodes = container.querySelectorAll('code:not(pre code)');
    inlineCodes.forEach(code => {
        code.classList.add('inline-code');
    });
    
    // Style tables
    const tables = container.querySelectorAll('table');
    tables.forEach(table => {
        table.classList.add('codebook-table');
    });
    
    // Style images
    const images = container.querySelectorAll('img');
    images.forEach(img => {
        img.classList.add('codebook-image');
        img.onerror = function() {
            this.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            placeholder.textContent = '[Image: ' + this.alt + ']';
            this.parentNode.insertBefore(placeholder, this);
        };
    });
    
    // Style headings
    const h2s = container.querySelectorAll('h2');
    h2s.forEach(h2 => {
        h2.classList.add('function-title');
    });
    
    // Style h3 elements
    const h3s = container.querySelectorAll('h3');
    h3s.forEach(h3 => {
        h3.classList.add('subsection-title');
    });
    
    // Add section dividers
    const hrs = container.querySelectorAll('hr');
    hrs.forEach(hr => {
        hr.classList.add('section-divider');
    });
}

// Initialize Code Book button
function initializeCodeBook() {
    console.log('Code Book initialized');
    
    // Add keyboard shortcut (Escape to close)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && codeBookOpen) {
            closeCodeBook();
        }
    });
}

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCodeBook);
} else {
    initializeCodeBook();
}

// Export functions globally
window.openCodeBook = openCodeBook;
window.closeCodeBook = closeCodeBook;
window.toggleCodeBook = toggleCodeBook;
window.switchCodeBookTab = switchCodeBookTab;
