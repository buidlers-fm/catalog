"use client"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import api from "lib/api"
import OpenLibrary from "lib/openLibrary"
import { isValidHttpUrl, getBookLink } from "lib/helpers/general"
import allValidations from "lib/constants/validations"
import { reportToSentry } from "lib/sentry"
import LoadingSection from "app/components/LoadingSection"

const { maxWidth, maxHeight } = allValidations.book.cover

const maxCoversToDisplay = 12

enum Mode {
  FromOpenLibrary = "openLibrary",
  FromUrl = "url",
}

export default function EditBookCovers({ book }) {
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string>(book.coverImageUrl)
  const [selectedCoverUrl, setSelectedCoverUrl] = useState<string>()
  const [openLibraryCoverUrls, setOpenLibraryCoverUrls] = useState<string[]>()
  const [moreResultsExist, setMoreResultsExist] = useState<boolean>(false)
  const [mode, setMode] = useState<Mode>(Mode.FromOpenLibrary)
  const [urlInput, setUrlInput] = useState<string>("")
  const [urlErrorMessage, setUrlErrorMessage] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    async function getOpenLibraryCoverUrls() {
      let covers = await OpenLibrary.getCoverUrlsForWork(book.openLibraryWorkId)

      if (covers.length > maxCoversToDisplay) {
        covers = covers.slice(0, maxCoversToDisplay)
        setMoreResultsExist(true)
      }

      setOpenLibraryCoverUrls(covers)
    }

    getOpenLibraryCoverUrls()
  }, [book.openLibraryWorkId])

  function selectCover(coverUrl: string) {
    setSelectedCoverUrl(coverUrl)
  }

  function unselectCover() {
    setSelectedCoverUrl(undefined)
  }

  function isSelectedCover(coverUrl: string) {
    return selectedCoverUrl === coverUrl
  }

  function handleUrlInputChange(e) {
    setUrlInput(e.target.value)
    setUrlErrorMessage(undefined)
  }

  async function handleSetUrlFromInput() {
    if (!isValidHttpUrl(urlInput)) {
      setUrlErrorMessage("Invalid URL.")
      return false
    }

    // validate file size using a dummy img element
    const img = new Image()

    // define the onload and onerror events
    img.onload = (e) => {
      const target = e.target as HTMLImageElement

      if (target.width > maxWidth || target.height > maxHeight) {
        setUrlErrorMessage(`Image dimensions are too large (max 2000x2000 pixels).`)
        return false
      }

      setSelectedCoverUrl(urlInput)
      return true
    }

    img.onerror = () => {
      setUrlErrorMessage("Unable to load the image.")
      return false
    }

    // start loading the image
    img.src = urlInput
  }

  async function submit() {
    if (!selectedCoverUrl) {
      if (urlInput) {
        const isValid = await handleSetUrlFromInput()
        if (!isValid) return
      } else {
        return
      }
    }

    const requestData = {
      coverImageUrl: selectedCoverUrl || urlInput,
    }

    setIsSubmitting(true)

    const toastId = toast.loading("Saving your changes...")

    try {
      await api.books.updateCover(book.id, requestData)

      const successMessage = (
        <div className="flex flex-col ml-2">
          Changes saved!&nbsp;
          <a href={getBookLink(book.slug)} className="underline">
            Back to book
          </a>
        </div>
      )

      toast.success(successMessage, { id: toastId })

      setCurrentCoverUrl(selectedCoverUrl!)
      setSelectedCoverUrl(undefined)
      setUrlInput("")
    } catch (error: any) {
      toast.error("Hmm, something went wrong.", { id: toastId })

      reportToSentry(error, {
        method: "EditBookCovers.submit",
        ...requestData,
      })
    }

    setIsSubmitting(false)
  }

  return (
    <div className="my-8 mx-8 sm:mx-16 ml:max-w-4xl ml:mx-auto font-mulish">
      <div className="mb-8 w-3/4">
        <div className="mb-4">See cover guidelines below.</div>
      </div>
      <div className="flex flex-col sm:flex-row gap-16">
        <div className="">
          current cover
          <div className="mt-2 w-64">
            {currentCoverUrl ? (
              <img
                src={currentCoverUrl}
                alt="cover"
                className="w-full mx-auto shadow-md rounded-md"
              />
            ) : (
              <div className="flex items-center justify-center w-64 h-96 text-gray-300 border-2 border-gray-300 rounded-md">
                no current cover
              </div>
            )}
          </div>
        </div>
        <div className="">
          selected cover
          <div className="mt-2 w-64">
            {selectedCoverUrl ? (
              <>
                <img
                  src={selectedCoverUrl}
                  alt="cover"
                  className="w-full mx-auto shadow-md rounded-md"
                />
                <button onClick={unselectCover} className="cat-link text-sm">
                  clear
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center w-64 h-96 text-gray-300 border-2 border-gray-300 rounded-md">
                no cover selected
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 -mb-px w-fit flex space-x-8 border-b border-gray-700 px-8 rounded-sm">
        <button
          onClick={() => setMode(Mode.FromOpenLibrary)}
          className={`
        ${
          mode === Mode.FromOpenLibrary ? "text-gold-500" : "text-gray-500"
        } whitespace-nowrap py-2 px-1 text-sm
        `}
        >
          from OpenLibrary
        </button>
        <button
          onClick={() => setMode(Mode.FromUrl)}
          className={`
        ${
          mode === Mode.FromUrl ? "text-gold-500" : "text-gray-500"
        } whitespace-nowrap py-2 px-1 text-sm
        `}
        >
          from url
        </button>
      </div>

      {mode === Mode.FromOpenLibrary && (
        <div className="py-8">
          <div className="mb-4">select a cover from OpenLibrary</div>
          {openLibraryCoverUrls ? (
            openLibraryCoverUrls.length === 0 ? (
              <div className="h-32 flex justify-center items-center bg-gray-900 rounded text-gray-200">
                no covers from OpenLibrary :(
              </div>
            ) : (
              <>
                <div className="px-4 py-4 flex flex-wrap gap-4 max-h-96 overflow-auto bg-gray-900 rounded">
                  {openLibraryCoverUrls.map((coverUrl) => (
                    <div key={coverUrl} className="w-48">
                      <button type="button" onClick={() => selectCover(coverUrl)}>
                        <img
                          src={coverUrl}
                          alt="cover"
                          className={`w-full mx-auto p-1 rounded-md border-2 ${
                            isSelectedCover(coverUrl) ? "border-white" : "border-transparent"
                          } hover:border-white`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
                {moreResultsExist && (
                  <div className="mt-2 text-sm text-gray-200">
                    Look for more covers at{" "}
                    <a
                      href={OpenLibrary.getOlWorkPageUrl(book.openLibraryWorkId)}
                      className="cat-underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      OpenLibrary
                    </a>
                  </div>
                )}
              </>
            )
          ) : (
            <LoadingSection />
          )}
        </div>
      )}

      {mode === Mode.FromUrl && (
        <div className="py-8">
          set from an image url
          <div className="mt-2 flex w-3/4">
            <input
              name="selectedCoverUrl"
              type="text"
              className="grow px-3 pt-3 pb-2 bg-gray-900 focus:outline-gold-500 disabled:text-gray-500 rounded border-none"
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={handleUrlInputChange}
            />

            <button
              onClick={handleSetUrlFromInput}
              className="ml-3 cat-btn cat-btn-sm cat-btn-gold"
              disabled={!urlInput}
            >
              preview
            </button>
          </div>
          {urlErrorMessage && <div className="text-red-500">{urlErrorMessage}</div>}
        </div>
      )}

      <div className="text-sm text-gray-300">
        <div className="mb-4">cover guidelines:</div>
        <div className="mb-4">
          Please only change the cover if the existing cover is missing, wrong, of poor image
          quality, or doesn't adhere to these guidelines, and not because you prefer a different
          one. We'll figure out a way to handle cover preferences later on.
        </div>
        <div className="mb-4">
          A cover in the book's original language OR in English is best (though in any language is
          better than no cover at all).
        </div>
        <div className="mb-4">
          A digital image of the cover is preferable to a scan or photo of a physical book. In some
          cases this can conflict with the point above, if the best cover available also happens to
          be a scan. That's OK, use your judgment!
        </div>
        <div className="mb-4">
          An image from URL should be preferably at least 500 pixels on one side, but must be no
          larger than 2000x2000 pixels. Use the best quality image you can find within those
          dimensions.
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={(!selectedCoverUrl && !urlInput) || isSubmitting}
        className="my-8 cat-btn cat-btn-sm cat-btn-gold"
      >
        save
      </button>
    </div>
  )
}
