import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  CSSProperties
} from 'react'
import { Button, Input } from '@nextui-org/react'

interface SpinningWheelProps {
  initialOptions?: string[]
  className?: string
  slotCount: number
}

interface OptionForm {
  text: string
  error: string | null
}

interface IsoscelesTriangleProps {
  angle?: number // The unique angle of the isosceles triangle (in degrees)
  size?: number // The size of the triangle's base (in rem), defaults to 10 rem
  rotation?: number // The rotation of the triangle (in degrees), defaults to 0 degrees
  color?: string // The background color, defaults to 'bg-blue-500'
  className?: string // Optional className prop to pass in tailwind styles.
}

export const IsoscelesTriangle: React.FC<IsoscelesTriangleProps> = ({
  angle = 120,
  size = 10,
  rotation = 0,
  color = 'bg-blue-500',
  className = ''
}) => {
  const vectors = isoscelesTriangleToCoordinates(angle)
  const tHeight = 100 - vectors.slice(-1)[0].y
  vectors.slice(-1)[0].y = 0
  const shiftDistance = tHeight - size / 2
  const triangleHeight = (tHeight / 100) * size

  const triangleStyle = {
    width: `${size}rem`,
    height: `${triangleHeight}rem`,
    transform: `translateX(-50%) translateY(-50%) rotate(${rotation}deg) translateY(50%)`, // translateY(-${shiftDistance}%)`, // Removed translateY here
    clipPath: `polygon(${vectors.map((v) => `${v.x}% ${v.y}%`).join(', ')})`
  }

  return (
    <div
      className={`absolute -left-1/2 overflow-visible ${color} ${className}`}
      style={{
        ...triangleStyle,
        background: generateHexColorFromNumber(rotation)
      }}
    >
      <div
        style={
          {
            //transform: `translateY(${-size / 2}rem)`
          }
        }
        className="absolute left-0 top-0  size-0 border-x-0 border-b-0 border-transparent"
      />
    </div>
  )
}

function isoscelesTriangleToCoordinates(
  angleDegrees: number
): { x: number; y: number }[] {
  if (angleDegrees <= 0 || angleDegrees >= 180 || angleDegrees > 120) {
    angleDegrees = 60
  }
  if (angleDegrees <= 0 || angleDegrees >= 180 || angleDegrees > 120) {
    angleDegrees = 60
  }
  const angleRadians = (angleDegrees * Math.PI) / 180
  const equalAngleRadians = (Math.PI - angleRadians) / 2
  const base = 100
  const height = (base / 2) * Math.tan(equalAngleRadians)
  const maxHeight = 100
  const scaleFactor = Math.min(1, maxHeight / height)
  const scaledHeight = height * scaleFactor
  const scaledBase = base * scaleFactor

  const x1 = 0
  const y1 = 100 // Shifted y1 to 100 to move the base to the bottom
  const x2 = scaledBase
  const y2 = 100 // Shifted y2 to 100 to move the base to the bottom
  const x3 = scaledBase / 2
  const y3 = 100 - scaledHeight // Adjusted y3 to position the peak correctly

  return [
    { x: x1, y: y1 },
    { x: x2, y: y2 },
    { x: x3, y: y3 }
  ]
}

function generateHexColorFromNumber(num: number): string {
  const absNum = Math.abs(num)
  const hue = (absNum * 137.508) % 360
  const h = hue / 360
  const s = 0.8 //saturation
  const l = 0.6 //lightness

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q

  const r = hue2rgb(p, q, h + 1 / 3)
  const g = hue2rgb(p, q, h)
  const b = hue2rgb(p, q, h - 1 / 3)

  const rgbToHex = (red: number, green: number, blue: number): string => {
    const componentToHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16)
      return hex.length == 1 ? '0' + hex : hex
    }
    return (
      '#' + componentToHex(red) + componentToHex(green) + componentToHex(blue)
    )
  }
  return rgbToHex(r, g, b)
}

const SpinningWheel: React.FC<SpinningWheelProps> = ({
  initialOptions = [],
  className,
  slotCount = 3
}) => {
  // State for managing the wheel options
  const [options, setOptions] = useState<string[]>(initialOptions)
  // State for tracking the current rotation angle
  const [rotation, setRotation] = useState(0)
  // State for tracking if the wheel is currently spinning
  const [isSpinning, setIsSpinning] = useState(false)
  // ref for our wheel component
  const wheelRef = useRef<HTMLDivElement | null>(null)
  // State for inputting a new option
  const [newOptionForm, setNewOptionForm] = useState<OptionForm>({
    text: '',
    error: null
  })
  const slots = useMemo(() => {
    return [...Array(slotCount).keys()]
  }, [slotCount])

  // This function handles updating the state for new options
  const handleNewOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewOptionForm((prev) => ({ ...prev, text: e.target.value, error: null }))
  }

  const handleAddOption = () => {
    if (newOptionForm.text.trim() === '') {
      setNewOptionForm((prev) => ({
        ...prev,
        error: 'Option cannot be empty.'
      }))
      return
    }
    // update options state with the new option
    setOptions((prevOptions) => [...prevOptions, newOptionForm.text])
    // clear input and error state
    setNewOptionForm({ text: '', error: null })
  }

  const handleRemoveOption = useCallback((index: number) => {
    setOptions((prevOptions) => {
      // Return a new array with option removed by index
      return prevOptions.filter((_, i) => i !== index)
    })
  }, [])
  const spin = () => {
    if (isSpinning || options.length === 0) return // prevent spinning if already spinning or empty options
    setIsSpinning(true)
    const randomRotation = 360 * 5 + Math.random() * 360 // random amount for rotation
    setRotation((prevRotation) => prevRotation + randomRotation) // update state for the new rotation

    // This calculates the final resting position
    setTimeout(() => {
      setIsSpinning(false)
    }, 5000)
  }

  // style for the wheel
  const wheelStyle: CSSProperties = useMemo(() => {
    return {
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      transition: isSpinning ? 'transform 5s ease-out' : 'none'
    }
  }, [rotation, isSpinning])

  const triangleSize = 15 // size of the wheel container
  const triangleBaseSize = triangleSize /// 2 // Adjust as needed to fit triangles into circle

  return (
    <div className={className || ''}>
      {/* {[0, 120, 240].map((val) => {
        return (
          <IsoscelesTriangle
            key={val}
            size={triangleSize} // size prop is in rem, adjust as needed
            rotation={val}
            angle={120}
            //className="left-1/4 top-0" // Adjust position to center, roughly
          />
        )
      })} */}
      <div className="relative mx-auto flex size-40 items-center justify-center rounded-full border-2 border-gray-300 p-4">
        <div
          ref={wheelRef}
          className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
          style={wheelStyle}
        >
          {slots.map((val) => {
            return (
              <IsoscelesTriangle
                key={val}
                size={triangleSize} // size prop is in rem, adjust as needed
                rotation={(360 / slotCount) * val}
                angle={360 / slotCount}
                //className="left-1/4 top-0" // Adjust position to center, roughly
              />
            )
          })}
        </div>
        <div className="absolute left-1/2 top-1/2 z-50 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black"></div>

        {/* center pointer that indicates the selected option */}
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Enter new option"
          value={newOptionForm.text}
          onChange={handleNewOptionChange}
          errorMessage={newOptionForm.error}
          className="flex-1"
        />
        <Button
          color="primary"
          onClick={handleAddOption}
          isDisabled={isSpinning}
        >
          Add
        </Button>
      </div>
      {options.length > 0 && (
        <div className="mt-2 space-y-1">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="flex-1 truncate">{option}</span>
              <Button
                size="sm"
                color="danger"
                onClick={() => handleRemoveOption(index)}
                isDisabled={isSpinning}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 flex justify-center">
        <Button
          color="success"
          onClick={spin}
          isDisabled={isSpinning || options.length === 0}
        >
          Spin
        </Button>
      </div>
    </div>
  )
}

export default SpinningWheel
