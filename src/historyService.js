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
      passedChallenge: Boolean(data.passedChallenge)
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

// Calculate badge status according to rules:
// - Red Zone: < 5 tests (Mandatory 5 not complete)
// - Silver Badge: 5 - 14 tests completed today
// - Gold Badge: 15+ tests completed today
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
      description: `You are in the Red Zone (${count}/5 completed). Complete ${remaining} more ${remaining === 1 ? 'test' : 'tests'} today to reach the Silver Badge!`,
      progressPercent: Math.min(Math.round((count / 5) * 100), 100),
      current: count,
      target: 5,
      nextMilestone: 5
    };
  }

  if (count < 15) {
    const remaining = 15 - count;
    return {
      tier: 'silver',
      badge: '🥈',
      name: 'Silver Badge',
      badgeIcon: 'Medal',
      statusText: 'Daily Quota Achieved',
      heading: 'Silver Tier Unlocked',
      description: `Daily target completed! Push further with ${remaining} more ${remaining === 1 ? 'test' : 'tests'} to earn the Gold Badge!`,
      progressPercent: Math.min(Math.round(((count - 5) / 10) * 100), 100),
      current: count,
      target: 15,
      nextMilestone: 15
    };
  }

  return {
    tier: 'gold',
    badge: '🥇',
    name: 'Gold Badge',
    badgeIcon: 'Trophy',
    statusText: 'Master Achieved',
    heading: 'Gold Badge Master (15+ Completed)',
    description: `Spectacular dedication! You have crushed 15+ typing tests today and hold the highest Gold honor.`,
    progressPercent: 100,
    current: count,
    target: 15,
    nextMilestone: 15
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
      avgAccuracy: 100
    };
  }

  const today = getTodayDateStr();
  const todayTests = history.filter((item) => item.dateStr === today).length;
  const totalTests = history.length;
  const bestWpm = Math.max(...history.map((item) => item.wpm || 0), 0);
  const totalWpm = history.reduce((sum, item) => sum + (item.wpm || 0), 0);
  const totalAcc = history.reduce((sum, item) => sum + (item.accuracy || 0), 0);

  return {
    totalTests,
    todayTests,
    bestWpm,
    avgWpm: Math.round(totalWpm / totalTests),
    avgAccuracy: Math.round(totalAcc / totalTests)
  };
}
