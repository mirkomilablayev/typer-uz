import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useTypingEngine - A custom hook for Monkeytype-like typing logic.
 * @param {string} targetText - The text to be typed.
 * @param {number} timeLimit - Optional time limit in seconds.
 */
export const useTypingEngine = (targetText, timeLimit = null) => {
    const [userInput, setUserInput] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [errorCount, setErrorCount] = useState(0);
    const [correctCharCount, setCorrectCharCount] = useState(0);
    const [lastAction, setLastAction] = useState(null);
    const [timeLeft, setTimeLeft] = useState(timeLimit);

    const timerRef = useRef(null);

    const reset = useCallback(() => {
        setUserInput('');
        setStartTime(null);
        setEndTime(null);
        setIsFinished(false);
        setErrorCount(0);
        setCorrectCharCount(0);
        setLastAction(null);
        setTimeLeft(timeLimit);
        if (timerRef.current) clearInterval(timerRef.current);
    }, [timeLimit]);

    const finish = useCallback(() => {
        setEndTime(Date.now());
        setIsFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    // Timer logic
    useEffect(() => {
        if (startTime && timeLimit && !isFinished) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        finish();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [startTime, timeLimit, isFinished, finish]);

    const handleInput = useCallback((key) => {
        if (isFinished) return;

        // Start timer on first keypress
        if (!startTime) {
            setStartTime(Date.now());
        }

        if (key === 'Backspace') {
            setUserInput(prev => prev.slice(0, -1));
            setLastAction('backspace');
            return;
        }

        if (key.length === 1) {
            // In word mode, prevent typing past targetText
            if (!timeLimit && userInput.length >= targetText.length) return;

            const expectedChar = targetText[userInput.length];
            const isCorrect = key === expectedChar;

            if (isCorrect) {
                setCorrectCharCount(prev => prev + 1);
                setLastAction('correct');
            } else {
                setErrorCount(prev => prev + 1);
                setLastAction('incorrect');
            }

            const newVal = userInput + key;
            setUserInput(newVal);

            // Check for finish in word mode
            if (!timeLimit && newVal.length === targetText.length) {
                finish();
            }
        }
    }, [userInput, targetText, isFinished, startTime, timeLimit, finish]);

    // Calculate stats
    const getStats = useCallback(() => {
        if (!startTime) return { wpm: 0, rawWpm: 0, accuracy: 100, errors: 0, characters: { correct: 0, incorrect: 0, extra: 0, missed: 0 } };

        const now = endTime || Date.now();
        const durationSec = (now - startTime) / 1000;
        const timeInMinutes = durationSec / 60;

        if (timeInMinutes <= 0) return { wpm: 0, rawWpm: 0, accuracy: 100, errors: errorCount, characters: { correct: 0, incorrect: 0, extra: 0, missed: 0 } };

        // Standard WPM = (Correct Characters / 5) / TimeInMinutes
        const wpm = Math.max(0, Math.round((correctCharCount / 5) / timeInMinutes));

        // Raw WPM = (Total Typed Characters / 5) / TimeInMinutes
        const rawWpm = Math.max(0, Math.round((userInput.length / 5) / timeInMinutes));

        const totalTyped = userInput.length;
        const accuracy = totalTyped === 0 ? 100 : Math.max(0, Math.round((correctCharCount / totalTyped) * 100));

        // Missed characters (only really applicable for finished word mode)
        const missed = !timeLimit && isFinished ? Math.max(0, targetText.length - userInput.length) : 0;

        return {
            wpm,
            rawWpm,
            accuracy,
            errors: errorCount,
            duration: Math.round(durationSec),
            characters: {
                correct: correctCharCount,
                incorrect: errorCount,
                extra: 0, // Simplified for now
                missed
            }
        };
    }, [startTime, endTime, userInput.length, correctCharCount, errorCount, isFinished, timeLimit, targetText.length]);

    return {
        userInput,
        isFinished,
        handleInput,
        reset,
        stats: getStats(),
        progress: timeLimit ? ((timeLimit - timeLeft) / timeLimit) * 100 : (userInput.length / targetText.length) * 100,
        timeLeft,
        lastAction,
    };
};


