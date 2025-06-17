import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FormatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">VALUES.md File Format</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A standardized format for expressing personal values and ethical frameworks for AI systems
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page will contain detailed documentation about the VALUES.md file format specification, 
              including syntax, structure, and implementation guidelines for AI systems.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}