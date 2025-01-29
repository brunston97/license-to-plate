import { useEffect, useMemo, useState, useCallback } from 'react'

interface WheelConfig {
  minRotations: number
  maxRotations: number
  baseAnimationTime: number
  maxAnimationTime: number
  slots: number
  radius: number
}

function RotatingWheel() {
  // Configuration object for wheel settings
  const wheelConfig = useMemo<WheelConfig>(
    () => ({
      minRotations: 7,
      maxRotations: 12,
      baseAnimationTime: 3,
      maxAnimationTime: 6,
      slots: 3,
      radius: 50
    }),
    []
  )

  // State management
  const [wheelState, setWheelState] = useState({
    rotation: 0,
    isSpinning: false,
    animationTime: 5
  })

  // Memoized calculation of new rotation
  const calculateNewRotation = useCallback(
    (currentRotation: number) => {
      const rotations =
        Math.floor(Math.random() * wheelConfig.maxRotations) +
        wheelConfig.minRotations
      const rotationOffset = Math.floor(Math.random() * 360) + 1
      return currentRotation + rotations * 360 + rotationOffset
    },
    [wheelConfig.maxRotations, wheelConfig.minRotations]
  )

  // Handle spin action
  const handleSpin = useCallback(() => {
    if (!wheelState.isSpinning) {
      setWheelState((prevState) => ({
        ...prevState,
        isSpinning: true,
        rotation: calculateNewRotation(prevState.rotation)
      }))
    }
  }, [wheelState.isSpinning, calculateNewRotation])

  // Handle spin completion
  useEffect(() => {
    if (wheelState.isSpinning) {
      const timer = setTimeout(() => {
        const newAnimationTime =
          Math.floor(Math.random() * wheelConfig.maxAnimationTime) +
          wheelConfig.baseAnimationTime
        setWheelState((prevState) => ({
          ...prevState,
          isSpinning: false,
          animationTime: newAnimationTime
        }))
      }, wheelState.animationTime * 950)

      return () => clearTimeout(timer)
    }
  }, [wheelState.isSpinning, wheelState.animationTime, wheelConfig])

  // Memoized triangle pieces
  const triangles = useMemo(
    () => (
      <TrianglePiece
        radius={wheelConfig.radius}
        numPieces={wheelConfig.slots}
        textRadiusMultiplier={0.65}
      />
    ),
    [wheelConfig.radius, wheelConfig.slots]
  )

  return (
    <div className="wheel-container" style={{ perspective: '1000px' }}>
      <svg
        viewBox="0 0 100 100"
        width="300"
        height="300"
        style={{
          transition: `transform ${wheelState.animationTime}s ease-out`,
          transform: `rotateZ(${wheelState.rotation}deg)`
        }}
      >
        <defs>
          <clipPath id="cut-off-bottom">
            <circle
              cx={wheelConfig.radius}
              cy={wheelConfig.radius}
              r={Math.ceil(wheelConfig.radius)}
              stroke="#333"
              strokeWidth="1"
            />
          </clipPath>
        </defs>
        {triangles}
      </svg>

      <button onClick={handleSpin} disabled={wheelState.isSpinning}>
        {wheelState.isSpinning ? 'Spinning...' : 'SPIN'}
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
