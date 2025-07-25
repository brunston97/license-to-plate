import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PlateOffPage from './pages/PlateOffPage'
import MyPlatesPage from './pages/MyPlatesPage'
import PageWrapper from 'components/PageWrapper'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PageWrapper />}>
          <Route path="/" element={<PlateOffPage />} />
          <Route path="/myplates" element={<MyPlatesPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
