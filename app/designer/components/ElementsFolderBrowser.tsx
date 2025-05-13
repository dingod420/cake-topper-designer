import React, { useState, useRef } from 'react';
import { useElementsManifest } from '../hooks/useElementsManifest';

// Types for manifest structure
interface ElementItem {
  name: string;
  file: string;
  _path?: string[];
}
type ManifestNode = { [key: string]: ManifestNode } | ElementItem[];

function flattenManifestForSearch(node: ManifestNode, path: string[] = []): ElementItem[] {
  let results: ElementItem[] = [];
  if (Array.isArray(node)) {
    // node is a list of SVGs
    results.push(...node.map(el => ({ ...el, _path: path })));
  } else if (typeof node === 'object' && node !== null) {
    for (const key of Object.keys(node)) {
      results.push(...flattenManifestForSearch(node[key], [...path, key]));
    }
  }
  return results;
}

interface FolderViewProps {
  node: ManifestNode;
  path: { push: (key: string) => void };
  onSelectSVG: (el: ElementItem) => void;
  search: string;
}

function FolderView({ node, path, onSelectSVG, search }: FolderViewProps) {
  if (!node) return null;
  if (Array.isArray(node)) {
    // This is a list of SVGs
    const filtered = node.filter(el => el.name.toLowerCase().includes(search.toLowerCase()));
    return (
      <div className="grid grid-cols-3 gap-2">
        {filtered.map(el => (
          <button key={el.file} onClick={() => onSelectSVG(el)} className="bg-white border rounded p-2 flex flex-col items-center hover:shadow w-full min-w-0" style={{ maxWidth: '100%' }}>
            <img src={`/assets/elements/${el.file}`} alt={el.name} style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 4, maxWidth: '100%' }} loading="lazy" />
            <span className="text-xs">{el.name}</span>
          </button>
        ))}
        {filtered.length === 0 && <div className="col-span-3 text-gray-400 text-center">No elements found.</div>}
      </div>
    );
  }
  // This is a folder/category
  return (
    <div>
      {Object.keys(node).map(key => (
        <button
          key={key}
          className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 font-bold"
          onClick={() => path.push(key)}
        >
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </button>
      ))}
    </div>
  );
}

interface ElementsFolderBrowserProps {
  onSelectSVG: (el: ElementItem) => void;
}

export default function ElementsFolderBrowser({ onSelectSVG }: ElementsFolderBrowserProps) {
  const { manifest, loading } = useElementsManifest();
  const [path, setPath] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearch(value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (!manifest) return <div className="p-4">No elements found.</div>;

  // Traverse manifest by path
  let node: ManifestNode = manifest;
  for (const p of path) node = (node as { [key: string]: ManifestNode })[p];

  // Flatten all elements for search
  const allElements = flattenManifestForSearch(manifest);

  // If searching, show flat results
  if (debouncedSearch.trim()) {
    const filtered = allElements.filter(el =>
      el.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
    return (
      <div className="flex flex-col h-full min-w-0" style={{ overflowX: 'hidden' }}>
        <div className="mb-2">
          <input
            type="text"
            placeholder="Search elements..."
            value={search}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 mb-2 border rounded"
          />
          {path.length > 0 && (
            <button onClick={() => setPath(path.slice(0, -1))} className="mb-2 text-blue-600 hover:underline text-sm">&larr; Back</button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0" style={{ boxSizing: 'border-box' }}>
          <div className="grid grid-cols-3 gap-2 w-full min-w-0" style={{ boxSizing: 'border-box' }}>
            {filtered.length === 0 && (
              <div className="col-span-3 text-gray-400 text-center">No elements found.</div>
            )}
            {filtered.map(el => (
              <button
                key={el.file}
                onClick={() => onSelectSVG(el)}
                className="bg-white border rounded p-2 flex flex-col items-center hover:shadow w-full min-w-0"
                title={el.name}
                style={{ maxWidth: '100%' }}
              >
                <img
                  src={`/assets/elements/${el.file}`}
                  alt={el.name}
                  style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 4, maxWidth: '100%' }}
                  loading="lazy"
                />
                <span className="text-xs">{el.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, show folder navigation as before
  return (
    <div className="flex flex-col h-full min-w-0" style={{ overflowX: 'hidden' }}>
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search elements..."
          value={search}
          onChange={handleSearchChange}
          className="w-full px-3 py-2 mb-2 border rounded"
        />
        {path.length > 0 && (
          <button onClick={() => setPath(path.slice(0, -1))} className="mb-2 text-blue-600 hover:underline text-sm">&larr; Back</button>
        )}
      </div>
      <FolderView node={node} path={{ push: (key: string) => setPath([...path, key]) }} onSelectSVG={onSelectSVG} search={debouncedSearch} />
    </div>
  );
} 