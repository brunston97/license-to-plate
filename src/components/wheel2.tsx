import { useEffect, useMemo, useState } from 'react'

function RotatingWheel() {
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const handleSpin = () => {
    if (!isSpinning) {
      setIsSpinning(true)
      const rotations = Math.floor(Math.random() * 10) + 2
      const rotationOffset = Math.floor(Math.random() * 360) + 1
      setRotation((r) => r + rotations * 360 + rotationOffset)
      setTimeout(() => {
        //setRotation((r) => r % 360)
        setIsSpinning(false)
      }, 5000)
      return
      //const zero = document.timeline.currentTime

      let currentRotation = rotation
      const animate = () => {
        currentRotation += 1
        //setTimeout(() => {
        setRotation(currentRotation)

        // Stop the animation after one full rotation
        if (currentRotation >= 360) {
          setIsSpinning(false)
          setRotation(0)
          return
        }
        requestAnimationFrame(animate)
        //}, 100)
      }

      requestAnimationFrame(animate)
    }
  }

  useEffect(() => {
    // Prevent spinning on component unmount
    return () => {
      //setIsSpinning(false)
    }
  }, [isSpinning])

  const slots = 3
  const radius = 100
  const triangles = useMemo(() => {
    return <TrianglePiece radius={radius} numPieces={slots} />
  }, [])

  return (
    <div className="wheel-container" style={{ perspective: '1000px' }}>
      <svg
        viewBox="0 0 200 200"
        width="400"
        height="400"
        style={{
          transition: `transform 5s ease-in-out`,
          transform: `rotateZ(${rotation}deg)`
        }}
      >
        {/* Wheel outline */}
        <defs>
          <clipPath id="cut-off-bottom">
            <circle
              cx={radius}
              cy={radius}
              r={Math.ceil(radius / 2) - 1}
              stroke="#333"
              strokeWidth="4"
            />
          </clipPath>
        </defs>

        {/* <circle
          cx={100}
          cy={100}
          r={90}
          fill="blue"
          stroke="#333"
          strokeWidth="4"
          clipPath="url(#cut-off-bottom)"
        ></circle> */}
        {triangles}
        {/* Spokes */}
        {/* {[...Array(slots)].map((_, index) => {
          const angle = (index * (360 / slots) * Math.PI) / 180
          return (
            <line
              key={index}
              x1={100 + Math.cos(angle) * 90}
              y1={100 + Math.sin(angle) * 90}
              x2={100}
              y2={100}
              stroke="#333"
              strokeWidth="2"
            />
          )
        })} */}
      </svg>

      {/* Center pointer
      <line x1={85} y1={100} x2={115} y2={100} stroke="#666" strokeWidth="4" />
      <line x1={100} y1={85} x2={100} y2={115} stroke="#666" strokeWidth="4" /> */}

      <button onClick={handleSpin} disabled={isSpinning}>
        {isSpinning ? 'Spinning...' : 'SPIN'}
      </button>
    </div>
  )
}

interface TrianglePieceProps {
  numPieces: number
  radius?: number
}

export const TrianglePiece: React.FC<TrianglePieceProps> = ({
  numPieces = 8,
  radius = 100 // Default radius of the circle
}) => {
  const center = [radius, radius]
  const anglePerPiece = (2 * Math.PI) / numPieces // Calculate in radians

  return (
    <svg
      viewBox={`0 0 ${2 * radius} ${2 * radius}`}
      width="100%"
      height="100%"
      //transform="translateX(-50%)"
    >
      {[...Array(numPieces)].map((_, index) => {
        const angle = index * anglePerPiece
        const x1 = center[0] + radius * Math.cos(angle)
        const y1 = center[1] + radius * Math.sin(angle)

        const thirdAngle = ((index + 1) % numPieces) * anglePerPiece
        const thirdEdge = `${center[0] + radius * Math.cos(thirdAngle)},${
          center[1] + radius * Math.sin(thirdAngle)
        }`

        return (
          <polygon
            key={index}
            points={`${x1},${y1} ${center.join(',')} ${thirdEdge}`}
            fill={generateRandomHexColor()}
            stroke="#000"
            strokeWidth="2"
            clipPath="url(#cut-off-bottom)"
            //mask="url(#myMask)"
          />
        )
      })}
    </svg>
  )
}

function generateRandomHexColor() {
  const red = Math.floor(Math.random() * 256).toString(16)
  const green = Math.floor(Math.random() * 256).toString(16)
  const blue = Math.floor(Math.random() * 256).toString(16)

  return `#${red.toString() + green.toString() + blue.toString()}`
}

export default RotatingWheel
