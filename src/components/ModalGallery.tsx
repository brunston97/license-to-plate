import {
  Children,
  isValidElement,
  ReactElement,
  useEffect,
  useRef
} from 'react'
import { PlateCardProps } from './PlateCard'

interface ModalGalleryProps {
  children?: ReactElement<PlateCardProps>[]
  openIndex: number | null
  onClose?: () => void
  // renderGalleryCard: (plate: IPlateCard) => ReactElement
  //renderFullScreenCard: (plate: IPlateCard) => ReactElement
}

export default function ModalGallery({
  children,
  openIndex,
  onClose
}: ModalGalleryProps): ReactElement {
  const carouselRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDialogElement>(null)
  //const [openIndex, setOpenIndex] = useState<number | null>(null)

  const platesArray = Children.toArray(children).filter(
    (c) => isValidElement(c) && c.props?.card
  ) as ReactElement<PlateCardProps>[]

  // useEffect(() => {
  //   if (openIndex !== null && modalRef.current) {
  //     modalRef.current.showModal()
  //   }
  // }, [openIndex])

  useEffect(() => {
    if (openIndex !== null) {
      modalRef.current?.showModal()
      goTo(openIndex)
    } else {
      modalRef.current?.close()
    }
  }, [openIndex, platesArray])

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

  return (
    <dialog
      id="my_modal_2"
      ref={modalRef}
      className="modal h-svh"
      onClose={onClose}
    >
      <div className="modal-box max-h-full w-full max-w-full rounded-none bg-transparent p-0 shadow-none sm:h-5/6 sm:max-h-[512px] sm:w-auto">
        <div
          ref={carouselRef}
          className="carousel carousel-center h-fit w-auto max-w-[100vw] space-x-4 px-4 sm:size-full"
        >
          {platesArray.map((plateCardComponent) => {
            return (
              <div
                key={plateCardComponent.props.card.id}
                className="carousel-item aspect-[3/4] size-auto max-h-[512px] max-w-full sm:w-auto"
              >
                {plateCardComponent}
              </div>
            )
          })}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  )
}
