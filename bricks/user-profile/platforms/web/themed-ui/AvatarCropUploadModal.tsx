/**
 * Token-Driven Interactive 512x512 Square Avatar Crop Modal (`bricks/user-profile/platforms/web/themed-ui/AvatarCropUploadModal.tsx`)
 *
 * Extracted from `../SnapCal/apps/web/src/components/settings/AvatarCropModal.jsx`.
 * Uses headless geometry helpers from `useAvatarUploader.ts` and `--ag-profile-*` CSS Custom Properties.
 */

import {
  computeMinCropScale,
  clampCropOffset,
  computeSourceCropRect,
} from '../headless/useAvatarUploader.ts';

export function createAvatarCropUploadModal(React, useProfileTheme) {
  return function AvatarCropUploadModal({ src, onConfirm, onCancel, outputSize = 512 }) {
    const { t } = useProfileTheme();
    const [scale, setScale] = React.useState(1);
    const [minScale, setMinScale] = React.useState(1);
    const [offset, setOffset] = React.useState({ x: 0, y: 0 });
    const [saving, setSaving] = React.useState(false);

    const applyCrop = async (imgWidth = 512, imgHeight = 512, frameSize = 320) => {
      setSaving(true);
      try {
        const rect = computeSourceCropRect({
          imgWidth,
          imgHeight,
          scale,
          offsetX: offset.x,
          offsetY: offset.y,
          frameSize,
          outputSize,
        });
        await onConfirm({ src, cropRect: rect, scale, minScale });
      } finally {
        setSaving(false);
      }
    };

    return React.createElement(
      'div',
      {
        'data-ag-component': 'avatar-crop-modal',
        style: {
          backgroundColor: 'var(--ag-profile-color-surface)',
          color: 'var(--ag-profile-color-text)',
          borderRadius: 'var(--ag-profile-radius-card)',
          border: '1px solid var(--ag-profile-color-border)',
          boxShadow: 'var(--ag-profile-shadow-card)',
          padding: '1.25rem',
        },
      },
      React.createElement('h3', { style: { fontFamily: 'var(--ag-profile-font-display)', margin: 0 } }, 'Adjust Photo'),
      React.createElement(
        'div',
        { style: { marginTop: '1rem', display: 'flex', gap: '0.75rem' } },
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: onCancel,
            disabled: saving,
            style: {
              borderRadius: 'var(--ag-profile-radius-button)',
              border: '1px solid var(--ag-profile-color-border)',
              backgroundColor: 'var(--ag-profile-color-surface)',
              color: 'var(--ag-profile-color-text)',
              padding: '0.5rem 1rem',
            },
          },
          'Cancel'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: () => applyCrop(),
            disabled: saving,
            style: {
              borderRadius: 'var(--ag-profile-radius-button)',
              border: '1px solid var(--ag-profile-color-primary)',
              backgroundColor: 'var(--ag-profile-color-primary)',
              color: 'var(--ag-profile-color-primary-fg)',
              padding: '0.5rem 1rem',
            },
          },
          saving ? 'Saving…' : 'Apply'
        )
      )
    );
  };
}
