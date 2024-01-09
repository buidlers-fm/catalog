import Markdown, { Components } from "react-markdown"
import linkifyRegex from "remark-linkify-regex"
import { isValidHttpUrl } from "lib/helpers/general"

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
  a: ({ node, href, children, ...props }) =>
    isValidHttpUrl(href) ? (
      <a {...props} href={href} className="cat-link" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      href
    ),
  ol: ({ node, children, ...props }) => (
    <ol {...props} className="ml-4 -my-3 last:-mb-10 list-decimal">
      {children}
    </ol>
  ),
  ul: ({ node, children, ...props }) => (
    <ul {...props} className="ml-4 -my-3 last:-mb-10 list-disc">
      {children}
    </ul>
  ),
  li: ({ node, children, ...props }) => (
    <li {...props} className="-my-3">
      {children}
    </li>
  ),
}

const plugins = [linkifyRegex(/(?:https?):\/\/\S+/g)]

const CustomMarkdown = ({ markdown, componentOverrides = {} }) => {
  const finalComponents = { ...components, ...componentOverrides }

  return (
    <Markdown
      className="whitespace-pre-wrap break-words"
      components={finalComponents}
      remarkPlugins={plugins}
    >
      {markdown}
    </Markdown>
  )
}

export default CustomMarkdown
