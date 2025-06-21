# Fantasy Baseball Draft Site

A Next.js application for managing fantasy baseball leagues, drafts, and player data.

## Quick Start

```bash
# 1. Clone and install
npm install

# 2. Setup environment
cp .env.example .env.local
# Fill in your environment variables

# 3. Start database
npm run up

# 4. Setup database
npm run migratedev
npm run seed

# 5. Start development
npm run dev
```

## Project Overview

This is a full-stack fantasy baseball application built with:
- **Frontend**: Next.js 15 with React 19, TypeScript, TailwindCSS + DaisyUI
- **Backend**: Next.js API routes with Prisma ORM
- **Database**: PostgreSQL (via Prisma)
- **Authentication**: NextAuth.js (username/password)
- **Storage**: Supabase buckets for images and documents
- **Real-time**: Supabase realtime for live draft updates
- **State Management**: Redux RTK Query
- **Testing**: Jest (unit tests) + Cypress (e2e tests)
- **CI/CD**: GitHub Actions with automatic tagging

## Key Documentation Links
- [DaisyUI Components](https://daisyui.com/components/) - UI component library
- [Prisma Documentation](https://www.prisma.io/docs) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [Supabase Realtime](https://supabase.com/docs/guides/realtime) - Live draft updates
- [Supabase Storage](https://supabase.com/docs/guides/storage) - File uploads and buckets

## Important Commands

**Most Used:**
- `npm run dev` - Start development server
- `npm run lint` - Run ESLint (run before committing)
- `npm run build` - Build for production
- `npm run up` - Start database container
- `npm run jest` - Run unit tests
- `npm run migratedev` - Create database migration

**Database:**
- `npm run migrate` - Deploy migrations and generate Prisma client
- `npm run syncdb` - Format schema, generate client, and push to database
- `npm run resetdb` - Reset database and sync (when things break)
- `npm run seed` - Seed database with initial data
- `npm run unseed` - Remove seeded data

**Docker:**
- `npm run up` - Start PostgreSQL database container and follow logs
- `npm run down` - Stop database container

**Testing:**
- `npm run jest` - Run Jest unit tests
- `npm run cypress:open` - Open Cypress test runner
- `npm run cypress` - Run Cypress tests headlessly

## Project Structure

### Key Directories
- `src/app/` - Next.js app router pages and API routes
- `src/components/` - Reusable React components
- `src/hooks/` - Custom React hooks for data fetching
- `src/store/` - Redux store slices
- `src/utils/` - Utility functions
- `prisma/` - Database schema and migrations
- `test/` - Jest and Cypress tests

### Key Files
- `prisma/schema.prisma` - Database schema definition
- `src/types.ts` - TypeScript type definitions
- `src/config.ts` - Application configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `docker-compose.yml` - Database container setup
- `.env.example` - Environment variables template

### Main Features
- **League Management**: Create and manage fantasy leagues
- **Live Draft System**: Real-time drafts using Supabase realtime subscriptions
- **Player Database**: Import and manage player statistics
- **Keeper System**: Track keeper players across seasons
- **File Management**: Upload documents/images to Supabase storage buckets
- **User Authentication**: Secure user registration and login

### Architecture Pattern
- **Custom Hooks**: All data operations abstracted into hooks (`useDraft`, `usePlayer`, etc.)
- **Clean Components**: Components use custom hooks instead of direct Redux Toolkit queries/mutations
- **Separation of Concerns**: Business logic in hooks, UI logic in components

## Database Schema

The application uses Prisma with PostgreSQL. Key entities:
- Users, Leagues, Teams
- Players, DraftPicks, Keepers
- LeagueFiles for document storage

## Environment Setup

### Prerequisites
- **Node.js LTS**: Install from [nodejs.org](https://nodejs.org/en/)
- **Docker**: Install from [docker.com](https://www.docker.com/)
- **GitHub CLI**: Install and authenticate with `gh auth login`
  - Used for managing issues, PRs, and repository operations
  - Available to Claude Code for repository management tasks

### Environment Variables
Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `SECRET` - NextAuth.js secret for JWT signing
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `DATABASE_URI` - PostgreSQL connection string
- `POSTGRES_*` - Database connection details

## Testing Strategy

- **Unit Tests**: Jest tests for API routes and utilities
- **E2E Tests**: Cypress tests for user flows (auth, drafting)
- Tests run against a test database to avoid affecting development data

## Deployment

- **Production**: Deployed to Vercel, connected to `main` branch
  - Uses `fantasy-baseball` Supabase project
- **Preview**: Dev branches create preview deployments on Vercel
  - Uses `fantasy-baseball-preview` Supabase project
- **CI/CD**: GitHub Actions run tests and build checks with automatic tagging
- **Local Development**: Docker PostgreSQL database

### GitHub Actions Setup
For automatic tagging, ensure read and write permissions for workflows:
- Go to repo Settings > Actions > General > Workflow permissions
- Enable "Read and write permissions"

## Common Tasks

### Adding New Features
1. Create API routes in `src/app/api/`
2. Create Redux slices in `src/store/`
3. Add corresponding hooks in `src/hooks/` (e.g., `useDraft`, `usePlayer`)
4. Build UI components in `src/components/`
   - **Important**: Use custom hooks instead of direct Redux Toolkit mutations/queries in components
   - Keep component logic clean by abstracting data operations into hooks
5. Add tests in `test/jest/` and `test/cypress/`

### Database Changes ⚠️ **CAUTION**
Database migrations affect both local and preview environments. Be very careful:

1. **Test locally first**:
   - Modify `prisma/schema.prisma`
   - Run `npm run migratedev` to create migration locally
   - Test thoroughly with existing data
   
2. **Consider impact on preview DB**:
   - Preview deployments run migrations automatically
   - Changes could break preview environment if schema conflicts occur
   - Consider if migration is reversible
   
3. **Recommended workflow**:
   - Create migration locally and test extensively
   - Push to feature branch only when confident
   - Monitor preview deployment for migration issues
   - Never push experimental migrations to shared branches

4. **If migration fails on preview**:
   - May need to reset preview database
   - Coordinate with team before pushing schema changes

### Development Workflow
1. Create feature branch from `main`
2. Develop locally with Docker database (`npm run up`)
3. Run tests (`npm run jest` and `npm run cypress`)
4. Create PR - GitHub Actions will run CI checks
5. Merge to `main` triggers automatic Vercel deployment

### Debugging
- Check browser console for client-side errors
- Check terminal for server-side errors
- Use React DevTools and Redux DevTools for state debugging

## Troubleshooting

### Common Issues
- **Database connection failed**: Ensure Docker is running (`npm run up`)
- **Migration errors**: Reset database with `npm run resetdb`
- **Build failures**: Check TypeScript errors with `npm run lint`
- **Supabase connection**: Verify environment variables in `.env.local`
- **Test failures**: Ensure test database is clean and seeded
- **Installation issues**: Try `npm run install` then `npm run migrate`

### Supabase Storage Setup (Optional)
For profile image uploads:
1. Create a **public** storage bucket in Supabase
2. Add `SUPABASE_BUCKET` to your `.env.local`
3. Set bucket policy to allow `SELECT`, `INSERT`, `UPDATE`, `DELETE`
4. Get URL and keys from Settings > API in Supabase dashboard

### Port Conflicts
- Database: Default port 5433 (configurable in docker-compose.yml)
- Development server: Default port 3000
- Use `lsof -i :PORT` to check port usage

## Best Practices & Standards

### Code Quality
- **TypeScript**: Strict type checking enabled - always provide proper types
- **ESLint**: Run `npm run lint` before committing - fix all warnings
- **File Naming**: Use PascalCase for components, camelCase for utilities
- **Import Organization**: Group imports (React, libraries, local components, types)

### Security
- **Never commit secrets** - use environment variables only
- **API Security**: Always validate user permissions in API routes
- **Input Validation**: Validate all user inputs on both client and server
- **Database Queries**: Use Prisma for safe, typed database operations

### Performance
- **Next.js Optimization**: Use Image component, dynamic imports for large components
- **State Management**: Keep Redux state minimal, prefer local state when possible
- **Bundle Size**: Avoid unnecessary dependencies, use tree-shaking

### Error Handling
- **API Routes**: Always return proper HTTP status codes and error messages
- **Components**: Use error boundaries and loading states
- **Database**: Handle Prisma errors gracefully with user-friendly messages
- **Forms**: Provide clear validation feedback using react-hook-form

### UI/UX Patterns
- **Responsive Design**: Mobile-first approach with TailwindCSS + DaisyUI
- **Component Library**: Use DaisyUI components - see [DaisyUI Documentation](https://daisyui.com/components/)
- **Theme System**: DaisyUI provides built-in themes - see [DaisyUI Themes](https://daisyui.com/docs/themes/)
- **Loading States**: Show loading indicators for async operations
- **Empty States**: Provide helpful messages when data is empty
- **Accessibility**: Use semantic HTML and proper ARIA labels

### Development Workflow
- **Branch Naming**: Use issue number + description format:
  - `36-improve-player-updater` (for GitHub issues)
  - `fix-api-user-tests-wf` (for bug fixes)
  - `update-packages` (for maintenance tasks)
- **Commit Messages**: Clear, descriptive commits explaining the "why"
- **Testing**: Write tests for new features, especially API routes
- **Code Reviews**: Test locally before requesting review