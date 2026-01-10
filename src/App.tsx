import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PlateOffPage from './pages/PlateOffPage'
import MyPlatesPage from './pages/MyPlatesPage'
import PageWrapper from 'components/PageWrapper'
import { ImageEditor } from 'components/ImageEditor'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PageWrapper />}>
          <Route path="/" element={<PlateOffPage />} />
          <Route path="/myplates" element={<MyPlatesPage />} />
          <Route path="/label" element={<ImageEditor />} />
          <Route path="/label/:id" element={<ImageEditor />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
