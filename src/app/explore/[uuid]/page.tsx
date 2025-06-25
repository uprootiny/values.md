'use client';

import React, { useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useProgress } from '@/components/progress-context';
import { useDilemmaStore } from '@/store/dilemma-store';


export default function ExplorePage({ params }: { params: Promise<{ uuid: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { setProgress, hideProgress } = useProgress();
  
  // Zustand store
  const {
    dilemmas,
    currentIndex,
    selectedOption,
    reasoning,
    perceivedDifficulty,
    getCurrentDilemma,
    getCurrentDilemmaId,
    getProgress,
    setDilemmas,
    setSelectedOption,
    setReasoning,
    setPerceivedDifficulty,
    goToNext,
    goToPrevious,
    restoreResponseForIndex
  } = useDilemmaStore();
  
  // Auto-advance timer
  const autoAdvanceTimer = useRef<NodeJS.Timeout | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = React.useState<number | null>(null);
  
  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
      }
    };
  }, []);
  
  // Auto-advance when option is selected
  useEffect(() => {
    if (selectedOption && !autoAdvanceCountdown) {
      // Start countdown
      let countdown = 12; // 1.2 seconds in tenths
      setAutoAdvanceCountdown(countdown);
      
      const countdownInterval = setInterval(() => {
        countdown--;
        setAutoAdvanceCountdown(countdown);
        
        if (countdown <= 0) {
          clearInterval(countdownInterval);
          setAutoAdvanceCountdown(null);
          handleNext(); // Auto-advance
        }
      }, 100); // Update every 100ms for smooth countdown
      
      autoAdvanceTimer.current = countdownInterval;
    } else if (!selectedOption && autoAdvanceTimer.current) {
      // Clear timer if option is deselected
      clearTimeout(autoAdvanceTimer.current);
      setAutoAdvanceCountdown(null);
      autoAdvanceTimer.current = null;
    }
  }, [selectedOption]);
  
  // Clear timer when manually navigating
  const clearAutoAdvance = () => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    setAutoAdvanceCountdown(null);
  };
  
  const loading = dilemmas.length === 0;
  const currentDilemma = getCurrentDilemma();

  // Load dilemmas on mount or when UUID changes
  useEffect(() => {
    const fetchDilemmas = async () => {
      try {
        const response = await fetch(`/api/dilemmas/${resolvedParams.uuid}`);
        const data = await response.json();
        setDilemmas(data.dilemmas, resolvedParams.uuid);
      } catch (error) {
        console.error('Error fetching dilemmas:', error);
      }
    };
    
    // Only fetch if we don't have dilemmas or if starting UUID doesn't match current
    if (dilemmas.length === 0 || !dilemmas.some(d => d.dilemmaId === resolvedParams.uuid)) {
      fetchDilemmas();
    } else {
      // We have dilemmas, just update the current index to match the URL
      const targetIndex = dilemmas.findIndex(d => d.dilemmaId === resolvedParams.uuid);
      if (targetIndex !== -1 && targetIndex !== currentIndex) {
        setDilemmas(dilemmas, resolvedParams.uuid);
        restoreResponseForIndex(targetIndex);
      }
    }
  }, [resolvedParams.uuid, dilemmas, currentIndex, setDilemmas, restoreResponseForIndex]);

  // Update progress when dilemmas or index changes
  useEffect(() => {
    if (dilemmas.length > 0) {
      const progress = getProgress();
      setProgress(progress.current, progress.total);
    }
    return () => {
      hideProgress();
    };
  }, [currentIndex, dilemmas.length, setProgress, hideProgress, getProgress]);

  // Scroll to top when URL changes (direct navigation or initial load)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resolvedParams.uuid]);

  const handleNext = async () => {
    if (!selectedOption) return;
    
    // Clear auto-advance timer since user clicked manually
    clearAutoAdvance();

    const hasNext = goToNext();
    
    if (hasNext) {
      // Update URL to current dilemma without page reload
      const newDilemmaId = getCurrentDilemmaId();
      if (newDilemmaId) {
        router.push(`/explore/${newDilemmaId}`, { scroll: false });
      }
    } else {
      // All dilemmas completed, ensure final response is saved and wait for persistence
      console.log('🎯 Final dilemma completed, ensuring persistence...');
      
      // Small delay to ensure Zustand persist middleware has time to save to localStorage
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify the response was saved
      const finalResponses = JSON.parse(localStorage.getItem('dilemma-session') || '{}').responses || [];
      console.log('🎯 Final responses count:', finalResponses.length);
      
      router.push('/results');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      // Clear auto-advance timer
      clearAutoAdvance();
      
      goToPrevious();
      
      // Update URL to current dilemma without page reload
      const newDilemmaId = getCurrentDilemmaId();
      if (newDilemmaId) {
        router.push(`/explore/${newDilemmaId}`, { scroll: false });
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

  if (!loading && !currentDilemma) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Error loading dilemmas. Please try again.</p>
      </div>
    );
  }

  if (!currentDilemma) {
    return null; // Still loading
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
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

            {/* Difficulty rating */}
            <div className="space-y-3">
              <Label>How difficult was this dilemma to decide?</Label>
              <div className="space-y-2">
                <Slider
                  value={[perceivedDifficulty]}
                  onValueChange={(value) => setPerceivedDifficulty(value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 - Very Easy</span>
                  <span className="font-medium">{perceivedDifficulty}/10</span>
                  <span>10 - Very Hard</span>
                </div>
              </div>
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

            {/* Auto-advance indicator */}
            {autoAdvanceCountdown !== null && selectedOption && (
              <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary font-medium">
                  Auto-advancing in {(autoAdvanceCountdown / 10).toFixed(1)}s...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click Next to advance now, or click Previous to cancel
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-3">
                {autoAdvanceCountdown !== null && (
                  <div className="text-xs text-muted-foreground">
                    Auto-advancing...
                  </div>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!selectedOption}
                  className={autoAdvanceCountdown !== null ? "ring-2 ring-primary ring-opacity-50" : ""}
                >
                  {currentIndex === dilemmas.length - 1 ? 'Finish' : 'Next'}
                  {autoAdvanceCountdown !== null && (
                    <span className="ml-2 text-xs">
                      ({(autoAdvanceCountdown / 10).toFixed(1)}s)
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}