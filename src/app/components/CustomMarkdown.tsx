import Markdown, { Components } from "react-markdown"
import { validate as isValidUuid } from "uuid"
import linkifyRegex from "remark-linkify-regex"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import { isValidHttpUrl, getUserProfileLink } from "lib/helpers/general"

const components: Components = {
  h1: ({ node, children, ...props }) => (
    <h1 className="block font-bold" {...props}>
      {children}
    </h1>
  ),
  h2: ({ node, children, ...props }) => (
    <h2 className="block font-bold" {...props}>
      {children}
    </h2>
  ),
  a: ({ node, href, children, ...props }) => {
    if (isValidUuid(href)) {
      return (
        <a {...props} href={getUserProfileLink(href!)} className="text-gold-500">
          {children}
        </a>
      )
    } else if (isValidHttpUrl(href)) {
      return (
        <a {...props} href={href} className="cat-link" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      )
    } else if (href?.startsWith("#")) {
      return (
        <a {...props} href={href}>
          {children}
        </a>
      )
    } else {
      return href
    }
  },
  ol: ({ node, children, ...props }) => (
    <ol {...props} className="ml-4 -my-3 list-decimal">
      {children}
    </ol>
  ),
  ul: ({ node, children, ...props }) => (
    <ul {...props} className="ml-4 -my-3 list-disc">
      {children}
    </ul>
  ),
  li: ({ node, children: _children, ...props }) => {
    let children = _children

    // if second child is a <p> element (aka. if original list had whitespace lines
    // between items), strip the <p> but not the spacing between items
    if (_children && _children[1] && _children[1].props?.node?.tagName === "p") {
      ;({ children } = _children[1].props)

      return <li {...props}>{children}</li>
    }

    return (
      <li {...props} className="-my-3">
        {children}
      </li>
    )
  },
}

const remarkPlugins = [linkifyRegex(/(?:https?):\/\/\S+/g)]
const rehypePlugins = [
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    {
      behavior: "wrap",
    },
  ],
]

const CustomMarkdown = ({ markdown, componentOverrides = {}, moreClasses = "" }) => {
  const finalComponents = { ...components, ...componentOverrides }

  return (
    <Markdown
      className={`whitespace-pre-wrap break-words ${moreClasses}`}
      components={finalComponents}
      remarkPlugins={remarkPlugins}
      // @ts-ignore
      rehypePlugins={rehypePlugins}
    >
      {markdown}
    </Markdown>
  )
}

export default CustomMarkdown
