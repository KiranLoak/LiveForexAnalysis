export default function Header({ pair, pairs, lastCandle, priceChange, priceChangePct, pairConfig, onChangePair }) {
  const isUp = priceChange >= 0;

  return (
    <header className="header">
      <div className="header-brand">
        <div className="brand-icon">FX</div>
        <span className="brand-name">ForexBot</span>
        <span className="live-dot" title="Live simulation" />
      </div>

      <nav className="pair-nav">
        {pairs.map(p => (
          <button
            key={p}
            className={`pair-btn ${p === pair ? 'active' : ''}`}
            onClick={() => onChangePair(p)}
          >
            {p}
          </button>
        ))}
      </nav>

      <div className="price-display">
        <span className="price-value">{lastCandle?.close}</span>
        <span className={`price-change ${isUp ? 'up' : 'down'}`}>
          {isUp ? '+' : ''}{priceChange.toFixed(pairConfig.decimals)}
          {' '}({isUp ? '+' : ''}{priceChangePct.toFixed(2)}%)
        </span>
      </div>
    </header>
  );
}
