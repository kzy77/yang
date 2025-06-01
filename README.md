This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

To deploy via GitHub:
1.  **Fork this repository** to your GitHub account.
2.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
3.  Click "Add New..." -> "Project".
4.  Select your forked repository from the list.
5.  Vercel will automatically detect it's a Next.js project. Click "Deploy".

### Deploy on Cloudflare Pages

This project can be deployed to Cloudflare Pages using `@cloudflare/next-on-pages`.

To deploy via GitHub:
1.  **Fork this repository** to your GitHub account.
2.  Go to [Cloudflare Dashboard](https://dash.cloudflare.com/).
3.  Navigate to "Pages" and click "Create a project".
4.  Select "Connect to Git" and choose your forked repository.
5.  Configure the build settings:
    -   **Build command**: `npx @cloudflare/next-on-pages@1`
    -   **Build output directory**: `.vercel/output/static`
    -   **Node.js version**: Ensure it's compatible (e.g., Node.js 22.15.1 or later).
    -   **Compatibility Flags**: Enable `nodejs_compat` for both Production and Preview environments in **Settings > Compatibility Flags**.
6.  Click "Save and Deploy".
