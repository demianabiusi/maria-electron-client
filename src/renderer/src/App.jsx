import React, { useState } from 'react'
import ConnectionForm from './components/ConnectionForm'
import Dashboard from './components/Dashboard'

function App() {
  const [connectionConfig, setConnectionConfig] = useState(null)

  const handleConnectSuccess = (config) => {
    setConnectionConfig(config)
  }

  return (
    <div className="h-screen bg-gray-100 text-gray-800">
      {!connectionConfig ? (
        <ConnectionForm onConnectSuccess={handleConnectSuccess} />
      ) : (
        <Dashboard connectionConfig={connectionConfig} />
      )}
    </div>
  )
}

export default App