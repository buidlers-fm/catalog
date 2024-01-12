import * as Helpers from "lib/helpers/general"

describe("truncateString", () => {
  const { truncateString } = Helpers

  describe("when blank value is passed", () => {
    const result = truncateString(undefined, 100)

    test("returns empty string", () => {
      expect(result).toBe("")
    })
  })

  describe("when string is shorter than maxChars", () => {
    const result = truncateString("hello", 100)

    test("returns original string", () => {
      expect(result).toBe("hello")
    })
  })

  describe("when string is longer than maxChars", () => {
    const result = truncateString("hello world", 8)

    test("returns the expected string", () => {
      const expected = "hello..."
      expect(result).toBe(expected)
    })
  })
})
