const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

function isAllowedImage(req, file, cb) {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'));
    return;
  }

  cb(null, true);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase() || '.bin';
    cb(null, `${crypto.randomUUID()}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: isAllowedImage
});

function createApp() {
  const app = express();

  app.use('/uploads', express.static(uploadDir));

  app.post('/images', upload.single('image'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'An image file is required' });
      return;
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.status(201).json({
      url: `${baseUrl}/uploads/${req.file.filename}`
    });
  });

  app.use((error, _req, res, _next) => {
    if (error instanceof multer.MulterError) {
      res.status(400).json({ error: 'Invalid image upload request' });
      return;
    }

    res.status(500).json({ error: 'Unexpected server error' });
  });

  return app;
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  createApp().listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = { createApp };
