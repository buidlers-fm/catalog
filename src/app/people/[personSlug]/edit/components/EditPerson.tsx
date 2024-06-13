"use client"

import { useState } from "react"
import humps from "humps"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import { isValidHttpUrl, getPersonLinkWithSlug } from "lib/helpers/general"
import FormInput from "app/components/forms/FormInput"
import FormTextarea from "app/components/forms/FormTextarea"
import AvatarUpload from "app/settings/profile/components/AvatarUpload"

type PersonFormData = {
  name: string
  bio: string
  location: string
  website: string
  wikipediaUrl: string
  slug: string
  openLibraryAuthorId: string
  wikidataId: string
}

const MAX_LENGTHS = {
  name: 200,
  bio: 2500,
  location: 40,
}

const validations = {
  name: {
    required: true,
    maxLength: {
      value: MAX_LENGTHS.name,
      message: `Name cannot be longer than ${MAX_LENGTHS.name} characters.`,
    },
  },
  bio: {
    maxLength: {
      value: MAX_LENGTHS.bio,
      message: `Bio cannot be longer than ${MAX_LENGTHS.bio} characters.`,
    },
  },
  location: {
    maxLength: {
      value: MAX_LENGTHS.location,
      message: `Location cannot be longer than ${MAX_LENGTHS.location} characters.`,
    },
  },
  website: {
    validate: (value) => {
      if (!value) return true
      return isValidHttpUrl(value) || "Website needs to be a valid URL."
    },
  },
  wikipediaUrl: {
    pattern: {
      value: /^https?:\/\/([a-z]+\.)?wikipedia\.org\/wiki\/[^ ]+$/,
      message: "Must be a valid Wikipedia URL.",
    },
  },
}

export default function EditPerson({ person }) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [image, setImage] = useState<any>()
  const [imageUrl, setImageUrl] = useState<string>(person.imageUrl)
  const [imageChanged, setImageChanged] = useState<boolean>(false)
  const [imageValid, setImageValid] = useState<boolean>(true)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PersonFormData>({
    defaultValues: {
      ...person,
    },
  })

  const onImageChange = (file) => {
    setImage(file)
    setImageChanged(true)
  }

  const submit = async (data: PersonFormData) => {
    if (!imageValid) return

    const requestData = {
      person: data,
      options: {} as any,
    }

    const formData = new FormData()

    if (imageChanged) {
      if (image) {
        formData.append("imageFile", image.file)
        requestData.options.imageMimeType = image.fileType
        requestData.options.imageExtension = image.fileExtension
      } else {
        requestData.options.imageDeleted = true
      }
    }

    formData.append("data", JSON.stringify(humps.decamelizeKeys(requestData)))

    setIsSubmitting(true)

    const toastId = toast.loading("Saving your changes...")

    try {
      const updatedPerson = await api.people.update(person.id, formData)

      const successMessage = (
        <div className="flex flex-col ml-2">
          Changes saved!&nbsp;
          <a href={getPersonLinkWithSlug(person.slug)} className="underline">
            Back to person's page
          </a>
        </div>
      )

      toast.success(successMessage, { id: toastId })

      setImageValid(true)
      setImageChanged(false)
      setImageUrl(updatedPerson.imageUrl)
    } catch (error: any) {
      toast.error("Hmm, something went wrong.", { id: toastId })

      reportToSentry(error, {
        method: "EditPerson.submit",
        ...requestData,
      })
    }

    setIsSubmitting(false)
  }

  const nameValue = watch("name")
  const bioValue = watch("bio")
  const locationValue = watch("location")

  const readyToSubmit = nameValue?.length > 0

  return (
    <div className="my-8 mx-8 sm:mx-16 ml:max-w-3xl ml:mx-auto font-mulish">
      Please use English for all fields below, including the English spelling of the person's name.
      <form onSubmit={handleSubmit(submit)}>
        <div className="my-8 w-full sm:w-96">
          <div className="my-8">
            <AvatarUpload
              initialFileUrl={imageUrl}
              onFileChange={onImageChange}
              markFileValid={setImageValid}
            />
          </div>

          <FormInput
            labelText="slug (not editable for now)"
            name="slug"
            type="text"
            formProps={register("slug")}
            fullWidth={false}
            disabled
          />
          <FormInput
            labelText="open library author id (not editable for now)"
            name="openLibraryAuthorId"
            type="text"
            formProps={register("openLibraryAuthorId")}
            fullWidth={false}
            disabled
          />
          <FormInput
            labelText="wikidata id (not editable for now)"
            name="wikidataId"
            type="text"
            formProps={register("wikidataId")}
            fullWidth={false}
            disabled
          />
          <FormInput
            labelText="name"
            name="name"
            type="text"
            formProps={register("name", validations.name)}
            remainingChars={MAX_LENGTHS.name - (nameValue?.length || 0)}
            errorMessage={errors.name?.message}
            fullWidth={false}
          />
          <FormTextarea
            labelText="bio"
            descriptionText="Use the person's bio from a reputable source, if possible."
            name="bio"
            type="text"
            formProps={register("bio", validations.bio)}
            rows={5}
            remainingChars={MAX_LENGTHS.bio - (bioValue?.length || 0)}
            errorMessage={errors.bio?.message}
            fullWidth={false}
            atMentionsEnabled={false}
          />

          <FormInput
            labelText="location"
            name="location"
            type="text"
            formProps={register("location", validations.location)}
            remainingChars={MAX_LENGTHS.location - (locationValue?.length || 0)}
            errorMessage={errors.location?.message}
            fullWidth={false}
          />
          <FormInput
            labelText="website"
            descriptionText="The person's own official website, if they have one."
            name="website"
            type="text"
            formProps={register("website", validations.website)}
            errorMessage={errors.website?.message}
            fullWidth={false}
            placeholder="https://example.com"
          />

          <FormInput
            labelText="wikipedia url"
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
