const MissionDetector = (function() {
    const MISSION_PATTERN = /^##\s*(MISSION|Mission)\s*\d*:?/i;
    const QUEST_PATTERN = /^##\s*(QUEST|Quest)\s*\d*:?/i;
    
    function getLevelType(title) {
        if (!title) return 'exercise';
        
        if (MISSION_PATTERN.test(title) || title.toUpperCase().includes('MISSION')) {
            return 'mission';
        }
        
        if (QUEST_PATTERN.test(title) || title.toUpperCase().includes('QUEST')) {
            return 'quest';
        }
        
        return 'exercise';
    }
    
    function isMissionLevel(level) {
        if (!level) return false;
        const type = level.type || getLevelType(level.title);
        return type === 'mission' || type === 'quest';
    }
    
    function generateSlug(title) {
        if (!title) return 'level';
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    
    return {
        getLevelType: getLevelType,
        isMissionLevel: isMissionLevel,
        generateSlug: generateSlug
    };
})();

window.MissionDetector = MissionDetector;
