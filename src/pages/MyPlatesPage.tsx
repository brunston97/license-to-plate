import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { IPlateCard } from 'assets/types'
import PlateCollection from '../components/PlateCollection'
import { useOutletContext } from 'react-router-dom'

const MyPlatesPage = () => {
  // general page settings
  const [isCardSelectionEnabled] = useState(true)
  const [isAllPlatesEnabled] = useState(true)

  const { windowWidth } = useOutletContext<{ windowWidth: number }>()

  // user plate data
  const [selectedPlates, setSelectedPlates] = useState<Set<string>>(new Set())
  const [cachedPlates, setCachedPlates] = useState<IPlateCard[]>(() => {
    const stored = localStorage.getItem('userPlates')
    return stored ? JSON.parse(stored) : []
  })
  const likedPlates = useMemo(
    () => cachedPlates.filter((p) => p.isLiked),
    [cachedPlates]
  )

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fleetName, setFleetName] = useState('')

  function onCardClick(card: IPlateCard) {
    if (isCardSelectionEnabled) {
      setSelectedPlates((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(card.id)) {
          newSet.delete(card.id)
        } else {
          newSet.add(card.id)
        }
        return newSet
      })
    }
  }

  // defined in this component because there are two PlateCollections on this page 'Liked Plates' and 'All Plates'
  // when selected in one, I want it to be selected in the other.. so this parent component has to define what is and isn't selected
  const isPlateSelected = useCallback(
    (plateId: string) => selectedPlates.has(plateId),
    [selectedPlates]
  )

  const selectedPlateDetails = useMemo(
    () => cachedPlates.filter((plate) => isPlateSelected(plate.id)),
    [cachedPlates, isPlateSelected]
  )

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

  const handleMakeFleetClick = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFleetName('')
  }

  const handleSelectedPlatesReset = () => {
    setSelectedPlates(new Set<string>())
  }

  return (
    <div className="min-h-screen w-screen max-w-full bg-gradient-to-b from-bg-primary-1 to-bg-primary-2">
      <Header />
      <div className="mt-5">
        <div className="mb-8">
          <h2 className="mb-3 text-center font-barlow text-xl font-bold uppercase text-white sm:text-2xl md:text-3xl">
            Liked Plates
          </h2>
          <PlateCollection
            plates={likedPlates}
            windowWidth={windowWidth}
            isFleet={false}
            isPlateSelected={isPlateSelected}
            onCardClick={onCardClick}
            onCardLike={onCardLike}
          />
        </div>
        {isAllPlatesEnabled && (
          <>
            <div className="mb-8">
              <h2 className="mb-3 text-center font-barlow text-xl font-bold uppercase text-white sm:text-2xl md:text-3xl">
                All Plates
              </h2>
              <PlateCollection
                plates={cachedPlates}
                windowWidth={windowWidth}
                isFleet={false}
                isPlateSelected={isPlateSelected}
                onCardClick={onCardClick}
                onCardLike={onCardLike}
              />
            </div>
          </>
        )}
      </div>

      {isCardSelectionEnabled && selectedPlates.size > 0 && (
        <>
          <div className="fixed bottom-16 left-1/2 z-50 -translate-x-1/2 ">
            <button
              className="relative flex items-center justify-center rounded-full bg-green-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-green-700"
              onClick={handleMakeFleetClick}
            >
              <span className="mr-4">
                Make Your Fleet! ({`${selectedPlates.size}`})
              </span>
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelectedPlatesReset()
                }}
              >
                ✕
              </span>
            </button>
          </div>
        </>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal()
            }
          }}
        >
          <div className="rounded-lg bg-gradient-to-b from-bg-primary-1 to-bg-primary-2 p-6 shadow-lg">
            <div className="mb-4 flex flex-col items-center">
              <input
                type="text"
                className="mb-4 bg-transparent text-center text-3xl font-bold text-white placeholder:text-white focus:outline-none"
                value={fleetName}
                placeholder="Enter fleet name here..."
                onFocus={(e) => (e.target.placeholder = '')}
                onChange={(e) => setFleetName(e.target.value)}
              />
              <button
                className="absolute right-4 top-4 text-gray-300 hover:text-gray-100"
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>
            <div>
              <PlateCollection
                plates={selectedPlateDetails}
                windowWidth={windowWidth}
                isFleet={true}
                isPlateSelected={() => false}
                onCardClick={() => {}}
                onCardLike={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Header() {
  return (
    <header className="mb-8 text-center font-barlow text-3xl font-bold uppercase text-white md:text-6xl">
      <h1>My Plates</h1>
    </header>
  )
}

export default MyPlatesPage
