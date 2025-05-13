import { useEffect, useState } from 'react';

export function useElementsManifest() {
  const [manifest, setManifest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/assets/elements/manifest.json')
      .then(res => res.json())
      .then(data => {
        setManifest(data);
        setLoading(false);
      });
  }, []);

  return { manifest, loading };
} 