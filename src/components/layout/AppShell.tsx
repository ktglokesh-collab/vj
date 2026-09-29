import React from 'react';
import { Outlet } from 'react-router-dom';
import { SkipLink } from './SkipLink';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { OverlayHost } from './OverlayHost';

export const AppShell: React.FC = () => {
  return (
    <div className="app-shell">
      <SkipLink />
      <Sidebar />

      <div className="main-container">
        <TopBar />
        <main id="main-content" className="page-viewport" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      <OverlayHost />
    </div>
  );
};
