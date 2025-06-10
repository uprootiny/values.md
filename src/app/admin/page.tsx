'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GeneratedDilemma {
  title: string;
  scenario: string;
  choices: { text: string; motif: string }[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('admin@values.md');
  const [password, setPassword] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedDilemma, setGeneratedDilemma] = useState<GeneratedDilemma | null>(null);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('Authentication failed');
    }
  };

  const generateDilemma = async () => {
    setGenerating(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/generate-dilemma', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frameworks: ['UTIL_CALC', 'DEONT_ABSOLUTE'],
          motifs: ['UTIL_CALC', 'HARM_MINIMIZE'],
          domain: 'technology',
          difficulty: 7,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await signOut();
          return;
        }
        throw new Error('Failed to generate dilemma');
      }

      const data = await response.json();
      setGeneratedDilemma(data.dilemma);
    } catch (error) {
      setError('Failed to generate dilemma. Please try again.');
      console.error('Error:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-center">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
            {error && (
              <p className="mt-4 text-destructive text-sm text-center">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-3xl">Admin Dashboard</CardTitle>
            <Button 
              onClick={() => signOut()} 
              variant="outline"
            >
              Logout
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Generate New Dilemma</h2>
              <Button
                onClick={generateDilemma}
                disabled={generating}
                variant="default"
              >
                {generating ? 'Generating...' : 'Generate Dilemma'}
              </Button>
              {error && (
                <p className="text-destructive">{error}</p>
              )}
            </div>

            {generatedDilemma && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Generated Dilemma</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Title:</h4>
                    <p>{generatedDilemma.title}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Scenario:</h4>
                    <p>{generatedDilemma.scenario}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Choices:</h4>
                    <div className="space-y-2">
                      {generatedDilemma.choices.map((choice, index) => (
                        <Card key={index} className="p-3">
                          <p><strong>{String.fromCharCode(65 + index)}:</strong> {choice.text}</p>
                          <p className="text-sm text-muted-foreground mt-1">Motif: {choice.motif}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}