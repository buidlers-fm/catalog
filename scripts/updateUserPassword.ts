// check DOTENV_PATH
// for other env, create e.g. `.env.scripts.staging`
// npx ts-node -P tsconfig.scripts.json scripts/updateUserPassword.ts

import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

const DOTENV_PATH = ".env"
dotenv.config({ path: DOTENV_PATH })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// rory2test in prod
// const USER_ID = "d223b33e-8d71-4375-832f-d38d0449a365"
// const PASSWORD = "asdfhjkl"

// rorycat20 in dev
const USER_ID = "1be079fc-5b2b-480a-9edb-8d0d3f1eee8a"
const PASSWORD = "asdfhjkl"

async function main() {
  const { data: user, error } = await supabase.auth.admin.updateUserById(USER_ID, {
    password: PASSWORD,
  })

  if (error) {
    console.error(error)
  } else {
    console.log(user)
    console.log("User's password upated.")
  }
}

main()
