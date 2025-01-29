/* eslint-disable tailwindcss/no-custom-classname */
import { useEffect, useState } from 'react'

interface Slot {
  id: number
  name: string
  value: number
}

const css = `
        .clip-triangle {
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }

        .slice.selected {
            background-color: #ff6b6b;
        }

        /* Additional styles for the wheel */
        #wheel {
            position: relative;
            width: 300px;
            height: 300px;
            border: 4px solid #2d3748;
            border-radius: 50%;
            overflow: hidden;
            transition: transform 5s linear;
        }

        .slice {
            position: absolute;
            width: 50%;
            height: 50%;
            background-color: blue;
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
            transform-origin: bottom center;
            transition: transform 5s linear;
        }

        .slice span {
            position: absolute;
            left: 50%;
            top: 30px;
            transform: translateX(-50%) rotateZ(0deg);
            white-space: nowrap;
            text-transform: uppercase;
            font-size: 12px;
        }

        /* Pointer styling */
        .pointer {
            position: absolute;
            width: 20px;
            height: 20px;
            background-color: red;
            border-radius: 50%;
            transform-origin: bottom center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
`
export default function SpinningWheel() {
  const [slots, setSlots] = useState<Slot[]>([
    { value: 2, name: 'test', id: 0 },
    { value: 4, name: 'test2', id: 1 }
  ])
  const [selectedSlot, setSelectedSlot] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [inputName, setInputName] = useState('')
  const [inputValue, setInputValue] = useState('')

  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)

  // Calculate total value for proportional slices
  //const totalValue = slots.reduce((acc, slot) => acc + slot.value, 0)

  useEffect(() => {
    if (slots.length === 0 && !isSpinning) {
      setIsSpinning(false)
    }
  }, [slots])

  const addSlot = () => {
    if (inputName.trim() && inputValue.trim()) {
      const newId = slots.length + 1
      const newSlot: Slot = {
        id: newId,
        name: inputName,
        value: parseInt(inputValue)
      }
      setSlots([...slots, newSlot])
      setInputName('')
      setInputValue('')
    }
  }

  const spinWheel = () => {
    setIsSpinning(true)
    // Calculate animation duration based on number of slots
    const numberOfSlots = slots.length
    if (numberOfSlots === 0) return

    const wheel = document.getElementById('wheel')
    if (!wheel) return

    // Create a full rotation plus some extra for dramatic effect
    const rotation = 360 * (Math.random() + 1)

    // Calculate the angle per slice for highlighting
    //const anglePerSlice = 360 / numberOfSlots

    wheel.style.animation = `spin ${rotation}deg 5s linear`

    // Reset animation after spinning
    setTimeout(() => {
      wheel.style.animation = ''
      setIsSpinning(false)

      // Find the selected slice based on rotation
      const totalAngle = rotation % 360
      const selectedIndex = Math.floor((totalAngle * numberOfSlots) / 360)
      const selectedSlot = slots[selectedIndex]
      setSelectedSlot(selectedIndex)

      if (selectedSlot) {
        // Highlight the selected slot
        document.querySelectorAll('.slice').forEach((slice) => {
          slice.classList.remove('selected')
        })

        const selectedSlice = document.getElementById(`slice-${selectedIndex}`)

        selectedSlice && selectedSlice.classList.add('selected')
      }
    }, 5000)
  }

  const calculateSliceRotation = (index: number) => {
    if (!slots.length) return '0deg'

    const anglePerSlice = 360 / slots.length
    const rotation = anglePerSlice * index
    return `${rotation}deg`
  }

  const rotation = 360 * (Math.random() + 1)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8">
      {/* Form to add slots */}
      <div className="mb-8 space-y-4">
        <input
          type="text"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="Enter slot name"
          className="w-32 rounded border px-4 py-2"
        />

        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter slot value"
          className="w-32 rounded border px-4 py-2"
        />

        <button
          onClick={addSlot}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Add Slot
        </button>
      </div>

      {/* Wheel/Spinning Container */}
      <div
        id="wheel"
        className={`duration-5000 relative size-96 cursor-pointer overflow-hidden rounded-full border-4 border-gray-800 transition-transform ease-out`}
      >
        {slots.map((slot, index) => (
          <div
            key={slot.id}
            id={`slice-${index}`}
            className={`clip-triangle duration-5000 slice absolute size-1/2 bg-blue-400 transition-transform ease-out${
              isSpinning && selectedSlot === slot.id ? 'selected' : ''
            }`}
            style={{
              transform: `rotateZ(${calculateSliceRotation(index)})`,
              backgroundColor: `hsl(${index * 180},
              100%,
              ${(Math.random() * 50 + 25).toFixed(0)}%)`
            }}
          >
            <span
              className={`absolute font-bold text-white`}
              style={{
                left: '50%',
                top: '30px',
                rotate: `-${calculateSliceRotation(index)}`
              }}
            >
              {slot.name}
            </span>
          </div>
        ))}

        {/* Center Pointer */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500" />
      </div>

      {/* Controls */}
      <button
        onClick={spinWheel}
        disabled={isSpinning || slots.length === 0}
        className={`mt-8 rounded-md px-6 py-3 font-medium text-white ${
          isSpinning || slots.length === 0
            ? 'cursor-not-allowed bg-gray-400'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isSpinning ? 'Spinning...' : 'Spin'}
      </button>

      {/* Info */}
      <div className="mt-8 text-center text-gray-600">
        <p>Added slots: {slots.length}</p>
        {isSpinning && <p>Rotation: {(rotation / 100).toFixed(2)} seconds</p>}
      </div>
    </div>
  )
}
