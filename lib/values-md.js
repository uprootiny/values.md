/**
 * VALUES.MD - A structured format for ethical frameworks
 * @version 0.1.0
 * @license MIT
 */

// Main parser for VALUES.MD files
export function parseValuesMD(content, options = {}) {
  // Default options
  const opts = {
    validateStructure: true,
    extractAlgorithms: true,
    ...options
  };
  
  // Initialize result object
  const result = {
    title: '',
    purpose: '',
    coreValues: [],
    guidingPrinciples: {},
    decisionHeuristics: {},
    domainFrameworks: {},
    ethicalAlgorithms: {},
    dilemmaTemplates: {},
    responseTemplates: {},
    valueProfiles: {},
    version: '',
    lastUpdated: ''
  };
  
  // Split content into sections
  const sections = splitIntoSections(content);
  
  // Extract title and version info
  const titleMatch = content.match(/^# VALUES\.MD: (.*?)(?:\nVersion: (.*?))?(?:\nLast Updated: (.*?))?$/m);
  if (titleMatch) {
    result.title = titleMatch[1] || '';
    result.version = titleMatch[2] || '';
    result.lastUpdated = titleMatch[3] || '';
  }
  
  // Extract purpose
  const purposeSection = sections.find(s => s.heading === 'Purpose');
  if (purposeSection) {
    result.purpose = purposeSection.content.trim();
  }
  
  // Extract core values
  const coreValuesSection = sections.find(s => s.heading === 'Core Values');
  if (coreValuesSection) {
    result.coreValues = extractCoreValues(coreValuesSection.content);
  }
  
  // Extract guiding principles
  const principlesSection = sections.find(s => s.heading === 'Guiding Principles');
  if (principlesSection) {
    result.guidingPrinciples = extractGuidingPrinciples(principlesSection.content);
  }
  
  // Extract decision heuristics
  const heuristicsSection = sections.find(s => s.heading === 'Decision Heuristics');
  if (heuristicsSection) {
    result.decisionHeuristics = extractDecisionHeuristics(heuristicsSection.content);
  }
  
  // Extract domain frameworks
  const domainsSection = sections.find(s => s.heading === 'Domain-Specific Value Frameworks' || 
                                          s.heading === 'Domain-Specific Frameworks');
  if (domainsSection) {
    result.domainFrameworks = extractDomainFrameworks(domainsSection.content);
  }
  
  // Extract ethical algorithms
  if (opts.extractAlgorithms) {
    const algorithmsSection = sections.find(s => s.heading === 'Ethical Algorithms');
    if (algorithmsSection) {
      result.ethicalAlgorithms = extractAlgorithms(algorithmsSection.content);
    }
  }
  
  // Extract templates
  const dilemmaSection = sections.find(s => s.heading === 'Dilemma-Specific Templates' || 
                                         s.heading === 'Dilemma Templates');
  if (dilemmaSection) {
    result.dilemmaTemplates = extractTemplates(dilemmaSection.content);
  }
  
  const responseSection = sections.find(s => s.heading === 'Response Templates' ||
                                          s.heading === 'Dilemma Response Templates');
  if (responseSection) {
    result.responseTemplates = extractTemplates(responseSection.content);
  }
  
  // Extract value profiles
  const profilesSection = sections.find(s => s.heading === 'Value-Weighting Templates' ||
                                          s.heading === 'Value Profiles');
  if (profilesSection) {
    result.valueProfiles = extractValueProfiles(profilesSection.content);
  }
  
  // Validate structure if requested
  if (opts.validateStructure) {
    validateValuesMDStructure(result);
  }
  
  return result;
}

// Helper function to split content into sections
function splitIntoSections(content) {
  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match ## Section headings
    const sectionMatch = line.match(/^## (.*?)$/);
    if (sectionMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        heading: sectionMatch[1].trim(),
        content: ''
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }
  
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}

// Extract core values from section content
function extractCoreValues(content) {
  const values = [];
  const valueRegex = /(\d+)\.\s+\*\*(.*?)\*\*:\s+(.*?)(?=\n\d+\.\s+\*\*|\n$|\n\n)/gs;
  
  let match;
  while ((match = valueRegex.exec(content)) !== null) {
    values.push({
      priority: parseInt(match[1]),
      name: match[2].trim(),
      description: match[3].trim()
    });
  }
  
  return values.sort((a, b) => a.priority - b.priority);
}

// Extract guiding principles from section content
function extractGuidingPrinciples(content) {
  const principles = {};
  const valueHeadingRegex = /### (.*?) Principles/g;
  
  let valueMatch;
  let lastIndex = 0;
  
  while ((valueMatch = valueHeadingRegex.exec(content)) !== null) {
    const valueName = valueMatch[1].trim();
    principles[valueName] = [];
    
    // Get content until next value heading or end
    const endIndex = content.indexOf('### ', valueMatch.index + 1);
    const valueContent = endIndex === -1 
      ? content.substring(valueMatch.index + valueMatch[0].length)
      : content.substring(valueMatch.index + valueMatch[0].length, endIndex);
    
    // Extract principles for this value
    const principleRegex = /-\s+\*\*(.*?)\*\*:\s+(.*?)(?=\n-\s+\*\*|\n$|\n\n)/gs;
    let principleMatch;
    
    while ((principleMatch = principleRegex.exec(valueContent)) !== null) {
      principles[valueName].push({
        name: principleMatch[1].trim(),
        description: principleMatch[2].trim()
      });
    }
    
    lastIndex = endIndex === -1 ? content.length : endIndex;
  }
  
  return principles;
}

// Extract decision heuristics from section content
function extractDecisionHeuristics(content) {
  const heuristics = {};
  const categoryRegex = /### (.*?)(?=\n)/g;
  
  let categoryMatch;
  let lastIndex = 0;
  
  while ((categoryMatch = categoryRegex.exec(content)) !== null) {
    const category = categoryMatch[1].trim();
    heuristics[category] = [];
    
    // Get content until next category or end
    const endIndex = content.indexOf('### ', categoryMatch.index + 1);
    const categoryContent = endIndex === -1 
      ? content.substring(categoryMatch.index + categoryMatch[0].length)
      : content.substring(categoryMatch.index + categoryMatch[0].length, endIndex);
    
    // Extract heuristics for this category
    const heuristicRegex = /(\d+)\.\s+\*\*(.*?)\*\*:\s+(.*?)(?=\n\d+\.\s+\*\*|\n$|\n\n)/gs;
    let heuristicMatch;
    
    while ((heuristicMatch = heuristicRegex.exec(categoryContent)) !== null) {
      heuristics[category].push({
        priority: parseInt(heuristicMatch[1]),
        name: heuristicMatch[2].trim(),
        description: heuristicMatch[3].trim()
      });
    }
    
    lastIndex = endIndex === -1 ? content.length : endIndex;
  }
  
  return heuristics;
}

// Extract domain frameworks from section content
function extractDomainFrameworks(content) {
  const domains = {};
  const domainRegex = /### (.*?)\n```yaml([\s\S]*?)```/g;
  
  let domainMatch;
  while ((domainMatch = domainRegex.exec(content)) !== null) {
    const domainName = domainMatch[1].trim();
    const yamlContent = domainMatch[2].trim();
    
    try {
      // Simple YAML parser for the specific format we expect
      const domain = parseSimpleYaml(yamlContent);
      domains[domainName] = domain;
    } catch (e) {
      console.error(`Error parsing domain ${domainName}:`, e);
    }
  }
  
  return domains;
}

// Extract algorithms from section content
function extractAlgorithms(content) {
  const algorithms = {};
  const algorithmRegex = /### (.*?)\n```([\s\S]*?)```/g;
  
  let algorithmMatch;
  while ((algorithmMatch = algorithmRegex.exec(content)) !== null) {
    const algorithmName = algorithmMatch[1].trim();
    const codeContent = algorithmMatch[2].trim();
    
    algorithms[algorithmName] = codeContent;
  }
  
  return algorithms;
}

// Extract templates from section content
function extractTemplates(content) {
  const templates = {};
  const templateRegex = /### (?:Template(?:\s+for)?\s*:?\s*)?(.*?)\n```(?:yaml)?([\s\S]*?)```/g;
  
  let templateMatch;
  while ((templateMatch = templateRegex.exec(content)) !== null) {
    const templateName = templateMatch[1].trim();
    const templateContent = templateMatch[2].trim();
    
    try {
      // For YAML templates
      if (templateContent.includes(':')) {
        templates[templateName] = parseSimpleYaml(templateContent);
      } else {
        // For text templates
        templates[templateName] = templateContent;
      }
    } catch (e) {
      console.error(`Error parsing template ${templateName}:`, e);
      templates[templateName] = templateContent;
    }
  }
  
  return templates;
}

// Extract value profiles from section content
function extractValueProfiles(content) {
  const profiles = {};
  const profileRegex = /### (.*?) Values Profile\n```yaml([\s\S]*?)```/g;
  
  let profileMatch;
  while ((profileMatch = profileRegex.exec(content)) !== null) {
    const profileName = profileMatch[1].trim();
    const yamlContent = profileMatch[2].trim();
    
    try {
      // Parse the YAML content
      const profile = parseSimpleYaml(yamlContent);
      profiles[profileName] = profile;
    } catch (e) {
      console.error(`Error parsing profile ${profileName}:`, e);
    }
  }
  
  return profiles;
}

// Simple YAML-like parser for our specific needs
function parseSimpleYaml(yamlContent) {
  const result = {};
  
  // Handle nested structure with indentation
  const lines = yamlContent.split('\n');
  let currentKey = null;
  let currentArray = null;
  let indentLevel = 0;
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Check if this is a key-value pair
    const keyValueMatch = line.match(/^(\s*)([^:]+):\s*(.*?)$/);
    if (keyValueMatch) {
      const [_, indent, key, value] = keyValueMatch;
      const currentIndent = indent.length;
      
      if (currentIndent === 0) {
        // Top-level key
        currentKey = key.trim();
        if (value.trim()) {
          // Simple value
          result[currentKey] = value.trim();
        } else {
          // Start of a nested structure or array
          result[currentKey] = {};
          indentLevel = 2; // Expecting next line to be indented
        }
        currentArray = null;
      } else if (currentIndent === indentLevel) {
        // Nested key in an object
        if (currentKey) {
          if (!result[currentKey]) result[currentKey] = {};
          result[currentKey][key.trim()] = value.trim() || {};
        }
      }
    } else {
      // Check if this is an array item
      const arrayItemMatch = line.match(/^(\s*)- (.*?)$/);
      if (arrayItemMatch) {
        const [_, indent, value] = arrayItemMatch;
        const currentIndent = indent.length;
        
        if (currentKey) {
          if (!result[currentKey]) result[currentKey] = [];
          if (!Array.isArray(result[currentKey])) {
            result[currentKey] = [result[currentKey]];
          }
          result[currentKey].push(value.trim());
          currentArray = currentKey;
        }
      }
    }
  }
  
  return result;
}

// Validate the structure of a parsed VALUES.MD
function validateValuesMDStructure(valuesMD) {
  // Basic validation - could be expanded
  if (!valuesMD.title) {
    console.warn('Warning: VALUES.MD missing title');
  }
  
  if (valuesMD.coreValues.length === 0) {
    console.warn('Warning: VALUES.MD missing core values');
  }
  
  if (Object.keys(valuesMD.guidingPrinciples).length === 0) {
    console.warn('Warning: VALUES.MD missing guiding principles');
  }
  
  return true;
}

// Main class for working with VALUES.MD
export class ValuesMDSystem {
  constructor(valuesMD) {
    this.valuesMD = valuesMD;
    this.valueEvaluator = new ValueEvaluator(valuesMD);
  }
  
  // Evaluate a decision against VALUES.MD
  evaluateDecision(decision, context = {}) {
    // Determine relevant domain for context
    const domain = this.getDomainForContext(context);
    
    // Evaluate against values
    const valueScores = this.valueEvaluator.evaluateAgainstValues(decision, domain);
    
    // Check minimum thresholds
    const passesThresholds = this.valueEvaluator.checkThresholds(valueScores);
    
    // Generate explanation
    const explanation = this.generateExplanation(decision, valueScores, domain, passesThresholds);
    
    return {
      decision,
      valueScores,
      passesThresholds,
      explanation,
      domain
    };
  }
  
  // Get relevant domain for a context
  getDomainForContext(context) {
    const domains = Object.keys(this.valuesMD.domainFrameworks || {});
    
    if (domains.length === 0) {
      return null;
    }
    
    if (context.domain && domains.includes(context.domain)) {
      return context.domain;
    }
    
    // Simple matching - could be more sophisticated
    for (const domain of domains) {
      const lowerDomain = domain.toLowerCase();
      if (context.type && lowerDomain.includes(context.type.toLowerCase())) {
        return domain;
      }
    }
    
    // Default to first domain
    return domains[0];
  }
  
  // Generate human-readable explanation
  generateExplanation(decision, valueScores, domain, passesThresholds) {
    // Get response template if available
    let template = null;
    if (this.valuesMD.responseTemplates && Object.keys(this.valuesMD.responseTemplates).length > 0) {
      const templates = Object.entries(this.valuesMD.responseTemplates);
      template = templates[0][1]; // Use first template for now
    }
    
    if (!template) {
      // Generate basic explanation
      if (!passesThresholds) {
        return `The decision does not align with core values, particularly ${this.getLowestScoringValues(valueScores, 2).join(' and ')}.`;
      }
      
      return `The decision aligns with core values, particularly ${this.getHighestScoringValues(valueScores, 2).join(' and ')}.`;
    }
    
    // Use template to generate explanation
    // This would be more sophisticated in a real implementation
    return template
      .replace('[decision]', JSON.stringify(decision))
      .replace('[values]', this.getHighestScoringValues(valueScores, 2).join(' and '))
      .replace('[domain]', domain || 'general')
      .replace('[outcome]', passesThresholds ? 'acceptable' : 'unacceptable');
  }
  
  // Get highest scoring values
  getHighestScoringValues(valueScores, count = 2) {
    return Object.entries(valueScores.valueScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([name]) => name);
  }
  
  // Get lowest scoring values
  getLowestScoringValues(valueScores, count = 2) {
    return Object.entries(valueScores.valueScores)
      .sort((a, b) => a[1] - b[1])
      .slice(0, count)
      .map(([name]) => name);
  }
}

// Helper class for value evaluation
class ValueEvaluator {
  constructor(valuesMD) {
    this.valuesMD = valuesMD;
  }
  
  // Evaluate a decision against core values
  evaluateAgainstValues(decision, domain) {
    const values = this.valuesMD.coreValues;
    const domainFramework = domain ? this.valuesMD.domainFrameworks[domain] : null;
    
    // Get priority order from domain or use default
    const priorityOrder = domainFramework && domainFramework.priorityOrder 
      ? domainFramework.priorityOrder 
      : values.map(v => v.name);
    
    // Score each value
    const scores = {};
    for (const value of values) {
      scores[value.name] = this.evaluateSingleValue(decision, value, domain);
    }
    
    // Calculate weighted score
    let weightedScore = 0;
    let totalWeight = 0;
    
    for (let i = 0; i < priorityOrder.length; i++) {
      const valueName = priorityOrder[i];
      if (typeof valueName !== 'string') continue;
      
      // Weight by inverse priority index (higher priority = higher weight)
      const weight = priorityOrder.length - i;
      if (scores[valueName] !== undefined) {
        weightedScore += scores[valueName] * weight;
        totalWeight += weight;
      }
    }
    
    const overallScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
    
    return {
      valueScores: scores,
      overallScore,
      priorityOrder
    };
  }
  
  // Evaluate a decision against a single value
  evaluateSingleValue(decision, value, domain) {
    // Simple scoring logic for demo purposes
    // In a real implementation, this would be more sophisticated
    
    // Generate a score between 0 and 1
    // This is a placeholder - real evaluation would be based on the specific value
    const random = Math.sin(this.hashCode(value.name + JSON.stringify(decision)) % 10000) * 0.5 + 0.5;
    
    // For domain-specific evaluation
    if (domain) {
      const domainFramework = this.valuesMD.domainFrameworks[domain];
      if (domainFramework && domainFramework.metrics) {
        // Domain-specific logic would go here
      }
    }
    
    return random;
  }
  
  // Check if scores pass minimum thresholds
  checkThresholds(valueScores) {
    // In a real implementation, this would check against configured thresholds
    // For now, just use a simple threshold
    return valueScores.overallScore >= 0.6;
  }
  
  // Simple hash function for deterministic "random" values
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }
}

// Validate a VALUES.MD file
export function validateValuesMD(valuesMD) {
  const errors = [];
  
  // Check required sections
  if (!valuesMD.title) {
    errors.push('Missing title');
  }
  
  if (valuesMD.coreValues.length === 0) {
    errors.push('Missing core values');
  }
  
  if (Object.keys(valuesMD.guidingPrinciples).length === 0) {
    errors.push('Missing guiding principles');
  }
  
  // Check value integrity
  const valueNames = valuesMD.coreValues.map(v => v.name);
  const principleValueNames = Object.keys(valuesMD.guidingPrinciples);
  
  for (const name of principleValueNames) {
    if (!valueNames.includes(name)) {
      errors.push(`Guiding principles reference undefined value: ${name}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Generate a VALUES.MD file from structured data
export function generateValuesMD(data) {
  let content = '';
  
  // Add title and metadata
  content += `# VALUES.MD: ${data.title || 'Ethical Framework'}\n`;
  if (data.version) {
    content += `Version: ${data.version}\n`;
  }
  if (data.lastUpdated) {
    content += `Last Updated: ${data.lastUpdated}\n`;
  }
  content += '\n';
  
  // Add purpose
  if (data.purpose) {
    content += `## Purpose\n${data.purpose}\n\n`;
  }
  
  // Add core values
  if (data.coreValues && data.coreValues.length > 0) {
    content += '## Core Values\n';
    for (let i = 0; i < data.coreValues.length; i++) {
      const value = data.coreValues[i];
      content += `${i+1}. **${value.name}**: ${value.description}\n`;
    }
    content += '\n';
  }
  
  // Add guiding principles
  if (data.guidingPrinciples && Object.keys(data.guidingPrinciples).length > 0) {
    content += '## Guiding Principles\n';
    for (const [valueName, principles] of Object.entries(data.guidingPrinciples)) {
      content += `### ${valueName} Principles\n`;
      for (const principle of principles) {
        content += `- **${principle.name}**: ${principle.description}\n`;
      }
      content += '\n';
    }
  }
  
  // Add decision heuristics
  if (data.decisionHeuristics && Object.keys(data.decisionHeuristics).length > 0) {
    content += '## Decision Heuristics\n';
    for (const [category, heuristics] of Object.entries(data.decisionHeuristics)) {
      content += `### ${category}\n`;
      for (let i = 0; i < heuristics.length; i++) {
        const heuristic = heuristics[i];
        content += `${i+1}. **${heuristic.name}**: ${heuristic.description}\n`;
      }
      content += '\n';
    }
  }
  
  // Add domain frameworks
  if (data.domainFrameworks && Object.keys(data.domainFrameworks).length > 0) {
    content += '## Domain-Specific Value Frameworks\n\n';
    for (const [domain, framework] of Object.entries(data.domainFrameworks)) {
      content += `### ${domain}\n\`\`\`yaml\n`;
      
      // Convert framework to YAML-like format
      for (const [key, value] of Object.entries(framework)) {
        if (Array.isArray(value)) {
          content += `${key}:\n`;
          for (const item of value) {
            content += `  - ${item}\n`;
          }
        } else if (typeof value === 'object') {
          content += `${key}:\n`;
          for (const [subKey, subValue] of Object.entries(value)) {
            content += `  ${subKey}: ${subValue}\n`;
          }
        } else {
          content += `${key}: ${value}\n`;
        }
      }
      
      content += '```\n\n';
    }
  }
  
  // Add ethical algorithms
  if (data.ethicalAlgorithms && Object.keys(data.ethicalAlgorithms).length > 0) {
    content += '## Ethical Algorithms\n\n';
    for (const [name, code] of Object.entries(data.ethicalAlgorithms)) {
      content += `### ${name}\n\`\`\`\n${code}\n\`\`\`\n\n`;
    }
  }
  
  // Add templates
  if (data.dilemmaTemplates && Object.keys(data.dilemmaTemplates).length > 0) {
    content += '## Dilemma Templates\n\n';
    for (const [name, template] of Object.entries(data.dilemmaTemplates)) {
      content += `### Template: ${name}\n`;
      if (typeof template === 'object') {
        content += '```yaml\n';
        // Convert template to YAML-like format
        for (const [key, value] of Object.entries(template)) {
          if (Array.isArray(value)) {
            content += `${key}:\n`;
            for (const item of value) {
              content += `  - ${item}\n`;
            }
          } else if (typeof value === 'object') {
            content += `${key}:\n`;
            for (const [subKey, subValue] of Object.entries(value)) {
              content += `  ${subKey}: ${subValue}\n`;
            }
          } else {
            content += `${key}: ${value}\n`;
          }
        }
        content += '```\n\n';
      } else {
        content += '```\n' + template + '\n```\n\n';
      }
    }
  }
  
  if (data.responseTemplates && Object.keys(data.responseTemplates).length > 0) {
    content += '## Response Templates\n\n';
    for (const [name, template] of Object.entries(data.responseTemplates)) {
      content += `### Template for ${name}\n\`\`\`\n${template}\n\`\`\`\n\n`;
    }
  }
  
  return content;
}

// Create a basic VALUES.MD file with common defaults
export function createBasicValuesMD(title, values = []) {
  const defaultValues = [
    {
      name: 'Integrity',
      description: 'We act with honesty and adhere to moral principles.'
    },
    {
      name: 'Autonomy',
      description: 'We respect individual agency and self-determination.'
    },
    {
      name: 'Fairness',
      description: 'We ensure equitable treatment and distribution.'
    }
  ];
  
  const actualValues = values.length > 0 ? values : defaultValues;
  
  const data = {
    title,
    purpose: 'This document establishes an ethical framework for decision-making.',
    coreValues: actualValues.map((v, i) => ({
      name: v.name,
      description: v.description,
      priority: i + 1
    })),
    guidingPrinciples: {}
  };
  
  // Add sample principles for each value
  for (const value of actualValues) {
    data.guidingPrinciples[value.name] = [
      {
        name: 'Principle 1',
        description: `First principle related to ${value.name.toLowerCase()}.`
      },
      {
        name: 'Principle 2',
        description: `Second principle related to ${value.name.toLowerCase()}.`
      }
    ];
  }
  
  return generateValuesMD(data);
}

// Export main functionality
export default {
  parseValuesMD,
  ValuesMDSystem,
  validateValuesMD,
  generateValuesMD,
  createBasicValuesMD
};
