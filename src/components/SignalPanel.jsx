export default function SignalPanel({ signal }) {
  const color = signal.action === 'BUY' ? '#22c55e' : signal.action === 'SELL' ? '#ef4444' : '#f59e0b';

  return (
    <div className="panel">
      <p className="panel-label">Signal engine</p>

      <div className="signal-header">
        <span className="signal-action" style={{ color }}>{signal.action}</span>
        <div className="signal-bar-wrap">
          <div className="signal-bar-track">
            <div className="signal-bar-fill" style={{ width: `${signal.confidence}%`, background: color }} />
          </div>
          <p className="signal-confidence">{signal.confidence}% confidence</p>
        </div>
      </div>

      <div className="signal-scores">
        {[['bull', '#22c55e'], ['bear', '#ef4444']].map(([side, c]) => (
          <div key={side} className="score-card" style={{ background: `${c}18` }}>
            <span className="score-value" style={{ color: c }}>{signal[side]}</span>
            <span className="score-label" style={{ color: c }}>{side === 'bull' ? 'Bull' : 'Bear'}</span>
          </div>
        ))}
      </div>

      <div className="reasons">
        {signal.reasons.map((r, i) => (
          <div key={i} className="reason-row">
            <span className="reason-dot" style={{ background: r.side === 'bull' ? '#22c55e' : '#ef4444' }} />
            <span className="reason-text">{r.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
