import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, RotateCcw, Timer, Zap, Target, Check, ArrowUpRight, Shuffle, Loader2 } from 'lucide-react';
import { getDynamicTypingText } from './textService';

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
  const inputRef = useRef(null);
  const fetchIdRef = useRef(0);
  const stateRef = useRef({ level, type, duration });
  stateRef.current = { level, type, duration };

  const correct = useMemo(() => [...typed].filter((char, index) => char === text[index]).length, [typed, text]);
  const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 100;
  const elapsed = duration - timeLeft;
  const wpm = elapsed > 0 ? Math.round((correct / 5) / (elapsed / 60)) : 0;
  const progress = text.length ? Math.min((typed.length / text.length) * 100, 100) : 0;

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          setFinished(true);
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
    setTyped('');
    setTimeLeft(duration);
    setRunning(false);
    setFinished(false);
    inputRef.current?.focus();
  }

  // Load fresh dynamic text from API on initial mount
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
    setTyped(value);
    if (value.length >= text.length) {
      setRunning(false);
      setFinished(true);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#home" aria-label="Keystroke home">
            <span className="brand-mark"><Keyboard size={16} strokeWidth={2.2} /></span>
            <span>key<span className="brand-light">stroke</span></span>
          </a>
          <div className="topbar-right">
            <span className="practice-label"><span className="live-dot" /> PRACTICE SPACE</span>
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
        <section className="intro">
          <div className="eyebrow"><span className="eyebrow-line" /> THE DAILY KEYSTROKE</div>
          <h1>Find your <em>flow.</em></h1>
          <p>Pick your pace, find your rhythm, and let your fingers do the talking.</p>
        </section>

        <section className="practice-card" aria-label="Typing test">
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
            {finished && (
              <div className="finish-overlay">
                <span className="finish-check"><Check size={17} /></span>
                <strong>Well done!</strong>
                <span>You scored {wpm} WPM with {accuracy}% accuracy.</span>
                <div className="finish-actions">
                  <button className="finish-action-btn primary" onClick={() => loadPassage()}>
                    <Shuffle size={13} /> Next Passage
                  </button>
                  <button className="finish-action-btn secondary" onClick={restartCurrent}>
                    <RotateCcw size={13} /> Retry
                  </button>
                </div>
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

        <div className="below-note">
          <span className="note-spark">✳</span>
          <span>Slow is smooth. Smooth is fast.</span>
          <span className="note-line" />
          <span className="note-muted">Focus on accuracy first.</span>
        </div>
      </main>

      <footer className="page-footer">
        <span>KEYSTROKE PRACTICE</span>
        <span>ONE KEY AT A TIME <span className="footer-heart">♥</span></span>
      </footer>
    </div>
  );
}

export default App;
