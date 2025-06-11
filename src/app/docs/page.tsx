import Link from 'next/link';
import { getDocPages } from '@/lib/mdx';

export default function DocsPage() {
  const docs = getDocPages()
    .sort((a, b) => {
      const orderA = (a.metadata as any).order || 999;
      const orderB = (b.metadata as any).order || 999;
      return orderA - orderB;
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Documentation</h1>
      
      <nav className="space-y-4">
        {docs.map(doc => (
          <Link 
            key={doc.slug}
            href={`/docs/${doc.slug}`}
            className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <h2 className="text-xl font-semibold text-foreground">
              {doc.metadata.title}
            </h2>
            {doc.metadata.summary && (
              <p className="text-muted-foreground mt-1">
                {doc.metadata.summary}
              </p>
            )}
          </Link>
        ))}
        
        {docs.length === 0 && (
          <p className="text-muted-foreground">No documentation pages yet.</p>
        )}
      </nav>
    </div>
  );
}