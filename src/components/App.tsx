function App() {
  return (
    <div className="relative flex max-h-screen min-h-screen w-screen max-w-full flex-col bg-gradient-to-b from-bg-primary-1 to-bg-primary-2 p-0">
      <div className="text-center">
        <Header />
      </div>
      <div className="mx-5 mt-20 flex flex-col items-center justify-center text-center font-barlow text-xl text-white sm:text-3xl">
        <h2>
          The voting period for the 2024 Plate Zone Plate-Off has officially
          closed!
          <br />
          <br />
          Our vote counters will be working around the clock to tally the
          results
          <br />
          <br />
          The top 10 plates will be announced today, March 3rd 2025 - so stay
          tuned!
        </h2>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="py-0 font-barlow text-3xl font-bold uppercase text-white md:text-6xl">
      <h1>Plate Zone Plate-Off!</h1>
    </header>
  )
}

export default App
