import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_TEMPLATE, TEMPLATES } from '../data/templates';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTemplate, setCurrentTemplate] = useState(DEFAULT_TEMPLATE);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme) {
      try {
        const { template, darkMode } = JSON.parse(savedTheme);
        setCurrentTemplate(template);
        setIsDarkMode(!!darkMode);
      } catch (error) {
        console.error('Failed to parse saved theme:', error);
      }
    }
  }, []);

  // Apply template styles whenever currentTemplate changes
  useEffect(() => {
    if (currentTemplate?.styles) {
      console.log('Applying template styles:', currentTemplate);
      // Apply each style as a CSS variable
      Object.entries(currentTemplate.styles).forEach(([key, value]) => {
        const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        document.documentElement.style.setProperty(cssVar, value);
      });
      
      // Force a re-render of all components using these variables
      document.body.style.display = 'none';
      document.body.offsetHeight; // Trigger reflow
      document.body.style.display = '';
    }
  }, [currentTemplate]);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    if (currentTemplate) {
      const themeData = {
        template: currentTemplate,
        darkMode: isDarkMode,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('appTheme', JSON.stringify(themeData));
    }
  }, [currentTemplate, isDarkMode]);

  const applyTemplate = (template) => {
    console.log('Applying template:', template);
    if (!template?.id) {
      console.error('Invalid template provided to applyTemplate:', template);
      return;
    }
    
    // Find the full template object to ensure we have all styles
    const fullTemplate = TEMPLATES.find(t => t.id === template.id) || template;
    
    // Force update by creating a new object reference
    setCurrentTemplate({...fullTemplate});
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTemplate,
        isDarkMode,
        applyTemplate,
        toggleDarkMode,
      }}
    >
      <div 
        className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
        style={{
          '--primary': currentTemplate.styles.primaryColor,
          '--secondary': currentTemplate.styles.secondaryColor,
          '--background': currentTemplate.styles.backgroundColor,
          '--text': currentTemplate.styles.textColor,
          '--radius': currentTemplate.styles.borderRadius,
          '--font-sans': currentTemplate.styles.fontFamily,
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
