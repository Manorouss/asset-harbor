# Asset Rating App

Asset Rating App is a Dropbox-backed review workspace for teams that need to browse shared assets, rate them quickly, and keep feedback attached to the file.

## Public Showcase

- Live access page: [asset-rating-app.vercel.app/login](https://asset-rating-app.vercel.app/login)
- Read-only demo: [asset-rating-app.vercel.app/demo](https://asset-rating-app.vercel.app/demo)
- GitHub repository: [github.com/Manorouss/asset-rating-app](https://github.com/Manorouss/asset-rating-app)

The public demo is intentionally read-only. It shows the workflow without exposing private Dropbox content or internal credentials.

## What The App Does

- Browses a constrained set of Dropbox team folders.
- Shows file previews for common asset types.
- Lets collaborators rate assets with positive, neutral, and negative sentiment.
- Stores comments and emoji reactions per asset.
- Surfaces filterable review activity across the workspace.

## Local Development

```bash
npm install
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

The `/demo` route does not require Dropbox access.

## Deployment Notes

The production build runs:

```bash
prisma generate && prisma db push && next build
```

For Vercel, make sure the database and Dropbox environment variables are configured in the project settings before promoting the deployment.
