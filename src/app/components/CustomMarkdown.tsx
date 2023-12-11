"use client"

import React from "react"
import Markdown, { Components } from "react-markdown"
import linkifyRegex from "remark-linkify-regex"

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
  a: ({ node, children, ...props }) => (
    <a {...props} className="cat-btn-link" target="_blank">
      {children}
    </a>
  ),
}

// Taken from https://www.freecodecamp.org/news/how-to-write-a-regular-expression-for-a-url/
// but removed the ?s in order to require a scheme
const pattern =
  /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,}))|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g

const CustomMarkdown = ({ markdown }) => (
  <Markdown components={components} remarkPlugins={[linkifyRegex(pattern)]}>
    {markdown}
  </Markdown>
)

export default CustomMarkdown
