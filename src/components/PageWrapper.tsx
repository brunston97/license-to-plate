import { useState, useEffect, useRef } from 'react'
import { FaVolumeUp, FaVolumeMute, FaInfoCircle } from 'react-icons/fa'
import { Button } from '@nextui-org/react'
import { useNavigate, Outlet } from 'react-router-dom'

export default function PageWrapper() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)

  const audioRef = useRef<HTMLAudioElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

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
    <div className="relative h-screen w-screen bg-gray-900 text-white">
      <Button
        className="absolute left-3 top-3 z-50"
        onPress={() => setIsOpen(!isOpen)}
        isIconOnly
        variant="flat"
        color="primary"
      >
        &#9776;
      </Button>

      <NavLinks
        setIsOpen={() => setIsOpen((isOpen) => !isOpen)}
        isOpen={isOpen}
      ></NavLinks>

      <FaInfoCircle
        color="white"
        onClick={() => dialogRef.current?.showModal()}
        className="absolute right-3 top-4 z-50 size-5 rounded-full bg-transparent hover:bg-gray-200 sm:size-6"
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

interface NavProps {
  setIsOpen: (isOpen: boolean) => void
  isOpen: boolean
}

function NavLinks(props: NavProps) {
  const { isOpen, setIsOpen } = props
  const navigate = useNavigate()
  return (
    <>
      <div
        className={`fixed left-0 top-0 z-40 h-full w-64 bg-gray-800 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <h2 className="mb-6 mt-8 text-2xl font-bold">Menu</h2>
          <nav className="flex flex-col gap-4">
            <Button
              onPress={() => {
                navigate('/')
                setIsOpen(false)
              }}
            >
              Plate Off
            </Button>
            <Button
              onPress={() => {
                navigate('/myPlates')
                setIsOpen(false)
              }}
            >
              My Plates
            </Button>
            {import.meta.env.DEV && (
              <Button
                onPress={() => {
                  navigate('/label')
                  setIsOpen(false)
                }}
              >
                Label
              </Button>
            )}
            {import.meta.env.DEV && (
              <Button
                onPress={() => {
                  navigate('/results')
                  setIsOpen(false)
                }}
              >
                Results
              </Button>
            )}
          </nav>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
