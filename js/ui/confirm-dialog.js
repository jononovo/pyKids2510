const ConfirmDialog = (function() {
    let resolveCallback = null;
    let initialized = false;
    
    function init() {
        let overlay = document.getElementById('confirm-dialog-overlay');
        
        if (overlay) {
            if (initialized) return;
            overlay.style.display = '';
            overlay.className = 'confirm-overlay';
        } else {
            overlay = document.createElement('div');
            overlay.id = 'confirm-dialog-overlay';
            overlay.className = 'confirm-overlay';
            overlay.innerHTML = `
                <div class="confirm-dialog">
                    <div class="confirm-title" id="confirm-title">Confirm</div>
                    <div class="confirm-message" id="confirm-message"></div>
                    <div class="confirm-buttons">
                        <button type="button" class="confirm-btn confirm-cancel" id="confirm-cancel">Cancel</button>
                        <button type="button" class="confirm-btn confirm-ok" id="confirm-ok">OK</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        
        const cancelBtn = document.getElementById('confirm-cancel');
        const okBtn = document.getElementById('confirm-ok');
        
        cancelBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            hide();
            if (resolveCallback) {
                resolveCallback(false);
                resolveCallback = null;
            }
        });
        
        okBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            hide();
            if (resolveCallback) {
                resolveCallback(true);
                resolveCallback = null;
            }
        });
        
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                hide();
                if (resolveCallback) {
                    resolveCallback(false);
                    resolveCallback = null;
                }
            }
        });
        
        initialized = true;
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
        
        const overlay = document.getElementById('confirm-dialog-overlay');
        overlay.style.display = 'flex';
        overlay.classList.add('show');
        
        return new Promise(function(resolve) {
            resolveCallback = resolve;
        });
    }
    
    function hide() {
        const overlay = document.getElementById('confirm-dialog-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            overlay.style.display = 'none';
        }
    }
    
    return {
        show: show,
        hide: hide
    };
})();

window.ConfirmDialog = ConfirmDialog;
