import React from 'react'

const UnderConstructionPage = () => {
  return (
    <div className="min-h-screen w-screen max-w-full  bg-gradient-to-b from-bg-primary-1 to-bg-primary-2">
      <Header />
      <div className="mt-12 flex flex-col items-center justify-center text-center font-barlow text-xl text-white sm:text-2xl md:text-3xl">
        <span className="h-[20vh]"></span>
        <img src="beepbeep.png" className="mb-8 min-w-[10vw]"></img>
        <h3 className="mb-3 ">
          Our license plate scientists are hard at work putting together the
          2026 Plate Zone Plate Off!
        </h3>
        <h3>
          Check back here on January 1st, 2026 (🤞) to see all new plates and
          more!
        </h3>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="mb-8 text-center font-barlow text-3xl font-bold uppercase text-white md:text-6xl">
      <h1>Under Construction!</h1>
    </header>
  )
}

export default UnderConstructionPage
