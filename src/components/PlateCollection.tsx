import { useState } from 'react'
import { IPlateCard } from 'assets/types'
import PlateCard from './PlateCard'
import { MAX_FLEET_SIZE, MOBILE_WIDTH_CUTOFF } from 'const/constants'

interface PlateCollectionProps {
  plates: IPlateCard[]
  windowWidth: number
  isFleet: boolean
  isPlateSelected: (plateId: string) => boolean
  onCardClick: (plate: IPlateCard) => void
  onCardLike: (plate: IPlateCard) => void
}

const PlateCollection = (props: PlateCollectionProps) => {
  const {
    plates,
    windowWidth,
    isFleet,
    isPlateSelected,
    onCardClick,
    onCardLike
  } = props

  const [currentPage, setCurrentPage] = useState(1)

  const isMobileSized = windowWidth <= MOBILE_WIDTH_CUTOFF
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
    <div>
      <div className="mx-4 flex items-center justify-center">
        {!isMobileSized && !isFleet && (
          <>
            <button
              className="mr-8 rounded bg-gray-300 p-2 text-gray-700 hover:bg-gray-400 disabled:opacity-50 md:px-4"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              &larr;
            </button>
          </>
        )}

        <div
          className={`${
            isFleet
              ? 'grid grid-cols-2 gap-4 lg:grid-cols-4'
              : 'grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 md:gap-4 xl:grid-cols-6'
          }`}
        >
          {currentPlates.map((lp) => {
            const isSelected = isPlateSelected(lp.id)
            return (
              <div key={lp.id}>
                <PlateCard
                  className={`max-w-[150px] sm:max-w-[240px] ${
                    isSelected
                      ? 'border-4 border-green-500'
                      : 'border-transparent'
                  }`}
                  card={lp}
                  onPlateCardVote={onCardClick}
                  isLiked={lp.isLiked ?? false}
                  onLikeButtonClick={onCardLike}
                  windowWidth={windowWidth}
                />
              </div>
            )
          })}
        </div>

        {!isMobileSized && !isFleet && (
          <>
            <button
              className="ml-8 rounded bg-gray-300 p-2 text-gray-700 hover:bg-gray-400 disabled:opacity-50 md:px-4"
              onClick={handleNextPage}
              disabled={endIndex >= plates.length}
            >
              &rarr;
            </button>
          </>
        )}
      </div>

      {!isFleet && (
        <>
          <div className="mt-4 flex items-center justify-center gap-4">
            {isMobileSized && (
              <>
                <button
                  className="mr-2 rounded bg-gray-300 p-2 text-xs text-gray-700 hover:bg-gray-400 disabled:opacity-50 md:px-4"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  &larr;
                </button>
              </>
            )}
            <span className="font-barlow text-xl text-white">
              Page {currentPage} of {Math.ceil(plates.length / platesPerPage)}
            </span>
            {isMobileSized && (
              <>
                <button
                  className="ml-2 rounded bg-gray-300 p-2 text-xs text-gray-700 hover:bg-gray-400 disabled:opacity-50 md:px-4"
                  onClick={handleNextPage}
                  disabled={endIndex >= plates.length}
                >
                  &rarr;
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default PlateCollection
