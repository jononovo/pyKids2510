// ============================================
// MASTER GAME PARSER MODULE
// ============================================

function parseMasterGameData(markdown) {
    const masterGameData = {
        type: 'master_game',
        chapter: 1,
        theme: '',
        startingResources: {},
        unlockableZones: [],
        missions: [],
        quest: null
    };

    // Extract master configuration from the beginning
    const configMatch = markdown.match(/### Master Map Configuration\s*```([\s\S]*?)```/);
    if (configMatch) {
        const configLines = configMatch[1].trim().split('\n');
        configLines.forEach(line => {
            if (line.includes('chapter:')) {
                masterGameData.chapter = parseInt(line.split(':')[1].trim());
            } else if (line.includes('theme:')) {
                masterGameData.theme = line.split(':')[1].trim();
            } else if (line.includes('starting_resources:')) {
                // Parse resources in subsequent lines
                const resourcesStart = configLines.indexOf(line);
                let i = resourcesStart + 1;
                while (i < configLines.length && configLines[i].startsWith('  ')) {
                    const resourceLine = configLines[i].trim();
                    const [resource, amount] = resourceLine.split(':').map(s => s.trim());
                    masterGameData.startingResources[resource] = parseInt(amount) || 0;
                    i++;
                }
            } else if (line.includes('unlockable_zones:')) {
                // Parse zones in subsequent lines
                const zonesStart = configLines.indexOf(line);
                let i = zonesStart + 1;
                while (i < configLines.length && configLines[i].startsWith('  - ')) {
                    const zone = configLines[i].replace('  - ', '').trim();
                    masterGameData.unlockableZones.push(zone);
                    i++;
                }
            }
        });
    }

    // Split by mission/quest separators
    const sections = markdown.split(/^---\s*<!--.*?-->/m).filter(s => s.trim());
    
    for (let section of sections) {
        if (!section.trim()) continue;

        // Check if this is a quest (finale)
        if (section.includes('## QUEST:')) {
            masterGameData.quest = parseMissionOrQuest(section, true);
        } 
        // Check if this is a mission
        else if (section.includes('## MISSION:')) {
            const mission = parseMissionOrQuest(section, false);
            masterGameData.missions.push(mission);
        }
    }

    return masterGameData;
}

function parseMissionOrQuest(section, isQuest = false) {
    const data = {
        type: isQuest ? 'quest' : 'mission',
        title: '',
        afterLesson: '',
        objective: '',
        requirements: [],
        unlocks: [],
        starterCode: '',
        map: {
            layout: [],
            graphic: null,
            startPos: {x: 0, y: 0},
            resourcesToCollect: [],
            successCondition: '',
            npcs: [],
            buildSpots: [],
            pushableObjects: [],
            timedEvent: null,
            dynamicEvents: false,
            sandboxMode: false
        }
    };

    // Extract title
    const titleMatch = section.match(/##\s+(MISSION|QUEST):\s+(.+)$/m);
    if (titleMatch) data.title = titleMatch[2];

    // Extract after lesson info (for missions)
    const afterLessonMatch = section.match(/### After Lesson:\s+(.+)$/m);
    if (afterLessonMatch) data.afterLesson = afterLessonMatch[1];

    // Extract objective
    const objectiveMatch = section.match(/\*\*Objective\*\*:\s+(.+)/);
    if (objectiveMatch) data.objective = objectiveMatch[1];

    // Extract scenario (for quests)
    const scenarioMatch = section.match(/\*\*Scenario\*\*:\s+(.+)/);
    if (scenarioMatch) data.objective = scenarioMatch[1];

    // Extract requirements
    const reqMatch = section.match(/\*\*Requirements\*\*:([\s\S]*?)\n\*\*/);
    if (reqMatch) {
        const reqLines = reqMatch[1].trim().split('\n');
        reqLines.forEach(line => {
            if (line.startsWith('- ')) {
                data.requirements.push(line.substring(2));
            }
        });
    }

    // Extract unlocks
    const unlocksMatch = section.match(/\*\*Unlocks\*\*:([\s\S]*?)\n(?:\*\*|<!--|$)/);
    if (unlocksMatch) {
        const unlockLines = unlocksMatch[1].trim().split('\n');
        unlockLines.forEach(line => {
            if (line.startsWith('- ')) {
                data.unlocks.push(line.substring(2));
            }
        });
    }

    // Extract starter code
    const starterCodeMatch = section.match(/<!--\s*Starter Code\s*-->\s*\n*```([\s\S]*?)```/);
    if (starterCodeMatch) {
        data.starterCode = starterCodeMatch[1].trim();
    }

    // Extract map data
    const mapDataMatch = section.match(/<!--\s*Map\s*-->\s*\n*```([\s\S]*?)```/);
    if (mapDataMatch) {
        const mapData = mapDataMatch[1].trim();
        const mapLines = mapData.split('\n');
        
        for (let line of mapLines) {
            line = line.trim();
            
            if (line.startsWith('graphic:')) {
                data.map.graphic = line.split('graphic:')[1].trim();
            } else if (line.startsWith('[')) {
                // Parse array row
                try {
                    const row = JSON.parse(line.replace(/,$/, ''));
                    data.map.layout.push(row);
                } catch (e) {
                    console.log('Could not parse map row:', line);
                }
            } else if (line.includes('startPos:')) {
                const coords = line.split(':')[1].trim().split(',');
                data.map.startPos = {
                    x: parseInt(coords[0]), 
                    y: parseInt(coords[1])
                };
            } else if (line.includes('resources_to_collect:')) {
                // Parse resources in subsequent lines
                const startIdx = mapLines.indexOf(line);
                let jsonStr = '';
                for (let i = startIdx + 1; i < mapLines.length; i++) {
                    if (mapLines[i].startsWith(']')) {
                        jsonStr += mapLines[i];
                        break;
                    }
                    jsonStr += mapLines[i] + '\n';
                }
                try {
                    data.map.resourcesToCollect = eval(jsonStr); // Using eval for simplicity with the complex structure
                } catch (e) {
                    console.log('Could not parse resources:', e);
                }
            } else if (line.includes('success_condition:')) {
                data.map.successCondition = line.split(':')[1].trim();
            } else if (line.includes('threshold:')) {
                data.map.threshold = parseInt(line.split(':')[1].trim());
            } else if (line.includes('npcs:')) {
                // Parse NPCs
                const startIdx = mapLines.indexOf(line);
                let jsonStr = '';
                for (let i = startIdx + 1; i < mapLines.length; i++) {
                    if (mapLines[i].startsWith(']')) {
                        jsonStr += mapLines[i];
                        break;
                    }
                    jsonStr += mapLines[i] + '\n';
                }
                try {
                    data.map.npcs = eval(jsonStr);
                } catch (e) {
                    console.log('Could not parse NPCs:', e);
                }
            } else if (line.includes('build_spots:')) {
                // Parse build spots
                const startIdx = mapLines.indexOf(line);
                let jsonStr = '';
                for (let i = startIdx + 1; i < mapLines.length; i++) {
                    if (mapLines[i].startsWith(']')) {
                        jsonStr += mapLines[i];
                        break;
                    }
                    jsonStr += mapLines[i] + '\n';
                }
                try {
                    data.map.buildSpots = eval(jsonStr);
                } catch (e) {
                    console.log('Could not parse build spots:', e);
                }
            } else if (line.includes('pushable_objects:')) {
                // Parse pushable objects
                const startIdx = mapLines.indexOf(line);
                let jsonStr = '';
                for (let i = startIdx + 1; i < mapLines.length; i++) {
                    if (mapLines[i].startsWith(']')) {
                        jsonStr += mapLines[i];
                        break;
                    }
                    jsonStr += mapLines[i] + '\n';
                }
                try {
                    data.map.pushableObjects = eval(jsonStr);
                } catch (e) {
                    console.log('Could not parse pushable objects:', e);
                }
            } else if (line.includes('timed_event:')) {
                // Parse timed event
                const eventMatch = line.match(/{.*}/);
                if (eventMatch) {
                    try {
                        data.map.timedEvent = eval('(' + eventMatch[0] + ')');
                    } catch (e) {
                        console.log('Could not parse timed event:', e);
                    }
                }
            } else if (line.includes('storm_timer:')) {
                data.map.stormTimer = parseInt(line.split(':')[1].trim());
            } else if (line.includes('dynamic_events:')) {
                data.map.dynamicEvents = line.includes('true');
            } else if (line.includes('sandbox_mode:')) {
                data.map.sandboxMode = line.includes('true');
            }
        }
    }

    return data;
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseMasterGameData };
}