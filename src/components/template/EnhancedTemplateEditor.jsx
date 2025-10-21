import React, { useState, useRef, useEffect } from 'react';
import Split from 'react-split';
import { FiEye, FiCode, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Editor from '@monaco-editor/react';
import TemplatePreview from './TemplatePreview';

const EnhancedTemplateEditor = ({ template, onTemplateChange }) => {
  const [activeTab, setActiveTab] = useState('split'); // 'split', 'preview', 'code'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorValue, setEditorValue] = useState(JSON.stringify(template.content, null, 2));
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  // Update editor value when template changes
  useEffect(() => {
    setEditorValue(JSON.stringify(template.content, null, 2));
  }, [template.content]);

  // Handle editor changes
  const handleEditorChange = (value) => {
    setEditorValue(value);
    try {
      const parsed = JSON.parse(value);
      onTemplateChange({
        ...template,
        content: parsed
      });
    } catch (e) {
      // Invalid JSON, don't update template
      console.error('Invalid JSON');
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    // Add shortcut for formatting document
    editor.addCommand(
      window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyS,
      () => {
        editor.getAction('editor.action.formatDocument').run();
        return false;
      }
    );
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Render editor
  const renderEditor = () => (
    <div className="h-full flex flex-col border rounded-md overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded-md ${activeTab === 'code' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('code')}
          >
            <FiCode className="inline mr-1" /> Code
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${activeTab === 'preview' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('preview')}
          >
            <FiEye className="inline mr-1" /> Preview
          </button>
        </div>
        <button
          onClick={toggleFullscreen}
          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {activeTab === 'code' && (
          <Editor
            height="100%"
            defaultLanguage="json"
            value={editorValue}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        )}
        {activeTab === 'preview' && (
          <div className="h-full overflow-auto p-4">
            <TemplatePreview template={template.content} />
          </div>
        )}
      </div>
    </div>
  );

  // Render split view
  const renderSplitView = () => (
    <Split
      className="flex h-full"
      sizes={[50, 50]}
      minSize={300}
      expandToMin={false}
      gutterSize={8}
      gutterAlign="center"
      snapOffset={30}
      dragInterval={1}
      direction="horizontal"
      cursor="col-resize"
    >
      <div className="h-full overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h3 className="text-sm font-medium text-gray-700">
              <FiCode className="inline mr-1" /> Code Editor
            </h3>
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={editorValue}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </div>
        </div>
      </div>
      <div className="h-full overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h3 className="text-sm font-medium text-gray-700">
              <FiEye className="inline mr-1" /> Live Preview
            </h3>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <TemplatePreview template={template.content} />
          </div>
        </div>
      </div>
    </Split>
  );

  return (
    <div 
      ref={containerRef}
      className={`h-[600px] bg-white rounded-lg shadow-sm border ${isFullscreen ? 'fixed inset-0 z-50 m-0' : 'mt-4'}`}
    >
      {activeTab === 'split' ? renderSplitView() : renderEditor()}
    </div>
  );
};

export default EnhancedTemplateEditor;
