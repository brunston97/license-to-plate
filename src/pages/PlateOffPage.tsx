import React, { useEffect, useRef, useState } from 'react'
import { FaInfoCircle } from 'react-icons/fa'
import { GiCardExchange } from 'react-icons/gi'
import PlateOff from 'components/PlateOff'
import { MOBILE_WIDTH_CUTOFF } from 'const/constants'
import PlateCardTable from 'components/Results'
import { useOutletContext } from 'react-router-dom'

function PlateOffPage() {
  const { windowWidth, isMuted } = useOutletContext<{
    windowWidth: number
    isMuted: boolean
  }>()
  const [isManualSideBySideView, setIsManualSideBySideView] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (document.location.pathname == '/results') {
      setShowResults(true)
    }
  }, [])

  const toggleView = () => {
    setIsManualSideBySideView((prevState) => !prevState)
  }

  return (
    <div className="relative flex max-h-screen min-h-screen w-screen max-w-full flex-col bg-gradient-to-b from-bg-primary-1 to-bg-primary-2 p-0 sm:justify-between">
      <div className="flex flex-col items-center justify-start">
        <div className="text-center">
          <Header />
        </div>
        <FaInfoCircle
          color="white"
          onClick={() => dialogRef.current?.showModal()}
          className="absolute right-3 top-3 size-3 rounded-full bg-transparent hover:bg-gray-200 sm:size-5"
        >
          <span className="text-xl font-bold">i</span>
        </FaInfoCircle>
        <dialog
          ref={dialogRef}
          id="my_modal_5"
          className="modal modal-bottom sm:modal-middle"
        >
          <div className="modal-box">
            <div className="flex w-full flex-col items-center justify-center">
              <h3 className="mb-4 w-full text-center text-base font-bold text-black dark:text-white md:w-4/5 md:text-xl">
                Welcome to the 2024 Jackbox Plate Zone Plate-Off!
              </h3>
              <h3 className="w-full text-center text-base text-black dark:text-white md:w-4/5 md:text-xl">
                All you need to do is vote on your favorite license plate from
                each random pair that you&apos;re shown - we&apos;ll tally the
                votes for each plate, and announce the winners on March 2
                <sup>nd</sup>!
                <br />
                <br />
                If you see a funny combination of plates, don&apos;t forget to
                take a screenshot and post it in the Plate Zone!
              </h3>
            </div>
            <div className="modal-action flex justify-center">
              <form method="dialog" className="w-fit">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
      {showResults ? (
        <PlateCardTable />
      ) : (
        <PlateOff
          isMuted={isMuted}
          windowWidth={windowWidth}
          isManualSideBySideView={isManualSideBySideView}
        />
      )}

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
    <header className="py-0 font-barlow text-3xl font-bold uppercase text-white md:text-6xl">
      <h1>Plate Zone Plate-Off!</h1>
    </header>
  )
}

export default PlateOffPage
