export function PatternPanel({ patterns }) {
  const typeColor = t => t === 'bullish' ? '#22c55e' : t === 'bearish' ? '#ef4444' : '#f59e0b';

  return (
    <div className="panel">
      <p className="panel-label">Candlestick patterns</p>
      {patterns.length === 0 ? (
        <p className="empty-msg">No clear patterns detected</p>
      ) : (
        patterns.map((p, i) => (
          <div key={i} className="pattern-row">
            <span className="pattern-name">{p.name}</span>
            <span className="chip" style={{ background: `${typeColor(p.type)}20`, color: typeColor(p.type) }}>
              {p.type}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

export function IndicatorPanel({ indicators, candles, pairConfig }) {
  const n = candles.length - 1;
  const close = candles[n]?.close;
  const rsiVal  = indicators.rsi[n];
  const macdH   = indicators.macd.hist[n];
  const sma20   = indicators.sma20[n];
  const sma50   = indicators.sma50[n];
  const bbn     = indicators.bb[n];
  const dec     = pairConfig.decimals;

  const rsiStatus  = rsiVal == null ? null : rsiVal < 30 ? ['Oversold','#22c55e'] : rsiVal > 70 ? ['Overbought','#ef4444'] : ['Neutral','var(--text-muted)'];
  const macdStatus = macdH == null  ? null : macdH > 0 ? ['Bullish','#22c55e'] : ['Bearish','#ef4444'];
  const bbWidth    = bbn?.upper && bbn?.mid ? ((bbn.upper - bbn.lower) / bbn.mid * 100).toFixed(2) + '%' : '—';
  const pricevsSma = sma20 ? close > sma20 ? ['Above SMA20','#22c55e'] : ['Below SMA20','#ef4444'] : null;

  const rows = [
    { label: 'RSI(14)',     value: rsiVal?.toFixed(1)  ?? '—', badge: rsiStatus  },
    { label: 'MACD hist',  value: macdH?.toFixed(5)   ?? '—', badge: macdStatus },
    { label: 'SMA(20)',    value: sma20?.toFixed(dec)  ?? '—', badge: pricevsSma },
    { label: 'SMA(50)',    value: sma50?.toFixed(dec)  ?? '—', badge: null       },
    { label: 'BB Width%',  value: bbWidth,                     badge: null       },
  ];

  return (
    <div className="panel">
      <p className="panel-label">Indicators</p>
      {rows.map(({ label, value, badge }) => (
        <div key={label} className="indicator-row">
          <span className="indicator-label">{label}</span>
          <div className="indicator-right">
            <span className="indicator-value">{value}</span>
            {badge && <span className="indicator-badge" style={{ color: badge[1] }}>{badge[0]}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
