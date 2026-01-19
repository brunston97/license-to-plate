import { Routes, Route } from 'react-router-dom'
import PlateOffPage from './pages/PlateOffPage'
import MyPlatesPage from './pages/MyPlatesPage'
import PageWrapper from 'components/PageWrapper'
import { ImageEditor } from 'components/ImageEditor'
import Results from 'components/Results'
import './App.css'
import { useTheme } from '@heroui/use-theme'
import type { NavigateOptions } from 'react-router-dom'

import { useNavigate, useHref } from 'react-router-dom'
import { HeroUIProvider } from '@heroui/react'

declare module '@react-types/shared' {
  interface RouterConfig {
    routerOptions: NavigateOptions
  }
}

function App() {
  useTheme('dark')
  const navigate = useNavigate()

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <Routes>
        <Route element={<PageWrapper />}>
          <Route path="/" element={<PlateOffPage />} />
          <Route path="/myplates" element={<MyPlatesPage />} />
          {import.meta.env.DEV && (
            <>
              <Route path="/label" element={<ImageEditor />} />
              <Route path="/label/:id" element={<ImageEditor />} />
              <Route path="/results" element={<Results></Results>} />
            </>
          )}
          <Route
            path="*"
            element={
              <h1 className=" my-auto w-full text-center text-4xl font-black text-black">
                HHMMMM...
              </h1>
            }
          ></Route>
        </Route>
      </Routes>
    </HeroUIProvider>
  )
}

export default App
