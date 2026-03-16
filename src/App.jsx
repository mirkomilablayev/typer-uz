import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import TypingGame from './components/TypingGame';
import BlogList from './components/BlogList';
import BlogPost from './components/BlogPost';
import './index.css';

function App() {
  const [lang, setLang] = useState('uz');
  const location = useLocation();

  // Sync Language from URL on mount and path changes
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const firstPart = pathParts[1];

    if (['uz', 'ru', 'en'].includes(firstPart)) {
      setLang(firstPart);
    }
  }, [location.pathname]);

  return (
    <Routes>
      {/* Home / Game Routes */}
      <Route path="/" element={<TypingGame lang={lang} setLang={setLang} />} />
      <Route path="/uz" element={<TypingGame lang="uz" setLang={setLang} />} />
      <Route path="/ru" element={<TypingGame lang="ru" setLang={setLang} />} />
      <Route path="/en" element={<TypingGame lang="en" setLang={setLang} />} />

      {/* Blog Routes */}
      <Route path="/blog" element={<BlogList lang={lang} />} />
      <Route path="/blog/:slug" element={<BlogPost lang={lang} />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
