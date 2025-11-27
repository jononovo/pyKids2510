// ============================================
// LESSON PARSER MODULE
// ============================================

function parseTestsYaml(yamlStr) {
    const tests = { pass_all: true, items: [] };
    const lines = yamlStr.split('\n');
    let currentTest = null;
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.match(/^pass_all:\s*(true|false)/i)) {
            tests.pass_all = trimmedLine.toLowerCase().includes('true');
        } else if (trimmedLine.match(/^-\s*type:/)) {
            if (currentTest) tests.items.push(currentTest);
            const typeMatch = trimmedLine.match(/type:\s*["']?(\w+)["']?/);
            currentTest = { type: typeMatch ? typeMatch[1] : 'unknown' };
        } else if (currentTest && trimmedLine.match(/^\w+:/)) {
            const colonIndex = trimmedLine.indexOf(':');
            const key = trimmedLine.substring(0, colonIndex).trim();
            let val = trimmedLine.substring(colonIndex + 1).trim();
            
            val = val.replace(/^["']|["']$/g, '');
            
            if (val === 'true') {
                currentTest[key] = true;
            } else if (val === 'false') {
                currentTest[key] = false;
            } else if (!isNaN(val) && val !== '') {
                currentTest[key] = parseInt(val);
            } else if (val.startsWith('[') && val.endsWith(']')) {
                try {
                    currentTest[key] = JSON.parse(val);
                } catch (e) {
                    currentTest[key] = val;
                }
            } else {
                currentTest[key] = val;
            }
        }
    }
    
    if (currentTest) tests.items.push(currentTest);
    
    console.log('[LessonParser] Parsed tests:', tests);
    return tests;
}

function parseCourseLevels(markdown) {
    const courseData = {
        chapterName: '',
        chapterNumber: 1,
        categoryName: '',
        levels: []
    };

    // Extract chapter info from the beginning
    const chapterMatch = markdown.match(/^#\s+(.+)$/m);
    if (chapterMatch) courseData.chapterName = chapterMatch[1];
    
    const chapterNumMatch = markdown.match(/^##\s+CHAPTER\s+(\d+)$/m);
    if (chapterNumMatch) courseData.chapterNumber = parseInt(chapterNumMatch[1]);
    
    const categoryMatch = markdown.match(/^##\s+([A-Z\s]+)$/m);
    if (categoryMatch && !categoryMatch[1].includes('CHAPTER')) {
        courseData.categoryName = categoryMatch[1].trim();
    }

    // Split by level separators
    const levelSections = markdown.split(/^---\s*<!--.*?-->/m).filter(s => s.trim());
    
    // Skip the first section if it's just headers
    const startIndex = levelSections[0].match(/^##\s+[A-Z]/m) && 
                       !levelSections[0].match(/###\s+OBJECTIVE/m) ? 1 : 0;
    
    for (let i = startIndex; i < levelSections.length; i++) {
        const section = levelSections[i].trim();
        if (!section) continue;

        const level = {
            title: '',
            markdown: '',
            starterCode: '',
            solutionCode: '',
            map: {
                layout: [],
                startPos: {x: 0, y: 0},
                goalPos: {x: 0, y: 0},
                collectibles: [],
                transforms: [],
                megaElements: [],
                megaObjects: [],
                graphic: null  // Optional background graphic URL
            }
        };

        // Extract title
        const titleMatch = section.match(/^##\s+(.+)$/m);
        if (titleMatch) level.title = titleMatch[1];

        // Extract code blocks with their comments
        const starterCodeMatch = section.match(/<!--\s*Starter Code\s*-->\s*\n*```([\s\S]*?)```/);
        if (starterCodeMatch) {
            level.starterCode = starterCodeMatch[1].trim();
        }

        const solutionCodeMatch = section.match(/<!--\s*Solution\s*-->\s*\n*```([\s\S]*?)```/);
        if (solutionCodeMatch) {
            level.solutionCode = solutionCodeMatch[1].trim();
        }

        const mapDataMatch = section.match(/<!--\s*Map\s*-->\s*\n*```([\s\S]*?)```/);
        if (mapDataMatch) {
            const mapData = mapDataMatch[1].trim();
            const mapLines = mapData.split('\n');
            
            for (let line of mapLines) {
                if (line.startsWith('[')) {
                    // Parse array row, handling tile annotations like 1* for interactive objects
                    try {
                        // Remove annotations (asterisks) from the line for parsing
                        const cleanLine = line.replace(/(\d+)\*/g, '$1');
                        const row = JSON.parse(cleanLine.replace(/,$/, ''));
                        level.map.layout.push(row);
                        
                        // Extract annotations to create interactive objects
                        const annotationMatches = line.matchAll(/(\d+)\*/g);
                        const rowIndex = level.map.layout.length - 1;
                        let colIndex = 0;
                        
                        // Parse the original line to find positions of annotated tiles
                        const originalRow = line.match(/\[(.*)\]/)[1].split(',');
                        for (let i = 0; i < originalRow.length; i++) {
                            const tile = originalRow[i].trim();
                            if (tile.includes('*')) {
                                // This tile has an annotation - it's interactive
                                const tileValue = parseInt(tile.replace('*', ''));
                                // Add to collectibles or objects based on tile type
                                // For now, treat annotated tiles as collectibles
                                level.map.collectibles.push({x: i, y: rowIndex});
                            }
                        }
                    } catch (e) {
                        console.log('Could not parse map row:', line, e);
                    }
                } else if (line.includes('startPos:')) {
                    const coords = line.split(':')[1].trim().split(',');
                    level.map.startPos = {
                        x: parseInt(coords[0]), 
                        y: parseInt(coords[1])
                    };
                } else if (line.includes('goalPos:')) {
                    const coords = line.split(':')[1].trim().split(',');
                    level.map.goalPos = {
                        x: parseInt(coords[0]), 
                        y: parseInt(coords[1])
                    };
                } else if (line.includes('collectibles:')) {
                    try {
                        const collectiblesStr = line.split('collectibles:')[1].trim();
                        const collectiblesArray = JSON.parse(collectiblesStr);
                        // New format only: ["type", [[x,y],[x,y]]]
                        level.map.collectibles = collectiblesArray;
                    } catch (e) {
                        console.log('Could not parse collectibles:', line);
                    }
                } else if (line.includes('transforms:')) {
                    try {
                        const transformsStr = line.split('transforms:')[1].trim();
                        const transformsArray = JSON.parse(transformsStr);
                        level.map.transforms = transformsArray;
                    } catch (e) {
                        console.log('Could not parse transforms:', line);
                    }
                } else if (line.includes('vehicles:')) {
                    try {
                        const vehiclesStr = line.split('vehicles:')[1].trim();
                        const vehiclesArray = JSON.parse(vehiclesStr);
                        level.map.vehicles = vehiclesArray;
                    } catch (e) {
                        console.log('Could not parse vehicles:', line);
                    }
                } else if (line.includes('megaElements:')) {
                    try {
                        const megaElementsStr = line.split('megaElements:')[1].trim();
                        const megaElementsArray = JSON.parse(megaElementsStr);
                        level.map.megaElements = megaElementsArray;
                    } catch (e) {
                        console.log('Could not parse megaElements:', line);
                    }
                } else if (line.includes('megaObjects:')) {
                    try {
                        const megaObjectsStr = line.split('megaObjects:')[1].trim();
                        const megaObjectsArray = JSON.parse(megaObjectsStr);
                        level.map.megaObjects = megaObjectsArray;
                    } catch (e) {
                        console.log('Could not parse megaObjects:', line);
                    }
                } else if (line.includes('graphic:')) {
                    // Extract the graphic URL
                    const graphicUrl = line.split('graphic:')[1].trim();
                    // Remove any quotes if present
                    level.map.graphic = graphicUrl.replace(/^["']|["']$/g, '');
                }
            }
        }

        // Get markdown content for display (remove all code blocks and their comments)
        let markdownContent = section;
        // Remove starter code block and comment
        markdownContent = markdownContent.replace(/<!--\s*Starter Code\s*-->\s*\n*```[\s\S]*?```/g, '');
        // Remove solution code block and comment
        markdownContent = markdownContent.replace(/<!--\s*Solution\s*-->\s*\n*```[\s\S]*?```/g, '');
        // Remove map code block and comment
        markdownContent = markdownContent.replace(/<!--\s*Map\s*-->\s*\n*```[\s\S]*?```/g, '');
        // Remove trailing --- separator if present
        markdownContent = markdownContent.replace(/\n---\s*$/, '');
        
        level.markdown = markdownContent.trim();

        // Parse Tests section
        const testsMatch = section.match(/<!--\s*Tests\s*-->\s*\n*```(?:yaml|yml)?\s*([\s\S]*?)```/);
        if (testsMatch) {
            level.tests = parseTestsYaml(testsMatch[1].trim());
        }
        
        // Remove tests section from markdown content
        level.markdown = level.markdown.replace(/<!--\s*Tests\s*-->\s*\n*```(?:yaml|yml)?[\s\S]*?```/g, '');

        // Detect mission type and generate slug
        if (window.MissionDetector) {
            level.type = window.MissionDetector.getLevelType(level.title);
            level.slug = window.MissionDetector.generateSlug(level.title);
        } else {
            level.type = 'exercise';
            level.slug = 'level-' + (courseData.levels.length + 1);
        }
        
        // Mark if map was explicitly defined (for inheritance logic)
        level.hasOwnMap = level.map.layout.length > 0;

        courseData.levels.push(level);
    }

    return courseData;
}

// Convert markdown to HTML using marked.js
function markdownToHTML(markdown) {
    return marked.parse(markdown);
}