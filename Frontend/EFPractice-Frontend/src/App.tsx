import { useState } from 'react'
import Router from './Router.tsx'

import './App.css'
import './Dashboard.tsx'
import Dashboard from './Dashboard.tsx'
import { BrowserRouter } from 'react-router-dom'

function App() {

  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  )
}

export default App
