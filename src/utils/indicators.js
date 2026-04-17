/**
 * Technical Indicators
 * Pure functions — no side effects, fully testable.
 */

/** Simple Moving Average */
export function sma(data, period) {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

/** Exponential Moving Average */
export function ema(data, period) {
  const k = 2 / (period + 1);
  return data.reduce((acc, val, i) => {
    if (i < period - 1) return [...acc, null];
    if (i === period - 1) {
      const seed = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
      return [...acc, seed];
    }
    const prev = acc[i - 1];
    return [...acc, val * k + prev * (1 - k)];
  }, []);
}

/** Relative Strength Index */
export function rsi(data, period = 14) {
  const out = new Array(data.length).fill(null);
  if (data.length < period + 1) return out;

  const changes = data.map((v, i) => (i === 0 ? 0 : v - data[i - 1]));
  let avgGain = 0, avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    if (changes[i] > 0) avgGain += changes[i];
    else avgLoss -= changes[i];
  }
  avgGain /= period;
  avgLoss /= period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < data.length; i++) {
    const gain = changes[i] > 0 ? changes[i] : 0;
    const loss = changes[i] < 0 ? -changes[i] : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

/** MACD — returns { line, signal, hist } arrays */
export function macd(data, fast = 12, slow = 26, signalPeriod = 9) {
  const emaFast = ema(data, fast);
  const emaSlow = ema(data, slow);
  const line = data.map((_, i) =>
    emaFast[i] != null && emaSlow[i] != null ? emaFast[i] - emaSlow[i] : null
  );

  // compute EMA of the MACD line (only on non-null values)
  const validIndices = line.map((v, i) => (v != null ? i : -1)).filter(i => i >= 0);
  const validValues = validIndices.map(i => line[i]);
  const sigEma = ema(validValues, signalPeriod);

  const signal = new Array(data.length).fill(null);
  validIndices.forEach((origIdx, j) => {
    if (sigEma[j] != null) signal[origIdx] = sigEma[j];
  });

  const hist = line.map((v, i) =>
    v != null && signal[i] != null ? v - signal[i] : null
  );

  return { line, signal, hist };
}

/** Bollinger Bands — returns array of { upper, mid, lower } */
export function bollingerBands(data, period = 20, multiplier = 2) {
  const midLine = sma(data, period);
  return data.map((_, i) => {
    if (midLine[i] == null) return { upper: null, mid: null, lower: null };
    const slice = data.slice(i - period + 1, i + 1);
    const mean = midLine[i];
    const std = Math.sqrt(slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period);
    return {
      upper: midLine[i] + multiplier * std,
      mid: midLine[i],
      lower: midLine[i] - multiplier * std,
    };
  });
}
