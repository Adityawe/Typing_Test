// Daily Streak Tracker Service
// Tracks consecutive days meeting the mandatory 5 tests/day quota.

const STREAK_KEY = 'keystroke_streak_v1';

export function getTodayDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRawStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { currentStreak: 0, bestStreak: 0, lastCompletedDate: '' };
    const parsed = JSON.parse(raw);
    return {
      currentStreak: Number(parsed.currentStreak) || 0,
      bestStreak: Number(parsed.bestStreak) || 0,
      lastCompletedDate: parsed.lastCompletedDate || ''
    };
  } catch {
    return { currentStreak: 0, bestStreak: 0, lastCompletedDate: '' };
  }
}

export function saveRawStreak(streak) {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  } catch {}
  return streak;
}

/**
 * Computes and syncs the streak given the count of today's completed tests.
 * Mandatory daily quota = 5 tests.
 */
export function syncDailyStreak(todayCount) {
  const current = getRawStreak();
  const todayStr = getTodayDateStr();
  const yesterdayStr = getYesterdayDateStr();

  let streak = current.currentStreak;
  let best = current.bestStreak;
  let lastDate = current.lastCompletedDate;

  // Check if streak broke from missing yesterday
  if (lastDate && lastDate !== todayStr && lastDate !== yesterdayStr) {
    // Skipped at least 1 full day
    streak = 0;
  }

  // Did the user hit the mandatory 5 tests today?
  if (todayCount >= 5) {
    if (lastDate !== todayStr) {
      if (lastDate === yesterdayStr) {
        streak += 1;
      } else {
        streak = 1;
      }
      lastDate = todayStr;
      best = Math.max(best, streak);
      saveRawStreak({ currentStreak: streak, bestStreak: best, lastCompletedDate: lastDate });
    }
  }

  const isCompletedToday = todayCount >= 5;

  return {
    streak,
    bestStreak: best,
    isCompletedToday,
    lastCompletedDate: lastDate,
    statusText: isCompletedToday
      ? `🔥 ${streak}-Day Streak Active!`
      : streak > 0
      ? `🔥 ${streak}-Day Streak at risk! (${todayCount}/5 tests done today)`
      : `🔥 Start a Streak today! (${todayCount}/5 completed)`
  };
}
