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
  bringToFront: (object: any) => void;
  sendBackwards: (object: any, intersecting?: boolean) => void;
  setZoom: (value: number) => void;
  getZoom: () => number;
  setViewportTransform: (transform: number[]) => void;
  viewportTransform?: number[];
  width?: number;
  height?: number;
  set: (property: string | Record<string, any>, value?: any) => void;
  getCenter: () => { left: number; top: number };
  discardActiveObject: () => void;
  moveTo: (object: any, index: number) => void;
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
  curve?: number;
  offsetY?: number;
  textHeight?: number;
  bottom?: number;
  triangle?: boolean;
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
    curveRadius?: number;
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

// Helper to get the cake object and its index
function getCakeObjectAndIndex(canvas: FabricCanvas) {
  const objects = canvas.getObjects();
  for (let i = 0; i < objects.length; i++) {
    if (objects[i].data?.isCake) {
      return { cake: objects[i], index: i };
    }
  }
  return { cake: null, index: -1 };
}

// Helper to ensure proper layering of new elements
function ensureProperLayering(canvas: FabricCanvas, newObject: FabricObject) {
  const { cake, index } = getCakeObjectAndIndex(canvas);
  if (cake && index > 0) {
    // Move the new object just below the cake
    canvas.moveTo(newObject, index);
    // Always move the cake to the top
    canvas.moveTo(cake, canvas.getObjects().length - 1);
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

// Helper to draw the base rectangle
function drawBase(canvas: FabricCanvas, cakeWidthPx: number, cakeTopY: number) {
  // Remove old base
  canvas.getObjects().forEach(obj => {
    if (obj.data?.isBase) canvas.remove(obj);
  });
  // Draw new base
  const baseHeight = 24; // px
  const canvasWidth = canvas.width || 1;
  const left = canvasWidth / 2;
  const top = cakeTopY;
  const rect = new window.fabric.Rect({
    left: left,
    top: top,
    width: cakeWidthPx,
    height: baseHeight,
    fill: 'black',
    originX: 'center',
    originY: 'top',
    selectable: false,
    evented: false,
    data: { isBase: true }
  });
  canvas.add(rect);
  // Move base just below the cake (if cake exists)
  const objects = canvas.getObjects();
  const cakeIndex = objects.findIndex(obj => obj.data?.isCake);
  if (cakeIndex > 0) {
    canvas.moveTo(rect, cakeIndex);
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
  // Always bring cake to top
  canvas.moveTo(img, canvas.getObjects().length - 1);

  // Calculate the top Y position of the cake in canvas coordinates
  if (canvas.height) {
    const cakeTopYCanvas = canvasHeight - cakeHeightPx;
    setCakeTopY(cakeTopYCanvas);
    // Draw the base just before the cake
    drawBase(canvas, targetWidthPx, cakeTopYCanvas);
  }
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

  // Patch Fabric.js to use passive wheel event listeners
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fabric && window.fabric.util && window.fabric.util.addListener) {
      const origAddListener = window.fabric.util.addListener;
      window.fabric.util.addListener = function (...args: any[]) {
        if (args[1] === 'wheel') {
          // If options is not provided, add it
          if (args.length === 3) {
            args.push({ passive: true });
          } else if (args.length >= 4 && typeof args[3] === 'object') {
            args[3] = { passive: true, ...args[3] };
          }
        }
        // @ts-ignore: Argument type mismatch is safe for this runtime patch
        return origAddListener.apply(this, args);
      };
    }
  }, []);

  // Add safe canvas operation helper with cleanup
  const safeCanvasOperation = useCallback((operation: () => void) => {
    try {
      operation();
    } catch (error) {
      console.error('Canvas operation failed:', error);
      // Attempt to recover without triggering re-renders
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.requestRenderAll();
      }
    }
  }, []);

  // Add debounced render function with cleanup
  const debouncedRender = useCallback(
    debounce((canvas: FabricCanvas) => {
      if (canvas) {
        canvas.requestRenderAll();
      }
    }, 16),
    []
  );

  // Cleanup function for debounced render
  useEffect(() => {
    return () => {
      debouncedRender.cancel();
    };
  }, [debouncedRender]);

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

    safeCanvasOperation(() => {
      // Apply grid snapping when the drag operation ends
      if (target.type === 'i-text' || target.type === 'curvedText') {
        // Get the current position
        const currentLeft = target.left;
        const currentTop = target.top;
        
        // Use a smaller grid size for text objects
        const textGridSize = gridSnapSize / 4;
        
        // Add a small threshold to prevent snapping when close to grid
        const threshold = textGridSize / 4;
        const snappedX = Math.abs(currentLeft % textGridSize) < threshold ? 
          Math.round(currentLeft / textGridSize) * textGridSize : 
          currentLeft;
        const snappedY = Math.abs(currentTop % textGridSize) < threshold ? 
          Math.round(currentTop / textGridSize) * textGridSize : 
          currentTop;
        
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
      debouncedRender(canvas);
    });
  }, [onUpdateElement, gridSize]);

  const handleObjectMoving = useCallback((e: any) => {
    const target = e.target;
    if (!target) return;
    
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // For text objects, handle visual properties and ensure proper dragging
    if (target.type === 'i-text' || target.type === 'curvedText') {
      safeCanvasOperation(() => {
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
          snapAngle: 0,
          snapThreshold: 0,
          perPixelTargetFind: true,
          transparentCorners: false,
          cornerColor: '#2196f3',
          cornerSize: 8
        });
      });
    }

    // Ensure coordinates are updated for proper dragging
    target.setCoords();
    debouncedRender(canvas);
  }, []);

  const handleObjectScaling = useCallback((e: any) => {
    const target = e.target;
    if (!target) return;
    
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    safeCanvasOperation(() => {
      // Ensure minimum size
      const minSize = 20;
      if (target.scaleX * target.width < minSize || target.scaleY * target.height < minSize) {
        target.set({
          scaleX: minSize / target.width,
          scaleY: minSize / target.height
        });
      }

      // For text objects, maintain center point during scaling
      if (target.type === 'i-text' || target.type === 'curvedText') {
        const centerX = target.left + (target.width * target.scaleX) / 2;
        const centerY = target.top + (target.height * target.scaleY) / 2;
        
        target.set({
          left: centerX - (target.width * target.scaleX) / 2,
          top: centerY - (target.height * target.scaleY) / 2,
          objectCaching: true
        });
      }
      
      target.setCoords();
      debouncedRender(canvas);
    });
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

  // Handle text updates from sidebar with proper cleanup
  useEffect(() => {
    console.log('textUpdateRequest effect running', textUpdateRequest, selectedObject);
    if (!textUpdateRequest || !selectedObject || (selectedObject.type !== 'i-text' && selectedObject.type !== 'text')) return;
    const { updates } = textUpdateRequest;
    if (!updates || Object.keys(updates).length === 0) return;

    let isMounted = true;

    safeCanvasOperation(() => {
      if (!isMounted) return;

      // Handle regular text updates (only if something changed)
      if (isMounted && updates && Object.keys(updates).length > 0) {
        let needsUpdate = false;
        for (const key in updates) {
          if (Object.prototype.hasOwnProperty.call(selectedObject, key)) {
            if ((selectedObject as any)[key] !== updates[key as keyof typeof updates]) {
              needsUpdate = true;
              break;
            }
          }
        }
        if (needsUpdate) {
          selectedObject.set(updates);
          selectedObject.setCoords();
          debouncedRender(fabricCanvasRef.current!);

          if (onUpdateElement && selectedObject.data?.id) {
            // Only call if the update is actually different
            if (selectedObject.text !== updates.text) {
              onUpdateElement(selectedObject.data.id, {
                ...updates,
                text: selectedObject.text
              });
            }
          }
        }
      }

      // Handle bridgeText property updates
      if (selectedObject && selectedObject.type === 'bridgeText' && updates) {
        console.log('BridgeText update effect', {updates, selectedObject});
        let needsUpdate = false;
        const keys = ['curve', 'offsetY', 'textHeight', 'bottom', 'triangle'];
        for (const key of keys) {
          if (key in updates && (selectedObject as any)[key] !== (updates as any)[key]) {
            (selectedObject as any)[key] = (updates as any)[key];
            needsUpdate = true;
          }
        }
        if (needsUpdate && fabricCanvasRef.current) {
          fabricCanvasRef.current.requestRenderAll();
        }
        return;
      }
    });
    return () => {
      isMounted = false;
    };
  }, [textUpdateRequest, selectedObject, onUpdateElement, safeCanvasOperation, debouncedRender]);

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

  // Update canvas initialization with proper cleanup
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || isInitializingRef.current || isInitializedRef.current) return;

    let isMounted = true;
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
    if (isMounted) {
      setCanvasDims({ width: rect.width, height: rect.height });
    }

    // Initialize Fabric.js canvas with improved settings
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
      renderOnAddRemove: false,
      perPixelTargetFind: true,
      objectCaching: true
    });

    // Add context loss handling
    fabricCanvas.on('context:lost', () => {
      if (isMounted) {
        console.warn('Canvas context lost');
        fabricCanvas.requestRenderAll();
      }
    });

    // Set up event handlers with safe operations
    const handlers = {
      'selection:created': (e: any) => safeCanvasOperation(() => handleSelection(e)),
      'selection:updated': (e: any) => safeCanvasOperation(() => handleSelection(e)),
      'selection:cleared': (e: any) => safeCanvasOperation(() => handleSelection(e)),
      'object:modified': (e: any) => safeCanvasOperation(() => handleObjectModified(e)),
      'object:moving': (e: any) => safeCanvasOperation(() => handleObjectMoving(e)),
      'object:scaling': (e: any) => safeCanvasOperation(() => handleObjectScaling(e)),
      'object:rotating': (e: any) => safeCanvasOperation(() => handleObjectRotating(e))
    };

    // Add all handlers
    Object.entries(handlers).forEach(([event, handler]) => {
      fabricCanvas.on(event, handler);
    });

    if (isMounted) {
      fabricCanvasRef.current = fabricCanvas;
      isInitializedRef.current = true;
      isInitializingRef.current = false;
    }

    // Draw grid and cake after initialization
    const initializeCanvas = async () => {
      if (!isMounted || !fabricCanvasRef.current) return;
      
      try {
        drawGrid(fabricCanvasRef.current, gridSize, rect.width, rect.height);
        drawCake(fabricCanvasRef.current, cakeImage, imageSize, setCakeTopY);
        fabricCanvasRef.current.requestRenderAll();
      } catch (error) {
        console.error('Error initializing canvas:', error);
      }
    };

    requestAnimationFrame(initializeCanvas);

    return () => {
      isMounted = false;
      isInitializingRef.current = false;
      isInitializedRef.current = false;

      // Remove all event handlers
      Object.entries(handlers).forEach(([event, handler]) => {
        fabricCanvas.off(event, handler);
      });

      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.getObjects().forEach(obj => {
            fabricCanvasRef.current?.remove(obj);
          });
          fabricCanvasRef.current.clear();
          fabricCanvasRef.current.dispose();
          fabricCanvasRef.current = null;
        } catch (error) {
          console.error('Error cleaning up canvas:', error);
        }
      }
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
          // Only update if values are different to prevent unnecessary updates
          const needsUpdate = 
            existingObject.left !== element.x ||
            existingObject.top !== element.y ||
            existingObject.angle !== element.angle ||
            (element.type === 'text' && existingObject.text !== element.text);

          if (needsUpdate) {
            existingObject.set({
              left: element.x,
              top: element.y,
              angle: element.angle,
              ...(element.type === 'text' && { text: element.text })
            });
            existingObject.setCoords();
          }
        }
        return;
      }

      console.log('Creating new fabric object for element:', element);
      const fabricObject = createFabricObject(element, window.fabric, fabricCanvasRef.current!, onUpdateElement);
      
      if (fabricObject) {
        console.log('Adding fabric object to canvas:', fabricObject);
        
        // When viewport is centered, (0,0) is the visible center
        fabricObject.set({
          left: element.x || (canvas.width || 1) / 2,
          top: element.y || (canvas.height || 1) / 2
        });
        
        // Add to canvas and update coordinates
        canvas.add(fabricObject);
        fabricObject.setCoords();
        
        // Only update parent state if the element's position is different from initial
        if (onUpdateElement && (element.x !== (canvas.width || 1) / 2 || element.y !== (canvas.height || 1) / 2)) {
          onUpdateElement(element.id, {
            x: element.x || (canvas.width || 1) / 2,
            y: element.y || (canvas.height || 1) / 2
          });
        }
        
        fabricElements.set(element.id, fabricObject);
        canvas.requestRenderAll();
        
        // Ensure proper layering
        ensureProperLayering(canvas, fabricObject);
      } else {
        console.error('Failed to create fabric object for element:', element);
      }
    });

    console.log('Current fabric elements:', Array.from(fabricElements.keys()));
    console.log('Canvas objects:', canvas.getObjects());
  }, [elements]); // Remove onUpdateElement from dependencies

  // Expose canvas methods
  useImperativeHandle(ref, () => ({
    getCenter: () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return { left: 0, top: 0 };
      return canvas.getCenter();
    },
    getFabric: () => fabricCanvasRef.current,
    getCakeTopY: () => cakeTopY,
  }), [cakeTopY]);

  // Add BridgeText class for arched/bridge text effect
  useEffect(() => {
    if (typeof window === 'undefined' || !window.fabric) return;
    if ((window.fabric as any).BridgeText) return;
    class BridgeText extends (window.fabric as any).Object {
      text: string;
      fontSize: number;
      fontFamily: string;
      fontWeight: number;
      curve: number;
      offsetY: number;
      textHeight: number;
      bottom: number;
      triangle: boolean;
      constructor(text: string, options: any = {}) {
        super(options);
        this.text = text;
        this.fontSize = options.fontSize || 40;
        this.fontFamily = options.fontFamily || 'Arial';
        this.fontWeight = options.fontWeight || 400;
        this.curve = options.curve || 100;
        this.offsetY = options.offsetY || 50;
        this.textHeight = options.textHeight || 100;
        this.bottom = options.bottom || 200;
        this.triangle = options.triangle || false;
        this.width = options.width || 300;
        this.height = options.height || 150;
      }
      _render(ctx: any) {
        ctx.save();
        ctx.font = `${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        const chars = this.text.split('');
        const totalWidth = chars.reduce((acc, char) => acc + ctx.measureText(char).width, 0);
        let x = this.width / 2 - totalWidth / 2;
        for (let i = 0; i < chars.length; i++) {
          const char = chars[i];
          const charWidth = ctx.measureText(char).width;
          const percent = chars.length === 1 ? 0.5 : i / (chars.length - 1);
          let y = this.offsetY;
          let angle = 0;
          if (this.triangle) {
            y += -this.curve * Math.abs(percent - 0.5) * 2;
          } else {
            y += -this.curve * Math.sin(Math.PI * (percent - 0.5));
          }
          y += this.textHeight;
          y += this.bottom;
          ctx.save();
          ctx.translate(x + charWidth / 2, y);
          if (this.triangle) {
            angle = (percent - 0.5) * 0.7;
          } else {
            angle = (percent - 0.5) * (this.curve / 100);
          }
          ctx.rotate(angle);
          ctx.fillText(char, 0, 0);
          ctx.restore();
          x += charWidth;
        }
        ctx.restore();
      }
      toObject(propertiesToInclude: any[] = []) {
        return {
          ...super.toObject(propertiesToInclude),
          text: this.text,
          fontSize: this.fontSize,
          fontFamily: this.fontFamily,
          fontWeight: this.fontWeight,
          curve: this.curve,
          offsetY: this.offsetY,
          textHeight: this.textHeight,
          bottom: this.bottom,
          triangle: this.triangle,
        };
      }
    }
    (window.fabric as any).BridgeText = BridgeText;
  }, []);

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
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"
        strategy="beforeInteractive"
        id="fabric-js"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/fabricjs-curved-text/dist/fabric.curvedText.min.js"
        strategy="afterInteractive"
        id="fabric-curved-text-js"
        onLoad={() => { console.log('fabricjs-curved-text loaded'); }}
      />
    </>
  );
}

// Update the element creation logic
const createFabricObject = (element: DesignElement, fabric: FabricStatic, canvas: FabricCanvas, onUpdateElement?: (id: string, updates: Partial<DesignElement>) => void): FabricObject | null => {
  console.log('[createFabricObject] element.type:', element.type, 'element:', element);
  if (element.type === 'bridgeText') {
    if (typeof window !== 'undefined' && window.fabric && (window.fabric as any).BridgeText) {
      const BridgeText = (window.fabric as any).BridgeText;
      return new BridgeText(element.text || '', {
        left: element.x,
        top: element.y,
        fontSize: element.fontSize || 40,
        fontFamily: element.fontFamily || 'Arial',
        fontWeight: element.fontWeight || 400,
        curve: element.curve || 100,
        offsetY: element.offsetY || 50,
        textHeight: element.textHeight || 100,
        bottom: element.bottom || 200,
        triangle: element.triangle || false,
        width: 300,
        height: 150,
        data: { id: element.id }
      });
    }
    return null;
  }
  if (element.type === 'text') {
    let displayText = element.text || '';
    if (element.textTransform === 'uppercase') {
      displayText = displayText.toUpperCase();
    } else if (element.textTransform === 'lowercase') {
      displayText = displayText.toLowerCase();
    }
    let textObject = new (window.fabric as any).IText(displayText, {
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
        originalText: element.text,
        textTransform: element.textTransform
      },
      objectCaching: true
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

    // Ensure proper layering
    ensureProperLayering(canvas, textObject);
    
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
            fill: path.getAttribute('fill') || 'black',
            stroke: path.getAttribute('stroke') || 'none',
            originX: 'center',
            originY: 'center',
            scaleX: 1,
            scaleY: 1
          });
          group.addWithUpdate(pathObj);
        }
      });

      // Add support for <circle>
      const circles = svgElement.querySelectorAll('circle');
      circles.forEach(circle => {
        const cx = parseFloat(circle.getAttribute('cx') || '0');
        const cy = parseFloat(circle.getAttribute('cy') || '0');
        const r = parseFloat(circle.getAttribute('r') || '0');
        const fill = circle.getAttribute('fill') || 'black';
        const stroke = circle.getAttribute('stroke') || 'none';
        const circleObj = new window.fabric.Circle({
          left: cx - r,
          top: cy - r,
          radius: r,
          fill,
          stroke,
          originX: 'center',
          originY: 'center',
          scaleX: 1,
          scaleY: 1
        });
        group.addWithUpdate(circleObj);
      });

      // Add support for <rect>
      const rects = svgElement.querySelectorAll('rect');
      rects.forEach(rect => {
        const x = parseFloat(rect.getAttribute('x') || '0');
        const y = parseFloat(rect.getAttribute('y') || '0');
        const width = parseFloat(rect.getAttribute('width') || '0');
        const height = parseFloat(rect.getAttribute('height') || '0');
        const fill = rect.getAttribute('fill') || 'black';
        const stroke = rect.getAttribute('stroke') || 'none';
        const rx = parseFloat(rect.getAttribute('rx') || '0');
        const rectObj = new window.fabric.Rect({
          left: x + width / 2,
          top: y + height / 2,
          width,
          height,
          fill,
          stroke,
          rx,
          originX: 'center',
          originY: 'center',
          scaleX: 1,
          scaleY: 1
        });
        group.addWithUpdate(rectObj);
      });

      // Add support for <ellipse>
      const ellipses = svgElement.querySelectorAll('ellipse');
      ellipses.forEach(ellipse => {
        const cx = parseFloat(ellipse.getAttribute('cx') || '0');
        const cy = parseFloat(ellipse.getAttribute('cy') || '0');
        const rx = parseFloat(ellipse.getAttribute('rx') || '0');
        const ry = parseFloat(ellipse.getAttribute('ry') || '0');
        const fill = ellipse.getAttribute('fill') || 'black';
        const stroke = ellipse.getAttribute('stroke') || 'none';
        const ellipseObj = new window.fabric.Ellipse({
          left: cx,
          top: cy,
          rx,
          ry,
          fill,
          stroke,
          originX: 'center',
          originY: 'center',
          scaleX: 1,
          scaleY: 1
        });
        group.addWithUpdate(ellipseObj);
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
      
      // Ensure proper layering
      ensureProperLayering(canvas, group);
      
      return group;
    } catch (error) {
      console.error('Error creating shape element:', error);
      return null;
    }
  }
  return null;
}; 