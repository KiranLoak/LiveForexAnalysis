export default function AIAnalysis({ aiResult, aiLoading, aiError, onRunAnalysis }) {
  const recColor = r => r === 'BUY' ? '#22c55e' : r === 'SELL' ? '#ef4444' : '#f59e0b';
  const riskColor = r => r === 'HIGH' ? '#ef4444' : r === 'LOW' ? '#22c55e' : '#f59e0b';

  return (
    <div>
      <button
        className="ai-btn"
        onClick={onRunAnalysis}
        disabled={aiLoading}
      >
        {aiLoading ? 'Analyzing with Claude AI…' : 'Run AI Deep Analysis ↗'}
      </button>

      {aiError && (
        <div className="ai-error">Error: {aiError}</div>
      )}

      {aiResult && !aiError && (
        <div className="ai-result" style={{ borderColor: `${recColor(aiResult.recommendation)}40` }}>
          {/* Header row */}
          <div className="ai-result-header">
            <span className="ai-rec" style={{ color: recColor(aiResult.recommendation) }}>
              {aiResult.recommendation}
            </span>
            <div className="ai-chips">
              <span className="chip" style={{ background: `${recColor(aiResult.recommendation)}20`, color: recColor(aiResult.recommendation) }}>
                {aiResult.confidence}% conf
              </span>
              <span className="chip" style={{ background: `${riskColor(aiResult.riskLevel)}20`, color: riskColor(aiResult.riskLevel) }}>
                {aiResult.riskLevel} risk
              </span>
            </div>
          </div>

          {/* Summary */}
          <p className="ai-summary">{aiResult.summary}</p>

          {/* Trade levels grid */}
          <div className="trade-grid">
            {[
              ['Entry',       aiResult.entry,       null],
              ['Stop Loss',   aiResult.stopLoss,    '#ef4444'],
              ['Take Profit', aiResult.takeProfit,  '#22c55e'],
              ['R:R Ratio',   aiResult.riskReward,  '#3b82f6'],
            ].map(([label, value, color]) => (
              <div key={label} className="trade-cell">
                <div className="trade-label">{label}</div>
                <div className="trade-value" style={{ color: color || 'var(--text-primary)' }}>
                  {value ?? '—'}
                </div>
              </div>
            ))}
          </div>

          {/* Key factors */}
          {aiResult.keyFactors?.length > 0 && (
            <div className="key-factors">
              {aiResult.keyFactors.map((f, i) => (
                <div key={i} className="factor-row">
                  <span className="factor-arrow">→</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          )}

          {/* Warning */}
          {aiResult.warning && (
            <div className="ai-warning">⚠ {aiResult.warning}</div>
          )}
        </div>
      )}
    </div>
  );
}
