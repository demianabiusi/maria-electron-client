import React, { useState, useEffect, useRef } from 'react'
import SqlEditor from './SqlEditor'
import ResultsGrid from './ResultsGrid'

function Dashboard({ connectionConfig }) {
  const [databases, setDatabases] = useState([])
  const [dbError, setDbError] = useState(null)
  const editorRef = useRef(null)

  // Estado para la ejecución de consultas
  const [queryResults, setQueryResults] = useState(null)
  const [queryError, setQueryError] = useState(null)
  const [isExecuting, setIsExecuting] = useState(false)

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const dbs = await window.db.getDatabases(connectionConfig)
        setDatabases(dbs)
      } catch (err) {
        setDbError(err.message)
      }
    }

    fetchDatabases()
  }, [connectionConfig])

  const handleExecuteQuery = async () => {
    if (!editorRef.current || isExecuting) return

    const sql = editorRef.current.getValue()
    if (!sql.trim()) return

    setIsExecuting(true)
    setQueryError(null)
    setQueryResults(null)

    try {
      const result = await window.db.executeQuery({ config: connectionConfig, sql })
      if (result.success) {
        setQueryResults(result.data)
      } else {
        setQueryError(result.error)
      }
    } catch (err) {
      setQueryError(err.message)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar (Explorador de BD) */}
      <aside className="w-64 bg-gray-200 p-4 overflow-y-auto border-r border-gray-300">
        <h2 className="text-lg font-bold mb-4">Bases de Datos</h2>
        {dbError && <p className="text-red-500 text-sm">{dbError}</p>}
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
        {/* Barra de herramientas con botón de ejecutar */}
        <div className="p-2 bg-gray-100 border-b border-gray-300 flex items-center gap-2">
          <button
            onClick={handleExecuteQuery}
            disabled={isExecuting}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm disabled:bg-gray-400 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            {isExecuting ? 'Ejecutando...' : 'Ejecutar (F5)'}
          </button>
        </div>

        <div className="flex-1 relative">
          <SqlEditor ref={editorRef} onExecute={handleExecuteQuery} />
        </div>

        {/* Panel de Resultados */}
        <div className="h-1/3 bg-white border-t-2 border-gray-300 overflow-auto">
          <ResultsGrid results={queryResults} error={queryError} />
        </div>
      </main>
    </div>
  )
}

export default Dashboard