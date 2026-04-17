/**
 * Demo Data Generator
 * Simulates realistic OHLCV candles for each forex pair.
 * Replace this with a real data feed (e.g. Alpha Vantage, Twelve Data) for production.
 */

export const PAIRS = {
  'EUR/USD': { base: 1.0852, volatility: 0.0006, decimals: 5 },
  'GBP/USD': { base: 1.2648, volatility: 0.0009, decimals: 5 },
  'USD/JPY': { base: 149.52, volatility: 0.09,   decimals: 2 },
  'USD/CHF': { base: 0.9048, volatility: 0.0006, decimals: 5 },
  'AUD/USD': { base: 0.6552, volatility: 0.0007, decimals: 5 },
  'USD/CAD': { base: 1.3652, volatility: 0.0006, decimals: 5 },
};

/**
 * Generate an array of OHLCV candles for a given pair.
 * @param {string} pair   e.g. 'EUR/USD'
 * @param {number} count  number of candles (default 120)
 */
export function generateCandles(pair, count = 120) {
  const cfg = PAIRS[pair];
  if (!cfg) throw new Error(`Unknown pair: ${pair}`);

  let price = cfg.base * (1 + (Math.random() - 0.5) * 0.005);
  let trend = (Math.random() - 0.5) * 0.4;   // slight random trend
  const now = Date.now();
  const HOUR = 3_600_000;

  return Array.from({ length: count }, (_, rev) => {
    const i = count - 1 - rev;   // oldest first

    // Occasionally flip trend direction
    if (Math.random() < 0.04) trend = (Math.random() - 0.5) * 0.4;

    const drift = (Math.random() - 0.5 + trend * 0.08) * cfg.volatility;
    const open = price;
    price = price * (1 + drift);

    const wickMultiplier = cfg.volatility * 0.25;
    const high = Math.max(open, price) * (1 + Math.random() * wickMultiplier);
    const low  = Math.min(open, price) * (1 - Math.random() * wickMultiplier);

    return {
      time:   new Date(now - i * HOUR),
      open:   parseFloat(open.toFixed(cfg.decimals)),
      high:   parseFloat(high.toFixed(cfg.decimals)),
      low:    parseFloat(low.toFixed(cfg.decimals)),
      close:  parseFloat(price.toFixed(cfg.decimals)),
      volume: Math.floor(Math.random() * 8000 + 2000),
    };
  });
}

/**
 * Produce a single new candle by ticking from the last candle.
 * Used for live simulation (setInterval).
 */
export function tickCandle(lastCandle, pair) {
  const cfg = PAIRS[pair];
  const drift = (Math.random() - 0.5) * cfg.volatility;
  const close = parseFloat((lastCandle.close * (1 + drift)).toFixed(cfg.decimals));
  const wickMult = cfg.volatility * 0.25;
  const high = parseFloat((Math.max(lastCandle.close, close) * (1 + Math.random() * wickMult)).toFixed(cfg.decimals));
  const low  = parseFloat((Math.min(lastCandle.close, close) * (1 - Math.random() * wickMult)).toFixed(cfg.decimals));

  return {
    time:   new Date(),
    open:   lastCandle.close,
    high,
    low,
    close,
    volume: Math.floor(Math.random() * 6000 + 1500),
  };
}
