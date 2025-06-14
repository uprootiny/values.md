// Test live dilemma generation with actual OpenRouter API

console.log('🔥 Testing Live Dilemma Generation with OpenRouter API...\n');

// Test OpenRouter API connection
async function testOpenRouterConnection() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  console.log('1️⃣ Testing OpenRouter API Connection');
  
  if (!apiKey) {
    console.log('❌ OpenRouter API key not found in environment variables');
    console.log('Please set OPENROUTER_API_KEY environment variable');
    return false;
  }
  
  console.log(`API Key: ${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 10)}`);
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Values.md Research Platform'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are a test assistant. Respond with a simple JSON object containing a greeting.'
          },
          {
            role: 'user', 
            content: 'Say hello in JSON format: {"greeting": "your message"}'
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    console.log('✅ OpenRouter API connection successful');
    console.log(`Response: ${content}`);
    return true;
  } catch (error) {
    console.log('❌ OpenRouter API connection failed:', error.message);
    return false;
  }
}

// Test actual dilemma generation
async function testDilemmaGeneration() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  console.log('\n2️⃣ Testing Actual Dilemma Generation');
  
  if (!apiKey) {
    console.log('❌ OpenRouter API key not found in environment variables');
    return false;
  }
  
  const systemPrompt = `You are an expert in moral philosophy and ethical reasoning. Generate a challenging ethical dilemma for a research platform studying human values.

CONTEXT:
- Domain: technology
- Difficulty: 7/10 (where 10 is extremely challenging moral philosophy)
- Target ethical frameworks: utilitarian, deontological
- Target moral motifs: UTIL_CALC (utilitarian calculation), DUTY_CARE (duty of care)

DILEMMA REQUIREMENTS:
1. Present a realistic, contemporary scenario with genuine moral tension
2. Create exactly 4 distinct choices, each clearly mapping to different moral motifs
3. Ensure choices represent fundamentally different ethical approaches
4. Include sufficient detail for meaningful moral reasoning
5. Consider cultural sensitivity and research ethics
6. Generate significant philosophical tension between the options

Response format (valid JSON only):
{
  "title": "Specific, engaging title (max 60 chars)",
  "scenario": "Detailed scenario with context, stakeholders, and constraints (150-250 words)",
  "choices": [
    {"text": "Concrete action option A (40-80 words)", "motif": "UTIL_CALC"},
    {"text": "Concrete action option B (40-80 words)", "motif": "DUTY_CARE"},
    {"text": "Concrete action option C (40-80 words)", "motif": "EQUAL_TREAT"},
    {"text": "Concrete action option D (40-80 words)", "motif": "HARM_MINIMIZE"}
  ],
  "stakeholders": ["list", "of", "affected", "parties"],
  "culturalContext": "western_liberal",
  "tensionStrength": 0.8
}`;

  const userPrompt = 'Generate a novel ethical dilemma that would challenge thoughtful decision-makers and reveal their underlying moral frameworks. Focus on technology domain scenarios that modern people actually encounter.';

  try {
    console.log('Sending request to OpenRouter...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Values.md Research Platform'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 3000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    console.log('✅ Raw response received');
    console.log('Parsing JSON...');
    
    try {
      const parsed = JSON.parse(content);
      
      console.log('✅ Successfully generated dilemma:');
      console.log(`Title: ${parsed.title}`);
      console.log(`Scenario length: ${parsed.scenario.length} characters`);
      console.log(`Choices: ${parsed.choices.length} options`);
      console.log(`Stakeholders: ${parsed.stakeholders.join(', ')}`);
      console.log(`Cultural context: ${parsed.culturalContext}`);
      console.log(`Tension strength: ${parsed.tensionStrength}`);
      
      // Validate structure
      if (!parsed.title || !parsed.scenario || !parsed.choices || parsed.choices.length !== 4) {
        console.log('❌ Invalid dilemma structure');
        return false;
      }
      
      console.log('\n📝 Generated Dilemma Preview:');
      console.log(`"${parsed.title}"`);
      console.log(`${parsed.scenario.substring(0, 150)}...`);
      
      parsed.choices.forEach((choice, index) => {
        console.log(`${String.fromCharCode(65 + index)}: ${choice.text.substring(0, 60)}... (${choice.motif})`);
      });
      
      return true;
    } catch (parseError) {
      console.log('❌ JSON parsing failed:', parseError.message);
      console.log('Raw content:', content.substring(0, 200) + '...');
      return false;
    }
  } catch (error) {
    console.log('❌ Dilemma generation failed:', error.message);
    return false;
  }
}

// Test combinatorial generation (no API needed)
function testCombinatorialGeneration() {
  console.log('\n3️⃣ Testing Combinatorial Generation (No API)');
  
  const template = {
    title: 'AI Privacy vs Security Dilemma',
    scenarioTemplate: 'A tech company discovers that their {ai_system} has been {privacy_issue}. The company must decide how to respond to this {urgency_level} situation while balancing user privacy and security concerns.',
    choiceTemplates: [
      { text: 'Immediately disclose to all users and disable the system', motif: 'TRANSPARENCY' },
      { text: 'Fix the issue quietly without alerting users to avoid panic', motif: 'UTIL_CALC' },
      { text: 'Consult with privacy advocates before taking action', motif: 'STAKEHOLDER_CONSULT' },
      { text: 'Report to authorities and follow legal requirements exactly', motif: 'DUTY_LEGAL' }
    ],
    variables: [
      {
        name: 'ai_system',
        options: ['facial recognition system', 'recommendation algorithm', 'chatbot assistant']
      },
      {
        name: 'privacy_issue', 
        options: ['collecting data without consent', 'sharing data with third parties', 'storing sensitive information']
      },
      {
        name: 'urgency_level',
        options: ['critical', 'significant', 'concerning']
      }
    ]
  };
  
  // Generate substitutions
  const substitutions = {};
  for (const variable of template.variables) {
    substitutions[variable.name] = variable.options[Math.floor(Math.random() * variable.options.length)];
  }
  
  // Apply substitutions
  let scenario = template.scenarioTemplate;
  for (const [key, value] of Object.entries(substitutions)) {
    scenario = scenario.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  
  console.log('✅ Successfully generated combinatorial dilemma:');
  console.log(`Title: ${template.title}`);
  console.log(`Scenario: ${scenario}`);
  console.log(`Choices: ${template.choiceTemplates.length} options`);
  console.log(`Variables used: ${Object.keys(substitutions).join(', ')}`);
  
  return true;
}

// Run all tests
async function runAllTests() {
  console.log('Starting comprehensive live testing...\n');
  
  const connectionTest = await testOpenRouterConnection();
  const generationTest = connectionTest ? await testDilemmaGeneration() : false;
  const combinatorialTest = testCombinatorialGeneration();
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 LIVE TESTING RESULTS');
  console.log('='.repeat(60));
  
  console.log(`OpenRouter API Connection: ${connectionTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`AI Dilemma Generation: ${generationTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Combinatorial Generation: ${combinatorialTest ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = connectionTest && generationTest && combinatorialTest;
  
  console.log(`\n🎯 Overall Status: ${allPassed ? '✅ ALL SYSTEMS OPERATIONAL' : '⚠️ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🚀 Ready for production deployment!');
    console.log('Both AI-guided and combinatorial generation are working.');
  } else {
    console.log('\n🔧 Issues detected. Check API key and network connectivity.');
    console.log('Make sure OPENROUTER_API_KEY is set in your environment variables.');
  }
}

// Execute tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testOpenRouterConnection, testDilemmaGeneration, testCombinatorialGeneration, runAllTests };
} else {
  runAllTests().catch(console.error);
}