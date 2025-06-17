import { notFound } from 'next/navigation';
import { getBlogPosts } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { formatDate } from '@/lib/mdx';
import { components } from '@/components/mdx';

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPosts().find((post) => post.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="mb-8 not-prose">
        <h1 className="text-4xl font-bold mb-4">{post.metadata.title}</h1>
        <p className="text-xl text-muted-foreground mb-2">
          {post.metadata.summary}
        </p>
        <time className="text-sm text-muted-foreground">
          {formatDate(post.metadata.publishedAt)}
        </time>
      </header>

      <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
        <MDXRemote source={post.content} components={components} />
      </div>
    </article>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPosts().find((post) => post.slug === slug);

  if (!post) {
    return {};
  }

  return {
    title: post.metadata.title,
    description: post.metadata.summary,
  };
}