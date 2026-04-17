import { useState } from 'react';

const W = 720, H = 280, PL = 6, PR = 58, PT = 8, PB = 22;
const CW = W - PL - PR, CH = H - PT - PB;

export default function CandleChart({ candles, indicators }) {
  const [hover, setHover] = useState(null);

  const vis = candles.slice(-80);
  const n = vis.length;
  const idxOffset = candles.length - n;

  const prices = vis.flatMap(c => [c.high, c.low]);
  const rawMin = Math.min(...prices), rawMax = Math.max(...prices);
  const range = rawMax - rawMin || 0.001;
  const pad = range * 0.06;
  const pMin = rawMin - pad, pMax = rawMax + pad;

  const xs = i => PL + (i / (n - 1)) * CW;
  const ys = p => PT + (1 - (p - pMin) / (pMax - pMin)) * CH;
  const bw = Math.max(2, Math.floor(CW / n) - 1);

  const gridLevels = [0, 0.25, 0.5, 0.75, 1].map(f => pMin + (pMax - pMin) * f);

  // Line helpers
  const toPath = pts =>
    pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');

  const sma20pts = vis.map((_, i) => { const v = indicators.sma20[i + idxOffset]; return v ? [xs(i), ys(v)] : null; }).filter(Boolean);
  const ema20pts = vis.map((_, i) => { const v = indicators.ema20[i + idxOffset]; return v ? [xs(i), ys(v)] : null; }).filter(Boolean);
  const bbpts    = vis.map((_, i) => { const b = indicators.bb[i + idxOffset]; return b?.upper ? { x: xs(i), u: ys(b.upper), m: ys(b.mid), l: ys(b.lower) } : null; }).filter(Boolean);

  const bbArea = bbpts.length > 1
    ? bbpts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.u.toFixed(1)}`).join('')
    + bbpts.slice().reverse().map(p => `L${p.x.toFixed(1)},${p.l.toFixed(1)}`).join('') + 'Z'
    : '';
  const bbUpperPath = bbpts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.u.toFixed(1)}`).join('');
  const bbLowerPath = bbpts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.l.toFixed(1)}`).join('');

  const handleMouseMove = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const idx = Math.round(((mx - PL) / CW) * (n - 1));
    if (idx >= 0 && idx < n) setHover({ idx, x: xs(idx), c: vis[idx] });
    else setHover(null);
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHover(null)}
    >
      {/* Grid */}
      {gridLevels.map((p, i) => (
        <g key={i}>
          <line x1={PL} y1={ys(p)} x2={PL + CW} y2={ys(p)} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="4,4" />
          <text x={PL + CW + 4} y={ys(p) + 4} fontSize={9} fill="var(--text-muted)">
            {p.toFixed(p > 10 ? 2 : 5)}
          </text>
        </g>
      ))}

      {/* Bollinger Band area */}
      {bbArea && <path d={bbArea} fill="#378add" fillOpacity={0.05} />}
      {bbUpperPath && <path d={bbUpperPath} fill="none" stroke="#378add" strokeWidth={0.8} strokeOpacity={0.5} />}
      {bbLowerPath && <path d={bbLowerPath} fill="none" stroke="#378add" strokeWidth={0.8} strokeOpacity={0.5} />}

      {/* SMA & EMA */}
      {sma20pts.length > 1 && <path d={toPath(sma20pts)} fill="none" stroke="#f59e0b" strokeWidth={1.2} />}
      {ema20pts.length > 1 && <path d={toPath(ema20pts)} fill="none" stroke="#8b5cf6" strokeWidth={1.2} />}

      {/* Candles */}
      {vis.map((c, i) => {
        const x = xs(i), isUp = c.close >= c.open;
        const color = isUp ? '#22c55e' : '#ef4444';
        const bodyY = ys(Math.max(c.open, c.close));
        const bodyH = Math.max(1, Math.abs(ys(c.open) - ys(c.close)));
        return (
          <g key={i}>
            <line x1={x} y1={ys(c.high)} x2={x} y2={ys(c.low)} stroke={color} strokeWidth={1} />
            <rect x={x - bw / 2} y={bodyY} width={bw} height={bodyH} fill={color} fillOpacity={hover?.idx === i ? 1 : 0.85} />
          </g>
        );
      })}

      {/* Crosshair + tooltip */}
      {hover && (
        <g>
          <line x1={hover.x} y1={PT} x2={hover.x} y2={PT + CH} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,3" />
          <rect x={Math.min(hover.x + 6, W - 92)} y={PT + 4} width={86} height={74} rx={4} fill="var(--bg-card)" stroke="var(--border-strong)" strokeWidth={0.5} />
          {['O', 'H', 'L', 'C'].map((lbl, li) => {
            const keys = ['open', 'high', 'low', 'close'];
            const colors = ['var(--text-muted)', '#22c55e', '#ef4444', 'var(--text-primary)'];
            return (
              <text key={lbl} x={Math.min(hover.x + 12, W - 86)} y={PT + 18 + li * 13} fontSize={10} fill={colors[li]}>
                {lbl} {hover.c[keys[li]]}
              </text>
            );
          })}
          <text x={Math.min(hover.x + 12, W - 86)} y={PT + 72} fontSize={9} fill="var(--text-muted)">
            {hover.c.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </text>
        </g>
      )}

      {/* X-axis time labels */}
      {[0, Math.floor(n * 0.25), Math.floor(n * 0.5), Math.floor(n * 0.75), n - 1].map(i => (
        <text key={i} x={xs(i)} y={H - 4} fontSize={9} textAnchor="middle" fill="var(--text-muted)">
          {vis[i]?.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </text>
      ))}
    </svg>
  );
}
