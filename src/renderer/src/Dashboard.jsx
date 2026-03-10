import React, { useState, useEffect } from 'react'
import SqlEditor from './SqlEditor'

function Dashboard({ connectionConfig }) {
  const [databases, setDatabases] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const dbs = await window.db.getDatabases(connectionConfig)
        setDatabases(dbs)
      } catch (err) {
        setError(err.message)
      }
    }

    fetchDatabases()
  }, [connectionConfig])

  return (
    <div className="flex h-screen">
      {/* Sidebar (Explorador de BD) */}
      <aside className="w-64 bg-gray-200 p-4 overflow-y-auto border-r border-gray-300">
        <h2 className="text-lg font-bold mb-4">Bases de Datos</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <ul>
          {databases.map((db) => (
            <li key={db} className="text-sm py-1 cursor-pointer hover:bg-gray-300 rounded px-2">
              {db}
            </li>
          ))}
        </ul>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Placeholder para Pestañas */}
        <div className="p-2 bg-gray-100 border-b border-gray-300">
          <span className="text-sm border-t-2 border-blue-500 bg-white px-4 py-2 rounded-t">
            Consulta 1
          </span>
        </div>

        <div className="flex-1 relative"><SqlEditor /></div>

        <div className="h-1/3 bg-white border-t-2 border-gray-300 p-2 overflow-auto">
          <p className="text-sm text-gray-500">Aquí se mostrarán los resultados de la consulta.</p>
        </div>
      </main>
    </div>
  )
}

export default Dashboard