// File Selector Functionality

// Available lesson files
const LESSON_FILES = [
    { name: 'Introduction to Python - Chapter 1', file: 'assets/python-course-chapter1.md' },
    { name: 'Interactive Demo - Actions Engine', file: 'assets/interactive-demo.md' },
    { name: 'Graphic Map Demo - Castle Garden', file: 'python-course-chapter-graphic.md' }
];

// Toggle file selector dropdown
function toggleFileSelector() {
    const dropdown = document.querySelector('.file-selector-dropdown');
    const menu = document.getElementById('file-selector-menu');
    
    if (!dropdown.classList.contains('open')) {
        populateFileSelector();
        dropdown.classList.add('open');
        
        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', closeFileSelector);
        }, 100);
    } else {
        dropdown.classList.remove('open');
    }
}

// Close file selector
function closeFileSelector(event) {
    const dropdown = document.querySelector('.file-selector-dropdown');
    const button = document.querySelector('.file-selector-btn');
    
    if (!button.contains(event.target)) {
        dropdown.classList.remove('open');
        document.removeEventListener('click', closeFileSelector);
    }
}

// Populate file selector with available files
function populateFileSelector() {
    const menu = document.getElementById('file-selector-menu');
    menu.innerHTML = '';
    
    // Add upload option
    const uploadItem = document.createElement('div');
    uploadItem.className = 'file-selector-item upload-option';
    uploadItem.innerHTML = '📁 Upload Custom File...';
    uploadItem.onclick = () => {
        document.getElementById('file-input').click();
        toggleFileSelector();
    };
    menu.appendChild(uploadItem);
    
    // Add divider
    const divider = document.createElement('div');
    divider.className = 'file-selector-divider';
    menu.appendChild(divider);
    
    // Add available lessons
    LESSON_FILES.forEach(lesson => {
        const item = document.createElement('div');
        item.className = 'file-selector-item';
        item.innerHTML = lesson.name;
        item.onclick = () => {
            loadLessonFile(lesson.file);
            toggleFileSelector();
        };
        menu.appendChild(item);
    });
    
    // Check for additional files in assets folder
    fetchAvailableAssets();
}

// Fetch additional markdown files from assets
async function fetchAvailableAssets() {
    try {
        // Try to get a list of assets (this would need server support)
        const response = await fetch('/api/assets');
        if (response.ok) {
            const assets = await response.json();
            const mdFiles = assets.filter(file => file.endsWith('.md'));
            
            // Add any additional markdown files not in the predefined list
            mdFiles.forEach(file => {
                if (!LESSON_FILES.find(l => l.file === file)) {
                    addFileToSelector(file);
                }
            });
        }
    } catch (error) {
        // Server doesn't support listing assets, that's OK
        console.log('Asset listing not available');
    }
}

// Add a file to the selector menu
function addFileToSelector(filename) {
    const menu = document.getElementById('file-selector-menu');
    const item = document.createElement('div');
    item.className = 'file-selector-item';
    item.innerHTML = filename.replace('assets/', '').replace('.md', '');
    item.onclick = () => {
        loadLessonFile(filename);
        toggleFileSelector();
    };
    menu.appendChild(item);
}

// Load a lesson file
async function loadLessonFile(filepath) {
    try {
        const response = await fetch(filepath);
        if (response.ok) {
            const content = await response.text();
            
            // Create a fake file event to use with existing loadMarkdownFile
            const fakeEvent = {
                target: {
                    files: [new File([content], filepath.split('/').pop(), { type: 'text/markdown' })]
                }
            };
            
            // Use the existing loadMarkdownFile function
            loadMarkdownFile(fakeEvent);
            
            // Show success message
            console.log(`Loaded lesson: ${filepath}`);
        } else {
            console.error(`Failed to load ${filepath}`);
            alert(`Failed to load lesson file: ${filepath}`);
        }
    } catch (error) {
        console.error('Error loading lesson:', error);
        alert('Error loading lesson file');
    }
}

// Export functions for global use
window.toggleFileSelector = toggleFileSelector;
window.loadLessonFile = loadLessonFile;