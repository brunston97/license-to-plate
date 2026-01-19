// ImageContainer.tsx

import { Image } from '@heroui/react'

interface ImageContainerProps {
  src: string
  alt: string
  isZoomed?: boolean
  className?: string
}

const ImageContainer = ({
  src,
  alt,
  isZoomed = false,
  className = ''
}: ImageContainerProps) => {
  return (
    <Image
      id={`imgContainer-${src}`}
      alt={alt}
      src={src}
      classNames={{
        wrapper: 'size-full max-h-full !max-w-full overflow-hidden',
        zoomedWrapper: 'size-full',
        img: 'size-full object-cover object-center'
      }}
      isZoomed={isZoomed}
      className={className}
    />
  )
}

export default ImageContainer
