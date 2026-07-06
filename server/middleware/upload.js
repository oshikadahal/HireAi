const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

// Ensure subfolders exist (defensive — they're also committed with .gitkeep)
['resumes', 'avatars', 'logos'].forEach((folder) => {
  const dir = path.join(UPLOAD_ROOT, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const safeName = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  const random = crypto.randomBytes(12).toString('hex');
  return `${Date.now()}-${random}${ext}`;
};

const makeStorage = (subfolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(UPLOAD_ROOT, subfolder)),
    filename: (req, file, cb) => cb(null, safeName(file.originalname)),
  });

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') return cb(null, true);
  cb(new Error('Only PDF files are allowed for resumes'));
};

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Only JPG, PNG, or WEBP images are allowed'));
};

exports.uploadResume = multer({
  storage: makeStorage('resumes'),
  fileFilter: pdfFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

exports.uploadAvatar = multer({
  storage: makeStorage('avatars'),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

exports.uploadLogo = multer({
  storage: makeStorage('logos'),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

/** Build the public-facing relative URL stored in the DB, e.g. /uploads/resumes/xxx.pdf */
exports.publicPath = (subfolder, filename) => `/uploads/${subfolder}/${filename}`;
