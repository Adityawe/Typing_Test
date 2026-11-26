import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, CalendarDays } from 'lucide-react';

export default function DateWiseHistoryList({ dateGroups = [] }) {
  // Track expanded dates (default: first / today is expanded)
  const [expandedDates, setExpandedDates] = useState(() => {
    if (dateGroups.length > 0) {
      return { [dateGroups[0].dateStr]: true };
    }
    return {};
  });

  function toggleDate(dateStr) {
    setExpandedDates((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
  }

  function expandAll() {
    const all = {};
    dateGroups.forEach((g) => {
      all[g.dateStr] = true;
    });
    setExpandedDates(all);
  }

  function collapseAll() {
    setExpandedDates({});
  }

  if (!dateGroups.length) {
    return (
      <div className="empty-history">
        <Clock size={28} className="empty-history-icon" />
        <p>No date-wise history recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="date-history-container">
      <div className="date-history-actions">
        <span className="date-history-summary">
          <CalendarDays size={14} color="#244b3d" />
          <span>Showing <strong>{dateGroups.length}</strong> active practice {dateGroups.length === 1 ? 'day' : 'days'}</span>
        </span>
        <div className="accordion-controls">
          <button className="text-link-btn" onClick={expandAll}>Expand All</button>
          <span>•</span>
          <button className="text-link-btn" onClick={collapseAll}>Collapse All</button>
        </div>
      </div>

      <div className="date-groups-stack">
        {dateGroups.map((group) => {
          const isExpanded = Boolean(expandedDates[group.dateStr]);

          return (
            <div key={group.dateStr} className={`date-group-card ${isExpanded ? 'is-open' : ''}`}>
              {/* Date Group Header */}
              <div className="date-group-header" onClick={() => toggleDate(group.dateStr)}>
                <div className="date-group-left">
                  <span className="date-calendar-icon">📅</span>
                  <div>
                    <h4 className="date-group-title">{group.displayDate}</h4>
                    <div className="date-group-meta">
                      <span>{group.count} {group.count === 1 ? 'test' : 'tests'}</span>
                      <span>•</span>
                      <span>Avg: <strong>{group.avgWpm} WPM</strong></span>
                      <span>•</span>
                      <span>Peak: <strong>{group.maxWpm} WPM</strong></span>
                      <span>•</span>
                      <span>Acc: <strong>{group.avgAccuracy}%</strong></span>
                      <span>•</span>
                      <span style={{ color: '#a16207' }}>Score: <strong>⭐ {group.totalPoints ? group.totalPoints.toLocaleString() : 0} PTS</strong></span>
                    </div>
                  </div>
                </div>

                <div className="date-group-right">
                  {/* Badge earned on this date */}
                  <span className={`badge-pill pill-${group.badge.tier}`} style={{ fontSize: '9px', padding: '2px 7px' }}>
                    {group.badge.tier === 'red' && `🔴 Red Zone (${group.count}/5)`}
                    {group.badge.tier === 'bronze' && `🥉 Bronze (${group.count})`}
                    {group.badge.tier === 'silver' && `🥈 Silver (${group.count})`}
                    {group.badge.tier === 'gold' && `🥇 Gold (${group.count})`}
                    {group.badge.tier === 'diamond' && `💎 Diamond Master (${group.count})`}
                  </span>

                  <button className="accordion-toggle-btn" aria-label="Toggle day sessions">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Collapsible sessions table */}
              {isExpanded && (
                <div className="date-group-content">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>TIME</th>
                        <th>MODE</th>
                        <th>CATEGORY</th>
                        <th>SPEED</th>
                        <th>ACCURACY</th>
                        <th>SCORE</th>
                        <th>DURATION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.tests.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <span style={{ fontWeight: 500, fontFamily: 'DM Mono', fontSize: '10px' }}>
                              {item.formattedDate.split(',')[1]?.trim() || item.formattedDate}
                            </span>
                          </td>
                          <td>
                            <span className={`table-tag ${item.challengeMode ? 'challenge' : 'practice'}`}>
                              {item.challengeMode ? 'CHALLENGE' : 'PRACTICE'}
                            </span>
                          </td>
                          <td>
                            <span>{item.level} • {item.type}</span>
                          </td>
                          <td>
                            <span className="table-wpm">{item.wpm} WPM</span>
                          </td>
                          <td>
                            <span className="table-acc">{item.accuracy}%</span>
                          </td>
                          <td>
                            <span style={{ color: '#a16207', fontWeight: 600, fontFamily: 'DM Mono' }}>
                              +{item.points || 0} PTS
                            </span>
                          </td>
                          <td>
                            <span style={{ color: '#88968d', fontFamily: 'DM Mono' }}>{item.duration}s</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
