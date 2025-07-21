import React, { useState, useEffect } from 'react'
import { IPlateCard } from 'assets/types'
import PlateCard from './PlateCard'

const MyPlatesPage = () => {
  const [likedPlates, setLikedPlates] = useState<IPlateCard[]>([])
  const [allPlates, setAllPlates] = useState<IPlateCard[]>([])
  const [selectedPlates, setSelectedPlates] = useState<IPlateCard[]>([])

  function setMockPlatesData() {
    const mockLikedPlates: IPlateCard[] = [
      { id: '129', title: 'AGENT DB' },
      { id: '265', title: 'I BEEST' },
      { id: '292', title: 'GRR WUF' }
    ]
    const mockAllPlates: IPlateCard[] = [
      { id: '230', title: 'HVAC LIF' },
      { id: '128', title: 'CLOSR' },
      { id: '77', title: 'N2MYCRVF' },
      { id: '129', title: 'AGENT DB' },
      { id: '265', title: 'I BEEST' },
      { id: '40', title: 'LEE ANNE' },
      { id: '120', title: '5TEELER5' },
      { id: '292', title: 'GRR WUF' }
    ]

    setLikedPlates(
      mockLikedPlates.sort((a, b) => a.title.localeCompare(b.title))
    )
    setAllPlates(mockAllPlates.sort((a, b) => a.title.localeCompare(b.title)))
  }

  function onCardClick(card: IPlateCard) {
    const alreadySelected = selectedPlates.some((p) => p.id === card.id)
    if (!alreadySelected) {
      setSelectedPlates([...selectedPlates, card])
    } else {
      setSelectedPlates(selectedPlates.filter((p) => p.id !== card.id))
    }
  }

  useEffect(() => {
    setMockPlatesData()
  }, [])

  return (
    <div className="min-h-screen w-screen max-w-full bg-gradient-to-b from-bg-primary-1 to-bg-primary-2">
      <Header />
      <div id="allRows" className="ml-4 mr-1 mt-5">
        <div id="likedPlatesRow" className="mb-6">
          <h2 className="mb-3 font-barlow text-xl font-bold uppercase text-white sm:text-2xl md:text-3xl">
            Liked Plates
          </h2>
          <div id="likedPlates" className="flex flex-wrap justify-start gap-4">
            {likedPlates.map((lp) => {
              const isSelected = selectedPlates.some((p) => p.id === lp.id)
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
                    windowWidth={750}
                  />
                </div>
              )
            })}
          </div>
        </div>
        <div id="allPlatesRow" className="flex flex-col justify-around">
          <h2 className="mb-3 font-barlow text-xl font-bold uppercase text-white sm:text-2xl md:text-3xl">
            All Plates
          </h2>
          <div id="allPlates" className="flex flex-row flex-wrap gap-4">
            {allPlates.map((ap) => {
              const isSelected = selectedPlates.some((p) => p.id === ap.id)
              return (
                <div key={ap.id}>
                  <PlateCard
                    className={`max-w-[150px] sm:max-w-[240px] ${
                      isSelected
                        ? 'border-4 border-green-500'
                        : 'border-transparent'
                    }`}
                    card={ap}
                    onPlateCardVote={onCardClick}
                    windowWidth={750}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {selectedPlates.length > 0 && (
        <>
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
            <button className="rounded-full bg-green-600 px-6 py-2 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-green-700">
              Make Your Fleet! ({`${selectedPlates.length}`})
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function Header() {
  return (
    <header className="text-center font-barlow text-3xl font-bold uppercase text-white md:text-6xl">
      <h1>My Plates</h1>
    </header>
  )
}

export default MyPlatesPage
