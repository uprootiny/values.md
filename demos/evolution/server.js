// server.js - Express backend for VALUES.MD Evolution Game

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const { parseValuesMD, ValuesMDSystem } = require('./lib/values-md');

// Optional LLM integration (choose one based on availability)
const { OpenAI } = require('openai'); // For OpenAI backend
// const { OpenRouter } = require('openrouter'); // For OpenRouter
// For Ollama: use fetch directly to the local API

// Create express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Initialize LLM client (if API key is available)
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Load default prompts
const defaultPrompts = {
  dilemmaGeneration: fs.readFile(path.join(__dirname, 'prompts', 'dilemma.txt'), 'utf8')
    .catch(() => `Given the VALUES.MD framework provided, generate a challenging ethical dilemma that tests the tensile strength of these values against each other. The dilemma should:
1. Create conflict between at least two core values in the framework
2. Represent a realistic scenario in contemporary society
3. Have no obvious "correct" answer
4. Include 3-4 possible choices with different value trade-offs
5. Be framed in a way that the decision-maker must prioritize some values over others

FRAMEWORK:
{valuesmd}

Generate a detailed dilemma in this format:
TITLE: [Evocative title]
SCENARIO: [Detailed description of the situation]
CHOICES:
A. [First choice with explanation]
B. [Second choice with explanation]
C. [Third choice with explanation]
D. [Fourth choice with explanation (optional)]
VALUE TENSIONS: [Explanation of which values are in tension and why]`),
  
  feedbackGeneration: fs.readFile(path.join(__dirname, 'prompts', 'feedback.txt'), 'utf8')
    .catch(() => `Analyze the decision made in the ethical dilemma below. Evaluate how well the decision aligns with the VALUES.MD framework, which values were prioritized, which were compromised, and what this reveals about potential strengths or weaknesses in the framework.

VALUES.MD FRAMEWORK:
{valuesmd}

DILEMMA:
{dilemma}

DECISION MADE:
{decision}

Provide detailed feedback that includes:
1. Value Alignment Analysis: How the decision aligns or conflicts with specific values and principles
2. Value Hierarchy Implications: What the decision reveals about value prioritization
3. Framework Strengths: Areas where the framework provided clear guidance
4. Framework Weaknesses: Areas where the framework was ambiguous, incomplete, or led to unsatisfying outcomes
5. Specific suggestions for how the VALUES.MD framework could be improved based on this case`),
  
  valuesUpdate: fs.readFile(path.join(__dirname, 'prompts', 'update.txt'), 'utf8')
    .catch(() => `Based on the ethical dilemma, decision, and feedback below, update the VALUES.MD framework to address the identified weaknesses while preserving its overall structure and strengths.

CURRENT VALUES.MD:
{valuesmd}

DILEMMA:
{dilemma}

DECISION MADE:
{decision}

FEEDBACK:
{feedback}

Create an improved version of the VALUES.MD framework that:
1. Clarifies value priorities where they were ambiguous
2. Adds or modifies principles to address identified gaps
3. Improves domain-specific guidance if relevant
4. Updates decision heuristics based on lessons learned
5. Preserves the core ethical identity while making it more robust

The updated VALUES.MD should maintain the same format but evolve to better handle similar situations in the future.`)
};

// Store pre-loaded dilemmas
let preloadedDilemmas = [];

// Load pre-defined dilemmas
async function loadPreDefinedDilemmas() {
  try {
    const dilemmasDir = path.join(__dirname, 'dilemmas');
    const files = await fs.readdir(dilemmasDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const dilemmaPath = path.join(dilemmasDir, file);
        const dilemmaContent = await fs.readFile(dilemmaPath, 'utf8');
        preloadedDilemmas.push(JSON.parse(dilemmaContent));
      }
    }
    
    console.log(`Loaded ${preloadedDilemmas.length} pre-defined dilemmas`);
  } catch (err) {
    console.error('Error loading pre-defined dilemmas:', err);
  }
}

// Generate text with an LLM
async function generateWithLLM(prompt, model = 'gpt-3.5-turbo') {
  // Validate OpenAI is initialized
  if (!openai) {
    throw new Error('OpenAI client not initialized. Please set OPENAI_API_KEY environment variable.');
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating with LLM:', error);
    throw error;
  }
}

// Replace template variables in a prompt
function fillPromptTemplate(template, variables) {
  let filledPrompt = template;
  for (const [key, value] of Object.entries(variables)) {
    filledPrompt = filledPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return filledPrompt;
}

// Endpoint to get default prompts
app.get('/api/prompts/defaults', async (req, res) => {
  try {
    const prompts = await Promise.all([
      defaultPrompts.dilemmaGeneration,
      defaultPrompts.feedbackGeneration,
      defaultPrompts.valuesUpdate
    ]);
    
    res.json({
      dilemmaGeneration: await prompts[0],
      feedbackGeneration: await prompts[1],
      valuesUpdate: await prompts[2]
    });
  } catch (err) {
    console.error('Error fetching default prompts:', err);
    res.status(500).json({ error: 'Error fetching default prompts' });
  }
});

// Endpoint to generate a dilemma
app.post('/api/generate/dilemma', async (req, res) => {
  const { valuesMD, prompt, usePreDefined } = req.body;
  
  try {
    // Parse VALUES.MD to validate it
    const parsedValues = parseValuesMD(valuesMD);
    if (!parsedValues || !parsedValues.coreValues || parsedValues.coreValues.length === 0) {
      return res.status(400).json({ error: 'Invalid VALUES.MD format or no core values found' });
    }
    
    // Use pre-defined dilemma if requested
    if (usePreDefined && preloadedDilemmas.length > 0) {
      // Find a dilemma that tests values in the VALUES.MD
      const relevantDilemmas = preloadedDilemmas.filter(dilemma => {
        const tensionValues = dilemma.tensionValues || [];
        return tensionValues.some(value => 
          parsedValues.coreValues.some(v => 
            v.name.toLowerCase().includes(value.toLowerCase())
          )
        );
      });
      
      if (relevantDilemmas.length > 0) {
        // Pick a random relevant dilemma
        const randomDilemma = relevantDilemmas[Math.floor(Math.random() * relevantDilemmas.length)];
        return res.json({
          dilemma: randomDilemma.content,
          source: 'pre-defined'
        });
      }
    }
    
    // Generate dilemma with LLM
    const filledPrompt = fillPromptTemplate(prompt, { valuesmd: valuesMD });
    const dilemma = await generateWithLLM(filledPrompt);
    
    res.json({
      dilemma,
      source: 'generated'
    });
  } catch (err) {
    console.error('Error generating dilemma:', err);
    res.status(500).json({ error: `Error generating dilemma: ${err.message}` });
  }
});

// Endpoint to generate feedback
app.post('/api/generate/feedback', async (req, res) => {
  const { valuesMD, dilemma, decision, prompt } = req.body;
  
  try {
    // Generate feedback with LLM
    const filledPrompt = fillPromptTemplate(prompt, { 
      valuesmd: valuesMD,
      dilemma,
      decision
    });
    
    const feedback = await generateWithLLM(filledPrompt);
    
    res.json({ feedback });
  } catch (err) {
    console.error('Error generating feedback:', err);
    res.status(500).json({ error: `Error generating feedback: ${err.message}` });
  }
});

// Endpoint to update VALUES.MD
app.post('/api/generate/update', async (req, res) => {
  const { valuesMD, dilemma, decision, feedback, prompt } = req.body;
  
  try {
    // Generate updated VALUES.MD with LLM
    const filledPrompt = fillPromptTemplate(prompt, { 
      valuesmd: valuesMD,
      dilemma,
      decision,
      feedback
    });
    
    const updatedValuesMD = await generateWithLLM(filledPrompt, 'gpt-4'); // Use GPT-4 for more complex updates
    
    res.json({ updatedValuesMD });
  } catch (err) {
    console.error('Error updating VALUES.MD:', err);
    res.status(500).json({ error: `Error updating VALUES.MD: ${err.message}` });
  }
});

// Endpoint to save game history
app.post('/api/history/save', async (req, res) => {
  const { history } = req.body;
  
  try {
    if (!history) {
      return res.status(400).json({ error: 'No history provided' });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `game-history-${timestamp}.json`;
    const historyDir = path.join(__dirname, 'history');
    
    // Ensure history directory exists
    await fs.mkdir(historyDir, { recursive: true });
    
    // Save history file
    await fs.writeFile(
      path.join(historyDir, filename),
      JSON.stringify(history, null, 2)
    );
    
    res.json({ 
      success: true,
      filename
    });
  } catch (err) {
    console.error('Error saving history:', err);
    res.status(500).json({ error: `Error saving history: ${err.message}` });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`VALUES.MD Evolution Game server running on port ${PORT}`);
  // Load pre-defined dilemmas
  loadPreDefinedDilemmas();
});
