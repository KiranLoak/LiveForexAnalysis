import { useForexBot } from './hooks/useForexBot';
import Header from './components/Header';
import CandleChart from './components/CandleChart';
import { VolumeChart, RSIChart, MACDChart } from './components/SubCharts';
import SignalPanel from './components/SignalPanel';
import { PatternPanel, IndicatorPanel } from './components/Panels';
import AIAnalysis from './components/AIAnalysis';

const LEGEND = [
  { color: '#22c55e', label: 'Bullish candle' },
  { color: '#ef4444', label: 'Bearish candle' },
  { color: '#f59e0b', label: 'SMA(20)' },
  { color: '#8b5cf6', label: 'EMA(20)' },
  { color: '#378add', label: 'BB(20,2)' },
];

export default function App() {
  const bot = useForexBot();

  return (
    <div className="app">
      <Header
        pair={bot.pair}
        pairs={bot.pairs}
        lastCandle={bot.lastCandle}
        priceChange={bot.priceChange}
        priceChangePct={bot.priceChangePct}
        pairConfig={bot.pairConfig}
        onChangePair={bot.changePair}
      />

      <div className="body">
        {/* ── Chart pane ── */}
        <div className="chart-pane">
          <div className="legend">
            {LEGEND.map(({ color, label }) => (
              <span key={label} className="legend-item">
                <span className="legend-line" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>

          <CandleChart candles={bot.candles} indicators={bot.indicators} />

          <div className="sub-divider"><VolumeChart candles={bot.candles} /></div>
          <div className="sub-divider"><RSIChart  candles={bot.candles} rsiData={bot.indicators.rsi} /></div>
          <div className="sub-divider"><MACDChart candles={bot.candles} macdData={bot.indicators.macd} /></div>
        </div>

        {/* ── Side panel ── */}
        <aside className="side-panel">
          <SignalPanel signal={bot.signal} />
          <PatternPanel patterns={bot.patterns} />
          <IndicatorPanel
            indicators={bot.indicators}
            candles={bot.candles}
            pairConfig={bot.pairConfig}
          />
          <AIAnalysis
            aiResult={bot.aiResult}
            aiLoading={bot.aiLoading}
            aiError={bot.aiError}
            onRunAnalysis={bot.runAIAnalysis}
          />

          <p className="disclaimer">
            For educational purposes only. Not financial advice. Always use
            proper risk management.
          </p>
        </aside>
      </div>
    </div>
  );
}
