const Notification = require('../models/Notification');

/**
 * Creates a notification document. Never throws — a notification failing
 * to save should never break the primary action (applying, scheduling, etc.)
 */
async function notify({ user, title, message, type = 'system', link = '' }) {
  try {
    return await Notification.create({ user, title, message, type, link });
  } catch (err) {
    console.error('Notification create failed (non-fatal):', err.message);
    return null;
  }
}

module.exports = notify;
