import fs from "fs"
import CustomMarkdown from "app/components/CustomMarkdown"

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
  const guideText = fs.readFileSync("docs/tester_guide.md", "utf-8")

  return (
    <div className="max-w-3xl mx-auto px-8">
      <CustomMarkdown markdown={guideText} componentOverrides={componentOverrides} />
    </div>
  )
}
