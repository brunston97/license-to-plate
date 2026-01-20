import { IPlateCard } from 'assets/types'
import axios from 'axios'
import { ReactElement, useEffect, useState } from 'react'
import PlateCardGallery from './PlateCardGallery'
import { usePlateState } from 'hooks/usePlateState'

export default function Results(): ReactElement {
  const [topTenPlates, setTopTenPlates] = useState<IPlateCard[]>([])
  const { onCardLike } = usePlateState()

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
    }
    getPlates()
  }, [])

  return (
    <div className="z-0 grow overflow-y-auto p-4">
      <PlateCardGallery
        plates={topTenPlates}
        showCardLikes
        centerText={false}
        isZoomed
        onCardLike={onCardLike}
      ></PlateCardGallery>
    </div>
  )
}
