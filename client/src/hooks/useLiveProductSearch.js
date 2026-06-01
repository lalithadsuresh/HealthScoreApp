import { useEffect, useRef, useState } from 'react';
function isAbortError(err) {
  return err?.name === 'AbortError' || err?.message === 'Aborted';
}

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
  const [emptyMessage, setEmptyMessage] = useState('');
  const cacheRef = useRef(new Map());
  const requestIdRef = useRef(0);

  useEffect(() => {
    const q = query.trim();

    if (q.length < 2) {
      requestIdRef.current += 1;
      setResults([]);
      setError('');
      setEmptyMessage('');
      setLoading(false);
      return;
    }

    if (cacheRef.current.has(q)) {
      const cached = cacheRef.current.get(q);
      setResults(cached);
      setError('');
      setEmptyMessage(cached?.length ? '' : 'No products found. Try another term.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setEmptyMessage('');

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
        setError('');
        setEmptyMessage(r.length ? '' : 'No products found. Try another term.');
      } catch (err) {
        if (id !== requestIdRef.current) return;
        setResults([]);
        setEmptyMessage('');
        setError(err.message || 'Search failed');
      } finally {
        if (id === requestIdRef.current) setLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      requestIdRef.current += 1;
    };
  }, [query, debounceMs]);

  const runSearchNow = async () => {
    const q = query.trim();
    if (q.length < 2) return;
    const id = ++requestIdRef.current;
    setLoading(true);
    setError('');
    setEmptyMessage('');
    try {
      const { results: r } = await api.searchProducts(q);
      if (id !== requestIdRef.current) return;
      cacheRef.current.set(q, r);
      setResults(r);
      setError('');
      setEmptyMessage(r.length ? '' : 'No products found. Try another term.');
    } catch (err) {
      if (id !== requestIdRef.current) return;
      if (isAbortError(err)) return;
      setError(err.message || 'Search failed');
      setEmptyMessage('');
      setResults([]);
    } finally {
      if (id === requestIdRef.current) setLoading(false);
    }
  };

  return { query, setQuery, results, loading, error, emptyMessage, runSearchNow };
}
