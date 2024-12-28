import React from 'react'
import PlateOff from './PlateOff'

function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-b from-bg-primary-1 to-bg-primary-2 p-8">
      <div style={{textAlign: "center" }}>
        <Header/>
      </div>
      <PlateOff/>
    </div>
  );
}

function Header() {
  return (
    <header className="text-6xl text-white pt- uppercase font-bold">
      <h1 style={{ WebkitTextStroke: '1px black' }}>Muncher's Plate Zone Plate-Off!</h1>
    </header>
  );
}

export default App
