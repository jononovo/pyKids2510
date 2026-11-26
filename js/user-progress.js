const UserProgressManager = (function() {
    const STORAGE_KEY = 'userProgress';
    const SAVE_DELAY_MS = 500;

    let saveTimer = null;
    let currentLevelId = null;
    let codeFromHost = null;
    let levelCodeShown = false;

    function init() {
        window.addEventListener('message', handleHostMessage);

        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
        }
    }

    function handleHostMessage(event) {
        const message = event.data;
        if (event.source !== window.parent || !message || message.type !== 'load-progress' || typeof message.content !== 'string') return;
        if (levelCodeShown) {
            updateEditorWithCode(message.content || courseData.levels[currentLevel].starterCode);
        } else {
            codeFromHost = message.content;
        }
    }

    function updateEditorWithCode(code) {
        EditorManager.updateCode(code);
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
        window.parent.postMessage({
            type: 'app-ready',
            currentLevelId: currentLevelId
        }, '*');
    }

    function setCurrentLevel(level) {
        clearTimeout(saveTimer);
        saveTimer = null;
        currentLevelId = level.slug + '-' + level.textFingerprint;
        levelCodeShown = false;
        return currentLevelId;
    }

    function codeForLevel(level) {
        const code = codeFromHost !== null ? codeFromHost : getSavedCode();
        codeFromHost = null;
        levelCodeShown = true;
        return code || level.starterCode;
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

    function getSavedCode() {
        const progress = getLevelProgress(currentLevelId);
        return progress ? progress.code : null;
    }

    function saveCode(code) {
        const levelId = currentLevelId;
        if (!levelId) return;

        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            saveTimer = null;
            const all = getAllProgress();
            all[levelId] = { ...all[levelId], code: code };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
            window.parent.postMessage({ type: 'save-progress', content: code }, '*');
        }, SAVE_DELAY_MS);
    }

    function reportTestResults(testResults) {
        testResults
            .filter(testResult => testResult.name)
            .forEach(testResult => {
                window.parent.postMessage({ type: 'checker-validation', checkerId: testResult.name, valid: testResult.passed }, '*');
            });
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
        codeForLevel: codeForLevel,
        getCurrentLevelId: getCurrentLevelId,
        saveCode: saveCode,
        reportTestResults: reportTestResults,
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
