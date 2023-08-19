import Search from "app/components/nav/Search"
import UserNav from "app/components/nav/UserNav"

export default function Nav() {
  return (
    <div className="flex">
      <Search />
      <div className="ml-12 mr-4 mt-2">
        <UserNav />
      </div>
    </div>
  )
}
