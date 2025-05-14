import React, { useEffect, useRef, useState } from 'react';

interface PreviewModalProps {
  onClose: () => void;
  topperPng?: string | null;
  boundingBox?: { left: number; top: number; width: number; height: number } | null;
}

const DEFAULT_CANVAS_WIDTH = 768;
const DEFAULT_CANVAS_HEIGHT = 864;
const MOCKUP_EXTRA_HEIGHT = 500; // Increased from 200 to 600 to show much more of the background
const MOCKUP_EXTRA_WIDTH = 700; // Extra space to show more of the background horizontally
const TOPPER_VERTICAL_OFFSET = Math.floor(MOCKUP_EXTRA_HEIGHT / 2); // Center topper vertically in the extra space
const TOPPER_HORIZONTAL_OFFSET = Math.floor(MOCKUP_EXTRA_WIDTH / 2); // Center topper horizontally in the extra space
const CAKE_PIXEL_WIDTH = 969;

// CAKE MOCKUP CONSTANTS
const CAKE_LEFT = 257;
const CAKE_WIDTH = 853;
const CAKE_TOP = 382.469;

const ACRYLIC_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'Grey', hex: '#888888' },
  { name: 'Brown', hex: '#4B2E19' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Blue', hex: '#0A1E6E' },
  { name: 'Light Blue', hex: '#3B7EDB' },
  { name: 'Red', hex: '#A11D22' },
  { name: 'Orange', hex: '#FF6600' },
  { name: 'Yellow', hex: '#E5C100' },
  { name: 'Pink', hex: '#E94E8A' },
  { name: 'Purple', hex: '#5B224B' },
  { name: 'Green', hex: '#1B7B3A' },
  { name: 'Gold Glitter', hex: '#D4AF37', glitter: 'gold' },
  { name: 'Silver Glitter', hex: '#B0B0B0', glitter: 'silver' },
];

function darkenColor(hex: string, amount: number) {
  // hex: #RRGGBB, amount: 0 (no change) to 1 (black)
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.floor(r * (1 - amount));
  g = Math.floor(g * (1 - amount));
  b = Math.floor(b * (1 - amount));
  return `rgb(${r},${g},${b})`;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ onClose, topperPng, boundingBox }) => {
  const [mockupSize, setMockupSize] = useState<{ width: number; height: number }>({ width: DEFAULT_CANVAS_WIDTH, height: DEFAULT_CANVAS_HEIGHT });
  const containerRef = useRef<HTMLDivElement>(null);
  const bgImgRef = useRef<HTMLImageElement>(null);
  const [bgRect, setBgRect] = useState<{ width: number; height: number; left: number; top: number }>({ width: DEFAULT_CANVAS_WIDTH, height: DEFAULT_CANVAS_HEIGHT, left: 0, top: 0 });
  const [selectedColor, setSelectedColor] = useState(ACRYLIC_COLORS[0]);

  // Helper to recalculate bgRect
  const recalcBgRect = () => {
    if (!containerRef.current || !bgImgRef.current) return;
    const container = containerRef.current;
    const imgNaturalW = mockupSize.width;
    const imgNaturalH = mockupSize.height;
    const containerW = container.offsetWidth;
    const containerH = container.offsetHeight;
    const scale = Math.min(containerW / imgNaturalW, containerH / imgNaturalH);
    const renderedW = imgNaturalW * scale;
    const renderedH = imgNaturalH * scale;
    const left = (containerW - renderedW) / 2;
    const top = (containerH - renderedH) / 2;
    setBgRect({ width: renderedW, height: renderedH, left, top });
  };

  useEffect(() => {
    const img = new window.Image();
    img.src = '/assets/mockupbg.jpg';
    img.onload = () => {
      setMockupSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
  }, []);

  // Use ResizeObserver for robust resize handling
  useEffect(() => {
    recalcBgRect();
    if (!containerRef.current) return;
    const observer = new window.ResizeObserver(() => {
      recalcBgRect();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mockupSize]);

  // Also recalc after image loads
  useEffect(() => {
    if (!bgImgRef.current) return;
    bgImgRef.current.onload = recalcBgRect;
  }, [bgImgRef.current]);

  // Responsive scaling: fit preview into 90vw x 90vh
  const maxWidth = typeof window !== 'undefined' ? window.innerWidth * 0.9 : mockupSize.width;
  const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.9 : mockupSize.height;
  const scale = Math.min(maxWidth / mockupSize.width, maxHeight / mockupSize.height, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      {/* Floating close button */}
      <button
        className="absolute top-6 right-8 bg-white hover:bg-gray-200 shadow-lg rounded-full p-2 text-gray-700 z-50 border border-gray-200"
        onClick={onClose}
        aria-label="Close preview"
        style={{ fontSize: 24, lineHeight: 1, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span className="sr-only">Close preview</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      {/* Responsive, always-fit preview area */}
      <div
        ref={containerRef}
        className="relative flex items-center justify-center"
        style={{
          width: mockupSize.width * scale,
          height: mockupSize.height * scale,
          background: 'transparent',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
      >
        {/* Mockup background as full preview area */}
        <img
          ref={bgImgRef}
          src="/assets/mockupbg.jpg"
          style={{
            position: 'absolute',
            left: bgRect.left,
            top: bgRect.top,
            width: bgRect.width,
            height: bgRect.height,
            objectFit: 'contain',
            zIndex: 0,
            pointerEvents: 'none',
            userSelect: 'none',
            transition: 'all 0.1s',
          }}
          alt="Cake Mockup"
        />
        {/* Topper PNG overlay with animated shine */}
        {topperPng && (
          <div
            style={{
              position: 'absolute',
              left: 168.337,
              width: 766,
              height: 'auto',
              bottom: 200.714,
              pointerEvents: 'none',
              zIndex: 2,
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'stretch',
            }}
          >
            <img
              src={topperPng}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 1,
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.18))',
                userSelect: 'none',
                transition: '0.1s',
                display: 'block',
                opacity: 1,
              }}
              alt="Topper Preview"
            />
            {/* Color overlay for solid colors */}
            {selectedColor && !selectedColor.glitter && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: selectedColor.hex,
                  opacity: 1,
                  WebkitMaskImage: `url(${topperPng})`,
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskSize: '100% 100%',
                  maskImage: `url(${topperPng})`,
                  maskRepeat: 'no-repeat',
                  maskSize: '100% 100%',
                  pointerEvents: 'none',
                  zIndex: 2,
                  borderRadius: 0,
                }}
              />
            )}
            {/* Reflection overlay */}
            <img
              src="/assets/preview-topper-overlay.png"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                opacity: 0.4,
                pointerEvents: 'none',
                zIndex: 3,
                maskImage: `url(${topperPng})`,
                maskRepeat: 'no-repeat',
                WebkitMaskImage: `url(${topperPng})`,
                WebkitMaskRepeat: 'no-repeat',
              }}
              alt="Reflection Overlay"
            />
            {/* Glitter overlay for gold/silver */}
            {selectedColor && selectedColor.glitter && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: selectedColor.glitter === 'gold'
                    ? 'repeating-linear-gradient(45deg, #D4AF37, #D4AF37 4px, #fffbe6 8px, #D4AF37 12px)'
                    : 'repeating-linear-gradient(45deg, #B0B0B0, #B0B0B0 4px, #f8f8f8 8px, #B0B0B0 12px)',
                  opacity: 0.7,
                  mixBlendMode: 'multiply',
                  WebkitMaskImage: `url(${topperPng})`,
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskSize: '100% 100%',
                  maskImage: `url(${topperPng})`,
                  maskRepeat: 'no-repeat',
                  maskSize: '100% 100%',
                  pointerEvents: 'none',
                  zIndex: 3,
                  borderRadius: 0,
                }}
              />
            )}
            {/* Pulsing glow behind the topper for pop effect */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: selectedColor.hex,
                opacity: 0.5,
                filter: 'blur(8px)',
                pointerEvents: 'none',
                zIndex: -1,
                WebkitMaskImage: `url(${topperPng})`,
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskSize: '100% 100%',
                maskImage: `url(${topperPng})`,
                maskRepeat: 'no-repeat',
                maskSize: '100% 100%',
                animation: 'pulse-glow 3s ease-in-out infinite',
              }}
            />
            {/* Shine overlay, masked to the topper PNG */}
            <div
              className="shine-mask"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 4,
                WebkitMaskImage: `url(${topperPng})`,
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskSize: '100% 100%',
                maskImage: `url(${topperPng})`,
                maskRepeat: 'no-repeat',
                maskSize: '100% 100%',
                overflow: 'hidden',
              }}
            >
              <div className="shine-band" />
              <div className="shine-band shine-band2" />
            </div>
            {/* Extrusion/side layer for 3D effect */}
            <div
              style={{
                position: 'absolute',
                top: 3,
                left: 3,
                width: '100%',
                height: '100%',
                background: selectedColor && !selectedColor.glitter
                  ? (selectedColor.name === 'Black' || selectedColor.name === 'Grey' ? '#222' : darkenColor(selectedColor.hex, 0.5))
                  : '#222',
                opacity: 0.5,
                WebkitMaskImage: `url(${topperPng})`,
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskSize: '100% 100%',
                maskImage: `url(${topperPng})`,
                maskRepeat: 'no-repeat',
                maskSize: '100% 100%',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />
          </div>
        )}
        {/* Color bar for acrylic choices */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          padding: '18px 0 8px 0',
          position: 'absolute',
          left: 0,
          bottom: 0,
          zIndex: 10,
          background: 'rgba(255,255,255,0.85)',
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}>
          {ACRYLIC_COLORS.map(color => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color)}
              title={color.name}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: selectedColor.name === color.name ? '3px solid #333' : '1px solid #bbb',
                background: color.glitter
                  ? (color.glitter === 'gold'
                      ? 'repeating-linear-gradient(45deg, #D4AF37, #D4AF37 4px, #fffbe6 8px, #D4AF37 12px)'
                      : 'repeating-linear-gradient(45deg, #B0B0B0, #B0B0B0 4px, #f8f8f8 8px, #B0B0B0 12px)')
                  : color.hex,
                margin: '0 4px',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: selectedColor.name === color.name ? '0 0 0 2px #fff' : 'none',
                transition: 'border 0.15s, box-shadow 0.15s',
              }}
              aria-label={color.name}
            />
          ))}
        </div>
        {/* Shine animation CSS */}
        <style>{`
          .shine-band {
            position: absolute;
            top: 0;
            left: -30%;
            width: 30%;
            height: 100%;
            background: linear-gradient(120deg,
              rgba(255,255,255,0) 0%,
              rgba(255,255,255,0.12) 35%,
              rgba(255,255,255,0.7) 50%,
              rgba(255,255,255,0.12) 65%,
              rgba(255,255,255,0) 100%
            );
            opacity: 0.55;
            filter: blur(2.5px);
            transform: skewX(-20deg);
            pointer-events: none;
            animation: shine-move 6s cubic-bezier(0.4,0,0.2,1) infinite;
          }
          .shine-band2 {
            opacity: 0.25;
            filter: blur(4px);
            animation-delay: 3s;
            animation-duration: 6s;
          }
          @keyframes shine-move {
            0% { left: -30%; }
            100% { left: 100%; }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.4; filter: blur(8px); }
            50% { opacity: 0.8; filter: blur(16px); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PreviewModal;