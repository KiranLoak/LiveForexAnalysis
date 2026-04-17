/**
 * Candlestick Pattern Recognition
 * Scans the last 25 candles and returns up to 5 unique detected patterns.
 */

/**
 * @param {Array<{open,high,low,close}>} candles
 * @returns {Array<{name:string, type:'bullish'|'bearish'|'neutral', index:number}>}
 */
export function detectPatterns(candles) {
  const n = candles.length;
  const found = [];

  for (let i = Math.max(2, n - 25); i < n; i++) {
    const c = candles[i];
    const prev = candles[i - 1];
    const prev2 = candles[i - 2];

    const body = Math.abs(c.close - c.open);
    const range = c.high - c.low || 0.0001;
    const upperWick = c.high - Math.max(c.open, c.close);
    const lowerWick = Math.min(c.open, c.close) - c.low;
    const isBullish = c.close > c.open;
    const isBearish = c.close < c.open;

    // Doji — tiny body relative to range
    if (body / range < 0.08) {
      found.push({ index: i, name: 'Doji', type: 'neutral' });
    }

    // Hammer — long lower wick, small upper wick, bullish
    if (lowerWick > body * 2 && upperWick < body * 0.4 && isBullish) {
      found.push({ index: i, name: 'Hammer', type: 'bullish' });
    }

    // Inverted Hammer — long upper wick, small lower wick, bullish
    if (upperWick > body * 2 && lowerWick < body * 0.4 && isBullish) {
      found.push({ index: i, name: 'Inverted Hammer', type: 'bullish' });
    }

    // Shooting Star — long upper wick, small lower wick, bearish
    if (upperWick > body * 2 && lowerWick < body * 0.4 && isBearish) {
      found.push({ index: i, name: 'Shooting Star', type: 'bearish' });
    }

    // Hanging Man — like hammer but bearish context
    if (lowerWick > body * 2 && upperWick < body * 0.4 && isBearish) {
      found.push({ index: i, name: 'Hanging Man', type: 'bearish' });
    }

    // Bullish Engulfing
    if (
      prev.close < prev.open &&     // previous was bearish
      isBullish &&                   // current is bullish
      c.open < prev.close &&         // opens below prev close
      c.close > prev.open            // closes above prev open
    ) {
      found.push({ index: i, name: 'Bullish Engulfing', type: 'bullish' });
    }

    // Bearish Engulfing
    if (
      prev.close > prev.open &&
      isBearish &&
      c.open > prev.close &&
      c.close < prev.open
    ) {
      found.push({ index: i, name: 'Bearish Engulfing', type: 'bearish' });
    }

    // Morning Star (3-candle pattern)
    if (prev2) {
      const prevBody = Math.abs(prev.close - prev.open);
      const prevRange = prev.high - prev.low || 0.0001;
      const midpoint2 = (prev2.open + prev2.close) / 2;

      if (
        prev2.close < prev2.open &&        // first candle bearish
        prevBody / prevRange < 0.3 &&      // middle candle small body (indecision)
        isBullish &&                        // third candle bullish
        c.close > midpoint2                 // closes above midpoint of first
      ) {
        found.push({ index: i, name: 'Morning Star', type: 'bullish' });
      }

      // Evening Star
      if (
        prev2.close > prev2.open &&
        prevBody / prevRange < 0.3 &&
        isBearish &&
        c.close < midpoint2
      ) {
        found.push({ index: i, name: 'Evening Star', type: 'bearish' });
      }
    }
  }

  // Deduplicate by name, return 5 most recent
  const seen = new Set();
  return found
    .reverse()
    .filter(p => !seen.has(p.name) && seen.add(p.name))
    .slice(0, 5);
}
