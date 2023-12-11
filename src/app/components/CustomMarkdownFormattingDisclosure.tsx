"use client"

import React from "react"
import { Disclosure } from "@headlessui/react"
import { SlInfo } from "react-icons/sl"

const CustomMarkdownFormattingDisclosure = () => (
  <Disclosure>
    <Disclosure.Button className="flex items-center text-sm -mt-8">
      <span>Formatting reference</span>
      <SlInfo className="pl-1" />
    </Disclosure.Button>
    <Disclosure.Panel className="mt-2 p-2 text-gray-300 border rounded solid border-gray-700">
      <h1 className="font-bold">For bold header, use # or ## at the beginning of a line.</h1>
      <p>
        - For <span className="font-bold">bold text</span> within a paragraph, surround text with{" "}
        <span className="font-bold">**double asterisks**</span>.
      </p>
      <p>
        - For <span className="italic">italicized text</span>, surround text with{" "}
        <span className="italic">*single asterisks*</span>.
      </p>
      <p>
        - To include a link, use brackets around the link text followed by parentheses around the
        link URL: [Markdown Basics](https://www.markdownguide.org/basic-syntax/) becomes{" "}
        <a href="https://www.markdownguide.org/basic-syntax/" className="cat-btn-link">
          Markdown Basics
        </a>
        .
      </p>
      <p>
        <hr className="my-2" />- To include a horizontal divider such as the one above, use three or
        more dashes (---) on a single line.
      </p>
    </Disclosure.Panel>
  </Disclosure>
)

export default CustomMarkdownFormattingDisclosure
