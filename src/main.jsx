import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { DBProvider } from './store/db'
import { AuthProvider } from './auth'
import './styles/index.css'

class Boundary extends React.Component {
  state = { err: null }
  static getDerivedStateFromError(err) { return { err } }
  render() {
    if (this.state.err) {
      return <pre style={{ padding: 20, whiteSpace: 'pre-wrap', fontSize: 13 }}>
        {String(this.state.err?.stack || this.state.err)}
      </pre>
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Boundary>
      <DBProvider>
        <AuthProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </AuthProvider>
      </DBProvider>
    </Boundary>
  </React.StrictMode>,
)
