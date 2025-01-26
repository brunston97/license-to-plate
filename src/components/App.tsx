import React, { useEffect, useRef, useState } from 'react'
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import PlateOff from './PlateOff'

function App() {
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(prevState => !prevState);
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-gradient-to-b from-bg-primary-1 to-bg-primary-2 p-0">
      <div style={{ textAlign: 'center' }}>
        <Header />
      </div>
      <div className="flex justify-center items-center">
        <h3 className="text-base md:text-2xl font-bold text-center mb-8 text-white w-3/5">
          Welcome to the 2024 Jackbox Plate Zone Plate-Off! All you need to do is vote on your favorite plate, and we'll see who wins!
        </h3>
      </div>
      <PlateOff isMuted={isMuted}/>

      <audio ref={audioRef} src="digit-funk.mp3" autoPlay loop/>
      
      <button
        onClick={toggleMute}
        className="absolute bottom-4 left-4 bg-transparent p-2 rounded-full hover:bg-gray-200"
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
    <header className="text-3xl md:text-6xl mt-4 mb-8 font-bold uppercase text-white">
      <h1>
        Muncher&apos;s Plate Zone Plate-Off!
      </h1>
    </header>
  )
}

export default App
