"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import humps from "humps"
import api from "lib/api"
import { reportToSentry } from "lib/sentry"
import useEditBookList from "lib/hooks/useEditBookList"
import { isValidHttpUrl, getUserProfileLink } from "lib/helpers/general"
import AvatarUpload from "app/settings/profile/components/AvatarUpload"
import FormInput from "app/components/forms/FormInput"
import FormTextarea from "app/components/forms/FormTextarea"
import EditListBooks from "app/users/[username]/lists/new/components/EditListBooks"

const MAX_LENGTHS = {
  displayName: 80,
  location: 40,
  bio: 300,
}

const validations = {
  displayName: {
    maxLength: {
      value: MAX_LENGTHS.displayName,
      message: `Display name cannot be longer than ${MAX_LENGTHS.displayName} characters.`,
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
  bio: {
    maxLength: {
      value: MAX_LENGTHS.bio,
      message: `Bio cannot be longer than ${MAX_LENGTHS.bio} characters.`,
    },
  },
}

export default function EditProfile({ userProfile, favoriteBooksList }) {
  const router = useRouter()

  const {
    books,
    addBook,
    removeBook,
    reorderBooks,
    isDirty: isBooksListDirty,
  } = useEditBookList(favoriteBooksList)

  const [avatar, setAvatar] = useState<any>()
  const [avatarUrl, setAvatarUrl] = useState<string>(userProfile.avatarUrl)
  const [avatarUpdated, setAvatarUpdated] = useState<boolean>(false)
  const [avatarValid, setAvatarValid] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{ [k: string]: string }>({
    defaultValues: userProfile,
  })

  const displayNameValue = watch("displayName")
  const locationValue = watch("location")
  const bioValue = watch("bio")

  const onAvatarChange = (file) => {
    setAvatar(file)
    setAvatarUpdated(true)
  }

  const submit = async (userProfileData) => {
    if (!avatarValid) return

    setIsSubmitting(true)

    const toastId = toast.loading("Saving your changes...")

    const requestData: any = {
      userProfile: userProfileData,
      books,
      options: {
        favoriteBooksUpdated: isBooksListDirty,
      },
    }

    const formData = new FormData()

    if (avatarUpdated) {
      if (avatar) {
        formData.append("avatarFile", avatar.file)
        requestData.options.avatarMimeType = avatar.fileType
        requestData.options.avatarExtension = avatar.fileExtension
      } else {
        requestData.options.avatarDeleted = true
      }
    }

    formData.append("data", JSON.stringify(humps.decamelizeKeys(requestData)))

    try {
      const updatedProfile = await api.profiles.update(userProfile.userId, formData)

      const successMessage = (
        <div className="flex flex-col xs:block ml-2">
          Changes saved!&nbsp;&nbsp;
          <a href={getUserProfileLink(userProfile.username)} className="underline">
            View your profile.
          </a>
        </div>
      )

      toast.success(successMessage, { id: toastId, duration: 8000 })

      setAvatarValid(true)
      setAvatarUpdated(false)
      setAvatarUrl(updatedProfile.avatarUrl)

      router.refresh()
    } catch (error: any) {
      reportToSentry(error, {
        ...requestData,
        avatarUpdated,
        avatar,
        formData,
        currentUserProfile: userProfile,
      })

      toast.error("Hmm, something went wrong.", { id: toastId })
    }

    setIsSubmitting(false)
  }

  return (
    <div className="my-8 mx-8 sm:mx-16 lg:max-w-4xl lg:mx-auto font-mulish">
      <div className="my-8 cat-page-title">edit profile</div>
      <form onSubmit={handleSubmit(submit)}>
        <div className="ml:flex justify-center">
          <div className="my-8 grow">
            <AvatarUpload
              initialFileUrl={avatarUrl}
              onFileChange={onAvatarChange}
              markFileValid={setAvatarValid}
            />
            <div className="mt-8">
              <FormInput
                labelText="username (not editable)"
                name="username"
                type="text"
                formProps={register("username")}
                fullWidth={false}
                disabled
              />
              <FormInput
                labelText="display name"
                name="displayName"
                type="text"
                formProps={register("displayName", validations.displayName)}
                remainingChars={MAX_LENGTHS.displayName - (displayNameValue?.length || 0)}
                errorMessage={errors.displayName?.message}
                fullWidth={false}
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
                name="website"
                type="text"
                formProps={register("website", validations.website)}
                errorMessage={errors.website?.message}
                fullWidth={false}
                placeholder="https://example.com"
              />
              <FormTextarea
                labelText="bio"
                name="bio"
                type="text"
                formProps={register("bio", validations.bio)}
                remainingChars={MAX_LENGTHS.bio - (bioValue?.length || 0)}
                errorMessage={errors.bio?.message}
                fullWidth={false}
                atMentionsEnabled={false}
              />
            </div>
          </div>
          <div className="ml:ml-16 flex flex-col">
            <EditListBooks
              heading="favorite (top 4) books"
              books={books}
              onBookSelect={addBook}
              onBookRemove={removeBook}
              onReorder={reorderBooks}
              limit={4}
              isRanked={false}
            />
          </div>
        </div>
        <div className="inline-block">
          <button
            type="submit"
            className="cat-btn cat-btn-sm cat-btn-gold my-4"
            disabled={isSubmitting}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
