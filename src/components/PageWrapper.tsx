import { useState, useEffect, useRef } from 'react'
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function PageWrapper() {
  const [isMuted, setIsMuted] = useState(true)
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)

  const audioRef = useRef<HTMLAudioElement>(null)
  //const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth)
    }

    // for only starting audio once user interacts with page
    // to avoid browser autoplay restriction issues
    function handleUserInteraction() {
      if (audioRef.current) {
        audioRef.current.play()
      }
      document.removeEventListener('click', handleUserInteraction)
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('click', handleUserInteraction)
    return () => {
      window.removeEventListener('resize', handleResize)
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
    <div className="relative flex h-screen w-screen flex-col bg-gray-900 text-white">
      <Navbar />
      <audio ref={audioRef} src="digit-funk.mp3" autoPlay loop />

      <button
        onClick={toggleMute}
        className="fixed bottom-4 left-4 z-50 rounded-full bg-transparent p-2 hover:bg-gray-200"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <FaVolumeMute size={32} color="gray" />
        ) : (
          <FaVolumeUp size={32} color="white" />
        )}
      </button>

      <Outlet context={{ windowWidth, isMuted }} />
    </div>
  )
}
