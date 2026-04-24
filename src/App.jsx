import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { Button } from './componets/ui/Button'
import { UsersPage } from './componets/pages/UsersPage'

function App() {
  const [count, setCount] = useState(0)
  const [users, setUsers] = useState([]);//agregar



  return (
    <>

    <nav className="navbar">
        <ul className="nav-menu">
          <li className="nav-item"><a href="/" className="nav-link">Home</a></li>
          <li className="nav-item"><a href="/users" className="nav-link">Users</a></li>
          <li className="nav-item"><a href="/about" className="nav-link">About</a></li>
        </ul>
    </nav>


      <h1>Mondongo Project</h1>
      <div className="card">
               
        <UsersPage></UsersPage>
      </div>
      
    </>
  )
}

export default App
