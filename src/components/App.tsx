import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PlateOffPage from './PlateOffPage'
import MyPlatesPage from './MyPlatesPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PlateOffPage />} />
        <Route path="/myplates" element={<MyPlatesPage />} />
      </Routes>
    </Router>
  )
}

export default App
