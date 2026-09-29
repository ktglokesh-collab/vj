import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../state/store';
import {
  Search,
  LayoutDashboard,
  TrendingUp,
  Network,
  Cpu,
  FlaskConical,
  Lightbulb,
  Boxes,
  Settings,
  Flame,
  RotateCcw,
  BedDouble,
  HeartPulse,
  Users,
  Activity,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    ui,
    closeCommandPalette,
    injectEmergency,
    resetBaseline,
    openDrawer,
    selectResource,
  } = useAppStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ui.isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [ui.isCommandPaletteOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (ui.isCommandPaletteOpen) {
          closeCommandPalette();
        } else {
          useAppStore.getState().openCommandPalette();
        }
      }
      if (e.key === 'Escape' && ui.isCommandPaletteOpen) {
        closeCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ui.isCommandPaletteOpen, closeCommandPalette]);

  if (!ui.isCommandPaletteOpen) return null;

  const actions = [
    {
      id: 'nav-overview',
      title: 'Navigate to Command Center (Overview)',
      category: 'Navigation',
      icon: LayoutDashboard,
      perform: () => { navigate('/'); closeCommandPalette(); },
    },
    {
      id: 'nav-forecast',
      title: 'Navigate to Capacity Forecast',
      category: 'Navigation',
      icon: TrendingUp,
      perform: () => { navigate('/forecast'); closeCommandPalette(); },
    },
    {
      id: 'nav-resources',
      title: 'Navigate to Resource Topology Map',
      category: 'Navigation',
      icon: Network,
      perform: () => { navigate('/resources'); closeCommandPalette(); },
    },
    {
      id: 'nav-replan',
      title: 'Navigate to Replan Studio',
      category: 'Navigation',
      icon: Cpu,
      perform: () => { navigate('/replan'); closeCommandPalette(); },
    },
    {
      id: 'nav-scenarios',
      title: 'Navigate to Scenario Lab',
      category: 'Navigation',
      icon: FlaskConical,
      perform: () => { navigate('/scenarios'); closeCommandPalette(); },
    },
    {
      id: 'nav-recs',
      title: 'Navigate to Recommendations',
      category: 'Navigation',
      icon: Lightbulb,
      perform: () => { navigate('/recommendations'); closeCommandPalette(); },
    },
    {
      id: 'nav-solver',
      title: 'Navigate to Solver Lab Comparison',
      category: 'Navigation',
      icon: Boxes,
      perform: () => { navigate('/solver'); closeCommandPalette(); },
    },
    {
      id: 'nav-system',
      title: 'Navigate to System & Logs',
      category: 'Navigation',
      icon: Settings,
      perform: () => { navigate('/system'); closeCommandPalette(); },
    },
    // Contextual and demo actions
    {
      id: 'action-emergency',
      title: 'Inject Canonical Emergency Inflow (+5 Arrivals, -2 Nurses)',
      category: 'Scenario Actions',
      icon: Flame,
      perform: () => { injectEmergency(); closeCommandPalette(); },
    },
    {
      id: 'action-reset',
      title: 'Reset Simulation to Canonical Baseline',
      category: 'Scenario Actions',
      icon: RotateCcw,
      perform: () => { resetBaseline(); closeCommandPalette(); },
    },
    // Resource Inspect Actions
    {
      id: 'res-icu',
      title: 'Inspect Intensive Care Unit (ICU) Census & Skills',
      category: 'Resource Inspect',
      icon: HeartPulse,
      perform: () => { selectResource('icu'); closeCommandPalette(); },
    },
    {
      id: 'res-beds',
      title: 'Inspect General & Step-Down Inpatient Beds',
      category: 'Resource Inspect',
      icon: BedDouble,
      perform: () => { selectResource('beds'); closeCommandPalette(); },
    },
    {
      id: 'res-staff',
      title: 'Inspect Clinical Nursing Workforce & Shifts',
      category: 'Resource Inspect',
      icon: Users,
      perform: () => { selectResource('staff'); closeCommandPalette(); },
    },
    {
      id: 'res-or',
      title: 'Inspect Operating Theatres & Surgical Schedule',
      category: 'Resource Inspect',
      icon: Activity,
      perform: () => { selectResource('or'); closeCommandPalette(); },
    },
  ];

  const filtered = actions.filter(
    a => a.title.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="command-palette-backdrop" onClick={closeCommandPalette}>
      <div className="command-palette-box" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', gap: '12px' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a navigation destination, resource inspect, or scenario action..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ width: '100%', outline: 'none', fontSize: '1rem', color: 'var(--text-primary)' }}
          />
          <kbd style={{ fontSize: '0.75rem', background: 'var(--surface-3)', padding: '3px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>ESC</kbd>
        </div>

        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No matching actions found
            </div>
          ) : (
            filtered.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.perform}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    color: 'var(--text-primary)',
                  }}
                  className="nav-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={16} color="var(--accent-cyan)" />
                    <span style={{ fontSize: '0.9375rem' }}>{action.title}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {action.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
