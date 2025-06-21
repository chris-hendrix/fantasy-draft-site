# Fantasy Baseball Draft Site ⚾

A Next.js application for managing fantasy baseball leagues, drafts, and player data.

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

## Features
- 🔑 User authentication and session management
- 🏆 League creation and management
- ⚡ Live draft system with real-time updates
- 📊 Player database and statistics management
- 🔄 Keeper system for multi-season leagues
- 📁 Document and image upload via Supabase storage
- 🧪 Comprehensive testing with Jest and Cypress

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd fantasy-draft-site
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

## Prerequisites
- [Node.js LTS](https://nodejs.org/en/)
- [Docker](https://www.docker.com/)
- [GitHub CLI](https://cli.github.com/) (optional, for repository management)

## Environment Setup

```bash
cp .env.example .env.local
# Fill in your Supabase and database credentials
```

## Development Commands

**Essential:**
- `npm run dev` - Start development server
- `npm run up` - Start database container
- `npm run lint` - Run linting before commits
- `npm run jest` - Run tests

**Database:**
- `npm run migratedev` - Create migration
- `npm run seed` - Seed database
- `npm run resetdb` - Reset database (when broken)

## Supabase Setup

1. Create a project on [Supabase](https://supabase.com/dashboard)
2. Create a **public** storage bucket for file uploads
3. Set bucket policy to allow `SELECT`, `INSERT`, `UPDATE`, `DELETE`
4. Get URL and keys from Settings > API
5. Add credentials to your `.env.local`

## Deployment

- **Production**: Vercel (main branch) → fantasy-baseball Supabase
- **Preview**: Vercel (dev branches) → fantasy-baseball-preview Supabase
- **CI/CD**: GitHub Actions with automatic tagging

## Documentation

For detailed development information, see [CLAUDE.md](./CLAUDE.md) which contains:
- Architecture patterns and best practices
- Troubleshooting guide
- Development workflow
- Code quality standards