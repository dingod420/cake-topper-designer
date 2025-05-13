export function generateCakeBase(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';

  // Fill background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Draw dotted pattern
  ctx.fillStyle = '#b2ebf2';
  const dotSpacing = 30;
  const dotSize = 4;
  
  for (let y = dotSpacing; y < height - height/4; y += dotSpacing) {
    for (let x = dotSpacing; x < width - dotSpacing; x += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw bottom band
  ctx.fillStyle = '#4dd0e1';
  ctx.fillRect(0, height - height/4, width, height/4);

  return canvas.toDataURL();
}

export default function CakeBase({ width = 600, height = 400 }: { width?: number; height?: number }) {
  return (
    <div style={{ width, height }}>
      <img 
        src={generateCakeBase(width, height)} 
        alt="Cake Base"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
} 