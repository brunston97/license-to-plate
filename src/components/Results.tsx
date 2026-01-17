import { Image } from '@heroui/react'

import { IPlateCard } from 'assets/types'
import axios from 'axios'
import { BUCKET_URL } from 'const/constants'
import { ReactElement, useEffect, useRef, useState } from 'react'
import PlateCard from './PlateCard'

export default function Results(): ReactElement {
  const [topTenPlates, setTopTenPlates] = useState<IPlateCard[]>([])
  const [currentPlate, setCurrentPlate] = useState<IPlateCard | null>(null)
  const [index, setIndex] = useState(0)

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
      setCurrentPlate(plates[0])
    }
    getPlates()
  }, [])

  useEffect(() => {
    window.onkeydown = (e) => {
      if (e.key === 'ArrowLeft' && modalRef.current) {
        const newIndex = index - 1
        if (newIndex > -1) {
          setCurrentPlate(topTenPlates[newIndex])
          setIndex(newIndex)
        }
      }
      if (e.key === 'ArrowRight' && modalRef.current) {
        const newIndex = index + 1
        if (newIndex < topTenPlates.length) {
          setCurrentPlate(topTenPlates[newIndex])
          setIndex(newIndex)
        }
      }
    }
  }, [index, topTenPlates])

  const modalRef = useRef<HTMLDialogElement>(null)

  return (
    <div className="z-0 grow overflow-y-auto p-4">
      <dialog id="my_modal_2" className="modal" ref={modalRef}>
        <div className="modal-box">
          {currentPlate && (
            <Image
              alt={`${currentPlate.correctedText}`}
              src={`${BUCKET_URL}/${currentPlate.fileName}`}
            />
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {topTenPlates.map((item) => (
          <PlateCard
            key={item.id}
            card={item}
            onPlateCardVote={() => {}}
            isLiked={item.isLiked ?? false}
            onLikeButtonClick={() => {}}
          ></PlateCard>
        ))}
      </div>
    </div>
  )
}
