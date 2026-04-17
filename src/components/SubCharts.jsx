const W = 720, PL = 6, PR = 58;
const CW = W - PL - PR;

/* ── Volume ─────────────────────────────────────────────────────────────── */
export function VolumeChart({ candles }) {
  const H = 52;
  const vis = candles.slice(-80);
  const n = vis.length;
  const maxV = Math.max(...vis.map(c => c.volume));
  const bw = Math.max(1, Math.floor(CW / n) - 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <text x={PL + 2} y={12} fontSize={9} fill="var(--text-muted)">Volume</text>
      {vis.map((c, i) => {
        const x = PL + (i / (n - 1)) * CW;
        const bh = (c.volume / maxV) * (H - 6);
        return (
          <rect
            key={i} x={x - bw / 2} y={H - bh - 2} width={bw} height={bh}
            fill={c.close >= c.open ? '#22c55e' : '#ef4444'} fillOpacity={0.5}
          />
        );
      })}
    </svg>
  );
}

/* ── RSI ─────────────────────────────────────────────────────────────────── */
export function RSIChart({ candles, rsiData }) {
  const H = 72, PV = 4;
  const CH = H - PV * 2;
  const vis = candles.slice(-80);
  const n = vis.length;
  const rv = rsiData.slice(-n);
  const xs = i => PL + (i / (n - 1)) * CW;
  const ys = v => PV + (1 - v / 100) * CH;

  const pts = rv.map((v, i) => (v != null ? [xs(i), ys(v)] : null)).filter(Boolean);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
  const last = rsiData[rsiData.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* Overbought / oversold bands */}
      <rect x={PL} y={ys(70)} width={CW} height={ys(30) - ys(70)} fill="#f59e0b" fillOpacity={0.04} />
      <line x1={PL} y1={ys(70)} x2={PL + CW} y2={ys(70)} stroke="#ef4444" strokeWidth={0.5} strokeDasharray="4,3" strokeOpacity={0.7} />
      <line x1={PL} y1={ys(50)} x2={PL + CW} y2={ys(50)} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="2,4" />
      <line x1={PL} y1={ys(30)} x2={PL + CW} y2={ys(30)} stroke="#22c55e" strokeWidth={0.5} strokeDasharray="4,3" strokeOpacity={0.7} />

      {pts.length > 1 && <path d={path} fill="none" stroke="#8b5cf6" strokeWidth={1.5} />}

      <text x={PL + CW + 4} y={ys(70) + 3} fontSize={8} fill="#ef4444">70</text>
      <text x={PL + CW + 4} y={ys(30) + 3} fontSize={8} fill="#22c55e">30</text>
      {last != null && (
        <text x={PL + CW + 4} y={ys(last) + 3} fontSize={9} fill="#8b5cf6" fontWeight={500}>
          {last.toFixed(1)}
        </text>
      )}
      <text x={PL + 2} y={PV + 10} fontSize={9} fill="var(--text-muted)">RSI(14)</text>
    </svg>
  );
}

/* ── MACD ────────────────────────────────────────────────────────────────── */
export function MACDChart({ candles, macdData }) {
  const H = 72, PV = 4;
  const CH = H - PV * 2;
  const vis = candles.slice(-80);
  const n = vis.length;

  const hist   = macdData.hist.slice(-n);
  const line   = macdData.line.slice(-n);
  const signal = macdData.signal.slice(-n);

  const allVals = [...hist, ...line, ...signal].filter(v => v != null);
  const maxAbs = Math.max(...allVals.map(Math.abs), 0.0001);

  const xs = i => PL + (i / (n - 1)) * CW;
  const ys = v => PV + (1 - (v + maxAbs) / (2 * maxAbs)) * CH;
  const bw = Math.max(1, Math.floor(CW / n) - 1);
  const zeroY = ys(0);

  const linePath   = line.map((v, i) => v != null ? `${i === 0 || line[i - 1] == null ? 'M' : 'L'}${xs(i).toFixed(1)},${ys(v).toFixed(1)}` : null).filter(Boolean).join('');
  const signalPath = signal.map((v, i) => v != null ? `${i === 0 || signal[i - 1] == null ? 'M' : 'L'}${xs(i).toFixed(1)},${ys(v).toFixed(1)}` : null).filter(Boolean).join('');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <line x1={PL} y1={zeroY} x2={PL + CW} y2={zeroY} stroke="var(--border-strong)" strokeWidth={0.5} />

      {hist.map((v, i) => {
        if (v == null) return null;
        const x = xs(i);
        const y = ys(Math.max(0, v));
        const h = Math.max(1, Math.abs(ys(0) - ys(v)));
        return <rect key={i} x={x - bw / 2} y={y} width={bw} height={h} fill={v >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={0.65} />;
      })}

      {linePath   && <path d={linePath}   fill="none" stroke="#3b82f6" strokeWidth={1.2} />}
      {signalPath && <path d={signalPath} fill="none" stroke="#f59e0b" strokeWidth={1} strokeDasharray="3,2" />}

      <text x={PL + 2} y={PV + 10} fontSize={9} fill="var(--text-muted)">MACD(12,26,9)</text>
    </svg>
  );
}
