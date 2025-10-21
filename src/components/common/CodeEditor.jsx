import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({
  value = '',
  onChange = () => {},
  language = 'json',
  theme = 'vs-light',
  height = '100%',
  width = '100%',
  options = {},
  ...props
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleEditorChange = (value) => {
    onChange(value);
  };

  // Update editor value when value prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  const defaultOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    wordWrap: 'on',
    automaticLayout: true,
    tabSize: 2,
    ...options,
  };

  return (
    <div style={{ height, width }} {...props}>
      <Editor
        height={height}
        defaultLanguage={language}
        defaultValue={value}
        theme={theme}
        options={defaultOptions}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};

export default CodeEditor;
