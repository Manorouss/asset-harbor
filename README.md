This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Dropbox Asset Browser

This app lets you browse and rate assets in your Dropbox team folders. Only the four main folders are shown: 1 - Customers, 2 - Sales, 3 - Marketing, 4 - Product Assets.

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Features
- Browse your Dropbox team folders
- Rate files with stars and happy/sad faces
- Leave comments on files

## Configuration
- Requires a Dropbox API access token with appropriate team permissions.
- Set your token in `.env.local` as `DROPBOX_ACCESS_TOKEN`.

## Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [Dropbox API Docs](https://www.dropbox.com/developers/documentation/http/documentation)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
