import React, { useContext } from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeDebugger = () => {
  const { currentTemplate } = useTheme();
  
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-w-xs">
      <h3 className="font-bold mb-2 text-gray-800 dark:text-white">Theme Debugger</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center">
          <span className="w-24 text-gray-600 dark:text-gray-400">Template:</span>
          <span className="font-medium">{currentTemplate?.name}</span>
        </div>
        {currentTemplate?.styles && Object.entries(currentTemplate.styles).map(([key, value]) => (
          <div key={key} className="flex items-center">
            <span className="w-24 text-gray-600 dark:text-gray-400">{key}:</span>
            <div 
              className="w-6 h-6 rounded border border-gray-200 dark:border-gray-600 mr-2"
              style={{ backgroundColor: key.toLowerCase().includes('color') ? value : 'transparent' }}
            />
            <span className="font-mono text-xs">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeDebugger;
