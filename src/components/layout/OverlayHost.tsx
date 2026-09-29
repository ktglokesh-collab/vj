import React from 'react';
import { CommandPalette } from './CommandPalette';
import { ConfirmDialog } from './ConfirmDialog';
import { ToastRegion } from './ToastRegion';
import { Drawer } from '../common/Drawer';

export const OverlayHost: React.FC = () => {
  return (
    <>
      <CommandPalette />
      <ConfirmDialog />
      <ToastRegion />
      <Drawer />
    </>
  );
};
