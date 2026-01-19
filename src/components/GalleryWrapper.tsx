import { ReactElement, useRef } from 'react'

interface GalleryItem {
  id: string
  // Add other properties specific to your items
}

interface ModalGalleryProps {
  items: GalleryItem[]
  renderItem: (item: GalleryItem) => ReactElement
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
}

export default function ModalGallery({
  items,
  renderItem,
  isOpen,
  onClose
  //initialIndex = 0
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

  // Handle modal close
  const handleClose = () => {
    onClose()
  }

  // Handle click on gallery item to open modal
  const handleItemClick = (index: number) => {
    handleOpen(index)
  }

  return (
    <div>
      {/* Gallery items that open the modal */}
      <div>
        {items.map((item, index) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(index)}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4 2xl:grid-cols-8"
          >
            {renderItem(item)}
          </div>
        ))}
      </div>

      {/* Modal gallery */}
      {isOpen && (
        <dialog ref={modalRef} className="modal" onClose={handleClose}>
          <div className="modal-box w-full max-w-full rounded-none bg-transparent p-0 shadow-none sm:h-5/6 sm:max-h-[40rem] sm:w-auto">
            <div
              ref={carouselRef}
              className="carousel carousel-center max-h-full max-w-[100vw] space-x-4 p-4 sm:size-full"
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className="carousel-item aspect-[3/4] size-auto max-h-full w-full max-w-full sm:w-auto"
                >
                  {renderItem(item)}
                </div>
              ))}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  )
}
