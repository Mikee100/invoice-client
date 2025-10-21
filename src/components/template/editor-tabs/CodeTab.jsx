import React, { useState, useEffect } from 'react';
import { FiCode } from 'react-icons/fi';
import Editor from '@monaco-editor/react';

console.log('CodeTab component loaded');
console.log('Monaco Editor:', typeof Editor);

const CodeTab = ({ template, onTemplateChange }) => {
  console.log('CodeTab render with template:', template);
  const [code, setCode] = useState(JSON.stringify(template.content, null, 2));
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setCode(JSON.stringify(template.content, null, 2));
  }, [template.content]);

  const handleCodeChange = (value) => {
    setCode(value);
    try {
      const parsed = JSON.parse(value);
      onTemplateChange({ ...template, content: parsed });
      setIsValid(true);
    } catch (e) {
      setIsValid(false);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FiCode className="mr-2" />
          <h3 className="text-lg font-medium">Code Editor</h3>
        </div>
        {!isValid && (
          <span className="text-red-500 text-sm">Invalid JSON</span>
        )}
      </div>
      
      <div className="flex-1 border rounded-md overflow-hidden">
        {typeof window !== 'undefined' ? (
          <Editor
            height="100%"
            defaultLanguage="json"
            value={code}
            onChange={handleCodeChange}
            onMount={(editor, monaco) => {
              console.log('Monaco Editor mounted', { editor, monaco });
            }}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        ) : (
          <div className="p-4 bg-yellow-50 text-yellow-800">
            Monaco Editor is loading...
          </div>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Edit the template content as JSON. Changes are automatically validated and applied.
      </div>
    </div>
  );
};

export default CodeTab;
