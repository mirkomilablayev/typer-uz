import { Link } from 'react-router-dom';
import { posts } from '../data/posts';
import './Blog.css';

function BlogList({ lang }) {
    const getPostData = (post) => {
        if (lang === 'ru') {
            return {
                title: post.titleRu || post.title,
                description: post.descriptionRu || post.description,
                path: `/ru/blog/${post.slug}`
            };
        }
        if (lang === 'uz') {
            return {
                title: post.titleUz || post.title,
                description: post.descriptionUz || post.description,
                path: `/blog/${post.slug}` // Defaulting to EN path structure but with UZ content if available
            };
        }
        return {
            title: post.title,
            description: post.description,
            path: `/blog/${post.slug}`
        };
    };

    return (
        <div className="blog-container">
            <header className="blog-header">
                <div className="blog-nav-top">
                    <Link to={lang === 'en' ? '/' : `/${lang}`} className="back-link-top">
                        {lang === 'ru' ? '← Назад к тесту' : lang === 'uz' ? '← Testga qaytish' : '← Back to Typing Test'}
                    </Link>
                </div>
                <h1>{lang === 'ru' ? 'Блог' : lang === 'uz' ? 'Blog' : 'Blog'}</h1>
                <p>
                    {lang === 'ru'
                        ? 'Узнайте больше о типировании, инструментах и продуктивности.'
                        : lang === 'uz'
                            ? 'Yozishni o\'rganish, asboblar va samaradorlik haqida ko\'proq ma\'lumot oling.'
                            : 'Learn more about typing, tools, and productivity.'}
                </p>
            </header>

            <div className="posts-grid">
                {posts.map(post => {
                    const data = getPostData(post);
                    return (
                        <Link key={post.slug} to={data.path} className="post-card">
                            <div className="post-date">{new Date(post.date).toLocaleDateString()}</div>
                            <h2 className="post-title">{data.title}</h2>
                            <p className="post-description">{data.description}</p>
                            <div className="read-more">
                                {lang === 'ru' ? 'Читать далее' : lang === 'uz' ? 'Batafsil o\'qish' : 'Read More'} →
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="blog-footer">
                <Link to={lang === 'en' ? '/' : `/${lang}`} className="back-link">
                    {lang === 'ru' ? '← Назад к тесту' : lang === 'uz' ? '← Testga qaytish' : '← Back to Typing Test'}
                </Link>
            </div>
        </div>
    );
}

export default BlogList;
