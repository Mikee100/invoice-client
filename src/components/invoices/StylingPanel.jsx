import React from 'react';
import ColorPicker from '../common/ColorPicker';

const StylingPanel = ({ styles, onStyleChange }) => {
  const handleChange = (property, value) => {
    onStyleChange({
      ...styles,
      [property]: value
    });
  };

  const fontFamilies = [
    'Arial, sans-serif',
    'Helvetica, sans-serif',
    'Times New Roman, serif',
    'Georgia, serif',
    'Verdana, sans-serif',
    'Courier New, monospace'
  ];

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">🎨</span>
          Invoice Styling
        </h3>
        <p className="text-sm text-gray-600 mt-1">Customize your invoice appearance</p>
      </div>
      <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">

        {/* Colors Section */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Colors</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Color
            </label>
            <ColorPicker
              color={styles.primaryColor || '#4F46E5'}
              onChange={(color) => handleChange('primaryColor', color)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secondary Color
            </label>
            <ColorPicker
              color={styles.secondaryColor || '#6B7280'}
              onChange={(color) => handleChange('secondaryColor', color)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <ColorPicker
              color={styles.backgroundColor || '#FFFFFF'}
              onChange={(color) => handleChange('backgroundColor', color)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Border Color
            </label>
            <ColorPicker
              color={styles.borderColor || '#E5E7EB'}
              onChange={(color) => handleChange('borderColor', color)}
            />
          </div>
        </div>
      </div>

      {/* Typography Section */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Typography</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Family
            </label>
            <select
              value={styles.fontFamily || 'Arial, sans-serif'}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font}>
                  {font.split(',')[0]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size
            </label>
            <select
              value={styles.fontSize || '16px'}
              onChange={(e) => handleChange('fontSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {fontSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Line Height
            </label>
            <input
              type="range"
              min="1"
              max="2"
              step="0.1"
              value={parseFloat(styles.lineHeight) || 1.5}
              onChange={(e) => handleChange('lineHeight', e.target.value)}
              className="w-full"
            />
            <span className="text-sm text-gray-500">{styles.lineHeight || '1.5'}</span>
          </div>
        </div>
      </div>

      {/* Spacing Section */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Spacing</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Padding (px)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={styles.padding || 20}
              onChange={(e) => handleChange('padding', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Margin (px)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={styles.margin || 10}
              onChange={(e) => handleChange('margin', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Border Radius (px)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={styles.borderRadius || 4}
              onChange={(e) => handleChange('borderRadius', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Layout Section */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Layout</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Header Background
            </label>
            <ColorPicker
              color={styles.headerBg || '#F9FAFB'}
              onChange={(color) => handleChange('headerBg', color)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Footer Background
            </label>
            <ColorPicker
              color={styles.footerBg || '#F9FAFB'}
              onChange={(color) => handleChange('footerBg', color)}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default StylingPanel;
