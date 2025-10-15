// Panel resize functionality
(function() {
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    
    const handle = document.querySelector('.resize-handle');
    const leftPanel = document.querySelector('.left-panel');
    const container = document.querySelector('.container');
    
    if (!handle || !leftPanel) return;
    
    // Initialize left panel width if not set
    if (!leftPanel.style.width) {
        leftPanel.style.width = '50%';  // Match CSS default - equal split
    }
    
    // Update handle position to match panel width (for fixed positioning)
    function updateHandlePosition() {
        const leftPanelWidth = leftPanel.style.width || '50%';
        handle.style.left = leftPanelWidth;
    }
    
    // Set initial position
    updateHandlePosition();
    
    handle.addEventListener('mousedown', function(e) {
        isResizing = true;
        startX = e.clientX;
        startWidth = parseInt(window.getComputedStyle(leftPanel).width, 10);
        
        // Prevent text selection while resizing
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
        
        // Add active state to handle
        handle.classList.add('active');
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startX;
        const containerWidth = container.offsetWidth;
        const newWidth = startWidth + deltaX;
        const newWidthPercent = (newWidth / containerWidth) * 100;
        
        // Set min and max widths (in percentage)
        const minWidthPercent = 25;  // 25% minimum - symmetric movement
        const maxWidthPercent = 75;  // 75% maximum - symmetric movement
        
        if (newWidthPercent >= minWidthPercent && newWidthPercent <= maxWidthPercent) {
            leftPanel.style.width = newWidthPercent + '%';
            // Update handle position for fixed positioning
            handle.style.left = newWidthPercent + '%';
        }
    });
    
    document.addEventListener('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            handle.classList.remove('active');
        }
    });
    
    // Handle touch events for mobile
    handle.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        handle.dispatchEvent(mouseEvent);
    });
    
    document.addEventListener('touchmove', function(e) {
        if (isResizing) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            document.dispatchEvent(mouseEvent);
        }
    });
    
    document.addEventListener('touchend', function(e) {
        if (isResizing) {
            const mouseEvent = new MouseEvent('mouseup', {});
            document.dispatchEvent(mouseEvent);
        }
    });
})();