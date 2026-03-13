import React, { useState, useEffect } from 'react'
import api from '../api'

function ConnectionForm({ onConnectSuccess }) {
  const [connections, setConnections] = useState([])
  const [config, setConfig] = useState({
    id: '',
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: ''
  })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  // Cargar conexiones guardadas al iniciar
  useEffect(() => {
    const loadConnections = async () => {
        try {
          const savedConnections = await api.getConnections()
          if (savedConnections) setConnections(savedConnections)
        } catch (e) {
          console.error("Error cargando conexiones:", e)
        }
    }
    loadConnections()
  }, [])

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value })
  }

  const handleSelectConnection = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setConfig({ id: '', host: 'localhost', port: 3306, user: 'root', password: '', database: '' })
      return;
    }
    const selected = connections.find(c => c.id === selectedId);
    if (selected) setConfig(selected);
  }

  const handleConnect = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: '', message: '' })

    try {
      // 1. Probar conexión
      const result = await api.testConnection(config)

      if (result.success) {
        setStatus({ type: 'success', message: result.message })
        // 2. Guardar configuración si es exitosa
        const savedConn = await api.saveConnection(config)
        
        // Actualizar lista
        if (!config.id) {
          setConnections([...connections, savedConn])
          setConfig(savedConn)
        } else {
          setConnections(connections.map(c => c.id === savedConn.id ? savedConn : c))
        }

        // 3. Notificar al componente padre que la conexión fue exitosa
        onConnectSuccess(savedConn)
      } else {
        setStatus({ type: 'error', message: 'Error: ' + result.message })
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Error inesperado: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!config.id) return;
    
    if (window.confirm('¿Seguro que deseas eliminar esta conexión?')) {
      try {
        await api.deleteConnection(config.id);
        setConnections(connections.filter(c => c.id !== config.id));
        setConfig({ id: '', host: 'localhost', port: 3306, user: 'root', password: '', database: '' });
        setStatus({ type: 'success', message: 'Conexión eliminada.' });
      } catch (err) {
        setStatus({ type: 'error', message: 'Error al eliminar: ' + err.message });
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Conexión a Base de Datos</h1>

        {connections.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Conexiones Guardadas</label>
            <select 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-50 mb-4"
              value={config.id || ''}
              onChange={handleSelectConnection}
            >
              <option value="">-- Nueva Conexión --</option>
              {connections.map(c => (
                <option key={c.id} value={c.id}>
                  {c.user}@{c.host}:{c.port}
                </option>
              ))}
            </select>
          </div>
        )}

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

          <div className="flex gap-2">
            <button type="submit" disabled={loading} className={`flex-1 py-2 px-4 rounded-md text-white font-medium ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {loading ? 'Conectando...' : 'Conectar y Guardar'}
            </button>
            {config.id && (
              <button type="button" onClick={handleDelete} disabled={loading} className="py-2 px-4 rounded-md text-white font-medium bg-red-500 hover:bg-red-600">
                Eliminar
              </button>
            )}
          </div>
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