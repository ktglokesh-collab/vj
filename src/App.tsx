import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAppStore } from './state/store';
import { AppShell } from './components/layout/AppShell';
import { OverviewPage } from './pages/OverviewPage';
import { ForecastPage } from './pages/ForecastPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { ReplanStudioPage } from './pages/ReplanStudioPage';
import { ValidationPage } from './pages/ValidationPage';
import { ScenarioLabPage } from './pages/ScenarioLabPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { SolverLabPage } from './pages/SolverLabPage';
import { SystemPage } from './pages/SystemPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  const theme = useAppStore(state => state.ui.theme);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="forecast" element={<ForecastPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="resources/:resourceId" element={<ResourceDetailPage />} />
          <Route path="replan" element={<ReplanStudioPage />} />
          <Route path="replan/validation" element={<ValidationPage />} />
          <Route path="scenarios" element={<ScenarioLabPage />} />
          <Route path="recommendations" element={<RecommendationsPage />} />
          <Route path="solver" element={<SolverLabPage />} />
          <Route path="system" element={<SystemPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
