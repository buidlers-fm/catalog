import CustomMarkdown from "app/components/CustomMarkdown"
import guideText from "../../../docs/tester_guide.md"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "catalog • guide",
  openGraph: {
    title: "catalog • guide",
  },
}

const componentOverrides = {
  h1: ({ node, children, ...props }) => (
    <h1 className="mt-8 font-bold text-3xl" {...props}>
      {children}
    </h1>
  ),
  p: ({ node, children, ...props }) => (
    <p className="text-lg" {...props}>
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
        <li {...props} className="text-lg">
          {children}
        </li>
      )
    }

    return (
      <li {...props} className="-my-3 text-lg">
        {children}
      </li>
    )
  },
}

export default function GuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-8">
      <CustomMarkdown markdown={guideText} componentOverrides={componentOverrides} />
    </div>
  )
}
