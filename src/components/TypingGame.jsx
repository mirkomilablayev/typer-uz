import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { generateTargetText } from '../data/words';
import { translations } from '../data/translations';
import { trackEvent } from '../utils/analytics';
import AnalyticsTracker from './AnalyticsTracker';
import '../index.css';

function TypingGame({ lang, setLang }) {
    const [mode, setMode] = useState('words'); // 'words' or 'time'
    const [modeValue, setModeValue] = useState(25); // count for words, seconds for time
    const [difficulty, setDifficulty] = useState('common');
    const [includePunctuation, setIncludePunctuation] = useState(false);
    const [includeNumbers, setIncludeNumbers] = useState(false);

    const isFirstMount = useRef(true);
    const location = useLocation();

    const t = translations[lang];

    // Track Language Switch
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        const langNames = { uz: 'Uzbek', ru: 'Russian', en: 'English' };
        trackEvent("Language", "Switch", langNames[lang]);
    }, [lang]);

    // Track Mode/Difficulty Changes
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
        const base = 'Typer.uz';
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

    const [translateY, setTranslateY] = useState(0);

    const [targetText, setTargetText] = useState(() =>
        generateTargetText({ count: 100, difficulty, includePunctuation, includeNumbers })
    );

    const timeLimit = mode === 'time' ? modeValue : null;
    const { userInput, isFinished, handleInput, reset, stats, progress, timeLeft, lastAction } = useTypingEngine(targetText, timeLimit);

    // Track Test Start
    const testStartedRef = useRef(false);
    useEffect(() => {
        if (userInput.length > 0 && !testStartedRef.current) {
            testStartedRef.current = true;
            trackEvent("Typing", "Start Test", `${modeValue} ${mode === 'time' ? 'Seconds' : 'Words'}`);
        }
    }, [userInput, mode, modeValue]);

    // Track Completion
    useEffect(() => {
        if (isFinished) {
            testStartedRef.current = false; // Reset for next test
            trackEvent("Typing", "Complete Test", `${modeValue} ${mode === 'time' ? 'Seconds' : 'Words'}`);
        }
    }, [isFinished, mode, modeValue]);

    const [isDistractionFree, setIsDistractionFree] = useState(false);
    const [showFlash, setShowFlash] = useState(false);

    const containerRef = useRef(null);

    // Focus the container on mount
    useEffect(() => {
        if (containerRef.current) containerRef.current.focus();
    }, []);

    // Keyboard Shortcuts (Esc, Tab, F)
    const handleRestart = useCallback(() => {
        reset();
        testStartedRef.current = false;
        setTranslateY(0);
        const wordCount = mode === 'words' ? modeValue : 200;
        setTargetText(generateTargetText({
            count: wordCount,
            difficulty,
            includePunctuation,
            includeNumbers
        }));
        setIsDistractionFree(false);
        if (containerRef.current) containerRef.current.focus();
    }, [reset, mode, modeValue, difficulty, includePunctuation, includeNumbers]);

    // Keyboard Shortcuts (Esc, Tab)
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' || e.key === 'Tab') {
            e.preventDefault();
            handleRestart();
        } else {
            handleInput(e.key);
        }
    }, [handleInput, handleRestart]);

    // Split text into words for better rendering
    const wordsArray = useMemo(() => targetText.split(' '), [targetText]);

    // Pre-calculate word start indices to avoid ref access during render
    const wordStartIndices = useMemo(() => {
        const indices = [];
        let current = 0;
        wordsArray.forEach(word => {
            indices.push(current);
            current += word.length + 1;
        });
        return indices;
    }, [wordsArray]);

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

    const isTyping = userInput.length > 0;

    // Scrolling Logic
    const wordsWrapperRef = useRef(null);
    const currentWordRef = useRef(null);

    useEffect(() => {
        if (currentWordRef.current && wordsWrapperRef.current) {
            const wordTop = currentWordRef.current.offsetTop;
            if (wordTop > 40) {
                setTranslateY(-(wordTop - 5)); // 5px buffer
            } else {
                setTranslateY(0);
            }
        }
    }, [currentWordIndex]);

    if (isFinished) {
        return (
            <div className="app-container game-view">
                <Helmet>
                    <title>{t.results} | Typer.uz</title>
                </Helmet>
                <div className="results-container">
                    <h2>{t.results}</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-label">WPM</span>
                            <span className="stat-value">{stats.wpm}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">{t.accuracy}</span>
                            <span className="stat-value">{stats.accuracy}%</span>
                        </div>
                    </div>
                    <button className="restart-button" onClick={handleRestart}>{t.restart}</button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`app-container game-view ${showFlash ? 'flash-incorrect' : ''}`}
            ref={containerRef}
            tabIndex="0"
            onKeyDown={handleKeyDown}
            style={{ outline: 'none' }}
        >
            <Helmet>
                <title>{pageTitle}</title>
            </Helmet>
            <AnalyticsTracker />

            <header className={`game-header ${isDistractionFree && isTyping ? 'hidden' : ''}`}>
                <div className="logo-section">
                    <span className="logo-emoji">⌨️</span>
                    <h1 className="logo-text">Typer.uz</h1>
                </div>

                <div className="nav-controls">
                    <div className="mode-toggle">
                        <button className={mode === 'words' ? 'active' : ''} onClick={() => handleModeChange('words', 25)}>{t.words}</button>
                        <button className={mode === 'time' ? 'active' : ''} onClick={() => handleModeChange('time', 30)}>{t.time}</button>
                    </div>

                    <div className="value-selector">
                        {mode === 'words' ? (
                            [10, 25, 50, 100].map(v => (
                                <button key={v} className={modeValue === v ? 'active' : ''} onClick={() => setModeValue(v)}>{v}</button>
                            ))
                        ) : (
                            [15, 30, 60, 120].map(v => (
                                <button key={v} className={modeValue === v ? 'active' : ''} onClick={() => setModeValue(v)}>{v}</button>
                            ))
                        )}
                    </div>

                    <div className="difficulty-selector">
                        <button className={difficulty === 'common' ? 'active' : ''} onClick={() => handleDifficultyChange('common')}>{t.easy}</button>
                        <button className={difficulty === 'expert' ? 'active' : ''} onClick={() => handleDifficultyChange('expert')}>{t.hard}</button>
                    </div>

                    <div className="language-selector">
                        <button className={lang === 'uz' ? 'active' : ''} onClick={() => setLang('uz')}>UZ</button>
                        <button className={lang === 'ru' ? 'active' : ''} onClick={() => setLang('ru')}>RU</button>
                        <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
                    </div>
                </div>
            </header>

            <main className="game-main">
                <div className="game-status">
                    {mode === 'time' && (
                        <div className="timer">{timeLeft}s</div>
                    )}
                    {mode === 'words' && (
                        <span className="counter-value">{currentWordIndex + 1}/{modeValue}</span>
                    )}
                </div>

                <div className="words-display">
                    <div
                        className="words-wrapper"
                        ref={wordsWrapperRef}
                        style={{ transform: `translateY(${translateY}px)` }}
                    >
                        {wordsArray.map((word, wordIdx) => {
                            const isCurrent = wordIdx === currentWordIndex;
                            const wordStartIdx = wordStartIndices[wordIdx];

                            return (
                                <span
                                    key={wordIdx}
                                    ref={isCurrent ? currentWordRef : null}
                                    className={`word ${isCurrent ? 'current' : ''}`}
                                >
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
            </main>

            <div className={`controls ${isDistractionFree && isTyping ? 'hidden' : ''}`}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <button className="restart-button" onClick={handleRestart}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                        </svg>
                        <span>{t.restart}</span>
                    </button>
                    <p className="shortcut-hint" dangerouslySetInnerHTML={{ __html: t.shortcutHint }}></p>

                    <div style={{ marginTop: '2rem' }}>
                        <a href="/blog" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2px' }}>Check out our Blog</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TypingGame;
