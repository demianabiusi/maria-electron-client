import React, { useState, useEffect, useRef } from 'react'
import SqlEditor from './SqlEditor'
import ResultsGrid from './ResultsGrid'
import api from '../api'
//import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Group, Panel, Separator } from 'react-resizable-panels';

const PanelGroup = Group;
const PanelResizeHandle = Separator;


function Dashboard({ connectionConfig }) {
  const [databases, setDatabases] = useState([])
  const [dbError, setDbError] = useState(null)
  
  // Estados para el árbol de navegación
  const [expandedDb, setExpandedDb] = useState(null)
  const [selectedDatabase, setSelectedDatabase] = useState(null) // Base de datos actual (para sentencias SQL)
  const [tables, setTables] = useState({}) // { nombreDb: [tabla1, tabla2] }

  const editorRef = useRef(null)

  // Estado para la ejecución de consultas
  const [queryResults, setQueryResults] = useState(null)
  const [queryError, setQueryError] = useState(null)
  const [isExecuting, setIsExecuting] = useState(false)

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const dbs = await api.getDatabases(connectionConfig)
        setDatabases(dbs)
      } catch (err) {
        setDbError(err.message)
      }
    }

    fetchDatabases()
  }, [connectionConfig])

  // Ejecuta la consulta SQL (ya sea desde el editor o generada automáticamente)
  const executeSql = async (sqlToExecute) => {
    if (!editorRef.current || isExecuting) return

    // Si pasamos SQL como argumento, lo usamos; si no, tomamos el del editor
    const sql = sqlToExecute || editorRef.current.getValue()
    
    // Si es una consulta generada (argumento), actualizamos el editor visualmente
    if (sqlToExecute && editorRef.current) {
      // Nota: Aquí necesitaríamos exponer un método `setValue` en SqlEditor si queremos actualizar el texto,
      // pero por ahora ejecutaremos la query directamente.
      // Para hacerlo bien, idealmente el SqlEditor debería ser controlado o exponer setValue.
    }

    if (!sql.trim()) return

    setIsExecuting(true)
    setQueryError(null)
    setQueryResults(null)

    try {
      // Si tenemos una BD seleccionada, la inyectamos en la config temporal para esta ejecución
      const configObj = selectedDatabase 
        ? { ...connectionConfig, database: selectedDatabase } 
        : connectionConfig

      const result = await api.executeQuery({ config: configObj, sql })
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

  const handleExecuteQuery = () => executeSql(null)

  const toggleDatabase = async (dbName) => {
    if (expandedDb === dbName) {
      setExpandedDb(null) // Colapsar si ya estaba abierto
    } else {
      setExpandedDb(dbName)
      setSelectedDatabase(dbName) // Al expandir, la hacemos la base de datos activa
      
      // Si no tenemos las tablas cargadas aún, las pedimos
      if (!tables[dbName]) {
        try {
          const dbTables = await api.getTables(connectionConfig, dbName)
          setTables(prev => ({ ...prev, [dbName]: dbTables }))
        } catch (err) {
          console.error("Error cargando tablas:", err)
        }
      }
    }
  }

  const handleTableDoubleClick = (dbName, tableName) => {
    const sql = `SELECT * FROM \`${dbName}\`.\`${tableName}\` LIMIT 100;`
    executeSql(sql)
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar (Explorador de BD) */}
      <aside className="w-64 bg-gray-200 p-4 overflow-y-auto border-r border-gray-300">
        <h2 className="text-lg font-bold mb-4">Bases de Datos</h2>
        {dbError && <p className="text-red-500 text-sm">{dbError}</p>}
        <ul>
          {databases.map((db) => (
            <li key={db} className="mb-1">
              <div 
                className={`text-sm py-1 cursor-pointer hover:bg-gray-300 rounded px-2 flex items-center gap-2 ${expandedDb === db ? 'bg-gray-300 font-bold' : ''} ${selectedDatabase === db ? 'text-blue-700' : ''}`}
                onClick={() => toggleDatabase(db)}
              >
                <span className="text-xs">{expandedDb === db ? 'Tv' : 'Dj'}</span> {/* Icono simple texto por ahora */}
                {db}
              </div>
              
              {expandedDb === db && tables[db] && (
                <ul className="pl-4 mt-1 border-l-2 border-gray-400 ml-2">
                  {tables[db].map(table => (
                    <li 
                      key={table} 
                      className="text-xs py-1 cursor-pointer hover:text-blue-600 hover:underline text-gray-700"
                      onDoubleClick={() => handleTableDoubleClick(db, table)}
                      title="Doble clic para SELECT * LIMIT 100"
                    >
                      {table}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Barra de herramientas con botón de ejecutar */}
        <div className="p-2 bg-gray-100 border-b border-gray-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-4">
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
            <div className={`text-sm font-medium px-2 py-1 rounded bg-gray-200 border ${selectedDatabase ? 'border-blue-400 text-blue-700' : 'border-gray-300 text-gray-500'}`}>
              BD Activa: {selectedDatabase ? selectedDatabase : 'Ninguna (Global)'}
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <PanelGroup direction="vertical" style={{ height: '100%', width: '100%' }}>
            <Panel defaultSize={67} minSize={20}>
              <SqlEditor ref={editorRef} onExecute={handleExecuteQuery} />
            </Panel>
            <PanelResizeHandle className="h-2 flex items-center justify-center bg-gray-200 data-[resize-handle-state=hover]:bg-blue-400 data-[resize-handle-state=drag]:bg-blue-500 outline-none transition-colors">
              <div className="w-8 h-1 bg-gray-400 rounded-full" />
            </PanelResizeHandle>
            <Panel defaultSize={33} minSize={10}>
              <ResultsGrid results={queryResults} error={queryError} />
            </Panel>
          </PanelGroup>
        </div>
      </main>
    </div>
  )
}

export default Dashboard