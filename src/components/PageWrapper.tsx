import { useState, useEffect, useRef } from 'react'
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { Button } from '@heroui/react'

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
    <div className="relative flex h-dvh w-full flex-col bg-gradient-to-b from-bg-primary-1 to-bg-primary-2 text-white">
      <Navbar />
      <audio ref={audioRef} src="digit-funk.mp3" autoPlay loop />

      <Button
        onPress={() => {
          window.gtag &&
            window.gtag('event', 'select_content', {
              content_type: 'mute_toggle',
              content_id: isMuted
            })
          toggleMute()
        }}
        isIconOnly
        variant="light"
        color="default"
        radius="full"
        title={isMuted ? 'Unmute' : 'Mute'}
        className="fixed bottom-2 left-2 z-30"
      >
        {isMuted ? (
          <FaVolumeMute size={32} color="gray" />
        ) : (
          <FaVolumeUp size={32} color="white" />
        )}
      </Button>
      {/* <div className="flex min-h-0 grow flex-col"> */}
      <Outlet context={{ windowWidth, isMuted }} />
      {/* </div> */}
    </div>
  )
}
