/* 
QR Code Generator Web Application
- Serves a modern web interface for QR code generation
- Uses qr-image npm package to generate QR codes
- Saves URLs to a text file for history
*/
import express from 'express';
import qr from 'qr-image';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to generate QR code
app.post('/generate-qr', (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const qrFileName = `qr_${timestamp}.png`;
        const qrPath = path.join(__dirname, 'public', qrFileName);

        // Generate QR code
        const qr_png = qr.image(url, { type: 'png', size: 10 });
        const writeStream = fs.createWriteStream(qrPath);
        
        qr_png.pipe(writeStream);

        writeStream.on('finish', () => {
            // Save URL to history file
            const urlEntry = `${new Date().toISOString()} - ${url}\n`;
            fs.appendFile('URL.txt', urlEntry, (err) => {
                if (err) {
                    console.error('Error saving URL to history:', err);
                }
            });

            // Clean up old QR files (keep only last 10)
            cleanupOldQRFiles();

            res.json({ 
                success: true, 
                qrCodePath: `/${qrFileName}`,
                url: url 
            });
        });

        writeStream.on('error', (error) => {
            console.error('Error generating QR code:', error);
            res.status(500).json({ error: 'Failed to generate QR code' });
        });

    } catch (error) {
        console.error('Error in /generate-qr endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Function to clean up old QR files
function cleanupOldQRFiles() {
    const publicDir = path.join(__dirname, 'public');
    fs.readdir(publicDir, (err, files) => {
        if (err) return;
        
        const qrFiles = files
            .filter(file => file.startsWith('qr_') && file.endsWith('.png'))
            .map(file => ({
                name: file,
                path: path.join(publicDir, file),
                time: fs.statSync(path.join(publicDir, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);

        // Keep only the 10 most recent QR files
        if (qrFiles.length > 10) {
            const filesToDelete = qrFiles.slice(10);
            filesToDelete.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error('Error deleting old QR file:', err);
                });
            });
        }
    });
}

// Start server
app.listen(PORT, () => {
    console.log(` QR Code Generator server running on http://localhost:${PORT}`);
    console.log(` Open your browser and navigate to the URL above to start generating QR codes!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n Shutting down QR Code Generator server...');
    process.exit(0);
});