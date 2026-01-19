import { IPlateCard } from 'assets/types'
import axios from 'axios'
import { ReactElement, useEffect, useRef, useState } from 'react'
import PlateCard from './PlateCard'

export default function Results(): ReactElement {
  const [topTenPlates, setTopTenPlates] = useState<IPlateCard[]>([])
  //const [currentPlate, setCurrentPlate] = useState<IPlateCard | null>(null)
  //const [index, setIndex] = useState(0)

  useEffect(() => {
    async function getPlates() {
      const { data } = await axios.get('/vote/results')
      const plates = (data as IPlateCard[]).sort((a, b) => {
        // Define your ranking logic here, e.g., by a 'score' property
        const scoreA = a.voteCount || 0
        const scoreB = b.voteCount || 0
        return scoreB - scoreA // Sort in descending order of score
      })
      setTopTenPlates(plates)
      //setCurrentPlate(plates[0])
    }
    getPlates()
  }, [])

  // useEffect(() => {
  //   window.onkeydown = (e) => {
  //     if (e.key === 'ArrowLeft' && modalRef.current) {
  //       const newIndex = index - 1
  //       if (newIndex > -1) {
  //         setCurrentPlate(topTenPlates[newIndex])
  //         setIndex(newIndex)
  //       }
  //     }
  //     if (e.key === 'ArrowRight' && modalRef.current) {
  //       const newIndex = index + 1
  //       if (newIndex < topTenPlates.length) {
  //         setCurrentPlate(topTenPlates[newIndex])
  //         setIndex(newIndex)
  //       }
  //     }
  //   }
  // }, [index, topTenPlates])

  const modalRef = useRef<HTMLDialogElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  function goTo(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    event.preventDefault()
    const btn = event.currentTarget
    const carousel = carouselRef.current
    if (carousel) {
      const href = btn.getAttribute('href')!
      const target = carousel.querySelector<HTMLDivElement>(href)!
      const left = target.offsetLeft
      carousel.scrollTo({
        left: left - carousel.clientWidth / 2,
        behavior: 'instant'
      })
      modalRef.current && modalRef.current.showModal()
    }
  }

  return (
    <div className="z-0 grow overflow-y-auto p-4">
      <dialog id="my_modal_2" className="modal" ref={modalRef}>
        <div className="modal-box w-full max-w-full rounded-none bg-transparent p-0 shadow-none sm:h-full sm:w-auto">
          <div
            ref={carouselRef}
            className="carousel carousel-center max-h-full max-w-[100vw] space-x-4 p-4 sm:size-full"
          >
            {topTenPlates.map((plate, index) => {
              return (
                <div
                  id={`plate${index}`}
                  className="carousel-item aspect-[3/4] size-auto max-h-full w-full max-w-full sm:w-auto"
                  key={plate.id}
                >
                  <PlateCard card={plate} isLiked={plate.isLiked} centerText />
                </div>
              )
            })}
          </div>{' '}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {topTenPlates.map((item, index) => (
          <a key={item.id} href={`#plate${index}`} onClick={goTo}>
            <PlateCard
              key={item.id}
              card={item}
              isLiked={item.isLiked ?? false}
            ></PlateCard>
          </a>
        ))}
      </div>
    </div>
  )
}
