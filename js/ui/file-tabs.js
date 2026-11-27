const FileTabs = (function() {
    'use strict';

    let tabs = null;
    let helpersView = null;
    let openFile = 'main';
    let cursorInMain = null;

    function mainView() {
        return document.getElementById('editor').parentNode;
    }

    function build() {
        tabs = document.createElement('div');
        tabs.className = 'file-tabs';
        tabs.setAttribute('role', 'tablist');
        tabs.innerHTML = '<button type="button" class="file-tab" role="tab" data-file="main">main.py</button><button type="button" class="file-tab" role="tab" data-file="helpers">helpers.py</button>';
        tabs.addEventListener('mousedown', event => event.preventDefault());
        tabs.addEventListener('click', event => {
            const tab = event.target.closest('.file-tab');
            if (tab) open(tab.dataset.file);
        });
        helpersView = document.createElement('div');
        helpersView.className = 'editor-wrapper helpers-view';
        helpersView.innerHTML = '<div class="line-numbers"></div><div class="editor"></div>';
        mainView().before(tabs);
        mainView().after(helpersView);
    }

    function select(file) {
        openFile = file;
        tabs.querySelectorAll('.file-tab').forEach(tab => tab.setAttribute('aria-selected', String(tab.dataset.file === file)));
        mainView().hidden = file !== 'main';
        helpersView.hidden = file !== 'helpers';
    }

    function open(file) {
        if (file === openFile) return;
        if (file === 'helpers') {
            cursorInMain = EditorManager.savedCursor();
            document.getElementById('editor').blur();
        }
        select(file);
        if (file === 'main') {
            MistakeLines.place();
            if (cursorInMain) EditorManager.restoreCursor(cursorInMain);
        }
    }

    function showLevelFiles() {
        const hasHelpers = LevelHelpers.hasHelpers();
        if (hasHelpers && (!tabs || !tabs.isConnected)) build();
        if (!tabs) return;
        tabs.hidden = !hasHelpers;
        cursorInMain = null;
        select('main');
        const text = LevelHelpers.fileText();
        helpersView.querySelector('.line-numbers').textContent = EditorManager.lineNumbersFor(text);
        helpersView.querySelector('.editor').innerHTML = PythonHighlighter.highlight(text);
    }

    return {
        showLevelFiles: showLevelFiles
    };
})();

window.FileTabs = FileTabs;
