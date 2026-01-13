import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PlateOffPage from './pages/PlateOffPage'
import MyPlatesPage from './pages/MyPlatesPage'
import PageWrapper from 'components/PageWrapper'
import { ImageEditor } from 'components/ImageEditor'
import Results from 'components/Results'
import './App.css'
//import { ThemeProvider } from '@nextui-org/theme'

function App() {
  return (
    // <ThemeProvider>
    <Router>
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
        </Route>
      </Routes>
    </Router>
    // </ThemeProvider>
  )
}

export default App
