import React from 'react'
import PlateOff from './PlateOff'

function App() {
  return (
    <div className="flex h-screen w-screen flex-col bg-gradient-to-b from-bg-primary-1 to-bg-primary-2 p-0">
      <div style={{ textAlign: 'center' }}>
        <Header />
      </div>
      <div className="flex justify-center items-center">
        <h3 className="text-2xl font-bold text-center mb-8 text-white w-3/5">
          Welcome to the 2024 Jackbox Plate Zone Plate-Off! All you need to do is vote on your favorite plate, and we'll see who wins!
        </h3>
      </div>

      <PlateOff />
    </div>
  )
}

function Header() {
  return (
    <header className="text-6xl mt-4 mb-8 font-bold uppercase text-white">
      <h1>
        Muncher&apos;s Plate Zone Plate-Off!
      </h1>
    </header>
  )
}

export default App
