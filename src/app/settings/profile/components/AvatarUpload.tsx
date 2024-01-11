"use client"

import { ChangeEvent, useState } from "react"
import { FaUserCircle } from "react-icons/fa"
import { MdEdit, MdOutlineFileUpload } from "react-icons/md"
import { TbTrash } from "react-icons/tb"
import AvatarCropModal from "app/settings/profile/components/AvatarCropModal"

const IMAGE_MIME_TYPE = ["image/png", "image/jpg", "image/jpeg", "image/gif"]
const MAX_FILE_SIZE = 4 * 1000 * 1000

const AvatarUpload = ({ initialFileUrl, onFileChange, markFileValid }) => {
  const [croppedFileUrl, setCroppedFileUrl] = useState<string | undefined>(initialFileUrl)
  const [uploadedFile, setUploadedFile] = useState<Blob>()
  const [uploadedFileType, setUploadedFileType] = useState<string>()
  const [showCropModal, setShowCropModal] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  const isValidFile = (file: File): boolean => {
    if (!file) return false

    let isValid = true

    if (file.size > MAX_FILE_SIZE) {
      // size too large
      setErrorMessage("Please upload a file less than 4MB.")
      isValid = false
    } else if (!IMAGE_MIME_TYPE.includes(file.type)) {
      // not the correct type
      setErrorMessage("Please upload only a PNG, JPG, or GIF file.")
      isValid = false
    }

    return isValid
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(undefined)

    if (!event.target.files) return

    const targetFile = event.target.files[0]

    if (!isValidFile(targetFile)) return

    setUploadedFileType(targetFile!.type)
    setUploadedFile(targetFile)

    if (targetFile) {
      if (targetFile.type === "image/gif") {
        setCroppedFileUrl(URL.createObjectURL(targetFile))
        onFileChange(createTransformedFileItemObj(targetFile))
      } else {
        setShowCropModal(true)
      }
    } else {
      onFileChange(undefined)
      markFileValid(true) // file has been removed
    }
  }

  const handleDeleteClick = () => {
    setErrorMessage(undefined)
    setCroppedFileUrl(undefined)
    onFileChange(undefined)
    markFileValid(true) // file has been removed
  }

  const createTransformedFileItemObj = (file: Blob) => ({
    file,
    uploadedFileType: file.type,
    fileExtension: file.name.split(".").pop(),
  })

  const handleFileCropped = (croppedFileBlob: Blob) => {
    const newCroppedFile = new File([croppedFileBlob], uploadedFile!.name, {
      type: uploadedFile!.type,
    })
    const transformedFileItemObj = createTransformedFileItemObj(newCroppedFile)

    setCroppedFileUrl(URL.createObjectURL(croppedFileBlob))
    onFileChange(transformedFileItemObj)
    setShowCropModal(false)
  }

  const avatar = (children: JSX.Element) => (
    <div className="relative">
      <div className="h-48 w-48 rounded-full overflow-hidden">
        {croppedFileUrl ? (
          <img src={croppedFileUrl} alt="preview" className="object-cover h-full w-full" />
        ) : (
          <div className="flex items-center justify-center h-48 w-48 border solid border-gold-100 rounded-full">
            <FaUserCircle className="h-12 w-12 text-gold-100 rounded-full" />
          </div>
        )}
        {children}
      </div>
    </div>
  )

  const actionIconButtonClasses = "bg-white cursor-pointer text-black rounded-full w-8 h-8"

  const actionIconButtons = (
    <>
      <label htmlFor="fileUpload">
        <div className="absolute cursor-default bottom-4 left-4">
          {croppedFileUrl ? (
            <MdEdit className={actionIconButtonClasses} />
          ) : (
            <MdOutlineFileUpload className={actionIconButtonClasses} />
          )}
        </div>
      </label>

      {croppedFileUrl && (
        <button
          type="button"
          className="absolute cursor-default bottom-4 right-4"
          onClick={handleDeleteClick}
        >
          <TbTrash className={actionIconButtonClasses} />
        </button>
      )}
    </>
  )

  return (
    <div className="w-full xs:w-96">
      {uploadedFile && (
        <AvatarCropModal
          avatarImageUrl={URL.createObjectURL(uploadedFile)}
          imageType={uploadedFileType}
          isOpen={showCropModal}
          onModalClose={() => setShowCropModal(false)}
          onSaveHandler={handleFileCropped}
        />
      )}
      <div className="flex flex-col items-center">
        <input
            id="fileUpload"
            type="file"
            value=""
            accept={IMAGE_MIME_TYPE.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />
          {avatar(actionIconButtons)}
        </div>
      <div className="mt-6 text-sm text-gray-200">
        Max 4 MB. For GIFs, a 1:1 aspect ratio is recommended, else it will look stretched.
      </div>
      {errorMessage && <div className="my-4 text-red-500">{errorMessage}</div>}
    </div>
  )
}

export default AvatarUpload
