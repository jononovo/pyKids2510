const ConfirmDialog = (function() {
    let resolveCallback = null;
    
    function init() {
        if (document.getElementById('confirm-dialog-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'confirm-dialog-overlay';
        overlay.className = 'confirm-overlay';
        overlay.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-title" id="confirm-title">Confirm</div>
                <div class="confirm-message" id="confirm-message"></div>
                <div class="confirm-buttons">
                    <button class="confirm-btn confirm-cancel" id="confirm-cancel">Cancel</button>
                    <button class="confirm-btn confirm-ok" id="confirm-ok">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        document.getElementById('confirm-cancel').addEventListener('click', function() {
            hide();
            if (resolveCallback) resolveCallback(false);
        });
        
        document.getElementById('confirm-ok').addEventListener('click', function() {
            hide();
            if (resolveCallback) resolveCallback(true);
        });
        
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                hide();
                if (resolveCallback) resolveCallback(false);
            }
        });
    }
    
    function show(options) {
        init();
        
        const title = options.title || 'Confirm';
        const message = options.message || 'Are you sure?';
        const okText = options.okText || 'OK';
        const cancelText = options.cancelText || 'Cancel';
        
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        document.getElementById('confirm-ok').textContent = okText;
        document.getElementById('confirm-cancel').textContent = cancelText;
        
        document.getElementById('confirm-dialog-overlay').classList.add('show');
        
        return new Promise(function(resolve) {
            resolveCallback = resolve;
        });
    }
    
    function hide() {
        const overlay = document.getElementById('confirm-dialog-overlay');
        if (overlay) overlay.classList.remove('show');
        resolveCallback = null;
    }
    
    return {
        show: show,
        hide: hide
    };
})();

window.ConfirmDialog = ConfirmDialog;
