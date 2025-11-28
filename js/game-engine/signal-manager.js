// ============================================
// SIGNAL MANAGER
// Simple pub/sub for cross-element triggering
// ============================================

(function() {
    'use strict';

    const SignalManager = {
        listeners: {},

        subscribe(signalName, callback) {
            if (!this.listeners[signalName]) {
                this.listeners[signalName] = [];
            }
            this.listeners[signalName].push(callback);
            console.log('[SignalManager] Subscribed to:', signalName);
        },

        emit(signalName) {
            const callbacks = this.listeners[signalName];
            if (!callbacks || callbacks.length === 0) {
                console.log('[SignalManager] No listeners for:', signalName);
                return;
            }
            
            console.log('[SignalManager] Emitting:', signalName, 'to', callbacks.length, 'listeners');
            for (const callback of callbacks) {
                callback(signalName);
            }
        },

        reset() {
            this.listeners = {};
            console.log('[SignalManager] Reset');
        }
    };

    window.SignalManager = SignalManager;

    console.log('[SignalManager] Module loaded');
})();
