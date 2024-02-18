"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import { getBookLink } from "lib/helpers/general"
import FormInput from "app/components/forms/FormInput"
import type Adaptation from "types/Adaptation"
import type Book from "types/Book"

type AdaptationFormData = {
  type: string
  title: string
  dateString: string
  year: number
  letterboxdUrl: string
  tmdbUrl: string
  imdbUrl: string
  wikipediaUrl: string
}

const MAX_LENGTHS = {
  title: 200,
  dateString: 100,
}

const validations = {
  title: {
    required: "Title is required.",
    maxLength: {
      value: MAX_LENGTHS.title,
      message: `Title cannot be longer than ${MAX_LENGTHS.title} characters.`,
    },
  },
  dateString: {
    maxLength: {
      value: MAX_LENGTHS.dateString,
      message: `Date detail cannot be longer than ${MAX_LENGTHS.dateString} characters.`,
    },
  },
  year: {
    min: {
      value: 0,
      message: "Year must be a positive number.",
    },
    max: {
      value: new Date().getFullYear() + 1,
      message: "Year cannot be more than 1 year in the future.",
    },
  },
  letterboxdUrl: {
    pattern: {
      value: /^https?:\/\/letterboxd\.com\/film\/[^ ]+$/,
      message: "Must be a valid Letterboxd URL.",
    },
  },
  tmdbUrl: {
    pattern: {
      value: /^https?:\/\/www\.themoviedb\.org\/[^ ]+$/,
      message: "Must be a valid TMDB URL.",
    },
  },
  wikipediaUrl: {
    pattern: {
      value: /^https?:\/\/([a-z]+\.)?wikipedia\.org\/wiki\/[^ ]+$/,
      message: "Must be a valid Wikipedia URL.",
    },
  },
}

type Props = {
  adaptation?: Adaptation
  book: Book
  onSuccess?: () => void
  onCancel: () => void
}

export default function EditAdaptation({ adaptation, book, onSuccess, onCancel }: Props) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [posterImageUrl, setPosterImageUrl] = useState<string>()
  const [errorMessage, setErrorMessage] = useState<string>()

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<AdaptationFormData>({
    defaultValues: adaptation,
  })

  const tmdbUrl = watch("tmdbUrl")
  const title = watch("title")

  async function fetchTmdbData() {
    try {
      await trigger("tmdbUrl")

      if (errors.tmdbUrl) return

      const tmdbMetadata = await api.openGraph.get(tmdbUrl)
      const { title: tmdbTitle, imageUrl } = tmdbMetadata

      if (!title) setValue("title", tmdbTitle)
      if (imageUrl) setPosterImageUrl(imageUrl)

      return tmdbMetadata
    } catch (error: any) {
      reportToSentry(error, { method: "EditAdaptation.fetchTmdbData", book, tmdbUrl })
    }
  }

  async function submit(formData: AdaptationFormData) {
    if (!formData.tmdbUrl && !formData.letterboxdUrl && !formData.wikipediaUrl) {
      setErrorMessage("At least one reference URL is required.")
      return
    }

    const requestData: any = {
      ...formData,
      year: Number(formData.year),
      bookId: book.id,
    }

    setIsSubmitting(true)

    const toastId = toast.loading("Saving adaptation...")

    try {
      if (adaptation) {
        await api.adaptations.update(adaptation.id, requestData)
      } else {
        await api.adaptations.create(requestData)
      }

      const successMessage = (
        <div className="flex flex-col ml-2">
          Adaptation saved!&nbsp;
          <a href={getBookLink(book.slug!)} className="underline">
            Back to book
          </a>
        </div>
      )

      toast.success(successMessage, { id: toastId })
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error("Hmm, something went wrong.", { id: toastId })

      reportToSentry(error, {
        method: "EditAdaptation.submit",
        ...requestData,
      })
    }

    setIsSubmitting(false)
  }

  return (
    <div className="">
      <form onSubmit={handleSubmit(submit)}>
        <div className="w-full xs:w-96 py-8">
          {posterImageUrl && (
            <div className="mb-8">
              <img
                src={posterImageUrl}
                alt={`Poster for ${book.title} adaptation`}
                className="h-48 rounded"
              />
            </div>
          )}
          <div>
            <label>type*</label>
            <select
              className="block mt-2 indent-1 w-full bg-gray-900 text-white border-none rounded"
              {...register("type")}
            >
              <option value="movie">movie</option>
              <option value="tv">tv</option>
            </select>
          </div>

          <div className="mt-8 mb-4 text-gray-300 text-sm">
            At least one of the below URLs is required. (TMDB is best because it provides a poster
            image and can autofill the title.)
          </div>

          <FormInput
            labelText="tmdb url"
            type="text"
            formProps={register("tmdbUrl", validations.tmdbUrl)}
            errorMessage={errors.tmdbUrl?.message}
            placeholder="https://www.themoviedb.org/an-adaptation"
            fullWidth={false}
            onBlur={fetchTmdbData}
          />
          <FormInput
            labelText="letterboxd url"
            type="text"
            formProps={register("letterboxdUrl", validations.letterboxdUrl)}
            errorMessage={errors.letterboxdUrl?.message}
            placeholder="https://letterboxd.com/film/an-adaptation"
            fullWidth={false}
          />
          <FormInput
            labelText="wikipedia url"
            type="text"
            formProps={register("wikipediaUrl", validations.wikipediaUrl)}
            errorMessage={errors.wikipediaUrl?.message}
            placeholder="https://en.wikipedia.org/wiki/An_Adaptation"
            fullWidth={false}
          />

          <FormInput
            labelText="title*"
            type="text"
            formProps={register("title", validations.title)}
            errorMessage={errors.title?.message}
            fullWidth={false}
          />
          <FormInput
            labelText="year"
            type="text"
            formProps={register("year", validations.year)}
            descriptionText="First release year for a film, or start year for a TV series."
            errorMessage={errors.year?.message}
            fullWidth={false}
          />
          <FormInput
            labelText="date detail (if different from year)"
            type="text"
            formProps={register("dateString", validations.dateString)}
            descriptionText="Start and end year for a TV series; e.g. `2020 - 2024`, `2020 - Present`."
            errorMessage={errors.dateString?.message}
            fullWidth={false}
          />

          {errorMessage && <div className="text-red-500">{errorMessage}</div>}

          <div className="flex justify-between my-4">
            <button
              type="submit"
              className="cat-btn cat-btn-sm cat-btn-gold"
              disabled={isSubmitting}
            >
              save
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="cat-btn cat-btn-sm cat-btn-red-outline text-red-500"
            >
              cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
