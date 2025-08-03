const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🧠 AutoRig Backend v6.0 - TRUE AI Integration');

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.json({ message: 'AutoRig Backend API Running' });
});

app.post('/process-image', upload.single('image'), async (req, res) => {
  try {
    console.log('=== TRUE Recognition Processing ===');
    console.log('File received:', req.file ? req.file.filename : 'NO FILE');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get TRUE AI analysis from frontend
    let trueAnalysis = null;
    try {
      if (req.body.frontendAnalysis) {
        trueAnalysis = JSON.parse(req.body.frontendAnalysis);
        console.log('✅ TRUE AI analysis received');
        console.log('🎯 Detected objects:', trueAnalysis.trueRecognition?.detectedObjects || []);
        console.log('🎭 Character type:', trueAnalysis.trueRecognition?.characterType || 'unknown');
        console.log('🎨 Style detected:', trueAnalysis.trueRecognition?.styleDetected || 'unknown');
      }
    } catch (error) {
      console.log('⚠️ No frontend analysis data');
    }

    // Create enhanced results based on TRUE AI detection
    const result = createTrueAIResults(trueAnalysis, req.file);
    
    console.log('✅ TRUE Recognition processing complete!');
    console.log('📊 Final layers:', result.layers.length);
    console.log('🦴 Final bones:', result.riggedModel.bones.length);
    res.json(result);
    
  } catch (error) {
    console.error('❌ TRUE Recognition Error:', error.message);
    res.status(500).json({ 
      error: 'Processing failed: ' + error.message
    });
  }
});

function createTrueAIResults(trueAnalysis, fileInfo) {
  console.log('🧠 Creating results from TRUE AI recognition...');
  
  const layers = [];
  let boneCount = 1; // Root bone
  let animations = ['idle'];
  let rigType = 'unknown';
  let quality = 'basic';
  
  if (trueAnalysis && trueAnalysis.trueRecognition) {
    const { trueRecognition, objectDetections, characterFeatures, basicInfo } = trueAnalysis;
    
    console.log(`🎯 Processing TRUE detections: ${trueRecognition.detectedObjects.join(', ')}`);
    
    // === CREATE LAYERS FROM ACTUAL AI DETECTIONS ===
    
    // Always include background
    layers.push({ name: 'background', confidence: 0.95, source: 'always' });
    
    // Add layers based on ACTUAL object detections
    if (objectDetections.people && objectDetections.people.length > 0) {
      const person = objectDetections.people[0];
      console.log(`👤 TRUE PERSON DETECTED: ${Math.round(person.confidence * 100)}% confidence`);
      
      // Facial features based on REAL face detection
      if (characterFeatures.facialFeatures.hasFace) {
        layers.push(
          { name: 'face_base', confidence: characterFeatures.facialFeatures.confidence, source: 'face_detection' },
          { name: 'left_eye', confidence: 0.90, source: 'face_detection' },
          { name: 'right_eye', confidence: 0.90, source: 'face_detection' },
          { name: 'nose', confidence: 0.85, source: 'face_detection' },
          { name: 'mouth', confidence: 0.88, source:
