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

      <h1>Mondongo Project</h1>
      <div className="card">
        
        <UsersPage></UsersPage>
        
      </div>
      <div className="card">
        <p><Pruebas></Pruebas></p>
      </div>
    </>
  )
}

export default App
