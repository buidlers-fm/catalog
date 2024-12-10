## Getting Started

Make sure you have the following items:

- [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- pnpm - `brew install pnpm`
  - run `pnpm` to verify the installation worked correctly
  - if `pnpm` is too annoying to type, add `alias pn=pnpm` (or whatever alias you want) to your bashrc
  - run `pnpm i` to install all modules
- [vercel cli](https://vercel.com/docs/cli) — `pnpm i -g vercel`
  - run `vercel --version` to verify the installation worked correctly
  - run `vercel link` to link to the current vercel project
    - follow the commands to log in with GitHub
    - follow the commands to link the catalog project
    - verify you have a `.vercel` directory in the project root
  - run `vercel env pull` to populate your `.env.local` file with necessary environment variables

You should be ready to run the app now with `pnpm dev`.
