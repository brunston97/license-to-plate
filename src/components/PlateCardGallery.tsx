import { IPlateCard } from 'assets/types'
import { ReactElement, useRef } from 'react'
import PlateCard from './PlateCard'

interface ModalGalleryProps {
  plates: IPlateCard[]
  onPlateCardClick?: (plate: IPlateCard) => void
  showCardLikes: boolean
  centerText?: boolean
  isZoomed?: boolean
  onCardLike?: (card: IPlateCard) => void
}

export default function ModalGallery({
  plates,
  showCardLikes,
  centerText,
  isZoomed,
  onCardLike
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
            onPlateCardClick={() => handleItemClick(index)}
            isZoomed={isZoomed}
            centerText={centerText}
            onCardLike={onCardLike}
            showLikeButton={showCardLikes}
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
                    //isLiked={showCardLikes && card.isLiked}
                    centerText={true}
                    showLikeButton={showCardLikes}
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
