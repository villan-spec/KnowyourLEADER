# 🗳️ Know Your Leader — Tamil Nadu 2026

> **Compare MLA candidates** across all 234 constituencies. View verified assets, criminal records, education, and local issues before you vote.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 📊 **Side-by-side comparison** of candidates with normalized metric rings
- 🔍 **38 districts**, **234 constituencies** — every seat covered
- 🏛️ **ECI-verified data** from MyNeta.info (assets, criminal cases, education, age)
- 📰 **Daily candidate discovery** from news feeds using AI extraction
- 🌐 **SEO optimized** with JSON-LD structured data, sitemaps, and OG tags
- 📱 **Mobile responsive** — works on all screen sizes
- 🔄 **Automated pipeline** — scrapes, deduplicates, and merges candidate data

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📦 Data Pipeline

The data pipeline discovers candidates and populates profile data:

```bash
# Full pipeline (MyNeta + News + AI extraction)
python scripts/update_data.py

# MyNeta only (no news scraping)
python scripts/update_data.py --skip-news

# Fastest (skip profile fetching too)
python scripts/update_data.py --skip-news --skip-profiles
```

### Data Sources

| Source | Data | Frequency |
|--------|------|-----------|
| [MyNeta.info](https://myneta.info) | Assets, criminal cases, education, age | On demand |
| RSS News Feeds | Candidate announcements | Daily |
| OpenRouter LLM | Smart extraction from news articles | As needed |

### Environment Variables

```bash
# Optional — enables AI news extraction (free tier available)
OPENROUTER_API_KEY=your_key_here
```

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, CSS
- **Data**: Static JSON files (no database needed)
- **Scraping**: Python (BeautifulSoup, Requests)
- **AI**: OpenRouter (Llama 3.3) for news extraction
- **Deployment**: Vercel / any static hosting

## 📁 Project Structure

```
Know Your Leader/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── constituency/[slug] # Constituency comparison pages
│   │   └── district/[slug]     # District hub pages
│   ├── components/             # UI components
│   │   ├── CandidateCard.tsx   # Candidate profile card
│   │   ├── ComparisonView.tsx  # Side-by-side comparison
│   │   ├── MetricRing.tsx      # Circular metric visualization
│   │   └── ...
│   └── lib/
│       └── data.ts             # Data loading & types
├── data/
│   ├── candidates.json         # All candidate data
│   └── districts.json          # Districts & constituencies
├── scripts/
│   └── update_data.py          # Data pipeline
└── public/
    └── images/                 # OG images, assets
```

## 📄 License

MIT — free to use, modify, and distribute.

---

**Made with ❤️ for Tamil Nadu voters**
