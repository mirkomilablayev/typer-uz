import { useParams, Link, Navigate } from 'react-router-dom';
import { posts } from '../data/posts';
import './Blog.css';

function BlogPost({ lang }) {
    const { slug } = useParams();
    const post = posts.find(p => p.slug === slug);

    if (!post) {
        const redirectPath = lang === 'ru' ? '/ru/blog' : '/blog';
        return <Navigate to={redirectPath} replace />;
    }

    const getPostContent = () => {
        if (lang === 'ru') {
            return {
                title: post.titleRu || post.title,
                description: post.descriptionRu || post.description,
                content: post.contentRu || post.content,
                backPath: '/ru/blog'
            };
        }
        if (lang === 'uz') {
            return {
                title: post.titleUz || post.title,
                description: post.descriptionUz || post.description,
                content: post.contentUz || post.content,
                backPath: '/blog'
            };
        }
        return {
            title: post.title,
            description: post.description,
            content: post.content,
            backPath: '/blog'
        };
    };

    const data = getPostContent();

    return (
        <div className="blog-container">
            <article className="post-article">
                <div className="post-meta">
                    <Link to={data.backPath} className="back-to-blog">
                        {lang === 'ru' ? '← К блогу' : lang === 'uz' ? '← Blogga' : '← Back to Blog'}
                    </Link>
                    <span className="post-date">{new Date(post.date).toLocaleDateString()}</span>
                </div>

                <h1 className="article-title">{data.title}</h1>
                <p className="article-description">{data.description}</p>

                <div
                    className="article-content"
                    dangerouslySetInnerHTML={{ __html: data.content }}
                />

                <div className="article-footer">
                    <Link to={lang === 'en' ? '/' : `/${lang}`} className="cta-button">
                        {lang === 'ru' ? 'Начать тренировку печати' : lang === 'uz' ? 'Yozishni mashq qilishni boshlang' : 'Go Start Typing Practice'}
                    </Link>
                </div>
            </article>
        </div>
    );
}

export default BlogPost;
