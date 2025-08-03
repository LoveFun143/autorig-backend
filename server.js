console.log('🚀 AutoRig Backend v2.0 - Real AI Processing');
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

// Simple CORS - allow all origins
app.use(cors());
app.use(express.json());

// Simple file upload
const upload = multer({ dest: 'uploads/' });

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'AutoRig Backend API Running' });
});

// Image processing route with real AI
app.post('/process-image', upload.single('image'), async (req, res) => {
  try {
    console.log('=== Starting Real AI Processing ===');
    console.log('File received:', req.file ? req.file.filename : 'NO FILE');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Import and use ImageProcessor
    const ImageProcessor = require('./services/ImageProcessor');
    const processor = new ImageProcessor();
    
    // Real AI segmentation
    const segmentationResult = await processor.segmentImage(req.file.path);
    
    // Generate rig from real segments
    const riggedModel = await processor.generateRig(segmentationResult.segments);
    
    // Return real results
    const result = {
      layers: segmentationResult.segments.map(segment => ({
        name: segment.label,
        confidence: segment.confidence,
        url: `/processed/${segment.label}.png`
      })),
      riggedModel: riggedModel,
      processingInfo: {
        aiUsed: segmentationResult.aiUsed,
        fallback: segmentationResult.fallback,
        processingTime: Date.now() - segmentationResult.processingTime
      }
    };
    
    console.log('✅ Real AI processing complete!');
    console.log('Segments found:', segmentationResult.segments.length);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Processing Error:', error.message);
    res.status(500).json({ 
      error: 'Processing failed: ' + error.message,
      fallback: true
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


