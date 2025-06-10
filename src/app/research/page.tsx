export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Research</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Understanding personal values through ethical decision-making patterns for improved AI alignment.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Methodology</h2>
          <p className="mb-6">
            We present users with carefully constructed ethical dilemmas across various domains to identify underlying moral frameworks and value systems. Each dilemma is designed to reveal specific moral motifs and decision-making patterns.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Ethical Framework Analysis</h2>
          <p className="mb-6">
            Our system analyzes responses against established ethical frameworks including deontological, consequentialist, virtue ethics, and care ethics approaches to create personalized value profiles.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Applications</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>Personalized AI system alignment</li>
            <li>Understanding moral diversity in decision-making</li>
            <li>Improving human-AI collaboration</li>
            <li>Ethics education and self-reflection tools</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">Data & Privacy</h2>
          <p className="mb-6">
            All user data is anonymized and aggregated for research purposes. Individual responses are stored locally and only shared with explicit consent for research contribution.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Publications</h2>
          <p>
            Research findings and methodologies will be published in peer-reviewed journals and presented at relevant conferences in AI ethics and human-computer interaction.
          </p>
        </div>
      </div>
    </div>
  );
}