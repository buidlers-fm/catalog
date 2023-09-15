"use client"

import { useState, useEffect } from "react"
import { FilePond, registerPlugin } from "react-filepond"
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size"
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type"
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation"
import FilePondPluginImagePreview from "filepond-plugin-image-preview"
import FilePondPluginImageCrop from "filepond-plugin-image-crop"
import FilePondPluginImageResize from "filepond-plugin-image-resize"
import FilePondPluginImageTransform from "filepond-plugin-image-transform"
import "filepond/dist/filepond.min.css"
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css"

registerPlugin(
  FilePondPluginFileValidateSize,
  FilePondPluginFileValidateType,
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginImageCrop,
  FilePondPluginImageResize,
  FilePondPluginImageTransform,
)

export default function AvatarUpload({ initialFile, onFileChange, markFileValid }) {
  const [files, setFiles] = useState<any[]>([])
  const [errorMessage, setErrorMessage] = useState<string>()

  useEffect(() => {
    if (initialFile) {
      setFiles([initialFile])
    }
  }, [])

  const handleFileChange = (_files) => {
    setErrorMessage(undefined)

    setFiles(_files)

    const _file = _files[0]
    console.log(_file)
    onFileChange(_file)

    if (!_file) markFileValid(true) // file has been removed
  }

  const handleError = (error) => {
    const { main, sub } = error
    const errorDetail = sub ? ` - ${sub}` : ""
    const _errorMessage = `${main}${errorDetail}`

    setErrorMessage(_errorMessage)
    markFileValid(false)
  }

  return (
    <div className="h-48 w-48">
      <FilePond
        name="avatar"
        files={files}
        onupdatefiles={handleFileChange}
        onerror={handleError}
        imagePreviewHeight={192}
        imageCropAspectRatio="1:1"
        imageResizeTargetWidth={512}
        imageResizeTargetHeight={512}
        acceptedFileTypes={["image/*"]}
        maxFileSize="4MB"
        labelIdle="Drag & drop, paste, or click to select"
        stylePanelLayout="compact circle"
        styleLoadIndicatorPosition="center"
        styleProgressIndicatorPosition="center"
        styleButtonRemoveItemPosition="right bottom"
      />
      {errorMessage && <div className="my-4 text-red-500">{errorMessage}</div>}
    </div>
  )
}
