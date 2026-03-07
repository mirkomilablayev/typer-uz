import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTypingEngine } from './hooks/useTypingEngine';
import { generateTargetText } from './data/words';
import { translations } from './data/translations';
import { trackEvent } from './utils/analytics';
import AnalyticsTracker from './components/AnalyticsTracker';
import './index.css';

function App() {
  const [lang, setLang] = useState('uz'); // 'uz', 'ru', 'en'
  const [mode, setMode] = useState('words'); // 'words' or 'time'
  const [modeValue, setModeValue] = useState(25); // count for words, seconds for time
  const [difficulty, setDifficulty] = useState('common');
  const [includePunctuation, setIncludePunctuation] = useState(false);
  const [includeNumbers, setIncludeNumbers] = useState(false);

  const isFirstMount = useRef(true);
  const location = useLocation();

  // Sync Language from URL on mount
  useEffect(() => {
    const path = location.pathname.split('/')[1];
    if (['uz', 'ru', 'en'].includes(path)) {
      setLang(path);
    }
  }, [location.pathname]);

  // Track Language Switch
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const langNames = { uz: 'Uzbek', ru: 'Russian', en: 'English' };
    trackEvent("Language", "Switch", langNames[lang]);
  }, [lang]);

  // Track Mode/Difficulty Changes (only when user changes them, handled via restart but we want specific events)
  const handleModeChange = (newMode, newValue) => {
    setMode(newMode);
    setModeValue(newValue);
    trackEvent("Typing", "Mode Selected", newMode === 'time' ? 'Time Mode' : 'Word Mode');
  };

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    trackEvent("Typing", "Difficulty Selected", newDifficulty.charAt(0).toUpperCase() + newDifficulty.slice(1));
  };

  // Dynamic SEO Title
  const pageTitle = useMemo(() => {
    const base = lang === 'uz' ? 'Typer.uz' : 'Typer.uz';
    if (mode === 'words') {
      const label = lang === 'uz' ? `Klaviatura Testi – ${modeValue} so'z` :
        lang === 'ru' ? `Тест скорости – ${modeValue} слов` :
          `Typing Test – ${modeValue} words`;
      return `${label} | ${base}`;
    } else {
      const label = lang === 'uz' ? `Tezlik Testi – Vaqt rejimi` :
        lang === 'ru' ? `Тест скорости – Время` :
          `Typing Test – Time Mode`;
      return `${label} | ${base}`;
    }
  }, [lang, mode, modeValue]);

  const [targetText, setTargetText] = useState(() =>
    generateTargetText({ count: 100, difficulty, includePunctuation, includeNumbers })
  );

  const timeLimit = mode === 'time' ? modeValue : null;
  const { userInput, isFinished, handleInput, reset, stats, progress, timeLeft, lastAction } = useTypingEngine(targetText, timeLimit);

  // Track Test Start
  const testStartedRef = useRef(false);
  useEffect(() => {
    if (userInput.length === 1 && !testStartedRef.current) {
      testStartedRef.current = true;
      trackEvent("Typing", "Start Test", mode === 'time' ? `Time ${modeValue}s` : `Words ${modeValue}`);
    }
  }, [userInput.length, mode, modeValue]);

  // Track Test Completion
  useEffect(() => {
    if (isFinished && testStartedRef.current) {
      testStartedRef.current = false; // Reset for next test
      trackEvent("Typing", "Complete Test", `${modeValue} ${mode === 'time' ? 'Seconds' : 'Words'}`);
    }
  }, [isFinished, mode, modeValue]);

  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [isDonationVisible, setIsDonationVisible] = useState(false);

  const containerRef = useRef(null);

  // Focus the container on mount
  useEffect(() => {
    if (containerRef.current) containerRef.current.focus();
  }, []);

  // Keyboard Shortcuts (Esc, Tab, F)
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      handleRestart();
    } else if (e.key.toLowerCase() === 'f' && !isFinished) {
      e.preventDefault();
      setIsDistractionFree(prev => !prev);
    } else {
      handleInput(e.key);
    }
  }, [handleInput, isFinished]);

  const handleRestart = useCallback(() => {
    reset();
    testStartedRef.current = false;
    const wordCount = mode === 'words' ? modeValue : 100;
    setTargetText(generateTargetText({
      count: wordCount,
      difficulty,
      includePunctuation,
      includeNumbers
    }));
    setIsDistractionFree(false);
    if (containerRef.current) containerRef.current.focus();
  }, [reset, mode, modeValue, difficulty, includePunctuation, includeNumbers]);

  // If settings change, restart
  useEffect(() => {
    handleRestart();
  }, [mode, modeValue, difficulty, includePunctuation, includeNumbers, handleRestart]);

  // Split text into words for better rendering
  const wordsArray = useMemo(() => targetText.split(' '), [targetText]);

  // Calculate current word index based on targetText boundaries
  const currentWordIndex = useMemo(() => {
    const textUpToCursor = targetText.slice(0, userInput.length);
    return textUpToCursor.split(' ').length - 1;
  }, [userInput, targetText]);

  // Flash logic for mistakes
  useEffect(() => {
    if (lastAction === 'incorrect') {
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 200);
      return () => clearTimeout(timer);
    }
  }, [lastAction]);

  const charProcessedRef = useRef(0);
  charProcessedRef.current = 0;

  const isTyping = userInput.length > 0;

  // Copy to clipboard helper
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(t.donation.copySuccess);
  };

  return (
    <div
      className={`app-container ${showFlash ? 'shake' : ''}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseDown={() => containerRef.current?.focus()}
      ref={containerRef}
      style={{ outline: 'none' }}
    >
      <AnalyticsTracker />
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      {/* Brand Header */}
      <header className={`brand-header ${isDistractionFree && isTyping ? 'hidden' : ''}`}>
        <div className="brand-left">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
              <line x1="6" y1="8" x2="6.01" y2="8"></line>
              <line x1="10" y1="8" x2="10.01" y2="8"></line>
              <line x1="14" y1="8" x2="14.01" y2="8"></line>
              <line x1="18" y1="8" x2="18.01" y2="8"></line>
              <line x1="6" y1="12" x2="6.01" y2="12"></line>
              <line x1="10" y1="12" x2="10.01" y2="12"></line>
              <line x1="14" y1="12" x2="14.01" y2="12"></line>
              <line x1="18" y1="12" x2="18.01" y2="12"></line>
              <line x1="7" y1="16" x2="17" y2="16"></line>
            </svg>
          </div>
          <h1 className="brand-name">Typer.uz</h1>
        </div>
        <div className="brand-right">
          <nav className="lang-switcher">
            {['uz', 'ru', 'en'].map(l => (
              <button
                key={l}
                className={`lang-item ${lang === l ? 'active' : ''}`}
                onClick={() => setLang(l)}
              >
                {l}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className={`game-container ${showFlash ? 'mistake-flash' : ''}`}>
        {/* Header / Mode Selector */}
        <div className={`nav-header ${isDistractionFree ? 'hidden' : ''} ${isTyping ? 'fade-out' : ''}`}>
          <div className="nav-group">
            <button className={`nav-item ${mode === 'time' ? 'active' : ''}`} onClick={() => handleModeChange('time', 30)}>{t.modes.time}</button>
            <button className={`nav-item ${mode === 'words' ? 'active' : ''}`} onClick={() => handleModeChange('words', 25)}>{t.modes.words}</button>
          </div>
          <div className="nav-divider"></div>
          <div className="nav-group">
            {mode === 'time' ? (
              [15, 30, 60, 120].map(v => (
                <button key={v} className={`nav-item ${modeValue === v ? 'active' : ''}`} onClick={() => setModeValue(v)}>{v}</button>
              ))
            ) : (
              [10, 25, 50, 100].map(v => (
                <button key={v} className={`nav-item ${modeValue === v ? 'active' : ''}`} onClick={() => setModeValue(v)}>{v}</button>
              ))
            )}
          </div>
          <div className="nav-divider"></div>
          <div className="nav-group">
            <button className={`nav-item ${includePunctuation ? 'active' : ''}`} onClick={() => setIncludePunctuation(!includePunctuation)}>{t.modes.punctuation}</button>
            <button className={`nav-item ${includeNumbers ? 'active' : ''}`} onClick={() => setIncludeNumbers(!includeNumbers)}>{t.modes.numbers}</button>
          </div>
          <div className="nav-divider"></div>
          <div className="nav-group">
            {['common', 'rare', 'technical'].map(d => (
              <button key={d} className={`nav-item ${difficulty === d ? 'active' : ''}`} onClick={() => handleDifficultyChange(d)}>{t.difficulty[d]}</button>
            ))}
          </div>
          <div className="nav-divider"></div>
          <div className="nav-group">
            <button className="nav-item support-btn" onClick={() => setIsDonationVisible(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 000-7.78z"></path>
              </svg>
              {t.support}
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className={`live-counter ${isTyping ? 'visible' : ''}`}>
          {mode === 'time' ? (
            <span className="counter-value">{timeLeft}</span>
          ) : (
            <span className="counter-value">{currentWordIndex + 1}/{modeValue}</span>
          )}
        </div>

        {/* Typing Area */}
        <div className="typing-area">
          <div className="words-wrapper">
            {wordsArray.map((word, wordIdx) => {
              const isCurrent = wordIdx === currentWordIndex;
              const wordStartIdx = charProcessedRef.current;
              charProcessedRef.current += word.length + 1;

              return (
                <span key={wordIdx} className={`word ${isCurrent ? 'current' : ''}`}>
                  {word.split('').map((char, charIdx) => {
                    const absoluteIdx = wordStartIdx + charIdx;
                    let charClass = 'char';
                    const isTyped = absoluteIdx < userInput.length;
                    const isCorrect = isTyped && (userInput[absoluteIdx] === char);

                    if (isTyped) {
                      charClass += isCorrect ? ' correct' : ' incorrect';
                    }

                    const isCaretPosition = absoluteIdx === userInput.length;

                    return (
                      <span key={charIdx} className={charClass} style={{ position: 'relative' }}>
                        {isCaretPosition && <span className="caret"></span>}
                        {char}
                      </span>
                    );
                  })}
                  {wordIdx < wordsArray.length - 1 && (
                    <span
                      className={`char space ${userInput.length > wordStartIdx + word.length ? (userInput[wordStartIdx + word.length] === ' ' ? 'correct' : 'incorrect') : ''}`}
                      style={{ position: 'relative' }}
                    >
                      {userInput.length === wordStartIdx + word.length && <span className="caret"></span>}
                      {' '}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Bottom Menu */}
        <div className={`controls ${isDistractionFree && isTyping ? 'hidden' : ''}`}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button className="restart-button" onClick={handleRestart}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
              <span>{t.restart}</span>
            </button>
            <p className="shortcut-hint" dangerouslySetInnerHTML={{ __html: t.shortcutHint }}></p>
          </div>
        </div>
      </main>

      {/* Results Modal */}
      <div className={`results-modal ${isFinished ? 'visible' : ''}`}>
        <div className="results-card">
          <div className="results-header">
            <div className="main-stats-group">
              <div className="result-main">
                <div className="label">{t.results.wpm}</div>
                <div className="value large wpm-glow">{stats.wpm}</div>
              </div>
              <div className="result-main">
                <div className="label">{t.results.acc}</div>
                <div className="value large">{stats.accuracy}%</div>
              </div>
            </div>
            <div className="accuracy-progress-container">
              <div
                className="accuracy-progress-bar"
                style={{ width: isFinished ? `${stats.accuracy}%` : '0%' }}
              ></div>
            </div>
          </div>

          <div className="results-content">
            <div className="result-details-grid">
              <div className="detail-item">
                <div className="label">{t.results.testType}</div>
                <div className="value small highlight">{mode} {modeValue}</div>
                <div className="value small muted">{t.difficulty[difficulty]} {includePunctuation ? 'punct' : ''}</div>
              </div>
              <div className="detail-item">
                <div className="label">{t.results.raw}</div>
                <div className="value small highlight">{stats.rawWpm}</div>
              </div>
              <div className="detail-item">
                <div className="label">{t.results.characters}</div>
                <div className="value small highlight">
                  <span className="correct">{stats.characters.correct}</span>/
                  <span className="incorrect">{stats.characters.incorrect}</span>/
                  <span className="missed">{stats.characters.missed}</span>
                </div>
                <div className="value tiny muted">{t.results.charLabels}</div>
              </div>
              <div className="detail-item">
                <div className="label">{t.results.duration}</div>
                <div className="value small highlight">{stats.duration}s</div>
              </div>
            </div>
          </div>

          <div className="results-footer">
            <div className="actions-group">
              <button className="action-button" title="Next test" onClick={handleRestart}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button className="action-button" title="Restart test" onClick={handleRestart}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <div className={`results-modal ${isDonationVisible ? 'visible' : ''}`}>
        <div className="results-card donation-card">
          <div className="results-header">
            <h2 style={{ color: 'var(--accent-color)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>{t.donation.title}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{t.donation.desc}</p>
          </div>

          <div className="donation-grid">
            <div className="card-item" onClick={() => copyToClipboard('8600 0000 0000 0000')}>
              <div className="card-label">UZCARD / HUMO</div>
              <div className="card-number">8600 0000 0000 0000</div>
              <div className="copy-hint">Click to copy</div>
            </div>

            <div className="card-item" onClick={() => copyToClipboard('4444 0000 0000 0000')}>
              <div className="card-label">VISA / MASTERCARD</div>
              <div className="card-number">4444 0000 0000 0000</div>
              <div className="copy-hint">Click to copy</div>
            </div>
          </div>

          <div className="results-footer">
            <button className="restart-button primary" onClick={() => setIsDonationVisible(false)}>
              {t.donation.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
