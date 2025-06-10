# Claude Technical Architecture - Values.md

## Project Overview
Research platform for exploring personal values through ethical dilemmas to generate personalized "values.md" files for LLM alignment.

## Technical Stack
- **Frontend**: Next.js 14+ with TypeScript
- **Database**: PostgreSQL (Neon Cloud)
- **LLM Services**: OpenRouter API
- **Authentication**: NextAuth.js with JWT sessions for admin
- **Storage**: Local storage for privacy (user responses)
- **Deployment**: TBD

## Database Schema Design

### Core Tables
```sql
-- Ethical frameworks taxonomy
frameworks (
  framework_id VARCHAR PRIMARY KEY,
  name VARCHAR,
  tradition VARCHAR,
  key_principle TEXT,
  decision_method TEXT,
  lexical_indicators TEXT,
  computational_signature TEXT,
  historical_figure VARCHAR,
  modern_application TEXT
)

-- Moral motifs (behavioral patterns)
motifs (
  motif_id VARCHAR PRIMARY KEY,
  name VARCHAR,
  category VARCHAR,
  subcategory VARCHAR,
  description TEXT,
  lexical_indicators TEXT,
  behavioral_indicators TEXT,
  logical_patterns TEXT,
  conflicts_with TEXT,
  synergies_with TEXT,
  weight DECIMAL,
  cultural_variance VARCHAR,
  cognitive_load VARCHAR
)

-- Ethical dilemma scenarios
dilemmas (
  dilemma_id VARCHAR PRIMARY KEY,
  domain VARCHAR,
  generator_type VARCHAR,
  difficulty INTEGER,
  title VARCHAR,
  scenario TEXT,
  choice_a TEXT,
  choice_a_motif VARCHAR,
  choice_b TEXT,
  choice_b_motif VARCHAR,
  choice_c TEXT,
  choice_c_motif VARCHAR,
  choice_d TEXT,
  choice_d_motif VARCHAR,
  target_motifs TEXT,
  stakeholders TEXT,
  cultural_context VARCHAR,
  validation_score DECIMAL,
  realism_score DECIMAL,
  tension_strength DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
)

-- User responses (anonymous)
user_responses (
  response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR,
  dilemma_id VARCHAR REFERENCES dilemmas(dilemma_id),
  chosen_option VARCHAR, -- a, b, c, or d
  reasoning TEXT,
  response_time INTEGER, -- milliseconds
  created_at TIMESTAMP DEFAULT NOW()
)

-- User demographics (optional, anonymous)
user_demographics (
  session_id VARCHAR PRIMARY KEY,
  age_range VARCHAR,
  education_level VARCHAR,
  cultural_background VARCHAR,
  profession VARCHAR,
  consent_research BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
)

-- LLM baseline responses
llm_responses (
  llm_id VARCHAR,
  model_name VARCHAR,
  dilemma_id VARCHAR REFERENCES dilemmas(dilemma_id),
  chosen_option VARCHAR,
  reasoning TEXT,
  confidence_score DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (llm_id, dilemma_id)
)
```

## API Routes Structure

### Public Routes
- `GET /api/dilemmas/random` - Get 12 diverse dilemmas for user session
- `POST /api/responses` - Store user responses (anonymous)
- `GET /api/generate-values` - Generate values.md based on responses
- `GET /api/llm-comparison` - Compare user vs LLM responses
- `POST /api/demographics` - Store demographic data (optional)

### Admin Routes (Password Protected)
- `GET /api/admin/stats` - Usage statistics and analytics
- `POST /api/admin/generate-dilemma` - Generate new dilemma via OpenRouter
- `GET /api/admin/dilemmas` - List all dilemmas with management
- `PUT /api/admin/dilemmas/:id` - Update dilemma
- `DELETE /api/admin/dilemmas/:id` - Remove dilemma
- `GET /api/admin/export` - Export research data

## User Journey Implementation

### Step 1: Landing Page (`/`)
- Explain values.md concept
- Show example dilemmas
- "Start Exploring" CTA button

### Step 2: Dilemma Session (`/explore`)
- Progress indicator (1/12)
- Dilemma presentation with 4 choices
- Optional reasoning text input
- Local storage for responses
- Navigation between dilemmas

### Step 3: Results (`/results`)
- Generated values.md preview
- LLM comparison visualization
- Usage instructions
- Download values.md file

### Step 4: Contribution (`/contribute`)
- Consent for anonymous data sharing
- Demographics form (optional)
- Thank you + option for another round

### Step 5: Admin Panel (`/admin`)
- Password authentication
- Dilemma generation interface
- Statistics dashboard
- Data export tools

## Key Components to Build

### Data Layer
- Database connection (Neon PostgreSQL)
- Models for frameworks, motifs, dilemmas
- Response aggregation and analysis

### Services
- OpenRouter integration for LLM calls
- Dilemma selection algorithm (diversity scoring)
- Values.md generation algorithm
- LLM comparison service

### UI Components
- DilemmaCard with 4-choice layout
- ProgressTracker
- ValuesMarkdownViewer
- ComparisonChart (user vs LLMs)
- AdminDashboard

### Utilities
- Local storage management
- Session ID generation
- Motif pattern analysis
- Export/import functions

## Environment Variables
```
DATABASE_URL=postgresql://...
OPENROUTER_API_KEY=sk-...
ADMIN_PASSWORD=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

## Development Priorities
1. Database setup and schema migration
2. OpenRouter service integration
3. Basic dilemma presentation flow
4. Values.md generation algorithm
5. Admin interface for dilemma management
6. LLM baseline data collection
7. Analytics and export functionality

## Commands to Remember
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Code linting
- `npx tsc --noEmit` - TypeScript checking
- `npx drizzle-kit generate` - Generate database migrations
- `npx drizzle-kit push` - Push schema changes to database
- `npx tsx scripts/seed-admin.ts` - Create admin user

## Project Structure
```
src/
├── app/           # Next.js app router pages & API routes
├── components/    # Reusable UI components  
├── lib/           # Database, utilities, external services
│   ├── auth.ts    # NextAuth.js configuration
│   ├── db.ts      # Database connection
│   ├── schema.ts  # Drizzle schema definitions
│   └── utils.ts   # Utility functions
└── types/         # TypeScript type declarations
scripts/           # Database seeding and utility scripts
```

## Authentication Implementation

The admin authentication system uses NextAuth.js with:

### Key Features
- **JWT Sessions**: Credentials provider requires JWT strategy
- **Database User Validation**: Admin user stored in PostgreSQL
- **Environment Password**: Uses `ADMIN_PASSWORD` from .env
- **Session Persistence**: JWT tokens maintain login state
- **Role-based Access**: Admin role required for protected routes

### Admin Login
- **Email**: `admin@values.md`
- **Password**: Set via `ADMIN_PASSWORD` environment variable
- **Access**: Available at `/admin` route

### Implementation Files
- `src/lib/auth.ts` - Centralized NextAuth configuration
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API handler
- `src/app/admin/page.tsx` - Admin panel with authentication
- `src/types/next-auth.d.ts` - TypeScript declarations for NextAuth
- `scripts/seed-admin.ts` - Creates admin user in database

### Database Tables (Auth.js Schema)
- `users` - User accounts with roles
- `accounts` - OAuth provider accounts  
- `sessions` - User sessions (unused with JWT)
- `verificationTokens` - Email verification tokens