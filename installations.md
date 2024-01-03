## Installations

Make sure you have the following items:
- [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- yarn - `npm install --global yarn`
  - run `yarn --version` to verify the installation worked correctly
- [vercel cli](https://vercel.com/docs/cli) — `yarn global add vercel`
  - run `vercel --version` to verify the installation worked correctly
  - run `vercel link` to link to the current vercel project
    - follow the commands to log in with GitHub
    - follow the commands to link the catalog project
    - verify you have a `.vercel` directory in the project root
  - run `vercel env pull` to populate your `.env.local` file with necessary environment variables

You should be ready to run the app now with `yarn dev`.
