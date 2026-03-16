import { useParams, Link, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { posts } from '../data/posts';
import './Blog.css';

function BlogPost({ lang }) {
    const { slug } = useParams();
    const location = useLocation();
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
    const fullUrl = `https://typer.uz${location.pathname}`;

    return (
        <div className="blog-container">
            <Helmet>
                <title>{`${data.title} | Typer.uz`}</title>
                <meta name="description" content={data.description} />
                <link rel="canonical" href={fullUrl} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={fullUrl} />
                <meta property="og:title" content={data.title} />
                <meta property="og:description" content={data.description} />
                <meta property="og:image" content="https://typer.uz/og-image.png" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={fullUrl} />
                <meta property="twitter:title" content={data.title} />
                <meta property="twitter:description" content={data.description} />
                <meta property="twitter:image" content="https://typer.uz/og-image.png" />
            </Helmet>

            <article className="post-article">
                <div className="post-meta">
                    <Link to={data.backPath} className="back-to-blog">
                        {lang === 'ru' ? '← К списку статей' : lang === 'uz' ? '← Maqolalar ro\'yxatiga' : '← Back to Articles'}
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
