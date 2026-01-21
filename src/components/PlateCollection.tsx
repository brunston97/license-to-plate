// PlateCollection.tsx  (refactored)
import { Children, isValidElement, ReactElement, useState } from 'react'
import { Button, ScrollShadow } from '@heroui/react'
import { MAX_FLEET_SIZE } from 'const/constants'
import { PlateCardProps } from './PlateCard'
import ModalGallery from './ModalGallery'

interface PlateCollectionProps {
  /** Anything you want to render inside the collection */
  children?: ReactElement<PlateCardProps>[]
  /** Optional helpers – keep the old props for backward compatibility */
  isFleet?: boolean
  modalIndex: number | null
  onModalClose?: () => void
}

export const PlateCollection = ({
  children,
  isFleet = false,
  modalIndex,
  onModalClose
}: PlateCollectionProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  //const [modalIndex, setModalIndex] = useState<number | null>(null)

  // If children is an array of plate cards, we can calculate paging
  const platesArray = Children.toArray(children).filter(
    (c) => isValidElement(c) && c.props?.card
  ) as ReactElement<PlateCardProps>[]

  const platesPerPage = isFleet ? MAX_FLEET_SIZE : 16
  const startIdx = (currentPage - 1) * platesPerPage
  const endIdx = startIdx + platesPerPage
  const currentPlates = platesArray.slice(startIdx, endIdx)

  const handleNext = () =>
    currentPage < Math.ceil(platesArray.length / platesPerPage) &&
    setCurrentPage((p) => p + 1)
  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1)

  return (
    <div className="flex size-full flex-col">
      <ScrollShadow hideScrollBar className="min-h-0 w-full grow" size={10}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 2xl:grid-cols-8">
          {currentPlates}
        </div>
      </ScrollShadow>
      <ModalGallery
        onClose={onModalClose}
        openIndex={modalIndex === null ? null : modalIndex % platesPerPage}
      >
        {currentPlates}
      </ModalGallery>

      {!isFleet && (
        <div className="mt-3 flex items-center justify-center gap-4">
          <Button onPress={handlePrev} disabled={currentPage === 1}>
            &larr;
          </Button>
          <span className="font-barlow text-xl text-white">
            Page {currentPage} of{' '}
            {Math.ceil(platesArray.length / platesPerPage)}
          </span>
          <Button onPress={handleNext} disabled={endIdx >= platesArray.length}>
            &rarr;
          </Button>
        </div>
      )}
    </div>
  )
}
