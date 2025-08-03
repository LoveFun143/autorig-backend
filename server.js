const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 AutoRig Backend v3.0 - Multi-AI Processing');

// Simple CORS - allow all origins
app.use(cors());
app.use(express.json());

// Simple file upload
const upload = multer({ dest: 'uploads/' });

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'AutoRig Backend API Running' });
});

// Multi-AI image processing
app.post('/process-image', upload.single('image'), async (req, res) => {
  try {
    console.log('=== Starting Multi-AI Processing ===');
    console.log('File received:', req.file ? req.file.filename : 'NO FILE');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if ImageProcessor exists
    let processor;
    try {
      const ImageProcessor = require('./services/ImageProcessor');
      processor = new ImageProcessor();
      console.log('✅ ImageProcessor loaded successfully');
    } catch (error) {
      console.log('⚠️ ImageProcessor not available, using fallback');
      // Use simple analysis
      return res.json({
        layers: [
          { name: 'background', confidence: 0.85 },
          { name: 'face', confidence: 0.90 }, 
          { name: 'hair', confidence: 0.80 },
          { name: 'body', confidence: 0.88 },
          { name: 'clothing', confidence: 0.75 }
        ],
        riggedModel: {
          bones: [
            { name: 'head', position: [0, 1, 0] }, 
            { name: 'neck', position: [0, 0.8, 0] },
            { name: 'spine', position: [0, 0.5, 0] },
            { name: 'left_eye', position: [-0.1, 0.95, 0] },
            { name: 'right_eye', position: [0.1, 0.95, 0] },
            { name: 'jaw', position: [0, 0.9, 0] },
            { name: 'root', positio
