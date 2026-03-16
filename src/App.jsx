import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import TypingGame from './components/TypingGame';
import BlogList from './components/BlogList';
import BlogPost from './components/BlogPost';
import './index.css';

function App() {
  const [lang, setLang] = useState('uz');
  const location = useLocation();
  const navigate = useNavigate();

  // Sync Language from URL on mount and path changes
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const firstPart = pathParts[1];

    if (['uz', 'ru', 'en'].includes(firstPart)) {
      setLang(firstPart);
    } else if (firstPart === 'blog') {
      setLang('en');
    }
  }, [location.pathname]);

  const handleLangChange = (newLang) => {
    setLang(newLang);

    const pathParts = location.pathname.split('/');
    const firstPart = pathParts[1];

    // Handle Game Routes
    if (firstPart === '' || ['uz', 'ru', 'en'].includes(firstPart)) {
      navigate(`/${newLang}`);
      return;
    }

    // Handle Blog Routes
    if (firstPart === 'blog' || (firstPart === 'ru' && pathParts[2] === 'blog')) {
      if (newLang === 'ru') {
        const newPath = location.pathname.replace('/blog', '/ru/blog');
        navigate(newPath);
      } else if (newLang === 'en' || newLang === 'uz') {
        const newPath = location.pathname.replace('/ru/blog', '/blog');
        navigate(newPath);
      }
    }
  };

  return (
    <Routes>
      {/* Home / Game Routes */}
      <Route path="/" element={<TypingGame lang={lang} setLang={handleLangChange} />} />
      <Route path="/uz" element={<TypingGame lang={lang} setLang={handleLangChange} />} />
      <Route path="/ru" element={<TypingGame lang={lang} setLang={handleLangChange} />} />
      <Route path="/en" element={<TypingGame lang={lang} setLang={handleLangChange} />} />

      {/* English Blog Routes */}
      <Route path="/blog" element={<BlogList lang="en" />} />
      <Route path="/blog/:slug" element={<BlogPost lang="en" />} />

      {/* Russian Blog Routes */}
      <Route path="/ru/blog" element={<BlogList lang="ru" />} />
      <Route path="/ru/blog/:slug" element={<BlogPost lang="ru" />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
