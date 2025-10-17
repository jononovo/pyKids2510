// ============================================
// LESSON PARSER MODULE
// ============================================

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
                    // Parse array row
                    try {
                        const row = JSON.parse(line.replace(/,$/, ''));
                        level.map.layout.push(row);
                    } catch (e) {
                        console.log('Could not parse map row:', line);
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
                        const collectiblesStr = line.split(':')[1].trim();
                        const collectiblesArray = JSON.parse(collectiblesStr);
                        level.map.collectibles = collectiblesArray.map(c => ({x: c[0], y: c[1]}));
                    } catch (e) {
                        console.log('Could not parse collectibles:', line);
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

        courseData.levels.push(level);
    }

    return courseData;
}

// Convert markdown to HTML using marked.js
function markdownToHTML(markdown) {
    return marked.parse(markdown);
}