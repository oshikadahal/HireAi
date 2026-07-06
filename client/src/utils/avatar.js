import { fileUrl } from '../services/api.js';

// Re-exported so pages can import both helpers from one place: '../../utils/avatar.js'
export { fileUrl };

/**
 * Returns a usable avatar/logo URL: the uploaded file if present,
 * otherwise a generated initials avatar (no copyrighted imagery involved).
 */
export const avatarFor = (uploadedPath, name = 'User', bg = '5B5BF6') => {
  if (uploadedPath) return fileUrl(uploadedPath);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&bold=true`;
};
