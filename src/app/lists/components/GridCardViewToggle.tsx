import { BsGrid, BsListUl } from "react-icons/bs"

export default function GridCardViewToggle({ activeView, onChange }) {
  const sharedClasses =
    "relative inline-flex items-center bg-black px-2 py-2 text-white ring-1 ring-inset ring-gray-700 hover:bg-gray-800 focus:z-10"
  return (
    <span className="isolate inline-flex rounded-md shadow-sm">
      <button
        type="button"
        title="grid view"
        onClick={() => onChange("grid")}
        className={`${sharedClasses} ${
          activeView === "grid" ? "bg-gray-800" : "bg-black"
        } rounded-l-sm`}
      >
        <span className="sr-only">grid view</span>
        <BsGrid className="text-sm" aria-hidden="true" />
      </button>
      <button
        type="button"
        title="card view"
        onClick={() => onChange("card")}
        className={`${sharedClasses} ${
          activeView === "card" ? "bg-gray-800" : "bg-black"
        } rounded-r-sm`}
      >
        <span className="sr-only">card view</span>
        <BsListUl className="text-sm" aria-hidden="true" />
      </button>
    </span>
  )
}
