# Markdown File Dropdown Implementation Guide

## Purpose & Goal
Add a discrete dropdown button in the header to dynamically list and load any markdown file from the `assets/` folder without using the file picker. This enables quick switching between chapters and test files during development.

## Implementation Steps

### Step 1: Add HTML Structure
**File:** `index.html`  
**Location:** Right after the level progress div (around line 35)

Add this HTML:
```html
<!-- Chapter dropdown button -->
<div class="chapter-dropdown-container">
    <button class="chapter-dropdown-btn" id="chapter-dropdown-btn" onclick="toggleChapterDropdown()">
        <span class="chevron-down">▼</span>
    </button>
    <div class="chapter-dropdown-menu" id="chapter-dropdown-menu">
        <!-- Populated dynamically with markdown files -->
    </div>
</div>
```

### Step 2: Add CSS Styling
**File:** `css/styles.css`  
**Location:** At the end of the file

Add this CSS:
```css
/* ========================================
   CHAPTER DROPDOWN STYLES
   ======================================== */
.chapter-dropdown-container {
    position: relative;
    display: inline-block;
    margin-left: 10px;
}

.chapter-dropdown-btn {
    background: transparent;
    border: none;
    color: #888;
    font-size: 14px;
    padding: 4px 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    outline: none;
    margin-top: -2px;  /* Align with chapter title */
}

.chapter-dropdown-btn:hover {
    color: #fff;
}

.chapter-dropdown-btn.active {
    color: #7fc542;
}

.chevron-down {
    font-size: 12px;
    line-height: 1;
}

.chapter-dropdown-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 4px;
    min-width: 250px;
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    margin-top: 4px;
}

.chapter-dropdown-menu.show {
    display: block;
}

.chapter-dropdown-item {
    padding: 10px 14px;
    cursor: pointer;
    font-size: 13px;
    color: #ccc;
    border-bottom: 1px solid #333;
    transition: all 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.chapter-dropdown-item:hover {
    background: #3a3a3a;
    color: #7fc542;
}

.chapter-dropdown-item:last-child {
    border-bottom: none;
}

.chapter-dropdown-item.current {
    background: #3a3a3a;
    color: #7fc542;
    font-weight: bold;
}

.chapter-dropdown-item .file-icon {
    display: inline-block;
    margin-right: 8px;
    color: #666;
}
```

### Step 3: Add JavaScript Functionality
**File:** `js/main.js`  
**Location:** At the end of the file

Add this JavaScript:
```javascript
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
```

### Step 4: Add Server Endpoint
**File:** `server.py`  
**Location:** In the `do_GET` method and as a new method

1. Add this condition in the `do_GET` method:
```python
elif self.path == '/markdown-files.json':
    self.send_markdown_files_json()
```

2. Add this new method to the class:
```python
def send_markdown_files_json(self):
    """Return JSON array of markdown files in assets/ folder"""
    assets_dir = Path('assets')
    markdown_files = []
    
    if assets_dir.exists() and assets_dir.is_dir():
        # Get all .md files in the assets directory (root level only)
        for file in assets_dir.glob('*.md'):
            markdown_files.append(file.name)
    
    # Sort files alphabetically
    markdown_files.sort()
    
    # Send JSON response
    self.send_response(200)
    self.send_header('Content-Type', 'application/json')
    self.end_headers()
    self.wfile.write(json.dumps(markdown_files).encode())
```

## How It Works

1. **Button**: A discrete down-chevron (▼) button appears next to the chapter/level display
2. **Dynamic Discovery**: When clicked, it fetches the list of `.md` files from the server endpoint `/markdown-files.json`
3. **File Loading**: Clicking a file creates a File/Blob object and passes it to the existing `loadMarkdownFile` function
4. **Visual Feedback**: The currently loaded file is highlighted in green

## Key Design Decisions

- **Reuses existing pattern**: Follows the same `/sprites.json` pattern for automatic file discovery
- **No hardcoding**: Files are discovered dynamically from the filesystem
- **Minimal visual impact**: Just a small chevron with no background
- **Proper File object**: Creates a real Blob/File that FileReader can process (avoids the "not of type 'Blob'" error)

## Testing

1. Click the down-chevron (▼) button next to the chapter display
2. Select any markdown file from the dropdown
3. The file should load immediately without errors
4. The dropdown should close automatically after selection

## Notes

- The endpoint only lists `.md` files in the root of the `assets/` folder
- The server must be restarted after adding the Python changes
- This implementation avoids over-engineering by reusing existing patterns and keeping the code simple