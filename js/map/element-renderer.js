// ============================================
// ELEMENT RENDERER
// Handles drawing of interactive elements, mega-elements, scenery, and vehicles
// ============================================

(function() {
    'use strict';
    
    async function drawElements() {
        if (!window.ElementInteractionManager) return;
        
        const elements = ElementInteractionManager.getElementsForRender();
        if (!elements || elements.length === 0) return;
        
        const ctx = window.getRenderContext ? window.getRenderContext() : null;
        if (!ctx) return;
        
        const TILE_SIZE = window.TILE_SIZE || 32;
        const COLLECTIBLE_SVGS = window.COLLECTIBLE_SVGS || {};
        
        const elementPromises = elements.map(async (element) => {
            const px = element.x * TILE_SIZE;
            const py = element.y * TILE_SIZE;
            
            const elementDef = ElementInteractionManager.getElementDefinition(element.type);
            let svgPath = null;
            
            if (elementDef && elementDef.path) {
                svgPath = 'assets/map/' + elementDef.path;
            } else {
                svgPath = COLLECTIBLE_SVGS[element.type];
            }
            
            if (svgPath && window.loadSVGImage) {
                const img = await window.loadSVGImage(svgPath);
                if (img) {
                    ctx.drawImage(img, px, py, TILE_SIZE, TILE_SIZE);
                } else if (elementDef && elementDef.fallbackColor) {
                    ctx.fillStyle = elementDef.fallbackColor;
                    ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                }
            }
        });
        
        await Promise.all(elementPromises);
    }
    
    async function drawMegaElements() {
        if (!window.MegaElementManager) return;
        
        const megaElements = MegaElementManager.getElementsForRender();
        if (!megaElements || megaElements.length === 0) return;
        
        const ctx = window.getRenderContext ? window.getRenderContext() : null;
        if (!ctx) return;
        
        const TILE_SIZE = window.TILE_SIZE || 32;
        
        const megaPromises = megaElements.map(async (element) => {
            const px = element.x * TILE_SIZE;
            const py = element.y * TILE_SIZE;
            const width = element.width * TILE_SIZE;
            const height = element.height * TILE_SIZE;
            
            if (element.path && window.loadSVGImage) {
                const svgPath = 'assets/map/' + element.path;
                const img = await window.loadSVGImage(svgPath);
                if (img) {
                    ctx.drawImage(img, px, py, width, height);
                } else if (element.fallbackColor) {
                    ctx.fillStyle = element.fallbackColor;
                    ctx.fillRect(px + 4, py + 4, width - 8, height - 8);
                }
            } else if (element.fallbackColor) {
                ctx.fillStyle = element.fallbackColor;
                ctx.fillRect(px + 4, py + 4, width - 8, height - 8);
            }
        });
        
        await Promise.all(megaPromises);
    }
    
    async function drawVehicles() {
        if (!window.VehicleInteractionManager) return;
        
        const vehicles = VehicleInteractionManager.getVehiclesForRender();
        if (!vehicles || vehicles.length === 0) return;
        
        const ctx = window.getRenderContext ? window.getRenderContext() : null;
        if (!ctx) return;
        
        const TILE_SIZE = window.TILE_SIZE || 32;
        
        const vehiclePromises = vehicles.map(async (vehicle) => {
            const px = vehicle.x * TILE_SIZE;
            const py = vehicle.y * TILE_SIZE;
            
            const vehicleDef = ElementInteractionManager.getElementDefinition(vehicle.type);
            if (!vehicleDef) return;
            
            const width = (vehicleDef.width || 1) * TILE_SIZE;
            const height = (vehicleDef.height || 1) * TILE_SIZE;
            
            if (vehicleDef.path && window.loadSVGImage) {
                const svgPath = 'assets/map/' + vehicleDef.path;
                const img = await window.loadSVGImage(svgPath);
                if (img) {
                    ctx.drawImage(img, px, py, width, height);
                } else if (vehicleDef.fallbackColor) {
                    ctx.fillStyle = vehicleDef.fallbackColor;
                    ctx.fillRect(px + 4, py + 4, width - 8, height - 8);
                }
            } else if (vehicleDef.fallbackColor) {
                ctx.fillStyle = vehicleDef.fallbackColor;
                ctx.fillRect(px + 4, py + 4, width - 8, height - 8);
            }
        });
        
        await Promise.all(vehiclePromises);
    }
    
    async function drawBuiltElements() {
        if (!window.gameState || !gameState.builtElements || gameState.builtElements.length === 0) return;
        if (!window.ElementInteractionManager) return;
        
        const ctx = window.getRenderContext ? window.getRenderContext() : null;
        if (!ctx) return;
        
        const TILE_SIZE = window.TILE_SIZE || 32;
        
        const builtPromises = gameState.builtElements.map(async (element) => {
            const elementDef = ElementInteractionManager.getElementDefinition(element.type);
            if (!elementDef) return;
            
            const px = element.x * TILE_SIZE;
            const py = element.y * TILE_SIZE;
            const width = (elementDef.width || 1) * TILE_SIZE;
            const height = (elementDef.height || 1) * TILE_SIZE;
            
            if (elementDef.path && window.loadSVGImage) {
                const svgPath = 'assets/map/' + elementDef.path;
                const img = await window.loadSVGImage(svgPath);
                if (img) {
                    ctx.drawImage(img, px, py, width, height);
                } else if (elementDef.fallbackColor) {
                    ctx.fillStyle = elementDef.fallbackColor;
                    ctx.fillRect(px + 4, py + 4, width - 8, height - 8);
                }
            } else if (elementDef.fallbackColor) {
                ctx.fillStyle = elementDef.fallbackColor;
                ctx.fillRect(px + 4, py + 4, width - 8, height - 8);
            }
        });
        
        await Promise.all(builtPromises);
    }
    
    async function drawScenery() {
        if (!window.SceneryManager) return;
        
        const sceneryItems = SceneryManager.getSceneryForRender();
        if (!sceneryItems || sceneryItems.length === 0) return;
        
        const ctx = window.getRenderContext ? window.getRenderContext() : null;
        if (!ctx) return;
        
        const TILE_SIZE = window.TILE_SIZE || 32;
        
        const sceneryPromises = sceneryItems.map(async (item) => {
            const px = item.x * TILE_SIZE;
            const py = item.y * TILE_SIZE;
            const width = item.width * TILE_SIZE;
            const height = item.height * TILE_SIZE;
            
            if (item.path && window.loadSVGImage) {
                const svgPath = 'assets/map/' + item.path;
                const img = await window.loadSVGImage(svgPath);
                if (img) {
                    ctx.drawImage(img, px, py, width, height);
                } else if (item.fallbackColor) {
                    ctx.fillStyle = item.fallbackColor;
                    ctx.fillRect(px + 4, py + 4, width - 8, height - 8);
                }
            } else if (item.fallbackColor) {
                ctx.fillStyle = item.fallbackColor;
                ctx.fillRect(px + 4, py + 4, width - 8, height - 8);
            }
        });
        
        await Promise.all(sceneryPromises);
    }
    
    function drawCharacterVehicle(x, y, direction) {
        if (!window.VehicleInteractionManager) return;
        
        const currentVehicle = VehicleInteractionManager.getCurrentVehicle();
        if (!currentVehicle) return;
        
        const vehicleDef = ElementInteractionManager.getElementDefinition(currentVehicle.type);
        if (!vehicleDef) return;
        
        const ctx = window.getRenderContext ? window.getRenderContext() : null;
        if (!ctx) return;
        
        const TILE_SIZE = window.TILE_SIZE || 32;
        const baseWidth = (vehicleDef.width || 1) * TILE_SIZE;
        const baseHeight = (vehicleDef.height || 1) * TILE_SIZE;
        
        const dir = direction || window.gameState?.playerDirection || 'up';
        
        const rotationAngles = {
            'up': 0,
            'right': Math.PI / 2,
            'down': Math.PI,
            'left': -Math.PI / 2
        };
        const angle = rotationAngles[dir] || 0;
        
        const cx = x * TILE_SIZE + TILE_SIZE / 2;
        const cy = y * TILE_SIZE + TILE_SIZE / 2;
        
        if (vehicleDef.path) {
            const svgPath = 'assets/map/' + vehicleDef.path;
            const cachedImg = window.getCachedSVG ? window.getCachedSVG(svgPath) : null;
            
            if (cachedImg) {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(angle);
                ctx.drawImage(cachedImg, -baseWidth / 2, -baseHeight / 2, baseWidth, baseHeight);
                ctx.restore();
            } else {
                if (vehicleDef.fallbackColor) {
                    ctx.fillStyle = vehicleDef.fallbackColor;
                    ctx.save();
                    ctx.translate(cx, cy);
                    ctx.rotate(angle);
                    ctx.fillRect(-baseWidth / 2 + 4, -baseHeight / 2 + 4, baseWidth - 8, baseHeight - 8);
                    ctx.restore();
                }
                if (window.loadSVGImage) {
                    window.loadSVGImage(svgPath);
                }
            }
        } else if (vehicleDef.fallbackColor) {
            ctx.fillStyle = vehicleDef.fallbackColor;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);
            ctx.fillRect(-baseWidth / 2 + 4, -baseHeight / 2 + 4, baseWidth - 8, baseHeight - 8);
            ctx.restore();
        }
    }
    
    async function drawFarmPlots() {
        if (!window.gameState || !gameState.farmPlots || gameState.farmPlots.length === 0) return;
        
        const ctx = window.getRenderContext ? window.getRenderContext() : null;
        if (!ctx) return;
        
        const TILE_SIZE = window.TILE_SIZE || 32;
        
        const FARM_SVGS = {
            'dirt': 'assets/map/elements/landscaping/farm-dirt.svg',
            'sprout': 'assets/map/elements/landscaping/farm-sprout.svg',
            'grown': 'assets/map/elements/landscaping/farm-grown.svg'
        };
        
        const plotPromises = gameState.farmPlots.map(async (plot) => {
            const px = plot.x * TILE_SIZE;
            const py = plot.y * TILE_SIZE;
            const svgPath = FARM_SVGS[plot.stage] || FARM_SVGS['dirt'];
            
            if (window.loadSVGImage) {
                const img = await window.loadSVGImage(svgPath);
                if (img) {
                    ctx.drawImage(img, px, py, TILE_SIZE, TILE_SIZE);
                } else {
                    ctx.fillStyle = plot.stage === 'dirt' ? '#6B4423' : '#32CD32';
                    ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                }
            }
        });
        
        await Promise.all(plotPromises);
    }
    
    window.drawElements = drawElements;
    window.drawMegaElements = drawMegaElements;
    window.drawVehicles = drawVehicles;
    window.drawScenery = drawScenery;
    window.drawBuiltElements = drawBuiltElements;
    window.drawCharacterVehicle = drawCharacterVehicle;
    window.drawFarmPlots = drawFarmPlots;
    
    console.log('[ElementRenderer] Module loaded');
})();
