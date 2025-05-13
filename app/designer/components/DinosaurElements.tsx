interface DinosaurElement {
  id: string;
  svg: string;
}

const dinosaurs: DinosaurElement[] = [
  {
    id: 'trex',
    svg: `<svg viewBox="0 0 100 100"><path d="M20,80 Q30,70 40,75 L60,65 Q70,60 80,70 L90,60 Q95,55 98,58 L95,65 Q90,70 85,68 L75,75 Q65,80 55,75 L35,85 Q25,90 20,80 Z" fill="black"/></svg>`
  },
  {
    id: 'stegosaurus',
    svg: `<svg viewBox="0 0 100 100"><path d="M10,70 Q20,60 30,65 L50,55 Q60,50 70,60 L80,50 Q85,45 88,48 L85,55 Q80,60 75,58 L65,65 Q55,70 45,65 L25,75 Q15,80 10,70 Z" fill="black"/></svg>`
  },
  {
    id: 'raptor',
    svg: `<svg viewBox="0 0 100 100"><path d="M30,70 Q40,60 50,65 L70,55 Q80,50 90,60 L95,50 Q98,45 99,48 L96,55 Q91,60 86,58 L76,65 Q66,70 56,65 L36,75 Q26,80 30,70 Z" fill="black"/></svg>`
  }
];

export default function DinosaurElements() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {dinosaurs.map((dino) => (
        <div
          key={dino.id}
          className="aspect-square bg-white rounded-lg p-4 hover:bg-gray-50 cursor-pointer border"
          dangerouslySetInnerHTML={{ __html: dino.svg }}
        />
      ))}
    </div>
  );
} 