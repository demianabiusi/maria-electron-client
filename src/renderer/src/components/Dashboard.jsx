import React, { useState, useEffect, useRef } from 'react'
import SqlEditor from './SqlEditor'
import ResultsGrid from './ResultsGrid'
import api from '../api'
//import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Group, Panel, Separator } from 'react-resizable-panels';

const PanelGroup = Group;
const PanelResizeHandle = Separator;


function Dashboard({ connectionConfig, onDisconnect }) {
  const [databases, setDatabases] = useState([])
  const [dbError, setDbError] = useState(null)
  
  // Estados para el árbol de navegación
  const [expandedDb, setExpandedDb] = useState(null)
  const [selectedDatabase, setSelectedDatabase] = useState(null) // Base de datos actual (para sentencias SQL)
  
  // Objeto estructurado para almacenar los elementos de la base de datos
  // { nombreDb: { tables: [], views: [], procedures: [], functions: [], triggers: [], events: [] } }
  const [dbObjects, setDbObjects] = useState({}) 
  
  // Rastreo de subcarpetas expandidas por BD, ej: { 'my_db': { tables: true, views: false... } }
  const [expandedFolders, setExpandedFolders] = useState({})

  // Rastreo de tablas expandidas para ver sus columnas e índices:
  // { 'my_db.my_table': { columns: [], indexes: [], expanded: true, expandedColumns: false, expandedIndexes: false } }
  const [tableDetails, setTableDetails] = useState({})

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
      setExpandedDb(null)
    } else {
      setExpandedDb(dbName)
      setSelectedDatabase(dbName)
      
      // Si no tenemos los objetos cargados aún, los pedimos en paralelo
      if (!dbObjects[dbName]) {
        try {
          const [fetchedTables, fetchedViews, fetchedProcedures, fetchedFunctions, fetchedTriggers, fetchedEvents] = await Promise.all([
            api.getTables(connectionConfig, dbName).catch(() => []),
            api.getViews(connectionConfig, dbName).catch(() => []),
            api.getProcedures(connectionConfig, dbName).catch(() => []),
            api.getFunctions(connectionConfig, dbName).catch(() => []),
            api.getTriggers(connectionConfig, dbName).catch(() => []),
            api.getEvents(connectionConfig, dbName).catch(() => [])
          ])
          
          setDbObjects(prev => ({
            ...prev,
            [dbName]: { 
              tables: fetchedTables, 
              views: fetchedViews, 
              procedures: fetchedProcedures, 
              functions: fetchedFunctions, 
              triggers: fetchedTriggers, 
              events: fetchedEvents 
            }
          }))
          
          // Por defecto, expandir la carpeta de Tablas al abrir una BD
          setExpandedFolders(prev => ({
            ...prev,
            [dbName]: { tables: true, views: false, procedures: false, functions: false, triggers: false, events: false }
          }))
        } catch (err) {
          console.error("Error cargando objetos de la base de datos:", err)
        }
      }
    }
  }

  const toggleFolder = (dbName, folderName) => {
    setExpandedFolders(prev => ({
      ...prev,
      [dbName]: {
        ...prev[dbName],
        [folderName]: !prev[dbName]?.[folderName]
      }
    }))
  }

  const toggleTable = async (dbName, tableName) => {
    const tableKey = `${dbName}.${tableName}`;
    
    setTableDetails(prev => ({
      ...prev,
      [tableKey]: {
        ...prev[tableKey],
        expanded: !prev[tableKey]?.expanded
      }
    }));

    // Cargar si no existen
    if (!tableDetails[tableKey]?.columns) {
      try {
        const [columns, indexes] = await Promise.all([
          api.getTableColumns(connectionConfig, dbName, tableName).catch(() => []),
          api.getTableIndexes(connectionConfig, dbName, tableName).catch(() => [])
        ]);
        
        setTableDetails(prev => ({
          ...prev,
          [tableKey]: {
            ...prev[tableKey],
            columns,
            indexes,
            expandedColumns: true, // Auto-expandir por defecto
            expandedIndexes: false
          }
        }));
      } catch (err) {
        console.error("Error cargando detalles de la tabla:", err);
      }
    }
  }

  const toggleTableSubfolder = (tableKey, subfolder) => {
    setTableDetails(prev => ({
      ...prev,
      [tableKey]: {
        ...prev[tableKey],
        [subfolder]: !prev[tableKey]?.[subfolder]
      }
    }));
  }

  const handleObjectDoubleClick = (dbName, folderName, objectName) => {
    let sql = '';
    switch (folderName) {
      case 'tables':
      case 'views':
        sql = `SELECT * FROM \`${dbName}\`.\`${objectName}\` LIMIT 100;`;
        break;
      case 'procedures':
        sql = `SHOW CREATE PROCEDURE \`${dbName}\`.\`${objectName}\`;`;
        break;
      case 'functions':
        sql = `SHOW CREATE FUNCTION \`${dbName}\`.\`${objectName}\`;`;
        break;
      case 'triggers':
        sql = `SHOW CREATE TRIGGER \`${dbName}\`.\`${objectName}\`;`;
        break;
      case 'events':
        sql = `SHOW CREATE EVENT \`${dbName}\`.\`${objectName}\`;`;
        break;
      default:
        break;
    }
    if (sql) executeSql(sql);
  }

  // Componente interno para renderizar cada carpeta
  const RenderFolder = ({ db, folderKey, title, items, iconSvg }) => {
    if (!items || items.length === 0) return null;
    const isExpanded = expandedFolders[db]?.[folderKey];
    
    return (
      <div className="ml-4 mt-1">
        <div 
          className="text-xs py-1 px-1 cursor-pointer hover:bg-gray-300 rounded flex items-center gap-1 font-semibold text-gray-700 select-none"
          onClick={() => toggleFolder(db, folderKey)}
        >
          <span className="text-gray-500 w-3 h-3 flex-shrink-0 flex items-center justify-center transition-transform duration-200">
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="transform rotate-90"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            )}
          </span>
          {title} <span className="text-gray-400 font-normal text-[10px]">({items.length})</span>
        </div>
        
        {isExpanded && (
          <ul className="pl-3 mt-1 border-l border-gray-300 ml-2">
            {items.map(item => {
              if (folderKey === 'tables') {
                const tableKey = `${db}.${item}`;
                const tDetails = tableDetails[tableKey];
                const tExpanded = tDetails?.expanded;
                
                return (
                  <li key={item} className="mb-1">
                    <div 
                      className="text-xs py-1 px-1 cursor-pointer hover:bg-gray-200 hover:text-blue-700 rounded flex items-center gap-2 text-gray-700"
                      onClick={() => toggleTable(db, item)}
                      onDoubleClick={(e) => { e.stopPropagation(); handleObjectDoubleClick(db, folderKey, item); }}
                      title="Clic para expandir, Doble clic para SELECT * LIMIT 100"
                    >
                      <span className="text-gray-500 w-3 h-3 flex-shrink-0 flex items-center justify-center transition-transform duration-200">
                        {tExpanded ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="transform rotate-90"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        )}
                      </span>
                      <span className="text-gray-400 w-3 h-3 flex-shrink-0">{iconSvg}</span>
                      <span className="truncate">{item}</span>
                    </div>
                    
                    {tExpanded && tDetails?.columns && (
                      <div className="ml-4 border-l border-gray-300 pl-2 mt-1">
                        {/* Columns Subfolder */}
                        <div 
                          className="text-[11px] py-1 cursor-pointer hover:bg-gray-200 rounded flex items-center gap-1 text-gray-600"
                          onClick={() => toggleTableSubfolder(tableKey, 'expandedColumns')}
                        >
                          <span className="w-2 h-2 flex items-center justify-center text-gray-400">
                            {tDetails.expandedColumns ? '▼' : '▶'}
                          </span>
                          Columns <span className="text-gray-400">({tDetails.columns.length})</span>
                        </div>
                        {tDetails.expandedColumns && (
                          <ul className="pl-3">
                            {tDetails.columns.map((col, idx) => (
                              <li key={idx} className="text-[11px] py-0.5 flex items-center gap-1 text-gray-500 hover:text-gray-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" /><path d="M8 8h4v2H8V8z" /></svg>
                                <span>{col.Field}</span>
                                <span className="text-[9px] text-gray-400 ml-1 italic">{col.Type}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {/* Indexes Subfolder */}
                        <div 
                          className="text-[11px] py-1 mt-1 cursor-pointer hover:bg-gray-200 rounded flex items-center gap-1 text-gray-600"
                          onClick={() => toggleTableSubfolder(tableKey, 'expandedIndexes')}
                        >
                          <span className="w-2 h-2 flex items-center justify-center text-gray-400">
                            {tDetails.expandedIndexes ? '▼' : '▶'}
                          </span>
                          Indexes <span className="text-gray-400">({tDetails.indexes?.length || 0})</span>
                        </div>
                        {tDetails.expandedIndexes && tDetails.indexes && (
                          <ul className="pl-3">
                            {tDetails.indexes.map((idx, i) => (
                              <li key={i} className="text-[11px] py-0.5 flex items-center gap-1 text-gray-500 hover:text-gray-800" title={`Column: ${idx.Column_name}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" /></svg>
                                <span>{idx.Key_name}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                )
              }
              
              // Renderizado normal para Views, Procedures, Functions, etc.
              return (
                <li 
                  key={item} 
                  className="text-xs py-1 px-1 cursor-pointer hover:bg-gray-200 hover:text-blue-700 rounded flex items-center gap-2 text-gray-600"
                  onDoubleClick={() => handleObjectDoubleClick(db, folderKey, item)}
                  title={`Doble clic para ver ${folderKey === 'views' ? 'datos' : 'definición'}`}
                >
                  <span className="text-gray-400 w-3 h-3 flex-shrink-0">{iconSvg}</span>
                  <span className="truncate">{item}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
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
                <span className="text-gray-500 w-4 h-4 flex-shrink-0 flex items-center justify-center">
                  {expandedDb === db ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm2 2a1 1 0 011-1h10a1 1 0 011 1v2H4V8z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                  )}
                </span>
                {db}
              </div>
              
              {expandedDb === db && dbObjects[db] && (
                <div className="mb-2">
                  <RenderFolder db={db} folderKey="tables" title="Tables" items={dbObjects[db].tables} iconSvg={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" /></svg>
                  } />
                  
                  <RenderFolder db={db} folderKey="views" title="Views" items={dbObjects[db].views} iconSvg={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                  } />
                  
                  <RenderFolder db={db} folderKey="procedures" title="Procedures" items={dbObjects[db].procedures} iconSvg={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                  } />
                  
                  <RenderFolder db={db} folderKey="functions" title="Functions" items={dbObjects[db].functions} iconSvg={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  } />
                  
                  <RenderFolder db={db} folderKey="triggers" title="Triggers" items={dbObjects[db].triggers} iconSvg={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" /></svg>
                  } />
                  
                  <RenderFolder db={db} folderKey="events" title="Events" items={dbObjects[db].events} iconSvg={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                  } />
                </div>
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
          
          <button 
            onClick={onDisconnect}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm flex items-center gap-2"
            title="Desconectar y volver a la pantalla de conexiones"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Desconectar
          </button>
        </div>

        <div className="flex-1 min-h-0 relative">
          <PanelGroup direction="vertical" style={{ height: '100%', width: '100%' }}>
            <Panel defaultSize={67} minSize={20} className="flex flex-col min-h-0">
              <SqlEditor ref={editorRef} onExecute={handleExecuteQuery} />
            </Panel>
            <PanelResizeHandle className="h-2 flex-shrink-0 flex items-center justify-center bg-gray-200 hover:bg-blue-300 active:bg-blue-500 cursor-row-resize transition-colors w-full z-10">
              <div className="w-8 h-1 bg-gray-400 rounded-full" />
            </PanelResizeHandle>
            <Panel defaultSize={33} minSize={10} className="flex flex-col min-h-0">
              <ResultsGrid results={queryResults} error={queryError} />
            </Panel>
          </PanelGroup>
        </div>
      </main>
    </div>
  )
}

export default Dashboard