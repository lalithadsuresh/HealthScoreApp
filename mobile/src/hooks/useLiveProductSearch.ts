import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import type { SearchResult } from '../types/api';

const CACHE_MAX = 40;

export function useLiveProductSearch(debounceMs = 400) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emptyMessage, setEmptyMessage] = useState('');
  const cacheRef = useRef(new Map<string, SearchResult[]>());
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

    const cached = cacheRef.current.get(q);
    if (cached) {
      setResults(cached);
      setError('');
      setEmptyMessage(cached.length ? '' : 'No products found. Try another term.');
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
          if (first) cacheRef.current.delete(first);
        }

        setResults(r);
        setError('');
        setEmptyMessage(r.length ? '' : 'No products found. Try another term.');
      } catch (e) {
        if (id !== requestIdRef.current) return;
        setResults([]);
        setEmptyMessage('');
        setError(e instanceof Error ? e.message : 'Search failed');
      } finally {
        if (id === requestIdRef.current) setLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      requestIdRef.current += 1;
    };
  }, [query, debounceMs]);

  return { query, setQuery, results, loading, error, emptyMessage };
}
