import Link from 'next/link';
import { getBlogPosts, formatDate } from '@/lib/mdx';

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      
      <div className="space-y-6">
        {posts
          .sort((a, b) => {
            if (
              new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
            ) {
              return -1;
            }
            return 1;
          })
          .map((post) => (
            <article key={post.slug} className="border-b border-border pb-6">
              <Link 
                href={`/blog/${post.slug}`}
                className="block hover:opacity-80 transition-opacity"
              >
                <h2 className="text-2xl font-semibold mb-2 text-foreground">
                  {post.metadata.title}
                </h2>
                <p className="text-muted-foreground mb-2">
                  {post.metadata.summary}
                </p>
                <time className="text-sm text-muted-foreground">
                  {formatDate(post.metadata.publishedAt)}
                </time>
              </Link>
            </article>
          ))}
          
        {posts.length === 0 && (
          <p className="text-muted-foreground">No blog posts yet.</p>
        )}
      </div>
    </div>
  );
}