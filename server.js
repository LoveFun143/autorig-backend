const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 AutoRig Backend v2.0 - Simple Processing');

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

    // Use new ImageProcessor
    const ImageProcessor = require('./services/ImageProcessor');
    const processor = new ImageProcessor();
    
    // Real multi-AI analysis
    const segmentationResult = await processor.segmentImage(req.file.path);
    
    // Generate dynamic rig
    const riggedModel = await processor.generateRig(segmentationResult.segments);
    
    // Return real results
    const result = {
      layers: segmentationResult.segments.map(segment => ({
        name: segment.label,
        confidence: segment.confidence
      })),
      riggedModel: riggedModel,
      processingInfo: {
        aiUsed: segmentationResult.aiUsed,
        fallback: segmentationResult.fallback,
        detectedFeatures: segmentationResult.analysisDetails
      }
    };
    
    console.log('✅ Multi-AI processing complete!');
    console.log('Segments found:', segmentationResult.segments.length);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Multi-AI Processing Error:', error.message);
    res.status(500).json({ 
      error: 'Processing failed: ' + error.message
    });
  }
});
  
  // Enhanced mock results
  res.json({
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
        { name: 'root', position: [0, 0, 0] }
      ],
      animations: ['idle', 'blink', 'head_turn', 'smile'],
      quality: 'high'
    },
    processingInfo: {
      aiUsed: false,
      processingTime: 1000,
      version: 'v2.0-enhanced'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

