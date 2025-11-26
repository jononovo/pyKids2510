const UserProgressManager = (function() {
    const STORAGE_KEY = 'userProgress';
    const DEBOUNCE_DELAY = 500;
    
    let debounceTimer = null;
    let completedThisSession = {};
    let currentLevelId = null;
    let currentLevelIndex = 0;
    let isEmbedded = false;
    
    function init() {
        isEmbedded = window.parent !== window;
        
        if (isEmbedded) {
            window.addEventListener('message', handleParentMessage);
        }
        
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
        }
    }
    
    function handleParentMessage(event) {
        const data = event.data;
        if (!data || !data.type) return;
        
        switch (data.type) {
            case 'load-all-progress':
                const allProgress = data.progress || {};
                localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
                break;
                
            case 'load-progress':
                loadProgressFromParent(data);
                break;
        }
    }
    
    function loadProgressFromParent(data) {
        const levelId = data.levelId;
        const code = data.code;
        const completed = data.completed;
        const chapterState = data.chapterState;
        
        if (levelId) {
            const all = getAllProgress();
            const existing = all[levelId] || {};
            
            if (code !== undefined) {
                existing.code = code;
            }
            if (completed !== undefined) {
                existing.completed = completed;
            }
            
            all[levelId] = existing;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        }
        
        if (code !== undefined && levelId === currentLevelId) {
            updateEditorWithCode(code);
        }
        
        if (completed && levelId) {
            completedThisSession[levelId] = true;
        }
        
        // Load chapter state if provided
        if (chapterState && window.MissionState) {
            MissionState.loadState(chapterState);
        }
    }
    
    function updateEditorWithCode(code) {
        const editorElement = document.getElementById('editor');
        if (editorElement && window.jar) {
            window.jar.updateCode(code);
        } else if (editorElement) {
            editorElement.textContent = code;
        }
        
        window.currentLessonStarterCode = code;
        
        if (window.BlocklyModeSwitcher && window.BlocklyModeSwitcher.isBlockMode()) {
            if (window.BlocklyWorkspace && window.BlocklyWorkspace.workspace) {
                window.BlocklyWorkspace.workspace.clear();
                if (window.BlocklyIntegration) {
                    setTimeout(() => {
                        window.BlocklyIntegration.convertFromText(code);
                    }, 100);
                }
            }
        }
    }
    
    function sendReady() {
        if (isEmbedded) {
            window.parent.postMessage({
                type: 'app-ready',
                currentLevelId: currentLevelId
            }, '*');
        }
    }
    
    function generateLevelId(chapterNumber, levelIndex, levelSlug) {
        if (levelSlug) {
            return levelSlug;
        }
        return `chapter${chapterNumber || 1}-level${levelIndex + 1}`;
    }
    
    function setCurrentLevel(chapterNumber, levelIndex, levelSlug) {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
        
        currentLevelId = generateLevelId(chapterNumber, levelIndex, levelSlug);
        currentLevelIndex = levelIndex;
        completedThisSession[currentLevelId] = false;
        return currentLevelId;
    }
    
    function getCurrentLevelId() {
        return currentLevelId;
    }
    
    function getAllProgress() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }
    
    function getLevelProgress(levelId) {
        const all = getAllProgress();
        return all[levelId] || null;
    }
    
    function getSavedCode(levelId) {
        const progress = getLevelProgress(levelId || currentLevelId);
        return progress ? progress.code : null;
    }
    
    function isLevelCompleted(levelId) {
        const progress = getLevelProgress(levelId || currentLevelId);
        return progress ? progress.completed : false;
    }
    
    function saveProgress(levelId, data) {
        const all = getAllProgress();
        all[levelId] = { ...all[levelId], ...data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        
        if (isEmbedded) {
            const message = {
                type: 'save-progress',
                levelId: levelId,
                data: data
            };
            
            // Include chapter state for mission levels
            if (window.MissionState && MissionState.isInitialized()) {
                const currentLevelData = window.courseData && window.courseData.levels && 
                                        window.courseData.levels[window.currentLevel];
                if (currentLevelData && (currentLevelData.type === 'mission' || currentLevelData.type === 'quest')) {
                    message.chapterState = MissionState.getState();
                }
            }
            
            window.parent.postMessage(message, '*');
        }
    }
    
    function saveCode(code, levelId) {
        const id = levelId || currentLevelId;
        if (!id) return;
        
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        
        debounceTimer = setTimeout(() => {
            saveProgress(id, { code: code });
        }, DEBOUNCE_DELAY);
    }
    
    function markCompletion(levelId) {
        const id = levelId || currentLevelId;
        if (!id) return;
        
        if (completedThisSession[id]) {
            return;
        }
        
        completedThisSession[id] = true;
        saveProgress(id, { completed: true });
        
        if (isEmbedded) {
            const message = {
                type: 'checker-validation',
                checkerId: `level ${currentLevelIndex + 1}`,
                valid: true
            };
            
            // Include chapter state for mission levels
            if (window.MissionState && MissionState.isInitialized()) {
                const currentLevelData = window.courseData && window.courseData.levels && 
                                        window.courseData.levels[window.currentLevel];
                if (currentLevelData && (currentLevelData.type === 'mission' || currentLevelData.type === 'quest')) {
                    message.chapterState = MissionState.getState();
                }
            }
            
            window.parent.postMessage(message, '*');
        }
    }
    
    function resetLevelSession(levelId) {
        const id = levelId || currentLevelId;
        if (id) {
            completedThisSession[id] = false;
        }
    }
    
    function clearProgress(levelId) {
        if (levelId) {
            const all = getAllProgress();
            delete all[levelId];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
        }
    }
    
    function registerLessonType(typeName, handlers) {
        if (!window.UserProgressLessonTypes) {
            window.UserProgressLessonTypes = {};
        }
        window.UserProgressLessonTypes[typeName] = handlers;
    }
    
    function getLessonTypeHandlers(typeName) {
        if (window.UserProgressLessonTypes && window.UserProgressLessonTypes[typeName]) {
            return window.UserProgressLessonTypes[typeName];
        }
        return null;
    }
    
    return {
        init: init,
        setCurrentLevel: setCurrentLevel,
        getCurrentLevelId: getCurrentLevelId,
        getSavedCode: getSavedCode,
        isLevelCompleted: isLevelCompleted,
        saveCode: saveCode,
        markCompletion: markCompletion,
        resetLevelSession: resetLevelSession,
        clearProgress: clearProgress,
        registerLessonType: registerLessonType,
        getLessonTypeHandlers: getLessonTypeHandlers,
        getAllProgress: getAllProgress,
        getLevelProgress: getLevelProgress,
        sendReady: sendReady,
        updateEditorWithCode: updateEditorWithCode
    };
})();

window.UserProgressManager = UserProgressManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        UserProgressManager.init();
    });
} else {
    UserProgressManager.init();
}
