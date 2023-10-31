"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import humps from "humps"
import useEditBookList from "hooks/useEditBookList"
import { fetchJson, isValidHttpUrl } from "lib/helpers/general"
import AvatarUpload from "app/settings/profile/components/AvatarUpload"
import FormInput from "app/components/forms/FormInput"
import FormTextarea from "app/components/forms/FormTextarea"
import EditListBooks from "app/lists/new/components/EditListBooks"

const validations = {
  displayName: {
    maxLength: {
      value: 80,
      message: "Display name cannot be longer than 80 characters.",
    },
  },
  location: {
    maxLength: {
      value: 40,
      message: "Location cannot be longer than 40 characters.",
    },
  },
  website: {
    validate: (value) => isValidHttpUrl(value) || "Website needs to be a valid URL.",
  },
  bio: {
    maxLength: {
      value: 300,
      message: "Bio cannot be longer than 300 characters.",
    },
  },
}

export default function EditProfile({ userProfile, favoriteBooksList }) {
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
  const [errorMessage, setErrorMessage] = useState<string>()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ [k: string]: string }>({
    defaultValues: userProfile,
  })

  const onAvatarChange = (file) => {
    setAvatar(file)
    setAvatarUpdated(true)
  }

  const submit = async (userProfileData) => {
    if (!avatarValid) {
      console.log("avatar is invalid, can't submit!")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(undefined)

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

    console.log(requestData)
    console.log(errors)

    try {
      const updatedProfile = await fetchJson(`/api/profiles/${userProfile.userId}`, {
        method: "PATCH",
        body: formData,
      })

      toast.success("Changes saved!", { id: toastId })

      setAvatarValid(true)
      setAvatarUpdated(false)
      setAvatarUrl(updatedProfile.avatarUrl)
    } catch (error: any) {
      setErrorMessage(error.message)
      toast.error("Oh no! There was an error updating your profile.", { id: toastId })
    }

    setIsSubmitting(false)
  }

  return (
    <div className="my-8 max-w-4xl mx-auto font-nunito-sans">
      <div className="my-8 text-3xl">Edit Profile</div>
      <form onSubmit={handleSubmit(submit)}>
        <div className="ml:flex justify-center">
          <div className="my-8 grow">
            <AvatarUpload
              initialFile={avatarUrl}
              onFileChange={onAvatarChange}
              markFileValid={setAvatarValid}
            />
            <div className="mt-8">
              <FormInput
                labelText="Username (not editable)"
                name="username"
                type="text"
                formProps={register("username")}
                fullWidth={false}
                disabled
              />
              <FormInput
                labelText="Display name"
                name="displayName"
                type="text"
                formProps={register("displayName", validations.displayName)}
                errorMessage={errors.displayName?.message}
                fullWidth={false}
              />
              <FormInput
                labelText="Location"
                name="location"
                type="text"
                formProps={register("location", validations.location)}
                errorMessage={errors.location?.message}
                fullWidth={false}
              />
              <FormInput
                labelText="Website"
                name="website"
                type="text"
                formProps={register("website", validations.website)}
                errorMessage={errors.website?.message}
                fullWidth={false}
                placeholder="https://example.com"
              />
              <FormTextarea
                labelText="Bio"
                name="bio"
                type="text"
                formProps={register("bio", validations.bio)}
                errorMessage={errors.bio?.message}
                fullWidth={false}
              />
            </div>
          </div>
          <div className="ml:ml-16 flex flex-col">
            <EditListBooks
              heading="Top 5 books"
              books={books}
              onBookSelect={addBook}
              onBookRemove={removeBook}
              onReorder={reorderBooks}
              limit={5}
            />
          </div>
        </div>
        <div className="inline-block">
          <button type="submit" className="cat-btn cat-btn-gold my-4" disabled={isSubmitting}>
            Save changes
          </button>
        </div>
        <div className="w-96">
          {errorMessage && <div className="my-3 text-red-500">{errorMessage}</div>}
        </div>
      </form>
    </div>
  )
}
