import { useState } from 'react'
import { IPlateCard } from 'assets/types'
import PlateCard from './PlateCard'

interface PlateCollectionProps {
  plates: IPlateCard[]
  windowWidth: number
  isPlateSelected: (plateId: string) => boolean
  onCardClick: (plate: IPlateCard) => void
  onCardLike: (plate: IPlateCard) => void
}

const PlateCollection = (props: PlateCollectionProps) => {
  const { plates, windowWidth, isPlateSelected, onCardClick, onCardLike } =
    props

  const [currentPage, setCurrentPage] = useState(1)
  const platesPerPage = 12

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
        <button
          className="mr-8 rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400 disabled:opacity-50"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          &larr;
        </button>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
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

        <button
          className="ml-8 rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400 disabled:opacity-50"
          onClick={handleNextPage}
          disabled={endIndex >= plates.length}
        >
          &rarr;
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <span className="font-barlow text-xl text-white">
          Page {currentPage} of {Math.ceil(plates.length / platesPerPage)}
        </span>
      </div>
    </div>
  )
}

export default PlateCollection
