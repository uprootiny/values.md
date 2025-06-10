# Claude Technical Architecture - Values.md

## Project Overview
Research platform for exploring personal values through ethical dilemmas to generate personalized "values.md" files for LLM alignment.

## Technical Stack
- **Frontend**: Next.js 15+ with TypeScript
- **Database**: PostgreSQL (Neon Cloud) with Drizzle ORM
- **LLM Services**: OpenRouter API
- **Authentication**: NextAuth.js with JWT sessions for admin
- **State Management**: Zustand with localStorage persistence
- **UI Components**: shadcn/ui with Tailwind CSS
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
  dilemma_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  dilemma_id UUID REFERENCES dilemmas(dilemma_id),
  chosen_option VARCHAR, -- a, b, c, or d
  reasoning TEXT,
  response_time INTEGER, -- milliseconds
  perceived_difficulty INTEGER, -- 1-10 scale
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
  dilemma_id UUID REFERENCES dilemmas(dilemma_id),
  chosen_option VARCHAR,
  reasoning TEXT,
  confidence_score DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (llm_id, dilemma_id)
)
```

## API Routes Structure

### Public Routes
- `GET /api/dilemmas/random` - Redirects to random dilemma UUID
- `GET /api/dilemmas/[uuid]` - Get 12 dilemmas starting with specific UUID
- `POST /api/responses` - Store user responses (anonymous)
- `GET /api/generate-values` - Generate values.md based on responses
- `GET /api/llm-comparison` - Compare user vs LLM responses
- `POST /api/demographics` - Store demographic data (optional)

### Admin Routes (Password Protected)
- `GET /api/admin/stats` - Usage statistics and analytics
- `POST /api/admin/generate-dilemma` - Generate new dilemma via OpenRouter
- `POST /api/admin/change-password` - Change admin password
- `GET /api/admin/dilemmas` - List all dilemmas with management
- `PUT /api/admin/dilemmas/:id` - Update dilemma
- `DELETE /api/admin/dilemmas/:id` - Remove dilemma
- `GET /api/admin/export` - Export research data

## User Journey Implementation

### Step 1: Landing Page (`/`)
- Explain values.md concept
- Show example dilemmas
- "Start Exploring" CTA button

### Step 2: Dilemma Session (`/explore/[uuid]`)
- UUID-based shareable URLs for each dilemma
- Progress indicator in sticky header (1/12)
- Dilemma presentation with 4 choices
- Perceived difficulty slider (1-10 scale)
- Optional reasoning text input
- Zustand store with localStorage persistence for responses
- Instant navigation between dilemmas (no page reloads)

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
- Password authentication with bcrypt hashing
- Password change functionality
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
- **Header**: Sticky navigation with progress slot and theme toggle
- **DilemmaCard**: 4-choice layout with difficulty slider
- **ProgressBar**: Integrated into header for seamless UX
- **ValuesMarkdownViewer**: Display generated values.md
- **ComparisonChart**: User vs LLM responses (future)
- **AdminDashboard**: Management interface with password change

### State Management
- **Zustand Store**: (`src/store/dilemma-store.ts`)
  - Manages dilemmas, responses, UI state
  - localStorage persistence for user privacy
  - Instant navigation without page reloads
  - Response auto-save and restoration

### Utilities
- **Progress Context**: React context for header progress display
- Session ID generation
- Motif pattern analysis (future)
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
- `npx tsx --env-file=.env scripts/seed-admin.ts` - Create admin user
- `npx tsx --env-file=.env scripts/seed-db.ts` - Seed database with sample data
- `npx tsx scripts/cleanup-db.ts` - Clean up database for fresh start

## Project Structure
```
src/
├── app/           # Next.js app router pages & API routes
│   ├── explore/[uuid]/  # Dynamic dilemma routes
│   ├── admin/     # Admin panel
│   ├── about/     # Static about page
│   ├── research/  # Static research page
│   └── api/       # API routes
├── components/    # Reusable UI components
│   ├── ui/        # shadcn/ui components
│   ├── header.tsx # Sticky navigation with progress
│   ├── progress-bar.tsx # Progress component
│   └── progress-context.tsx # Progress state management
├── lib/           # Database, utilities, external services
│   ├── auth.ts    # NextAuth.js with bcrypt authentication
│   ├── db.ts      # Database connection
│   ├── schema.ts  # Drizzle schema definitions
│   └── utils.ts   # Utility functions
├── store/         # Zustand state management
│   └── dilemma-store.ts # Core dilemma state with persistence
└── types/         # TypeScript type declarations
scripts/           # Database seeding and utility scripts
```

## Authentication Implementation

The admin authentication system uses NextAuth.js with:

### Key Features
- **JWT Sessions**: Credentials provider with JWT strategy
- **Database User Validation**: Admin user stored in PostgreSQL with bcrypt hashing
- **Secure Authentication**: Password stored as bcrypt hash in database
- **Session Persistence**: JWT tokens maintain login state
- **Role-based Access**: Admin role required for protected routes
- **Password Management**: Change password through admin interface

### Admin Login
- **Email**: `admin@values.md`
- **Password**: Initially set via `ADMIN_PASSWORD` (default: `hohoho`)
- **Access**: Available at `/admin` route
- **Password Change**: Use admin panel to update password securely

### Implementation Files
- `src/lib/auth.ts` - Centralized NextAuth configuration
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API handler
- `src/app/admin/page.tsx` - Admin panel with authentication
- `src/types/next-auth.d.ts` - TypeScript declarations for NextAuth
- `scripts/seed-admin.ts` - Creates admin user in database

### Database Tables (Auth.js Schema)
- `users` - User accounts with roles and bcrypt password hashes
- `accounts` - OAuth provider accounts  
- `sessions` - User sessions (unused with JWT)
- `verificationTokens` - Email verification tokens

## Current Implementation Status

✅ **Completed Features:**
- UUID-based shareable dilemma URLs (`/explore/[uuid]`)
- Sticky header with progress indicator and theme toggle
- Zustand state management with localStorage persistence
- Instant navigation between dilemmas (no page reloads)
- Perceived difficulty rating (1-10 slider)
- Admin authentication with bcrypt password hashing
- Admin password change functionality
- Mobile-responsive design with hamburger menu
- Progress tracking in header during dilemma sessions
- Database schema with UUID primary keys
- API routes for dilemma fetching and admin operations

🚧 **In Progress/Future:**
- Values.md generation algorithm
- LLM comparison functionality
- Results page implementation
- Data export and analytics
- OpenRouter integration for dilemma generation

## Key Technical Decisions

### Shareable URLs with Performance
- **Challenge**: Balance between shareable URLs and instant navigation
- **Solution**: Zustand store caches 12 dilemmas, URL updates don't trigger page reloads
- **Result**: Best of both worlds - instant UX + shareable individual dilemmas

### State Management Architecture
- **Choice**: Zustand over Redux/Context for simpler TypeScript integration
- **Persistence**: localStorage for user privacy (no server-side user tracking)
- **Structure**: Single store manages dilemmas, responses, and UI state

### Authentication Security
- **Password Storage**: bcrypt hashing in database (not environment variables)
- **Session Management**: JWT tokens with NextAuth.js
- **Admin Access**: Role-based with secure password change functionality

### UI/UX Decisions
- **Progress Display**: Moved from page content to sticky header for always-visible tracking
- **Theme Integration**: Dark/light mode support throughout with semantic color tokens
- **Mobile-First**: Responsive design with sheet-based mobile navigation