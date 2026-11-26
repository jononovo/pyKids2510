(function() {
    'use strict';

    function findElementAt(x, y, sections) {
        const element = ElementInteractionManager.getElementAt(x, y);
        return element && (!sections || sections.includes(element.section)) ? element : null;
    }

    function findVehicleAt(x, y) {
        const vehicle = VehicleInteractionManager.getVehicleAt(x, y);
        return vehicle && vehicle !== VehicleInteractionManager.getCurrentVehicle() ? vehicle : null;
    }

    function nameAt(x, y) {
        const thing = findElementAt(x, y) || findVehicleAt(x, y);
        if (thing) return thing.type;
        const row = gameState.mapData[y];
        const tile = row ? window.tileDataById[row[x]] : null;
        return tile ? tile.name : null;
    }

    function findNearest(name, fromX, fromY) {
        let nearest = null;
        for (let y = 0; y < gameState.mapHeight; y++) {
            for (let x = 0; x < gameState.mapWidth; x++) {
                const steps = Math.abs(x - fromX) + Math.abs(y - fromY);
                if ((!nearest || steps < nearest.steps) && nameAt(x, y) === name) nearest = { x: x, y: y, steps: steps };
            }
        }
        return nearest ? { x: nearest.x, y: nearest.y } : null;
    }

    window.TileContents = {
        findElementAt: findElementAt,
        findVehicleAt: findVehicleAt,
        nameAt: nameAt,
        findNearest: findNearest
    };
})();
