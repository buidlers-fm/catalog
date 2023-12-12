"use client"

import React from "react"
import { Disclosure } from "@headlessui/react"
import { SlInfo } from "react-icons/sl"

const tdClasses = "bg-gray-900 p-2"

const CustomMarkdownFormattingDisclosure = () => (
  <Disclosure>
    <Disclosure.Button className="flex items-center text-sm -mt-8">
      <span>Formatting reference</span>
      <SlInfo className="pl-1 text-base" />
    </Disclosure.Button>
    <Disclosure.Panel className="mt-2 text-sm">
      <table className="border-separate rounded bg-gray-700">
        <thead>
          <td className="bg-gray-700 p-2 rounded-tl">Markdown</td>
          <td className="bg-gray-700 p-2 rounded-tr">Result</td>
        </thead>
        <tbody>
          <tr>
            <td className={tdClasses}>
              # Header
              <br />
              Sub text
            </td>
            <td className={tdClasses}>
              <h1 className="block font-bold">Header</h1>
              Sub text
            </td>
          </tr>
          <tr>
            <td className={tdClasses}>**Bold text** in a paragraph.</td>
            <td className={tdClasses}>
              <b>Bold text</b> in a paragraph.
            </td>
          </tr>
          <tr>
            <td className={tdClasses}>*Italicized text* in a paragraph.</td>
            <td className={tdClasses}>
              <em>Italicized text</em> in a paragraph.
            </td>
          </tr>
          <tr>
            <td className={tdClasses}>[Link text](Link URL)</td>
            <td className={tdClasses}>
              <a
                className="cat-btn-link"
                href="https://www.markdownguide.org/basic-syntax/"
                target="_blank"
              >
                Markdown Basics
              </a>
            </td>
          </tr>
          <tr>
            <td className={tdClasses}>
              Horizontal
              <br />
              ---
              <br />
              line
            </td>
            <td className={tdClasses}>
              Horizontal
              <hr className="my-2" />
              line
            </td>
          </tr>
          <tr>
            <td className={`${tdClasses} rounded-bl`}>
              - lists
              <br />
              - of
              <br />- things
            </td>
            <td className={`${tdClasses} rounded-br`}>
              <ul className="list-disc list-inside">
                <li>lists</li>
                <li>of</li>
                <li>things</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </Disclosure.Panel>
  </Disclosure>
)

export default CustomMarkdownFormattingDisclosure
