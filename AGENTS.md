# AGENTS.md - Codebase Guidelines for fdomoment

## Build/Lint/Test Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run start` - Start production server

### Linting
- `npm run lint` - Run ESLint for code style checking
- To lint specific files: `npx eslint <file-path>`

### Testing
- Currently no test framework configured (no jest.config.js found)
- To add tests: Create a `__tests__` directory or use `.test.ts`/`.test.tsx` files
- Run tests with: `npm run test` (would need to be configured)

## Database Configuration

### Overview
The application uses a database abstraction layer that supports switching between in-memory (testing) and PostgreSQL (production) databases via configuration.

### Environment Variables
| Variable | Description | Values | Default |
|----------|-------------|--------|---------|
| `DATABASE_TYPE` | Database driver to use | `in-memory`, `postgres` | `in-memory` |
| `DATABASE_URL` | PostgreSQL connection string (required for postgres) | PostgreSQL connection URL | - |

### Usage Examples

#### In-Memory (Testing/Development)
```bash
# Default - no configuration needed
npm run dev
```

#### PostgreSQL (Production)
```bash
DATABASE_TYPE=postgres DATABASE_URL=postgresql://user:pass@localhost:5432/fdomoment npm run start
```

### Database Schema

#### Users Table
- `user_name` (VARCHAR, PK): Username from KeyCloak
- `orcid` (VARCHAR): User's ORCID
- `email` (VARCHAR): User's email
- `last_login` (TIMESTAMP): Last login timestamp

#### FDO Records Table
- `pid` (VARCHAR, PK): Persistent Identifier
- `user_name` (VARCHAR, FK): Owner's username
- `orcid` (VARCHAR): Owner's ORCID
- `research_domain` (VARCHAR): Research domain
- `fair_score` (INTEGER): FAIR score (0-100)
- `created_at` (TIMESTAMP): Creation timestamp

#### FAIR Score Aggregations Table
- `id` (SERIAL, PK): Auto-increment ID
- `user_name` (VARCHAR, FK): Username
- `criterium` (VARCHAR): FAIR criterium (findable, accessible, interoperable, reusable)
- `total` (INTEGER): Summed score value

### API Endpoints
- `POST /api/database/user` - Create/update user
- `GET /api/database/user?userName=X` - Get user by username
- `GET /api/database/user` - Get all users
- `POST /api/database/fdo` - Create FDO record
- `GET /api/database/fdo?userName=X` - Get FDO records by user
- `GET /api/database/fdo` - Get all FDO records
- `POST /api/database/fair-score` - Upsert FAIR score aggregation
- `GET /api/database/fair-score?userName=X` - Get aggregations by user
- `GET /api/database/fair-score` - Get all aggregations

### Client Helper Functions
Import from `@/lib/database`:
```typescript
import { createUser, getUser, getAllUsers, createFdoRecord, getFdoRecords, upsertFairScoreAggregation, getFairScoreAggregations } from '@/lib/database';
```

## Code Style Guidelines

### TypeScript Configuration
- Target: ES2017
- Strict mode enabled
- JSX: react-jsx
- Paths: `@/*` maps to root directory

### Imports
- Use `@/*` for absolute imports from root
- Group imports by type (node modules, relative imports, local imports)
- Alphabetize imports within groups

### Formatting
- No Prettier configuration found (no .prettierrc)
- Use ESLint for styling (configured in package.json)
- Follow TypeScript strict mode rules

### Types
- Use TypeScript interfaces for object shapes
- Use type aliases for primitive types and unions
- Avoid `any` type - use specific types or `unknown` when necessary
- Use `interface` for object shapes, `type` for unions and primitives

### Naming Conventions
- Components: PascalCase (e.g., `MyComponent`)
- Functions: camelCase (e.g., `calculateTotal`)
- Variables: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Files: kebab-case for components, camelCase for utilities

### Error Handling
- Use TypeScript's type system to catch errors at compile time
- Use try/catch blocks for asynchronous operations
- Throw meaningful error messages
- Use `Error` class for custom errors

### React/Next.js Specific
- Use React 19 features where available
- Follow Next.js conventions for pages, components, and hooks
- Use `@/*` paths for imports from root
- Use TypeScript's strict mode for better type safety

### Additional Notes
- No Cursor or Copilot rules found in the codebase
- No test framework currently configured - consider adding Jest or Vitest
- No Prettier configuration - consider adding for consistent formatting
- ESLint is configured but no specific rules found in package.json
- TypeScript is configured with strict mode for better type safety