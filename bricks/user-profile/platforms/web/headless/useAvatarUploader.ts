/**
 * Headless Avatar Crop & Upload Controller (`bricks/user-profile/platforms/web/headless/useAvatarUploader.ts`)
 *
 * Extracted from `../SnapCal/apps/web/src/components/settings/AvatarUpload.jsx` and `AvatarCropModal.jsx`.
 * Provides pure 1:1 square crop geometry (`computeMinScale`, `clampCropOffset`, `computeSourceCropRect`)
 * and avatar initial fallback logic with zero brand dependencies.
 */

export function computeAvatarInitial(displayNameOrEmail = '', { syntheticEmailDomain = '@facebook.app.local' } = {}) {
  const name = String(displayNameOrEmail || '').trim();
  const suffix = syntheticEmailDomain.startsWith('@')
    ? syntheticEmailDomain.toLowerCase()
    : `@${syntheticEmailDomain.toLowerCase()}`;
  if (
    !name ||
    name.toLowerCase().endsWith(suffix) ||
    /^[^@]+@facebook\.[a-z0-9.-]+$/i.test(name) ||
    name.toLowerCase().endsWith('@privaterelay.appleid.com')
  ) {
    return 'U';
  }
  return name.charAt(0).toUpperCase() || '?';
}

export function computeMinCropScale(imgWidth, imgHeight, frameSize) {
  if (!imgWidth || !imgHeight || !frameSize) return 1;
  return Math.max(frameSize / imgWidth, frameSize / imgHeight);
}

export function clampCropOffset({ x, y, imgWidth, imgHeight, scale, frameSize }) {
  if (!imgWidth || !imgHeight || !frameSize) return { x: 0, y: 0 };
  const displayedW = imgWidth * scale;
  const displayedH = imgHeight * scale;
  const maxX = Math.max(0, (displayedW - frameSize) / 2);
  const maxY = Math.max(0, (displayedH - frameSize) / 2);
  return {
    x: Math.max(-maxX, Math.min(maxX, x)) || 0,
    y: Math.max(-maxY, Math.min(maxY, y)) || 0,
  };
}

export function computeSourceCropRect({ imgWidth, imgHeight, scale, offsetX, offsetY, frameSize, outputSize = 512 }) {
  const displayedW = imgWidth * scale;
  const displayedH = imgHeight * scale;
  const srcSize = frameSize / scale;
  const srcX = ((displayedW - frameSize) / 2 - offsetX) / scale;
  const srcY = ((displayedH - frameSize) / 2 - offsetY) / scale;
  return {
    sx: srcX,
    sy: srcY,
    sWidth: srcSize,
    sHeight: srcSize,
    dx: 0,
    dy: 0,
    dWidth: outputSize,
    dHeight: outputSize,
  };
}
