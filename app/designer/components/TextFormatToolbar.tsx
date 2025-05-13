'use client';

import { useEffect, useState, useRef } from 'react';
import { Popover, Portal } from '@headlessui/react';
import {
  BoldIcon,
  ItalicIcon,
  ChevronDownIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface TextFormatToolbarProps {
  selectedObject: any;
  onUpdateFormat: (updates: any) => void;
  position: { top: number; left: number } | null;
}

const fonts = [
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Playfair Display', value: 'Playfair Display' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Lato', value: 'Lato' },
];

export default function TextFormatToolbar({
  selectedObject,
  onUpdateFormat,
  position
}: TextFormatToolbarProps) {
  const [fontSize, setFontSize] = useState(20);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [fontWeight, setFontWeight] = useState(400);
  const [selectedFont, setSelectedFont] = useState(fonts[0]);
  const popoverButtonRef = useRef<HTMLButtonElement>(null);
  const [popoverDirection, setPopoverDirection] = useState<'down' | 'up'>('down');

  useEffect(() => {
    if (selectedObject) {
      setFontSize(selectedObject.fontSize || 20);
      setLetterSpacing(selectedObject.charSpacing || 0);
      setFontWeight(selectedObject.fontWeight === 'bold' ? 700 : selectedObject.fontWeight || 400);
      setSelectedFont(fonts.find(f => f.value === selectedObject.fontFamily) || fonts[0]);
    }
  }, [selectedObject]);

  if (!position) return null;

  const handleFontChange = (font: typeof fonts[0]) => {
    setSelectedFont(font);
    onUpdateFormat({ fontFamily: font.value });
  };

  // Auto-position popover up if not enough space below
  const handlePopoverOpen = () => {
    if (popoverButtonRef.current) {
      const rect = popoverButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Assume popover height ~220px
      if (spaceBelow < 220 && spaceAbove > spaceBelow) {
        setPopoverDirection('up');
      } else {
        setPopoverDirection('down');
      }
    }
  };

  const handleFontSize = (delta: number) => {
    const newSize = fontSize + delta;
    setFontSize(newSize);
    onUpdateFormat({ fontSize: newSize });
  };

  const handleLetterSpacing = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpacing = parseInt(event.target.value);
    setLetterSpacing(newSpacing);
    onUpdateFormat({ charSpacing: newSpacing });
  };

  const handleFontWeight = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newWeight = parseInt(event.target.value);
    setFontWeight(newWeight);
    onUpdateFormat({ fontWeight: newWeight });
  };

  const handleTextCase = (textCase: 'upper' | 'lower' | 'normal') => {
    if (!selectedObject || !selectedObject.text) return;
    
    let newText = selectedObject.text;
    switch (textCase) {
      case 'upper':
        newText = selectedObject.text.toUpperCase();
        break;
      case 'lower':
        newText = selectedObject.text.toLowerCase();
        break;
      case 'normal':
        // Preserve current case but reset text-transform
        break;
    }
    
    onUpdateFormat({ 
      text: newText,
      textTransform: textCase === 'normal' ? 'none' : textCase
    });
  };

  return (
    <div 
      className="fixed pointer-events-auto bg-white shadow-xl rounded-lg px-4 py-2 flex items-center gap-2 select-none"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translate(-50%, 0)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.06)',
        minWidth: '600px',
        border: '1px solid #e5e7eb',
        zIndex: 9999,
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)'
      }}
    >
      {/* Font Family Selector - Popover with auto-positioning */}
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button
              ref={popoverButtonRef}
              className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100"
              onClick={handlePopoverOpen}
            >
              <span className="text-sm" style={{ fontFamily: selectedFont.value }}>{selectedFont.name}</span>
              <ChevronDownIcon className="w-4 h-4" />
            </Popover.Button>
            <Portal>
              <Popover.Panel
                className={`w-48 bg-white rounded-md shadow-lg ${popoverDirection === 'up' ? 'bottom-full mb-2' : 'mt-2'}`}
                style={{ maxHeight: 220, overflowY: 'auto', zIndex: 99999, position: 'absolute' }}
              >
                <div className="py-1">
                  {fonts.map((font) => (
                    <button
                      key={font.value}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${selectedFont.value === font.value ? 'bg-blue-100 font-bold' : ''}`}
                      style={{ fontFamily: font.value }}
                      onClick={() => handleFontChange(font)}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </Popover.Panel>
            </Portal>
          </>
        )}
      </Popover>

      {/* Font Size Controls */}
      <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
        <button
          onClick={() => handleFontSize(-1)}
          className="p-1 rounded hover:bg-gray-100"
        >
          <MinusIcon className="w-4 h-4" />
        </button>
        <span className="text-sm w-8 text-center">{fontSize}</span>
        <button
          onClick={() => handleFontSize(1)}
          className="p-1 rounded hover:bg-gray-100"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Style Controls */}
      <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
        <button
          onClick={() => onUpdateFormat({ fontWeight: selectedObject.fontWeight === 'bold' ? 'normal' : 'bold' })}
          className={`p-1 rounded hover:bg-gray-100 ${selectedObject.fontWeight === 'bold' ? 'bg-gray-200' : ''}`}
        >
          <BoldIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onUpdateFormat({ fontStyle: selectedObject.fontStyle === 'italic' ? 'normal' : 'italic' })}
          className={`p-1 rounded hover:bg-gray-100 ${selectedObject.fontStyle === 'italic' ? 'bg-gray-200' : ''}`}
        >
          <ItalicIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Font Weight Control */}
      <div className="flex items-center gap-3 border-l border-gray-200 pl-2">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">Weight</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="100"
              max="900"
              step="100"
              value={fontWeight}
              onChange={handleFontWeight}
              className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs w-8">{fontWeight}</span>
          </div>
        </div>
      </div>

      {/* Text Case Controls */}
      <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
        <button
          onClick={() => handleTextCase('upper')}
          className={`p-1 rounded hover:bg-gray-100 ${selectedObject.textTransform === 'upper' ? 'bg-gray-200' : ''}`}
          title="UPPERCASE"
        >
          <span className="text-sm font-bold">AA</span>
        </button>
        <button
          onClick={() => handleTextCase('lower')}
          className={`p-1 rounded hover:bg-gray-100 ${selectedObject.textTransform === 'lower' ? 'bg-gray-200' : ''}`}
          title="lowercase"
        >
          <span className="text-sm font-bold">aa</span>
        </button>
        <button
          onClick={() => handleTextCase('normal')}
          className={`p-1 rounded hover:bg-gray-100 ${selectedObject.textTransform === 'none' ? 'bg-gray-200' : ''}`}
          title="Normal Case"
        >
          <span className="text-sm font-bold">Aa</span>
        </button>
      </div>

      {/* Alignment Controls */}
      <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
        <button
          onClick={() => onUpdateFormat({ textAlign: 'left' })}
          className={`p-1 rounded hover:bg-gray-100 ${selectedObject.textAlign === 'left' ? 'bg-gray-200' : ''}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h12" />
          </svg>
        </button>
        <button
          onClick={() => onUpdateFormat({ textAlign: 'center' })}
          className={`p-1 rounded hover:bg-gray-100 ${selectedObject.textAlign === 'center' ? 'bg-gray-200' : ''}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M6 18h12" />
          </svg>
        </button>
        <button
          onClick={() => onUpdateFormat({ textAlign: 'right' })}
          className={`p-1 rounded hover:bg-gray-100 ${selectedObject.textAlign === 'right' ? 'bg-gray-200' : ''}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M8 18h12" />
          </svg>
        </button>
      </div>

      {/* Letter Spacing Control */}
      <div className="flex items-center gap-3 border-l border-gray-200 pl-2">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">Letter Spacing</span>
          <input
            type="range"
            min="-50"
            max="500"
            value={letterSpacing}
            onChange={handleLetterSpacing}
            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
} 