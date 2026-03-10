import React from 'react'
import Editor from '@monaco-editor/react'

function SqlEditor() {
  function handleEditorChange(value, event) {
    // 'value' es el contenido actual del editor
    // Aquí es donde en el futuro enviaremos la consulta para ejecutarla
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="sql"
        defaultValue="-- Escribe tu consulta SQL aquí"
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false
        }}
      />
    </div>
  )
}

export default SqlEditor