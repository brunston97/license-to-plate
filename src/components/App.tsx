import React, { useEffect, useRef, useState } from 'react'
import { FaVolumeUp, FaVolumeMute, FaInfoCircle } from 'react-icons/fa'
import PlateOff from './PlateOff'
import { Button } from '@nextui-org/react'

function App() {
  const [isMuted, setIsMuted] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  // for only starting audio once user interacts with page
  // to avoid browser autoplay restriction issues
  useEffect(() => {
    const handleUserInteraction = () => {
      if (audioRef.current) {
        audioRef.current.play()
      }
      document.removeEventListener('click', handleUserInteraction)
    }

    document.addEventListener('click', handleUserInteraction)

    return () => {
      document.removeEventListener('click', handleUserInteraction)
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
  }, [isMuted])

  const toggleMute = () => {
    setIsMuted((prevState) => !prevState)
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-gradient-to-b from-bg-primary-1 to-bg-primary-2 p-0 sm:justify-between">
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
            <div className="flex items-center justify-center">
              <h3 className="w-full text-center text-base font-bold text-white md:w-4/5 md:text-2xl">
                Welcome to the 2024 Jackbox Plate Zone Plate-Off! <br /> All you
                need to do is vote on your favorite plate, and we&apos;ll see
                who wins!
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

      <PlateOff isMuted={isMuted} />

      <audio ref={audioRef} src="digit-funk.mp3" autoPlay loop />

      <button
        onClick={toggleMute}
        className="absolute bottom-4 left-4 rounded-full bg-transparent p-2 hover:bg-gray-200"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <FaVolumeMute size={32} color="gray" />
        ) : (
          <FaVolumeUp size={32} color="black" />
        )}
      </button>
    </div>
  )
}

function Header() {
  return (
    <header className="font-barlow py-0 text-3xl font-bold uppercase text-white md:text-6xl">
      <h1>Muncher&apos;s Plate Zone Plate-Off!</h1>
    </header>
  )
}

export default App
