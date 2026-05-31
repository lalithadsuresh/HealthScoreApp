import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';

const CACHE_MAX = 40;

/**
 * Debounced product search with in-memory cache and stale-request guard.
 */
export function useLiveProductSearch(debounceMs = 400) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const cacheRef = useRef(new Map());
  const requestIdRef = useRef(0);

  useEffect(() => {
    const q = query.trim();

    if (q.length < 2) {
      requestIdRef.current += 1;
      setResults([]);
      setError('');
      setLoading(false);
      return;
    }

    if (cacheRef.current.has(q)) {
      setResults(cacheRef.current.get(q));
      setError(cacheRef.current.get(q)?.length ? '' : 'No products found. Try another term.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const timer = setTimeout(async () => {
      const id = ++requestIdRef.current;
      try {
        const { results: r } = await api.searchProducts(q);
        if (id !== requestIdRef.current) return;

        cacheRef.current.set(q, r);
        if (cacheRef.current.size > CACHE_MAX) {
          const first = cacheRef.current.keys().next().value;
          cacheRef.current.delete(first);
        }

        setResults(r);
        setError(r.length ? '' : 'No products found. Try another term.');
      } catch (err) {
        if (id !== requestIdRef.current) return;
        setResults([]);
        setError(err.message || 'Search failed');
      } finally {
        if (id === requestIdRef.current) setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const runSearchNow = async () => {
    const q = query.trim();
    if (q.length < 2) return;
    const id = ++requestIdRef.current;
    setLoading(true);
    setError('');
    try {
      const { results: r } = await api.searchProducts(q);
      if (id !== requestIdRef.current) return;
      cacheRef.current.set(q, r);
      setResults(r);
      setError(r.length ? '' : 'No products found. Try another term.');
    } catch (err) {
      if (id !== requestIdRef.current) return;
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      if (id === requestIdRef.current) setLoading(false);
    }
  };

  return { query, setQuery, results, loading, error, runSearchNow };
}
