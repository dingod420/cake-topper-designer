import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { templateCategories } from '../data/templateCategories';
import { Tab, Popover } from '@headlessui/react';
import {
  Squares2X2Icon,
  PencilIcon,
  RectangleGroupIcon,
  PhotoIcon,
  BoldIcon,
  ItalicIcon,
  ChevronDownIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import ElementsFolderBrowser from './ElementsFolderBrowser';

// Custom shape components
const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 4.248C8.852-1.154 0 .423 0 7.192 0 11.853 5.571 16.619 12 23c6.43-6.381 12-11.147 12-15.808C24 .4 15.125-1.114 12 4.248z" 
      fill="currentColor"
    />
  </svg>
);

const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 0l3.7 7.5L24 8.7l-6 5.8 1.4 8.3L12 19l-7.4 3.8 1.4-8.3-6-5.8 8.3-1.2z" 
      fill="currentColor"
    />
  </svg>
);

const CircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="11" fill="currentColor" />
  </svg>
);

const SquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="1" y="1" width="22" height="22" fill="currentColor" />
  </svg>
);

const RectangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="1" y="6" width="22" height="12" fill="currentColor" />
  </svg>
);

const ArchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M2 20C2 20 4 8 12 8s10 12 10 12H2z" fill="currentColor" />
  </svg>
);

const OvalIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <ellipse cx="12" cy="12" rx="11" ry="7" fill="currentColor" />
  </svg>
);

const DiamondIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 1L23 12L12 23L1 12L12 1z" fill="currentColor" />
  </svg>
);

type SidebarTab = 'templates' | 'elements';

interface DesignElement {
  id: string;
  type: string;
  x: number;
  y: number;
  svg?: string;
  text?: string;
  angle?: number;
  scale?: number;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: string;
}

interface TextElement {
  id: string;
  name: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  textTransform: string;
  textAlign: 'left' | 'center' | 'right';
  charSpacing: number;
}

interface SidebarProps {
  onRequestAddElement: (type: 'shape' | 'text', shape?: any) => void;
  selectedTextObject?: any;
  onSidebarTextUpdate?: (updates: any) => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const defaultShapes = [
  {
    id: 'heart',
    name: 'Heart',
    icon: HeartIcon,
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4.248C8.852-1.154 0 .423 0 7.192 0 11.853 5.571 16.619 12 23c6.43-6.381 12-11.147 12-15.808C24 .4 15.125-1.114 12 4.248z" 
        fill="black"
        stroke="none"
      />
    </svg>`
  },
  {
    id: 'star',
    name: 'Star',
    icon: StarIcon,
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0l3.7 7.5L24 8.7l-6 5.8 1.4 8.3L12 19l-7.4 3.8 1.4-8.3-6-5.8 8.3-1.2z" 
        fill="black"
        stroke="none"
      />
    </svg>`
  },
  {
    id: 'circle',
    name: 'Circle',
    icon: CircleIcon,
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="black" stroke="none" />
    </svg>`
  },
  {
    id: 'square',
    name: 'Square',
    icon: SquareIcon,
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="22" height="22" fill="black" stroke="none" />
    </svg>`
  },
  {
    id: 'rectangle',
    name: 'Rectangle',
    icon: RectangleIcon,
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="6" width="22" height="12" fill="black" stroke="none" />
    </svg>`
  },
  {
    id: 'arch',
    name: 'Arch',
    icon: ArchIcon,
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 20C2 20 4 8 12 8s10 12 10 12H2z" fill="black" stroke="none" />
    </svg>`
  },
  {
    id: 'oval',
    name: 'Oval',
    icon: OvalIcon,
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="12" rx="11" ry="7" fill="black" stroke="none" />
    </svg>`
  },
  {
    id: 'diamond',
    name: 'Diamond',
    icon: DiamondIcon,
    svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 1L23 12L12 23L1 12L12 1z" fill="black" stroke="none" />
    </svg>`
  }
];

const fonts = [
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Playfair Display', value: 'Playfair Display' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Lato', value: 'Lato' },
];

export default function Sidebar({ onRequestAddElement, selectedTextObject, onSidebarTextUpdate }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('templates');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDesignTab, setSelectedDesignTab] = useState(0);

  // Auto-switch to Design tab and Text sub-tab when text is selected
  useEffect(() => {
    if (selectedTextObject) {
      setActiveTab('elements');
      setSelectedDesignTab(2); // Text tab index
    }
  }, [selectedTextObject]);

  // Text style state for sidebar
  const [sidebarFont, setSidebarFont] = useState(fonts[0]);
  const [sidebarFontSize, setSidebarFontSize] = useState(20);
  const [sidebarFontWeight, setSidebarFontWeight] = useState(400);
  const [sidebarFontStyle, setSidebarFontStyle] = useState<'normal' | 'italic'>('normal');
  const [sidebarTextCase, setSidebarTextCase] = useState<'normal' | 'upper' | 'lower'>('normal');
  const [sidebarTextAlign, setSidebarTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [sidebarLetterSpacing, setSidebarLetterSpacing] = useState(0);
  const [sidebarPreviewText, setSidebarPreviewText] = useState('Your Text');

  // Only update sidebarCurveRadius when selectedTextObject changes
  useEffect(() => {
    if (selectedTextObject) {
      setSidebarFont(fonts.find(f => f.value === selectedTextObject.fontFamily) || fonts[0]);
      setSidebarFontSize(selectedTextObject.fontSize || 20);
      setSidebarFontWeight(selectedTextObject.fontWeight || 400);
      setSidebarFontStyle(selectedTextObject.fontStyle || 'normal');
      setSidebarTextCase(selectedTextObject.textTransform === 'uppercase' ? 'upper' : selectedTextObject.textTransform === 'lowercase' ? 'lower' : 'normal');
      setSidebarLetterSpacing(selectedTextObject.charSpacing || 0);
      setSidebarPreviewText(selectedTextObject.text || '');
    } else {
      setSidebarFont(fonts[0]);
      setSidebarFontSize(20);
      setSidebarFontWeight(400);
      setSidebarFontStyle('normal');
      setSidebarTextCase('normal');
      setSidebarLetterSpacing(0);
      setSidebarPreviewText('Your Text');
    }
  }, [selectedTextObject]);

  // When a control is changed and a text object is selected, update the canvas live
  function updateTextFormat(updates: any) {
    console.log('[Sidebar] updateTextFormat called', { updates, selectedTextObject });
    if ('fontFamily' in updates) setSidebarFont(fonts.find(f => f.value === updates.fontFamily) || fonts[0]);
    if ('fontSize' in updates) setSidebarFontSize(updates.fontSize);
    if ('fontWeight' in updates) setSidebarFontWeight(updates.fontWeight);
    if ('fontStyle' in updates) setSidebarFontStyle(updates.fontStyle);
    if ('textTransform' in updates) setSidebarTextCase(updates.textTransform);
    if ('charSpacing' in updates) setSidebarLetterSpacing(updates.charSpacing);
    if ('text' in updates) setSidebarPreviewText(updates.text);

    // Apply textTransform live to the text property
    if ('textTransform' in updates && selectedTextObject) {
      let newText = selectedTextObject.text || '';
      if (updates.textTransform === 'upper') {
        newText = newText.toUpperCase();
      } else if (updates.textTransform === 'lower') {
        newText = newText.toLowerCase();
      }
      updates.text = newText;
      setSidebarPreviewText(newText);
    }

    if (onSidebarTextUpdate && selectedTextObject) {
      onSidebarTextUpdate(updates);
    }
  }

  // Helper functions for text case
  function getPreviewText(text: string, textCase: 'normal' | 'upper' | 'lower') {
    if (textCase === 'upper') return text.toUpperCase();
    if (textCase === 'lower') return text.toLowerCase();
    return text;
  }
  function getTextTransform(textCase: 'normal' | 'upper' | 'lower') {
    if (textCase === 'upper') return 'uppercase';
    if (textCase === 'lower') return 'lowercase';
    return 'none';
  }

  // Add text with current styles
  function handleAddTextWithSidebarStyles() {
    const textElement: TextElement = {
      id: `text-${Date.now()}`,
      name: sidebarPreviewText,
      text: getPreviewText(sidebarPreviewText, sidebarTextCase),
      fontFamily: sidebarFont.value,
      fontSize: sidebarFontSize,
      fontWeight: sidebarFontWeight,
      fontStyle: sidebarFontStyle,
      textTransform: getTextTransform(sidebarTextCase),
      textAlign: sidebarTextAlign,
      charSpacing: sidebarLetterSpacing,
    };
    onRequestAddElement('text', textElement);
  }

  const handleTabClick = (tab: SidebarTab) => {
    setActiveTab(tab);
    setSelectedCategory(null); // Reset selected category when switching tabs
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleAddShape = (shape: typeof defaultShapes[0] | { id: string; name: string; svg: string; icon?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element }) => {
    onRequestAddElement('shape', shape);
  };

  // New: Add SVG element to canvas from folder browser
  const handleAddAnimalElement = async (element: { name: string; file: string }) => {
    const res = await fetch(`/assets/elements/${element.file}`);
    const svgText = await res.text();
    onRequestAddElement('shape', { id: `element-${Date.now()}`, name: element.name, svg: svgText });
  };

  return (
    <div className="flex h-full">
      {/* Main Sidebar */}
      <div className="w-20 bg-white border-r flex flex-col items-center py-4">
        <button
          onClick={() => handleTabClick('templates')}
          className={`w-16 h-16 mb-2 rounded-lg flex flex-col items-center justify-center ${
            activeTab === 'templates' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'
          }`}
        >
          <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
            <line x1="3" y1="9" x2="21" y2="9" strokeWidth="2"/>
            <line x1="9" y1="21" x2="9" y2="9" strokeWidth="2"/>
          </svg>
          <span className="text-xs">Templates</span>
        </button>

        <button
          onClick={() => handleTabClick('elements')}
          className={`w-16 h-16 mb-2 rounded-lg flex flex-col items-center justify-center ${
            activeTab === 'elements' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'
          }`}
        >
          <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="9" strokeWidth="2"/>
            <path d="M12 3v18M3 12h18" strokeWidth="2"/>
          </svg>
          <span className="text-xs">Design</span>
        </button>
      </div>

      {/* Sub-Sidebar (always visible) */}
      <div className="w-[300px] bg-white border-r overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">
              {activeTab === 'templates' && 'Templates'}
              {activeTab === 'elements' && 'Design'}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto relative">
            <AnimatePresence mode="wait">
              {activeTab === 'templates' && (
                <motion.div
                  key="templates"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <div className="p-2">
                    {templateCategories.map((category) => (
                      <div key={category.id} className="mb-2">
                        <button
                          onClick={() => handleCategoryClick(category.id)}
                          className="w-full p-3 flex items-center justify-between rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center">
                            <span className="text-xl mr-3">{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                          <ChevronRightIcon
                            className={`w-5 h-5 transform transition-transform ${
                              selectedCategory === category.id ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {selectedCategory === category.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              {category.subcategories.map((subcat) => (
                                <button
                                  key={subcat.id}
                                  className="w-full p-2 pl-12 text-left hover:bg-gray-50 text-sm"
                                >
                                  <div>{subcat.name}</div>
                                  {subcat.description && (
                                    <div className="text-xs text-gray-500">{subcat.description}</div>
                                  )}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              {activeTab === 'elements' && (
                <motion.div
                  key="elements"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <div className="p-4">
                    <Tab.Group selectedIndex={selectedDesignTab} onChange={setSelectedDesignTab}>
                      <Tab.List className="flex space-x-2 mb-4">
                        <Tab className={({ selected }) => selected ? 'px-4 py-2 rounded bg-blue-100 font-bold' : 'px-4 py-2 rounded hover:bg-gray-100'}>Elements</Tab>
                        <Tab className={({ selected }) => selected ? 'px-4 py-2 rounded bg-blue-100 font-bold' : 'px-4 py-2 rounded hover:bg-gray-100'}>Shapes</Tab>
                        <Tab className={({ selected }) => selected ? 'px-4 py-2 rounded bg-blue-100 font-bold' : 'px-4 py-2 rounded hover:bg-gray-100'}>Text</Tab>
                      </Tab.List>
                      <Tab.Panels>
                        <Tab.Panel>
                          <ElementsFolderBrowser onSelectSVG={handleAddAnimalElement} />
                        </Tab.Panel>
                        <Tab.Panel>
                          <div className="grid grid-cols-2 gap-2">
                            {defaultShapes.map((shape) => (
                              <button
                                key={shape.id}
                                onClick={() => handleAddShape(shape)}
                                className="aspect-square bg-white rounded-lg p-4 hover:bg-gray-50"
                              >
                                {shape.icon ? <shape.icon className="w-full h-full text-black" /> : null}
                              </button>
                            ))}
                          </div>
                        </Tab.Panel>
                        <Tab.Panel>
                          <div className="flex flex-col gap-4">
                            <div className="mb-2 pb-2 border-b">
                              <label htmlFor="sidebar-text-input" className="text-xs font-medium text-gray-700 mb-1 block">Enter your text</label>
                              <input
                                id="sidebar-text-input"
                                type="text"
                                value={sidebarPreviewText}
                                onChange={e => setSidebarPreviewText(e.target.value)}
                                className="w-full px-3 py-2 border rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-200"
                                placeholder="Preview text..."
                              />
                            </div>
                            <div className="flex flex-col gap-3">
                              <div className="flex gap-2 items-center">
                                <Popover className="relative flex-1">
                                  <Popover.Button className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100 w-full justify-between border">
                                    <span className="text-sm" style={{ fontFamily: sidebarFont.value }}>{sidebarFont.name}</span>
                                    <ChevronDownIcon className="w-4 h-4" />
                                  </Popover.Button>
                                  <Popover.Panel className="absolute z-10 w-48 mt-2 bg-white rounded-md shadow-lg">
                                    <div className="py-1">
                                      {fonts.map((font) => (
                                        <button
                                          key={font.value}
                                          className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                                          style={{ fontFamily: font.value }}
                                          onClick={() => updateTextFormat({ fontFamily: font.value })}
                                        >
                                          {font.name}
                                        </button>
                                      ))}
                                    </div>
                                  </Popover.Panel>
                                </Popover>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateTextFormat({ fontSize: sidebarFontSize - 1 })}
                                    className="p-1 rounded hover:bg-gray-100 border"
                                    title="Decrease font size"
                                  >
                                    <MinusIcon className="w-4 h-4" />
                                  </button>
                                  <span className="text-sm w-8 text-center">{sidebarFontSize}</span>
                                  <button
                                    onClick={() => updateTextFormat({ fontSize: sidebarFontSize + 1 })}
                                    className="p-1 rounded hover:bg-gray-100 border"
                                    title="Increase font size"
                                  >
                                    <PlusIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateTextFormat({ fontWeight: sidebarFontWeight === 700 ? 400 : 700 })}
                                  className={`p-1 rounded hover:bg-gray-100 border ${sidebarFontWeight === 700 ? 'bg-gray-200' : ''}`}
                                  title="Bold"
                                >
                                  <BoldIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => updateTextFormat({ fontStyle: sidebarFontStyle === 'italic' ? 'normal' : 'italic' })}
                                  className={`p-1 rounded hover:bg-gray-100 border ${sidebarFontStyle === 'italic' ? 'bg-gray-200' : ''}`}
                                  title="Italic"
                                >
                                  <ItalicIcon className="w-4 h-4" />
                                </button>
                                <div className="flex-1 flex gap-1 justify-end">
                                  <button
                                    onClick={() => updateTextFormat({ textTransform: 'upper' })}
                                    className={`p-1 rounded hover:bg-gray-100 border ${sidebarTextCase === 'upper' ? 'bg-gray-200' : ''}`}
                                    title="UPPERCASE"
                                  >
                                    <span className="text-sm font-bold">AA</span>
                                  </button>
                                  <button
                                    onClick={() => updateTextFormat({ textTransform: 'lower' })}
                                    className={`p-1 rounded hover:bg-gray-100 border ${sidebarTextCase === 'lower' ? 'bg-gray-200' : ''}`}
                                    title="lowercase"
                                  >
                                    <span className="text-sm font-bold">aa</span>
                                  </button>
                                  <button
                                    onClick={() => updateTextFormat({ textTransform: 'normal' })}
                                    className={`p-1 rounded hover:bg-gray-100 border ${sidebarTextCase === 'normal' ? 'bg-gray-200' : ''}`}
                                    title="Normal Case"
                                  >
                                    <span className="text-sm font-bold">Aa</span>
                                  </button>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500">Letter Spacing</span>
                                <input
                                  type="range"
                                  min="-50"
                                  max="500"
                                  value={sidebarLetterSpacing}
                                  onChange={e => updateTextFormat({ charSpacing: parseInt(e.target.value) })}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-xs">{sidebarLetterSpacing}</span>
                              </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-end mt-4">
                              <div
                                className="w-full p-3 rounded border bg-gray-50 text-center mb-4"
                                style={{
                                  fontFamily: sidebarFont.value,
                                  fontSize: sidebarFontSize,
                                  fontWeight: sidebarFontWeight,
                                  fontStyle: sidebarFontStyle,
                                  textTransform: getTextTransform(sidebarTextCase),
                                  textAlign: sidebarTextAlign,
                                  letterSpacing: `${sidebarLetterSpacing / 10}px`,
                                  minHeight: '2.5em',
                                  overflowWrap: 'break-word',
                                  wordBreak: 'break-word',
                                }}
                              >
                                {getPreviewText(sidebarPreviewText, sidebarTextCase)}
                              </div>
                              <button
                                onClick={handleAddTextWithSidebarStyles}
                                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-center text-base shadow-sm mt-2"
                                style={{ marginTop: 'auto' }}
                              >
                                Add Your Text
                              </button>
                            </div>
                          </div>
                        </Tab.Panel>
                      </Tab.Panels>
                    </Tab.Group>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
} 