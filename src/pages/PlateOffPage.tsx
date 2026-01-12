import React, { useState } from 'react'
import { GiCardExchange } from 'react-icons/gi'
import PlateOff from 'components/PlateOff'
import { MOBILE_WIDTH_CUTOFF } from 'const/constants'
import { useOutletContext } from 'react-router-dom'

function PlateOffPage() {
  const { windowWidth, isMuted } = useOutletContext<{
    windowWidth: number
    isMuted: boolean
  }>()
  const [isManualSideBySideView, setIsManualSideBySideView] = useState(false)

  const toggleView = () => {
    setIsManualSideBySideView((prevState) => !prevState)
  }

  return (
    <div className="flex size-full flex-col items-center justify-center overflow-hidden">
      <Header />
      <PlateOff
        isMuted={isMuted}
        windowWidth={windowWidth}
        isManualSideBySideView={isManualSideBySideView}
      />

      {windowWidth <= MOBILE_WIDTH_CUTOFF && (
        <button
          onClick={toggleView}
          className="fixed bottom-4 right-4 rounded-full bg-transparent p-2 hover:bg-gray-200"
          title={
            isManualSideBySideView
              ? 'Switch to Image View'
              : 'Switch to Side-By-Side View'
          }
        >
          <GiCardExchange
            size={32}
            color={isManualSideBySideView ? 'white' : 'gray'}
          />
        </button>
      )}
    </div>
  )
}

function Header() {
  return (
    <header className="py-0 text-center font-barlow text-3xl font-bold uppercase text-white md:text-6xl">
      <h1>Plate Zone Plate-Off!</h1>
    </header>
  )
}

export default PlateOffPage
