const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const FileType = require('file-type');

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
      if (err) return next(err);

      if (!req.file) {
        res.status(400);
        return next(new Error('No file uploaded'));
      }

      try {
        // Detect file type from the buffer (inspects magic bytes) — authoritative
        const detected = await FileType.fromBuffer(req.file.buffer);

        // Some file types (like PDFs) may not be detected by file-type; fall back to
        // the original mimetype only if detection failed.
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
