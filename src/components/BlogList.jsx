import { Link } from 'react-router-dom';
import { posts } from '../data/posts';
import './Blog.css';

function BlogList({ lang }) {
    const filteredPosts = posts.filter(post => post.lang === lang);

    return (
        <div className="blog-container">
            <header className="blog-header">
                <h1>Blog</h1>
                <p>Learn more about typing, tools, and productivity.</p>
            </header>

            <div className="posts-grid">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map(post => (
                        <Link key={post.slug} to={`/blog/${post.slug}`} className="post-card">
                            <div className="post-date">{new Date(post.date).toLocaleDateString()}</div>
                            <h2 className="post-title">{post.title}</h2>
                            <p className="post-description">{post.description}</p>
                            <div className="read-more">Read More →</div>
                        </Link>
                    ))
                ) : (
                    <p className="no-posts">No posts available in this language yet.</p>
                )}
            </div>

            <div className="blog-footer">
                <Link to={`/${lang}`} className="back-link">← Back to Typing Test</Link>
            </div>
        </div>
    );
}

export default BlogList;
