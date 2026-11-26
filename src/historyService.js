// History and Daily Challenge / Badge System Service

const STORAGE_KEY = 'keystroke_typing_history_v1';

// Get today's local date in YYYY-MM-DD
export function getTodayDateStr() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTime(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Calculate XP Points earned for a session
export function calculatePoints(data = {}) {
  const wpm = Math.max(0, Number(data.wpm) || 0);
  const accuracy = Math.max(0, Math.min(100, Number(data.accuracy) || 0));
  const level = data.level || 'Beginner';
  const duration = Number(data.duration) || 30;
  const challengeMode = Boolean(data.challengeMode);
  const passedChallenge = Boolean(data.passedChallenge);

  // Multipliers
  const levelMult = level === 'Expert' ? 1.5 : level === 'Advanced' ? 1.25 : 1.0;
  const durationMult = duration === 60 ? 1.4 : duration === 15 ? 0.8 : 1.0;

  // Base score from speed & accuracy
  const base = Math.round(wpm * (accuracy / 100) * levelMult * durationMult);

  // Accuracy bonuses
  let accBonus = 0;
  if (accuracy === 100) accBonus = 50; // Perfect accuracy bonus!
  else if (accuracy >= 98) accBonus = 25;
  else if (accuracy >= 95) accBonus = 10;

  // Challenge mode clearance bonus
  const chalBonus = (challengeMode && passedChallenge) ? 50 : 0;

  return Math.max(0, base + accBonus + chalBonus);
}

// Load history from localStorage safely
export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load history from localStorage:', err);
    return [];
  }
}

// Save a test result to history
export function saveHistoryRecord(data) {
  try {
    const history = getHistory();
    const timestamp = Date.now();
    const points = Number(data.points) || calculatePoints(data);

    const newRecord = {
      id: `${timestamp}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp,
      dateStr: getTodayDateStr(),
      formattedDate: formatDateTime(timestamp),
      wpm: Number(data.wpm) || 0,
      accuracy: Number(data.accuracy) || 0,
      level: data.level || 'Beginner',
      type: data.type || 'Words',
      duration: Number(data.duration) || 30,
      challengeMode: Boolean(data.challengeMode),
      passedChallenge: Boolean(data.passedChallenge),
      points
    };

    const updated = [newRecord, ...history].slice(0, 100); // keep last 100 records
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save record to localStorage:', err);
    return getHistory();
  }
}

// Clear all history
export function clearAllHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (err) {
    console.error('Failed to clear history:', err);
    return [];
  }
}

// Filter records for today
export function getTodayRecords(history) {
  const today = getTodayDateStr();
  return history.filter((item) => item.dateStr === today);
}

// Calculate badge status according to upgraded rules:
// - Red Zone: < 5 tests (Mandatory 5 quota not complete)
// - Bronze Medal: 5 - 9 tests completed today (5 mandatory quota cleared)
// - Silver Medal: 10 - 19 tests completed today (increased requirement)
// - Gold Medal: 20 - 29 tests completed today (increased requirement)
// - Diamond Master: 30+ tests completed today (supreme milestone)
export function getBadgeStatus(todayCount) {
  const count = Number(todayCount) || 0;

  if (count < 5) {
    const remaining = 5 - count;
    return {
      tier: 'red',
      badge: '🔴',
      name: 'Red Zone',
      badgeIcon: 'ShieldAlert',
      statusText: 'Incomplete Quota',
      heading: 'Mandatory 5 Tests Not Met',
      description: `You are in the Red Zone (${count}/5 completed). Complete ${remaining} more ${remaining === 1 ? 'test' : 'tests'} today to unlock the Bronze Medal!`,
      progressPercent: Math.min(Math.round((count / 5) * 100), 100),
      current: count,
      target: 5,
      nextMilestone: 5
    };
  }

  if (count < 10) {
    const remaining = 10 - count;
    return {
      tier: 'bronze',
      badge: '🥉',
      name: 'Bronze Medal',
      badgeIcon: 'Medal',
      statusText: 'Daily Quota Achieved',
      heading: 'Bronze Tier Unlocked (5+ Completed)',
      description: `Daily mandatory quota completed! Finish ${remaining} more ${remaining === 1 ? 'test' : 'tests'} to earn the Silver Medal!`,
      progressPercent: Math.min(Math.round(((count - 5) / 5) * 100), 100),
      current: count,
      target: 10,
      nextMilestone: 10
    };
  }

  if (count < 20) {
    const remaining = 20 - count;
    return {
      tier: 'silver',
      badge: '🥈',
      name: 'Silver Medal',
      badgeIcon: 'Medal',
      statusText: 'Dedicated Typist',
      heading: 'Silver Medalist (10+ Completed)',
      description: `Double quota cleared! Push forward with ${remaining} more ${remaining === 1 ? 'test' : 'tests'} to claim the Gold Medal!`,
      progressPercent: Math.min(Math.round(((count - 10) / 10) * 100), 100),
      current: count,
      target: 20,
      nextMilestone: 20
    };
  }

  if (count < 30) {
    const remaining = 30 - count;
    return {
      tier: 'gold',
      badge: '🥇',
      name: 'Gold Medal',
      badgeIcon: 'Trophy',
      statusText: 'Typing Master',
      heading: 'Gold Medalist (20+ Completed)',
      description: `Outstanding typing volume! Complete ${remaining} more ${remaining === 1 ? 'test' : 'tests'} today to reach the ultimate Diamond Master tier!`,
      progressPercent: Math.min(Math.round(((count - 20) / 10) * 100), 100),
      current: count,
      target: 30,
      nextMilestone: 30
    };
  }

  return {
    tier: 'diamond',
    badge: '💎',
    name: 'Diamond Master',
    badgeIcon: 'Crown',
    statusText: 'Grandmaster Achieved',
    heading: 'Diamond Master (30+ Completed)',
    description: `Legendary dedication! You have conquered 30+ typing tests today and hold the highest Diamond honor.`,
    progressPercent: 100,
    current: count,
    target: 30,
    nextMilestone: 30
  };
}

// Calculate aggregate statistics
export function calculateStats(history) {
  if (!history || history.length === 0) {
    return {
      totalTests: 0,
      todayTests: 0,
      bestWpm: 0,
      avgWpm: 0,
      avgAccuracy: 100,
      todayPoints: 0,
      totalPoints: 0,
      bestPoints: 0
    };
  }

  const today = getTodayDateStr();
  let todayTests = 0;
  let totalTests = history.length;
  let bestWpm = 0;
  let totalWpm = 0;
  let totalAcc = 0;
  let todayPoints = 0;
  let totalPoints = 0;
  let bestPoints = 0;

  for (const item of history) {
    const wpm = item.wpm || 0;
    const acc = item.accuracy || 0;
    const pts = item.points != null ? item.points : calculatePoints(item);

    if (wpm > bestWpm) bestWpm = wpm;
    if (pts > bestPoints) bestPoints = pts;
    totalWpm += wpm;
    totalAcc += acc;
    totalPoints += pts;

    if (item.dateStr === today) {
      todayTests += 1;
      todayPoints += pts;
    }
  }

  return {
    totalTests,
    todayTests,
    bestWpm,
    avgWpm: Math.round(totalWpm / totalTests),
    avgAccuracy: Math.round(totalAcc / totalTests),
    todayPoints,
    totalPoints,
    bestPoints
  };
}

// Format friendly date label (e.g., Today (Nov 24), Yesterday (Nov 23), Nov 20, 2026)
export function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  const dt = new Date(y, m - 1, d);

  const now = new Date();
  const todayStr = getTodayDateStr();
  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  const yestStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`;

  const monthShort = dt.toLocaleDateString(undefined, { month: 'short' });
  if (dateStr === todayStr) return `Today (${monthShort} ${d})`;
  if (dateStr === yestStr) return `Yesterday (${monthShort} ${d})`;
  return `${monthShort} ${d}, ${y}`;
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Group all history sessions date-wise (sorted newest date first)
export function groupHistoryByDate(history) {
  if (!history || history.length === 0) return [];

  const groups = {};
  for (const item of history) {
    const key = item.dateStr || getTodayDateStr();
    if (!groups[key]) {
      groups[key] = [];
    }
    // ensure item has points
    const itemWithPoints = {
      ...item,
      points: item.points != null ? item.points : calculatePoints(item)
    };
    groups[key].push(itemWithPoints);
  }

  // Sort descending by date (newest date first)
  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return sortedDates.map((dateStr) => {
    const list = groups[dateStr];
    const count = list.length;
    const totalWpm = list.reduce((sum, item) => sum + (item.wpm || 0), 0);
    const totalAcc = list.reduce((sum, item) => sum + (item.accuracy || 0), 0);
    const totalPoints = list.reduce((sum, item) => sum + (item.points || 0), 0);
    const maxWpm = Math.max(...list.map((item) => item.wpm || 0), 0);
    const avgWpm = Math.round(totalWpm / count);
    const avgAccuracy = Math.round(totalAcc / count);
    const badge = getBadgeStatus(count);

    return {
      dateStr,
      displayDate: formatDateLabel(dateStr),
      shortDate: formatShortDate(dateStr),
      count,
      avgWpm,
      maxWpm,
      avgAccuracy,
      totalPoints,
      badge,
      tests: list
    };
  });
}

// Get chronological date-wise trend data for the progress chart (oldest date to newest date)
export function getDateWiseTrendData(history) {
  if (!history || history.length === 0) {
    return {
      timeline: [],
      wpmGain: 0,
      percentGain: 0,
      bestDateRecord: null,
      totalActiveDays: 0
    };
  }

  const grouped = groupHistoryByDate(history);
  // Sort chronological for graph left-to-right (oldest -> newest)
  const timeline = [...grouped].sort((a, b) => a.dateStr.localeCompare(b.dateStr));

  const totalActiveDays = timeline.length;
  let wpmGain = 0;
  let percentGain = 0;

  if (timeline.length >= 2) {
    const firstDayAvg = timeline[0].avgWpm;
    const lastDayAvg = timeline[timeline.length - 1].avgWpm;
    wpmGain = lastDayAvg - firstDayAvg;
    percentGain = firstDayAvg > 0 ? Math.round((wpmGain / firstDayAvg) * 100) : 0;
  }

  const bestDateRecord = [...timeline].sort((a, b) => b.maxWpm - a.maxWpm)[0] || null;

  return {
    timeline,
    wpmGain,
    percentGain,
    bestDateRecord,
    totalActiveDays
  };
}
