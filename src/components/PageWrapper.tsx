import { Button } from '@nextui-org/react'
import { useState } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'

export default function PageWrapper() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Button
        //className="absolute left-3 top-3 z-50 rounded bg-gray-800 p-2 hover:bg-gray-700"
        className="absolute left-3 top-3 z-50"
        onPress={() => setIsOpen(!isOpen)}
        isIconOnly
        variant="flat"
        color="primary"
      >
        &#9776;
      </Button>

      <div
        className={`fixed left-0 top-0 z-40 h-full w-64 bg-gray-800 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <h2 className="mb-6 mt-8 text-2xl font-bold">Menu</h2>
          <nav className="flex flex-col gap-4">
            <Button
              onPress={() => {
                navigate('/')
                setIsOpen(false)
              }}
              //className="text-left hover:text-yellow-400"
            >
              Plate Off
            </Button>
            <Button
              onPress={() => {
                navigate('/myPlates')
                setIsOpen(false)
              }}
              //className="text-left hover:text-yellow-400"
            >
              My Plates
            </Button>
            {import.meta.env.DEV && (
              <Button
                onPress={() => {
                  navigate('/label')
                  setIsOpen(false)
                }}
                //className="text-left hover:text-yellow-400"
              >
                Label
              </Button>
            )}
            {import.meta.env.DEV && (
              <Button
                onPress={() => {
                  navigate('/results')
                  setIsOpen(false)
                }}
                //className="text-left hover:text-yellow-400"
              >
                Results
              </Button>
            )}
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
