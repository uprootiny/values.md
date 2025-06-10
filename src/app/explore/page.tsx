'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Dilemma {
  dilemmaId: string;
  title: string;
  scenario: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  domain: string;
}

interface Response {
  dilemmaId: string;
  chosenOption: string;
  reasoning: string;
  responseTime: number;
}

export default function ExplorePage() {
  const [dilemmas, setDilemmas] = useState<Dilemma[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [reasoning, setReasoning] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const router = useRouter();

  useEffect(() => {
    fetchDilemmas();
  }, []);

  const fetchDilemmas = async () => {
    try {
      const response = await fetch('/api/dilemmas/random');
      const data = await response.json();
      setDilemmas(data.dilemmas);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dilemmas:', error);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!selectedOption) return;

    const responseTime = Date.now() - startTime;
    const newResponse: Response = {
      dilemmaId: dilemmas[currentIndex].dilemmaId,
      chosenOption: selectedOption,
      reasoning,
      responseTime,
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);
    
    // Store in localStorage for privacy
    localStorage.setItem('valuesResponses', JSON.stringify({
      sessionId,
      responses: updatedResponses
    }));

    if (currentIndex < dilemmas.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption('');
      setReasoning('');
      setStartTime(Date.now());
    } else {
      // All dilemmas completed, go to results
      router.push('/results');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Restore previous response
      const prevResponse = responses[currentIndex - 1];
      if (prevResponse) {
        setSelectedOption(prevResponse.chosenOption);
        setReasoning(prevResponse.reasoning);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ethical dilemmas...</p>
        </div>
      </div>
    );
  }

  if (dilemmas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Error loading dilemmas. Please try again.</p>
      </div>
    );
  }

  const currentDilemma = dilemmas[currentIndex];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm text-muted-foreground">{currentIndex + 1} of {dilemmas.length}</span>
          </div>
          <Progress value={((currentIndex + 1) / dilemmas.length) * 100} className="h-2" />
        </div>

        {/* Dilemma card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{currentDilemma.domain}</Badge>
            </div>
            <CardTitle className="text-3xl mb-4">
              {currentDilemma.title}
            </CardTitle>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {currentDilemma.scenario}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Choices */}
            <div className="space-y-4">
              {[
                { option: 'a', text: currentDilemma.choiceA },
                { option: 'b', text: currentDilemma.choiceB },
                { option: 'c', text: currentDilemma.choiceC },
                { option: 'd', text: currentDilemma.choiceD },
              ].map(({ option, text }) => (
                <label
                  key={option}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedOption === option
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="choice"
                    value={option}
                    checked={selectedOption === option}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-start space-x-3">
                    <span className="bg-muted text-muted-foreground rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                      {option.toUpperCase()}
                    </span>
                    <p className="flex-1">{text}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Optional reasoning */}
            <div className="space-y-2">
              <Label htmlFor="reasoning">Optional: Explain your reasoning</Label>
              <Textarea
                id="reasoning"
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder="Why did you choose this option? (optional)"
                rows={3}
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedOption}
              >
                {currentIndex === dilemmas.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}