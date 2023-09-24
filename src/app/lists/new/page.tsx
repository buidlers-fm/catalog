import EditList from "app/lists/new/components/EditList"

export const dynamic = "force-dynamic"

export default async function CreateListPage() {
  // TODO: pass current user if signed in, otherwise redirect

  return <EditList />
}
