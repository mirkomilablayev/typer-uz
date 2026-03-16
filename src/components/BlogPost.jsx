import { useParams, Link, Navigate } from 'react-router-dom';
import { posts } from '../data/posts';
import './Blog.css';

function BlogPost({ lang }) {
    const { slug } = useParams();
    const post = posts.find(p => p.slug === slug);

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    return (
        <div className="blog-container">
            <article className="post-article">
                <div className="post-meta">
                    <Link to="/blog" className="back-to-blog">← Back to Blog</Link>
                    <span className="post-date">{new Date(post.date).toLocaleDateString()}</span>
                </div>

                <h1 className="article-title">{post.title}</h1>
                <p className="article-description">{post.description}</p>

                <div
                    className="article-content"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="article-footer">
                    <Link to={`/${lang}`} className="cta-button">Go Start Typing Practice</Link>
                </div>
            </article>
        </div>
    );
}

export default BlogPost;
