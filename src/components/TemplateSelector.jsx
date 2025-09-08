import React, { useState, useEffect } from 'react';
import { TEMPLATES, DEFAULT_TEMPLATE } from '../data/templates';
import { FiCheck, FiLock } from 'react-icons/fi';

const TemplatePreview = ({ template, isSelected, onSelect, isPremiumUser = false }) => {
  const isLocked = template.isPremium && !isPremiumUser;
  
  const handleClick = (e) => {
    e.stopPropagation();
    if (isLocked) return;
    onSelect(template);
  };

  return (
    <div 
      className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-indigo-500 ring-offset-2' 
          : 'hover:shadow-lg hover:-translate-y-1'
      } ${isLocked ? 'opacity-75' : 'cursor-pointer'}`}
      onClick={handleClick}
    >
      {/* Template Preview */}
      <div className="relative h-48 bg-white" 
        style={{
          background: typeof template.styles.headerBg === 'string' && template.styles.headerBg.includes('gradient')
            ? template.styles.headerBg
            : `linear-gradient(135deg, ${template.styles.primaryColor}15 0%, ${template.styles.secondaryColor}15 100%)`,
          borderBottom: `1px solid ${template.styles.borderColor || '#e5e7eb'}`
        }}
      >
        {/* Header Bar */}
        <div className="h-10 flex items-center px-4" 
          style={{
            background: template.styles.headerBg,
            color: template.styles.headerText || '#ffffff'
          }}
        >
          <div className="flex space-x-1">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: template.styles.headerText ? `${template.styles.headerText}80` : 'rgba(255,255,255,0.7)' }}
              />
            ))}
          </div>
          <div className="ml-2 text-xs font-medium">
            {template.name}
          </div>
        </div>
        
        {/* Content Preview */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div 
                className="h-3 w-20 rounded-full mb-2" 
                style={{ backgroundColor: template.styles.primaryColor }}
              />
              <div 
                className="h-2 w-12 rounded-full" 
                style={{ 
                  backgroundColor: template.styles.primaryColor,
                  opacity: 0.7 
                }}
              />
            </div>
            <div 
              className="h-6 w-16 rounded"
              style={{ 
                backgroundColor: template.styles.secondaryColor,
                opacity: 0.8
              }}
            />
          </div>
          
          {/* Invoice Lines Preview */}
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div 
                  className="h-2 rounded-full" 
                  style={{ 
                    width: i === 1 ? '70%' : i === 2 ? '90%' : '60%',
                    backgroundColor: template.styles.primaryColor,
                    opacity: 0.5 + (i * 0.15)
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* Total Preview */}
          <div className="mt-4 pt-3 border-t border-dashed" 
            style={{ borderColor: template.styles.borderColor || '#e5e7eb' }}
          >
            <div className="flex justify-between">
              <div 
                className="h-3 w-16 rounded-full"
                style={{ backgroundColor: template.styles.primaryColor, opacity: 0.8 }}
              />
              <div 
                className="h-3 w-12 rounded-full"
                style={{ backgroundColor: template.styles.primaryColor }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Template Info */}
      <div className="p-4 bg-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900 flex items-center">
              {template.name}
              {template.isPremium && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                  Premium
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{template.description}</p>
          </div>
          
          {isSelected && (
            <div className="absolute top-2 right-2 bg-indigo-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center shadow-md">
              <FiCheck className="mr-1" size={14} /> Selected
            </div>
          )}
          
          {isLocked && (
            <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center flex-col">
              <div className="bg-white p-3 rounded-full shadow-lg mb-2">
                <FiLock className="text-amber-500" size={20} />
              </div>
              <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Upgrade to Pro
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TemplateSelector = ({ onTemplateSelect, currentTemplateId = 'default', isPremiumUser = false }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(
    TEMPLATES.find(t => t.id === currentTemplateId) || DEFAULT_TEMPLATE
  );

  // Update selected template when currentTemplateId changes
  useEffect(() => {
    const template = TEMPLATES.find(t => t.id === currentTemplateId) || DEFAULT_TEMPLATE;
    setSelectedTemplate(template);
  }, [currentTemplateId]);

  const handleTemplateSelect = (template) => {
    if (template.isPremium && !isPremiumUser) {
      // Handle premium template selection (could show upgrade modal or message)
      console.log('Premium template selected. Redirect to upgrade.');
      // You can add logic here to show an upgrade modal or redirect
      return;
    }
    console.log('Template selected in TemplateSelector:', template);
    setSelectedTemplate(template);
    onTemplateSelect(template);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Invoice Templates</h2>
        <p className="mt-2 text-gray-600">
          Choose a template that matches your style. Customize it later in the editor.
        </p>
        
        {/* Template Categories */}
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
          <button className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-full">
            All Templates
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            Free
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            Premium
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            Business
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            Creative
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {TEMPLATES.map((template) => (
          <div key={template.id} className="relative">
            <TemplatePreview
              template={template}
              isSelected={selectedTemplate.id === template.id}
              onSelect={handleTemplateSelect}
              isPremiumUser={isPremiumUser}
            />
            <div className="mt-3">
              <div className="flex flex-wrap gap-1.5">
                {template.tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${template.styles.primaryColor}15`,
                      color: template.styles.primaryColor
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {template.features.slice(0, 2).map((feature, idx) => (
                  <div key={idx} className="flex items-center py-0.5">
                    <FiCheck className="mr-1.5 text-green-500 flex-shrink-0" size={12} />
                    <span className="truncate">{feature}</span>
                  </div>
                ))}
                {template.features.length > 2 && (
                  <div className="text-xs text-indigo-600 mt-1 font-medium">
                    +{template.features.length - 2} more features
                  </div>
                )}
              </div>
              
              {template.isPremium && !isPremiumUser && (
                <button 
                  className="mt-3 w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle upgrade to premium
                    console.log('Upgrade to premium clicked');
                  }}
                >
                  <FiLock className="mr-1.5" size={14} />
                  Unlock Premium
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800">Preview</h3>
        <p className="mt-1 text-sm text-blue-700">
          Selected: <span className="font-medium">{selectedTemplate.name}</span>
        </p>
        <div className="mt-2 flex space-x-2">
          <span 
            className="inline-block h-4 w-4 rounded-full"
            style={{ backgroundColor: selectedTemplate.styles.primaryColor }}
          />
          <span 
            className="inline-block h-4 w-4 rounded-full"
            style={{ backgroundColor: selectedTemplate.styles.secondaryColor }}
          />
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
