export const BASE_URLS_BY_ENV = {
  development: "http://localhost:3000",
  preview: `https://catalog-git-${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF}-buidlers-fm.vercel.app`,
  staging: "https://bdl-catalog-staging.vercel.app",
  production: "https://catalog.fyi",
}
