import Router from './Router.tsx'

import './styles/App.css'
import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { applyAppearanceSettings, loadAppearanceSettings } from './theme/appearance.ts'

function App() {
  useEffect(() => {
    applyAppearanceSettings(loadAppearanceSettings())
  }, [])

  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  )
}

export default App
