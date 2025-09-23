import React, { useState, useEffect } from 'react'
import { IPlateCard } from 'assets/types'
import PlateCollection from '../components/PlateCollection'

const MyPlatesPage = () => {
  //const [likedPlates, setLikedPlates] = useState<IPlateCard[]>([])
  //const [allPlates, setAllPlates] = useState<IPlateCard[]>([])
  const [selectedPlates, setSelectedPlates] = useState<IPlateCard[]>([])
  const [cachedPlates, setCachedPlates] = useState<IPlateCard[]>(() => {
    const stored = localStorage.getItem('userPlates')
    return stored ? JSON.parse(stored) : []
  })

  function onCardClick(card: IPlateCard) {
    const alreadySelected = selectedPlates.some((p) => p.id === card.id)
    if (!alreadySelected) {
      setSelectedPlates([...selectedPlates, card])
    } else {
      setSelectedPlates(selectedPlates.filter((p) => p.id !== card.id))
    }
  }

  function onCardLike(clickedPlate: IPlateCard) {
    setCachedPlates((prev) => {
      const cachedPlate = prev.find((p) => p.id === clickedPlate.id)
      if (cachedPlate) {
        return prev.map((p) =>
          p.id === clickedPlate.id ? { ...p, isLiked: !p.isLiked } : p
        )
      } else {
        return [...prev, { ...clickedPlate, isLiked: true }]
      }
    })
  }

  useEffect(() => {
    localStorage.setItem('userPlates', JSON.stringify(cachedPlates))
  }, [cachedPlates])

  return (
    <div className="min-h-screen w-screen max-w-full bg-gradient-to-b from-bg-primary-1 to-bg-primary-2">
      <Header />
      <div className="ml-4 mr-1 mt-5">
        <div className="mb-6">
          <h2 className="mb-3 font-barlow text-xl font-bold uppercase text-white sm:text-2xl md:text-3xl">
            Liked Plates
          </h2>
          <PlateCollection
            plates={cachedPlates.filter((p) => p.isLiked)}
            selectedPlates={selectedPlates}
            onCardClick={onCardClick}
            onCardLike={onCardLike}
          />
        </div>
        <div className="mb-6">
          <h2 className="mb-3 font-barlow text-xl font-bold uppercase text-white sm:text-2xl md:text-3xl">
            All Plates
          </h2>
          <PlateCollection
            plates={cachedPlates}
            selectedPlates={selectedPlates}
            onCardClick={onCardClick}
            onCardLike={onCardLike}
          />
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
