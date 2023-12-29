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
    <h1 className="text-lg" {...props}>
      {children}
    </h1>
  ),
}

export default function GuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-8">
      <CustomMarkdown markdown={guideText} componentOverrides={componentOverrides} />
    </div>
  )
}
