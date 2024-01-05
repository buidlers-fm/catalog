import { ChangeEvent, useEffect, useRef, useState } from "react"
import { FaUserCircle } from "react-icons/fa"
import { MdEdit, MdOutlineFileUpload } from "react-icons/md"
import { TbTrash } from "react-icons/tb"
import AvatarCropModal from "app/settings/profile/components/AvatarCropModal"

// const imageMimeType = /image\/(png|jpg|jpeg|gif)/i

const AvatarUpload = ({ initialFile, onFileChange, markFileValid }) => {
  const [file, setFile] = useState<File>()
  const [fileDataURL, setFileDataURL] = useState<string>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [fileType, setFileType] = useState<string>()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false)

  useEffect(() => {
    if (initialFile) {
      setFileDataURL(initialFile)
    }
  }, [initialFile])

  useEffect(() => {
    if (!file) return

    let isCancel = false
    const fileReader = new FileReader()

    fileReader.onload = (event) => {
      if (!event.target) return

      const { result } = event.target

      if (result && !isCancel) {
        setFileDataURL(result.toString())
      }
    }

    fileReader.readAsDataURL(file)

    return () => {
      isCancel = true

      if (fileReader && fileReader.readyState === 1) {
        fileReader.abort()
      }
    }
  }, [file])

  const handleUploadClick = () => {
    inputRef.current?.click()
  }

  const clearInputRef = () => {
    if (!inputRef.current?.value) return
    inputRef.current.value = ""
  }

  const handleDeleteClick = () => {
    setErrorMessage(undefined)
    setFileType(undefined)
    setFile(undefined)
    setFileDataURL(undefined)
    clearInputRef()
    onFileChange(undefined)
    markFileValid(true) // file has been removed
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(undefined)

    if (!event.target.files) return

    const _file = event.target.files[0]

    setFileType(_file.type)
    setFile(_file)
    setIsCropModalOpen(true)
    if (!_file) {
      onFileChange(undefined)
      markFileValid(true) // file has been removed
    }
  }

  const handleFileCropped = (croppedFileBlob) => {
    const croppedFile = new File([croppedFileBlob], file!.name, { type: file!.type })
    setFile(croppedFile)
    const transformedFileItemObj = {
      file: croppedFile,
      fileType: croppedFile.type,
      fileExtension: croppedFile.name.split(".").pop(),
    }
    onFileChange(transformedFileItemObj)
    setIsCropModalOpen(false)
  }

  const avatar = (children) => (
    <div className="relative">
      {fileDataURL ? (
        <img src={fileDataURL} alt="preview" className="h-48 w-48 rounded-full" />
      ) : (
        <div className="flex items-center justify-center h-48 w-48 border solid border-gold-100 rounded-full">
          <FaUserCircle className="h-12 w-12 text-gold-100 rounded-full" />
        </div>
      )}
      {children}
    </div>
  )

  const actionIconButtonClasses = "bg-white cursor-pointer text-black rounded-full w-8 h-8"

  const actionIconButtons = (
    <>
      <button
        type="button"
        className="absolute cursor-default bottom-4 left-4"
        onClick={handleUploadClick}
      >
        {fileDataURL ? (
          <MdEdit className={actionIconButtonClasses} />
        ) : (
          <MdOutlineFileUpload className={actionIconButtonClasses} />
        )}
      </button>
      {fileDataURL && (
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
      <AvatarCropModal
        avatarImageUrl={fileDataURL}
        imageType={fileType}
        isOpen={isCropModalOpen}
        onModalClose={() => setIsCropModalOpen(false)}
        onSaveHandler={handleFileCropped}
      />
      <div className="flex flex-col items-center">
        <input
          type="file"
          accept=".png, .jpg, .jpeg, .gif"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {avatar(actionIconButtons)}
      </div>
      <div className="mt-6 text-sm text-gray-200">
        max 4 MiB. for GIFs, a 1:1 aspect ratio is recommended, else it will look stretched.
      </div>
      {errorMessage && <div className="my-4 text-red-500">{errorMessage}</div>}
    </div>
  )
}

export default AvatarUpload
