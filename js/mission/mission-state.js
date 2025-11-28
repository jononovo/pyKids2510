const MissionState = (function() {
    const STORAGE_KEY = 'missionChapterState';
    const BACKPACK_CAPACITY = 4;
    
    let currentChapter = null;
    let inventory = {};
    let backpack = [];
    let collectedItems = [];
    let structures = [];
    let elementStates = {};
    let initialized = false;
    let isMissionLevel = false;
    
    function init(chapterNumber, savedState) {
        currentChapter = chapterNumber || 1;
        
        if (savedState) {
            loadState(savedState);
        } else {
            const stored = getStoredState(currentChapter);
            if (stored) {
                loadState(stored);
            } else {
                reset();
            }
        }
        
        initialized = true;
        console.log('[MissionState] Initialized for chapter', currentChapter, getState());
    }
    
    function reset() {
        inventory = {};
        backpack = [];
        collectedItems = [];
        structures = [];
        elementStates = {};
    }
    
    function setIsMissionLevel(value) {
        isMissionLevel = !!value;
    }
    
    function getIsMissionLevel() {
        return isMissionLevel;
    }
    
    function getStoredState(chapterNum) {
        try {
            const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
            return all['chapter' + chapterNum] || null;
        } catch (e) {
            return null;
        }
    }
    
    function saveToStorage() {
        try {
            const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
            all['chapter' + currentChapter] = getState();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        } catch (e) {
            console.warn('[MissionState] Failed to save to storage:', e);
        }
    }
    
    function getState() {
        return {
            chapter: currentChapter,
            inventory: { ...inventory },
            backpack: [...backpack],
            collectedItems: collectedItems.map(item => ({ ...item })),
            structures: structures.map(s => ({ ...s })),
            elementStates: { ...elementStates }
        };
    }
    
    function loadState(state) {
        if (!state) return;
        
        // Update chapter if provided
        if (state.chapter) {
            currentChapter = state.chapter;
        }
        
        // Make deep copies to avoid modifying the original state object (e.g., snapshot)
        inventory = { ...(state.inventory || {}) };
        backpack = [...(state.backpack || [])];
        collectedItems = (state.collectedItems || []).map(item => ({
            x: item.x,
            y: item.y,
            type: item.type || 'unknown'
        }));
        structures = (state.structures || []).map(s => ({ ...s }));
        elementStates = { ...(state.elementStates || {}) };
        initialized = true;
        
        saveToStorage();
    }
    
    function getInventory() {
        return { ...inventory };
    }
    
    function getInventoryCount(type) {
        return inventory[type] || 0;
    }
    
    function addToInventory(type, amount) {
        if (!type) return;
        amount = amount || 1;
        inventory[type] = (inventory[type] || 0) + amount;
        console.log('[MissionState] Added', amount, type, '- Inventory:', { ...inventory });
        saveToStorage();
        return inventory[type];
    }
    
    function removeFromInventory(type, amount) {
        if (!type || !inventory[type]) return false;
        amount = amount || 1;
        if (inventory[type] < amount) return false;
        inventory[type] -= amount;
        if (inventory[type] <= 0) {
            delete inventory[type];
        }
        saveToStorage();
        return true;
    }
    
    function setInventory(newInventory) {
        inventory = { ...(newInventory || {}) };
        saveToStorage();
        return { ...inventory };
    }
    
    function getBackpack() {
        return [...backpack];
    }
    
    function getBackpackCapacity() {
        return BACKPACK_CAPACITY;
    }
    
    function isBackpackFull() {
        return backpack.length >= BACKPACK_CAPACITY;
    }
    
    function addToBackpack(item) {
        if (!item) return { success: false, message: 'No item specified' };
        if (isBackpackFull()) {
            return { success: false, message: 'Backpack is full! (max ' + BACKPACK_CAPACITY + ' items)' };
        }
        backpack.push(item);
        console.log('[MissionState] Added to backpack:', item, '- Backpack:', [...backpack]);
        saveToStorage();
        return { success: true, message: 'Added ' + item + ' to backpack' };
    }
    
    function removeFromBackpack(item) {
        if (!item) return { success: false, message: 'No item specified' };
        const index = backpack.indexOf(item);
        if (index === -1) {
            return { success: false, message: item + ' not found in backpack' };
        }
        backpack.splice(index, 1);
        console.log('[MissionState] Removed from backpack:', item, '- Backpack:', [...backpack]);
        saveToStorage();
        return { success: true, message: 'Removed ' + item + ' from backpack', item: item };
    }
    
    function recordCollectible(x, y, type) {
        if (isCollected(x, y)) return false;
        
        collectedItems.push({
            x: x,
            y: y,
            type: type || 'unknown'
        });
        console.log('[MissionState] Recorded collectible at (' + x + ',' + y + ') type:', type);
        saveToStorage();
        return true;
    }
    
    function isCollected(x, y) {
        return collectedItems.some(item => item.x === x && item.y === y);
    }
    
    function filterCollectibles(collectibles) {
        if (!collectibles || !Array.isArray(collectibles)) return [];
        
        return collectibles.filter(c => {
            const cx = c.x !== undefined ? c.x : c[0];
            const cy = c.y !== undefined ? c.y : c[1];
            return !isCollected(cx, cy);
        });
    }
    
    function addStructure(x, y, type) {
        if (hasStructure(x, y, type)) return false;
        
        structures.push({
            x: x,
            y: y,
            type: type
        });
        saveToStorage();
        return true;
    }
    
    function hasStructure(x, y, type) {
        return structures.some(s => 
            s.x === x && s.y === y && (!type || s.type === type)
        );
    }
    
    function getStructures() {
        return structures.map(s => ({ ...s }));
    }
    
    function setElementStates(states) {
        elementStates = { ...(states || {}) };
        saveToStorage();
    }
    
    function getElementStates() {
        return { ...elementStates };
    }
    
    function markItemCollected(x, y, type) {
        recordCollectible(x, y, type);
    }
    
    function getCurrentChapter() {
        return currentChapter;
    }
    
    function isInitialized() {
        return initialized;
    }
    
    function clearChapter(chapterNum) {
        const chapter = chapterNum || currentChapter;
        try {
            const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
            delete all['chapter' + chapter];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
            
            if (chapter === currentChapter) {
                reset();
            }
        } catch (e) {
            console.warn('[MissionState] Failed to clear chapter:', e);
        }
    }
    
    return {
        init: init,
        reset: reset,
        getState: getState,
        loadState: loadState,
        getInventory: getInventory,
        getInventoryCount: getInventoryCount,
        addToInventory: addToInventory,
        removeFromInventory: removeFromInventory,
        setInventory: setInventory,
        getBackpack: getBackpack,
        getBackpackCapacity: getBackpackCapacity,
        isBackpackFull: isBackpackFull,
        addToBackpack: addToBackpack,
        removeFromBackpack: removeFromBackpack,
        recordCollectible: recordCollectible,
        isCollected: isCollected,
        filterCollectibles: filterCollectibles,
        addStructure: addStructure,
        hasStructure: hasStructure,
        getStructures: getStructures,
        setElementStates: setElementStates,
        getElementStates: getElementStates,
        markItemCollected: markItemCollected,
        setIsMissionLevel: setIsMissionLevel,
        get isMissionLevel() { return isMissionLevel; },
        getCurrentChapter: getCurrentChapter,
        isInitialized: isInitialized,
        clearChapter: clearChapter
    };
})();

window.MissionState = MissionState;
