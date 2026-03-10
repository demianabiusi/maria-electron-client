import { useState, useEffect } from 'react'

function App() {
  const [config, setConfig] = useState({
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306
  })
  const [status, setStatus] = useState({ message: '', success: false })
  const [loading, setLoading] = useState(false)

  // Cargar configuración guardada al iniciar
  useEffect(() => {
    const loadConfig = async () => {
      const savedConfig = await window.db.getConfig()
      if (savedConfig) {
        setConfig(savedConfig)
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
    setStatus({ message: 'Conectando...', success: false })

    try {
      // Usamos la API expuesta en preload.js
      const result = await window.db.testConnection(config)
      setStatus(result)
      
      // Si la conexión es exitosa, guardamos la configuración
      if (result.success) {
        await window.db.saveConfig(config)
      }
    } catch (error) {
      setStatus({ message: 'Error inesperado: ' + error, success: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">¡Hola Mundo desde React + Electron! ⚛️🚀</h1>
      
      <div className="mb-6 text-sm text-gray-500 bg-white p-3 rounded shadow-sm inline-block">
        <span className="font-semibold">Versiones:</span> Node.js {window.versions.node()}, Chrome {window.versions.chrome()}, Electron {window.versions.electron()}
      </div>

      <hr className="border-gray-300 mb-6" />

      <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Conexión MySQL</h2>
        <form onSubmit={handleConnect} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
            <input className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" name="host" placeholder="localhost" value={config.host} onChange={handleChange} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" name="user" placeholder="root" value={config.user} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" name="password" type="password" placeholder="••••••" value={config.password} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Puerto</label>
            <input className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" name="port" type="number" placeholder="3306" value={config.port} onChange={handleChange} />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`mt-2 w-full py-2 px-4 rounded text-white font-bold transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Conectando...' : 'Probar Conexión'}
          </button>
        </form>

        {status.message && (
          <div className={`mt-4 p-3 rounded text-sm font-medium ${status.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
