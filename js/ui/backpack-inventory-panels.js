(function() {
    'use strict';

    function pythonText(item) {
        return "'" + item + "'";
    }

    function renderInventoryPanel() {
        const inventoryPanel = document.getElementById('inventory-panel');
        const counts = Object.entries(gameState.inventory).map(([item, count]) => pythonText(item) + ': ' + count);
        inventoryPanel.innerHTML = '<strong>📦 Inventory:</strong> ';
        inventoryPanel.append('{' + counts.join(', ') + '}');
    }

    function renderBackpackPanel() {
        const backpackPanel = document.getElementById('backpack-panel');
        const backpack = gameState.backpack;
        const capacity = MissionState.getBackpackCapacity();
        backpackPanel.style.display = backpack.length === 0 ? 'none' : 'block';
        backpackPanel.innerHTML = `<strong>🎒 Backpack (${backpack.length}/${capacity}):</strong> `;

        const slots = document.createElement('span');
        slots.className = 'backpack-slots';
        slots.append('[');
        for (let slot = 0; slot < capacity; slot++) {
            if (slot > 0) slots.append(', ');
            const slotText = document.createElement('span');
            slotText.className = 'backpack-slot';
            slotText.dataset.slot = slot;
            slotText.textContent = slot < backpack.length ? pythonText(backpack[slot]) : '_';
            slots.appendChild(slotText);
        }
        slots.append(']');
        backpackPanel.appendChild(slots);
    }

    function renderBackpackInventoryPanels() {
        renderInventoryPanel();
        renderBackpackPanel();
    }

    window.renderBackpackInventoryPanels = renderBackpackInventoryPanels;
})();
