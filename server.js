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

// Simple image processing
app.post('/process-image', upload.single('image'), (req, res) => {
  console.log('Image received:', req.file ? req.file.filename : 'No file');
  
  res.json({
    layers: [
      { name: 'background' },
      { name: 'face' }, 
      { name: 'hair' },
      { name: 'body' }
    ],
    riggedModel: {
      bones: [{ name: 'head' }, { name: 'neck' }],
      animations: ['idle', 'blink', 'head_turn']
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
