# Claude Technical Architecture - Values.md

## Project Overview
Research platform for exploring personal values through ethical dilemmas to generate personalized "values.md" files for LLM alignment.

## Technical Stack
- **Frontend**: Next.js 15+ with TypeScript
- **Database**: PostgreSQL (Neon Cloud) with Drizzle ORM
- **LLM Services**: OpenRouter API
- **Authentication**: NextAuth.js with JWT sessions for admin
- **State Management**: Zustand with localStorage persistence
- **UI Components**: shadcn/ui with Tailwind CSS v4
- **Storage**: Local storage for privacy (user responses)
- **Deployment**: TBD

## Tailwind CSS Notes
- WE ARE USING TAILWIND v4