import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { DBProvider } from './store/db'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DBProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </DBProvider>
  </React.StrictMode>,
)
