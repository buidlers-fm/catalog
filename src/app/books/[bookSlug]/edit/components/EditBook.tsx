"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import { getBookLink } from "lib/helpers/general"
import FormInput from "app/components/forms/FormInput"
import FormTextarea from "app/components/forms/FormTextarea"
import FormCheckbox from "app/components/forms/FormCheckbox"

type BookFormData = {
  slug: string
  openLibraryWorkId: string
  title: string
  subtitle: string
  authorName: string
  description: string
  firstPublishedYear: number
  isOriginallyEnglish: boolean
  originalTitle: string
  wikipediaUrl: string
}

const MAX_LENGTHS = {
  title: 200,
  subtitle: 300,
  authorName: 200,
  description: 4000,
  originalTitle: 200,
}

const validations = {
  title: {
    required: true,
    maxLength: {
      value: MAX_LENGTHS.title,
      message: `Title cannot be longer than ${MAX_LENGTHS.title} characters.`,
    },
  },
  subtitle: {
    maxLength: {
      value: MAX_LENGTHS.subtitle,
      message: `Subtitle cannot be longer than ${MAX_LENGTHS.subtitle} characters.`,
    },
  },
  authorName: {
    required: true,
    maxLength: {
      value: MAX_LENGTHS.authorName,
      message: `Author name cannot be longer than ${MAX_LENGTHS.authorName} characters.`,
    },
  },
  description: {
    maxLength: {
      value: MAX_LENGTHS.description,
      message: `Description cannot be longer than ${MAX_LENGTHS.description} characters.`,
    },
  },
  firstPublishedYear: {
    min: {
      value: 0,
      message: "First published year must be a positive number.",
    },
    max: {
      value: new Date().getFullYear() + 1,
      message: "First published year cannot be more than 1 year in the future.",
    },
  },
  originalTitle: {
    maxLength: {
      value: MAX_LENGTHS.originalTitle,
      message: `Original title cannot be longer than ${MAX_LENGTHS.originalTitle} characters.`,
    },
  },

  wikipediaUrl: {
    pattern: {
      value: /^https?:\/\/([a-z]+\.)?wikipedia\.org\/wiki\/[^ ]+$/,
      message: "Must be a valid Wikipedia URL.",
    },
  },
}

export default function EditBook({ book }) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookFormData>({
    defaultValues: {
      ...book,
      isOriginallyEnglish: !book.isTranslated,
    },
  })

  const submit = async (formData: BookFormData) => {
    const requestData = {
      ...formData,
      isTranslated: !formData.isOriginallyEnglish,
    }

    setIsSubmitting(true)

    const toastId = toast.loading("Saving your changes...")

    try {
      await api.books.update(book.id, formData)

      const successMessage = (
        <div className="flex flex-col ml-2">
          Changes saved!&nbsp;
          <a href={getBookLink(book.slug)} className="underline">
            Back to book
          </a>
        </div>
      )

      toast.success(successMessage, { id: toastId })
    } catch (error: any) {
      toast.error("Hmm, something went wrong.", { id: toastId })

      reportToSentry(error, {
        method: "EditBook.submit",
        ...requestData,
      })
    }

    setIsSubmitting(false)
  }

  const titleValue = watch("title")
  const subtitleValue = watch("subtitle")
  const authorNameValue = watch("authorName")
  const descriptionValue = watch("description")
  const originalTitleValue = watch("originalTitle")

  const readyToSubmit = titleValue?.length > 0 && authorNameValue.length > 0

  return (
    <div className="my-8 mx-8 sm:mx-16 ml:max-w-3xl ml:mx-auto font-mulish">
      <div className="my-8 cat-page-title">
        edit {book.title} by {book.authorName}
      </div>
      <form onSubmit={handleSubmit(submit)}>
        <div className="my-8">
          <FormInput
            labelText="slug (not editable for now)"
            name="slug"
            type="text"
            formProps={register("slug")}
            fullWidth={false}
            disabled
          />
          <FormInput
            labelText="open library work id (not editable for now)"
            name="openLibraryWorkId"
            type="text"
            formProps={register("openLibraryWorkId")}
            fullWidth={false}
            disabled
          />
          <FormInput
            labelText="title"
            name="title"
            type="text"
            formProps={register("title", validations.title)}
            remainingChars={MAX_LENGTHS.title - (titleValue?.length || 0)}
            errorMessage={errors.title?.message}
            fullWidth={false}
          />
          <FormInput
            labelText="subtitle"
            name="subtitle"
            type="text"
            formProps={register("subtitle", validations.subtitle)}
            remainingChars={MAX_LENGTHS.subtitle - (subtitleValue?.length || 0)}
            errorMessage={errors.subtitle?.message}
            fullWidth={false}
          />
          <FormInput
            labelText="author name"
            name="authorName"
            type="text"
            formProps={register("authorName", validations.authorName)}
            remainingChars={MAX_LENGTHS.title - (authorNameValue?.length || 0)}
            errorMessage={errors.authorName?.message}
            fullWidth={false}
          />

          <FormTextarea
            labelText="description"
            name="description"
            type="text"
            formProps={register("description", validations.description)}
            rows={5}
            remainingChars={MAX_LENGTHS.description - (descriptionValue?.length || 0)}
            errorMessage={errors.description?.message}
            fullWidth={false}
            atMentionsEnabled={false}
          />

          <div className="my-8">
            <FormCheckbox
              name="isOriginallyEnglish"
              formProps={register("isOriginallyEnglish")}
              labelText="This book's original language is English."
            />
          </div>

          <FormInput
            labelText="original title"
            descriptionText="The title in the book's original language."
            name="originalTitle"
            type="text"
            formProps={register("originalTitle", validations.originalTitle)}
            remainingChars={MAX_LENGTHS.originalTitle - (originalTitleValue?.length || 0)}
            errorMessage={errors.originalTitle?.message}
            fullWidth={false}
          />

          <FormInput
            labelText="wikipedia url"
            descriptionText="Only add if there is a Wikipedia page for the book specifically, not just the author."
            name="wikipediaUrl"
            type="text"
            formProps={register("wikipediaUrl", validations.wikipediaUrl)}
            errorMessage={errors.wikipediaUrl?.message}
            fullWidth={false}
          />

          <div className="flex justify-between">
            <button
              type="submit"
              className="cat-btn cat-btn-sm cat-btn-gold my-4"
              disabled={isSubmitting || !readyToSubmit}
            >
              save
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
