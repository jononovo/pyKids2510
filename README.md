# Python Learning Platform

This project is an interactive Python programming education platform that combines a tile-based game engine with a real-time code execution environment. The system consists of a web-based framework built with vanilla JavaScript and HTML5 Canvas that renders a 2D game world where learners control a character through Python commands.

## Documentation

- **[Map Creation Technical Guide](docs/map-creation-guide.md)** - Comprehensive guide for creating tile-based and graphic maps
- **[Map Quick Reference](docs/map-quick-reference.md)** - Fast lookup templates and common patterns

## Architecture Overview

The architecture features a markdown-based lesson authoring system that defines instructional content, starter code, and tile-map layouts, which are dynamically parsed to generate progressive coding challenges. The integrated CodeJar editor provides syntax-highlighted Python editing with custom parsing logic that translates player commands (move_forward, turn_left, turn_right) into animated character movements on a 32x32 pixel tile grid.

## Features

The platform implements several sophisticated features including:
- Sprite sheet animation support (6x2 grid format with idle and walking states)
- Intermittent idle animations with pause phases
- Procedural sound generation using Web Audio API
- Multi-level progression system with visual completion indicators
- SVG-based tile rendering with modular components
- Graphic background maps with tile overlays
- Blockly visual coding integration

## Technical Stack

The technical stack prioritizes client-side execution without external dependencies beyond CodeJar for editing, making it deployable as a standalone HTML file.

## Content Creation

The modular design separates the game framework from educational content, allowing instructors to create custom lessons through markdown files that define objectives, challenges, and game maps while maintaining consistent game mechanics and visual presentation. The system supports both default character rendering and custom sprite loading, with automatic frame cycling for movement animations and scale adjustments for optimal visibility on the game canvas.

## Map System

The platform now features two map rendering modes:
1. **Tile-based maps** - Traditional grid system with reusable SVG tiles
2. **Graphic maps** - Full background images with transparent tile overlays

A complete modular tile system includes beach/water transitions, allowing creation of islands, lakes, and complex water features.

## Original Inspiration

The platform is inspired by the original game at codingforkids.io, reimplemented with enhanced features and modularity.