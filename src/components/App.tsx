import React from 'react'
import {Card, CardHeader, CardBody, Image} from '@nextui-org/react'

function App() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", gap: "80px", backgroundColor: "#9aa9dd" }}>
      <Card className="py-1 mr-7" isHoverable isPressable>
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
      <Card className="py-1 ml-7" isHoverable isPressable>
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
  );
}

export default App
