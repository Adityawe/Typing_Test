import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  RotateCcw,
  Timer,
  Zap,
  Target,
  Check,
  ArrowUpRight,
  Shuffle,
  Loader2,
  Trophy,
  Medal,
  ShieldAlert,
  History,
  Trash2,
  Flame,
  Award,
  Clock,
  Volume2,
  VolumeX,
  Share2,
  CheckCheck,
  BarChart3,
  TrendingUp,
  CalendarDays,
  X
} from 'lucide-react';
import { getDynamicTypingText } from './textService';
import {
  getHistory,
  saveHistoryRecord,
  clearAllHistory,
  getBadgeStatus,
  calculateStats,
  getTodayDateStr,
  groupHistoryByDate,
  getDateWiseTrendData
} from './historyService';
import {
  playKeyClick,
  playSpacebarClick,
  playBackspaceClick,
  playErrorTone,
  playSuccessChime,
  isSoundEnabled,
  setSoundEnabled
} from './soundService';
import { syncDailyStreak } from './streakService';
import DateWiseChart from './DateWiseChart';
import DateWiseHistoryList from './DateWiseHistoryList';

const types = ['Words', 'Sentences', 'Paragraphs', 'Numbers'];
const levels = ['Beginner', 'Advanced', 'Expert'];
const durations = [15, 30, 60];

function App() {
  const [level, setLevel] = useState('Beginner');
  const [type, setType] = useState('Words');
  const [duration, setDuration] = useState(30);
  const [text, setText] = useState('bright calm forest gentle morning open quiet river smile simple warm window yellow breeze garden');
  const [source, setSource] = useState('Random Word API');
  const [loading, setLoading] = useState(false);
  const [typed, setTyped] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  // Sound, Streak, Challenge Mode & History States
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [copied, setCopied] = useState(false);
  const [challengeMode, setChallengeMode] = useState(false);
  const [activeView, setActiveView] = useState('practice'); // 'practice' | 'challenge' | 'reports' | 'history'
  const [history, setHistory] = useState(() => getHistory());
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'today' | 'challenge'
  const [historyDisplayMode, setHistoryDisplayMode] = useState('datewise'); // 'datewise' | 'flat'

  const inputRef = useRef(null);
  const fetchIdRef = useRef(0);
  const hasSavedRef = useRef(false);
  const stateRef = useRef({ level, type, duration });
  stateRef.current = { level, type, duration };

  const correct = useMemo(() => [...typed].filter((char, index) => char === text[index]).length, [typed, text]);
  const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 100;
  const elapsed = duration - timeLeft;
  const wpm = elapsed > 0 ? Math.round((correct / 5) / (elapsed / 60)) : 0;
  const progress = text.length ? Math.min((typed.length / text.length) * 100, 100) : 0;

  // Stats, Badge tier, Daily Streak, Date-Wise Groups, and Trend Data
  const stats = useMemo(() => calculateStats(history), [history]);
  const badge = useMemo(() => getBadgeStatus(stats.todayTests), [stats.todayTests]);
  const streakData = useMemo(() => syncDailyStreak(stats.todayTests), [stats.todayTests]);
  const dateGroups = useMemo(() => groupHistoryByDate(history), [history]);
  const trendData = useMemo(() => getDateWiseTrendData(history), [history]);

  // Challenge pass condition: accuracy must be >= 90%
  const passedChallenge = challengeMode ? accuracy >= 90 : true;

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playKeyClick();
  }

  // Copy shareable score card
  function handleShare() {
    const tierEmoji = badge.tier === 'gold' ? '🥇 Gold Badge Master' : badge.tier === 'silver' ? '🥈 Silver Badge' : '🔴 Red Zone';
    const streakLine = streakData.streak > 0 ? `🔥 Streak: ${streakData.streak} Days\n` : '';

    const shareText = `⚡ Keystroke Typing Practice
━━━━━━━━━━━━━━━━━━━━━━━
🚀 Speed: ${wpm} WPM
🎯 Accuracy: ${accuracy}%
📚 Category: ${level} • ${type}
🏅 Daily Tier: ${tierEmoji} (${stats.todayTests} tests today)
${streakLine}━━━━━━━━━━━━━━━━━━━━━━━
Practice here: https://adityawe.github.io/Typing_Test/`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {});
    }
  }

  // Save to history when session finishes
  useEffect(() => {
    if (finished && !hasSavedRef.current && typed.length >= 3) {
      hasSavedRef.current = true;
      const updated = saveHistoryRecord({
        wpm,
        accuracy,
        level,
        type,
        duration,
        challengeMode,
        passedChallenge
      });
      setHistory(updated);
    }
  }, [finished, typed.length, wpm, accuracy, level, type, duration, challengeMode, passedChallenge]);

  // Timer countdown
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          setFinished(true);
          playSuccessChime();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  async function loadPassage(nextLevel, nextType, nextDuration) {
    const targetLevel = nextLevel ?? stateRef.current.level;
    const targetType = nextType ?? stateRef.current.type;
    const targetDuration = nextDuration ?? stateRef.current.duration;

    const currentId = ++fetchIdRef.current;
    hasSavedRef.current = false;
    setLoading(true);
    setRunning(false);
    setFinished(false);
    setTyped('');
    setTimeLeft(targetDuration);
    if (nextLevel !== undefined) setLevel(targetLevel);
    if (nextType !== undefined) setType(targetType);
    if (nextDuration !== undefined) setDuration(targetDuration);

    try {
      const result = await getDynamicTypingText(targetLevel, targetType);
      if (currentId === fetchIdRef.current) {
        setText(result.text);
        setSource(result.source);
      }
    } catch (err) {
      console.error('Failed to load text:', err);
    } finally {
      if (currentId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }

  function restartCurrent() {
    hasSavedRef.current = false;
    setTyped('');
    setTimeLeft(duration);
    setRunning(false);
    setFinished(false);
    inputRef.current?.focus();
  }

  // Load fresh dynamic text on initial mount
  useEffect(() => {
    loadPassage('Beginner', 'Words', 30);
  }, []);

  function startTyping() {
    if (!finished && !loading) {
      setRunning(true);
      inputRef.current?.focus();
    }
  }

  function handleChange(event) {
    if (finished || loading) return;
    const value = event.target.value.slice(0, text.length);
    if (value.length && !running) setRunning(true);

    // Mechanical Keyboard Sound Effects
    if (value.length > typed.length) {
      const nextChar = value[value.length - 1];
      const expectedChar = text[typed.length];
      if (nextChar === ' ') {
        playSpacebarClick();
      } else if (nextChar === expectedChar) {
        playKeyClick();
      } else {
        playErrorTone();
      }
    } else if (value.length < typed.length) {
      playBackspaceClick();
    }

    setTyped(value);
    if (value.length >= text.length) {
      setRunning(false);
      setFinished(true);
      playSuccessChime();
    }
  }

  function handleClearHistory() {
    if (window.confirm('Are you sure you want to clear your typing test history?')) {
      clearAllHistory();
      setHistory([]);
    }
  }

  // Filtered flat history list
  const filteredHistory = useMemo(() => {
    if (historyFilter === 'today') {
      const today = getTodayDateStr();
      return history.filter((item) => item.dateStr === today);
    }
    if (historyFilter === 'challenge') {
      return history.filter((item) => item.challengeMode);
    }
    return history;
  }, [history, historyFilter]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a
            className="brand"
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setActiveView('practice');
            }}
            aria-label="Keystroke home"
          >
            <span className="brand-mark"><Keyboard size={16} strokeWidth={2.2} /></span>
            <span>key<span className="brand-light">stroke</span></span>
          </a>

          {/* Navigation Tabs */}
          <nav className="topbar-nav" aria-label="Views">
            <button
              className={`nav-tab-btn ${activeView === 'practice' && !challengeMode ? 'active' : ''}`}
              onClick={() => {
                setChallengeMode(false);
                setActiveView('practice');
              }}
            >
              Practice
            </button>
            <button
              className={`nav-tab-btn ${challengeMode || activeView === 'challenge' ? 'active' : ''}`}
              onClick={() => {
                setChallengeMode(true);
                setActiveView('challenge');
              }}
            >
              <Trophy size={12} />
              Challenge Mode
            </button>
            <button
              className={`nav-tab-btn ${activeView === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveView('reports')}
            >
              <BarChart3 size={12} />
              Report & Progress
            </button>
            <button
              className={`nav-tab-btn ${activeView === 'history' ? 'active' : ''}`}
              onClick={() => setActiveView('history')}
            >
              <History size={12} />
              History
              {history.length > 0 && <span className="badge-count">{history.length}</span>}
            </button>
          </nav>

          <div className="topbar-right">
            {/* Daily Streak Counter */}
            <button
              className="streak-pill"
              onClick={() => setActiveView('challenge')}
              title={`Daily Streak: ${streakData.streak} days consecutive!`}
            >
              <Flame size={12} color="#ea580c" />
              <span>{streakData.streak} {streakData.streak === 1 ? 'DAY' : 'DAYS'}</span>
            </button>

            {/* Live Daily Goal & Badge Status Button */}
            <button
              className={`badge-pill pill-${badge.tier}`}
              onClick={() => setActiveView('challenge')}
              title={`${badge.title} - ${badge.description}`}
            >
              <span className={`pulse-dot ${badge.tier}`} />
              {badge.tier === 'red' && `🔴 RED ZONE (${stats.todayTests}/5)`}
              {badge.tier === 'silver' && `🥈 SILVER (${stats.todayTests})`}
              {badge.tier === 'gold' && `🥇 GOLD (${stats.todayTests})`}
            </button>

            {/* Mechanical Keyboard Sound Toggle */}
            <button
              className={`icon-button ${soundOn ? 'sound-active' : ''}`}
              onClick={toggleSound}
              aria-label={soundOn ? 'Mute keyboard sounds' : 'Enable mechanical keyboard sounds'}
              title={soundOn ? 'Sound: Mechanical Click (On)' : 'Sound: Muted'}
            >
              {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            <span className="top-divider" />
            <button
              className="icon-button"
              onClick={() => loadPassage()}
              aria-label="New text from API"
              title="Get new text (Free API)"
              disabled={loading}
            >
              {loading ? <Loader2 size={15} className="spin-icon" /> : <Shuffle size={15} />}
            </button>
            <button
              className="icon-button"
              onClick={restartCurrent}
              aria-label="Restart current test"
              title="Restart current test (Esc)"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </header>

      <main id="home">
        {/* VIEW 1: PRACTICE & TYPING TEST */}
        {activeView === 'practice' && (
          <>
            <section className="intro">
              <div className="eyebrow"><span className="eyebrow-line" /> THE DAILY KEYSTROKE</div>
              <h1>
                {challengeMode ? (
                  <>Daily <em>Challenge.</em></>
                ) : (
                  <>Find your <em>flow.</em></>
                )}
              </h1>
              <p>
                {challengeMode
                  ? 'Mandatory 5 tests daily! Complete sessions with ≥90% accuracy to earn Silver and Gold badges.'
                  : 'Pick your pace, find your rhythm, and let your fingers do the talking.'}
              </p>
            </section>

            <section className={`practice-card ${challengeMode ? 'is-challenge' : ''}`} aria-label="Typing test">
              {/* Challenge Mode HUD Banner */}
              {challengeMode && (
                <div className="challenge-hud">
                  <div className="challenge-hud-left">
                    <Flame size={14} color="#eab308" />
                    <span>DAILY CHALLENGE</span>
                    <span className={`challenge-hud-badge ${badge.tier}`}>
                      {badge.name.toUpperCase()}: {stats.todayTests}/5 MANDATORY
                    </span>
                  </div>
                  <div className="challenge-hud-right">
                    <span className="hud-req">TARGET: ≥90% ACCURACY</span>
                    <button
                      className="restart-button"
                      onClick={() => setChallengeMode(false)}
                      title="Switch back to regular practice"
                    >
                      Exit Challenge
                    </button>
                  </div>
                </div>
              )}

              <div className="controls-toolbar">
                <div className="control-group">
                  <span className="control-label">LEVEL</span>
                  <div className="pill-tabs" role="tablist" aria-label="Difficulty level">
                    {levels.map((item, index) => (
                      <button
                        key={item}
                        role="tab"
                        aria-selected={level === item}
                        className={`pill-tab ${level === item ? 'active' : ''}`}
                        onClick={() => loadPassage(item, type, duration)}
                        disabled={loading}
                      >
                        <span className="pill-num">0{index + 1}</span>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-group">
                  <span className="control-label">TYPE</span>
                  <div className="pill-tabs" role="tablist" aria-label="Practice type">
                    {types.map((item) => (
                      <button
                        key={item}
                        role="tab"
                        aria-selected={type === item}
                        className={`pill-tab ${type === item ? 'active' : ''}`}
                        onClick={() => loadPassage(level, item, duration)}
                        disabled={loading}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-group">
                  <span className="control-label"><Timer size={11} /> TIME</span>
                  <div className="pill-tabs" role="tablist" aria-label="Test duration">
                    {durations.map((value) => (
                      <button
                        key={value}
                        role="tab"
                        aria-selected={duration === value}
                        className={`pill-tab ${duration === value ? 'active' : ''}`}
                        onClick={() => {
                          setDuration(value);
                          setTimeLeft(value);
                          setTyped('');
                          setRunning(false);
                          setFinished(false);
                        }}
                      >
                        {value}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="stats-row" aria-live="polite">
                <div className="stat">
                  <span className="stat-label"><Zap size={11} /> SPEED</span>
                  <span className="stat-value">{wpm}<small>WPM</small></span>
                </div>
                <div className="stat-separator" />
                <div className="stat">
                  <span className="stat-label"><Target size={11} /> ACCURACY</span>
                  <span className="stat-value">{accuracy}<small>%</small></span>
                </div>
                <div className="stat-separator" />
                <div className="stat timer-stat">
                  <span className="stat-label"><Timer size={11} /> REMAINING</span>
                  <span className={`stat-value ${timeLeft <= 5 ? 'urgent' : ''}`}>
                    {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
                  </span>
                </div>
                <div className="session-tag">
                  {loading ? (
                    <span className="api-loading"><Loader2 size={9} className="spin-icon" /> FETCHING</span>
                  ) : (
                    <span>{level.toUpperCase()} • {source.toUpperCase()}</span>
                  )}
                </div>
              </div>

              <div className={`typing-area ${running ? 'is-running' : ''}`} onClick={startTyping}>
                <div className="typing-hint">
                  <span className="hint-key">↵</span> CLICK HERE OR START TYPING
                </div>
                <div className="passage" aria-hidden="true">
                  {[...text].map((char, index) => {
                    let cls = 'char';
                    if (index < typed.length) cls += typed[index] === char ? ' correct-char' : ' wrong-char';
                    else if (index === typed.length) cls += ' current-char';
                    return <span className={cls} key={`${index}-${char}`}>{char === ' ' ? '\u00a0' : char}</span>;
                  })}
                </div>
                <textarea
                  ref={inputRef}
                  className="typing-input"
                  value={typed}
                  onChange={handleChange}
                  onKeyDown={(event) => {
                    if (event.key === 'Tab') {
                      event.preventDefault();
                      loadPassage();
                    } else if (event.key === 'Escape') {
                      restartCurrent();
                    }
                  }}
                  aria-label="Type the displayed passage here"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  disabled={finished || loading}
                />
                {!running && !finished && !loading && (
                  <div className="start-overlay">
                    <span className="start-circle"><ArrowUpRight size={15} /></span>
                    <span>Click to start typing</span>
                  </div>
                )}
                {loading && (
                  <div className="start-overlay">
                    <span className="start-circle"><Loader2 size={15} className="spin-icon" /></span>
                    <span>Fetching new text from free API...</span>
                  </div>
                )}
                <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
              </div>

              <div className="card-footer">
                <span>
                  <span className="footer-dot" /> {finished ? 'SESSION COMPLETED' : running ? 'TEST IN PROGRESS' : 'READY'}
                  <span className="footer-source-note">• {source.toUpperCase()}</span>
                </span>
                <div className="footer-actions">
                  <button
                    className="restart-button"
                    onClick={() => loadPassage()}
                    disabled={loading}
                    title="Fetch new random text (Free API)"
                  >
                    {loading ? <Loader2 size={12} className="spin-icon" /> : <Shuffle size={12} />} New Text
                  </button>
                  <button
                    className="restart-button"
                    onClick={restartCurrent}
                    title="Restart current text (Esc)"
                  >
                    <RotateCcw size={12} /> Restart <span className="shortcut">Esc</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Challenge & History Preview Cards */}
            <div className="dashboard-section">
              <div className="section-card">
                <div className="section-header">
                  <div>
                    <h3 className="section-title">
                      <Trophy size={16} color="#eab308" />
                      Daily Challenge & Badge Progress
                    </h3>
                    <p className="section-desc">5 typing tests per day mandatory quota</p>
                  </div>
                  <button
                    className="restart-button"
                    onClick={() => setActiveView('challenge')}
                  >
                    View Details →
                  </button>
                </div>

                <div className="daily-progress-container">
                  <div className="progress-labels">
                    <span>Today: {stats.todayTests} tests completed</span>
                    <span>
                      {stats.todayTests < 5
                        ? `${5 - stats.todayTests} tests to Silver`
                        : stats.todayTests < 15
                        ? `${15 - stats.todayTests} tests to Gold`
                        : 'Gold Master Reached!'}
                    </span>
                  </div>
                  <div className="progress-bar-rail">
                    <div
                      className={`progress-bar-fill ${badge.tier}`}
                      style={{
                        width: stats.todayTests >= 15
                          ? '100%'
                          : stats.todayTests >= 5
                          ? `${50 + ((stats.todayTests - 5) / 10) * 50}%`
                          : `${(stats.todayTests / 5) * 50}%`
                      }}
                    />
                  </div>
                </div>

                <div className="badges-grid">
                  <div className={`badge-card tier-red ${badge.tier === 'red' ? 'active-tier' : ''}`}>
                    <span className="badge-card-icon">🔴</span>
                    <h5>Red Zone</h5>
                    <span className="badge-card-rule">&lt; 5 Tests / Day</span>
                    <div>
                      <span className={`badge-card-status ${badge.tier === 'red' ? 'current' : 'pending'}`}>
                        {badge.tier === 'red' ? 'CURRENT STATUS' : 'AVOIDED'}
                      </span>
                    </div>
                  </div>

                  <div className={`badge-card tier-silver ${badge.tier === 'silver' ? 'active-tier' : ''}`}>
                    <span className="badge-card-icon">🥈</span>
                    <h5>Silver Badge</h5>
                    <span className="badge-card-rule">5 – 14 Tests / Day</span>
                    <div>
                      <span className={`badge-card-status ${badge.tier === 'silver' ? 'current' : stats.todayTests >= 5 ? 'current' : 'pending'}`}>
                        {stats.todayTests >= 5 ? 'ACHIEVED' : 'GOAL: 5 TESTS'}
                      </span>
                    </div>
                  </div>

                  <div className={`badge-card tier-gold ${badge.tier === 'gold' ? 'active-tier' : ''}`}>
                    <span className="badge-card-icon">🥇</span>
                    <h5>Gold Badge</h5>
                    <span className="badge-card-rule">15+ Tests / Day</span>
                    <div>
                      <span className={`badge-card-status ${badge.tier === 'gold' ? 'current' : 'pending'}`}>
                        {stats.todayTests >= 15 ? 'MASTER UNLOCKED' : 'GOAL: 15 TESTS'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: CHALLENGE MODE & DAILY BADGE DASHBOARD */}
        {activeView === 'challenge' && (
          <section className="dashboard-section" style={{ marginTop: 0 }}>
            <div className="intro">
              <div className="eyebrow"><span className="eyebrow-line" /> DAILY QUOTA & STREAK</div>
              <h1>Daily <em>Challenge.</em></h1>
              <p>Practice consistently. Meet your mandatory 5 sessions daily to maintain Silver and push for Gold.</p>
            </div>

            <div className="section-card">
              {/* Daily Streak Highlight Banner */}
              <div className="streak-dashboard-banner">
                <div>
                  <div className="streak-banner-title">
                    <Flame size={18} color="#ea580c" />
                    <span>{streakData.streak}-Day Consecutive Streak</span>
                  </div>
                  <div className="streak-banner-desc">
                    {stats.todayTests >= 5
                      ? 'Great job! Today’s 5-test mandatory goal is complete. Your streak is safe.'
                      : `Complete ${5 - stats.todayTests} more tests today to extend your streak!`}
                  </div>
                </div>
                <div className="streak-badge-count">
                  🔥 {streakData.streak}
                  <small>BEST: {streakData.bestStreak} DAYS</small>
                </div>
              </div>

              <div className="section-header">
                <div>
                  <h3 className="section-title">
                    <Award size={17} color="#244b3d" />
                    Daily Badge Status
                  </h3>
                  <p className="section-desc">Resetting every midnight local time</p>
                </div>
                <button
                  className="finish-action-btn primary"
                  onClick={() => {
                    setChallengeMode(true);
                    setActiveView('practice');
                    loadPassage();
                  }}
                >
                  <Flame size={13} /> Start Challenge Test
                </button>
              </div>

              {/* Status Alert Banner */}
              <div className={`tracker-banner ${badge.tier}`}>
                <div>
                  {badge.tier === 'red' && <ShieldAlert size={20} color="#dc2626" />}
                  {badge.tier === 'silver' && <Medal size={20} color="#475569" />}
                  {badge.tier === 'gold' && <Trophy size={20} color="#ca8a04" />}
                </div>
                <div>
                  <h4>{badge.heading}</h4>
                  <p>{badge.description}</p>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="daily-progress-container">
                <div className="progress-labels">
                  <span>Current: <strong>{stats.todayTests}</strong> tests completed today</span>
                  <span>
                    {stats.todayTests < 5
                      ? `${5 - stats.todayTests} tests needed for Silver`
                      : stats.todayTests < 15
                      ? `${15 - stats.todayTests} tests needed for Gold`
                      : 'Gold Status Maintained!'}
                  </span>
                </div>
                <div className="progress-bar-rail" style={{ height: '10px' }}>
                  <div
                    className={`progress-bar-fill ${badge.tier}`}
                    style={{
                      width: stats.todayTests >= 15
                        ? '100%'
                        : stats.todayTests >= 5
                        ? `${50 + ((stats.todayTests - 5) / 10) * 50}%`
                        : `${(stats.todayTests / 5) * 50}%`
                    }}
                  />
                </div>
              </div>

              {/* Tier Cards */}
              <div className="badges-grid">
                <div className={`badge-card tier-red ${badge.tier === 'red' ? 'active-tier' : ''}`}>
                  <span className="badge-card-icon">🔴</span>
                  <h5>Red Zone</h5>
                  <span className="badge-card-rule">&lt; 5 Tests Completed</span>
                  <p style={{ fontSize: '10px', color: '#88958c', margin: '6px 0' }}>
                    Mandatory minimum requirement not met. Action required!
                  </p>
                  <div>
                    <span className={`badge-card-status ${badge.tier === 'red' ? 'current' : 'pending'}`}>
                      {badge.tier === 'red' ? 'ACTIVE: IN RED ZONE' : 'CLEARED'}
                    </span>
                  </div>
                </div>

                <div className={`badge-card tier-silver ${badge.tier === 'silver' ? 'active-tier' : ''}`}>
                  <span className="badge-card-icon">🥈</span>
                  <h5>Silver Badge</h5>
                  <span className="badge-card-rule">5 – 14 Tests Completed</span>
                  <p style={{ fontSize: '10px', color: '#88958c', margin: '6px 0' }}>
                    Mandatory daily typing quota successfully completed.
                  </p>
                  <div>
                    <span className={`badge-card-status ${badge.tier === 'silver' ? 'current' : stats.todayTests >= 5 ? 'current' : 'pending'}`}>
                      {stats.todayTests >= 5 ? 'BADGE UNLOCKED' : 'NEED 5 TESTS'}
                    </span>
                  </div>
                </div>

                <div className={`badge-card tier-gold ${badge.tier === 'gold' ? 'active-tier' : ''}`}>
                  <span className="badge-card-icon">🥇</span>
                  <h5>Gold Badge Master</h5>
                  <span className="badge-card-rule">15+ Tests Completed</span>
                  <p style={{ fontSize: '10px', color: '#88958c', margin: '6px 0' }}>
                    Elite milestone! Outstanding dedication and typing volume.
                  </p>
                  <div>
                    <span className={`badge-card-status ${badge.tier === 'gold' ? 'current' : 'pending'}`}>
                      {stats.todayTests >= 15 ? 'GOLD CHAMPION' : 'NEED 15 TESTS'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '18px', textAlign: 'center' }}>
                <button
                  className="finish-action-btn primary"
                  onClick={() => {
                    setChallengeMode(true);
                    setActiveView('practice');
                    loadPassage();
                  }}
                >
                  Start Daily Challenge (Target 5 Sessions) →
                </button>
              </div>
            </div>
          </section>
        )}

        {/* VIEW 3: REPORTS & DATE-WISE PROGRESS GRAPH */}
        {activeView === 'reports' && (
          <section className="dashboard-section" style={{ marginTop: 0 }}>
            <div className="intro">
              <div className="eyebrow"><span className="eyebrow-line" /> PERFORMANCE & TIMELINE</div>
              <h1>Progress <em>Report.</em></h1>
              <p>Track your date-wise speed curves, accuracy evolution, and daily test volume.</p>
            </div>

            {/* Performance Growth Highlight Banner */}
            {trendData.timeline.length > 0 && (
              <div className="report-growth-banner">
                <div className="growth-left">
                  <div className="growth-icon-circle">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h4>
                      {trendData.wpmGain >= 0
                        ? `+${trendData.wpmGain} WPM Speed Growth`
                        : `${trendData.wpmGain} WPM Speed Shift`}
                    </h4>
                    <p>
                      {trendData.timeline.length >= 2
                        ? `${trendData.percentGain >= 0 ? '+' : ''}${trendData.percentGain}% change from your earliest recorded day (${trendData.timeline[0].shortDate}) to today.`
                        : 'First day benchmark recorded. Practice across consecutive days to generate your long-term trend curve.'}
                    </p>
                  </div>
                </div>

                <div className="growth-metrics">
                  <div className="growth-metric-item">
                    <small>ACTIVE PRACTICE DAYS</small>
                    <strong>{trendData.totalActiveDays} {trendData.totalActiveDays === 1 ? 'Day' : 'Days'}</strong>
                  </div>
                  {trendData.bestDateRecord && (
                    <div className="growth-metric-item">
                      <small>BEST DAY ({trendData.bestDateRecord.shortDate})</small>
                      <strong>{trendData.bestDateRecord.maxWpm} WPM</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Interactive Date-Wise Graph */}
            <DateWiseChart timeline={trendData.timeline} />

            {/* Date-Wise History Breakdown Section */}
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h3 className="section-title">
                    <CalendarDays size={16} color="#244b3d" />
                    Date-Wise Practice Sessions
                  </h3>
                  <p className="section-desc">Daily scores and milestones grouped by calendar date</p>
                </div>
              </div>

              <DateWiseHistoryList dateGroups={dateGroups} />
            </div>
          </section>
        )}

        {/* VIEW 4: HISTORY & PERFORMANCE STATS */}
        {activeView === 'history' && (
          <section className="dashboard-section" style={{ marginTop: 0 }}>
            <div className="intro">
              <div className="eyebrow"><span className="eyebrow-line" /> PERFORMANCE LOG</div>
              <h1>Typing <em>History.</em></h1>
              <p>Review your scores, filter records, or inspect your date-wise breakdown.</p>
            </div>

            {/* Overall Stats Cards */}
            <div className="history-stats-grid">
              <div className="history-stat-box">
                <span className="stat-box-label">DAILY STREAK</span>
                <span className="stat-box-val" style={{ color: '#ea580c' }}>
                  🔥 {streakData.streak}<small>DAYS</small>
                </span>
                <div style={{ fontSize: '8px', color: '#9a3412', marginTop: '2px', fontFamily: 'DM Mono' }}>
                  BEST: {streakData.bestStreak}d
                </div>
              </div>

              <div className="history-stat-box">
                <span className="stat-box-label">TODAY'S TESTS</span>
                <span className="stat-box-val">{stats.todayTests}</span>
                <div style={{ marginTop: '2px' }}>
                  <span className={`badge-pill pill-${badge.tier}`} style={{ fontSize: '8px', padding: '1px 5px' }}>
                    {badge.name.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="history-stat-box">
                <span className="stat-box-label">ALL-TIME SESSIONS</span>
                <span className="stat-box-val">{stats.totalTests}</span>
              </div>

              <div className="history-stat-box">
                <span className="stat-box-label">PEAK SPEED</span>
                <span className="stat-box-val">{stats.bestWpm}<small>WPM</small></span>
              </div>

              <div className="history-stat-box">
                <span className="stat-box-label">AVERAGE SPEED</span>
                <span className="stat-box-val">{stats.avgWpm}<small>WPM</small></span>
              </div>

              <div className="history-stat-box">
                <span className="stat-box-label">AVG ACCURACY</span>
                <span className="stat-box-val">{stats.avgAccuracy}<small>%</small></span>
              </div>
            </div>

            {/* History Card with View Switcher */}
            <div className="section-card">
              <div className="section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h3 className="section-title">
                    <History size={16} />
                    Session Records ({history.length})
                  </h3>

                  {/* Mode switcher: Date-wise vs Flat table */}
                  <div className="pill-tabs" style={{ background: '#edf1ec' }}>
                    <button
                      className={`pill-tab ${historyDisplayMode === 'datewise' ? 'active' : ''}`}
                      onClick={() => setHistoryDisplayMode('datewise')}
                      style={{ padding: '2px 8px', fontSize: '9px' }}
                    >
                      <CalendarDays size={10} style={{ marginRight: '3px' }} />
                      Date-Wise Groups
                    </button>
                    <button
                      className={`pill-tab ${historyDisplayMode === 'flat' ? 'active' : ''}`}
                      onClick={() => setHistoryDisplayMode('flat')}
                      style={{ padding: '2px 8px', fontSize: '9px' }}
                    >
                      Flat Table
                    </button>
                  </div>

                  {historyDisplayMode === 'flat' && (
                    /* Filter tabs for flat table */
                    <div className="pill-tabs" style={{ background: '#f5f7f4' }}>
                      <button
                        className={`pill-tab ${historyFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setHistoryFilter('all')}
                        style={{ padding: '2px 8px', fontSize: '9px' }}
                      >
                        All
                      </button>
                      <button
                        className={`pill-tab ${historyFilter === 'today' ? 'active' : ''}`}
                        onClick={() => setHistoryFilter('today')}
                        style={{ padding: '2px 8px', fontSize: '9px' }}
                      >
                        Today ({stats.todayTests})
                      </button>
                      <button
                        className={`pill-tab ${historyFilter === 'challenge' ? 'active' : ''}`}
                        onClick={() => setHistoryFilter('challenge')}
                        style={{ padding: '2px 8px', fontSize: '9px' }}
                      >
                        Challenge Mode
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    className="restart-button"
                    onClick={() => setActiveView('reports')}
                    title="View progress graph"
                  >
                    <BarChart3 size={12} /> View Graph
                  </button>
                  {history.length > 0 && (
                    <button className="clear-btn" onClick={handleClearHistory} title="Clear saved history">
                      <Trash2 size={11} /> Clear History
                    </button>
                  )}
                </div>
              </div>

              {/* Body: Date-wise accordion or flat table */}
              {historyDisplayMode === 'datewise' ? (
                <DateWiseHistoryList dateGroups={dateGroups} />
              ) : filteredHistory.length === 0 ? (
                <div className="empty-history">
                  <Clock size={28} className="empty-history-icon" />
                  <p>No typing sessions recorded under this filter yet.</p>
                  <button
                    className="finish-action-btn primary"
                    onClick={() => {
                      setActiveView('practice');
                      loadPassage();
                    }}
                  >
                    Start a Typing Test
                  </button>
                </div>
              ) : (
                <div className="history-table-wrapper">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>DATE & TIME</th>
                        <th>MODE</th>
                        <th>CATEGORY</th>
                        <th>SPEED</th>
                        <th>ACCURACY</th>
                        <th>DURATION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <span style={{ fontWeight: 500 }}>{item.formattedDate}</span>
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
                            <span style={{ color: '#88968d', fontFamily: 'DM Mono' }}>{item.duration}s</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="below-note">
          <span className="note-spark">✳</span>
          <span>Slow is smooth. Smooth is fast.</span>
          <span className="note-line" />
          <span className="note-muted">Focus on accuracy first.</span>
        </div>
      </main>

      <footer className="page-footer">
        <span>KEYSTROKE PRACTICE • DAILY MANDATORY: 5 TESTS</span>
        <span>ONE KEY AT A TIME <span className="footer-heart">♥</span></span>
      </footer>

      {/* SHOCK ANIMATED POPUP FINISH MODAL */}
      {finished && (
        <div
          className="finish-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) restartCurrent();
          }}
        >
          <div className="finish-modal-dialog" role="dialog" aria-modal="true">
            <button
              className="modal-close-btn"
              onClick={restartCurrent}
              aria-label="Close result popup"
              title="Close (Esc)"
            >
              <X size={15} />
            </button>

            {/* Header with celebration icon */}
            <div className="modal-header-section">
              <div className={`modal-icon-ring ${challengeMode && !passedChallenge ? 'warning' : 'success'}`}>
                {challengeMode && !passedChallenge ? (
                  <ShieldAlert size={26} color="#dc2626" />
                ) : (
                  <Trophy size={26} color="#244b3d" />
                )}
              </div>
              <h2>
                {challengeMode && !passedChallenge ? 'Challenge Missed!' : 'Outstanding Session!'}
              </h2>
              <p>
                {challengeMode && !passedChallenge
                  ? 'Accuracy was below the 90% threshold. Practice again to claim the challenge!'
                  : 'You crushed the passage! Here is your performance and daily badge progress.'}
              </p>
            </div>

            {/* 4 Score Metric Boxes */}
            <div className="modal-metrics-grid">
              <div className="modal-metric-card">
                <small><Zap size={10} /> SPEED</small>
                <strong>{wpm} <span className="unit">WPM</span></strong>
              </div>
              <div className="modal-metric-card">
                <small><Target size={10} /> ACCURACY</small>
                <strong>{accuracy}<span className="unit">%</span></strong>
              </div>
              <div className="modal-metric-card">
                <small><Check size={10} /> CHARS</small>
                <strong>{correct} <span className="unit">keys</span></strong>
              </div>
              <div className="modal-metric-card">
                <small><Flame size={10} /> STREAK</small>
                <strong style={{ color: '#ea580c' }}>
                  {streakData.streak} <span className="unit">days</span>
                </strong>
              </div>
            </div>

            {/* Daily Badge & Quota Alert Banner */}
            <div className={`modal-badge-banner ${badge.tier}`}>
              <div className="banner-icon-wrap">
                {badge.tier === 'red' && <span className="banner-badge-icon">🔴</span>}
                {badge.tier === 'silver' && <span className="banner-badge-icon">🥈</span>}
                {badge.tier === 'gold' && <span className="banner-badge-icon">🥇</span>}
              </div>
              <div className="banner-text-wrap">
                <h4>
                  {badge.tier === 'red' && `Red Zone: ${stats.todayTests}/5 Tests Completed`}
                  {badge.tier === 'silver' && `Silver Badge Active! (${stats.todayTests} tests)`}
                  {badge.tier === 'gold' && `Gold Badge Master! (${stats.todayTests} tests)`}
                </h4>
                <p>
                  {badge.tier === 'red' && `5 daily tests are mandatory. Complete ${5 - stats.todayTests} more tests today to escape the Red Zone!`}
                  {badge.tier === 'silver' && `Mandatory daily quota met! Complete ${15 - stats.todayTests} more tests to unlock the prestigious Gold Badge.`}
                  {badge.tier === 'gold' && `Legendary consistency! 15+ daily sessions completed. You hold the maximum Gold Badge.`}
                </p>
                {/* Mini progress bar inside banner */}
                <div className="modal-banner-rail">
                  <div
                    className={`modal-banner-fill ${badge.tier}`}
                    style={{
                      width: stats.todayTests >= 15
                        ? '100%'
                        : stats.todayTests >= 5
                        ? `${50 + ((stats.todayTests - 5) / 10) * 50}%`
                        : `${(stats.todayTests / 5) * 50}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Shareable Score Card */}
            <div className="modal-sharecard">
              <div className="modal-sharecard-header">
                <span>⚡ KEYSTROKE RESULT CARD</span>
                <button className="copy-card-mini-btn" onClick={handleShare}>
                  {copied ? <><CheckCheck size={11} color="#244b3d" /> Copied!</> : <><Share2 size={11} /> Copy Card</>}
                </button>
              </div>
              <div className="modal-sharecard-content">
                <div className="modal-sharecard-row">
                  <span>Speed & Accuracy:</span>
                  <strong>{wpm} WPM • {accuracy}% Acc</strong>
                </div>
                <div className="modal-sharecard-row">
                  <span>Difficulty & Type:</span>
                  <span>{level} • {type}</span>
                </div>
                <div className="modal-sharecard-row">
                  <span>Today's Standing:</span>
                  <span>{badge.name} ({stats.todayTests} tests)</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="modal-actions-row">
              <button className="finish-action-btn primary" onClick={() => loadPassage()}>
                <Shuffle size={13} /> Next Passage
              </button>
              <button className="finish-action-btn secondary" onClick={restartCurrent}>
                <RotateCcw size={13} /> Retry
              </button>
              <button
                className="finish-action-btn secondary"
                onClick={() => {
                  restartCurrent();
                  setActiveView('reports');
                }}
              >
                <BarChart3 size={13} /> View Reports
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
