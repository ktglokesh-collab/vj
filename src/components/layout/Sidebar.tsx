import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../state/store';
import {
  LayoutDashboard,
  TrendingUp,
  Network,
  Cpu,
  FlaskConical,
  Lightbulb,
  Boxes,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItemDef {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

const PRIMARY_NAV_ITEMS: NavItemDef[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/forecast', label: 'Forecast', icon: TrendingUp },
  { to: '/resources', label: 'Resources', icon: Network },
  { to: '/replan', label: 'Replan Studio', icon: Cpu },
  { to: '/scenarios', label: 'Scenario Lab', icon: FlaskConical },
  { to: '/recommendations', label: 'Recommendations', icon: Lightbulb },
  { to: '/solver', label: 'Solver Lab', icon: Boxes },
];

export const Sidebar: React.FC = () => {
  const { ui, toggleSidebar } = useAppStore();
  const isCollapsed = ui.isSidebarCollapsed;

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="Main Navigation">
      <div className="sidebar-header">
        <span style={{ fontSize: 'var(--text-metadata)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {!isCollapsed && 'Operations Hub'}
        </span>
        <button
          onClick={toggleSidebar}
          className="btn btn-secondary"
          style={{ padding: '4px 6px' }}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {PRIMARY_NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={18} />
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/system"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title={isCollapsed ? 'System' : undefined}
        >
          <Settings size={18} />
          {!isCollapsed && <span className="nav-label">System Simulation</span>}
        </NavLink>
      </div>
    </aside>
  );
};
