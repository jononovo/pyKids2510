// ========================================
//   CODING TUTOR SYSTEM
// ========================================

// Global state
let tutorEnabled = localStorage.getItem('tutorEnabled') !== 'false'; // Default ON
let currentRecommendation = null;

// Make tutorEnabled accessible globally
window.tutorEnabled = tutorEnabled;

// Toggle tutor functionality (now only affects the tutor toggle, not help button)
function toggleTutor() {
    tutorEnabled = !tutorEnabled;
    window.tutorEnabled = tutorEnabled;
    localStorage.setItem('tutorEnabled', tutorEnabled ? 'true' : 'false');
    
    // Help button is now decoupled - it remains static
    // Only log the tutor state change
    if (tutorEnabled) {
        console.log('Tutor enabled');
    } else {
        console.log('Tutor disabled');
    }
    
    // Update tutor toggle button
    const tutorToggle = document.getElementById('tutor-toggle');
    if (tutorToggle) {
        const toggleText = tutorToggle.querySelector('.toggle-text');
        // Ensure the dog emoji icon is present
        const toggleIcon = tutorToggle.querySelector('.toggle-icon');
        if (!toggleIcon) {
            const icon = document.createElement('span');
            icon.className = 'toggle-icon';
            icon.textContent = '🐶';
            tutorToggle.appendChild(icon);  // Add after the text
        }
        if (tutorEnabled) {
            tutorToggle.classList.remove('off');
            if (toggleText) toggleText.textContent = 'ON';
        } else {
            tutorToggle.classList.add('off');
            if (toggleText) toggleText.textContent = 'OFF';
        }
    }
}

// Make toggleTutor accessible globally
window.toggleTutor = toggleTutor;

// Generate tutor avatar on canvas
function generateTutorAvatar() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Clear background
    ctx.clearRect(0, 0, 32, 32);
    
    // Color palette
    const skin = '#f4c2a1';
    const hair = '#3e2825';
    const glasses = '#333333';
    const shirt = '#6a5496';
    const glassesLens = '#89c9e3';
    const outline = '#2a1f1d';
    
    // Helper function to draw pixel
    function pixel(x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
    }
    
    // Draw hair
    ctx.fillStyle = hair;
    ctx.fillRect(11, 6, 10, 3);
    
    // Draw face
    ctx.fillStyle = skin;
    ctx.fillRect(10, 9, 12, 7);
    
    // Draw glasses frames
    ctx.fillStyle = glasses;
    // Left lens frame
    ctx.fillRect(11, 11, 4, 1);
    ctx.fillRect(11, 13, 4, 1);
    ctx.fillRect(10, 12, 1, 1);
    // Right lens frame
    ctx.fillRect(17, 11, 4, 1);
    ctx.fillRect(17, 13, 4, 1);
    ctx.fillRect(21, 12, 1, 1);
    // Bridge
    ctx.fillRect(15, 12, 2, 1);
    
    // Draw glasses lenses
    ctx.fillStyle = glassesLens;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(11, 12, 4, 1);
    ctx.fillRect(17, 12, 4, 1);
    ctx.globalAlpha = 1.0;
    
    // Draw eyes
    ctx.fillStyle = outline;
    pixel(12, 12, outline);
    pixel(13, 12, outline);
    pixel(18, 12, outline);
    pixel(19, 12, outline);
    
    // Draw nose
    pixel(15, 14, outline);
    pixel(16, 14, outline);
    
    // Draw smile
    pixel(14, 16, outline);
    pixel(15, 17, outline);
    pixel(16, 17, outline);
    pixel(17, 16, outline);
    
    // Draw shirt
    ctx.fillStyle = shirt;
    ctx.fillRect(10, 19, 12, 2);
    ctx.fillRect(9, 21, 14, 5);
    
    return canvas.toDataURL();
}

// Initialize tutor avatar when page loads
window.addEventListener('DOMContentLoaded', function() {
    const avatarImg = document.querySelector('.tutor-avatar');
    if (avatarImg) {
        avatarImg.src = generateTutorAvatar();
    }
});

// Show tutor dialog
function showTutorDialog(recommendation) {
    console.log('showTutorDialog called with:', recommendation);
    currentRecommendation = recommendation;
    
    const overlay = document.getElementById('tutorOverlay');
    if (overlay) {
        // Check if marked is available
        if (typeof marked === 'undefined') {
            console.error('marked.js not loaded!');
            document.getElementById('tutorMessage').innerHTML = `<p>${recommendation.message}</p>`;
        } else {
            // Render message with markdown
            const messageHtml = marked.parse(recommendation.message);
            document.getElementById('tutorMessage').innerHTML = messageHtml;
        }
        
        // Show code with syntax highlighting  
        const codeHtml = `<span style="color: #7fc542">${recommendation.code}</span>`;
        document.getElementById('tutorCodeBox').innerHTML = codeHtml;
        
        overlay.classList.add('show');
        console.log('Dialog should be visible now');
    }
}


// Close tutor dialog
function closeTutorDialog() {
    document.getElementById('tutorOverlay').classList.remove('show');
    currentRecommendation = null;
}

// Apply tutor recommendation
function applyTutorRecommendation() {
    if (!currentRecommendation) {
        console.error('No recommendation to apply');
        return;
    }
    
    console.log('Applying recommendation:', currentRecommendation);
    
    const code = EditorManager.getCode();
    const lines = code.split('\n');
    
    // Apply based on recommendation type
    if (currentRecommendation.type === 'incomplete' || currentRecommendation.type === 'missing') {
        // Add new line at the end
        // Find last non-empty line
        let lastIndex = lines.length - 1;
        while (lastIndex >= 0 && lines[lastIndex].trim() === '') {
            lastIndex--;
        }
        // Insert after last non-empty line
        lines.splice(lastIndex + 1, 0, currentRecommendation.code);
    } else if (currentRecommendation.type === 'incorrect') {
        // Find and replace the incorrect line
        // Use lineNumber if available, otherwise try to parse from message
        const lineNum = currentRecommendation.lineNumber ? 
                        currentRecommendation.lineNumber - 1 : 
                        (currentRecommendation.message.match(/line (\d+)/i) ? 
                         parseInt(currentRecommendation.message.match(/line (\d+)/i)[1]) - 1 : 
                         null);
        
        if (lineNum !== null) {
            let actualLineIndex = -1;
            let codeLineCount = 0;
            
            // Find the actual line index (skipping comments and imports)
            for (let i = 0; i < lines.length; i++) {
                const trimmed = lines[i].trim();
                if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('import')) {
                    if (codeLineCount === lineNum) {
                        actualLineIndex = i;
                        break;
                    }
                    codeLineCount++;
                }
            }
            
            if (actualLineIndex >= 0) {
                // Replace the line with proper indentation
                const originalIndent = lines[actualLineIndex].match(/^\s*/)[0];
                lines[actualLineIndex] = originalIndent + currentRecommendation.code.trim();
                console.log(`Replaced line ${actualLineIndex + 1}: "${lines[actualLineIndex]}"`);
            } else {
                // Fallback: add at the end
                lines.push(currentRecommendation.code);
            }
        } else {
            // Fallback: add the code at the end
            let lastIndex = lines.length - 1;
            while (lastIndex >= 0 && lines[lastIndex].trim() === '') {
                lastIndex--;
            }
            lines.splice(lastIndex + 1, 0, currentRecommendation.code);
        }
    } else {
        // Default: add the code at the end
        let lastIndex = lines.length - 1;
        while (lastIndex >= 0 && lines[lastIndex].trim() === '') {
            lastIndex--;
        }
        lines.splice(lastIndex + 1, 0, currentRecommendation.code);
    }
    
    // Update the editor
    const appliedCode = lines.join('\n');
    EditorManager.updateCode(appliedCode);
    UserProgressManager.saveCode(appliedCode);
    
    // Close dialog
    closeTutorDialog();
}

const GENERAL_TIP = {
    message: 'Try adding more movement commands to reach the goal.',
    code: 'player.move_forward()',
    type: 'tip'
};

function recommendationFor(studentCode, executionError) {
    const solutionCode = courseData.levels[currentLevel].solutionCode || '';
    return generateRecommendation(normalizeCode(studentCode), normalizeCode(solutionCode), executionError);
}

function analyzeCodeAndProvideHelp(studentCode, executionError, executedCommands) {
    console.log('Tutor: Analyzing code...', { studentCode, executionError, executedCommands });
    const recommendation = recommendationFor(studentCode, executionError);
    if (recommendation) {
        showTutorDialog(recommendation);
    }
}

function showLevelAdvice() {
    showTutorDialog(recommendationFor(EditorManager.getCode(), null) || GENERAL_TIP);
}

// Normalize code for comparison (remove comments, blank lines, normalize spacing)
function normalizeCode(code) {
    return code.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#') && !line.startsWith('import'))
        .map(line => line.replace(/\s+/g, ' '));  // Normalize whitespace
}

// Generate recommendation based on code comparison
function generateRecommendation(studentLines, solutionLines, executionError) {
    // If there was an execution error, provide error-specific help
    if (executionError) {
        return {
            message: `I see you're having trouble with ${executionError.line ? 'line ' + executionError.line : 'your code'}. ${executionError.text}`,
            code: solutionLines[0] || 'player.move_forward()',
            type: 'error'
        };
    }

    if (solutionLines.length === 0) {
        return GENERAL_TIP;
    }
    
    // Count how many of the user's existing lines are incorrect (not counting missing lines)
    let incorrectCount = 0;
    let firstIncorrectIndex = -1;
    
    // Only check lines the student has actually typed
    for (let i = 0; i < studentLines.length; i++) {
        const studentLine = studentLines[i];
        const solutionLine = solutionLines[i] || '';
        
        if (!linesAreEquivalent(studentLine, solutionLine)) {
            incorrectCount++;
            if (firstIncorrectIndex === -1) {
                firstIncorrectIndex = i;
            }
        }
    }
    
    if (incorrectCount > 2) {
        return GENERAL_TIP;
    }
    
    // Simple cases: 2 or fewer incorrect lines in what user typed - use rules-based help
    
    // Check if student code is incomplete (fewer lines than solution)
    if (studentLines.length < solutionLines.length) {
        // If existing lines are correct, suggest next line
        if (incorrectCount === 0) {
            const nextLineIndex = studentLines.length;
            const nextLine = solutionLines[nextLineIndex];
            
            return {
                message: `Good start! You need to add more commands to reach the goal. Try adding this next:`,
                code: nextLine,
                type: 'incomplete'
            };
        }
    }
    
    // If there's an incorrect line (1 or 2), provide specific help
    if (firstIncorrectIndex >= 0) {
        const incorrectLine = studentLines[firstIncorrectIndex];
        const correctLine = solutionLines[firstIncorrectIndex];
        return {
            message: `Change line ${firstIncorrectIndex + 1} from \`${incorrectLine}\` to \`${correctLine}\``,
            code: correctLine,
            type: 'incorrect',
            lineNumber: firstIncorrectIndex + 1,
            incorrectLine: incorrectLine
        };
    }
    
    // Check if more lines needed (all existing lines are correct but incomplete)
    if (studentLines.length < solutionLines.length) {
        const nextLineIndex = studentLines.length;
        const nextLine = solutionLines[nextLineIndex];
        
        return {
            message: `Perfect so far! Add the next command:`,
            code: nextLine,
            type: 'incomplete'
        };
    }
    
    return null;  // No help needed
}

// Check if two lines are functionally equivalent
function linesAreEquivalent(line1, line2) {
    // Direct match
    if (line1 === line2) return true;
    
    // Handle move_forward() vs move_forward(1)
    if (line1.includes('move_forward()') && line2.includes('move_forward(1)')) return true;
    if (line1.includes('move_forward(1)') && line2.includes('move_forward()')) return true;
    
    // Handle loops vs repeated calls (simplified check)
    // TODO: More sophisticated loop handling in future phases
    
    return false;
}

// Export functions to global scope
window.showTutorDialog = showTutorDialog;
window.closeTutorDialog = closeTutorDialog;
window.applyTutorRecommendation = applyTutorRecommendation;
window.analyzeCodeAndProvideHelp = analyzeCodeAndProvideHelp;
window.showLevelAdvice = showLevelAdvice;