import { useState, useRef } from 'react'
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { Button } from '@heroui/react'

export default function PageWrapper() {
  const [isMuted, setIsMuted] = useState<boolean>(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const toggleMute = () => {
    if (audioRef.current) {
      if (audioRef.current.played) {
        audioRef.current.play()
      }
      audioRef.current.muted = !audioRef.current.muted // Toggle the actual audio element property
      setIsMuted(audioRef.current.muted) // Update React state to reflect the change
    }
  }

  return (
    <div className="relative flex h-dvh w-full flex-col bg-gradient-to-b from-bg-primary-1 to-bg-primary-2 text-white">
      <Navbar />
      <audio ref={audioRef} src="digit-funk.mp3" autoPlay loop muted />

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
      <Outlet context={{ isMuted }} />
      {/* </div> */}
    </div>
  )
}
