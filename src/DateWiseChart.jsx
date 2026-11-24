import { useMemo, useState } from 'react';
import { TrendingUp, BarChart2, Zap, Trophy, ShieldAlert, Medal } from 'lucide-react';

export default function DateWiseChart({ timeline = [] }) {
  const [metric, setMetric] = useState('avg'); // 'avg' | 'max' | 'volume'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Chart dimensions
  const width = 620;
  const height = 220;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Compute maximum scale
  const { maxY, yTicks, points, bars } = useMemo(() => {
    if (!timeline.length) {
      return { maxY: 100, yTicks: [0, 25, 50, 75, 100], points: [], bars: [] };
    }

    if (metric === 'volume') {
      const maxCount = Math.max(...timeline.map((d) => d.count || 0), 15);
      const ceiling = Math.max(15, Math.ceil(maxCount / 5) * 5);
      const step = ceiling / 3;
      const ticks = [0, Math.round(step), Math.round(step * 2), ceiling];

      const barWidth = Math.min(36, Math.max(16, plotWidth / (timeline.length * 1.8)));

      const computedBars = timeline.map((item, idx) => {
        const x = timeline.length === 1
          ? padding.left + plotWidth / 2
          : padding.left + (idx / (timeline.length - 1)) * plotWidth;
        const val = item.count || 0;
        const barH = (val / ceiling) * plotHeight;
        const y = padding.top + plotHeight - barH;

        let fill = '#ef4444'; // Red Zone
        if (val >= 15) fill = '#eab308'; // Gold
        else if (val >= 5) fill = '#94a3b8'; // Silver

        return { x: x - barWidth / 2, y, w: barWidth, h: barH, val, item, idx, fill };
      });

      return { maxY: ceiling, yTicks: ticks, points: [], bars: computedBars };
    }

    // WPM metric (avg or max)
    const values = timeline.map((d) => (metric === 'max' ? d.maxWpm : d.avgWpm) || 0);
    const maxVal = Math.max(...values, 80);
    const ceiling = Math.ceil(maxVal / 20) * 20;
    const ticks = [0, ceiling * 0.25, ceiling * 0.5, ceiling * 0.75, ceiling].map(Math.round);

    const computedPoints = timeline.map((item, idx) => {
      const x = timeline.length === 1
        ? padding.left + plotWidth / 2
        : padding.left + (idx / (timeline.length - 1)) * plotWidth;
      const val = (metric === 'max' ? item.maxWpm : item.avgWpm) || 0;
      const y = padding.top + plotHeight - (val / ceiling) * plotHeight;
      return { x, y, val, item, idx };
    });

    return { maxY: ceiling, yTicks: ticks, points: computedPoints, bars: [] };
  }, [timeline, metric, plotWidth, plotHeight, padding.left, padding.top]);

  // Generate SVG path for line and area
  const { linePath, areaPath } = useMemo(() => {
    if (!points.length) return { linePath: '', areaPath: '' };
    if (points.length === 1) {
      return { linePath: '', areaPath: '' };
    }

    // Smooth cubic bezier or straight segments
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      path += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const baselineY = padding.top + plotHeight;
    const area = `${path} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;

    return { linePath: path, areaPath: area };
  }, [points, padding.top, plotHeight]);

  // Active item for tooltip
  const activeItem = hoveredIndex !== null && timeline[hoveredIndex] ? timeline[hoveredIndex] : null;

  return (
    <div className="date-chart-card">
      <div className="chart-header">
        <div className="chart-title-wrap">
          <div className="chart-main-title">
            <TrendingUp size={16} color="#244b3d" />
            <span>Date-Wise Progress Trend</span>
          </div>
          <p className="chart-subtitle">
            {timeline.length} {timeline.length === 1 ? 'day' : 'days'} recorded on your personal timeline
          </p>
        </div>

        {/* Metric Switcher */}
        <div className="pill-tabs" style={{ background: '#f5f7f4' }}>
          <button
            className={`pill-tab ${metric === 'avg' ? 'active' : ''}`}
            onClick={() => {
              setMetric('avg');
              setHoveredIndex(null);
            }}
            title="Show daily average speed"
          >
            Avg WPM
          </button>
          <button
            className={`pill-tab ${metric === 'max' ? 'active' : ''}`}
            onClick={() => {
              setMetric('max');
              setHoveredIndex(null);
            }}
            title="Show daily peak speed"
          >
            Peak WPM
          </button>
          <button
            className={`pill-tab ${metric === 'volume' ? 'active' : ''}`}
            onClick={() => {
              setMetric('volume');
              setHoveredIndex(null);
            }}
            title="Show daily test count"
          >
            Daily Tests
          </button>
        </div>
      </div>

      {timeline.length === 0 ? (
        <div className="chart-empty">
          <BarChart2 size={32} color="#a1b0a6" />
          <p>No date records available yet.</p>
          <span>Complete your daily typing sessions to see your progress curve.</span>
        </div>
      ) : (
        <div className="chart-wrapper">
          <svg
            className="chart-svg"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#244b3d" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#244b3d" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Y-axis grid lines and labels */}
            {yTicks.map((tick) => {
              const y = padding.top + plotHeight - (tick / maxY) * plotHeight;
              return (
                <g key={`ytick-${tick}`}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#edf1eb"
                    strokeWidth="1"
                    strokeDasharray={tick === 0 ? 'none' : '3 3'}
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    fill="#8d9b92"
                    fontSize="9"
                    fontFamily="DM Mono, monospace"
                  >
                    {tick}
                    {metric !== 'volume' && tick > 0 ? '' : ''}
                  </text>
                </g>
              );
            })}

            {/* Target 5 guideline for Volume mode (Mandatory Silver milestone) */}
            {metric === 'volume' && (
              <g>
                {(() => {
                  const y5 = padding.top + plotHeight - (5 / maxY) * plotHeight;
                  return (
                    <>
                      <line
                        x1={padding.left}
                        y1={y5}
                        x2={width - padding.right}
                        y2={y5}
                        stroke="#94a3b8"
                        strokeWidth="1"
                        strokeDasharray="4 2"
                      />
                      <text
                        x={width - padding.right + 4}
                        y={y5 + 3}
                        fill="#64748b"
                        fontSize="8"
                        fontFamily="DM Mono, monospace"
                      >
                        5 🥈
                      </text>
                    </>
                  );
                })()}
              </g>
            )}

            {/* Area and Line for WPM */}
            {metric !== 'volume' && (
              <>
                {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#244b3d"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {/* Data Points */}
                {points.map((pt) => {
                  const isHovered = hoveredIndex === pt.idx;
                  return (
                    <g
                      key={`pt-${pt.idx}`}
                      onMouseEnter={() => setHoveredIndex(pt.idx)}
                      onClick={() => setHoveredIndex(pt.idx)}
                      style={{ cursor: 'pointer' }}
                    >
                      {isHovered && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="9"
                          fill="#244b3d"
                          fillOpacity="0.15"
                        />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 5.5 : 3.8}
                        fill={isHovered ? '#244b3d' : '#ffffff'}
                        stroke="#244b3d"
                        strokeWidth={isHovered ? 2.5 : 2}
                        className="chart-dot"
                      />
                    </g>
                  );
                })}
              </>
            )}

            {/* Bars for Daily Tests Volume */}
            {metric === 'volume' && (
              <>
                {bars.map((bar) => {
                  const isHovered = hoveredIndex === bar.idx;
                  return (
                    <g
                      key={`bar-${bar.idx}`}
                      onMouseEnter={() => setHoveredIndex(bar.idx)}
                      onClick={() => setHoveredIndex(bar.idx)}
                      style={{ cursor: 'pointer' }}
                    >
                      <rect
                        x={bar.x}
                        y={bar.y}
                        width={bar.w}
                        height={Math.max(bar.h, 2)}
                        rx="4"
                        fill={bar.fill}
                        opacity={isHovered ? 1 : 0.82}
                        stroke={isHovered ? '#22342c' : 'none'}
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}
              </>
            )}

            {/* X-axis date labels */}
            {timeline.map((item, idx) => {
              const x = timeline.length === 1
                ? padding.left + plotWidth / 2
                : padding.left + (idx / (timeline.length - 1)) * plotWidth;
              const isHovered = hoveredIndex === idx;

              return (
                <text
                  key={`xlabel-${item.dateStr}`}
                  x={x}
                  y={height - 12}
                  textAnchor="middle"
                  fill={isHovered ? '#244b3d' : '#859389'}
                  fontSize="8.5"
                  fontWeight={isHovered ? '700' : '500'}
                  fontFamily="DM Mono, monospace"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  style={{ cursor: 'pointer' }}
                >
                  {item.shortDate}
                </text>
              );
            })}
          </svg>

          {/* Interactive Tooltip Card */}
          {activeItem && (
            <div className="chart-tooltip-badge">
              <div className="tooltip-head">
                <strong>📅 {activeItem.displayDate}</strong>
                <span className={`badge-pill pill-${activeItem.badge.tier}`} style={{ fontSize: '8px', padding: '1px 5px' }}>
                  {activeItem.badge.tier === 'red' && '🔴 Red Zone'}
                  {activeItem.badge.tier === 'silver' && '🥈 Silver Badge'}
                  {activeItem.badge.tier === 'gold' && '🥇 Gold Master'}
                </span>
              </div>
              <div className="tooltip-grid">
                <div>
                  <small>AVG SPEED</small>
                  <span>{activeItem.avgWpm} WPM</span>
                </div>
                <div>
                  <small>PEAK SPEED</small>
                  <span>{activeItem.maxWpm} WPM</span>
                </div>
                <div>
                  <small>ACCURACY</small>
                  <span>{activeItem.avgAccuracy}%</span>
                </div>
                <div>
                  <small>TESTS DONE</small>
                  <span>{activeItem.count} tests</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
