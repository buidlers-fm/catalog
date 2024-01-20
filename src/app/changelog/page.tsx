import CustomMarkdown from "app/components/CustomMarkdown"
import text from "../../../docs/changelog.md"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "catalog • changelog",
  openGraph: {
    title: "catalog • changelog",
  },
}

const componentOverrides = {
  h1: ({ node, children, ...props }) => (
    <h1 className="mt-4 font-bold text-3xl font-mulish text-gold-500" {...props}>
      {children}
    </h1>
  ),
  h2: ({ node, children, ...props }) => (
    <h2
      className="mt-6 font-bold text-xl text-white border-b border-b-white w-fit font-mulish"
      {...props}
    >
      {children}
    </h2>
  ),
  p: ({ node, children, ...props }) => (
    <p className="text-md" {...props}>
      {children}
    </p>
  ),
  li: ({ node, children: _children, ...props }) => {
    let children = _children

    // if second child is a <p> element (aka. if original list had whitespace lines
    // between items), strip the <p> but not the spacing between items
    if (_children && _children[1] && _children[1].props?.node?.tagName === "p") {
      ;({ children } = _children[1].props)

      return (
        <li {...props} className="text-md">
          {children}
        </li>
      )
    }

    return (
      <li {...props} className="-my-3 text-md">
        {children}
      </li>
    )
  },
  hr: ({ node, children, ...props }) => (
    <hr {...props} className="my-4 h-[1px] w-3/4 mx-auto border-none bg-gray-300" />
  ),
}

export default function ChangelogPage() {
  return (
    <div className="mt-8 max-w-3xl mx-auto px-8 font-newsreader text-gray-100">
      <CustomMarkdown markdown={text} componentOverrides={componentOverrides} />
    </div>
  )
}
