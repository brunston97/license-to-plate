import React from 'react'
import {Card, CardHeader, CardBody, Image} from '@nextui-org/react'

const randoms = [
  [1, 2],
  [3, 4, 5],
  [6, 7]
]

function App() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Card className="py-4">
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <p className="text-tiny uppercase font-bold">Plate 1</p>
          <small className="text-default-500">By garlicgirl</small>
          <h4 className="font-bold text-large">FSU FSU</h4>
        </CardHeader>
        <CardBody className="overflow-visible py-2">
          <Image
            alt="Card background"
            className="object-cover rounded-xl"
            src="src/assets/this.jpg"
            width={270}
          />
        </CardBody>
      </Card>
    </div>
  );
}

export default App
