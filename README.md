# Fantasy Draft Site ⚾🏈

### Description
A Typescript fantasy baseball/football drafting site web project using [Next.js](https://nextjs.org/) (App Router) and [Tailwind](https://tailwindcss.com/), and [Postgres](https://www.postgresql.org/). User authentication (username/password) has been set up using [NextAuth.js](https://next-auth.js.org/). 

This boilerplate contains:
- 🔑 User auth and session management using [NextAuth.js](https://next-auth.js.org/)
- 👪 ORM using [Prisma](https://www.prisma.io/)
- 📄 A user signup page, sign in page, and user list page using [React](https://reactjs.org/), [Tailwind](https://tailwindcss.com/), and [Daisy UI](https://daisyui.com/) 
- 🌍 State management using [Redux RTK query](https://redux-toolkit.js.org/rtk-query/overview)
- ✅ CI/CD using [Github Actions](https://github.com/features/actions)
- 💻 E2E testing using [Cypress](https://www.cypress.io/)
- 🤡 Unit testing using [Jest](https://jestjs.io/)

### Installation
1. Install [Node LTS](https://nodejs.org/en/)
2. Install [Docker](https://www.docker.com/)
3. Clone this repo
4. Create the following `.env` file
```
# next-auth
SECRET=TODO

# supabase
NEXT_PUBLIC_SUPABASE_URL=TODO
NEXT_PUBLIC_SUPABASE_ANON_KEY=TODO

# database
POSTGRES_HOSTNAME=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres
DATABASE_URI=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOSTNAME}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public
DIRECT_URI=${DATABASE_URI}
```
5. Run the following in the root directory
```
npm run install
npm migrate
```
6. For [automatic tagging](https://github.com/anothrNick/github-tag-action), allow read and write permissions for workflows in your github repo's Settings > Actions > General > Workflow permissions section.

### Start locally
The following command will containerize, build, and start the database, backend, and frontend
```
npm run up
npm run dev
```

### Setup user profile image upload Supabase (optional)
1. Sign up and create a project on [supabase](https://supabase.com/dashboard).
2. Create a **public** storage bucket and add `SUPABASE_BUCKET` to the `.env` above
3. Add a policy to your bucket that allows `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
4. From Settings > API, add your URL and anon/public API keys to the `.env` as `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
