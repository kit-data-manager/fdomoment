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