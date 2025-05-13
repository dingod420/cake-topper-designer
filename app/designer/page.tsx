'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  MagnifyingGlassIcon, 
  ChevronDownIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  CloudArrowUpIcon,
  ShareIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import Sidebar from './components/Sidebar';
import InteractiveCanvas, { FabricScriptLoader } from './components/InteractiveCanvas';

interface DesignElement {
  id: string;
  type: string;
  x: number;
  y: number;
  svg?: string;
  text?: string;
  angle?: number;
  scale?: number;
}

export default function Designer() {
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [cakeImage, setCakeImage] = useState<HTMLImageElement | null>(null);
  const [imageSize] = useState({ width: 800, height: 600 });
  const [gridSize] = useState(48);
  const canvasRef = useRef<any>(null);
  const [selectedTextObject, setSelectedTextObject] = useState<any>(null);
  const [textUpdateRequest, setTextUpdateRequest] = useState<{ updates: any; ts: number } | null>(null);

  // Load cake image
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/cake.png';
    img.onload = () => {
      setCakeImage(img);
    };
  }, []);

  const handleRequestAddElement = (type: 'text' | 'shape', shape?: any) => {
    console.log('handleRequestAddElement called with:', { type, shape });
    console.log('canvasRef.current:', canvasRef.current);
    
    // Get the visible center of the canvas in canvas coordinates
    let x = 0;
    let y = 0;
    
    if (canvasRef.current) {
      console.log('Canvas instance found');
      const center = canvasRef.current.getCenter();
      console.log('Canvas center:', center);
      x = center.left;
      y = center.top;
      createAndAddElement(type, shape, x, y);
    } else {
      console.log('No canvas instance found, waiting for initialization');
      // Wait for canvas to be initialized
      const checkCanvas = setInterval(() => {
        if (canvasRef.current) {
          console.log('Canvas instance found after delay');
          const center = canvasRef.current.getCenter();
          x = center.left;
          y = center.top;
          console.log('Canvas center after delay:', center);
          
          // Create and add element after getting center
          createAndAddElement(type, shape, x, y);
          clearInterval(checkCanvas);
        }
      }, 100);

      // Clear interval after 5 seconds to prevent infinite waiting
      setTimeout(() => clearInterval(checkCanvas), 5000);
    }
  };

  const createAndAddElement = (type: 'text' | 'shape', shape: any, x: number, y: number) => {
    console.log('Creating element at coordinates:', { x, y });

    if (type === 'text') {
      let newElement;
      if (shape) {
        if (shape.type === 'bridgeText') {
          console.log('Adding bridgeText to elements', shape);
          // Preserve all properties for bridgeText
          newElement = { ...shape, x, y };
        } else {
          newElement = {
            id: shape.id || `text-${Date.now()}`,
            type: 'text',
            x,
            y,
            text: shape.text || 'Double click to edit',
            angle: 0,
            scale: 1,
            fontSize: shape.fontSize || 40,
            fontFamily: shape.fontFamily || 'Poppins',
            fontWeight: shape.fontWeight || 400,
            fontStyle: shape.fontStyle || 'normal',
            textTransform: shape.textTransform || 'none',
            textAlign: shape.textAlign || 'center',
            charSpacing: shape.charSpacing || 0,
            textBaseline: 'alphabetic',
          };
        }
      } else {
        newElement = {
          id: `text-${Date.now()}`,
          type: 'text',
          x,
          y,
          text: 'Double click to edit',
          angle: 0,
          scale: 1,
          fontSize: 40,
          fontFamily: 'Poppins',
          fontWeight: 400,
          fontStyle: 'normal',
          textTransform: 'none',
          textAlign: 'center',
          charSpacing: 0,
          textBaseline: 'alphabetic',
        };
      }
      console.log('Creating new text element:', newElement);
      setElements(prev => {
        console.log('Previous elements:', prev);
        const newElements = [...prev, newElement];
        console.log('New elements array:', newElements);
        return newElements;
      });
    } else if (type === 'shape' && shape) {
      const newElement = {
        id: `${shape.id}-${Date.now()}`,
        type: 'shape',
        x,
        y,
        svg: shape.svg.replace(/currentColor/g, 'black'),
        angle: 0,
        scale: 1
      };
      console.log('Creating new shape element:', newElement);
      setElements(prev => {
        console.log('Previous elements:', prev);
        const newElements = [...prev, newElement];
        console.log('New elements array:', newElements);
        return newElements;
      });
    }
  };

  const handleUpdateElement = (id: string, updates: Partial<DesignElement>) => {
    setElements(prev =>
      prev.map(el => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const handleRemoveElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
  };

  // Handler to update selected text object live from sidebar
  const handleSidebarTextUpdate = useCallback((updates: any) => {
    setTextUpdateRequest({ updates, ts: Date.now() });
  }, []);

  return (
    <>
      {/* Remove <FabricScriptLoader /> since Fabric.js is loaded globally */}
      {cakeImage ? (
        <div className="h-screen flex flex-col bg-white">
          {/* Top Navigation */}
          <nav className="h-14 border-b flex items-center px-4 bg-white">
            <div className="flex items-center space-x-6 flex-1">
              <button className="text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded">
                File
              </button>
              <button className="text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded flex items-center">
                <span>Resize</span>
                <ChevronDownIcon className="w-4 h-4 ml-1" />
              </button>
              <button className="text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded flex items-center">
                <span>Editing</span>
                <ChevronDownIcon className="w-4 h-4 ml-1" />
              </button>
              <div className="flex items-center space-x-2">
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <ArrowUturnLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded">
                  <ArrowUturnRightIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-primary-600">CAKE TOPPER DESIGNER</h1>
            </div>

            <div className="flex items-center space-x-4 flex-1 justify-end">
              <button className="px-4 py-1.5 bg-primary-600 text-white rounded-full text-sm">
                Try Pro for 30 days
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded">
                <ChartBarIcon className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded">
                <QuestionMarkCircleIcon className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded">
                <ShareIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </nav>

          <div className="flex-1 flex">
            {/* Sidebar */}
            <Sidebar
              onRequestAddElement={handleRequestAddElement}
              selectedTextObject={selectedTextObject}
              onSidebarTextUpdate={handleSidebarTextUpdate}
            />

            {/* Main Canvas Area */}
            <div className="flex-1 bg-gray-100 relative overflow-hidden">
              <InteractiveCanvas
                ref={canvasRef}
                gridSize={gridSize}
                cakeImage={cakeImage}
                imageSize={imageSize}
                elements={elements}
                onUpdateElement={handleUpdateElement}
                onRemoveElement={handleRemoveElement}
                onTextSelect={setSelectedTextObject}
                textUpdateRequest={textUpdateRequest}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center bg-white">
          <span className="text-lg text-gray-500">Loading cake image...</span>
        </div>
      )}
    </>
  );
} 