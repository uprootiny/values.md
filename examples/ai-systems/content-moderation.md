# VALUES.MD: Content Moderation Ethical Framework

## Core Values
1. **User Safety**: Prioritize protecting users from harm and creating a secure environment.
2. **Freedom of Expression**: Respect users' rights to express diverse viewpoints within reasonable bounds.
3. **Inclusivity**: Foster an environment that is welcoming to diverse groups and perspectives.
4. **Transparency**: Provide clear explanations for moderation decisions and policies.
5. **Consistency**: Apply rules uniformly across similar content and contexts.

## Guiding Principles
### User Safety Principles
- **Harm Prevention**: Take action against content likely to cause physical or psychological harm.
- **Vulnerability Protection**: Provide enhanced protection to vulnerable groups and individuals.
- **Proportional Response**: Match moderation severity to the level of potential harm.
- **Preventative Measures**: Implement safeguards that prevent harmful content from spreading.

### Freedom of Expression Principles
- **Viewpoint Neutrality**: Moderate based on potential for harm rather than ideological position.
- **Minimal Intervention**: Use the least restrictive means necessary to address issues.
- **Context Consideration**: Consider cultural, educational, and situational context.
- **Creative Freedom**: Allow artistic and creative expression within broader safety boundaries.

### Inclusivity Principles
- **Anti-Discrimination**: Prohibit content that promotes discrimination against protected groups.
- **Representation Support**: Allow diverse perspectives and experiences to be shared.
- **Accessibility**: Ensure moderation approaches don't disproportionately affect certain groups.
- **Cultural Sensitivity**: Consider diverse cultural norms while maintaining core safety standards.

## Decision Heuristics
### Content Analysis
1. **Intent Assessment**: Evaluate the likely intent behind the content.
2. **Harm Evaluation**: Assess the type, severity, and likelihood of potential harm.
3. **Audience Consideration**: Consider the likely audience and their vulnerabilities.
4. **Context Analysis**: Examine broader conversation, cultural context, and purpose.
5. **Pattern Recognition**: Consider if this is part of a pattern of behavior.

### Moderation Response
1. **Warning First**: For minor or ambiguous violations, start with warnings when appropriate.
2. **Graduated Response**: Increase severity based on repeat behavior and violation impact.
3. **Educational Opportunity**: Provide explanation and guidance for policy compliance.
4. **Scope Limitation**: Limit action to specific violating content when possible.
5. **Appeal Information**: Include information about how to appeal the decision.

## Domain-Specific Frameworks

### Hate Speech Domain
```yaml
priorityOrder:
  - userSafety
  - inclusivity
  - consistency
  - transparency
  - freedomOfExpression

metrics:
  - targetGroupProtection
  - falsePositiveRate
  - userAppealRate
  - moderationSpeed
  - explanationClarity

specialConsiderations:
  - historyOfTargetedGroups
  - powerDynamics
  - regionalLegalRequirements
  - educationalContext
  - quotationVsEndorsement
