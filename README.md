This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Testing development and merge
## Create and switch to dev branch
git checkout -b dev

## Work, commit, test here.
git add .
git commit -m "Add new feature in dev"

## Optional: push the dev branch to GitHub
git push -u origin dev

## After testing is done switch to main branch
git checkout main

## Merge in dev changes (fast-forward)
git merge dev
## Or use rebase for cleaner history
git rebase dev

## Push to GitHub → Vercel auto-deploys
git push origin main

# Fetching through google drive
Under api folder, public-images api is loading images from the google drive. The url of the drive is at lib/driveFolders.ts.
The image-proxy route is required because the proxy is required to fetch photo from google drive.


# Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```