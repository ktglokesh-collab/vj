import React, { useState } from 'react';
import { ResourceId, ResourceMetricSummary } from '../../domain/types';
import { TOPOLOGY_NODES, TOPOLOGY_EDGES } from '../../data/resources';
import { ResourceNode } from './ResourceNode';

interface ResourceGraphProps {
  metrics: Record<ResourceId, ResourceMetricSummary>;
  selectedResource?: ResourceId;
  onSelectResource: (id: ResourceId) => void;
}

export const ResourceGraph: React.FC<ResourceGraphProps> = ({
  metrics,
  selectedResource,
  onSelectResource,
}) => {
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  // Lookup node coordinate percentages
  const getNodePos = (id: ResourceId) => {
    const node = TOPOLOGY_NODES.find(n => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 50, y: 50 };
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        backgroundColor: 'var(--surface-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}
      role="region"
      aria-label="Interactive Resource Topology Graph"
    >
      {/* Background SVG for Dependency Edges */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
        }}
        viewBox="0 0 1000 420"
        preserveAspectRatio="none"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="6"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="var(--accent-primary)" />
          </marker>
          <marker
            id="arrowhead-highlight"
            markerWidth="9"
            markerHeight="7"
            refX="7"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 9 3.5, 0 7" fill="var(--accent-cyan)" />
          </marker>
        </defs>

        {TOPOLOGY_EDGES.map(edge => {
          const srcPos = getNodePos(edge.source);
          const tgtPos = getNodePos(edge.target);

          const x1 = (srcPos.x / 100) * 1000;
          const y1 = (srcPos.y / 100) * 420;
          const x2 = (tgtPos.x / 100) * 1000;
          const y2 = (tgtPos.y / 100) * 420;

          // Midpoint for curve and label
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2 - 15;

          const isConnected = selectedResource === edge.source || selectedResource === edge.target;
          const isHovered = hoveredEdge === edge.id;

          const strokeColor = isHovered || isConnected
            ? 'var(--accent-cyan)'
            : 'rgba(99, 102, 241, 0.3)';

          const strokeWidth = isHovered || isConnected ? 2.5 : 1.5;

          return (
            <g
              key={edge.id}
              onMouseEnter={() => setHoveredEdge(edge.id)}
              onMouseLeave={() => setHoveredEdge(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Curve line */}
              <path
                d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={isConnected ? 'none' : '4 3'}
                markerEnd={isConnected ? 'url(#arrowhead-highlight)' : 'url(#arrowhead)'}
              />

              {/* Edge Label badge in SVG */}
              <rect
                x={midX - 55}
                y={midY - 10}
                width={110}
                height={20}
                rx={4}
                fill="var(--surface-3)"
                stroke={isHovered ? 'var(--accent-cyan)' : 'var(--border-subtle)'}
                strokeWidth={1}
              />
              <text
                x={midX}
                y={midY + 4}
                textAnchor="middle"
                fill={isHovered ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize="9"
                fontWeight="600"
              >
                {edge.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Nodes Layer */}
      {TOPOLOGY_NODES.map(node => {
        const metric = metrics[node.id];
        if (!metric) return null;
        return (
          <ResourceNode
            key={node.id}
            id={node.id}
            label={node.label}
            metric={metric}
            x={node.x}
            y={node.y}
            isSelected={selectedResource === node.id}
            onClick={() => onSelectResource(node.id)}
          />
        );
      })}

      {/* Topology Legend Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '16px',
          display: 'flex',
          gap: '16px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          backgroundColor: 'rgba(17, 21, 29, 0.85)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <span>💡 Click node to inspect details</span>
        <span>•</span>
        <span>Directed arrows indicate causal demand propagation</span>
      </div>
    </div>
  );
};
