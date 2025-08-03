const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'https://autorig-frontend-xyz.vercel.app', // Your actual Vercel URL
    'http://localhost:3000',
    /\.vercel\.app$/
  ],
  credentials: true
}));
app.use(express.json());

// File upload configuration
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'AutoRig Backend API Running' });
});

// Image processing route
app.post('/process-image', upload.single('image'), async (req, res) => {
  try {
    console.log('Processing image:', req.file.filename);
    
    // Mock result for now
    const mockResult = {
      layers: [
        { name: 'background', url: '/mock/background.png' },
        { name: 'face', url: '/mock/face.png' },
        { name: 'hair', url: '/mock/hair.png' },
        { name: 'body', url: '/mock/body.png' }
      ],
      riggedModel: {
        meshes: [],
        bones: [],
        animations: ['idle', 'blink', 'head_turn']
      }
    };
    
    res.json(mockResult);
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

app.listen(PORT, () => {
  console.log(`AutoRig Backend running on port ${PORT}`);

});
