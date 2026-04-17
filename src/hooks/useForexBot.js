import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { sma, ema, rsi, macd, bollingerBands } from '../utils/indicators';
import { detectPatterns } from '../utils/patterns';
import { computeSignal } from '../utils/signals';
import { generateCandles, tickCandle, PAIRS } from '../utils/dataGen';

const TICK_INTERVAL_MS = 4000;

export function useForexBot() {
  const [pair, setPair] = useState('EUR/USD');
  const [candles, setCandles] = useState(() => generateCandles('EUR/USD'));
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const tickRef = useRef(null);

  // ── Indicators ──────────────────────────────────────────────────────────────
  const indicators = useMemo(() => {
    const closes = candles.map(c => c.close);
    return {
      sma20:  sma(closes, 20),
      sma50:  sma(closes, 50),
      ema20:  ema(closes, 20),
      rsi:    rsi(closes, 14),
      macd:   macd(closes),
      bb:     bollingerBands(closes, 20, 2),
    };
  }, [candles]);

  // ── Signal + Patterns ───────────────────────────────────────────────────────
  const signal   = useMemo(() => computeSignal(candles, indicators), [candles, indicators]);
  const patterns = useMemo(() => detectPatterns(candles), [candles]);

  // ── Live tick ────────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    setCandles(prev => {
      const next = tickCandle(prev[prev.length - 1], pair);
      return [...prev.slice(1), next];
    });
  }, [pair]);

  useEffect(() => {
    tickRef.current = setInterval(tick, TICK_INTERVAL_MS);
    return () => clearInterval(tickRef.current);
  }, [tick]);

  // ── Pair change ──────────────────────────────────────────────────────────────
  const changePair = useCallback((newPair) => {
    setPair(newPair);
    setCandles(generateCandles(newPair));
    setAiResult(null);
    setAiError(null);
  }, []);

  // ── AI Analysis ──────────────────────────────────────────────────────────────
  const runAIAnalysis = useCallback(async () => {
    setAiLoading(true);
    setAiResult(null);
    setAiError(null);

    const n = candles.length - 1;
    const cfg = PAIRS[pair];

    const payload = {
      pair,
      candles: candles.slice(-10),   // last 10 candles (keep payload small)
      signal,
      patterns,
      indicators: {
        rsi:      indicators.rsi[n],
        macdHist: indicators.macd.hist[n],
        macdLine: indicators.macd.line[n],
        bbUpper:  indicators.bb[n]?.upper?.toFixed(cfg.decimals),
        bbMid:    indicators.bb[n]?.mid?.toFixed(cfg.decimals),
        bbLower:  indicators.bb[n]?.lower?.toFixed(cfg.decimals),
        sma20:    indicators.sma20[n]?.toFixed(cfg.decimals),
        sma50:    indicators.sma50[n]?.toFixed(cfg.decimals),
      },
    };

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Server error');
      setAiResult(data);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  }, [candles, pair, signal, patterns, indicators]);

  const lastCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];
  const priceChange    = lastCandle && prevCandle ? lastCandle.close - prevCandle.close : 0;
  const priceChangePct = prevCandle ? (priceChange / prevCandle.close) * 100 : 0;

  return {
    pair,
    pairs: Object.keys(PAIRS),
    candles,
    indicators,
    signal,
    patterns,
    lastCandle,
    priceChange,
    priceChangePct,
    pairConfig: PAIRS[pair],
    aiResult,
    aiLoading,
    aiError,
    changePair,
    runAIAnalysis,
  };
}
