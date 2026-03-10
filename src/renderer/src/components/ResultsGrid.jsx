import React from 'react'

function ResultsGrid({ results, error }) {
  if (error) {
    return (
      <div className="p-4 text-red-700 bg-red-100 h-full overflow-auto font-mono text-sm">
        <p className="font-bold mb-2">Error:</p>
        <pre>{error}</pre>
      </div>
    )
  }

  if (!results) {
    return <p className="p-4 text-sm text-gray-500">Ejecuta una consulta para ver los resultados aquí.</p>
  }

  const { rows, fields } = results

  // Manejar sentencias que no devuelven filas (UPDATE, INSERT, etc.)
  if (!Array.isArray(rows)) {
    return (
      <div className="p-4 text-green-700 bg-green-100">
        <p>Consulta ejecutada con éxito.</p>
        {rows.affectedRows !== undefined && <p>Filas afectadas: {rows.affectedRows}</p>}
      </div>
    )
  }

  if (rows.length === 0) {
    return <p className="p-4 text-sm text-gray-500">La consulta se ejecutó correctamente y no devolvió filas.</p>
  }

  return (
    <div className="h-full w-full overflow-auto">
      <table className="min-w-full text-sm divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {fields.map((field) => (
              <th key={field} className="px-4 py-2 text-left font-semibold text-gray-600 tracking-wider">
                {field}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {fields.map((field, fieldIndex) => (
                <td key={`${rowIndex}-${fieldIndex}`} className="px-4 py-2 whitespace-nowrap">
                  {row[field] === null ? <i className="text-gray-400">NULL</i> : String(row[field])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ResultsGrid