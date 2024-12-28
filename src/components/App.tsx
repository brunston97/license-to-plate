import React from 'react'
import PlateOff from './PlateOff'

function App() {
  return (
    <div className="flex h-screen w-screen flex-col bg-gradient-to-b from-bg-primary-1 to-bg-primary-2 p-0">
      <div style={{ textAlign: 'center' }}>
        <Header />
      </div>
      <PlateOff />
    </div>
  )
}

function Header() {
  return (
    <header className="text-6xl font-bold uppercase text-white">
      <h1 style={{ WebkitTextStroke: '1px black' }}>
        Muncher&apos;s Plate Zone Plate-Off!
      </h1>
    </header>
  )
}

export default App
