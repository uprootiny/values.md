import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DatasetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Dilemmas Dataset</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the collection of ethical dilemmas used for values discovery
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page will provide detailed information about our curated dataset of ethical dilemmas, 
              including methodology, categorization, and research applications.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}