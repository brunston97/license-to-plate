import { useState } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'

export default function PageWrapper() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <button
        className="absolute left-3 top-3 z-50 rounded bg-gray-800 p-2 hover:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        &#9776;
      </button>

      <div
        className={`fixed left-0 top-0 z-40 h-full w-64 bg-gray-800 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <h2 className="mb-6 mt-8 text-2xl font-bold">Menu</h2>
          <nav className="flex flex-col gap-4">
            <button
              onClick={() => {
                navigate('/')
                setIsOpen(false)
              }}
              className="text-left hover:text-yellow-400"
            >
              Plate Off
            </button>
            <button
              onClick={() => {
                navigate('/myPlates')
                setIsOpen(false)
              }}
              className="text-left hover:text-yellow-400"
            >
              My Plates
            </button>
            <button
              onClick={() => {
                navigate('/label')
                setIsOpen(false)
              }}
              className="text-left hover:text-yellow-400"
            >
              Label
            </button>
          </nav>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div>
        <Outlet />
      </div>
    </div>
  )
}
