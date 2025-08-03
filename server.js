const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('👤 AutoRig Backend v4.0 - Face Detection AI');

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.json({ message: 'AutoRig Backend API Running' });
});

app.post('/process-image', upload.single('image'), async (req, res) => {
  try {
    console.log('=== Starting Face Detection Processing ===');
    console.log('File received:', req.file ? req.file.filename : 'NO FILE');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Use Face Detection ImageProcessor
    const ImageProcessor = require('./services/ImageProcessor');
    const processor = new ImageProcessor();
    
    console.log('🔄 Starting face detection analysis...');
    const segmentationResult = await processor.segmentImage(req.file.path);
    
    console.log('🔄 Generating rig...');
    const riggedModel = await processor.generateRig(segmentationResult.segments);
    
    const result = {
      layers: segmentationResult.segments.map(segment => ({
        name: segment.label,
        confidence: segment.confidence
      })),
      riggedModel: riggedModel,
      processingInfo: {
        aiUsed: segmentationResult.aiUsed,
        fallback: segmentationResult.fallback || false,
        faceDetection: segmentationResult.faceDetection
      }
    };
    
    console.log('✅ Face detection processing complete!');
    console.log('Segments found:', segmentationResult.segments.length);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Face Detection Error:', error.message);
    res.status(500).json({ 
      error: 'Processing failed: ' + error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
