# 🏛️ Know Your Leader | Tamil Nadu 2026 Elections Dashboard

![Know Your Leader Preview](/public/images/og-image.png)

**Know Your Leader** is a 100% free, open-source civic technology platform designed to empower the voters of Tamil Nadu for the 2026 State Assembly Elections. 

Moving away from personality-driven state politics, this dashboard shifts the focus back to **local representation**. It allows citizens to search their district, find their specific constituency, and compare MLA candidates side-by-side using objective, factual data.

🌍 **Live Demo:** [r-leader.vercel.app](https://r-leader.vercel.app)

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
