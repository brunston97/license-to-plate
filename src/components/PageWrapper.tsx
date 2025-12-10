import { useState, useEffect, useRef } from 'react'
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { useNavigate, Outlet } from 'react-router-dom'

export default function PageWrapper() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const navigate = useNavigate()
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)
  const audioRef = useRef<HTMLAudioElement>(null)

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
    <div className="relative min-h-screen bg-gray-900 text-white">
      <button
        className="absolute left-3 top-3 z-50 rounded bg-gray-800 p-2 hover:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        &#9776;
      </button>

      <div
        className={`fixed left-0 top-0 z-40 h-full w-64 bg-gray-800 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <h2 className="mb-6 mt-8 text-2xl font-bold">Menu</h2>
          <nav className="flex flex-col gap-4">
            <button
              onClick={() => {
                navigate('/')
                setIsOpen(false)
              }}
              className="text-left hover:text-yellow-400"
            >
              Plate Off
            </button>
            <button
              onClick={() => {
                navigate('/myPlates')
                setIsOpen(false)
              }}
              className="text-left hover:text-yellow-400"
            >
              My Plates
            </button>
          </nav>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

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

      <div>
        <Outlet context={{ windowWidth, isMuted }} />
      </div>
    </div>
  )
}
