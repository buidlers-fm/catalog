import { ChangeEvent, useState } from "react"
import {
  createTransformedFileItemObj,
  IMAGE_MIME_TYPE,
  MAX_FILE_SIZE,
} from "app/components/images/helpers"

const useImageUpload = ({ initialFileUrl, onFileChange, markFileValid, isCroppable = false }) => {
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
      const maxFileSizeMegaBytes = MAX_FILE_SIZE / 1000 / 1000
      setErrorMessage(`Please upload a file less than ${maxFileSizeMegaBytes}MB.`)
      isValid = false
    } else if (!IMAGE_MIME_TYPE.includes(file.type)) {
      // not the correct type
      const mimeTypes = new Intl.ListFormat("en", { style: "long", type: "disjunction" }).format(
        IMAGE_MIME_TYPE,
      )
      setErrorMessage(`Please upload files of these types only: ${mimeTypes}`)
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
      } else if (isCroppable) {
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

  const handleFileCropped = (croppedFileBlob: Blob) => {
    const newCroppedFile = new File([croppedFileBlob], uploadedFile!.name, {
      type: uploadedFile!.type,
    })
    const transformedFileItemObj = createTransformedFileItemObj(newCroppedFile)

    setCroppedFileUrl(URL.createObjectURL(croppedFileBlob))
    onFileChange(transformedFileItemObj)
    setShowCropModal(false)
  }

  return {
    croppedFileUrl,
    uploadedFile,
    uploadedFileType,
    errorMessage,
    handleDeleteClick,
    handleFileChange,
    handleFileCropped,
    showCropModal,
    setShowCropModal,
  }
}

export default useImageUpload
