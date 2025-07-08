import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer memory storage setup
const upload = multer({ storage: multer.memoryStorage() });

// Serve the form HTML at /file
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'FileMetadata.html'));
});

// Handle file upload and return metadata
router.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const file = req.file;

  res.json({
    name: file.originalname,
    type: file.mimetype,
    size: file.size,
  });
});

export default router;
