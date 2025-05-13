import React, { useState, useMemo } from 'react';
import { useAnimalElementsManifest } from '../hooks/useAnimalElementsManifest';

export default function AnimalElementsBrowser({ onSelectElement }: { onSelectElement: (element: { name: string; file: string }) => void }) {
  const { manifest, loading } = useAnimalElementsManifest();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredElements = useMemo(() => {
    if (!manifest || !selectedCategory) return [];
    return manifest[selectedCategory].filter((el: any) =>
      el.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [manifest, selectedCategory, search]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!manifest) return <div className="p-4">No elements found.</div>;

  return (
    <div className="flex flex-col h-full">
      {/* Category (folder) list */}
      <div className="mb-2">
        <div className="font-semibold mb-1">Categories</div>
        {Object.keys(manifest).map(category => (
          <button
            key={category}
            className={`block w-full text-left px-3 py-2 rounded ${selectedCategory === category ? 'bg-blue-100 font-bold' : 'hover:bg-gray-100'}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
      {/* Show search/filter and grid only if a category is selected */}
      {selectedCategory && (
        <>
          <input
            type="text"
            placeholder="Search elements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 mb-2 border rounded"
          />
          <div className="grid grid-cols-3 gap-2 overflow-y-auto" style={{ maxHeight: 320 }}>
            {filteredElements.length === 0 && (
              <div className="col-span-3 text-gray-400 text-center">No elements found.</div>
            )}
            {filteredElements.map((el: any) => (
              <button
                key={el.file}
                className="bg-white border rounded p-2 flex flex-col items-center hover:shadow"
                onClick={() => onSelectElement(el)}
                title={el.name}
              >
                <img
                  src={`/assets/elements/animals/${el.file}`}
                  alt={el.name}
                  style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 4 }}
                  loading="lazy"
                />
                <span className="text-xs">{el.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 