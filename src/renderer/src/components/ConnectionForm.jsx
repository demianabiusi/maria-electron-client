import React, { useState, useEffect } from 'react'

function ConnectionForm({ onConnectSuccess }) {
  const [config, setConfig] = useState({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: ''
  })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  // Cargar configuración guardada al iniciar
  useEffect(() => {
    const loadConfig = async () => {
      if (window.db) {
        const savedConfig = await window.db.getConfig()
        if (savedConfig) setConfig((prev) => ({ ...prev, ...savedConfig }))
      }
    }
    loadConfig()
  }, [])

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value })
  }

  const handleConnect = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: '', message: '' })

    try {
      // 1. Probar conexión
      const result = await window.db.testConnection(config)

      if (result.success) {
        setStatus({ type: 'success', message: result.message })
        // 2. Guardar configuración si es exitosa
        await window.db.saveConfig(config)

        // 3. Notificar al componente padre que la conexión fue exitosa
        onConnectSuccess(config)
      } else {
        setStatus({ type: 'error', message: 'Error: ' + result.message })
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Error inesperado: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Nueva Conexión</h1>

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Host</label>
            <input type="text" name="host" value={config.host} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Usuario</label>
              <input type="text" name="user" value={config.user} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700">Puerto</label>
              <input type="number" name="port" value={config.port} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" name="password" value={config.password} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>

          <button type="submit" disabled={loading} className={`w-full py-2 px-4 rounded-md text-white font-medium ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {loading ? 'Conectando...' : 'Conectar'}
          </button>
        </form>

        {status.message && !loading && status.type !== 'success' && (
          <div className={`mt-4 p-3 rounded text-sm ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConnectionForm