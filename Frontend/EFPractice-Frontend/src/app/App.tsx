import Router from './Router.tsx'

import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import '../styles/App.css'
import { applyAppearanceSettings, loadAppearanceSettings } from '../shared/theme/appearance.ts'

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
