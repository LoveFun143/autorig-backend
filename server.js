const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.json({ message: 'AutoRig Backend API Running' });
});

app.post('/process-image', upload.single('image'), (req, res) => {
  console.log('Image received:', req.file ? req.file.filename : 'No file');
  
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
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
