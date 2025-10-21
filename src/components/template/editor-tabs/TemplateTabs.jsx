import React, { useState, useEffect } from 'react';
import { FiEdit, FiEye, FiCode, FiSettings } from 'react-icons/fi';
import EditTab from './EditTab';
import PreviewTab from './PreviewTab';
import CodeTab from './CodeTab';
import SettingsTab from './SettingsTab';

console.log('TemplateTabs component loaded');

const tabs = [
  { id: 'edit', label: 'Edit', icon: FiEdit, component: EditTab },
  { id: 'preview', label: 'Preview', icon: FiEye, component: PreviewTab },
  { id: 'code', label: 'Code', icon: FiCode, component: CodeTab },
  { id: 'settings', label: 'Settings', icon: FiSettings, component: SettingsTab },
];

const TemplateTabs = ({ template, onTemplateChange }) => {
  console.log('TemplateTabs render with template:', template);
  const [activeTab, setActiveTab] = useState('edit');
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;
  
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
    console.log('Active component:', ActiveComponent);
  }, [activeTab, ActiveComponent]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Debug Info */}
      <div className="p-2 bg-blue-50 text-blue-800 text-xs">
        Active Tab: {activeTab} | Tabs: {tabs.map(t => t.id).join(', ')}
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white px-4">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
              `}
            >
              <tab.icon className="mr-2 h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {ActiveComponent && (
          <ActiveComponent
            template={template}
            onTemplateChange={onTemplateChange}
          />
        )}
      </div>
    </div>
  );
};

export default TemplateTabs;
