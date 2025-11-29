// ============================================
// FEEDBACK EFFECTS MODULE
// Handles audio feedback and visual animations for game interactions
// ============================================

(function() {
    'use strict';
    
    let audioContext = null;
    
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    function playStepSound() {
        if (!audioContext) initAudio();
        
        const duration = 0.08;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.frequency.value = 100 + Math.random() * 50;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.02, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    function playBumpSound() {
        if (!audioContext) initAudio();
        
        const t = audioContext.currentTime;
        
        const osc1 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        osc1.type = 'sine';
        osc1.frequency.value = 330;
        gain1.gain.setValueAtTime(0.06, t);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc1.connect(gain1);
        gain1.connect(audioContext.destination);
        osc1.start(t);
        osc1.stop(t + 0.08);
        
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = 262;
        gain2.gain.setValueAtTime(0.06, t + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.start(t + 0.1);
        osc2.stop(t + 0.18);
    }
    
    function playCollectSound() {
        if (!audioContext) initAudio();
        
        const t = audioContext.currentTime;
        
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.1);
        
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(t);
        osc.stop(t + 0.15);
    }
    
    function playInteractSound() {
        if (!audioContext) initAudio();
        
        const t = audioContext.currentTime;
        
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.08);
        
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(t);
        osc.stop(t + 0.12);
    }
    
    function animateInteractPop(tileX, tileY) {
        const viewport = document.getElementById('game-viewport');
        if (!viewport) return;
        
        const TILE_SIZE = window.TILE_SIZE || 32;
        const viewportRect = viewport.getBoundingClientRect();
        const cam = window.camera || { zoom: 1, panX: 0, panY: 0 };
        
        const centerX = viewportRect.left + cam.panX + (tileX * TILE_SIZE + TILE_SIZE / 2) * cam.zoom;
        const centerY = viewportRect.top + cam.panY + (tileY * TILE_SIZE + TILE_SIZE / 2) * cam.zoom;
        const size = TILE_SIZE * cam.zoom * 1.2;
        
        const pop = document.createElement('div');
        pop.style.cssText = `
            position: fixed;
            left: ${centerX - size/2}px;
            top: ${centerY - size/2}px;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,200,0.3) 50%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9998;
            transform: scale(0.8);
            opacity: 1;
            transition: transform 0.25s ease-out, opacity 0.25s ease-out;
        `;
        document.body.appendChild(pop);
        
        requestAnimationFrame(() => {
            pop.style.transform = 'scale(1.3)';
            pop.style.opacity = '0';
        });
        
        setTimeout(() => pop.remove(), 280);
    }
    
    function animateCollectSparkle(tileX, tileY) {
        const viewport = document.getElementById('game-viewport');
        const inventoryPanel = document.getElementById('inventory-panel');
        if (!viewport || !inventoryPanel) return;
        
        const TILE_SIZE = window.TILE_SIZE || 32;
        const viewportRect = viewport.getBoundingClientRect();
        const invRect = inventoryPanel.getBoundingClientRect();
        
        const cam = window.camera || { zoom: 1, panX: 0, panY: 0 };
        
        const tilePixelX = tileX * TILE_SIZE + TILE_SIZE / 2;
        const tilePixelY = tileY * TILE_SIZE + TILE_SIZE / 2;
        
        const baseX = viewportRect.left + cam.panX + tilePixelX * cam.zoom;
        const baseY = viewportRect.top + cam.panY + tilePixelY * cam.zoom;
        
        const endX = invRect.left + invRect.width / 2;
        const endY = invRect.top + 20;
        
        const sparkles = [
            { size: 20, delay: 0, offsetX: 0, offsetY: 0 },
            { size: 14, delay: 70, offsetX: -7, offsetY: 5 },
            { size: 10, delay: 140, offsetX: 6, offsetY: -4 }
        ];
        
        sparkles.forEach((cfg, i) => {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.style.cssText = `
                    position: fixed;
                    left: ${baseX + cfg.offsetX}px;
                    top: ${baseY + cfg.offsetY}px;
                    width: ${cfg.size}px;
                    height: ${cfg.size}px;
                    background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,215,0,0.6) 40%, transparent 70%);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: ${9999 - i};
                    box-shadow: 0 0 ${cfg.size/2}px rgba(255,215,0,0.6), 0 0 ${cfg.size}px rgba(255,180,0,0.4);
                    transition: left 1.1s cubic-bezier(0.25, 0.1, 0.25, 1), 
                                top 1.1s cubic-bezier(0.25, 0.1, 0.25, 1),
                                transform 1.1s ease-out,
                                opacity 1.1s ease-out;
                `;
                document.body.appendChild(sparkle);
                
                requestAnimationFrame(() => {
                    sparkle.style.left = endX + 'px';
                    sparkle.style.top = endY + 'px';
                    sparkle.style.transform = 'scale(0.5)';
                    sparkle.style.opacity = '0';
                });
                
                setTimeout(() => sparkle.remove(), 1150);
            }, cfg.delay);
        });
        
        setTimeout(() => {
            inventoryPanel.style.transition = 'transform 0.2s ease-out';
            inventoryPanel.style.transform = 'scale(1.12)';
            setTimeout(() => {
                inventoryPanel.style.transform = 'scale(1)';
            }, 200);
        }, 1100);
    }
    
    function showGameMessage(text, type) {
        if (!text) return;
        
        var messagePanel = document.getElementById('message-panel');
        if (!messagePanel) return;
        
        var msgDiv = document.createElement('div');
        msgDiv.className = 'message-item';
        
        if (type === 'error') {
            msgDiv.classList.add('message-error');
        } else if (type === 'success') {
            msgDiv.classList.add('message-success');
        } else if (type === 'info') {
            msgDiv.classList.add('message-info');
        }
        
        msgDiv.textContent = text;
        messagePanel.appendChild(msgDiv);
        messagePanel.scrollTop = messagePanel.scrollHeight;
        
        if (typeof gameState !== 'undefined') {
            if (!gameState.messageLog) gameState.messageLog = [];
            gameState.messageLog.push({ text: text, type: type || 'info' });
        }
    }
    
    window.playStepSound = playStepSound;
    window.playBumpSound = playBumpSound;
    window.playCollectSound = playCollectSound;
    window.playInteractSound = playInteractSound;
    window.animateInteractPop = animateInteractPop;
    window.animateCollectSparkle = animateCollectSparkle;
    window.showGameMessage = showGameMessage;
    
    console.log('[FeedbackEffects] Module loaded');
})();
