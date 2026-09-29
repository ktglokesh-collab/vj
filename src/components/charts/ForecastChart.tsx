import React, { useState, useRef } from 'react';
import type { ForecastPoint, ResourceId } from '../../domain/types';
import { AlertCircle } from 'lucide-react';

interface ForecastChartProps {
  data: ForecastPoint[];
  resourceId: ResourceId;
  height?: number;
  onSelectPoint?: (point: ForecastPoint) => void;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  data,
  resourceId,
  height = 320,
  onSelectPoint,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (!data || data.length === 0) {
    return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No forecast data available</div>;
  }

  const maxDemand = Math.max(...data.map(d => Math.max(d.upperConfidence, d.capacity, d.demand, d.threshold)));
  const yMax = Math.ceil(maxDemand * 1.15);

  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartWidth = 800;

  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => paddingLeft + (index / (data.length - 1)) * plotWidth;
  const getY = (val: number) => paddingTop + plotHeight - (val / yMax) * plotHeight;

  const nowIndex = data.findIndex(d => d.timeOffsetHours === 0);
  const nowX = nowIndex >= 0 ? getX(nowIndex) : getX(0);

  // Historical path & gradient area
  const histPoints = data.filter(d => d.isHistorical);
  let histPath = '';
  let histArea = '';
  histPoints.forEach((p, idx) => {
    const x = getX(idx);
    const y = getY(p.demand);
    histPath += idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    histArea += idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });
  if (histPoints.length > 0) {
    const lastX = getX(histPoints.length - 1);
    const firstX = getX(0);
    const bottomY = paddingTop + plotHeight;
    histArea += ` L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }

  // Forecast path & gradient area
  const forecastStartIndex = Math.max(0, nowIndex);
  const forecastPoints = data.slice(forecastStartIndex);
  let forecastPath = '';
  let forecastArea = '';
  forecastPoints.forEach((p, idx) => {
    const origIdx = forecastStartIndex + idx;
    const x = getX(origIdx);
    const y = getY(p.demand);
    forecastPath += idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    forecastArea += idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });
  if (forecastPoints.length > 0) {
    const lastX = getX(data.length - 1);
    const startX = getX(forecastStartIndex);
    const bottomY = paddingTop + plotHeight;
    forecastArea += ` L ${lastX} ${bottomY} L ${startX} ${bottomY} Z`;
  }

  // Uncertainty Ribbon
  let uncertaintyPath = '';
  if (forecastPoints.length > 0) {
    forecastPoints.forEach((p, idx) => {
      const origIdx = forecastStartIndex + idx;
      const x = getX(origIdx);
      const y = getY(p.upperConfidence);
      uncertaintyPath += idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    for (let idx = forecastPoints.length - 1; idx >= 0; idx--) {
      const origIdx = forecastStartIndex + idx;
      const x = getX(origIdx);
      const y = getY(forecastPoints[idx].lowerConfidence);
      uncertaintyPath += ` L ${x} ${y}`;
    }
    uncertaintyPath += ' Z';
  }

  const capacityVal = data[0]?.capacity || 10;
  const thresholdVal = data[0]?.threshold || 9;
  const capacityY = getY(capacityVal);
  const thresholdY = getY(thresholdVal);

  const activeIndex = pinnedIndex !== null ? pinnedIndex : hoverIndex;
  const activePoint = activeIndex !== null ? data[activeIndex] : null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (activeIndex === null) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        setHoverIndex(0);
      }
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = Math.min(data.length - 1, activeIndex + 1);
      setHoverIndex(next);
      setPinnedIndex(next);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = Math.max(0, activeIndex - 1);
      setHoverIndex(prev);
      setPinnedIndex(prev);
    } else if (e.key === 'Escape') {
      setHoverIndex(null);
      setPinnedIndex(null);
    }
  };

  return (
    <div
      className="chart-container"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="application"
      aria-label={`Demand and Capacity Forecast for ${resourceId.toUpperCase()}`}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="chart-svg"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="forecastGlowArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0.28)" />
            <stop offset="60%" stopColor="rgba(99, 102, 241, 0.1)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0.0)" />
          </linearGradient>

          <linearGradient id="histGlowArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(148, 163, 184, 0.15)" />
            <stop offset="100%" stopColor="rgba(148, 163, 184, 0.0)" />
          </linearGradient>

          <linearGradient id="breachGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(244, 63, 94, 0.35)" />
            <stop offset="100%" stopColor="rgba(244, 63, 94, 0.0)" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Horizontal Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, idx) => {
          const val = Math.round(yMax * frac);
          const y = getY(val);
          return (
            <g key={idx} className="chart-grid">
              <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} />
              <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="chart-axis">
                {val}
              </text>
            </g>
          );
        })}

        {/* Capacity Line */}
        <line
          x1={paddingLeft}
          y1={capacityY}
          x2={chartWidth - paddingRight}
          y2={capacityY}
          className="chart-capacity-line"
        />
        <text
          x={chartWidth - paddingRight}
          y={capacityY - 6}
          textAnchor="end"
          fill="var(--text-secondary)"
          fontSize="10"
          fontWeight="700"
          letterSpacing="0.05em"
        >
          MAX CAPACITY ({capacityVal})
        </text>

        {/* Threshold Line */}
        <line
          x1={paddingLeft}
          y1={thresholdY}
          x2={chartWidth - paddingRight}
          y2={thresholdY}
          className="chart-threshold-line"
        />
        <text
          x={paddingLeft + 6}
          y={thresholdY - 6}
          fill="var(--status-warning)"
          fontSize="10"
          fontWeight="700"
          letterSpacing="0.05em"
        >
          THRESHOLD ({thresholdVal})
        </text>

        {/* Shaded Area Fills under curves */}
        {histArea && <path d={histArea} fill="url(#histGlowArea)" />}
        {forecastArea && <path d={forecastArea} fill="url(#forecastGlowArea)" />}

        {/* Uncertainty Band for Forecast */}
        {uncertaintyPath && (
          <path d={uncertaintyPath} className="chart-uncertainty-band" />
        )}

        {/* Historical Line */}
        {histPath && <path d={histPath} className="chart-history-path" />}

        {/* Forecast Line */}
        {forecastPath && <path d={forecastPath} className="chart-forecast-path" />}

        {/* Breach region vertical highlight ribbons */}
        {data.map((p, idx) => {
          if (!p.isHistorical && p.breach) {
            const x = getX(idx);
            return (
              <rect
                key={`breach-${idx}`}
                x={x - (plotWidth / (data.length - 1)) / 2}
                y={paddingTop}
                width={plotWidth / (data.length - 1)}
                height={plotHeight}
                fill="url(#breachGlow)"
              />
            );
          }
          return null;
        })}

        {/* Now Vertical Indicator */}
        <line
          x1={nowX}
          y1={paddingTop}
          x2={nowX}
          y2={height - paddingBottom}
          className="chart-now-line"
        />
        <circle cx={nowX} cy={paddingTop + 6} r="4" fill="var(--accent-cyan)" filter="url(#neonGlow)" />
        <text
          x={nowX}
          y={paddingTop - 6}
          textAnchor="middle"
          fill="var(--accent-cyan)"
          fontSize="11"
          fontWeight="800"
          letterSpacing="0.04em"
        >
          NOW (14:00)
        </text>

        {/* Event Markers on Points */}
        {data.map((p, idx) => {
          if (p.hasEvent) {
            const x = getX(idx);
            const y = getY(p.demand);
            return (
              <g key={`event-${idx}`}>
                <circle cx={x} cy={y} r="6" fill="var(--status-danger)" filter="url(#neonGlow)" />
                <circle cx={x} cy={y} r="11" fill="none" stroke="var(--status-danger)" strokeWidth="1.5" strokeDasharray="2 2" />
                <text x={x} y={y - 14} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
                  {p.eventLabel}
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* X-Axis Time Ticks */}
        {data.map((p, idx) => {
          const x = getX(idx);
          return (
            <g key={`tick-${idx}`} className="chart-axis">
              <line x1={x} y1={height - paddingBottom} x2={x} y2={height - paddingBottom + 5} stroke="rgba(255, 255, 255, 0.1)" />
              <text
                x={x}
                y={height - paddingBottom + 18}
                textAnchor="middle"
                fill={p.timeOffsetHours === 0 ? 'var(--accent-cyan)' : 'var(--text-muted)'}
                fontWeight={p.timeOffsetHours === 0 ? '700' : '400'}
              >
                {p.timestamp}
              </text>
            </g>
          );
        })}

        {/* Interactive Hover Columns & Target Points */}
        {data.map((p, idx) => {
          const x = getX(idx);
          const y = getY(p.demand);
          const isSelected = idx === activeIndex;

          return (
            <g
              key={`target-${idx}`}
              onMouseEnter={() => setHoverIndex(idx)}
              onClick={() => {
                setPinnedIndex(idx === pinnedIndex ? null : idx);
                onSelectPoint?.(p);
              }}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={x - (plotWidth / (data.length - 1)) / 2}
                y={paddingTop}
                width={plotWidth / (data.length - 1)}
                height={plotHeight}
                fill="transparent"
              />

              {isSelected && (
                <>
                  <line x1={x} y1={paddingTop} x2={x} y2={height - paddingBottom} stroke="var(--accent-cyan)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx={x} cy={y} r="7" fill="var(--accent-cyan)" stroke="#fff" strokeWidth="2.5" filter="url(#neonGlow)" />
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Glassmorphic Tooltip */}
      {activePoint && (
        <div
          style={{
            position: 'absolute',
            top: '14px',
            right: '18px',
            background: 'var(--surface-1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 18px',
            boxShadow: 'var(--shadow-lg)',
            pointerEvents: 'none',
            minWidth: '230px',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
              {activePoint.timestamp} ({activePoint.timeOffsetHours >= 0 ? `+${activePoint.timeOffsetHours}h` : `${activePoint.timeOffsetHours}h`})
            </span>
            <span className={`badge ${activePoint.isHistorical ? 'badge-scenario' : 'badge-sim'}`} style={{ fontSize: '0.6875rem' }}>
              {activePoint.isHistorical ? 'Historical' : 'Forecast'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Projected Demand:</span>
              <span style={{ fontWeight: 800, color: activePoint.breach ? 'var(--status-danger)' : 'var(--text-primary)', fontSize: '1rem' }}>
                {activePoint.demand}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Max Capacity:</span>
              <span style={{ color: 'var(--text-muted)' }}>{activePoint.capacity}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>95% Confidence:</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>[{activePoint.lowerConfidence} – {activePoint.upperConfidence}]</span>
            </div>
            {activePoint.breach && (
              <div style={{ marginTop: '6px', color: 'var(--status-danger)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, background: 'rgba(244, 63, 94, 0.15)', padding: '4px 8px', borderRadius: '4px' }}>
                <AlertCircle size={14} />
                <span>Operating breach modeled</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
