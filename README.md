# ForexBot — AI Forex Technical Analysis Dashboard

A real-time Forex trading signal dashboard built with **React + Vite** (frontend) and **Vercel Serverless Functions** (backend). The AI analysis is powered by the **Anthropic Claude API** and kept secure server-side.

---

## Features

- **Live candlestick chart** — OHLCV with wick rendering and OHLC hover tooltip
- **Overlay indicators** — SMA(20), EMA(20), Bollinger Bands(20,2)
- **Sub-charts** — Volume, RSI(14), MACD(12,26,9)
- **Signal engine** — Scores bull/bear strength from 5 independent signals
- **Pattern recognition** — Detects Doji, Hammer, Engulfing, Morning Star, Evening Star + more
- **AI deep analysis** — Entry, stop loss, take profit, R:R ratio via Claude AI
- **Live tick simulation** — Updates every 4 seconds (swap for real API in production)
- **Dark mode** — Automatic via `prefers-color-scheme`
- **Responsive** — Works on mobile and desktop

---

## Project Structure

```
forex-trading-bot/
├── api/
│   └── analyze.js          # Vercel serverless function (Anthropic proxy)
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── AIAnalysis.jsx  # AI result card + trigger button
│   │   ├── CandleChart.jsx # Main candlestick SVG chart
│   │   ├── Header.jsx      # Pair selector + live price
│   │   ├── Panels.jsx      # Pattern + Indicator panels
│   │   ├── SignalPanel.jsx # Bull/bear signal scoring UI
│   │   └── SubCharts.jsx   # Volume, RSI, MACD SVG charts
│   ├── hooks/
│   │   └── useForexBot.js  # Central state hook
│   ├── utils/
│   │   ├── dataGen.js      # Demo OHLCV generator + tick
│   │   ├── indicators.js   # SMA, EMA, RSI, MACD, BB
│   │   ├── patterns.js     # Candlestick pattern detection
│   │   └── signals.js      # Signal scoring engine
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── vercel.json
├── vite.config.js
├── package.json
└── .env.example
```

---

## Local Development Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/forex-trading-bot.git
cd forex-trading-bot
npm install
```

### 2. Set up your FREE API key

```bash
cp .env.example .env.local
```

Open `.env.local` and add your key:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

Get your **free** Gemini API key (no credit card needed): https://aistudio.google.com/app/apikey

Free tier limits: **1,500 requests/day**, 1 million tokens/day — more than enough for daily use.

### 3. Install Vercel CLI and run locally

The Vercel CLI is needed to run serverless functions locally:

```bash
npm install -g vercel
vercel login
vercel link        # links to your Vercel project (or creates one)
npm run dev        # runs both Vite + serverless functions on http://localhost:3000
```

> **Tip:** If you just want to run the frontend without the AI feature, use `npm run dev:vite` — this skips the serverless functions and runs Vite directly on port 5173.

---

## Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
vercel --prod
```

Then go to your Vercel dashboard → Project → Settings → Environment Variables and add:

```
ANTHROPIC_API_KEY = sk-ant-your-key-here
```

Re-deploy after adding the env var:
```bash
vercel --prod
```

### Option B — GitHub + Vercel (recommended for portfolio)

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit — ForexBot"
git remote add origin https://github.com/YOUR_USERNAME/forex-trading-bot.git
git push -u origin main
```

2. Go to https://vercel.com → **New Project** → Import your GitHub repo

3. Vercel auto-detects Vite — just click **Deploy**

4. After deploy, go to **Settings → Environment Variables** → add `ANTHROPIC_API_KEY`

5. Go to **Deployments** → click the three dots on latest → **Redeploy**

Your app is live at `https://forex-trading-bot.vercel.app` 🎉

---

## Connecting Real Forex Data (Optional Upgrade)

The app currently uses simulated price data. To use real prices, replace `src/utils/dataGen.js` with a real data source:

### Alpha Vantage (free tier — 25 req/day)

```js
const res = await fetch(
  `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=EUR&to_symbol=USD&interval=60min&apikey=YOUR_KEY`
);
const data = await res.json();
```

Free key: https://www.alphavantage.co/support/#api-key

### Twelve Data (free tier — 800 req/day)

```js
const res = await fetch(
  `https://api.twelvedata.com/time_series?symbol=EUR/USD&interval=1h&apikey=YOUR_KEY`
);
```

Free key: https://twelvedata.com/

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Free Gemini API key — get it at aistudio.google.com |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5 |
| Charts | Custom SVG (zero dependencies) |
| Backend | Vercel Serverless Functions |
| AI | Google Gemini 1.5 Flash (free tier) |
| Deploy | Vercel |

---

## License

MIT — free to use, modify, and include in your portfolio.
