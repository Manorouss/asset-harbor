# Asset Harbor

Asset Harbor is a multi-cloud review workspace for teams that need to browse shared assets, preview files in one place, and keep ratings, comments, and reactions attached to the file.

## Public Showcase

- Live access page: [asset-harbor.vercel.app/login](https://asset-harbor.vercel.app/login)
- Read-only demo: [asset-harbor.vercel.app/demo](https://asset-harbor.vercel.app/demo)
- GitHub repository: [github.com/Manorouss/asset-harbor](https://github.com/Manorouss/asset-harbor)

The public demo is intentionally temporary-only. Visitors can browse the workspace, expand folders, preview files, and play with comments and reactions without touching private cloud content or real credentials.

## What The App Does

- Browses connected cloud folders from Dropbox, Google Drive, OneDrive, and iCloud Drive in one Finder-style workspace.
- Shows file previews for common asset types like video, image, PDF, and document exports.
- Lets collaborators rate assets with positive, neutral, and negative sentiment.
- Stores comments and emoji reactions per asset.
- Surfaces filterable review activity across the workspace.

## Local Development

```bash
npm install
npm run db:push
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login) for the public access page or [http://localhost:3000/demo](http://localhost:3000/demo) for the read-only walkthrough.

## Environment

This project expects the following environment variables for the live workspace:

- `DATABASE_URL`
- `DROPBOX_APP_KEY`
- `DROPBOX_APP_SECRET`
- `DROPBOX_REFRESH_TOKEN`
- `DROPBOX_IMPERSONATED_USER_ID`

The `/demo` route does not require cloud access.

## Deployment Notes

The production build runs:

```bash
prisma generate && next build
```

Apply schema changes separately before deployment:

```bash
npm run db:push
```

For Vercel, make sure the database and Dropbox environment variables are configured in the project settings before promoting the deployment.
