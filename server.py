#!/usr/bin/env python3
import http.server
import socketserver
from http.server import SimpleHTTPRequestHandler
import json
import os
import socket
from pathlib import Path

PORT = 5000

class NoCacheHTTPRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Handle sprites.json endpoint
        if self.path == '/sprites.json':
            self.send_sprites_json()
        # Handle collectibles.json endpoint
        elif self.path == '/collectibles.json':
            self.send_collectibles_json()
        # Handle API config endpoint
        elif self.path == '/api/config':
            self.send_api_config()
        # Handle markdown files list endpoint
        elif self.path == '/markdown-files.json':
            self.send_markdown_files_json()
        else:
            # Default file serving
            super().do_GET()
    
    def send_sprites_json(self):
        """Return JSON array of PNG files in assets/sprites/ folder"""
        sprites_dir = Path('assets/sprites')
        sprites = []
        
        if sprites_dir.exists() and sprites_dir.is_dir():
            # Get all PNG files in the sprites directory
            for file in sprites_dir.glob('*.png'):
                sprites.append({
                    'name': file.stem.replace('_', ' ').title(),  # Pretty name
                    'file': file.name,  # Filename
                    'path': f'/assets/sprites/{file.name}'  # Full path
                })
        
        # Sort sprites alphabetically
        sprites.sort(key=lambda x: x['name'])
        
        # Send JSON response
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(sprites).encode())
    
    def send_collectibles_json(self):
        """Return JSON object mapping collectible types to SVG paths"""
        elements_dir = Path('assets/map/elements')
        collectibles = {}
        
        if elements_dir.exists() and elements_dir.is_dir():
            # Get all SVG files in the elements directory
            for file in elements_dir.glob('*.svg'):
                # Use the filename (without extension) as the collectible type key
                collectible_type = file.stem.replace('collectible-', '').replace('-', '_')
                collectibles[collectible_type] = f'assets/map/elements/{file.name}'
        
        # Send JSON response
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(collectibles).encode())
    
    def send_api_config(self):
        """Send API configuration including OpenAI key to frontend"""
        api_key = os.environ.get('OPENAI_API_KEY', '')
        config = {
            'hasOpenAIKey': bool(api_key),
            'apiKey': api_key  # Send actual key for browser usage
        }
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(config).encode())
    
    def send_markdown_files_json(self):
        """Return JSON array of markdown files in assets/ folder"""
        assets_dir = Path('assets')
        markdown_files = []
        
        if assets_dir.exists() and assets_dir.is_dir():
            for file in assets_dir.glob('*.md'):
                markdown_files.append(file.name)
        
        markdown_files.sort()
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(markdown_files).encode())
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        print(f"[Server] {self.address_string()} - {format % args}")

if __name__ == "__main__":
    handler = NoCacheHTTPRequestHandler
    
    # Try to bind with SO_REUSEADDR to avoid "Address already in use" errors
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("0.0.0.0", PORT), handler) as httpd:
        print(f"Server running at http://0.0.0.0:{PORT}/")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            httpd.shutdown()