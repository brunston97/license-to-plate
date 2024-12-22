import React from 'react'
import {Card, CardHeader, CardBody, Image} from '@nextui-org/react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary-1 to-bg-primary-2 p-8">
      <div style={{textAlign: "center" }}>
        <Header/>
      </div>
      <div className="flex lg:gap-20 md:gap-5 sm:gap-5" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "75vh"}}>
        <Card className="py-1 ml-3 mr-2" isHoverable isPressable>
          <CardHeader className="pb-1 pt-2 px-4 flex-col items-center">
            <p className="text-large uppercase font-bold">FSU FSU</p>
            <small className="text-default-500">By garlicgirl</small>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <Image
              alt="Card background"
              className="object-cover rounded-xl"
              src="src/assets/this.jpg"
              width={400}
            />
          </CardBody>
        </Card>
        <Card className="py-1 mr-3 ml-2" isHoverable isPressable>
          <CardHeader className="pb-1 pt-2 px-4 flex-col items-center">
            <p className="text-large uppercase font-bold">HOT BOY</p>
            <small className="text-default-500">By frogspotting</small>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <Image
              alt="Card background"
              className="object-cover rounded-xl"
              src="src/assets/that.jpg"
              width={400}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="text-6xl text-white pt-20 uppercase font-bold">
      <h1 style={{ WebkitTextStroke: '2px black' }}>Muncher's Plate Zone Plate-Off!</h1>
    </header>
  );
}

export default App
