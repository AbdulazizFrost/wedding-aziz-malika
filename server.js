const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'wishes.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

const server = http.createServer((req, res) => {
    // CORS headers for local testing
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // API Routes
    if (req.url === '/api/wishes') {
        if (req.method === 'GET') {
            fs.readFile(DB_FILE, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Server error' }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                // We parse and stringify to ensure it's valid JSON, and sort by createdAt DESC
                try {
                    let wishes = JSON.parse(data);
                    wishes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    res.end(JSON.stringify(wishes));
                } catch (e) {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Data parsing error' }));
                }
            });
            return;
        }

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                try {
                    const payload = JSON.parse(body);
                    
                    if (!payload.name || !payload.message) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ error: 'Name and message are required' }));
                        return;
                    }

                    // Simple sanitization
                    const name = payload.name.substring(0, 50).trim();
                    const message = payload.message.substring(0, 500).trim();

                    if (!name || !message) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ error: 'Fields cannot be empty' }));
                        return;
                    }

                    fs.readFile(DB_FILE, 'utf8', (err, data) => {
                        let wishes = [];
                        if (!err && data) {
                            try { wishes = JSON.parse(data); } catch (e) {}
                        }

                        const newWish = {
                            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                            name: name,
                            message: message,
                            createdAt: new Date().toISOString()
                        };

                        wishes.push(newWish);

                        fs.writeFile(DB_FILE, JSON.stringify(wishes, null, 2), (err) => {
                            if (err) {
                                res.writeHead(500);
                                res.end(JSON.stringify({ error: 'Failed to save wish' }));
                                return;
                            }
                            res.writeHead(201, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(newWish));
                        });
                    });
                } catch (e) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
                }
            });
            return;
        }
    }

    // Static File Serving
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`API endpoint available at http://localhost:${PORT}/api/wishes`);
});
