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
=======
# 🏛️ Know Your Leader | Tamil Nadu 2026 Elections Dashboard

![Know Your Leader Preview](/public/images/og-image.png)

**Know Your Leader** is a 100% free, open-source civic technology platform designed to empower the voters of Tamil Nadu for the 2026 State Assembly Elections. 

Moving away from personality-driven state politics, this dashboard shifts the focus back to **local representation**. It allows citizens to search their district, find their specific constituency, and compare MLA candidates side-by-side using objective, factual data.

🌍 **Live Demo:** https://know-your-leader.pages.dev/

---

## ✨ Key Features

* **Objective Comparison:** Compare candidates based on hard facts—declared assets, pending criminal cases, educational background, and local issues addressed—not subjective opinions.
* **Bilingual First:** Seamlessly built for both Tamil (தமிழ்) and English audiences.
* **Apple-Inspired UI:** Features a minimalist, "Liquid Glass" design system to ensure high legibility, mobile responsiveness, and a premium, high-trust user experience.
* **Truth-Meter Validation:** Clearly distinguishes between "News-Sourced" candidates (early phase) and "Official Candidates" (verified via ECI Form 7A).
* **Zero-Cost Architecture:** Engineered to handle massive election-day traffic spikes with $0 in server costs using a completely static data pipeline.

---

## 🛠️ Tech Stack & Architecture

This project strictly avoids expensive real-time databases to prevent traffic-spike billing (The $0 Architecture). 

* **Frontend:** Next.js (App Router), React 19
* **Styling:** Tailwind CSS (Custom Neo-Minimalist / Apple-inspired components)
* **Data Layer:** Static Site Generation (SSG) via local JSON files (`districts.json`, `candidates.json`)
* **Hosting:** Vercel / Cloudflare Pages 
* **SEO:** Fully automated dynamic metadata, JSON-LD structured data, and static sitemap generation for all 234 constituencies.

### The Automated Data Pipeline (Coming Soon)
Candidate data is dynamically aggregated using a Python-based GitHub Actions workflow. It scrapes trusted political news RSS feeds, processes the unstructured text using **OpenRouter AI (Llama 3.3 70B)**, and automatically updates the static JSON files, triggering a new build.

---

## 🚀 Local Development Setup

To run this project locally on your machine:

**1. Clone the repository**
```bash
git clone [https://github.com/villan-spec/KnowyourLEADER.git](https://github.com/villan-spec/KnowyourLEADER.git)
cd KnowyourLEADER
