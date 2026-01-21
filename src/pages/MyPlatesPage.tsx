import { useMemo, useState } from 'react'
import { Tab, Tabs } from '@heroui/react'
import { usePlateState } from 'hooks/usePlateState'
import PlateCard from 'components/PlateCard'
import { PlateCollection } from 'components/PlateCollection'

const MyPlatesPage = () => {
  // general page settings
  const { plates, likedPlateIds, onCardLike } = usePlateState()
  const [modalIndex, setModalIndex] = useState<number | null>(null)

  const allPlates = useMemo(() => {
    return [...plates].sort(
      (a, b) => a.correctedText?.localeCompare(b.correctedText)
    )
  }, [plates])

  const likedPlates = useMemo(
    () => allPlates.filter((p) => likedPlateIds.has(p.id)),
    [allPlates, likedPlateIds]
  )

  return (
    <div className="flex min-h-0 grow flex-col items-center">
      <Tabs aria-label="Options" className="mt-2 shrink">
        <Tab
          key="liked"
          title="Liked Plates"
          titleValue="Liked Plates"
          className="min-h-0 w-full grow !p-2"
        >
          {likedPlates.length > 0 ? (
            <PlateCollection
              modalIndex={modalIndex}
              isFleet={false}
              onModalClose={() => setModalIndex(null)}
            >
              {likedPlates.map((card, index) => {
                return (
                  <PlateCard
                    key={card.id}
                    card={card}
                    onPlateCardClick={() => {
                      setModalIndex(index)
                    }}
                    showLikeButton
                    onCardLike={onCardLike}
                    isZoomed
                  ></PlateCard>
                )
              })}
            </PlateCollection>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-lg text-white">
                Start liking plates to build your collection!
              </p>
            </div>
          )}
        </Tab>
        <Tab
          key="all"
          title="All Plates"
          titleValue="All Plates"
          className="min-h-0 w-full grow !p-2"
        >
          {allPlates.length > 0 ? (
            <PlateCollection
              modalIndex={modalIndex}
              onModalClose={() => setModalIndex(null)}
            >
              {allPlates.map((card, index) => {
                return (
                  <PlateCard
                    key={card.id}
                    card={card}
                    onPlateCardClick={() => {
                      setModalIndex(index)
                    }}
                    showLikeButton
                    onCardLike={onCardLike}
                    isZoomed
                  ></PlateCard>
                )
              })}
            </PlateCollection>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-lg text-white">
                When you vote on a pair of plates, both plates will show up here
                for future reference. Can you collect them all??
              </p>
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  )
}

export default MyPlatesPage
