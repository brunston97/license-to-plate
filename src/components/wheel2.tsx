import { useEffect, useMemo, useState } from 'react'

function RotatingWheel() {
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [animationTime, setAnimationTime] = useState(5)
  const handleSpin = () => {
    if (!isSpinning) {
      setIsSpinning(true)
      const rotations = Math.floor(Math.random() * 12) + 7
      const rotationOffset = Math.floor(Math.random() * 360) + 1
      setRotation((r) => r + rotations * 360 + rotationOffset)
      return
    }
  }

  useEffect(() => {
    // Prevent spinning on component unmount
    if (isSpinning) {
      setTimeout(() => {
        //setRotation((r) => r % 360)
        setIsSpinning(false)
        const tempAnimationTime = Math.floor(Math.random() * 6) + 3
        setAnimationTime(tempAnimationTime)
      }, animationTime * 950)
    }

    return () => {
      //setIsSpinning(false)
    }
  }, [isSpinning, animationTime])

  const slots = 3
  const radius = 50
  const triangles = useMemo(() => {
    return (
      <TrianglePiece
        radius={radius}
        numPieces={slots}
        textRadiusMultiplier={0.65}
      />
    )
  }, [])

  return (
    <div className="wheel-container" style={{ perspective: '1000px' }}>
      <svg
        viewBox="0 0 100 100"
        width="300"
        height="300"
        style={{
          transition: `transform ${animationTime}s ease-out`,
          transform: `rotateZ(${rotation}deg)`
        }}
      >
        {/* Wheel outline */}
        <defs>
          <clipPath id="cut-off-bottom">
            <circle
              cx={radius}
              cy={radius}
              r={Math.ceil(radius)}
              stroke="#333"
              strokeWidth="1"
            />
          </clipPath>
        </defs>
        {triangles}
      </svg>

      <button onClick={handleSpin} disabled={isSpinning}>
        {isSpinning ? 'Spinning...' : 'SPIN'}
      </button>
    </div>
  )
}

interface TrianglePieceProps {
  numPieces: number
  radius?: number
  textRadiusMultiplier?: number
  keepTextHorizontal?: boolean
}

export const TrianglePiece: React.FC<TrianglePieceProps> = ({
  numPieces = 8,
  radius = 100, // Default radius of the circle
  textRadiusMultiplier = 0.5,
  keepTextHorizontal = true
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
        const multiplier = 2.1
        const x1 = center[0] + radius * Math.cos(angle) * multiplier
        const y1 = center[1] + radius * Math.sin(angle) * multiplier

        const thirdAngle = ((index + 1) % numPieces) * anglePerPiece
        const thirdEdge = `${
          center[0] + radius * Math.cos(thirdAngle) * multiplier
        },${center[1] + radius * Math.sin(thirdAngle) * multiplier}`

        const textAngle = angle + anglePerPiece / 2
        const textRadius = radius * textRadiusMultiplier // Adjust this value to position text
        const textX = center[0] + textRadius * Math.cos(textAngle)
        const textY = center[1] + textRadius * Math.sin(textAngle)

        const textRotation = keepTextHorizontal
          ? (textAngle * 180) / Math.PI + 90
          : (textAngle * 180) / Math.PI

        return (
          <g key={index}>
            <polygon
              points={`${x1},${y1} ${center.join(',')} ${thirdEdge}`}
              fill={generateRandomHexColor()}
              stroke="#000"
              strokeWidth="1"
              clipPath="url(#cut-off-bottom)"
              //mask="url(#myMask)"
            />
            <text
              x={textX}
              y={textY}
              fontSize={10}
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${textRotation}, ${textX}, ${textY})`}
            >
              Section {index + 1}
            </text>
          </g>
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
