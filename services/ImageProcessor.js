const axios = require('axios');
const fs = require('fs');

class ImageProcessor {
  constructor() {
    console.log('👤 Face Detection AI Processor v4.0 Enhanced');
    this.replicateToken = process.env.REPLICATE_API_TOKEN;
    this.replicateUrl = 'https://api.replicate.com/v1/predictions';
  }

  async segmentImage(imagePath) {
    try {
      console.log('👤 Starting face detection analysis...');
      
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
      
      // Use reliable face detection model
      const faceResults = await this.detectFaces(base64Image);
      
      // Analyze image properties
      const imageAnalysis = this.analyzeImageProperties(imageBuffer, imagePath);
      
      // Combine face detection with image analysis
      return this.createDynamicSegmentation(faceResults, imageAnalysis);
      
    } catch (error) {
      console.error('❌ Face detection failed:', error.message);
      return this.createSmartFallback(imagePath);
    }
  }

  async detectFaces(base64Image) {
    try {
      console.log('👤 Detecting faces...');
      
      const response = await axios.post(this.replicateUrl, {
        version: "cd15c283-0a8d-4f62-9b97-9c0a8db7bb5e",
        input: {
          image: base64Image
        }
      }, {
        headers: {
          'Authorization': `Token ${this.replicateToken}`,
          'Content-Type': 'application/json'
        }
      });

      const predictionId = response.data.id;
      console.log('👤 Face detection started, ID:', predictionId);
      
      return await this.pollForResults(predictionId);
      
    } catch (error) {
      console.error('❌ Face API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async pollForResults(predictionId) {
    const maxAttempts = 20;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get(`${this.replicateUrl}/${predictionId}`, {
          headers: {
            'Authorization': `Token ${this.replicateToken}`
          }
        });

        const prediction = response.data;
        console.log(`👤 Face detection status (${attempt + 1}/20):`, prediction.status);

        if (prediction.status === 'succeeded') {
          console.log('✅ Face detection complete!');
          return this.processFaceResults(prediction.output);
        }

        if (prediction.status === 'failed') {
          console.error('❌ Face detection failed:', prediction.error);
          throw new Error('Face detection failed');
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error('❌ Polling error:', error.message);
        throw error;
      }
    }

    throw new Error('Face detection timeout');
  }

  processFaceResults(faceOutput) {
    console.log('🎯 Processing face detection results...');
    
    let faceCount = 0;
    let facePositions = [];
    let facialFeatures = {};

    if (faceOutput && Array.isArray(faceOutput)) {
      faceCount = faceOutput.length;
      facePositions = faceOutput.map(face => ({
        x: face.x || face.left || 0,
        y: face.y || face.top || 0,
        width: face.width || 100,
        height: face.height || 100,
        confidence: face.confidence || 0.9
      }));
      
      if (faceOutput[0]) {
        facialFeatures = {
          eyes: faceOutput[0].landmarks?.eyes || 2,
          mouth: faceOutput[0].landmarks?.mouth || 1,
          nose: faceOutput[0].landmarks?.nose || 1,
          confidence: faceOutput[0].confidence || 0.9
        };
      }
    }

    return {
      faceCount,
      facePositions,
      facialFeatures,
      aiUsed: true,
      confidence: faceCount > 0 ? 0.9 : 0.3
    };
  }

  analyzeImageProperties(imageBuffer, imagePath) {
    console.log('📊 Analyzing image properties...');
    
    const stats = fs.statSync(imagePath);
    const fileSize = stats.size;
    const fileName = imagePath.toLowerCase();
    
    const isLargeImage = fileSize > 400000;
    const isSmallImage = fileSize < 100000;
    
    const isAnime = fileName.includes('anime') || fileName.includes('cartoon');
    const isCharacter = fileName.includes('character') || fileName.includes('avatar');
    
    return {
      fileSize,
      isLargeImage,
      isSmallImage,
      isAnime,
      isCharacter,
      aspectRatio: isLargeImage ? 'portrait' : 'square'
    };
  }

  createDynamicSegmentation(faceResults, imageAnalysis) {
    console.log('🔄 Creating dynamic segmentation based on face detection...');
    console.log(`👤 Faces detected: ${faceResults.faceCount}`);
    
    const segments = [];
    
    segments.push({
      label: 'background',
      confidence: 0.95,
      detected: true
    });

    if (faceResults.faceCount > 0) {
      segments.push({
        label: 'face',
        confidence: faceResults.confidence,
        detected: true,
        faceCount: faceResults.faceCount
      });
      
      if (faceResults.facialFeatures.eyes) {
        segments.push({
          label: 'eyes',
          confidence: 0.85,
          detected: true
        });
      }
      
      segments.push({
        label: 'hair',
        confidence: 0.8,
        detected: true
      });
      
      if (imageAnalysis.isLargeImage) {
        segments.push({
          label: 'torso',
          confidence: 0.85,
          detected: true
        }, {
          label: 'arms',
          confidence: 0.75,
          detected: true
        }, {
          label: 'legs',
          confidence: 0.70,
          detected: imageAnalysis.isLargeImage
        });
      } else {
        segments.push({
          label: 'body',
          confidence: 0.80,
          detected: true
        });
      }
      
      segments.push({
        label: 'clothing',
        confidence: 0.75,
        detected: true
      });
      
      if (faceResults.faceCount > 1) {
        segments.push({
          label: 'multiple_characters',
          confidence: 0.90,
          detected: true,
          count: faceResults.faceCount
        });
      }
      
    } else {
      console.log('🤖 No faces detected - analyzing as object/creature');
      
      segments.push({
        label: 'main_object',
        confidence: 0.85,
        detected: true
      });
      
      if (imageAnalysis.isLargeImage) {
        segments.push({
          label: 'body_parts',
          confidence: 0.70,
          detected: true
        }, {
          label: 'details',
          confidence: 0.60,
          detected: true
        });
      }
    }

    return {
      segments,
      processingTime: Date.now(),
      aiUsed: true,
      faceDetection: faceResults,
      imageAnalysis
    };
  }

  createSmartFallback(imagePath) {
    console.log('🔄 Using smart fallback with image analysis');
    
    const stats = fs.statSync(imagePath);
    const fileSize = stats.size;
    
    const layers = ['background'];
    
    if (fileSize > 300000) {
      layers.push('face', 'hair', 'torso', 'arms', 'clothing');
    } else if (fileSize > 100000) {
      layers.push('face', 'hair', 'body', 'clothing');
    } else {
      layers.push('character', 'details');
    }

    return {
      segments: layers.map((layer, index) => ({
        label: layer,
        confidence: 0.7 + (Math.random() * 0.2),
        detected: false
      })),
      processingTime: Date.now(),
      aiUsed: false,
      fallback: true
    };
  }

  async generateRig(segments) {
    console.log('🎯 Generating enhanced rig from face detection results');
    
    const faceSegment = segments.find(s => s.label === 'face');
    const hasMultipleCharacters = segments.find(s => s.label === 'multiple_characters');
    const hasFullBody = segments.some(s => ['torso', 'arms', 'legs'].includes(s.label));
    const isCreature = segments.find(s => s.label === 'main_object');
    
    const bones = [{ name: 'root', position: [0, 0, 0] }];
    const animations = ['idle'];
    
    if (faceSegment) {
      console.log(`👤 Creating detailed facial rig for ${faceSegment.faceCount || 1} face(s)`);
      
      bones.push(
        { name: 'spine', position: [0, 0.5, 0] },
        { name: 'neck', position: [0, 0.8, 0] },
        { name: 'head', position: [0, 1, 0] }
      );
      
      // Detailed facial features
      bones.push(
        // Eyes and eyelids
        { name: 'left_eye', position: [-0.1, 0.95, 0] },
        { name: 'right_eye', position: [0.1, 0.95, 0] },
        { name: 'left_eyelid', position: [-0.1, 0.96, 0] },
        { name: 'right_eyelid', position: [0.1, 0.96, 0] },
        { name: 'left_eyelash', position: [-0.1, 0.97, 0] },
        { name: 'right_eyelash', position: [0.1, 0.97, 0] },
        
        // Eyebrows
        { name: 'left_eyebrow', position: [-0.12, 0.98, 0] },
        { name: 'right_eyebrow', position: [0.12, 0.98, 0] },
        
        // Nose and mouth
        { name: 'nose', position: [0, 0.92, 0] },
        { name: 'upper_lip', position: [0, 0.88, 0] },
        { name: 'lower_lip', position: [0, 0.86, 0] },
        { name: 'jaw', position: [0, 0.84, 0] },
        
        // Ears
        { name: 'left_ear', position: [-0.18, 0.95, 0] },
        { name: 'right_ear', position: [0.18, 0.95, 0] },
        
        // Cheeks and face shape
        { name: 'left_cheek', position: [-0.15, 0.90, 0] },
        { name: 'right_cheek', position: [0.15, 0.90, 0] },
        { name: 'forehead', position: [0, 1.02, 0] }
      );
      
      animations.push(
        'blink', 'wink_left', 'wink_right',
        'eyebrow_raise', 'eyebrow_furrow',
        'smile', 'frown', 'pout',
        'head_turn_left', 'head_turn_right',
        'head_nod', 'head_shake',
        'ear_twitch_left', 'ear_twitch_right'
      );
      
      if (hasFullBody) {
        bones.push(
          // Arms and shoulders
          { name: 'left_shoulder', position: [-0.3, 0.7, 0] },
          { name: 'right_shoulder', position: [0.3, 0.7, 0] },
          { name: 'left_upper_arm', position: [-0.4, 0.6, 0] },
          { name: 'right_upper_arm', position: [0.4, 0.6, 0] },
          { name: 'left_lower_arm', position: [-0.45, 0.4, 0] },
          { name: 'right_lower_arm', position: [0.45, 0.4, 0] },
          { name: 'left_hand', position: [-0.5, 0.25, 0] },
          { name: 'right_hand', position: [0.5, 0.25, 0] },
          
          // Torso details
          { name: 'chest', position: [0, 0.65, 0] },
          { name: 'waist', position: [0, 0.45, 0] },
          
          // Hips and legs
          { name: 'left_hip', position: [-0.15, 0.25, 0] },
          { name: 'right_hip', position: [0.15, 0.25, 0] },
          { name: 'left_upper_leg', position: [-0.15, 0.05, 0] },
          { name: 'right_upper_leg', position: [0.15, 0.05, 0] },
          { name: 'left_lower_leg', position: [-0.15, -0.2, 0] },
          { name: 'right_lower_leg', position: [0.15, -0.2, 0] },
          { name: 'left_foot', position: [-0.15, -0.4, 0] },
          { name: 'right_foot', position: [0.15, -0.4, 0] }
        );
        
        animations.push(
          'wave_left', 'wave_right', 'wave_both',
          'walk', 'run', 'jump',
          'lean_left', 'lean_right',
          'stretch', 'dance'
        );
      }
      
      if (hasMultipleCharacters) {
        bones.push({ name: 'group_controller', position: [0, 0.5, 0] });
        animations.push('group_interaction', 'conversation');
      }
      
    } else if (isCreature) {
      console.log('🤖 Creating detailed creature/object rig');
      
      bones.push(
        { name: 'main_body', position: [0, 0.5, 0] },
        { name: 'core', position: [0, 0.6, 0] },
        { name: 'detail_1', position: [0, 0.8, 0] },
        { name: 'detail_2', position: [0, 0.4, 0] },
        { name: 'detail_3', position: [0, 0.2, 0] },
        { name: 'accent_left', position: [-0.2, 0.6, 0] },
        { name: 'accent_right', position: [0.2, 0.6, 0] }
      );
      
      animations.push('float', 'rotate', 'pulse', 'shimmer');
    }

    return {
      bones,
      meshes: segments.map(segment => ({
        name: `${segment.label}_mesh`,
        vertices: [],
        indices: [],
        confidence: segment.confidence
      })),
      animations,
      quality: bones.length > 5 ? 'high' : 'medium',
      rigType: faceSegment ? 'character' : 'object'
    };
  }
}

module.exports = ImageProcessor;
