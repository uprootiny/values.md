import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold">values.md</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover your personal values through ethical dilemmas and generate 
            your personalized values.md file to guide AI systems aligned with your principles.
          </p>
        </div>
        
        <div className="space-y-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  <p className="text-muted-foreground">Answer 12 carefully crafted ethical dilemmas</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                  <p className="text-muted-foreground">See how your choices reflect different moral frameworks</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  <p className="text-muted-foreground">Generate your personalized values.md file</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                  <p className="text-muted-foreground">Use it to instruct AI systems to make choices aligned with your values</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button asChild size="lg" className="text-lg py-6 px-8">
            <Link href="/explore">
              Start Exploring Your Values
            </Link>
          </Button>
          
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Your responses are stored locally for privacy. You can optionally contribute 
            anonymously to research at the end.
          </p>
        </div>
      </div>
    </div>
  );
}
