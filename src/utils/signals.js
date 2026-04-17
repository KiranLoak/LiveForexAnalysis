/**
 * Signal Scoring Engine
 * Aggregates multiple indicators into a single BUY / SELL / HOLD decision
 * with a confidence percentage and the list of contributing reasons.
 */

/**
 * @param {Array} candles
 * @param {{ sma20, sma50, ema20, rsi, macd, bb }} indicators  — output of indicator utils
 * @returns {{ action, confidence, bull, bear, reasons }}
 */
export function computeSignal(candles, indicators) {
  const n = candles.length - 1;
  let bull = 0;
  let bear = 0;
  const reasons = [];

  // ── RSI ───────────────────────────────────────────────────────────────────
  const rsiVal = indicators.rsi[n];
  if (rsiVal != null) {
    if (rsiVal < 30) {
      bull += 2;
      reasons.push({ text: `RSI ${rsiVal.toFixed(0)} — oversold zone`, side: 'bull' });
    } else if (rsiVal > 70) {
      bear += 2;
      reasons.push({ text: `RSI ${rsiVal.toFixed(0)} — overbought zone`, side: 'bear' });
    } else if (rsiVal < 45) {
      bull += 0.5;
    } else if (rsiVal > 55) {
      bear += 0.5;
    }
  }

  // ── MACD crossover ────────────────────────────────────────────────────────
  const histNow = indicators.macd.hist[n];
  const histPrev = indicators.macd.hist[n - 1];
  if (histNow != null && histPrev != null) {
    if (histNow > 0 && histPrev <= 0) {
      bull += 2.5;
      reasons.push({ text: 'MACD bullish crossover', side: 'bull' });
    } else if (histNow < 0 && histPrev >= 0) {
      bear += 2.5;
      reasons.push({ text: 'MACD bearish crossover', side: 'bear' });
    } else if (histNow > 0) {
      bull += 1;
      reasons.push({ text: 'MACD positive momentum', side: 'bull' });
    } else {
      bear += 1;
      reasons.push({ text: 'MACD negative momentum', side: 'bear' });
    }
  }

  // ── Moving Average cross ──────────────────────────────────────────────────
  const sma20Now = indicators.sma20[n];
  const sma50Now = indicators.sma50[n];
  const sma20Prev = indicators.sma20[n - 1];
  const sma50Prev = indicators.sma50[n - 1];

  if (sma20Now && sma50Now && sma20Prev && sma50Prev) {
    if (sma20Now > sma50Now && sma20Prev <= sma50Prev) {
      bull += 3;
      reasons.push({ text: 'Golden cross detected (SMA20 > SMA50)', side: 'bull' });
    } else if (sma20Now < sma50Now && sma20Prev >= sma50Prev) {
      bear += 3;
      reasons.push({ text: 'Death cross detected (SMA20 < SMA50)', side: 'bear' });
    } else if (sma20Now > sma50Now) {
      bull += 0.8;
      reasons.push({ text: 'Price riding above moving averages', side: 'bull' });
    } else {
      bear += 0.8;
      reasons.push({ text: 'Price trading below moving averages', side: 'bear' });
    }
  }

  // ── Bollinger Bands ───────────────────────────────────────────────────────
  const bbNow = indicators.bb[n];
  if (bbNow?.lower && bbNow?.upper) {
    const close = candles[n].close;
    if (close < bbNow.lower) {
      bull += 1.5;
      reasons.push({ text: 'Price below lower Bollinger Band', side: 'bull' });
    } else if (close > bbNow.upper) {
      bear += 1.5;
      reasons.push({ text: 'Price above upper Bollinger Band', side: 'bear' });
    }
  }

  // ── Recent candle momentum ────────────────────────────────────────────────
  const recentBullCount = candles.slice(-5).filter(c => c.close > c.open).length;
  if (recentBullCount >= 4) {
    bull += 0.5;
    reasons.push({ text: `${recentBullCount}/5 recent candles are bullish`, side: 'bull' });
  } else if (recentBullCount <= 1) {
    bear += 0.5;
    reasons.push({ text: `Only ${recentBullCount}/5 recent candles are bullish`, side: 'bear' });
  }

  const total = bull + bear;
  const confidence = total > 0 ? Math.round((Math.max(bull, bear) / total) * 100) : 50;
  const action = bull > bear + 0.4 ? 'BUY' : bear > bull + 0.4 ? 'SELL' : 'HOLD';

  return {
    action,
    confidence,
    bull: parseFloat(bull.toFixed(1)),
    bear: parseFloat(bear.toFixed(1)),
    reasons: reasons.slice(0, 5),
  };
}
