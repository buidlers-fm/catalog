const { execSync } = require("child_process")

module.exports = async () => {
  execSync("npx prisma db push", { stdio: "inherit" })
}
