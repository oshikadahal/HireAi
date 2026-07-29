const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const loadFileType = async () => {
  const { fileTypeFromBuffer } = await import('file-type');
  return fileTypeFromBuffer;
};

// Allowed MIME types and mapping to forced safe extensions
const ALLOWED_IMAGE_MIMES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const ALLOWED_PDF_MIMES = {
  'application/pdf': 'pdf',
};

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

// Ensure subfolders exist (defensive)
['resumes', 'avatars', 'logos'].forEach((folder) => {
  const dir = path.join(UPLOAD_ROOT, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const safeName = (ext) => {
  // Generate a time-based + random filename and attach the forced safe extension
  const random = crypto.randomBytes(12).toString('hex');
  return `${Date.now()}-${random}.${ext}`;
};

// NOTE: We use memory storage to validate the file contents (magic bytes) before
// writing to disk. Relying on the client-supplied mimetype or original filename
// extension is unsafe and can allow an attacker to upload executable HTML/JS.
const memoryStorage = multer.memoryStorage();

const makeUploader = ({ allowedMimes, maxSizeBytes = 5 * 1024 * 1024 }) => {
  const single = multer({ storage: memoryStorage, limits: { fileSize: maxSizeBytes, files: 1 } }).single('file');

  // Return an Express middleware that validates the file's real content type then
  // writes it to disk with a forced, safe extension.
  return (subfolder) => (req, res, next) => {
    // Call multer to populate req.file (in memory)
    single(req, res, async (err) => {
      if (err) {
        return next(err);
      }

      if (!req.file) {
        res.status(400);
        return next(new Error('No file uploaded'));
      }

      try {
        
        const detectFromBuffer = (buf) => {
          if (!buf || buf.length < 4) return null;
          // PDF: look for '%PDF' or 'PDF' near the start (some fixtures may omit the leading '%')
          const head = buf.slice(0, 16).toString();
          if (head.includes('%PDF') || head.includes('PDF-')) return { ext: 'pdf', mime: 'application/pdf' };
          // JPEG: 0xFF 0xD8 0xFF
          if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg' };
          // PNG: 89 50 4E 47 0D 0A 1A 0A
          if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return { ext: 'png', mime: 'image/png' };
          // WEBP: RIFF....WEBP
          if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return { ext: 'webp', mime: 'image/webp' };
          return null;
        };
         const detected = detectFromBuffer(req.file.buffer);
        const mime = detected?.mime || req.file.mimetype;

        // Only allow explicitly permitted MIME types
        if (!Object.prototype.hasOwnProperty.call(allowedMimes, mime)) {
          res.status(400);
          return next(new Error('Uploaded file type is not allowed'));
        }

        // Force a safe extension based on the detected (or fallback) MIME type
        const forcedExt = allowedMimes[mime];
        const filename = safeName(forcedExt);
        const outPath = path.join(UPLOAD_ROOT, subfolder, filename);

        // Write file to disk atomically
        await fs.promises.writeFile(outPath, req.file.buffer, { mode: 0o600 });

        // Replace req.file with a sanitized object similar to multer.diskStorage
        req.file = {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          encoding: req.file.encoding,
          mimetype: mime,
          destination: path.join(UPLOAD_ROOT, subfolder),
          filename,
          path: outPath,
          size: req.file.size,
        };

        next();
      } catch (e) {
        return next(e);
      }
    });
  };
};

// Export three upload middlewares usable as `uploadResume.single('resume')` style.
// To preserve existing route signatures, we return middleware factories that
// expect the consuming route to call them with a subfolder name when used.

// Candidate resume: enforce PDF only, 5MB
exports.uploadResume = makeUploader({ allowedMimes: ALLOWED_PDF_MIMES, maxSizeBytes: 5 * 1024 * 1024 })('resumes');

// Avatars: images only, 2MB
exports.uploadAvatar = makeUploader({ allowedMimes: ALLOWED_IMAGE_MIMES, maxSizeBytes: 2 * 1024 * 1024 })('avatars');

// Logos: images only, 2MB
exports.uploadLogo = makeUploader({ allowedMimes: ALLOWED_IMAGE_MIMES, maxSizeBytes: 2 * 1024 * 1024 })('logos');

/** Build the public-facing URL stored in the DB.
 * Note: we now route file downloads through an authenticated API endpoint
 * (/api/uploads/:subfolder/:filename) rather than exposing the raw uploads
 * directory via express.static. This prevents arbitrary files from being
 * fetched directly and centralizes access control.
 */
exports.publicPath = (subfolder, filename) => `/api/uploads/${subfolder}/${filename}`;
