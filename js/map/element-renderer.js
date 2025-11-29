// ============================================
// ELEMENT RENDERER
// Handles drawing of interactive elements, mega-elements, mega-objects, and vehicles
// ============================================

(function() {
    'use strict';
    
    async function drawElements() {
        if (!window.ElementInteractionManager) return;
        
        const elements = ElementInteractionManager.getElementsForRender();
        if (!elements || elements.length === 0) return;
        
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas ? canvas.getContext('2d') : null;
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
        
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas ? canvas.getContext('2d') : null;
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
        
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas ? canvas.getContext('2d') : null;
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
        
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas ? canvas.getContext('2d') : null;
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
    
    async function drawMegaObjects() {
        if (!window.MegaObjectManager) return;
        
        const megaObjects = MegaObjectManager.getObjectsForRender();
        if (!megaObjects || megaObjects.length === 0) return;
        
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas ? canvas.getContext('2d') : null;
        if (!ctx) return;
        
        const TILE_SIZE = window.TILE_SIZE || 32;
        
        const objectPromises = megaObjects.map(async (obj) => {
            const px = obj.x * TILE_SIZE;
            const py = obj.y * TILE_SIZE;
            const width = obj.width * TILE_SIZE;
            const height = obj.height * TILE_SIZE;
            
            if (obj.path && window.loadSVGImage) {
                const svgPath = 'assets/map/' + obj.path;
                const img = await window.loadSVGImage(svgPath);
                if (img) {
                    ctx.drawImage(img, px, py, width, height);
                } else if (obj.fallbackColor) {
                    ctx.fillStyle = obj.fallbackColor;
                    ctx.fillRect(px + 4, py + 4, width - 8, height - 8);
                }
            } else if (obj.fallbackColor) {
                ctx.fillStyle = obj.fallbackColor;
                ctx.fillRect(px + 4, py + 4, width - 8, height - 8);
            }
        });
        
        await Promise.all(objectPromises);
    }
    
    async function drawCharacterVehicle(x, y) {
        if (!window.VehicleInteractionManager) return;
        
        const currentVehicle = VehicleInteractionManager.getCurrentVehicle();
        if (!currentVehicle) return;
        
        const vehicleDef = ElementInteractionManager.getElementDefinition(currentVehicle.type);
        if (!vehicleDef) return;
        
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas ? canvas.getContext('2d') : null;
        if (!ctx) return;
        
        const TILE_SIZE = window.TILE_SIZE || 32;
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
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
    }
    
    async function drawFarmPlots() {
        if (!window.gameState || !gameState.farmPlots || gameState.farmPlots.length === 0) return;
        
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas ? canvas.getContext('2d') : null;
        if (!ctx) return;
        
        const TILE_SIZE = window.TILE_SIZE || 32;
        
        const FARM_SVGS = {
            'dirt': 'assets/map/elements/farm-dirt.svg',
            'sprout': 'assets/map/elements/farm-sprout.svg',
            'grown': 'assets/map/elements/farm-grown.svg'
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
    window.drawMegaObjects = drawMegaObjects;
    window.drawBuiltElements = drawBuiltElements;
    window.drawCharacterVehicle = drawCharacterVehicle;
    window.drawFarmPlots = drawFarmPlots;
    
    console.log('[ElementRenderer] Module loaded');
})();
