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

const sections = [
  {
    title: "getting started",
    href: "#getting-started",
  },
  {
    title: "tips",
    href: "#tips",
  },
  {
    title: "book search and book details",
    href: "#book-search-and-book-details",
  },
  {
    title: "bugs and errors",
    href: "#bugs-and-errors",
  },
  {
    title: "privacy",
    href: "#privacy",
  },
  {
    title: "invites",
    href: "#invites",
  },
  {
    title: "other features",
    href: "#other-features",
  },
  {
    title: "how to be a ⭐️ beta tester",
    href: "#how-to-be-a--beta-tester",
  },
  {
    title: "troubleshooting",
    href: "#appendix-troubleshooting",
  },
]

export default function GuidePage() {
  return (
    <div className="flex">
      <div className="hidden lg:block sticky top-0 h-[400px] px-8 py-4 min-w-[240px] font-mulish">
        {sections.map((section) => (
          <div key={section.href} className="my-4">
            <a href={section.href} className="cat-link">
              {section.title}
            </a>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto lg:ml-8 mr-auto px-8">
        <CustomMarkdown markdown={guideText} componentOverrides={componentOverrides} />
      </div>
    </div>
  )
}
