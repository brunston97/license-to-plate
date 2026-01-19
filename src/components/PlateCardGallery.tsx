import { IPlateCard } from 'assets/types'
import { ReactElement, useRef } from 'react'
import PlateCard from './PlateCard'

export interface GalleryItem {
  id: number
  // Add other properties specific to your items
}

interface ModalGalleryProps {
  plates: IPlateCard[]
  onPlateCardClick?: (plate: IPlateCard) => void
  showLikes: boolean
  onLikeButtonClick?: (plate: IPlateCard) => void
  centerText?: boolean
  isZoomed?: boolean
}

export default function ModalGallery({
  plates,
  showLikes,
  onLikeButtonClick,
  centerText,
  isZoomed
}: ModalGalleryProps): ReactElement {
  const carouselRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDialogElement>(null)

  const goTo = (index: number) => {
    if (carouselRef.current) {
      const target = carouselRef.current.children[index] as HTMLDivElement
      if (target) {
        const left = target.offsetLeft
        carouselRef.current.scrollTo({
          left: left - carouselRef.current.clientWidth / 2,
          behavior: 'instant'
        })
      }
    }
  }

  const handleOpen = (index: number) => {
    goTo(index)
    console.log(index)
    modalRef.current?.showModal()
  }

  // Handle click on gallery item to open modal
  const handleItemClick = (index: number) => {
    handleOpen(index)
  }

  return (
    <div>
      {/* Gallery items that open the modal */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 2xl:grid-cols-8">
        {plates.map((card, index) => (
          <PlateCard
            key={card.id}
            card={card}
            isLiked={showLikes && card.isLiked}
            onPlateCardClick={() => handleItemClick(index)}
            isZoomed={isZoomed}
            centerText={centerText}
            onLikeButtonClick={onLikeButtonClick}
          />
        ))}
      </div>

      {/* Modal gallery */}
      {
        <dialog ref={modalRef} className="modal">
          <div className="modal-box w-full max-w-full rounded-none bg-transparent p-0 shadow-none sm:h-5/6 sm:max-h-[40rem] sm:w-auto">
            <div
              ref={carouselRef}
              className="carousel carousel-center max-h-full max-w-[100vw] space-x-4 p-4 sm:size-full"
            >
              {plates.map((card) => (
                <div
                  key={card.id}
                  className="carousel-item aspect-[3/4] size-auto max-h-full w-full max-w-full sm:w-auto"
                >
                  <PlateCard
                    key={card.id}
                    card={card}
                    isLiked={showLikes && card.isLiked}
                    centerText={centerText}
                    onLikeButtonClick={onLikeButtonClick}
                  />
                </div>
              ))}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      }
    </div>
  )
}
