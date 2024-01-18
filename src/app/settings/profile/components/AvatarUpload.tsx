"use client"

import { FaUserCircle } from "react-icons/fa"
import { MdEdit, MdOutlineFileUpload } from "react-icons/md"
import { TbTrash } from "react-icons/tb"
import ImageCropModal from "app/components/images/ImageCropModal"
import useImageUpload from "app/components/images/useImageUpload"
import { IMAGE_MIME_TYPE } from "app/components/images/helpers"

const AvatarUpload = ({ initialFileUrl, onFileChange, markFileValid }) => {
  const {
    croppedFileUrl,
    uploadedFile,
    uploadedFileType,
    showCropModal,
    errorMessage,
    handleDeleteClick,
    handleFileChange,
    handleFileCropped,
    setShowCropModal,
  } = useImageUpload({ initialFileUrl, onFileChange, markFileValid, isCroppable: true })

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

  const actionIconContainerClasses =
    "w-8 h-8 bg-gray-800 text-white rounded-full cursor-pointer flex justify-center items-center"

  const actionIconButtons = (
    <>
      <label htmlFor="fileUpload">
        <div className="absolute cursor-default bottom-4 left-4">
          <div className={actionIconContainerClasses}>
            {croppedFileUrl ? (
              <MdEdit className="text-lg" />
            ) : (
              <MdOutlineFileUpload className="text-lg" />
            )}
          </div>
        </div>
      </label>

      {croppedFileUrl && (
        <button
          type="button"
          className="absolute cursor-default bottom-4 right-4"
          onClick={handleDeleteClick}
        >
          <div className={actionIconContainerClasses}>
            <TbTrash className="text-xl" />
          </div>
        </button>
      )}
    </>
  )

  return (
    <div className="w-full xs:w-96">
      {uploadedFile && showCropModal && (
        <ImageCropModal
          imageUrl={URL.createObjectURL(uploadedFile)}
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
          value="" // this allows you to select the same file that you selected previously
          accept={IMAGE_MIME_TYPE.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />
        {avatar(actionIconButtons)}
      </div>
      <div className="mt-6 text-sm text-gray-200">
        Max 4 MB. For GIFs, a 1:1 aspect ratio is recommended, as it will get auto-cropped.
      </div>
      {errorMessage && <div className="my-4 text-red-500">{errorMessage}</div>}
    </div>
  )
}

export default AvatarUpload
