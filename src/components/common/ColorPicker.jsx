import React, { useState } from 'react';

const ColorPicker = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const presetColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000',
    '#FF4500', '#DA70D6', '#98FB98', '#F0E68C', '#DDA0DD'
  ];

  const handleColorChange = (newColor) => {
    onChange(newColor);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div
        className="w-full h-10 border border-gray-300 rounded-md cursor-pointer flex items-center px-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className="w-6 h-6 rounded border border-gray-300 mr-2"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-mono">{color}</span>
        <svg
          className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-3">
            <div className="grid grid-cols-5 gap-2 mb-3">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handleColorChange(presetColor)}
                />
              ))}
            </div>
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-full h-8 border border-gray-300 rounded cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
