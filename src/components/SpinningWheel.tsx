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
  const triangleHeight = getIsoscelesTriangleHeight(angle, size)

  const triangleStyle = {
    width: `${size}rem`,
    height: `${triangleHeight}rem`,
    transform: `translateX(-50%) translateY(-50%) rotate(${rotation}deg) translateY(50%)`,
    clipPath: `polygon(0% 100%, 50% 0%, 100% 100%)`
  }

  return (
    <div
      className={`absolute -left-1/2 overflow-visible ${color} ${className}`}
      style={{
        ...triangleStyle,
        background: color
      }}
    >
      <div className="absolute left-0 top-0  size-0 border-x-0 border-b-0" />
    </div>
  )
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
    }, 7500)
  }

  // style for the wheel
  const wheelStyle: CSSProperties = useMemo(() => {
    return {
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      transition: isSpinning ? 'transform 8s ease-out' : 'none'
    }
  }, [rotation, isSpinning])

  const triangleSize = 15 // size of the wheel container

  return (
    <div className={className || ''}>
      <div className="relative mx-auto flex size-80 items-center justify-center overflow-hidden rounded-full border-2 border-gray-300 p-4">
        <div
          ref={wheelRef}
          className="absolute left-1/2 top-1/2 z-50 size-0 -translate-x-1/2 -translate-y-1/2 text-clip "
          style={{ ...wheelStyle }}
        >
          {slots.map((index) => {
            return (
              <IsoscelesTriangle
                key={index}
                size={triangleSize} // size prop is in rem, adjust as needed
                rotation={(360 / slotCount) * index}
                angle={360 / slotCount}
                color={generateHexColorFromNumber(index)}
              />
            )
          })}
        </div>
        <div className="absolute left-1/2 top-1/2 z-50 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black"></div>

        {/* center pointer that indicates the selected option */}
      </div>
      <div className="mt-4 flex hidden items-center space-x-2">
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
        <div className="mt-2 hidden space-y-1">
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

function getIsoscelesTriangleHeight(
  vertexAngle: number,
  width: number
): number | null {
  // Convert vertex angle to radians
  const vertexAngleRad = (vertexAngle * Math.PI) / 180

  if (vertexAngleRad <= 0 || vertexAngleRad >= Math.PI || width <= 0) {
    return null // Invalid vertex angle or width
  }

  // Calculate half of the vertex angle
  const halfVertexAngleRad = vertexAngleRad / 2

  // Calculate the height using trigonometry: height = (width / 2) / tan(vertexAngle / 2)
  const height = width / 2 / Math.tan(halfVertexAngleRad)
  return height
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

export default SpinningWheel
