'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import Script from 'next/script';
import TextFormatToolbar from './TextFormatToolbar';
import { TrashIcon, DocumentDuplicateIcon, LockClosedIcon, LockOpenIcon, ArrowPathIcon, ArrowsRightLeftIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { debounce } from 'lodash';

// Define Fabric.js types
type FabricStatic = {
  Canvas: new (element: HTMLCanvasElement, options?: any) => FabricCanvas;
  Line: new (points: number[], options?: any) => any;
  Image: new (element: HTMLImageElement, options?: any) => any;
  IText: new (text: string, options?: any) => any;
  Group: new (objects: any[], options?: any) => any;
  Text: new (text: string, options?: any) => any;
  Path: new (path: string, options?: any) => any;
  loadSVGFromString: (string: string, callback: (objects: any[], options: any) => void) => void;
  Object: any[];
};

declare global {
  interface Window {
    fabric: FabricStatic;
  }
}

type FabricCanvas = {
  add: (...objects: any[]) => void;
  remove: (object: any) => void;
  clear: () => void;
  renderAll: () => void;
  requestRenderAll: () => void;
  dispose: () => void;
  setWidth: (value: number) => void;
  setHeight: (value: number) => void;
  getObjects: () => any[];
  getActiveObject: () => any;
  setActiveObject: (object: any) => void;
  on: (event: string, handler: (e: any) => void) => void;
  off: (event: string, handler: (e: any) => void) => void;
  sendToBack: (object: any) => void;
  setZoom: (value: number) => void;
  getZoom: () => number;
  setViewportTransform: (transform: number[]) => void;
  viewportTransform?: number[];
  width?: number;
  height?: number;
  set: (property: string | Record<string, any>, value?: any) => void;
  getCenter: () => { left: number; top: number };
  discardActiveObject: () => void;
};

type FabricObject = {
  set: (options: any) => void;
  setCoords: () => void;
  on: (event: string, callback: Function) => void;
  text?: string;
  data?: {
    id?: string;
    isGrid?: boolean;
    isCake?: boolean;
  };
  left?: number;
  top?: number;
  angle?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
};

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
  fontWeight?: number;
  fontStyle?: string;
  textAlign?: string;
  charSpacing?: number;
  textTransform?: string;
}

interface TextUpdateRequest {
  updates: {
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number;
    fontStyle?: string;
    textTransform?: 'none' | 'uppercase' | 'lowercase';
    charSpacing?: number;
  };
  ts: number;
}

interface InteractiveCanvasProps {
  gridSize: number;
  cakeImage: HTMLImageElement | null;
  imageSize: { width: number; height: number };
  elements: DesignElement[];
  onUpdateElement?: (id: string, updates: Partial<DesignElement>) => void;
  onRemoveElement?: (id: string) => void;
  onAddElement?: (element: any) => void;
  onTextSelect?: (textObject: any | null) => void;
  onTextUpdate?: (updates: any) => void;
  textUpdateRequest?: TextUpdateRequest | null;
}

interface QuickActionToolbarProps {
  position: { top: number; left: number };
  onDelete: () => void;
  onDuplicate?: () => void;
}

// Floating toolbar for element actions
const ElementToolbar = ({ position, locked, onDelete, onDuplicate, onFlipH, onFlipV, onLockToggle }: {
  position: { top: number; left: number };
  locked: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onLockToggle: () => void;
}) => (
  <div 
    className="absolute flex items-center gap-2 bg-white rounded-full shadow-lg px-3 py-2 pointer-events-auto"
    style={{
      top: position.top,
      left: position.left,
      transform: 'translate(-50%, -100%)',
      zIndex: 9999
    }}
  >
    <button onClick={onFlipH} className="p-1.5 hover:bg-gray-100 rounded-md" title="Flip Horizontal">
      <ArrowsRightLeftIcon className="w-5 h-5 text-gray-600" />
    </button>
    <button onClick={onFlipV} className="p-1.5 hover:bg-gray-100 rounded-md" title="Flip Vertical">
      <ArrowsUpDownIcon className="w-5 h-5 text-gray-600" />
    </button>
    <button onClick={onDuplicate} className="p-1.5 hover:bg-gray-100 rounded-md" title="Duplicate">
      <DocumentDuplicateIcon className="w-5 h-5 text-gray-600" />
    </button>
    <button onClick={onLockToggle} className="p-1.5 hover:bg-gray-100 rounded-md" title={locked ? 'Unlock' : 'Lock'}>
      {locked ? <LockClosedIcon className="w-5 h-5 text-gray-600" /> : <LockOpenIcon className="w-5 h-5 text-gray-600" />}
    </button>
    <button onClick={onDelete} className="p-1.5 hover:bg-gray-100 rounded-md" title="Delete">
      <TrashIcon className="w-5 h-5 text-gray-600" />
    </button>
  </div>
);

// Helper to draw grid
function drawGrid(canvas: FabricCanvas, gridSize: number, width: number, height: number) {
  // Remove old grid lines
  canvas.getObjects().forEach(obj => {
    if (obj.data?.isGrid) canvas.remove(obj);
  });
  // Draw vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    const line = new window.fabric.Line([x, 0, x, height], {
      stroke: '#e0e7ef',
      selectable: false,
      evented: false,
      data: { isGrid: true }
    });
    canvas.add(line);
    canvas.sendToBack(line);
  }
  // Draw horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    const line = new window.fabric.Line([0, y, width, y], {
      stroke: '#e0e7ef',
      selectable: false,
      evented: false,
      data: { isGrid: true }
    });
    canvas.add(line);
    canvas.sendToBack(line);
  }
}

// Helper to draw cake image
function drawCake(canvas: FabricCanvas, cakeImage: HTMLImageElement | null, imageSize: { width: number; height: number }, setCakeTopY: (y: number) => void) {
  // Remove old cake
  canvas.getObjects().forEach(obj => {
    if (obj.data?.isCake) canvas.remove(obj);
  });
  if (!cakeImage) return;

  // --- CAKE SIZING ---
  const CAKE_INCHES = 8;
  const INCH_TO_PX = 96;
  const targetWidthPx = CAKE_INCHES * INCH_TO_PX;
  const scale = targetWidthPx / cakeImage.width;

  // --- CAKE POSITIONING ---
  const canvasWidth = canvas.width || 1;
  const canvasHeight = canvas.height || 1;
  const left = canvasWidth / 2;
  const cakeHeightPx = cakeImage.height * scale;
  const top = canvasHeight;

  const img = new window.fabric.Image(cakeImage, {
    left,
    top,
    originX: 'center',
    originY: 'bottom',
    selectable: false,
    evented: false,
    data: { isCake: true },
    scaleX: scale,
    scaleY: scale
  });
  canvas.add(img);
  canvas.sendToBack(img);

  // Calculate the top Y position of the cake in canvas coordinates
  if (canvas.height) {
    const cakeTopYCanvas = canvasHeight - cakeHeightPx;
    setCakeTopY(cakeTopYCanvas);
  }
}

// Helper to draw rulers (simple HTML overlay)
function RulerOverlay({ width, cakeWidthPx, gridSize }: { width: number; cakeWidthPx: number; gridSize: number }) {
  // Draw an 8-inch ruler centered horizontally, just above the cake
  const rulerHeight = 24;
  const marks = [];
  const startX = (width - cakeWidthPx) / 2;
  for (let i = 0; i <= 8; i++) {
    const x = startX + i * (cakeWidthPx / 8);
    marks.push(
      <div key={i} style={{ position: 'absolute', left: x, top: 0, width: 2, height: rulerHeight, background: '#2196f3', zIndex: 20 }} />
    );
    marks.push(
      <div key={i + 'label'} style={{ position: 'absolute', left: x - 8, top: rulerHeight, width: 24, textAlign: 'center', color: '#2196f3', fontSize: 12, zIndex: 21 }}>
        {i}
      </div>
    );
  }
  // Ruler line
  marks.push(
    <div key="ruler-line" style={{ position: 'absolute', left: startX, top: rulerHeight - 2, width: cakeWidthPx, height: 2, background: '#2196f3', zIndex: 19 }} />
  );
  return <>{marks}</>;
}

const InteractiveCanvas = forwardRef(function InteractiveCanvas(
  {
    gridSize,
    cakeImage,
    imageSize,
    elements,
    onUpdateElement,
    onRemoveElement,
    onAddElement,
    onTextSelect,
    onTextUpdate,
    textUpdateRequest
  }: InteractiveCanvasProps & { onAddElement?: (element: any) => void, onTextSelect?: (textObject: any | null) => void, onTextUpdate?: (updates: any) => void, textUpdateRequest?: TextUpdateRequest | null },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [fabricElements, setFabricElements] = useState<Map<string, FabricObject>>(new Map());
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number } | null>(null);
  const [quickActionPosition, setQuickActionPosition] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const [canvasDims, setCanvasDims] = useState({ width: 0, height: 0 });
  const [cakeWidthPx, setCakeWidthPx] = useState(8 * 96); // 8 inches default
  const [locked, setLocked] = useState(false);
  const [cakeTopY, setCakeTopY] = useState<number | null>(null);

  // Event handlers
  const handleObjectModified = useCallback((e: any) => {
    const target = e.target;
    if (!target || !onUpdateElement) return;
    
    const id = target.data?.id;
    if (!id) return;

    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const zoom = canvas.getZoom() || 1;
    // Make grid size smaller for smoother snapping
    const gridSnapSize = (gridSize / 8) / zoom;

    // Apply grid snapping when the drag operation ends
    if (target.type === 'i-text') {
      // Get the current position
      const currentLeft = target.left;
      const currentTop = target.top;
      
      // Use a smaller grid size for text objects
      const textGridSize = gridSnapSize / 2;
      
      // Snap to grid using the current position with a smaller grid
      const snappedX = Math.round(currentLeft / textGridSize) * textGridSize;
      const snappedY = Math.round(currentTop / textGridSize) * textGridSize;
      
      // Update position and re-enable rendering
      target.set({
        left: snappedX,
        top: snappedY,
        objectCaching: true,
        renderOnAddRemove: true
      });
    } else {
      // For non-text objects, use regular snapping
      target.set({
        left: Math.round(target.left! / gridSnapSize) * gridSnapSize,
        top: Math.round(target.top! / gridSnapSize) * gridSnapSize
      });
    }

    // Update the element state
    onUpdateElement(id, {
      x: target.left,
      y: target.top,
      angle: target.angle,
      scale: target.scaleX
    });
    
    // Ensure coordinates are updated
    target.setCoords();
  }, [onUpdateElement, gridSize]);

  const handleObjectMoving = useCallback((e: any) => {
    const target = e.target;
    if (!target) return;
    
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // For text objects, handle visual properties and ensure proper dragging
    if (target.type === 'i-text') {
      // Optimize text rendering during drag
      target.set({
        backgroundColor: 'transparent',
        borderColor: '#2196f3',
        borderScaleFactor: 1,
        padding: 0,
        selectable: true,
        hasControls: true,
        originX: 'center',
        originY: 'center',
        objectCaching: true,
        renderOnAddRemove: false,
        // Disable grid snapping during drag
        snapAngle: 0,
        snapThreshold: 0
      });
    }

    // Ensure coordinates are updated for proper dragging
    target.setCoords();
  }, []);

  const handleObjectScaling = useCallback((e: any) => {
    const target = e.target;
    if (!target) return;
    
    // Ensure minimum size
    const minSize = 20;
    if (target.scaleX * target.width < minSize || target.scaleY * target.height < minSize) {
      target.set({
        scaleX: minSize / target.width,
        scaleY: minSize / target.height
      });
    }

    // For text objects, maintain center point during scaling
    if (target.type === 'i-text') {
      const centerX = target.left + (target.width * target.scaleX) / 2;
      const centerY = target.top + (target.height * target.scaleY) / 2;
      
      target.set({
        left: centerX - (target.width * target.scaleX) / 2,
        top: centerY - (target.height * target.scaleY) / 2
      });
    }
    
    target.setCoords();
    fabricCanvasRef.current?.requestRenderAll();
  }, []);

  const handleObjectRotating = useCallback((e: any) => {
    const target = e.target;
    if (!target) return;
    
    // Snap to 15-degree increments
    const angle = target.angle || 0;
    target.set('angle', Math.round(angle / 15) * 15);
    target.setCoords();
    fabricCanvasRef.current?.requestRenderAll();
  }, []);

  // Helper to update quick action position
  const updateQuickActionPosition = useCallback((target: any) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !target) return;
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvasRect = canvasEl.getBoundingClientRect();
    const boundingRect = target.getBoundingRect();
    // boundingRect is relative to the canvas element (already in screen px)
    const boxCenterX = boundingRect.left + boundingRect.width / 2;
    const boxTopY = boundingRect.top;
    // Place the button just above the element
    setQuickActionPosition({
      left: canvasRect.left + boxCenterX,
      top: canvasRect.top + boxTopY - 56 // 56px above the top for visibility and to avoid rotation handle
    });
  }, []);

  // Update quick action position on selection, move, scale, rotate
  useEffect(() => {
    if (!selectedObject) {
      if (onTextSelect) onTextSelect(null);
      return;
    }
    updateQuickActionPosition(selectedObject);
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const update = () => updateQuickActionPosition(selectedObject);
    selectedObject.on('moving', update);
    selectedObject.on('scaling', update);
    selectedObject.on('rotating', update);
    // If selected object is text, notify parent
    if (selectedObject.type === 'i-text' && onTextSelect) {
      onTextSelect({
        id: selectedObject.data?.id,
        text: selectedObject.text,
        fontFamily: selectedObject.fontFamily,
        fontSize: selectedObject.fontSize,
        fontWeight: selectedObject.fontWeight,
        fontStyle: selectedObject.fontStyle,
        textTransform: selectedObject.textTransform,
        charSpacing: selectedObject.charSpacing,
        // Add more properties as needed
      });
    } else if (onTextSelect) {
      onTextSelect(null);
    }
    return () => {
      selectedObject.off('moving', update);
      selectedObject.off('scaling', update);
      selectedObject.off('rotating', update);
    };
  }, [selectedObject, updateQuickActionPosition, onTextSelect]);

  // Handle text updates from sidebar
  useEffect(() => {
    if (!textUpdateRequest || !selectedObject || selectedObject.type !== 'i-text') return;
    
    const { updates } = textUpdateRequest;
    selectedObject.set(updates);
    selectedObject.setCoords();
    fabricCanvasRef.current?.requestRenderAll();

    if (onUpdateElement && selectedObject.data?.id) {
      onUpdateElement(selectedObject.data.id, {
        ...updates,
        text: selectedObject.text
      });
    }
  }, [textUpdateRequest, selectedObject, onUpdateElement]);

  const handleSelection = useCallback((e: any) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (!e.selected?.[0]) {
      setSelectedObject(null);
      setToolbarPosition(null);
      setQuickActionPosition(null);
      return;
    }
    const target = e.selected[0];
    if (target.data?.isGrid || target.data?.isCake) {
      setSelectedObject(null);
      setToolbarPosition(null);
      setQuickActionPosition(null);
      return;
    }
    setSelectedObject(target);
    requestAnimationFrame(() => {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      const canvasRect = canvasEl.getBoundingClientRect();
      const zoom = canvas.getZoom();
      const vpt = canvas.viewportTransform!;
      if (target.type === 'i-text') {
        const textToolbarPosition = {
          left: canvasRect.left + (canvasRect.width / 2),
          top: canvasRect.top + 620 + 75
        };
        setToolbarPosition(textToolbarPosition);
      } else {
        setToolbarPosition(null);
      }
      // Use helper for quick action
      updateQuickActionPosition(target);
    });
  }, [updateQuickActionPosition]);

  const handleFormatUpdate = useCallback((updates: any) => {
    if (!selectedObject || !fabricCanvasRef.current) return;

    selectedObject.set(updates);
    fabricCanvasRef.current.requestRenderAll();

    if (onUpdateElement && selectedObject.data?.id) {
      onUpdateElement(selectedObject.data.id, {
        ...updates,
        text: selectedObject.text
      });
    }
  }, [selectedObject, onUpdateElement]);

  const handleDelete = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedObject) return;

    const objectId = selectedObject.data?.id;
    if (objectId && onRemoveElement) {
      canvas.remove(selectedObject);
      onRemoveElement(objectId);
      canvas.requestRenderAll();
      setSelectedObject(null);
      setQuickActionPosition(null);
    }
  }, [selectedObject, onRemoveElement]);

  const handleFlipH = useCallback(() => {
    if (!selectedObject) return;
    selectedObject.set('flipX', !selectedObject.flipX);
    selectedObject.setCoords();
    fabricCanvasRef.current?.requestRenderAll();
  }, [selectedObject]);

  const handleFlipV = useCallback(() => {
    if (!selectedObject) return;
    selectedObject.set('flipY', !selectedObject.flipY);
    selectedObject.setCoords();
    fabricCanvasRef.current?.requestRenderAll();
  }, [selectedObject]);

  const handleDuplicate = useCallback(() => {
    if (!selectedObject || !fabricCanvasRef.current) return;
    selectedObject.clone((cloned: any) => {
      if (!fabricCanvasRef.current) return;
      // Assign a new unique id
      const newId = `element-${Date.now()}`;
      if (!cloned.data) cloned.data = {};
      cloned.data.id = newId;
      cloned.set({
        left: selectedObject.left + 40,
        top: selectedObject.top + 40,
        evented: true,
        selectable: true
      });
      fabricCanvasRef.current.add(cloned);
      fabricCanvasRef.current.setActiveObject(cloned);
      fabricCanvasRef.current.requestRenderAll();
      // Optionally, add to React state if needed
      if (onAddElement) {
        // Try to extract the element data from the cloned object
        const newElement = {
          id: newId,
          type: cloned.type === 'i-text' ? 'text' : 'shape',
          x: cloned.left,
          y: cloned.top,
          angle: cloned.angle,
          scale: cloned.scaleX,
          text: cloned.text,
          svg: cloned.type !== 'i-text' ? selectedObject?.svg : undefined
        };
        onAddElement(newElement);
      }
    });
  }, [selectedObject, onAddElement]);

  const handleLockToggle = useCallback(() => {
    if (!selectedObject) return;
    const newLocked = !locked;
    setLocked(newLocked);
    selectedObject.set({
      lockMovementX: newLocked,
      lockMovementY: newLocked,
      lockScalingX: newLocked,
      lockScalingY: newLocked,
      lockRotation: newLocked,
      hasControls: !newLocked,
      selectable: !newLocked
    });
    selectedObject.setCoords();
    fabricCanvasRef.current?.requestRenderAll();
  }, [selectedObject, locked]);

  // Update locked state when selection changes
  useEffect(() => {
    if (!selectedObject) {
      setLocked(false);
      return;
    }
    setLocked(!!selectedObject.lockMovementX);
  }, [selectedObject]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || isInitializingRef.current || isInitializedRef.current) return;

    console.log('Initializing canvas');
    isInitializingRef.current = true;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const canvas = canvasRef.current;

    // Set canvas dimensions
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    setCanvasDims({ width: rect.width, height: rect.height });

    console.log('Canvas dimensions:', { width: rect.width, height: rect.height });

    // Initialize Fabric.js canvas
    const fabricCanvas = new window.fabric.Canvas(canvas, {
      width: rect.width,
      height: rect.height,
      selection: true,
      backgroundColor: '#f0f9ff',
      preserveObjectStacking: true,
      selectionBorderColor: '#2196f3',
      selectionColor: 'rgba(33, 150, 243, 0.3)',
      selectionLineWidth: 2,
      stopContextMenu: true,
      fireRightClick: true,
      enableRetinaScaling: true,
      imageSmoothingEnabled: true,
      stateful: true,
      renderOnAddRemove: false // Disable automatic rendering
    });

    // Set up event handlers
    fabricCanvas.on('selection:created', handleSelection);
    fabricCanvas.on('selection:updated', handleSelection);
    fabricCanvas.on('selection:cleared', handleSelection);
    fabricCanvas.on('object:modified', handleObjectModified);
    fabricCanvas.on('object:moving', handleObjectMoving);
    fabricCanvas.on('object:scaling', handleObjectScaling);
    fabricCanvas.on('object:rotating', handleObjectRotating);

    // Add mouse event handlers
    fabricCanvas.on('mouse:down', (e) => {
      if (e.target) {
        fabricCanvas.setActiveObject(e.target);
      }
    });

    fabricCanvas.on('mouse:dblclick', (e) => {
      if (e.target && e.target.type === 'i-text') {
        e.target.enterEditing();
        e.target.selectAll();
        // Add visual indicator for editing mode
        e.target.set({
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderColor: '#2196f3',
          borderScaleFactor: 2,
          padding: 10
        });
        fabricCanvas.requestRenderAll();
      }
    });

    fabricCanvas.on('text:changed', (e) => {
      const target = e.target;
      if (!target || !onUpdateElement || !target.data?.id) return;
      
      // Update the element state with new text
      onUpdateElement(target.data.id, {
        text: target.text
      });

      // Notify parent of text selection to update sidebar
      if (onTextSelect) {
        onTextSelect({
          id: target.data.id,
          text: target.text,
          fontFamily: target.fontFamily,
          fontSize: target.fontSize,
          fontWeight: target.fontWeight,
          fontStyle: target.fontStyle,
          textTransform: target.textTransform,
          charSpacing: target.charSpacing,
        });
      }
    });

    // Add handler for when text editing is finished
    fabricCanvas.on('editing:exited', (e) => {
      const target = e.target;
      if (target && target.type === 'i-text') {
        // Remove visual indicator and ensure proper cleanup
        target.set({
          backgroundColor: 'transparent',
          borderColor: '#2196f3',
          borderScaleFactor: 1,
          padding: 0
        });
        // Force recalculation of object dimensions and position
        target.setCoords();
        fabricCanvas.requestRenderAll();
      }
    });

    fabricCanvas.on('mouse:move', () => {
      fabricCanvas.requestRenderAll();
    });

    fabricCanvasRef.current = fabricCanvas;
    isInitializedRef.current = true;
    isInitializingRef.current = false;
    console.log('Canvas setup complete');

    // Draw grid and cake after initialization with proper error handling
    const initializeCanvas = async () => {
      try {
        // Ensure canvas is ready
        if (!fabricCanvasRef.current) return;
        
        // Draw grid and cake
        drawGrid(fabricCanvasRef.current, gridSize, rect.width, rect.height);
        drawCake(fabricCanvasRef.current, cakeImage, imageSize, setCakeTopY);
        
        // Force a render
        fabricCanvasRef.current.requestRenderAll();
      } catch (error) {
        console.error('Error initializing canvas:', error);
      }
    };

    // Use requestAnimationFrame to ensure canvas is ready
    requestAnimationFrame(initializeCanvas);

    return () => {
      console.log('Component unmounting - cleaning up canvas');
      if (fabricCanvasRef.current) {
        try {
          // Remove all objects first
          fabricCanvasRef.current.getObjects().forEach(obj => {
            fabricCanvasRef.current?.remove(obj);
          });
          
          // Clear the canvas
          fabricCanvasRef.current.clear();
          
          // Dispose the canvas
          fabricCanvasRef.current.dispose();
          fabricCanvasRef.current = null;
        } catch (error) {
          console.error('Error cleaning up canvas:', error);
        }
      }
      isInitializedRef.current = false;
      isInitializingRef.current = false;
    };
  }, []); // Empty dependency array to ensure initialization happens only once

  // Handle window resize with proper error handling
  useEffect(() => {
    if (!containerRef.current || !fabricCanvasRef.current) return;

    const handleResize = () => {
      try {
        const canvas = fabricCanvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        canvas.setWidth(rect.width);
        canvas.setHeight(rect.height);
        setCanvasDims({ width: rect.width, height: rect.height });

        // Redraw grid and cake
        drawGrid(canvas, gridSize, rect.width, rect.height);
        drawCake(canvas, cakeImage, imageSize, setCakeTopY);

        canvas.requestRenderAll();
      } catch (error) {
        console.error('Error handling resize:', error);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gridSize, cakeImage, imageSize]);

  // Redraw grid and cake when cakeImage or imageSize changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    drawGrid(canvas, gridSize, canvasDims.width, canvasDims.height);
    drawCake(canvas, cakeImage, imageSize, setCakeTopY);
    canvas.requestRenderAll();
  }, [cakeImage, imageSize, gridSize, canvasDims]);

  // Update elements
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isInitializedRef.current) {
      console.log('Canvas not initialized yet');
      return;
    }

    console.log('Updating elements:', elements);

    // Remove elements that no longer exist
    const currentElementIds = new Set(elements.map(e => e.id));
    fabricElements.forEach((obj, id) => {
      if (!currentElementIds.has(id)) {
        console.log('Removing element:', id);
        canvas.remove(obj);
        fabricElements.delete(id);
      }
    });

    // Add or update elements
    elements.forEach(element => {
      console.log('Processing element:', element);
      
      if (fabricElements.has(element.id)) {
        console.log('Updating existing element:', element.id);
        const existingObject = fabricElements.get(element.id);
        if (existingObject) {
          existingObject.set({
            left: element.x,
            top: element.y,
            angle: element.angle,
            ...(element.type === 'text' && { text: element.text })
          });
          existingObject.setCoords();
        }
        return;
      }

      console.log('Creating new fabric object for element:', element);
      const fabricObject = createFabricObject(element, window.fabric, onUpdateElement);
      
      if (fabricObject) {
        console.log('Adding fabric object to canvas:', fabricObject);
        
        // When viewport is centered, (0,0) is the visible center
        fabricObject.set({
          left: (canvas.width || 1) / 2,
          top: (canvas.height || 1) / 2
        });
        
        // Add to canvas and update coordinates
        canvas.add(fabricObject);
        fabricObject.setCoords();
        
        // Update the element's position in the parent state
        if (onUpdateElement) {
          onUpdateElement(element.id, {
            x: (canvas.width || 1) / 2,
            y: (canvas.height || 1) / 2
          });
        }
        
        fabricElements.set(element.id, fabricObject);
        canvas.requestRenderAll();
      } else {
        console.error('Failed to create fabric object for element:', element);
      }
    });

    console.log('Current fabric elements:', Array.from(fabricElements.keys()));
    console.log('Canvas objects:', canvas.getObjects());
  }, [elements, onUpdateElement]);

  // Expose canvas methods
  useImperativeHandle(ref, () => ({
    getCenter: () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return { left: 0, top: 0 };
      return canvas.getCenter();
    }
  }), []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Ruler overlay */}
      {cakeTopY !== null && (
        <div style={{ position: 'absolute', top: cakeTopY + 21, left: (canvasDims.width / 2) - (cakeWidthPx / 2), width: cakeWidthPx, height: 24, pointerEvents: 'none', zIndex: 1 }}>
          <RulerOverlay width={cakeWidthPx} cakeWidthPx={cakeWidthPx} gridSize={gridSize} />
        </div>
      )}
      <div className="fixed inset-0 pointer-events-none">
        {selectedObject && quickActionPosition && (
          <ElementToolbar
            position={quickActionPosition}
            locked={locked}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onFlipH={handleFlipH}
            onFlipV={handleFlipV}
            onLockToggle={handleLockToggle}
          />
        )}
      </div>
    </div>
  );
});

export default InteractiveCanvas;

// Move Script component to parent
export function FabricScriptLoader() {
  return (
    <Script
      src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"
      strategy="beforeInteractive"
      id="fabric-js"
    />
  );
}

// Update the element creation logic
const createFabricObject = (element: DesignElement, fabric: FabricStatic, onUpdateElement?: (id: string, updates: Partial<DesignElement>) => void): FabricObject | null => {
  if (element.type === 'text') {
    // Apply textTransform (case) by changing the string if needed
    let displayText = element.text || '';
    if (element.textTransform === 'uppercase') {
      displayText = displayText.toUpperCase();
    } else if (element.textTransform === 'lowercase') {
      displayText = displayText.toLowerCase();
    }

    // Defensive: always use valid textBaseline
    const validTextBaseline = 'alphabetic';
    if (element.hasOwnProperty('textBaseline') && (element as any).textBaseline !== 'alphabetic') {
      console.warn('Invalid textBaseline value found:', (element as any).textBaseline, '— Forcing to "alphabetic"');
    }

    const textObject = new fabric.IText(displayText, {
      left: element.x,
      top: element.y,
      fontSize: element.fontSize || 20,
      fontFamily: element.fontFamily || 'Arial',
      fontWeight: element.fontWeight || 400,
      fontStyle: element.fontStyle || 'normal',
      textAlign: element.textAlign || 'center',
      charSpacing: typeof element.charSpacing === 'number' ? element.charSpacing : 0,
      fill: 'black',
      originX: 'center',
      originY: 'center',
      centeredScaling: true,
      hasControls: true,
      hasBorders: true,
      selectable: true,
      data: { 
        id: element.id, 
        isGrid: false, 
        isCake: false,
        originalText: element.text, // Store original text for case transformations
        textTransform: element.textTransform // Store text transform setting
      },
      textBaseline: validTextBaseline,
      objectCaching: true, // Enable object caching for better performance
      renderOnAddRemove: true
    });

    // Handle text case changes
    textObject.on('text:changed', () => {
      if (textObject.data?.textTransform) {
        const originalText = textObject.text;
        if (textObject.data.textTransform === 'uppercase') {
          textObject.set('text', originalText.toUpperCase());
        } else if (textObject.data.textTransform === 'lowercase') {
          textObject.set('text', originalText.toLowerCase());
        }
      }
    });

    textObject.on('editing:entered', () => {
      if (onUpdateElement && textObject.data?.id && textObject.text !== undefined) {
        onUpdateElement(textObject.data.id, { text: textObject.text });
      }
    });

    textObject.on('editing:exited', () => {
      if (onUpdateElement && textObject.data?.id && textObject.text !== undefined) {
        onUpdateElement(textObject.data.id, { text: textObject.text });
      }
    });

    return textObject;
  } else if (element.type === 'shape' && element.svg) {
    try {
      // Parse SVG string
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(element.svg, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;
      
      // Get viewBox dimensions
      const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 24, 24];
      const [, , width, height] = viewBox;
      
      // Create a group to hold the SVG objects
      const group = new fabric.Group([], {
        left: element.x,
        top: element.y,
        originX: 'center',
        originY: 'center',
        centeredScaling: true,
        hasControls: true,
        hasBorders: true,
        selectable: true,
        data: { id: element.id, isGrid: false, isCake: false }
      });

      // Create path objects from SVG
      const paths = svgElement.querySelectorAll('path');
      paths.forEach(path => {
        const pathData = path.getAttribute('d');
        if (pathData) {
          const pathObj = new fabric.Path(pathData, {
            fill: 'black',
            stroke: 'none',
            originX: 'center',
            originY: 'center',
            scaleX: 1,
            scaleY: 1
          });
          group.addWithUpdate(pathObj);
        }
      });

      // Scale the group to a reasonable size
      const scale = 2; // Adjust this value to change the size of shapes
      group.scale(scale);

      // Center the group
      group.set({
        left: element.x,
        top: element.y
      });

      group.setCoords();
      return group;
    } catch (error) {
      console.error('Error creating shape element:', error);
      return null;
    }
  }
  return null;
}; 