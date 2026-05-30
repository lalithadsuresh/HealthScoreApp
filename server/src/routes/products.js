import { Router } from 'express';
import { authRequired, loadUser } from '../middleware/auth.js';
import {
  fetchProductByBarcode,
  searchProducts,
  findAlternatives,
} from '../services/openFoodFacts.js';
import {
  getCachedProductByBarcode,
  saveProductToCache,
  searchCachedProducts,
} from '../services/productCache.js';
import { scoreProduct } from '../services/scoring.js';
import { sortByUsEnglishPriority } from '../services/productConfidence.js';

const router = Router();

router.get('/search', authRequired, loadUser, async (req, res) => {
  try {
    const q = String(req.query.q ?? '').trim();
    if (q.length < 2) return res.status(400).json({ error: 'Query too short' });

    const limit = Math.min(parseInt(req.query.limit ?? '12', 10) || 12, 24);
    const cached = await searchCachedProducts(q, limit);

    let results = cached;
    if (results.length < limit) {
      const remote = await searchProducts(q, limit);
      const seen = new Set(results.map((p) => p.barcode));
      for (const p of remote) {
        if (!seen.has(p.barcode)) {
          results.push(p);
          seen.add(p.barcode);
          saveProductToCache(p).catch((err) => console.error('cache save', err));
        }
      }
      results = sortByUsEnglishPriority(results).slice(0, limit);
    }

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Product search failed' });
  }
});

router.get('/barcode/:code', authRequired, loadUser, async (req, res) => {
  try {
    const code = String(req.params.code).replace(/\D/g, '');
    if (!code) return res.status(400).json({ error: 'Invalid barcode' });

    let product = await getCachedProductByBarcode(code);
    let fromCache = Boolean(product);

    if (!product) {
      product = await fetchProductByBarcode(code);
      if (product) {
        await saveProductToCache(product);
      }
    }

    if (!product) return res.status(404).json({ error: 'Product not found' });

    const score = scoreProduct(product, req.user);
    let alternatives = [];

    if (score.confidentScore !== false) {
      try {
        alternatives = await findAlternatives(product);
        alternatives = alternatives.map((alt) => {
          const altScore = scoreProduct(
            {
              ...alt,
              nutriments: alt.nutriments,
              additivesCount: 0,
              confidence: alt.confidence ?? 'medium',
            },
            req.user
          );
          return {
            ...alt,
            previewScore: altScore.confidentScore === false ? null : altScore.overallScore,
          };
        });
      } catch {
        alternatives = [];
      }
    }

    res.json({ product, score, alternatives, fromCache });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message || 'Lookup failed' });
  }
});

export default router;
