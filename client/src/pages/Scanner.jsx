import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../api/client.js';
import AppLayout from '../components/AppLayout.jsx';
import { useLiveProductSearch } from '../hooks/useLiveProductSearch.js';

export default function Scanner() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('scan');
  const [barcode, setBarcode] = useState('');
  const {
    query,
    setQuery,
    results,
    loading: searching,
    error: searchError,
  } = useLiveProductSearch(400);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const html5Ref = useRef(null);

  const goProduct = (code) => navigate(`/product/${code}`);

  const stopScanner = useCallback(async () => {
    if (html5Ref.current) {
      try {
        await html5Ref.current.stop();
        html5Ref.current.clear();
      } catch {
        /* ignore */
      }
      html5Ref.current = null;
    }
    setScanning(false);
  }, []);

  const startScanner = async () => {
    setError('');
    await stopScanner();
    try {
      const scanner = new Html5Qrcode('barcode-reader');
      html5Ref.current = scanner;
      setScanning(true);
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 120 } },
        (decoded) => {
          stopScanner();
          goProduct(decoded);
        },
        () => {}
      );
    } catch {
      setError('Camera access denied or unavailable. Enter barcode manually.');
      setScanning(false);
    }
  };

  useEffect(() => {
    if (tab === 'scan' && !scanning) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [tab]);


  return (
    <AppLayout>
      <h1 className="page-title">Scan & search</h1>
      <p className="page-sub">Find any product — your score follows your goals.</p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          type="button"
          className={`btn ${tab === 'scan' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, width: 'auto' }}
          onClick={() => setTab('scan')}
        >
          Scan
        </button>
        <button
          type="button"
          className={`btn ${tab === 'search' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, width: 'auto' }}
          onClick={() => {
            stopScanner();
            setTab('search');
          }}
        >
          Search
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {tab === 'scan' ? (
        <>
          <div id="barcode-reader" className="scanner-box" ref={scannerRef} />
          {scanning && (
            <button type="button" className="btn btn-secondary" onClick={stopScanner}>
              Stop camera
            </button>
          )}
          <div className="card">
            <label className="label">Or enter barcode</label>
            <input
              className="input"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="e.g. 3017620422003"
              inputMode="numeric"
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={!barcode.trim()}
              onClick={() => goProduct(barcode.replace(/\D/g, ''))}
            >
              Look up
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="card">
            <label className="label">Product name</label>
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. gatorade"
              autoComplete="off"
            />
            {query.trim().length < 2 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>
                Type at least 2 characters — results appear automatically.
              </p>
            )}
            {searching && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>
                Searching…
              </p>
            )}
            {searchError && (
              <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>
                {searchError}
              </div>
            )}
          </div>
          {!searching && query.trim().length >= 2 && !results.length && !searchError && (
            <p className="page-sub">No products found. Try a different name.</p>
          )}
          {results.map((p) => (
            <div
              key={p.barcode}
              className="product-row"
              role="button"
              tabIndex={0}
              onClick={() => goProduct(p.barcode)}
              onKeyDown={(e) => e.key === 'Enter' && goProduct(p.barcode)}
            >
              {p.imageUrl ? (
                <img src={p.imageUrl} alt="" />
              ) : (
                <div
                  style={{
                    width: 52,
                    height: 52,
                    background: '#f1f5f9',
                    borderRadius: 8,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  🍽️
                </div>
              )}
              <div>
                <strong style={{ fontSize: '0.95rem' }}>{p.name}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.brand}</div>
                {p.confidence && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {p.isUsSold ? 'U.S. · ' : ''}
                    {p.confidence} confidence
                  </div>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </AppLayout>
  );
}
