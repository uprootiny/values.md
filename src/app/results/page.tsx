'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ValuesResult {
  valuesMarkdown: string;
  motifAnalysis: Record<string, number>;
  topMotifs: string[];
}

export default function ResultsPage() {
  const [results, setResults] = useState<ValuesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    generateValues();
  }, []);

  const generateValues = async () => {
    try {
      const stored = localStorage.getItem('valuesResponses');
      if (!stored) {
        setError('No responses found. Please complete the dilemmas first.');
        setLoading(false);
        return;
      }

      const { sessionId } = JSON.parse(stored);
      
      const response = await fetch('/api/generate-values', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate values');
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error generating values:', error);
      setError('Failed to generate your values. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadValuesFile = () => {
    if (!results) return;
    
    const blob = new Blob([results.valuesMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'values.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyzing your values...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button asChild variant="outline">
            <Link href="/explore">Start Over</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Your Values Profile</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Motif Analysis */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Moral Framework</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results && Object.entries(results.motifAnalysis)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 6)
                  .map(([motif, count]) => (
                    <div key={motif} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium">{motif}</span>
                      <Badge variant="default">{count}</Badge>
                    </div>
                  ))}
              </div>
            </div>

            {/* Values Markdown Preview */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Values.md File</h2>
              <div className="bg-muted p-6 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {results?.valuesMarkdown}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={downloadValuesFile}>
                Download values.md
              </Button>
              <Button asChild variant="secondary">
                <Link href="/contribute">Contribute to Research</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/explore">Take Another Round</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">How to Use Your Values.md</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-muted-foreground">
              <p>• Include this file in your AI system prompts to guide decision-making</p>
              <p>• Share it with AI assistants when working on ethical decisions</p>
              <p>• Use it as a personal reference for your own moral reasoning</p>
              <p>• Update it over time as your values evolve</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}