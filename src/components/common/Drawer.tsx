import React, { useEffect } from 'react';
import { useAppStore } from '../../state/store';
import { X } from 'lucide-react';
import { ResourceDetail } from '../topology/ResourceDetail';
import { RecommendationDetail } from '../recommendations/RecommendationDetail';

export const Drawer: React.FC = () => {
  const { ui, closeDrawer } = useAppStore();
  const activeDrawer = ui.activeDrawer;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeDrawer) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDrawer, closeDrawer]);

  if (!activeDrawer) return null;

  return (
    <div className="drawer-backdrop" onClick={closeDrawer} role="dialog" aria-modal="true">
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {activeDrawer.type === 'resource' && `Resource Detail: ${activeDrawer.id?.toUpperCase()}`}
            {activeDrawer.type === 'risk' && 'Risk & Breach Explanation'}
            {activeDrawer.type === 'recommendation' && 'Proposed Action Detail'}
            {activeDrawer.type === 'constraint' && 'Constraint Violation Detail'}
          </h2>
          <button className="btn btn-secondary" onClick={closeDrawer} style={{ padding: '6px' }} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {activeDrawer.type === 'resource' && activeDrawer.id && (
            <ResourceDetail resourceId={activeDrawer.id as any} isDrawer />
          )}

          {activeDrawer.type === 'risk' && activeDrawer.data && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.3)', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontWeight: 600, color: 'var(--status-danger)', fontSize: '1rem' }}>
                  {activeDrawer.data.title}
                </div>
                <div style={{ color: 'var(--text-primary)', marginTop: '8px', fontSize: '0.9375rem' }}>
                  {activeDrawer.data.detail}
                </div>
              </div>

              <div className="panel">
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>
                  Root Cause & Bottleneck Analysis
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                  {activeDrawer.data.breachReason || 'Sudden surge volume in acute triage compounded by workforce coverage deficit.'}
                </p>
              </div>

              <div className="panel">
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>
                  Impact Horizon
                </div>
                <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {activeDrawer.data.horizon || 'T+02:00 to T+06:00 (Next Shift Transition)'}
                </p>
              </div>
            </div>
          )}

          {activeDrawer.type === 'recommendation' && activeDrawer.data && (
            <RecommendationDetail recommendation={activeDrawer.data} />
          )}

          {activeDrawer.type === 'constraint' && activeDrawer.data && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Constraint ID: {activeDrawer.data.id}</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {activeDrawer.data.label}
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Observed</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: activeDrawer.data.passed ? 'var(--status-ok)' : 'var(--status-danger)' }}>
                      {activeDrawer.data.observed}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Threshold</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {activeDrawer.data.threshold}
                    </div>
                  </div>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {activeDrawer.data.detail}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
