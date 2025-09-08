import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import TemplateSelector from '../components/TemplateSelector';
import { TEMPLATES } from '../data/templates';

const AppearanceSettings = () => {
  const { currentTemplate, applyTemplate, isDarkMode, toggleDarkMode } = useTheme();

  // Debug log to check current template
  useEffect(() => {
    console.log('Current template:', currentTemplate);
  }, [currentTemplate]);

  const handleTemplateSelect = (template) => {
    console.log('Selected template:', template);
    // Make sure we're using the full template object from TEMPLATES
    const selectedTemplate = TEMPLATES.find(t => t.id === template.id) || template;
    applyTemplate(selectedTemplate);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Customize the look and feel of your dashboard
        </p>
      </div>

      <div className="space-y-8">
        {/* Theme Mode Toggle */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Theme</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Switch between light and dark mode
              </p>
            </div>
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isDarkMode ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
              onClick={toggleDarkMode}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Template Selection */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Templates</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Choose a template that best fits your style. Changes will be applied immediately.
          </p>
          <TemplateSelector 
            onTemplateSelect={handleTemplateSelect} 
            currentTemplateId={currentTemplate.id}
          />
        </div>

        {/* Customization Options */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Custom Colors</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Coming soon: Advanced color customization for your selected template.
          </p>
          <div className="space-y-4 opacity-50 pointer-events-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center">
                  <div 
                    className="h-10 w-10 rounded-md mr-3 border border-gray-300"
                    style={{ backgroundColor: currentTemplate.styles.primaryColor }}
                  />
                  <input 
                    type="text" 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={currentTemplate.styles.primaryColor}
                    disabled
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Secondary Color
                </label>
                <div className="flex items-center">
                  <div 
                    className="h-10 w-10 rounded-md mr-3 border border-gray-300"
                    style={{ backgroundColor: currentTemplate.styles.secondaryColor }}
                  />
                  <input 
                    type="text" 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={currentTemplate.styles.secondaryColor}
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 opacity-50 cursor-not-allowed"
                disabled
              >
                Save Custom Colors
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
