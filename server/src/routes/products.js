import { Router } from 'express';
import { authRequired, loadUser } from '../middleware/auth.js';
import { fetchProductByBarcode, searchProducts, findAlternatives } from '../services/openFoodFacts.js';
import { scoreProduct } from '../services/scoring.js';

const router = Router();

router.get('/search', authRequired, loadUser, async (req, res) => {
  try {
    const q = String(req.query.q ?? '').trim();
    if (q.length < 2) return res.status(400).json({ error: 'Query too short' });
    const results = await searchProducts(q);
    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Product search failed' });
  }
});

router.get('/barcode/:code', authRequired, loadUser, async (req, res) => {
  try {
    const product = await fetchProductByBarcode(req.params.code);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const score = scoreProduct(product, req.user);
    let alternatives = [];
    try {
      alternatives = await findAlternatives(product);
      alternatives = alternatives.map((alt) => ({
        ...alt,
        previewScore: scoreProduct(
          { ...alt, nutriments: alt.nutriments, additivesCount: 0 },
          req.user
        ).overallScore,
      }));
    } catch {
      alternatives = [];
    }

    res.json({ product, score, alternatives });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message || 'Lookup failed' });
  }
});

export default router;
