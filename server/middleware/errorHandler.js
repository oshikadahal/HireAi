/** Catches requests to routes that don't exist. */
exports.notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found — ${req.method} ${req.originalUrl}`));
};

/** Converts thrown errors (including Mongoose / Multer ones) into clean JSON. */
exports.errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;
  let message = err.message || 'Server error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format: ${err.value}`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    if (field === 'candidate' || (err.keyPattern && err.keyPattern.candidate && err.keyPattern.job)) {
      message = 'You have already applied to this job';
    } else {
      message = `That ${field} is already in use`;
    }
  }

  // Multer errors (file too large, wrong type)
  if (err.name === 'MulterError') {
    statusCode = 400;
  }

  if (statusCode === 500) {
    console.error('💥 Unhandled error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
