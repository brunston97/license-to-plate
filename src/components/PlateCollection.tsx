import { useState } from 'react'
import { IPlateCard } from 'assets/types'
import { MAX_FLEET_SIZE } from 'const/constants'
import { Button, ScrollShadow } from '@heroui/react'
import PlateCardGallery from './PlateCardGallery'

interface PlateCollectionProps {
  plates: IPlateCard[]
  windowWidth: number
  isFleet: boolean
  isPlateSelected: (plateId: number) => boolean
  onCardClick: (plate: IPlateCard) => void
  onCardLike: (plate: IPlateCard) => void
}

const PlateCollection = (props: PlateCollectionProps) => {
  const {
    plates,
    isFleet,
    //isPlateSelected,
    onCardLike
  } = props

  const [currentPage, setCurrentPage] = useState(1)

  //const isMobileSized = windowWidth <= MOBILE_WIDTH_CUTOFF
  const platesPerPage = isFleet ? MAX_FLEET_SIZE : 12

  // useMemo?
  const startIndex = (currentPage - 1) * platesPerPage
  const endIndex = startIndex + platesPerPage
  const currentPlates = plates.slice(startIndex, endIndex)

  const handleNextPage = () => {
    if (endIndex < plates.length) {
      setCurrentPage((prev) => prev + 1)
    }
  }
  const handlePreviousPage = () => {
    if (startIndex > 0) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  return (
    <div className="flex size-full flex-col">
      <ScrollShadow hideScrollBar className="min-h-0 w-full grow" size={10}>
        <PlateCardGallery
          plates={currentPlates}
          showLikes
          onLikeButtonClick={onCardLike}
          centerText={false}
          isZoomed
        ></PlateCardGallery>
      </ScrollShadow>

      {/* {!isMobileSized && !isFleet && (
        <>
          <button
            className="ml-8 rounded bg-gray-300 p-2 text-gray-700 hover:bg-gray-400 disabled:opacity-50 md:px-4"
            onClick={handleNextPage}
            disabled={endIndex >= plates.length}
          >
            &rarr;
          </button>
        </>
      )} */}

      {!isFleet && (
        <div className="mt-3 flex items-center justify-center gap-4">
          <Button
            className="mr-2 rounded bg-gray-300 p-2 text-xs text-gray-700 hover:bg-gray-400 disabled:opacity-50 md:px-4"
            onPress={handlePreviousPage}
            disabled={currentPage === 1}
          >
            &larr;
          </Button>

          <span className="font-barlow text-xl text-white">
            Page {currentPage} of {Math.ceil(plates.length / platesPerPage)}
          </span>
          <Button
            className="ml-2 rounded bg-gray-300 p-2 text-xs text-gray-700 hover:bg-gray-400 disabled:opacity-50 md:px-4"
            onPress={handleNextPage}
            disabled={endIndex >= plates.length}
          >
            &rarr;
          </Button>
        </div>
      )}
    </div>
  )
}

export default PlateCollection
