import { useState } from 'react'

import './App.css'

function App() {

  return (
    <>
      <div>
        <h1>EFPractice-Frontend</h1>
        <div className="card">
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </div>
      <div className="navigation-panel">
        <h2>Navigation Panel</h2>
        <ul>
          <li><a href="#">Home</a></li>
        </ul>
        <div className="task-list">
          <ul>
            <li><a href="#">Task 1</a></li>
            <li><a href="#">Task 2</a></li>
          </ul>
          <ul>
            <li><a href="#">Task 3</a></li>
            <li><a href="#">Task 4</a></li>
          </ul>
        </div>
      </div >
    </>
  )
}

export default App
