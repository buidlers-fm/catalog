import { Dialog } from "@headlessui/react"
import { useCallback, useState } from "react"
import Cropper from "react-easy-crop"

const MAX_WIDTH_AND_HEIGHT = 512

interface CroppedArea {
  width: number
  height: number
  x: number
  y: number
}

const AvatarCropModal = ({ isOpen, avatarImageUrl, imageType, onModalClose, onSaveHandler }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<CroppedArea>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  })

  const onCropComplete = useCallback((_newCroppedArea, newCroppedAreaPixels) => {
    setCroppedArea(newCroppedAreaPixels)
  }, [])

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener("load", () => resolve(image))
      image.addEventListener("error", (error) => reject(error))
      image.setAttribute("crossOrigin", "anonymous")
      image.src = url
    })

  const getCroppedImg = useCallback(async () => {
    const image = (await createImage(avatarImageUrl)) as HTMLImageElement
    const canvas = document.createElement("canvas")
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = croppedArea.width
    canvas.height = croppedArea.height
    const ctx = canvas.getContext("2d")

    if (!ctx) return null

    canvas.width = croppedArea.width
    canvas.height = croppedArea.height

    ctx.drawImage(
      image,
      croppedArea.x * scaleX,
      croppedArea.y * scaleY,
      croppedArea.width * scaleX,
      croppedArea.height * scaleY,
      0,
      0,
      Math.max(croppedArea.width, MAX_WIDTH_AND_HEIGHT),
      Math.max(croppedArea.height, MAX_WIDTH_AND_HEIGHT),
    )

    // const croppedImageData = canvas.toDataURL(imageType);
    // return croppedImageData
    return new Promise((resolve) => {
      canvas.toBlob((file) => resolve(file), imageType)
    })
  }, [croppedArea, avatarImageUrl, imageType])

  const handleSaveCrop = useCallback(async () => {
    onSaveHandler(await getCroppedImg())
    onModalClose()
  }, [onSaveHandler, getCroppedImg, onModalClose])

  return (
    <Dialog open={isOpen} onClose={onModalClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center font-mulish">
        <Dialog.Panel className="relative rounded max-h-[90dvh] min-h-[80dvh] xs:min-h-[70dvh] sm:min-h-[60dvh] overflow-y-auto max-w-xs xs:max-w-md sm:max-w-xl md:max-w-none bg-gray-900 px-16 py-8 flex flex-col">
          <Dialog.Title>
            <div className="mb-8 text-center text-xl font-bold">avatar crop and resize</div>
          </Dialog.Title>
          <Dialog.Description>zoom, rotate, crop, and resize your avatar.</Dialog.Description>

          <div className="relative my-4 grow">
            <Cropper
              image={avatarImageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              showGrid
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              cropShape="round"
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              className="cat-btn cat-btn-sm cat-btn-gray"
              onClick={onModalClose}
            >
              Dismiss
            </button>
            <button
              type="button"
              className="cat-btn cat-btn-sm cat-btn-gold"
              onClick={handleSaveCrop}
            >
              Crop
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default AvatarCropModal
