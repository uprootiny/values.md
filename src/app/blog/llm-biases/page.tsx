import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LLMBiasesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">LLM Biases Without VALUES.md</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Research findings on ethical biases in leading language models
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This article will present our research findings on the ethical biases exposed by leading LLMs 
              when making decisions without explicit values guidance, and how VALUES.md can address these issues.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}