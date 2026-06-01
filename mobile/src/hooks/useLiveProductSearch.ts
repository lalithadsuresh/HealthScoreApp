import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import type { SearchResult } from '../types/api';

const CACHE_MAX = 40;
const MIN_QUERY_LEN = 2;

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

    if (q.length < MIN_QUERY_LEN) {
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
      setEmptyMessage(cached.length ? '' : 'No results found');
      setLoading(false);
      return;
    }

    const abort = new AbortController();
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    debounceTimer = setTimeout(() => {
      const id = ++requestIdRef.current;
      setLoading(true);
      setError('');
      setEmptyMessage('');

      void (async () => {
        try {
          const { results: r } = await api.searchProducts(q, abort.signal);
          if (abort.signal.aborted || id !== requestIdRef.current) return;

          cacheRef.current.set(q, r);
          if (cacheRef.current.size > CACHE_MAX) {
            const first = cacheRef.current.keys().next().value;
            if (first) cacheRef.current.delete(first);
          }

          setResults(r);
          setError('');
          setEmptyMessage(r.length ? '' : 'No results found');
        } catch (e) {
          if (abort.signal.aborted || id !== requestIdRef.current) return;
          setResults([]);
          setEmptyMessage('');
          setError(e instanceof Error ? e.message : 'Search failed');
        } finally {
          if (!abort.signal.aborted && id === requestIdRef.current) {
            setLoading(false);
          }
        }
      })();
    }, debounceMs);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      abort.abort();
      requestIdRef.current += 1;
    };
  }, [query, debounceMs]);

  return { query, setQuery, results, loading, error, emptyMessage };
}
