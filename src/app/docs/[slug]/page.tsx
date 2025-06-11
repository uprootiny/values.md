import { notFound } from 'next/navigation';
import { getDocPages } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { components } from '@/components/mdx';

export async function generateStaticParams() {
  const docs = getDocPages();
  return docs.map((doc) => ({
    slug: doc.slug,
  }));
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDocPages().find((doc) => doc.slug === slug);

  if (!doc) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="mb-8 not-prose">
        <h1 className="text-4xl font-bold mb-4">{doc.metadata.title}</h1>
        {doc.metadata.summary && (
          <p className="text-xl text-muted-foreground">
            {doc.metadata.summary}
          </p>
        )}
      </header>

      <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
        <MDXRemote source={doc.content} components={components} />
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
  const doc = getDocPages().find((doc) => doc.slug === slug);

  if (!doc) {
    return {};
  }

  return {
    title: doc.metadata.title,
    description: doc.metadata.summary,
  };
}