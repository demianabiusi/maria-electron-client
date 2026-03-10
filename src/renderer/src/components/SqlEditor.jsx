import React, { useRef, useImperativeHandle, forwardRef } from 'react'
import Editor from '@monaco-editor/react'

const SqlEditor = forwardRef(({ onExecute }, ref) => {
  const editorRef = useRef(null)

  // Exponer el método `getValue` al componente padre a través del ref
  useImperativeHandle(ref, () => ({
    getValue: () => {
      return editorRef.current ? editorRef.current.getValue() : ''
    }
  }))

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor
    // Añadir atajo de teclado para ejecutar la consulta (Ctrl+Enter o F5)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, onExecute)
    editor.addCommand(monaco.KeyCode.F5, onExecute)
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="sql"
        defaultValue="-- Escribe tu consulta SQL aquí\n-- Presiona Ctrl+Enter o F5 para ejecutar"
        onMount={handleEditorDidMount}
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
})

export default SqlEditor