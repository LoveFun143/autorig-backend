const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('👤 AutoRig Backend v5.0 - Frontend + Backend Analysis');

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.json({ message: 'AutoRig Backend API Running' });
});

app.post('/process-image', upload.single('image'), async (req, res) => {
  try {
    console.log('=== Starting Enhanced Processing ===');
    console.log('File received:', req.file ? req.file.filename : 'NO FILE');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get frontend analysis data
    let frontendAnalysis = null;
    try {
      if (req.body.frontendAnalysis) {
        frontendAnalysis = JSON.parse(req.body.frontendAnalysis);
        console.log('✅ Frontend analysis received:', frontendAnalysis.basicInfo);
      }
    } catch (error) {
      console.log('⚠️ No frontend analysis data, using backend only');
    }

    // Create enhanced segmentation based on frontend analysis
    const result = createEnhancedSegmentation(frontendAnalysis, req.file);
    
    console.log('✅ Enhanced processing complete!');
    console.log('Segments found:', result.layers.length);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Enhanced Processing Error:', error.message);
    res.status(500).json({ 
      error: 'Processing failed: ' + error.message
    });
  }
});

function createEnhancedSegmentation(frontendAnalysis, fileInfo) {
  console.log('🔄 Creating enhanced segmentation with real analysis...');
  
  const layers = [];
  let boneCount = 1; // Start with root
  const animations = ['idle'];
  
  // Always include background
  layers.push({ name: 'background', confidence: 0.95 });
  
  if (frontendAnalysis) {
    const { basicInfo, colorAnalysis, complexityScore, shapeDetection, styleClassification, detailLevel } = frontendAnalysis;
    
    console.log(`📊 Analyzing ${basicInfo.width}×${basicInfo.height} ${detailLevel.level} image`);
    
    // === FACIAL FEATURES based on shape detection ===
    if (shapeDetection.circularRegions > 0) {
      layers.push({ name: 'face_base', confidence: 0.90 });
      layers.push({ name: 'left_eye', confidence: 0.85 });
      layers.push({ name: 'right_eye', confidence: 0.85 });
      layers.push({ name: 'nose', confidence: 0.80 });
      layers.push({ name: 'mouth', confidence: 0.85 });
      boneCount += 8; // facial bones
      animations.push('blink', 'smile', 'head_turn');
    }
    
    // === TRIANGULAR FEATURES (ears, hair points) ===
    if (shapeDetection.triangularRegions > 50) {
      console.log(`🔺 High triangular activity (${shapeDetection.triangularRegions}) - adding detailed features`);
      
      if (shapeDetection.triangularRegions > 100) {
        // Very high triangular activity - likely anime with pointed features
        layers.push({ name: 'cat_ears', confidence: 0.75 });
        layers.push({ name: 'hair_spikes', confidence: 0.70 });
        boneCount += 4;
        animations.push('ear_twitch');
      }
      
      layers.push({ name: 'hair_front', confidence: 0.85 });
      layers.push({ name: 'hair_back', confidence: 0.80 });
      boneCount += 3;
    }
    
    // === CLOTHING based on complexity and image size ===
    if (basicInfo.isLargeImage || detailLevel.score > 3) {
      layers.push({ name: 'shirt', confidence: 0.85 });
      layers.push({ name: 'collar', confidence: 0.70 });
      
      if (basicInfo.totalPixels > 500000) {
        // High resolution - add detailed clothing
        layers.push({ name: 'jacket', confidence: 0.75 });
        layers.push({ name: 'sleeves', confidence: 0.80 });
        layers.push({ name: 'buttons', confidence: 0.65 });
        layers.push({ name: 'pockets', confidence: 0.60 });
      }
      
      if (basicInfo.aspectRatio < 0.8) {
        // Portrait ratio - likely full body
        layers.push({ name: 'pants', confidence: 0.80 });
        layers.push({ name: 'belt', confidence: 0.70 });
        layers.push({ name: 'shoes', confidence: 0.75 });
        boneCount += 10; // body bones
        animations.push('walk', 'wave');
      }
    }
    
    // === ACCESSORIES based on color complexity ===
    if (colorAnalysis.colorComplexity === 'high') {
      console.log('🎨 High color complexity - adding accessories');
      layers.push({ name: 'earrings', confidence: 0.65 });
      layers.push({ name: 'necklace', confidence: 0.60 });
      
      if (detailLevel.level === 'professional') {
        layers.push({ name: 'bracelet', confidence: 0.55 });
        layers.push({ name: 'ring', confidence: 0.50 });
        layers.push({ name: 'hair_accessory', confidence: 0.70 });
      }
    }
    
    // === STYLE-SPECIFIC FEATURES ===
    if (styleClassification.style === 'anime') {
      layers.push({ name: 'anime_eyes', confidence: 0.80 });
      layers.push({ name: 'blush', confidence: 0.60 });
      animations.push('wink', 'sparkle');
    } else if (styleClassification.style === 'realistic') {
      layers.push({ name: 'skin_texture', confidence: 0.85 });
      layers.push({ name: 'shadows', confidence: 0.75 });
      layers.push({ name: 'highlights', confidence: 0.70 });
    }
    
    // === DETAILED FEATURES for complex images ===
    if (detailLevel.score >= 5) {
      layers.push({ name: 'fine_details', confidence: 0.70 });
      layers.push({ name: 'texture_overlay', confidence: 0.65 });
      layers.push({ name: 'lighting_effects', confidence: 0.60 });
      boneCount += 5;
      animations.push('detailed_animation', 'micro_expressions');
    }
    
  } else {
    // Fallback if no frontend analysis
    console.log('⚠️ No frontend analysis - using basic segmentation');
    layers.push(
      { name: 'face', confidence: 0.80 },
      { name: 'hair', confidence: 0.75 },
      { name: 'body', confidence: 0.85 },
      { name: 'clothing', confidence: 0.70 }
    );
    boneCount = 10;
  }
  
  // Generate bones based on detected layers
  const bones = [];
  for (let i = 0; i < boneCount; i++) {
    bones.push({
      name: `bone_${i}`,
      position: [Math.random() - 0.5, Math.random(), 0]
    });
  }
  
  return {
    layers,
    riggedModel: {
      bones,
      animations,
      quality: layers.length > 15 ? 'professional' : layers.length > 10 ? 'high' : 'standard',
      rigType: 'character',
      analysisUsed: !!frontendAnalysis
    },
    processingInfo: {
      aiUsed: false,
      frontendAnalysisUsed: !!frontendAnalysis,
      totalLayers: layers.length,
      version: 'v5.0-enhanced'
    }
  };
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
